import React, { useMemo, useEffect, useState } from 'react';
import { useEditorStore } from '../../store';
import { Trash2, AlertTriangle, FileCode, X } from 'lucide-react';
import { toast } from 'sonner';

const DeleteConfirmation: React.FC = () => {
  const { 
    deleteConfirmation, closeDeleteConfirmation, 
    deleteEntity, deleteFolder, activeWorkspaceId, workspaces 
  } = useEditorStore();

  const [windowSize, setWindowSize] = useState({ w: window.innerWidth, h: window.innerHeight });

  useEffect(() => {
    const handleResize = () => setWindowSize({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const workspace = workspaces.find(w => w.id === activeWorkspaceId);

  const affectedFiles = useMemo(() => {
    if (!workspace || deleteConfirmation.type !== 'folder' || !deleteConfirmation.category) return [];
    
    const path = deleteConfirmation.id; 
    return workspace.entities.filter(e => 
      e.category === deleteConfirmation.category && 
      (e.folder === path || e.folder?.startsWith(path + '/'))
    );
  }, [workspace, deleteConfirmation]);

  const handleDelete = () => {
    if (!activeWorkspaceId) return;

    if (deleteConfirmation.type === 'entity') {
      deleteEntity(activeWorkspaceId, deleteConfirmation.id);
      toast.success("File deleted");
    } else if (deleteConfirmation.type === 'folder' && deleteConfirmation.category) {
      deleteFolder(activeWorkspaceId, deleteConfirmation.category, deleteConfirmation.id);
      toast.success("Folder and contents deleted");
    }
    closeDeleteConfirmation();
  };

  if (!deleteConfirmation.isOpen) return null;

  // --- LÓGICA DE POSICIONAMENTO ---
  const isMobile = windowSize.w < 768;
  const shouldCenter = isMobile || !deleteConfirmation.position;
  
  let desktopStyle: React.CSSProperties = {};

  // Se for Desktop e tiver posição definida, calcula o "Clamp" (confinamento)
  if (!shouldCenter && deleteConfirmation.position) {
      const { x, y } = deleteConfirmation.position;
      const modalWidth = 320;
      const modalHeight = 250; 
      const margin = 20; 

      // Horizontal: Tenta à direita, se não der, joga pra esquerda
      let left = x + 20; 
      if (left + modalWidth > windowSize.w - margin) {
          left = x - modalWidth - 20;
      }
      // Garante que não saia da tela
      left = Math.max(margin, Math.min(left, windowSize.w - modalWidth - margin));

      // Vertical: Tenta para baixo, se não der, joga pra cima
      let top = y;
      if (top + modalHeight > windowSize.h - margin) {
          top = windowSize.h - modalHeight - margin;
      }
      top = Math.max(margin, top);

      desktopStyle = { top, left };
  }

  return (
    <>
      {/* Overlay Escuro com Blur */}
      <div 
        className={`fixed inset-0 z-[9999] ${shouldCenter ? 'bg-black/80 backdrop-blur-sm' : 'bg-transparent'}`} 
        onClick={closeDeleteConfirmation}
      />

      {/* Modal Popup */}
      <div 
        className={`fixed z-[10000] bg-white dark:bg-[#1e1e1e] border border-slate-200 dark:border-[#333] shadow-2xl overflow-hidden flex flex-col
          ${shouldCenter 
            /* MOBILE / CENTRALIZADO: Usa translate para centro exato e w-[90%] para margem segura */
            ? 'left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-sm rounded-xl max-h-[90vh]' 
            /* DESKTOP: Largura fixa e animação suave */
            : 'w-80 rounded-xl animate-in zoom-in-95 duration-100'}
        `}
        style={shouldCenter ? {} : desktopStyle}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 bg-slate-50 dark:bg-[#252526] border-b border-slate-200 dark:border-[#333] flex items-center justify-between shrink-0">
          <h3 className="text-sm font-righteous uppercase tracking-wide text-rose-600 dark:text-rose-500 flex items-center gap-2">
            <Trash2 className="w-4 h-4" /> Confirm Deletion
          </h3>
          <button onClick={closeDeleteConfirmation} className="text-slate-400 hover:text-slate-900 dark:hover:text-white p-1 rounded-md transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body (Scrollável se necessário) */}
        <div className="p-5 space-y-4 overflow-y-auto custom-scrollbar">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-rose-100 dark:bg-rose-900/30 rounded-lg text-rose-600 dark:text-rose-400 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-slate-800 dark:text-white truncate">
                Delete "{deleteConfirmation.name}"?
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                This action cannot be undone. 
                {deleteConfirmation.type === 'folder' && " All contents will be lost."}
              </p>
            </div>
          </div>

          {deleteConfirmation.type === 'folder' && affectedFiles.length > 0 && (
            <div className="bg-slate-50 dark:bg-[#252526] rounded-lg border border-slate-200 dark:border-[#333] max-h-32 overflow-y-auto custom-scrollbar">
              <div className="px-3 py-2 border-b border-slate-200 dark:border-[#333] text-[10px] font-righteous tracking-widest uppercase text-slate-400 sticky top-0 bg-slate-50 dark:bg-[#252526]">
                Files to be deleted ({affectedFiles.length})
              </div>
              <div className="p-2 space-y-1">
                {affectedFiles.map(file => (
                  <div key={file.id} className="flex items-center gap-2 text-[10px] font-bold text-slate-600 dark:text-slate-300 px-1">
                    <FileCode className="w-3 h-3 opacity-50 shrink-0" />
                    <span className="truncate">{file.internalName}.js</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 dark:bg-[#252526] border-t border-slate-200 dark:border-[#333] flex gap-3 shrink-0">
          <button 
            onClick={closeDeleteConfirmation}
            className="flex-1 py-2.5 text-xs font-bold uppercase tracking-widest text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-[#333] rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleDelete}
            className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold uppercase tracking-widest rounded-lg shadow-md shadow-rose-500/20 transition-all active:scale-95"
          >
            Delete
          </button>
        </div>
      </div>
    </>
  );
};

export default DeleteConfirmation;