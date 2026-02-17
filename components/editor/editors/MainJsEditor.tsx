import React, { useState, useEffect, useRef, useMemo, forwardRef, useImperativeHandle } from 'react';
import { Workspace, EditorHandle } from '../../../types';
import { useEditorStore } from '../../../store';
import { FileCode, CloudUpload, Terminal } from 'lucide-react';
import { toast } from 'sonner';

import { EditorState } from "@codemirror/state";
import { EditorView, keymap, lineNumbers, highlightActiveLineGutter } from "@codemirror/view";
import { javascript } from "@codemirror/lang-javascript";
import { oneDarkHighlightStyle } from "@codemirror/theme-one-dark";
import { syntaxHighlighting, foldKeymap, foldGutter, bracketMatching, indentUnit } from "@codemirror/language";
import { defaultKeymap, history, historyKeymap, indentWithTab } from "@codemirror/commands";
import { autocompletion, completionKeymap, closeBrackets } from "@codemirror/autocomplete";

interface Props {
  workspace: Workspace;
}

const MainJsEditor = forwardRef<EditorHandle, Props>(({ workspace }, ref) => {
  const { updateMainJs, theme, userProfile } = useEditorStore();
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);

  const isDark = theme === 'dark';
  const header = `import { RegisterAll } from './Register/RegisterAll.js';\nimport { SystemLoader } from './TL/Loaders/SystemLoader.js';`;
  const footer = `RegisterAll();\nSystemLoader.OnModLoad();`;

  // EXPOR MÉTODOS
  useImperativeHandle(ref, () => ({
    save: () => {
        if (viewRef.current) {
            updateMainJs(workspace.id, viewRef.current.state.doc.toString());
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
        updateMainJs(workspace.id, viewRef.current.state.doc.toString());
        toast.success("Main entry point updated!");
      }
      return true;
    };

    const state = EditorState.create({
      doc: workspace.mainJsInjection || '',
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
  }, [workspace.id, editorThemeConfig, isDark, userProfile.wordWrap]);

  return (
    <div className={`flex flex-col h-full transition-colors ${isDark ? 'bg-[#1e1e1e]' : 'bg-white'}`}>
      <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="max-w-5xl mx-auto py-8 px-6 space-y-6">
              <div className={`p-6 border-b opacity-50 flex flex-col gap-2 rounded-t-xl transition-colors ${isDark ? 'bg-[#252526]/40 border-[#333]' : 'bg-slate-100 border-slate-200'}`}>
                  <div className="flex items-center gap-2">
                      <FileCode className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Static Imports</span>
                  </div>
                  <pre className={`font-mono text-xs leading-relaxed ${isDark ? 'text-[#abb2bf]' : 'text-slate-600'}`}>{header}</pre>
              </div>

              <div className={`border overflow-hidden shadow-2xl transition-colors min-h-[400px] relative ${isDark ? 'bg-[#1e1e1e] border-[#333]' : 'bg-white border-slate-200'}`}>
                  <div className="absolute top-2 right-4 text-[9px] font-black text-emerald-500 uppercase tracking-widest z-10 pointer-events-none">Injection Point</div>
                  <div ref={editorRef} className="h-full w-full" />
              </div>

              <div className={`p-6 border-t opacity-50 flex flex-col gap-2 rounded-b-xl transition-colors ${isDark ? 'bg-[#252526]/40 border-[#333]' : 'bg-slate-100 border-slate-200'}`}>
                  <div className="flex items-center gap-2">
                      <FileCode className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Bootstrap Call</span>
                  </div>
                  <pre className={`font-mono text-xs leading-relaxed ${isDark ? 'text-[#abb2bf]' : 'text-slate-600'}`}>{footer}</pre>
              </div>
          </div>
      </div>
      <div className="h-6 bg-[#007acc] text-white flex items-center px-4 justify-between shrink-0 text-[10px] font-medium">
        <span className="flex items-center gap-1.5 font-bold"><CloudUpload className="w-3 h-3" /> TL BOOTSTRAP</span>
        <span className="opacity-80">Safe Injection Mode</span>
      </div>
    </div>
  );
});

export default MainJsEditor;