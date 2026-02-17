import { CompletionContext, CompletionResult, snippet, Completion } from "@codemirror/autocomplete";
import { syntaxTree } from "@codemirror/language";
import { EditorView, hoverTooltip } from "@codemirror/view";
import { linter, Diagnostic } from "@codemirror/lint";
import { SyntaxNode } from "@lezer/common";
import { TL_DEFINITIONS, TL_MODULES, SNIPPETS } from "../constants";

// --- 1. UTILITÁRIOS ---

const getRelativePath = (targetModule: string, currentFolder: string) => {
    const depth = currentFolder ? currentFolder.split('/').filter(Boolean).length : 0;
    const prefix = depth === 0 ? './' : '../'.repeat(depth);
    return prefix + targetModule;
};

const getNativeMembers = (typeName: string): Completion[] => {
    const def = TL_DEFINITIONS[typeName];
    if (!def) return [];

    let members: Completion[] = [];
    
    members = Object.entries(def.members).map(([label, info]) => ({
        label,
        type: info.type,
        detail: info.detail || info.returnType,
        info: info.info,
        boost: info.type === 'property' ? 2 : 1, 
        apply: info.insertText ? snippet(info.insertText) : undefined
    }));

    if (def.inherits) {
        members = [...members, ...getNativeMembers(def.inherits)];
    }

    return members;
};

// --- 2. SCANNER DE CONTEXTO ---
const scanContext = (state: any, pos: number) => {
    const tree = syntaxTree(state);
    let node = tree.resolveInner(pos, -1);
    
    let parentClass: string | null = null;
    let isInsideMethod = false; // NOVA FLAG
    const userMethods: Completion[] = [];
    const localVars: Completion[] = [];

    // Sobe a árvore
    let temp: SyntaxNode | null = node;
    while (temp) {
        // Detecta se estamos dentro de um método (Escopo Local)
        if (temp.name === 'MethodDefinition' || temp.name === 'FunctionDeclaration') {
            isInsideMethod = true;
        }

        // A. Variáveis
        if (temp.name === 'VariableDeclaration') {
            let inner = temp.node.cursor();
            if (inner.firstChild()) {
                do {
                    if (inner.name === 'VariableDefinition') {
                        const name = state.sliceDoc(inner.from, inner.to);
                        localVars.push({ label: name, type: 'variable', detail: 'Local', boost: 0 });
                    }
                } while (inner.nextSibling());
            }
        }

        // B. Classe
        if (temp.name === 'ClassDeclaration') {
            const ext = temp.getChild('ExtendsClause');
            if (ext) {
                const parentNode = ext.lastChild; 
                if (parentNode) {
                    parentClass = state.sliceDoc(parentNode.from, parentNode.to);
                }
            } else {
                // Fallback Regex
                const header = state.sliceDoc(temp.from, Math.min(temp.to, temp.from + 200));
                const match = header.match(/extends\s+([a-zA-Z0-9_]+)/);
                if (match) parentClass = match[1];
            }

            // Métodos do Usuário
            const body = temp.getChild('ClassBody');
            if (body) {
                let c = body.cursor();
                if (c.firstChild()) {
                    do {
                        if (c.name === 'MethodDefinition') {
                            const nameNode = c.node.getChild('PropertyDefinition') || c.node.getChild('PropertyName');
                            if (nameNode) {
                                const name = state.sliceDoc(nameNode.from, nameNode.to);
                                if (name !== 'constructor') {
                                    userMethods.push({ 
                                        label: name, type: 'method', detail: 'Local', 
                                        info: 'User Method', boost: 5 
                                    });
                                }
                            }
                        }
                    } while(c.nextSibling());
                }
            }
            break;
        }
        temp = temp.parent;
    }

    return { parentClass, userMethods, localVars, isInsideMethod };
};

// --- 3. ENGINE PRINCIPAL ---

export const createTlAutocomplete = (currentFolder: string) => {
    return (context: CompletionContext): CompletionResult | null => {
        const word = context.matchBefore(/[\w.]*/) || context.matchBefore(/import\s*\{\s*[\w\s,]*$/);
        const importContext = context.matchBefore(/import\s*\{\s*([\w\s,]*)$/);

        if ((!word || (word.from === word.to && !context.explicit)) && !importContext) return null;

        const state = context.state;
        const { parentClass, userMethods, localVars, isInsideMethod } = scanContext(state, context.pos);
        
        let options: Completion[] = [];
        let filterFrom = word ? word.from : context.pos;
        let validForRegex = /^\w*$/;

        // --- CENÁRIO X: DENTRO DE IMPORT { ... } ---
        if (importContext) {
            filterFrom = context.pos; 
            const lastWordMatch = importContext.text.match(/([\w]+)$/);
            if (lastWordMatch) {
                filterFrom = context.pos - lastWordMatch[1].length;
            }

            options = Object.keys(TL_MODULES).map(mod => ({
                label: mod,
                type: 'class',
                detail: `from '...'`,
                icon: false,
                apply: (view: EditorView, completion: any, from: number, to: number) => {
                    const label = completion.label;
                    const relPath = getRelativePath(TL_MODULES[label], currentFolder);
                    const line = view.state.doc.lineAt(from);
                    
                    if (line.text.includes("from")) {
                        view.dispatch({ changes: { from, to, insert: label } });
                    } else {
                        const hasCloseBrace = line.text.includes("}");
                        if (hasCloseBrace) {
                            const suffix = ` from '${relPath}';`;
                            view.dispatch({ changes: { from, to, insert: label } });
                            const newLine = view.state.doc.lineAt(from); 
                            view.dispatch({ changes: { from: newLine.to, insert: suffix } });
                        } else {
                            view.dispatch({ 
                                changes: { from, to, insert: `${label} } from '${relPath}';` } 
                            });
                        }
                    }
                }
            }));
            validForRegex = /^[\w\s,]*$/; 
        }

        // --- CENÁRIO A: DRILL-DOWN (Digitar ponto) ---
        else if (word && word.text.includes('.')) {
            filterFrom = word.from + word.text.lastIndexOf('.') + 1;
            const parts = word.text.split('.');
            const root = parts[0]; 
            
            if (root === 'this') {
                if (parts.length === 2 && parentClass) {
                    // Dentro de 'this.', SEMPRE mostramos tudo (nativos + usuário)
                    options = [...userMethods, ...getNativeMembers(parentClass)];
                } 
                else if (parts.length > 2 && parentClass) {
                    const propName = parts[1];
                    const members = getNativeMembers(parentClass);
                    const prop = members.find(m => m.label === propName);
                    if (prop && prop.detail && TL_DEFINITIONS[prop.detail]) {
                        options = getNativeMembers(prop.detail);
                    }
                }
            }
            else if (TL_DEFINITIONS[root]) {
                options = getNativeMembers(root);
            }
        } 
        
        // --- CENÁRIO B: GLOBAL (Sem Ponto) ---
        else {
            options.push(...localVars);

            if (parentClass) {
                // Sempre mostra 'this'
                options.push({ label: 'this', type: 'keyword', detail: parentClass, boost: 99 });

                // LÓGICA DE FILTRAGEM:
                // Se NÃO estiver dentro de um método (corpo da classe), sugere métodos para Sobrescrever
                if (!isInsideMethod) {
                    // Sugere métodos da classe pai (Override)
                    options.push(...getNativeMembers(parentClass));
                    
                    // Sugere métodos do usuário (para referência rápida ou JSDoc, opcional)
                    // options.push(...userMethods); 
                }
                // Se ESTIVER dentro de um método, NÃO sugere membros da classe diretamente.
                // O usuário é obrigado a usar 'this.'
            }

            Object.keys(TL_MODULES).forEach(mod => {
                options.push({
                    label: mod, type: 'class', detail: 'Auto-Import', boost: -5,
                    apply: (view: EditorView, completion: any, from: number, to: number) => {
                        view.dispatch({ changes: { from, to, insert: mod } });
                        const text = view.state.doc.toString();
                        if (!text.includes(`import { ${mod} }`)) {
                            const relPath = getRelativePath(TL_MODULES[mod], currentFolder);
                            const importLine = `import { ${mod} } from '${relPath}';\n`;
                            view.dispatch({ changes: { from: 0, insert: importLine } });
                        }
                    }
                });
            });

            options.push(...SNIPPETS.map(s => ({ label: s.label, type: s.type as any, detail: s.detail, apply: s.template })));
        }

        return {
            from: filterFrom,
            options: options.map(o => ({ ...o, addToOptions: [renderOption] })),
            validFor: validForRegex
        };
    };
};

// --- VISUAL ---
const renderOption = (completion: any) => {
    const el = document.createElement("div");
    el.className = "flex items-center gap-2 font-mono text-xs py-0.5";
    
    let color = "text-gray-400";
    let icon = "◈";

    switch(completion.type) {
        case 'method': color = 'text-purple-400'; icon = "ƒ"; break;
        case 'property': color = 'text-blue-400'; icon = "▤"; break;
        case 'class': color = 'text-emerald-400'; icon = "C"; break;
        case 'variable': color = 'text-sky-300'; icon = "x"; break;
        case 'keyword': color = 'text-pink-400'; icon = "🔑"; break;
    }
    
    el.innerHTML = `
        <span class="${color} font-bold w-4 text-center inline-block">${icon}</span>
        <span class="text-gray-200">${completion.label}</span>
        <span class="text-gray-500 ml-auto text-[10px] pl-4">${completion.detail || ''}</span>
    `;
    return el;
};

export const tlLinter = linter(() => []);
export const tlHover = hoverTooltip(() => null);