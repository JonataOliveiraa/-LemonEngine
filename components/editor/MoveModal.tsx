import React, { useState } from 'react';
import { useEditorStore } from '../../store';
import { Folder, ArrowRight, FileCode, Check, X, FolderOpen } from 'lucide-react';
import { EntityType } from '../../types';
import { toast } from 'sonner';

const MoveModal: React.FC = () => {
  const { 
    moveModal, closeMoveModal, moveEntity, activeWorkspaceId, workspaces 
  } = useEditorStore();

  const [selectedPath, setSelectedPath] = useState<string>(moveModal.currentFolder);
  
  const workspace = workspaces.find(w => w.id === activeWorkspaceId);
  const entity = workspace?.entities.find(e => e.id === moveModal.entityId);

  if (!moveModal.isOpen || !entity || !workspace) return null;

  // Lista todas as pastas disponíveis para a categoria da entidade
  const availableFolders = [
    '', // Root
    ...Array.from(new Set([
        ...(workspace.emptyFolders[entity.category] || []),
        ...workspace.entities
            .filter(e => e.category === entity.category && e.folder)
            .map(e => e.folder!)
    ])).sort()
  ];

  const handleMove = () => {
    if (!activeWorkspaceId || !moveModal.entityId) return;
    
    if (selectedPath === moveModal.currentFolder) {
        closeMoveModal();
        return;
    }

    moveEntity(activeWorkspaceId, moveModal.entityId, selectedPath);
    toast.success(`Moved to /${selectedPath || 'Root'}`);
    closeMoveModal();
  };

  const isRoot = selectedPath === '';

  return (
    <div className="fixed inset-0 z-[10002] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
        <div className="bg-white dark:bg-[#1e1e1e] w-full max-w-md rounded-2xl border border-slate-200 dark:border-[#333] shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
            
            {/* Header */}
            <div className="p-5 border-b border-slate-200 dark:border-[#333] flex justify-between items-center bg-slate-50 dark:bg-[#252526]">
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-700 dark:text-white flex items-center gap-2">
                    <FolderOpen className="w-4 h-4 text-[#007acc]" /> Move File
                </h3>
                <button onClick={closeMoveModal} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>

            {/* Visual Preview */}
            <div className="p-6 bg-slate-100 dark:bg-[#181818] flex items-center justify-center gap-4 border-b border-slate-200 dark:border-[#333]">
                <div className="flex flex-col items-center gap-2 opacity-50 scale-90">
                    <Folder className="w-8 h-8 text-slate-400" />
                    <span className="text-[10px] font-mono text-slate-500">/{moveModal.currentFolder || 'Root'}</span>
                </div>
                <ArrowRight className="w-5 h-5 text-[#007acc] animate-pulse" />
                <div className="flex flex-col items-center gap-2">
                    <div className="relative">
                        <Folder className="w-10 h-10 text-[#007acc]" />
                        <div className="absolute -bottom-1 -right-1 bg-white dark:bg-[#1e1e1e] rounded-full p-0.5 shadow">
                            <FileCode className="w-3 h-3 text-emerald-500" />
                        </div>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-slate-800 dark:text-white">/{selectedPath || 'Root'}</span>
                </div>
            </div>

            {/* Folder Browser */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-2 bg-white dark:bg-[#1e1e1e]">
                <p className="px-4 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest sticky top-0 bg-white dark:bg-[#1e1e1e] z-10">Select Destination</p>
                <div className="space-y-1">
                    {availableFolders.map(path => (
                        <button
                            key={path}
                            onClick={() => setSelectedPath(path)}
                            className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors rounded-lg ${selectedPath === path ? 'bg-[#007acc] text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#2a2d2e]'}`}
                        >
                            <Folder className={`w-4 h-4 ${selectedPath === path ? 'text-white' : 'text-slate-400'}`} />
                            <span className="text-xs font-bold truncate flex-1">{path === '' ? 'Root (Main Folder)' : path}</span>
                            {selectedPath === path && <Check className="w-3 h-3" />}
                        </button>
                    ))}
                </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-200 dark:border-[#333] bg-slate-50 dark:bg-[#252526]">
                <button 
                    onClick={handleMove}
                    className="w-full py-3 bg-[#007acc] hover:bg-[#0062a3] text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                    Confirm Move
                </button>
            </div>
        </div>
    </div>
  );
};

export default MoveModal;