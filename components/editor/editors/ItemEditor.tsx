import React, { useState, useEffect, useRef, useMemo, forwardRef, useImperativeHandle } from 'react';
import { ModEntity, EditorHandle } from '../../../types';
import { useEditorStore } from '../../../store';
import { CloudUpload, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, Undo2 } from 'lucide-react';
import { toast } from 'sonner';

import { EditorState } from "@codemirror/state";
import { EditorView, keymap, lineNumbers, highlightActiveLineGutter } from "@codemirror/view";
import { javascript } from "@codemirror/lang-javascript";
import { oneDarkHighlightStyle } from "@codemirror/theme-one-dark";
import { syntaxHighlighting, foldKeymap, bracketMatching, indentUnit } from "@codemirror/language";
import { defaultKeymap, history, historyKeymap, indentWithTab, cursorCharLeft, cursorCharRight, cursorLineUp, cursorLineDown, undo } from "@codemirror/commands";
import { autocompletion, completionKeymap, closeBrackets } from "@codemirror/autocomplete";
import { tlAutocomplete, tlLinter, tlHover } from '../../../services/languageService';

interface Props {
  entity: ModEntity;
}

const MobileToolbar = ({ view }: { view: EditorView | null }) => {
    const [bottomOffset, setBottomOffset] = useState(0);

    useEffect(() => {
        const viewport = window.visualViewport;
        if (!viewport) return;

        const updatePosition = () => {
            const keyboardHeight = window.innerHeight - viewport.height;
            setBottomOffset(keyboardHeight > 0 ? keyboardHeight : 0);
        };

        viewport.addEventListener('resize', updatePosition);
        viewport.addEventListener('scroll', updatePosition);
        
        updatePosition();

        return () => {
            viewport.removeEventListener('resize', updatePosition);
            viewport.removeEventListener('scroll', updatePosition);
        };
    }, []);

    if (!view) return null;

    return (
        <div 
            className="fixed left-0 w-full bg-slate-200 dark:bg-[#1a1a1a] border-t border-slate-300 dark:border-[#333] p-1 flex justify-around items-center h-12 z-[9999] shadow-[0_-4px_10px_rgba(0,0,0,0.3)] transition-all duration-75"
            style={{ bottom: `${bottomOffset}px` }}
        >
            <button onPointerDown={(e) => { e.preventDefault(); cursorCharLeft(view); }} className="flex-1 max-w-[70px] h-10 flex items-center justify-center bg-white dark:bg-[#2d2d2d] rounded-md text-slate-700 dark:text-slate-300 shadow-sm active:bg-[#007acc] active:text-white transition-colors">
                <ChevronLeft className="w-6 h-6" />
            </button>
            <button onPointerDown={(e) => { e.preventDefault(); cursorCharRight(view); }} className="flex-1 max-w-[70px] h-10 flex items-center justify-center bg-white dark:bg-[#2d2d2d] rounded-md text-slate-700 dark:text-slate-300 shadow-sm active:bg-[#007acc] active:text-white transition-colors">
                <ChevronRight className="w-6 h-6" />
            </button>
            
            <div className="w-px h-6 bg-slate-300 dark:bg-[#444] shrink-0 mx-1"></div>
            
            <button onPointerDown={(e) => { e.preventDefault(); undo(view); }} className="flex-1 max-w-[70px] h-10 flex items-center justify-center bg-white dark:bg-[#2d2d2d] rounded-md text-slate-700 dark:text-slate-300 shadow-sm active:bg-rose-500 active:text-white transition-colors">
                <Undo2 className="w-5 h-5" />
            </button>

            <div className="w-px h-6 bg-slate-300 dark:bg-[#444] shrink-0 mx-1"></div>

            <button onPointerDown={(e) => { e.preventDefault(); cursorLineUp(view); }} className="flex-1 max-w-[70px] h-10 flex items-center justify-center bg-white dark:bg-[#2d2d2d] rounded-md text-slate-700 dark:text-slate-300 shadow-sm active:bg-[#007acc] active:text-white transition-colors">
                <ChevronUp className="w-6 h-6" />
            </button>
            <button onPointerDown={(e) => { e.preventDefault(); cursorLineDown(view); }} className="flex-1 max-w-[70px] h-10 flex items-center justify-center bg-white dark:bg-[#2d2d2d] rounded-md text-slate-700 dark:text-slate-300 shadow-sm active:bg-[#007acc] active:text-white transition-colors">
                <ChevronDown className="w-6 h-6" />
            </button>
        </div>
    );
};

const EntityEditor = forwardRef<EditorHandle, Props>(({ entity }, ref) => {
  const { updateEntityCode, activeWorkspaceId, theme, userProfile } = useEditorStore();
  const [isSaved, setIsSaved] = useState(true);
  
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isFocused, setIsFocused] = useState(false);
  
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  const isDark = theme === 'dark';

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
      
      // >>> CÓDIGO INJETADO AQUI PARA OCULTAR SCROLLBAR DO CODEMIRROR <<<
      ".cm-scroller": {
          scrollbarWidth: "none",
          "-ms-overflow-style": "none"
      },
      ".cm-scroller::-webkit-scrollbar": {
          display: "none"
      },

      ".cm-content": { 
          paddingBottom: "400px",
      },
      ".cm-line": {
          paddingRight: "32px"
      },
      
      ".cm-tooltip-autocomplete": { 
          backgroundColor: isDark ? "#1e1e1e" : "#f8fafc", 
          border: `1px solid ${isDark ? "#333" : "#e2e8f0"}`, 
          borderRadius: "6px", 
          fontSize: "12px", 
          zIndex: "9999",
          minWidth: "250px",
          boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)"
      },
      ".cm-tooltip-autocomplete > ul": {
          scrollbarWidth: "none",
          "-ms-overflow-style": "none",
      },
      ".cm-tooltip-autocomplete > ul::-webkit-scrollbar": {
          display: "none"
      },
      ".cm-tooltip-autocomplete > ul > li": { padding: "6px 12px", lineHeight: "1.5" },
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

    const state = EditorState.create({
      doc: entity.code,
      extensions: [
        lineNumbers(),
        highlightActiveLineGutter(),
        javascript(),
        syntaxHighlighting(oneDarkHighlightStyle),
        editorThemeConfig,
        bracketMatching(),
        closeBrackets(),
        indentUnit.of("    "),
        tlHover, 
        tlLinter,
        autocompletion({ override: [tlAutocomplete] }),
        userProfile.wordWrap ? EditorView.lineWrapping : [],
        history(), 
        keymap.of([ 
            indentWithTab, 
            ...defaultKeymap, 
            ...historyKeymap, 
            ...foldKeymap, 
            ...completionKeymap, 
            { key: "Mod-s", run: (view) => { if (activeWorkspaceId) { updateEntityCode(activeWorkspaceId, entity.id, view.state.doc.toString()); setIsSaved(true); toast.success(`Saved ${entity.internalName}.js`); } return true; }}
        ]),
        EditorView.updateListener.of((u) => { 
            if (u.docChanged) setIsSaved(false); 
            if (u.focusChanged) setIsFocused(u.view.hasFocus);
        }),
      ],
    });

    const view = new EditorView({ state, parent: editorRef.current });
    viewRef.current = view;
    return () => view.destroy();
  }, [entity.id, editorThemeConfig, isDark, userProfile.wordWrap, userProfile.mobileNavHelper, entity.folder]);

  return (
    <div className={`flex flex-col h-full transition-colors ${isDark ? 'bg-[#1e1e1e]' : 'bg-white'}`}>
      
      <div className="flex-1 overflow-hidden relative flex flex-col">
        <div ref={editorRef} className="flex-1 w-full overflow-hidden" />
      </div>

      {isMobile && isFocused && <MobileToolbar view={viewRef.current} />}

      <div className="h-6 bg-[#007acc] text-white flex items-center px-4 justify-between shrink-0 text-[10px] font-medium z-10">
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