import React, { useState, useEffect, useRef } from 'react';
import { EditorState } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { javascript } from "@codemirror/lang-javascript";
import { oneDarkHighlightStyle } from "@codemirror/theme-one-dark";
import { syntaxHighlighting } from "@codemirror/language";
import { FolderCog, Loader2 } from 'lucide-react';

interface Props {
  path: string;
}

const TlEditor: React.FC<Props> = ({ path }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [code, setCode] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/framework/TL/${path}`)
      .then(res => {
        if (!res.ok) throw new Error("File not found");
        return res.text();
      })
      .then(text => {
        setCode(text);
        setLoading(false);
      })
      .catch(err => {
        setCode(`// ❌ Erro: Não foi possível carregar o arquivo.\n// Caminho tentado: public/framework/TL/${path}\n// Verifique se a pasta e o arquivo realmente existem.`);
        setLoading(false);
      });
  }, [path]);

  useEffect(() => {
    if (loading || !editorRef.current) return;

    const state = EditorState.create({
      doc: code,
      extensions: [
        javascript(),
        syntaxHighlighting(oneDarkHighlightStyle),
        EditorView.editable.of(false),
        EditorView.theme({
          "&": { 
            backgroundColor: "#1e1e1e", 
            color: "#abb2bf", 
            fontFamily: "'Fira Code', monospace", 
            fontSize: "13px", 
            height: "100%" 
          },
          ".cm-gutters": { 
            backgroundColor: "#1e1e1e", 
            color: "#5c6370", 
            border: "none" 
          },
          ".cm-activeLine": { 
            backgroundColor: "rgba(255, 255, 255, 0.03)" 
          },
          // Esconde a scrollbar visualmente, mas mantém a rolagem
          ".cm-scroller": {
            overflow: "auto",
            scrollbarWidth: "none",        // Firefox
            msOverflowStyle: "none",       // IE/Edge antigo
            "&::-webkit-scrollbar": {
              display: "none"               // Chrome, Safari, Edge moderno
            }
          }
        }, { dark: true })
      ]
    });

    const view = new EditorView({ state, parent: editorRef.current });
    return () => view.destroy();
  }, [code, loading]);

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e] animate-in fade-in duration-200">
      <div className="h-8 bg-[#252526] border-b border-[#333] flex items-center px-4 shrink-0 shadow-sm">
        <FolderCog className="w-4 h-4 text-rose-500 mr-2 opacity-80" />
        <span className="text-xs font-mono text-slate-300">TL / {path}</span>
        <span className="ml-auto text-[9px] uppercase font-bold tracking-widest text-slate-500 border border-slate-700 bg-slate-800/50 rounded px-1.5 py-0.5">
          Read Only
        </span>
      </div>
      <div className="flex-1 overflow-hidden relative">
        {loading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#1e1e1e] z-10 gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-rose-500" />
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Fetching Framework...</span>
          </div>
        ) : (
          <div ref={editorRef} className="h-full w-full" />
        )}
      </div>
    </div>
  );
};

export default TlEditor;