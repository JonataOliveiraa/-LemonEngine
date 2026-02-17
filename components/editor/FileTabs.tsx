import React, { useRef, useEffect } from 'react';
import { useEditorStore } from '../../store';
import { X, FileCode, Settings, Terminal } from 'lucide-react';

const FileTabs: React.FC = () => {
  const { 
    activeWorkspaceId, workspaces, activeEntityId, setActiveEntity, 
    openFiles, closeFile 
  } = useEditorStore();

  const scrollRef = useRef<HTMLDivElement>(null);
  const workspace = workspaces.find(w => w.id === activeWorkspaceId);

  useEffect(() => {
    if (activeEntityId && scrollRef.current) {
        const activeTab = document.getElementById(`tab-${activeEntityId}`);
        if (activeTab) {
            activeTab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
    }
  }, [activeEntityId, openFiles.length]);

  if (!workspace) return null;

  const getFileInfo = (fileId: string) => {
      if (fileId === 'main') return { name: 'main.js', icon: <Terminal className="w-3.5 h-3.5 text-rose-500" /> };
      if (fileId === 'settings') return { name: 'Settings.json', icon: <Settings className="w-3.5 h-3.5 text-blue-500" /> };
      
      const entity = workspace.entities.find(e => e.id === fileId);
      if (entity) return { name: `${entity.internalName}.js`, icon: <FileCode className="w-3.5 h-3.5 text-amber-500" /> };
      
      return { name: 'Deleted', icon: <FileCode className="w-3.5 h-3.5 opacity-50" /> };
  };

  return (
    // Alterado: flex-1 e min-w-0 para funcionar dentro do flex container do pai
    <div className="flex-1 flex h-full overflow-x-auto custom-scrollbar-hide select-none items-end min-w-0" ref={scrollRef}>
        {openFiles.map(fileId => {
            const info = getFileInfo(fileId);
            const isActive = activeEntityId === fileId;

            return (
                <div 
                    key={fileId}
                    id={`tab-${fileId}`}
                    onClick={() => setActiveEntity(fileId)}
                    className={`
                        group flex items-center gap-2 px-3 py-2.5 min-w-[120px] max-w-[200px] border-r border-slate-200 dark:border-[#333] cursor-pointer transition-colors relative h-full
                        ${isActive ? 'bg-white dark:bg-[#1e1e1e] text-slate-900 dark:text-white font-bold' : 'bg-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-[#333]'}
                    `}
                >
                    {isActive && <div className="absolute top-0 left-0 right-0 h-0.5 bg-[#007acc]" />}
                    
                    <span className="opacity-80 shrink-0">{info.icon}</span>
                    <span className="text-[11px] truncate flex-1 leading-none pt-0.5">{info.name}</span>
                    
                    <button 
                        onClick={(e) => { e.stopPropagation(); closeFile(fileId); }}
                        className={`p-0.5 rounded-md hover:bg-slate-300 dark:hover:bg-[#444] transition-all opacity-0 group-hover:opacity-100 ${isActive ? 'opacity-100' : ''}`}
                    >
                        <X className="w-3 h-3" />
                    </button>
                </div>
            );
        })}
    </div>
  );
};

export default FileTabs;