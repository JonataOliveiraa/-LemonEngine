import { CompletionContext, CompletionResult, snippet, Completion } from "@codemirror/autocomplete";
import { syntaxTree } from "@codemirror/language";
import { EditorView, hoverTooltip } from "@codemirror/view";
import { linter } from "@codemirror/lint";
import { SyntaxNode } from "@lezer/common";
import { TL_DEFINITIONS, TL_MODULES, SNIPPETS } from "../constants";
import { useEditorStore } from "../store"; // IMPORTANTE: Lendo do estado global!

// --- 1. UTILITÁRIOS ---

const getRelativePath = (targetModule: string, currentCategory: string, currentFolder: string = '') => {
    const folderClean = currentFolder.replace(/\\/g, '/').trim();
    let depth = folderClean ? folderClean.split('/').filter(Boolean).length : 0;
    
    // Se não for BLANK, ele cria uma subpasta própria da categoria (ex: Items/)
    if (currentCategory && String(currentCategory).toUpperCase() !== 'BLANK') {
        depth += 1;
    }

    const totalDepth = depth + 1;
    return '../'.repeat(totalDepth) + targetModule + '.js';
};

const getNativeMembers = (typeName: string): Completion[] => {
    const def = TL_DEFINITIONS[typeName];
    if (!def) return [];

    let members: Completion[] = [];
    members = Object.entries(def.members).map(([label, info]) => ({
        label,
        type: info.type as any,
        detail: info.detail || info.returnType,
        info: info.info,
        boost: info.type === 'property' ? 2 : 1, 
        apply: info.insertText ? snippet(info.insertText) : undefined
    }));

    if (def.inherits) members = [...members, ...getNativeMembers(def.inherits)];
    return members;
};

// --- 2. SCANNER DE CONTEXTO ---
const scanContext = (state: any, pos: number) => {
    const tree = syntaxTree(state);
    let node = tree.resolveInner(pos, -1);
    
    let parentClass: string | null = null;
    let isInsideMethod = false; 
    const userMethods: Completion[] = [];
    const localVars: Completion[] = [];

    let temp: SyntaxNode | null = node;
    while (temp) {
        if (temp.name === 'MethodDefinition' || temp.name === 'FunctionDeclaration') isInsideMethod = true;

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

        if (temp.name === 'ClassDeclaration') {
            const ext = temp.getChild('ExtendsClause');
            if (ext) {
                const parentNode = ext.lastChild; 
                if (parentNode) parentClass = state.sliceDoc(parentNode.from, parentNode.to);
            } else {
                const header = state.sliceDoc(temp.from, Math.min(temp.to, temp.from + 200));
                const match = header.match(/extends\s+([a-zA-Z0-9_]+)/);
                if (match) parentClass = match[1];
            }

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
                                    userMethods.push({ label: name, type: 'method', detail: 'Local', info: 'User Method', boost: 5 });
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
export const tlAutocomplete = (context: CompletionContext): CompletionResult | null => {
    
    // A MÁGICA ESTÁ AQUI: Pega os dados direto do Zustand na hora que o usuário digita!
    const store = useEditorStore.getState();
    const workspace = store.workspaces.find(w => w.id === store.activeWorkspaceId);
    const entity = workspace?.entities.find(e => e.id === store.activeEntityId);
    
    const currentCategory = entity?.category || 'BLANK';
    const currentFolder = entity?.folder || '';

    const line = context.state.doc.lineAt(context.pos);
    const lineText = line.text.slice(0, context.pos - line.from);
    const word = context.matchBefore(/[\w.]*/) || context.matchBefore(/import\s*\{\s*[\w\s,]*$/);
    const importMatch = lineText.match(/import\s*\{\s*(\w*)$/);

    if ((!word || (word.from === word.to && !context.explicit)) && !importMatch) return null;

    const state = context.state;
    const { parentClass, userMethods, localVars, isInsideMethod } = scanContext(state, context.pos);
    
    let options: Completion[] = [];
    let filterFrom = word ? word.from : context.pos;

    // IMPORTAÇÕES AUTOMÁTICAS INLINE
    if (importMatch) {
        const prefix = importMatch[1];
        return {
            from: context.pos - prefix.length,
            options: Object.keys(TL_MODULES).map(symbol => ({
                label: symbol,
                type: 'class' as any,
                detail: `from '${TL_MODULES[symbol]}'`,
                apply: (view: EditorView, completion: any, from: number, to: number) => {
                    const relPath = getRelativePath(TL_MODULES[symbol], currentCategory, currentFolder);
                    const insertText = `${symbol} } from '${relPath}';`;
                    view.dispatch({ changes: { from, to: line.to, insert: insertText } });
                }
            })),
            filter: true
        };
    }

    // --- CENÁRIO A: DRILL-DOWN (Digitar ponto) ---
    else if (word && word.text.includes('.')) {
        filterFrom = word.from + word.text.lastIndexOf('.') + 1;
        const parts = word.text.split('.');
        const root = parts[0]; 
        
        if (root === 'this') {
            if (parts.length === 2 && parentClass) {
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
            options.push({ label: 'this', type: 'keyword', detail: parentClass, boost: 99 });
            if (!isInsideMethod) options.push(...getNativeMembers(parentClass));
        }

        Object.keys(TL_MODULES).forEach(mod => {
            options.push({
                label: mod, type: 'class', detail: 'Auto-Import', boost: -5,
                apply: (view: EditorView, completion: any, from: number, to: number) => {
                    view.dispatch({ changes: { from, to, insert: mod } });
                    const text = view.state.doc.toString();
                    if (!text.includes(`import { ${mod} }`)) {
                        const relPath = getRelativePath(TL_MODULES[mod], currentCategory, currentFolder);
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
        options: options,
        validFor: /^\w*$/
    };
};

export const tlLinter = linter(() => []);
export const tlHover = hoverTooltip(() => null);