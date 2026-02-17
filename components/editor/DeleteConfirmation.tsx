import React, { useMemo } from 'react';
import { useEditorStore } from '../../store';
import { Trash2, AlertTriangle, FileCode, Folder, X } from 'lucide-react';
import { toast } from 'sonner';

const DeleteConfirmation: React.FC = () => {
  const { 
    deleteConfirmation, closeDeleteConfirmation, 
    deleteEntity, deleteFolder, activeWorkspaceId, workspaces 
  } = useEditorStore();

  const workspace = workspaces.find(w => w.id === activeWorkspaceId);

  // Calcula quais arquivos serão afetados (para exclusão de pasta)
  const affectedFiles = useMemo(() => {
    if (!workspace || deleteConfirmation.type !== 'folder' || !deleteConfirmation.category) return [];
    
    const path = deleteConfirmation.id; // No caso de pasta, o ID é o path
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

  // Lógica de Posicionamento para Desktop (Popup perto do clique)
  // Se for mobile (largura < 768px), ignoramos position e usamos centralizado
  const isMobile = window.innerWidth < 768;
  const desktopStyle = !isMobile && deleteConfirmation.position ? {
    top: Math.min(deleteConfirmation.position.y, window.innerHeight - 300), // Evita cortar embaixo
    left: Math.min(deleteConfirmation.position.x + 20, window.innerWidth - 320) // Evita cortar na direita
  } : {};

  return (
    <>
      {/* Overlay para fechar ao clicar fora (com backdrop blur apenas no mobile) */}
      <div 
        className={`fixed inset-0 z-[9999] ${isMobile ? 'bg-black/80 backdrop-blur-sm' : 'bg-transparent'}`} 
        onClick={closeDeleteConfirmation}
      />

      <div 
        className={`
          fixed z-[10000] bg-white dark:bg-[#1e1e1e] border border-slate-200 dark:border-[#333] shadow-2xl overflow-hidden flex flex-col
          ${isMobile ? 'inset-x-4 top-1/2 -translate-y-1/2 rounded-2xl' : 'w-80 rounded-xl animate-in zoom-in-95 duration-100'}
        `}
        style={isMobile ? {} : desktopStyle}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 bg-slate-50 dark:bg-[#252526] border-b border-slate-200 dark:border-[#333] flex items-center justify-between">
          <h3 className="text-xs font-black uppercase tracking-widest text-rose-600 dark:text-rose-500 flex items-center gap-2">
            <Trash2 className="w-4 h-4" /> Confirm Deletion
          </h3>
          <button onClick={closeDeleteConfirmation} className="text-slate-400 hover:text-slate-900 dark:hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-rose-100 dark:bg-rose-900/30 rounded-lg text-rose-600 dark:text-rose-400 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800 dark:text-white">
                Delete "{deleteConfirmation.name}"?
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                This action cannot be undone. 
                {deleteConfirmation.type === 'folder' && " All contents will be lost."}
              </p>
            </div>
          </div>

          {/* Lista de arquivos afetados (Apenas se for pasta e tiver arquivos) */}
          {deleteConfirmation.type === 'folder' && affectedFiles.length > 0 && (
            <div className="bg-slate-50 dark:bg-[#252526] rounded-lg border border-slate-200 dark:border-[#333] max-h-32 overflow-y-auto custom-scrollbar">
              <div className="px-3 py-2 border-b border-slate-200 dark:border-[#333] text-[9px] font-black uppercase text-slate-400">
                Files to be deleted ({affectedFiles.length})
              </div>
              <div className="p-2 space-y-1">
                {affectedFiles.map(file => (
                  <div key={file.id} className="flex items-center gap-2 text-[10px] text-slate-600 dark:text-slate-300 px-1">
                    <FileCode className="w-3 h-3 opacity-50" />
                    <span className="truncate">{file.internalName}.js</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 dark:bg-[#252526] border-t border-slate-200 dark:border-[#333] flex gap-3">
          <button 
            onClick={closeDeleteConfirmation}
            className="flex-1 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-[#333] rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleDelete}
            className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg shadow-lg shadow-rose-500/20 transition-all active:scale-95"
          >
            Delete
          </button>
        </div>
      </div>
    </>
  );
};

export default DeleteConfirmation;