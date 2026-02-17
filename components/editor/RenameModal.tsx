import React, { useState, useEffect } from 'react';
import { useEditorStore } from '../../store';
import { Pencil, X, FileText, Folder } from 'lucide-react';
import { toast } from 'sonner';

const RenameModal: React.FC = () => {
  const { 
    renameModal, closeRenameModal, 
    renameEntity, renameFolder, activeWorkspaceId 
  } = useEditorStore();

  const [newName, setNewName] = useState('');

  useEffect(() => {
    if (renameModal.isOpen) {
      setNewName(renameModal.currentName);
    }
  }, [renameModal.isOpen, renameModal.currentName]);

  const handleRename = (e?: React.FormEvent) => {
    e?.preventDefault();
    const cleanName = newName.trim().replace(/\s+/g, '');

    if (!cleanName) {
      toast.error("Name cannot be empty");
      return;
    }
    if (cleanName === renameModal.currentName) {
      closeRenameModal();
      return;
    }
    if (!activeWorkspaceId) return;

    if (renameModal.type === 'entity') {
      renameEntity(activeWorkspaceId, renameModal.id, cleanName);
      toast.success(`Renamed to ${cleanName}.js`);
    } else if (renameModal.type === 'folder' && renameModal.category) {
      renameFolder(activeWorkspaceId, renameModal.category, renameModal.id, cleanName);
      toast.success(`Folder renamed to ${cleanName}`);
    }
    
    closeRenameModal();
  };

  if (!renameModal.isOpen) return null;

  const isMobile = window.innerWidth < 768;
  // Posicionamento inteligente para Desktop
  const desktopStyle = !isMobile && renameModal.position ? {
    top: Math.min(renameModal.position.y, window.innerHeight - 200),
    left: Math.min(renameModal.position.x + 20, window.innerWidth - 320)
  } : {};

  return (
    <>
      <div 
        className={`fixed inset-0 z-[10000] ${isMobile ? 'bg-black/80 backdrop-blur-sm' : 'bg-transparent'}`} 
        onClick={closeRenameModal}
      />

      <div 
        className={`
          fixed z-[10001] bg-white dark:bg-[#1e1e1e] border border-slate-200 dark:border-[#333] shadow-2xl overflow-hidden flex flex-col
          ${isMobile ? 'inset-x-4 top-1/2 -translate-y-1/2 rounded-2xl' : 'w-80 rounded-xl animate-in zoom-in-95 duration-100'}
        `}
        style={isMobile ? {} : desktopStyle}
        onClick={e => e.stopPropagation()}
      >
        <div className="p-4 bg-slate-50 dark:bg-[#252526] border-b border-slate-200 dark:border-[#333] flex items-center justify-between">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-700 dark:text-white flex items-center gap-2">
            <Pencil className="w-4 h-4" /> Rename {renameModal.type}
          </h3>
          <button onClick={closeRenameModal} className="text-slate-400 hover:text-slate-900 dark:hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleRename} className="p-5 space-y-4">
          <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700">
            {renameModal.type === 'folder' ? <Folder className="w-5 h-5 text-slate-400" /> : <FileText className="w-5 h-5 text-slate-400" />}
            <div className="relative w-full">
                <input 
                    autoFocus
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full bg-transparent font-bold text-slate-900 dark:text-white outline-none text-sm"
                    placeholder="New Name"
                />
                {renameModal.type === 'entity' && <span className="absolute right-0 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-mono">.js</span>}
            </div>
          </div>

          <button 
            type="submit"
            className="w-full py-3 bg-[#007acc] hover:bg-[#0062a3] text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-lg transition-all active:scale-95"
          >
            Save Changes
          </button>
        </form>
      </div>
    </>
  );
};

export default RenameModal;