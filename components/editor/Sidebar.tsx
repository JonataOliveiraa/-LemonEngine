import React, { useEffect, useRef, useState } from 'react';
import { useEditorStore } from '../../store';
import { EntityType } from '../../types';
import { 
  Plus, ChevronDown, ChevronRight, Folder, FileCode, FileJson, X, Box, Ghost, Target, Zap, Compass, Palette, Cloud, Globe, Layout, Layers, FolderPlus, Terminal, Trash2, FolderInput
} from 'lucide-react';
import { toast } from 'sonner';

const CATEGORIES_LIST = [
  { id: EntityType.ITEM, label: 'Items', icon: <Box className="w-4 h-4" /> },
  { id: EntityType.NPC, label: 'NPCs', icon: <Ghost className="w-4 h-4" /> },
  { id: EntityType.PROJECTILE, label: 'Projectiles', icon: <Target className="w-4 h-4" /> },
  { id: EntityType.BUFF, label: 'Buffs', icon: <Zap className="w-4 h-4" /> },
  { id: EntityType.BIOME, label: 'Biomes', icon: <Compass className="w-4 h-4" /> },
  { id: EntityType.BACKGROUND, label: 'Backgrounds', icon: <Palette className="w-4 h-4" /> },
  { id: EntityType.CLOUD, label: 'Clouds', icon: <Cloud className="w-4 h-4" /> },
  { id: EntityType.GLOBAL, label: 'Global', icon: <Globe className="w-4 h-4" /> },
  { id: EntityType.MENU, label: 'Menus', icon: <Layout className="w-4 h-4" /> },
  { id: EntityType.SUBWORLD, label: 'Subworlds', icon: <Layers className="w-4 h-4" /> },
];

const Sidebar: React.FC = () => {
  const { 
    workspaces, activeWorkspaceId, setActiveEntity, activeEntityId, 
    setSidebarOpen, expandedFolders, toggleFolder,
    openCreateFolderModal, openCreationModal, openDeleteConfirmation,
    openRenameModal, moveEntity
  } = useEditorStore();

  const workspace = workspaces.find(w => w.id === activeWorkspaceId);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // -- ESTADOS PARA GESTOS --
  const longPressTimer = useRef<NodeJS.Timeout | null>(null); 
  const dragTimer = useRef<NodeJS.Timeout | null>(null); 
  
  const [isDragging, setIsDragging] = useState(false);
  const [dragItem, setDragItem] = useState<{ id: string, name: string, category: EntityType } | null>(null);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const [dropTarget, setDropTarget] = useState<{ path: string, category: EntityType } | null>(null);

  useEffect(() => {
    if (activeEntityId) {
      const activeEl = document.getElementById(`tree-item-${activeEntityId}`);
      if (activeEl) activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [activeEntityId]);

  // --- AUTO SCROLL LOGIC ---
  useEffect(() => {
    if (!isDragging) return;
    const interval = setInterval(() => {
        if (!scrollRef.current) return;
        const { top, bottom } = scrollRef.current.getBoundingClientRect();
        const y = dragPosition.y;
        if (y < top + 50) scrollRef.current.scrollTop -= 10;
        else if (y > bottom - 50) scrollRef.current.scrollTop += 10;
    }, 20);
    return () => clearInterval(interval);
  }, [isDragging, dragPosition.y]);

  const handleCreateClick = (e: React.MouseEvent, category: EntityType, path: string = '') => {
    e.stopPropagation();
    openCreationModal(category, path);
  };

  const handleDeleteClick = (e: React.MouseEvent, type: 'entity' | 'folder', id: string, name: string, category?: EntityType) => {
    e.stopPropagation();
    openDeleteConfirmation({ type, id, name, category, position: { x: e.clientX, y: e.clientY } });
  };

  // --- RENAME HANDLERS ---
  const triggerRename = (type: 'entity' | 'folder', id: string, name: string, category?: EntityType, x?: number, y?: number) => {
    openRenameModal({ type, id, currentName: name, category, position: x && y ? { x, y } : undefined });
  };

  const handleDoubleClick = (e: React.MouseEvent, type: 'entity' | 'folder', id: string, name: string, category?: EntityType) => {
    e.stopPropagation();
    triggerRename(type, id, name, category, e.clientX, e.clientY);
  };

  const handleTouchStartRename = (type: 'entity' | 'folder', id: string, name: string, category?: EntityType) => {
    longPressTimer.current = setTimeout(() => triggerRename(type, id, name, category), 2000);
  };

  const handleTouchEndRename = () => {
    if (longPressTimer.current) { clearTimeout(longPressTimer.current); longPressTimer.current = null; }
  };

  // --- DRAG AND DROP HANDLERS (DESKTOP) ---
  const handleMouseDown = (e: React.MouseEvent, id: string, name: string, category: EntityType) => {
    if (e.button !== 0) return;
    e.persist();
    dragTimer.current = setTimeout(() => {
        setIsDragging(true);
        setDragItem({ id, name, category });
    }, 350); 
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (dragTimer.current && !isDragging) {
        clearTimeout(dragTimer.current);
        dragTimer.current = null;
    }
    if (isDragging) {
        setDragPosition({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    if (dragTimer.current) { clearTimeout(dragTimer.current); dragTimer.current = null; }
    
    if (isDragging && dragItem && dropTarget && activeWorkspaceId) {
        if (dropTarget.category === dragItem.category) {
            moveEntity(activeWorkspaceId, dragItem.id, dropTarget.path);
            toast.success(`Moved to /${dropTarget.path || 'Root'}`);
        }
    }
    
    setIsDragging(false);
    setDragItem(null);
    setDropTarget(null);
  };

  const handleDragOverFolder = (path: string, category: EntityType) => {
    if (isDragging && dragItem && dragItem.category === category) {
        setDropTarget({ path, category });
    }
  };

  const renderFolderStructure = (category: EntityType, currentPath: string = '') => {
    // BLINDAGEM CONTRA UNDEFINED
    const entities = workspace?.entities || [];
    // Acesso seguro a emptyFolders com fallback duplo
    const emptyFoldersList = workspace?.emptyFolders?.[category] || [];

    const inCurrentFolder = entities.filter(e => e.category === category && (e.folder || '') === currentPath);
    
    const subfolders = Array.from(new Set<string>([
      // Pastas derivadas de entidades existentes
      ...(entities
          .filter(e => e.category === category && e.folder?.startsWith(currentPath ? currentPath + '/' : ''))
          .map(e => (currentPath ? e.folder!.replace(currentPath + '/', '') : e.folder!).split('/')[0])
          .filter(Boolean)
      ),
      // Pastas vazias explícitas
      ...(emptyFoldersList
        .filter(f => currentPath === '' ? !f.includes('/') : f.startsWith(currentPath + '/') && f.replace(currentPath + '/', '').split('/').length === 1)
        .map(f => currentPath === '' ? f : f.replace(currentPath + '/', ''))
      )
    ])).sort();

    return (
      <div className="space-y-0.5">
        {subfolders.map(folderName => {
          const fullPath = currentPath ? `${currentPath}/${folderName}` : folderName;
          const folderKey = `folder-${category}-${fullPath}`;
          const isExpanded = expandedFolders[folderKey];
          const isDropTarget = isDragging && dropTarget?.path === fullPath;

          return (
            <div key={fullPath}>
              <div 
                className={`flex items-center w-full top-0 px-2 py-1.5 md:py-1 cursor-pointer group transition-colors select-none touch-manipulation ${isDropTarget ? 'bg-[#007acc]/20 border-2 border-[#007acc]' : 'hover:bg-slate-200 dark:hover:bg-[#2a2d2e]'}`}
                onClick={() => toggleFolder(folderKey)}
                onDoubleClick={(e) => handleDoubleClick(e, 'folder', fullPath, folderName, category)}
                onTouchStart={() => handleTouchStartRename('folder', fullPath, folderName, category)}
                onTouchEnd={handleTouchEndRename}
                onTouchMove={handleTouchEndRename}
                onMouseEnter={() => handleDragOverFolder(fullPath, category)}
              >
                <div className="flex items-center gap-1.5 flex-1 min-w-0">
                  {isExpanded ? <ChevronDown className="w-3 h-3 text-slate-400" /> : <ChevronRight className="w-3 h-3 text-slate-400" />}
                  <Folder className={`w-3.5 h-3.5 ${isDropTarget ? 'text-[#007acc]' : 'text-slate-400 dark:text-slate-500'} shrink-0`} />
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate font-medium">{folderName}</span>
                </div>
                {/* Ações */}
                <div className="flex items-center gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity pr-1">
                  <button onClick={(e) => handleDeleteClick(e, 'folder', fullPath, folderName, category)} className="p-1 hover:bg-rose-100 dark:hover:bg-rose-900/30 rounded text-slate-400 hover:text-rose-500 transition-colors"><Trash2 className="w-3 h-3" /></button>
                  <button onClick={e => { e.stopPropagation(); openCreateFolderModal(category, fullPath); }} className="p-1 hover:bg-slate-300 dark:hover:bg-[#37373d] rounded text-slate-500"><FolderPlus className="w-3 h-3" /></button>
                  <button onClick={(e) => handleCreateClick(e, category, fullPath)} className="p-1 hover:bg-slate-300 dark:hover:bg-[#37373d] rounded text-slate-500"><Plus className="w-3 h-3" /></button>
                </div>
              </div>
              {isExpanded && <div className="ml-3 border-l border-slate-200 dark:border-[#333] mb-1">{renderFolderStructure(category, fullPath)}</div>}
            </div>
          );
        })}
        
        {inCurrentFolder.map(e => (
          <div key={e.id} className="relative group/item select-none touch-manipulation">
              <button 
                id={`tree-item-${e.id}`}
                onClick={() => { setActiveEntity(e.id); if (window.innerWidth < 1024) setSidebarOpen(false); }}
                onDoubleClick={(ev) => handleDoubleClick(ev, 'entity', e.id, e.internalName)}
                onTouchStart={() => handleTouchStartRename('entity', e.id, e.internalName)}
                onTouchEnd={handleTouchEndRename}
                onTouchMove={handleTouchEndRename}
                onMouseDown={(ev) => handleMouseDown(ev, e.id, e.internalName, category)}
                className={`w-full flex items-center gap-2 px-4 py-2 md:py-1 transition-colors text-left ${activeEntityId === e.id ? 'bg-slate-300 dark:bg-[#37373d] text-slate-900 dark:text-white font-bold' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-[#2a2d2e]'} ${isDragging && dragItem?.id === e.id ? 'opacity-50' : ''}`}
              >
                <FileCode className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span className="truncate text-[11px] flex-1">{e.internalName}.js</span>
              </button>
              <button 
                onClick={(ev) => handleDeleteClick(ev, 'entity', e.id, e.internalName)}
                className="absolute right-1 top-1/2 -translate-y-1/2 p-1 hover:bg-rose-100 dark:hover:bg-rose-900/30 rounded text-slate-400 hover:text-rose-500 transition-colors opacity-100 lg:opacity-0 lg:group-hover/item:opacity-100"
              >
                  <Trash2 className="w-3 h-3" />
              </button>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div 
        className="h-full bg-slate-50 dark:bg-[#252526] flex flex-col overflow-hidden select-none w-full"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
    >
      <div className="p-4 border-b border-slate-200 dark:border-[#333] flex items-center justify-between bg-white dark:bg-[#252526] shrink-0">
        <h2 className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Explorer</h2>
        <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-2 text-slate-400 hover:text-slate-900"><X className="w-5 h-5" /></button>
      </div>
      
      <div ref={scrollRef} className="flex-1 overflow-y-auto custom-scrollbar">
        <div onClick={() => toggleFolder('content')} className="flex items-center w-full px-4 py-3 md:py-2 text-[10px] text-slate-600 dark:text-slate-300 font-bold uppercase tracking-wider bg-slate-200 dark:bg-[#333333] cursor-pointer sticky top-0 z-10 transition-colors">
          {expandedFolders.content ? <ChevronDown className="w-3.5 h-3.5 mr-2" /> : <ChevronRight className="w-3.5 h-3.5 mr-2" />}
          MOD CONTENT
        </div>
        {expandedFolders.content && (
          <div className="pt-1">
            {CATEGORIES_LIST.map(cat => (
              <div key={cat.id}>
                <div 
                    className={`flex items-center w-full px-3 py-2 md:py-1.5 cursor-pointer group transition-colors ${isDragging && dropTarget?.category === cat.id && dropTarget?.path === '' ? 'bg-[#007acc]/20 border-l-2 border-[#007acc]' : 'hover:bg-slate-200 dark:hover:bg-[#2a2d2e]'}`} 
                    onClick={() => toggleFolder(cat.id)}
                    onMouseEnter={() => handleDragOverFolder('', cat.id)} // Root drop
                >
                  {expandedFolders[cat.id] ? <ChevronDown className="w-3.5 h-3.5 text-slate-400 mr-2" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400 mr-2" />}
                  <div className="text-slate-400 mr-2">{cat.icon}</div>
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex-1 uppercase tracking-tight">{cat.label}</span>
                  <div className="flex items-center gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                    <button onClick={e => { e.stopPropagation(); openCreateFolderModal(cat.id); }} className="p-1 hover:bg-slate-300 dark:hover:bg-[#37373d] rounded text-slate-500"><FolderPlus className="w-3.5 h-3.5" /></button>
                    <button onClick={(e) => handleCreateClick(e, cat.id, '')} className="p-1 hover:bg-slate-300 dark:hover:bg-[#37373d] rounded text-slate-500"><Plus className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
                {expandedFolders[cat.id] && <div className="ml-2 border-l border-slate-200 dark:border-[#333] mb-2">{renderFolderStructure(cat.id)}</div>}
              </div>
            ))}
          </div>
        )}
        <div className="mt-4 pb-12">
          {/* ... Root System (main.js, settings) ... */}
          <div className="flex items-center w-full px-4 py-3 md:py-2 text-[10px] text-slate-600 dark:text-slate-300 font-bold uppercase tracking-wider bg-slate-200 dark:bg-[#333333] cursor-pointer sticky top-0 z-10">ROOT SYSTEM</div>
          <button id="tree-item-main" onClick={() => { setActiveEntity('main'); if(window.innerWidth < 1024) setSidebarOpen(false); }} className={`w-full flex items-center gap-2 px-4 py-3 md:py-2 text-[11px] transition-all ${activeEntityId === 'main' ? 'bg-[#007acc] text-white font-bold' : 'text-slate-400 hover:bg-slate-200 dark:hover:bg-[#2a2d2e]'}`}><Terminal className="w-3.5 h-3.5 text-rose-500" /> main.js</button>
          <button id="tree-item-settings" onClick={() => { setActiveEntity('settings'); if(window.innerWidth < 1024) setSidebarOpen(false); }} className={`w-full flex items-center gap-2 px-4 py-3 md:py-2 text-[11px] transition-all ${activeEntityId === 'settings' ? 'bg-[#007acc] text-white font-bold' : 'text-slate-400 hover:bg-slate-200 dark:hover:bg-[#2a2d2e]'}`}><FileJson className="w-3.5 h-3.5 text-blue-500" /> Settings.json</button>
        </div>
      </div>

      {/* DRAG GHOST IMAGE */}
      {isDragging && dragItem && (
          <div 
            className="fixed pointer-events-none bg-[#007acc] text-white px-3 py-2 rounded-lg shadow-2xl z-[9999] text-xs font-bold flex items-center gap-2"
            style={{ left: dragPosition.x + 10, top: dragPosition.y + 10 }}
          >
              <FolderInput className="w-4 h-4" />
              Moving {dragItem.name}
          </div>
      )}
    </div>
  );
};

export default Sidebar;