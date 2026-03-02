import React, { useState, useEffect, useRef, useMemo, forwardRef, useImperativeHandle } from 'react';
import { Workspace, EditorHandle } from '../../../types';
import { useEditorStore } from '../../../store';
import { CloudUpload, AlertTriangle, ShieldAlert, X } from 'lucide-react';
import { toast } from 'sonner';

import { EditorState } from "@codemirror/state";
import { EditorView, keymap, lineNumbers, highlightActiveLineGutter } from "@codemirror/view";
import { javascript } from "@codemirror/lang-javascript";
import { oneDarkHighlightStyle } from "@codemirror/theme-one-dark";
import { syntaxHighlighting, foldKeymap, foldGutter, bracketMatching, indentUnit } from "@codemirror/language";
import { defaultKeymap, history, historyKeymap, indentWithTab } from "@codemirror/commands";
import { completionKeymap, closeBrackets } from "@codemirror/autocomplete";

interface Props {
  workspace: Workspace;
}

const DEFAULT_MAIN_JS = `import { RegisterAll } from './Register/RegisterAll.js';
import { SystemLoader } from './TL/Loaders/SystemLoader.js';

// You can add your custom global logic here

RegisterAll();
SystemLoader.OnModLoad();
`;

const MainJsEditor = forwardRef<EditorHandle, Props>(({ workspace }, ref) => {
  const { updateWorkspace, theme, userProfile } = useEditorStore();
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  
  // Utiliza sessionStorage para lembrar se o usuário já fechou o aviso nesta sessão
  const [showWarning, setShowWarning] = useState(() => {
    return sessionStorage.getItem('dismissedMainJsWarning') !== 'true';
  });

  const isDark = theme === 'dark';

  // Usamos o campo 'mainJsInjection' para armazenar todo o conteúdo do main.js agora.
  // Se estiver vazio, inicializamos com o padrão.
  const initialContent = workspace.mainJsInjection || DEFAULT_MAIN_JS;

  // EXPOR MÉTODOS
  useImperativeHandle(ref, () => ({
    save: () => {
        if (viewRef.current) {
            updateWorkspace(workspace.id, { mainJsInjection: viewRef.current.state.doc.toString() });
            toast.success("Saved Main Entry");
        }
    },
    focus: () => {
        viewRef.current?.focus();
    }
  }));

  const editorThemeConfig = useMemo(() => {
    const fontSize = userProfile.editorFontSize || 14;
    return EditorView.theme({
      "&": { backgroundColor: isDark ? "#1e1e1e" : "#ffffff", color: isDark ? "#abb2bf" : "#334155", fontFamily: "'Fira Code', monospace", fontSize: `${fontSize}px`, height: "100%" },
      ".cm-gutters": { backgroundColor: isDark ? "#1e1e1e" : "#ffffff", color: isDark ? "#5c6370" : "#94a3b8", border: "none" },
      ".cm-activeLine": { backgroundColor: isDark ? "rgba(255, 255, 255, 0.03)" : "rgba(0, 0, 0, 0.03)" },
    }, { dark: isDark });
  }, [isDark, userProfile.editorFontSize]);

  useEffect(() => {
    if (!editorRef.current) return;

    const saveAction = () => {
      if (viewRef.current) {
        updateWorkspace(workspace.id, { mainJsInjection: viewRef.current.state.doc.toString() });
        toast.success("Main entry point updated!");
      }
      return true;
    };

    const state = EditorState.create({
      doc: initialContent,
      extensions: [
        lineNumbers(), highlightActiveLineGutter(), foldGutter(), history(), bracketMatching(), closeBrackets(), javascript(),
        isDark ? syntaxHighlighting(oneDarkHighlightStyle) : [], 
        editorThemeConfig,
        indentUnit.of("    "), EditorState.tabSize.of(4),
        userProfile.wordWrap ? EditorView.lineWrapping : [],
        keymap.of([ ...defaultKeymap, ...historyKeymap, ...foldKeymap, ...completionKeymap, indentWithTab, { key: "Mod-s", run: saveAction } ]),
      ],
    });

    const view = new EditorView({ state, parent: editorRef.current });
    viewRef.current = view;
    
    return () => view.destroy();
  }, [workspace.id, editorThemeConfig, isDark, userProfile.wordWrap, initialContent]);

  const handleDismissWarning = () => {
    sessionStorage.setItem('dismissedMainJsWarning', 'true');
    setShowWarning(false);
  };

  return (
    <div className={`flex flex-col h-full transition-colors ${isDark ? 'bg-[#1e1e1e]' : 'bg-white'}`}>
      <div className="flex-1 flex flex-col overflow-hidden relative">
          
          {/* AVISO PRÉVIO RESPONSIVO */}
          {showWarning && (
            <div className={`m-4 p-4 rounded-lg border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all shadow-sm z-10 shrink-0 ${isDark ? 'bg-amber-950/30 border-amber-900/50 text-amber-200' : 'bg-amber-50 border-amber-200 text-amber-800'}`}>
                <div className="flex gap-3 items-start sm:items-center">
                    <div className={`p-2 rounded-md shrink-0 ${isDark ? 'bg-amber-900/50' : 'bg-amber-200/50'}`}>
                        <ShieldAlert className="w-5 h-5 text-amber-500" />
                    </div>
                    <div>
                        <h4 className="text-sm font-righteous uppercase tracking-wide flex items-center gap-2">
                           Advanced Mode Enabled
                        </h4>
                        <p className={`text-xs mt-1 leading-relaxed ${isDark ? 'text-amber-400/80' : 'text-amber-700/80'}`}>
                            You are editing the root <b>main.js</b> file. Removing the core imports (`RegisterAll` or `SystemLoader`) will break the mod loading sequence.
                        </p>
                    </div>
                </div>
                <button 
                  onClick={handleDismissWarning}
                  className={`shrink-0 p-2 rounded-md transition-colors ${isDark ? 'hover:bg-amber-900/50 text-amber-400/50 hover:text-amber-400' : 'hover:bg-amber-200/50 text-amber-600/50 hover:text-amber-700'}`}
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
          )}

          {/* ÁREA DO EDITOR CODE MIRROR */}
          <div className="flex-1 relative overflow-hidden">
             <div ref={editorRef} className="absolute inset-0 h-full w-full" />
          </div>
          
      </div>

      <div className="h-6 bg-[#007acc] text-white flex items-center px-4 justify-between shrink-0 text-[11px] font-medium">
        <span className="flex items-center gap-1.5 font-bold"><CloudUpload className="w-3 h-3" /> TL BOOTSTRAP</span>
        <span className="opacity-80 uppercase tracking-widest text-[10px] font-bold">Root Edit Mode</span>
      </div>
    </div>
  );
});

export default MainJsEditor;