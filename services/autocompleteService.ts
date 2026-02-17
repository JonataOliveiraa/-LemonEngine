
import { CompletionContext, CompletionResult } from "@codemirror/autocomplete";
import { EditorView } from "@codemirror/view";
import { AUTOCOMPLETE_DATA, SNIPPETS, TL_MODULES } from "../constants";

const getRelativePath = (targetModule: string, currentFolder?: string) => {
    const depth = currentFolder ? currentFolder.split('/').filter(Boolean).length : 0;
    const totalDepth = depth + 2;
    return '../'.repeat(totalDepth) + targetModule;
};

export const tlAutocomplete = (context: CompletionContext): CompletionResult | null => {
  const line = context.state.doc.lineAt(context.pos);
  const lineText = line.text.slice(0, context.pos - line.from);
  const fullDocText = context.state.doc.toString();
  
  // Detecção de Contexto (Qual classe base está sendo usada?)
  const isNPC = fullDocText.includes("extends ModNPC");
  const isItem = fullDocText.includes("extends ModItem");
  const isProjectile = fullDocText.includes("extends ModProjectile");

  // 1. Sugestões para 'import { ... }'
  const importMatch = lineText.match(/import\s*\{\s*(\w*)$/);
  if (importMatch) {
      const prefix = importMatch[1];
      return {
          from: context.pos - prefix.length,
          options: Object.keys(TL_MODULES).map(symbol => ({
              label: symbol,
              type: 'class',
              detail: `from '${TL_MODULES[symbol]}'`,
              apply: (view: EditorView, completion: any, from: number, to: number) => {
                  const relPath = getRelativePath(TL_MODULES[symbol]);
                  const insertText = `${symbol} } from '${relPath}';`;
                  view.dispatch({
                      changes: { from, to: line.to, insert: insertText }
                  });
              }
          })),
          filter: true
      };
  }

  // 2. Detect Namespaces (e.g., Rand., Vector2., Effects.)
  const staticMatch = lineText.match(/(\w+)\.$/);
  if (staticMatch) {
    const className = staticMatch[1];
    const dataKey = className.toLowerCase();
    // @ts-ignore
    if (AUTOCOMPLETE_DATA[dataKey]) {
      return {
        from: context.pos,
        // @ts-ignore
        options: AUTOCOMPLETE_DATA[dataKey]
      };
    }
  }

  // 3. Member completion (this.) - Context Aware
  const thisPrefixMatch = lineText.match(/this\.(\w*)$/);
  if (thisPrefixMatch) {
    let hooks: any[] = [];
    if (isNPC) hooks = AUTOCOMPLETE_DATA.npcHooks;
    else if (isItem) hooks = AUTOCOMPLETE_DATA.itemHooks;
    // Fixed reference to projectileHooks which is now defined in AUTOCOMPLETE_DATA
    else if (isProjectile) hooks = AUTOCOMPLETE_DATA.projectileHooks;

    return {
      from: context.pos - thisPrefixMatch[1].length,
      options: [
          ...AUTOCOMPLETE_DATA.classMembers,
          ...hooks
      ]
    };
  }

  // 4. Global Suggestions & Auto-Imports - Context Aware
  const word = context.matchBefore(/\w*/);
  if (!word || (word.from === word.to && !context.explicit)) return null;

  let contextHooks: any[] = [];
  if (isNPC) contextHooks = AUTOCOMPLETE_DATA.npcHooks;
  else if (isItem) contextHooks = AUTOCOMPLETE_DATA.itemHooks;
  // Fixed reference to projectileHooks which is now defined in AUTOCOMPLETE_DATA
  else if (isProjectile) contextHooks = AUTOCOMPLETE_DATA.projectileHooks;

  const options = [
    ...SNIPPETS.map(s => ({
      label: s.label,
      type: s.type,
      detail: s.detail,
      apply: s.template
    })),
    // Adiciona hooks ao contexto global (para sobrescrever métodos)
    ...contextHooks.map(h => ({
        label: h.label,
        type: h.type,
        info: h.info,
        detail: '(base hook)'
    })),
    ...AUTOCOMPLETE_DATA.tlUtils.map(u => ({
      label: u.label,
      type: u.type,
      info: u.info,
      // Fixed: Removed non-existent property 'u.detail'
      apply: (view: EditorView, completion: any, from: number, to: number) => {
          const text = view.state.doc.toString();
          const impLine = `import { ${u.label} }`;
          
          view.dispatch({
              changes: { from, to, insert: u.label }
          });

          if (!text.includes(impLine)) {
              const modulePath = TL_MODULES[u.label];
              if (modulePath) {
                  const relPath = getRelativePath(modulePath); 
                  const importStatement = `import { ${u.label} } from '${relPath}';\n`;
                  view.dispatch({
                      changes: { from: 0, insert: importStatement }
                  });
              }
          }
      }
    }))
  ];

  return {
    from: word.from,
    options: options,
    filter: true
  };
};
