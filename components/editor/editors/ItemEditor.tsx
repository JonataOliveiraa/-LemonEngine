import React, { useState, useEffect, useRef, useMemo, forwardRef, useImperativeHandle } from 'react';
import { ModEntity, EditorHandle } from '../../../types';
import { useEditorStore } from '../../../store';
import { CloudUpload } from 'lucide-react';
import { toast } from 'sonner';

import { EditorState } from "@codemirror/state";
import { EditorView, keymap, lineNumbers, highlightActiveLineGutter } from "@codemirror/view";
import { javascript } from "@codemirror/lang-javascript";
import { oneDarkHighlightStyle } from "@codemirror/theme-one-dark";
import { syntaxHighlighting, foldKeymap, foldGutter, bracketMatching, indentUnit } from "@codemirror/language";
import { defaultKeymap, history, historyKeymap, indentWithTab } from "@codemirror/commands";
import { autocompletion, completionKeymap, closeBrackets, moveCompletionSelection, completionStatus } from "@codemirror/autocomplete";
import { createTlAutocomplete, tlLinter, tlHover } from '../../../services/languageService';

interface Props {
  entity: ModEntity;
}

// Usamos forwardRef para permitir que o pai chame save() e focus()
const EntityEditor = forwardRef<EditorHandle, Props>(({ entity }, ref) => {
  const { updateEntityCode, activeWorkspaceId, theme, userProfile } = useEditorStore();
  const [isSaved, setIsSaved] = useState(true);
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  const isDark = theme === 'dark';
  const isMobile = window.innerWidth < 768;

  // Expõe funções para o componente pai (Editor.tsx)
  useImperativeHandle(ref, () => ({
    save: () => {
        if (viewRef.current && activeWorkspaceId) {
            updateEntityCode(activeWorkspaceId, entity.id, viewRef.current.state.doc.toString());
            setIsSaved(true);
            toast.success(`Saved ${entity.internalName}.js`);
        }
    },
    focus: () => {
        viewRef.current?.focus();
    }
  }));

  // Auto Save
  useEffect(() => {
    if (!userProfile.autoSave || isSaved) return;
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    autoSaveTimerRef.current = setTimeout(() => {
        if (viewRef.current && activeWorkspaceId) {
            updateEntityCode(activeWorkspaceId, entity.id, viewRef.current.state.doc.toString());
            setIsSaved(true);
        }
    }, 1500);
    return () => { if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current); };
  }, [isSaved, userProfile.autoSave, entity.id, activeWorkspaceId]);

  const editorThemeConfig = useMemo(() => {
    const fontSize = userProfile.editorFontSize || 14;
    return EditorView.theme({
      "&": { backgroundColor: isDark ? "#1e1e1e" : "#ffffff", color: isDark ? "#abb2bf" : "#334155", fontFamily: "'Fira Code', monospace", fontSize: `${fontSize}px`, height: "100%" },
      ".cm-gutters": { backgroundColor: isDark ? "#1e1e1e" : "#ffffff", color: isDark ? "#5c6370" : "#94a3b8", border: "none" },
      ".cm-activeLine": { backgroundColor: isDark ? "rgba(255, 255, 255, 0.03)" : "rgba(0, 0, 0, 0.03)" },
      
      ".cm-tooltip-autocomplete": { 
          backgroundColor: isDark ? "#1e1e1e" : "#f8fafc", 
          border: `1px solid ${isDark ? "#333" : "#e2e8f0"}`, 
          borderRadius: "6px", 
          fontSize: "12px", 
          zIndex: "9999",
          minWidth: "250px",
          boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)"
      },
      ".cm-tooltip-autocomplete > ul > li": { padding: "4px 8px", lineHeight: "1.5" },
      ".cm-tooltip-autocomplete > ul > li[aria-selected]": { backgroundColor: "#007acc30", color: isDark ? "#fff" : "#000" },
      
      ".text-purple-400": { color: "#c084fc" },
      ".text-blue-400": { color: "#60a5fa" },
      ".text-emerald-400": { color: "#34d399" },
      ".text-sky-300": { color: "#7dd3fc" },
      ".text-pink-400": { color: "#f472b6" },
      ".text-gray-500": { color: "#6b7280" },
      ".text-gray-200": { color: isDark ? "#e2e8f0" : "#1e293b" }

    }, { dark: isDark });
  }, [isDark, userProfile.editorFontSize]);

  useEffect(() => {
    if (!editorRef.current) return;

    const mobileNavKeymap = (userProfile.mobileNavHelper && isMobile) ? [
        { key: "w", run: (view: EditorView) => { if (completionStatus(view.state) === "active") { moveCompletionSelection(true)(view); return true; } return false; } },
        { key: "s", run: (view: EditorView) => { if (completionStatus(view.state) === "active") { moveCompletionSelection(false)(view); return true; } return false; } }
    ] : [];

    const state = EditorState.create({
      doc: entity.code,
      extensions: [
        lineNumbers(), highlightActiveLineGutter(), foldGutter(), history(), bracketMatching(), closeBrackets(), javascript(),
        isDark ? syntaxHighlighting(oneDarkHighlightStyle) : [], 
        editorThemeConfig, 
        indentUnit.of("    "), 
        EditorState.tabSize.of(4),
        tlHover, tlLinter,
        autocompletion({ override: [createTlAutocomplete(entity.folder || '')], icons: true, defaultKeymap: true, maxRenderedOptions: 50 }),
        userProfile.wordWrap ? EditorView.lineWrapping : [],
        keymap.of([ 
            indentWithTab,
            ...mobileNavKeymap, 
            ...defaultKeymap, 
            ...historyKeymap, 
            ...foldKeymap, 
            ...completionKeymap, 
            { key: "Mod-s", run: (view) => { if (activeWorkspaceId) { updateEntityCode(activeWorkspaceId, entity.id, view.state.doc.toString()); setIsSaved(true); toast.success(`Saved ${entity.internalName}.js`); } return true; }}
        ]),
        EditorView.updateListener.of((u) => { if (u.docChanged) setIsSaved(false); }),
      ],
    });

    const view = new EditorView({ state, parent: editorRef.current });
    viewRef.current = view;
    return () => view.destroy();
  }, [entity.id, editorThemeConfig, isDark, userProfile.wordWrap, userProfile.mobileNavHelper, entity.folder]);

  return (
    <div className={`flex flex-col h-full transition-colors ${isDark ? 'bg-[#1e1e1e]' : 'bg-white'}`}>
      <div className="flex-1 overflow-hidden relative">
        <div ref={editorRef} className="h-full w-full" />
      </div>
      <div className="h-6 bg-[#007acc] text-white flex items-center px-4 justify-between shrink-0 text-[10px] font-medium">
        <span className="flex items-center gap-1.5 font-bold"><CloudUpload className="w-3 h-3" /> TL IDE</span>
        <div className="flex items-center gap-4">
            <span className="opacity-80">{!isSaved ? 'Unsaved' : 'Saved'}</span>
            <span className="opacity-80">Line: {viewRef.current?.state.doc.lines || 0}</span>
        </div>
      </div>
    </div>
  );
});

export default EntityEditor;