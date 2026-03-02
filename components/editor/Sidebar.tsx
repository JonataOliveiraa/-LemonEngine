import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useEditorStore } from '../../store';
import { EntityType } from '../../types';
import { 
  Plus, ChevronDown, ChevronRight, Folder, FileCode, FileJson, X, FolderPlus, Terminal, Trash2, FolderInput, Box
} from 'lucide-react';
import { toast } from 'sonner';

// Mapeamento: Categoria -> Nome da Pasta Visual
const CATEGORY_TO_FOLDER: Record<string, string> = {
  [EntityType.ITEM]: 'Items',
  [EntityType.NPC]: 'NPCs',
  [EntityType.PROJECTILE]: 'Projectiles',
  [EntityType.BUFF]: 'Buffs',
  [EntityType.BIOME]: 'Biomes',
  [EntityType.BACKGROUND]: 'Backgrounds',
  [EntityType.CLOUD]: 'Clouds',
  [EntityType.GLOBAL]: 'Global',
  [EntityType.MENU]: 'Menus',
  [EntityType.SUBWORLD]: 'Subworlds',
  [EntityType.TILE]: 'Tiles',
  [EntityType.SYSTEM]: 'Systems',
  [EntityType.PET]: 'Pets',
  [EntityType.BLANK]: '' 
};

interface TreeNode {
  name: string;
  path: string; 
  type: 'folder' | 'file';
  category?: EntityType; 
  entityId?: string;
  children: Record<string, TreeNode>;
}

const Sidebar: React.FC = () => {
  const { 
    workspaces, activeWorkspaceId, setActiveEntity, activeEntityId, 
    setSidebarOpen, expandedFolders, toggleFolder,
    openCreateFolderModal, openCreationModal, openDeleteConfirmation,
    openRenameModal, moveEntity
  } = useEditorStore();

  const workspace = workspaces.find(w => w.id === activeWorkspaceId);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const dragTimer = useRef<NodeJS.Timeout | null>(null); 
  const [isDragging, setIsDragging] = useState(false);
  const [dragItem, setDragItem] = useState<{ id: string, name: string } | null>(null);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const [dropTarget, setDropTarget] = useState<string | null>(null);

  useEffect(() => {
    if (activeEntityId) {
      const activeEl = document.getElementById(`tree-item-${activeEntityId}`);
      if (activeEl) activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [activeEntityId]);

  const fileTree = useMemo(() => {
    const root: TreeNode = { name: 'root', path: '', type: 'folder', children: {} };
    if (!workspace) return root;

    const insertNode = (pathParts: string[], nodeData: Partial<TreeNode>) => {
        let current = root;
        let pathAccumulator = '';

        pathParts.forEach((part, idx) => {
            const isLast = idx === pathParts.length - 1;
            pathAccumulator = pathAccumulator ? `${pathAccumulator}/${part}` : part;

            if (!current.children[part]) {
                current.children[part] = { 
                    name: part, 
                    path: pathAccumulator, 
                    type: 'folder',
                    children: {} 
                };
            }

            if (isLast && nodeData.type === 'file') {
                current.children[part] = { 
                    ...current.children[part], 
                    ...nodeData,
                    name: part, 
                    path: pathAccumulator 
                } as TreeNode;
            } else {
                current = current.children[part];
            }
        });
        return current;
    };

    // 1. Inserir Pastas Vazias
    Object.entries(workspace.emptyFolders).forEach(([cat, paths]) => {
       const catFolder = CATEGORY_TO_FOLDER[cat as EntityType];
       paths.forEach(p => {
           const fullPath = catFolder ? (p ? `${catFolder}/${p}` : catFolder) : p;
           if (!fullPath) return;
           insertNode(fullPath.split('/'), { type: 'folder', category: cat as EntityType });
       });
    });

    // 2. Inserir Entidades
    workspace.entities.forEach(entity => {
        const catFolder = CATEGORY_TO_FOLDER[entity.category];
        let pathParts: string[] = [];
        if (catFolder) pathParts.push(catFolder);
        if (entity.folder) pathParts.push(...entity.folder.split('/'));
        pathParts.push(`${entity.internalName}.js`);

        insertNode(pathParts, { 
            type: 'file', 
            entityId: entity.id, 
            category: entity.category 
        });
    });

    return root;
  }, [workspace]);

  const getContextFromPath = (path: string) => {
      const rootFolder = path.split('/')[0];
      const systemCategory = Object.entries(CATEGORY_TO_FOLDER).find(([_, v]) => v && v === rootFolder)?.[0] as EntityType | undefined;
      const category = systemCategory || EntityType.BLANK;
      let dbFolder = path;

      if (systemCategory) {
          dbFolder = path.replace(rootFolder, '').replace(/^\//, '');
      }

      return { category, dbFolder, isSystemRoot: !!systemCategory && path === rootFolder };
  };

  const handleCreateFile = (e: React.MouseEvent, path: string) => {
      e.stopPropagation();
      const { category, dbFolder } = getContextFromPath(path);
      openCreationModal(category, dbFolder);
  };

  const handleCreateFolder = (e: React.MouseEvent, path: string) => {
      e.stopPropagation();
      const { category, dbFolder } = getContextFromPath(path);
      openCreateFolderModal(category, dbFolder);
  };

  const handleDelete = (e: React.MouseEvent, node: TreeNode) => {
      e.stopPropagation();
      
      const clickPosition = { x: e.clientX, y: e.clientY };

      if (node.type === 'file' && node.entityId) {
          openDeleteConfirmation({ 
              type: 'entity', 
              id: node.entityId, 
              name: node.name,
              position: clickPosition 
          });
      } else {
          const { category, dbFolder, isSystemRoot } = getContextFromPath(node.path);
          
          if (isSystemRoot) {
              toast.error("Cannot delete system root folders.");
              return;
          }
          
          openDeleteConfirmation({ 
              type: 'folder', 
              id: dbFolder, 
              name: node.name, 
              category: category,
              position: clickPosition 
          });
      }
  };

  const handleMouseDown = (e: React.MouseEvent, id: string, name: string) => {
    if (e.button !== 0) return;
    dragTimer.current = setTimeout(() => { setIsDragging(true); setDragItem({ id, name }); }, 300);
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (dragTimer.current && !isDragging) { clearTimeout(dragTimer.current); dragTimer.current = null; }
    if (isDragging) setDragPosition({ x: e.clientX, y: e.clientY });
  };
  const handleMouseUp = () => {
    if (dragTimer.current) clearTimeout(dragTimer.current);
    if (isDragging && dragItem && dropTarget && activeWorkspaceId) {
        const { dbFolder } = getContextFromPath(dropTarget);
        moveEntity(activeWorkspaceId, dragItem.id, dbFolder);
        toast.success(`Moved to /${dbFolder || 'Root'}`);
    }
    setIsDragging(false); setDragItem(null); setDropTarget(null);
  };

  const renderTree = (node: TreeNode) => {
      const nodes = Object.values(node.children).sort((a, b) => {
          if (a.type !== b.type) return a.type === 'folder' ? -1 : 1; 
          return a.name.localeCompare(b.name);
      });

      return (
          <div className="pl-3 border-l border-slate-200 dark:border-[#333] ml-1.5 mt-0.5">
              {nodes.map(child => {
                  const isExpanded = expandedFolders[child.path];
                  const isDropTarget = isDragging && dropTarget === child.path;
                  
                  if (child.type === 'folder') {
                      return (
                          <div key={child.path}>
                              <div 
                                  className={`flex items-center group py-1.5 pr-2 cursor-pointer rounded-lg select-none transition-colors ${isDropTarget ? 'bg-[#007acc]/20 border border-[#007acc]' : 'hover:bg-slate-100 dark:hover:bg-[#2a2d2e]'}`}
                                  onClick={() => toggleFolder(child.path)}
                                  onMouseEnter={() => isDragging && setDropTarget(child.path)}
                              >
                                  <div className="mr-1 text-slate-400">
                                      {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                                  </div>
                                  <div className="mr-1.5 text-[#007acc]">
                                      <Folder className="w-3.5 h-3.5 fill-current" />
                                  </div>
                                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300 flex-1 truncate">
                                      {child.name}
                                  </span>
                                  
                                  <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity gap-0.5">
                                      {!child.category && (
                                          <button onClick={(e) => handleDelete(e, child)} className="p-1 hover:bg-rose-500/20 text-slate-400 hover:text-rose-500 rounded-md transition-colors"><Trash2 className="w-3 h-3" /></button>
                                      )}
                                      <button onClick={(e) => handleCreateFolder(e, child.path)} className="p-1 hover:bg-slate-300 dark:hover:bg-[#444] rounded-md text-slate-500 transition-colors"><FolderPlus className="w-3 h-3" /></button>
                                      <button onClick={(e) => handleCreateFile(e, child.path)} className="p-1 hover:bg-slate-300 dark:hover:bg-[#444] rounded-md text-slate-500 transition-colors"><Plus className="w-3 h-3" /></button>
                                  </div>
                              </div>
                              {isExpanded && renderTree(child)}
                          </div>
                      );
                  } else {
                      return (
                          <div 
                              key={child.path} 
                              id={`tree-item-${child.entityId}`}
                              className={`flex items-center group py-1.5 pl-5 pr-2 cursor-pointer rounded-lg mb-0.5 select-none transition-colors ${activeEntityId === child.entityId ? 'bg-[#007acc]/10 text-[#007acc] font-bold' : 'hover:bg-slate-100 dark:hover:bg-[#2a2d2e] text-slate-500 dark:text-slate-400'} ${isDragging && dragItem?.id === child.entityId ? 'opacity-50' : ''}`}
                              onClick={() => child.entityId && setActiveEntity(child.entityId)}
                              onMouseDown={(e) => child.entityId && handleMouseDown(e, child.entityId, child.name)}
                          >
                              <FileCode className="w-3.5 h-3.5 mr-2 shrink-0 opacity-70" />
                              <span className="text-xs truncate flex-1">{child.name}</span>
                              <button onClick={(e) => handleDelete(e, child)} className="p-1 opacity-0 group-hover:opacity-100 hover:text-rose-500 rounded-md hover:bg-rose-500/10 transition-all"><Trash2 className="w-3 h-3" /></button>
                          </div>
                      );
                  }
              })}
          </div>
      );
  };

  return (
    <div 
        className="h-full bg-slate-50 dark:bg-[#252526] flex flex-col overflow-hidden w-full border-r border-slate-200 dark:border-[#333]"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
    >
      <div className="p-4 border-b border-slate-200 dark:border-[#333] flex items-center justify-between bg-white dark:bg-[#252526] shrink-0">
        <h2 className="text-xs font-righteous text-slate-400 dark:text-slate-500 uppercase tracking-widest">Explorer</h2>
        <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-2 hover:bg-slate-100 dark:hover:bg-[#333] rounded-lg text-slate-400 transition-colors"><X className="w-5 h-5" /></button>
      </div>
      
      <div ref={scrollRef} className="flex-1 overflow-y-auto custom-scrollbar pb-20">
        <div 
            onClick={() => toggleFolder('content')} 
            className="flex items-center justify-between w-full px-4 py-2.5 bg-slate-200 dark:bg-[#333333] cursor-pointer sticky top-0 z-10 border-b border-slate-300 dark:border-[#444] group mt-0 transition-colors"
            onMouseEnter={() => isDragging && setDropTarget('')}
        >
            <div className="flex items-center">
                {expandedFolders.content ? <ChevronDown className="w-3.5 h-3.5 mr-2 text-slate-500" /> : <ChevronRight className="w-3.5 h-3.5 mr-2 text-slate-500" />}
                <span className="text-xs font-righteous uppercase tracking-widest text-slate-700 dark:text-slate-200">Mod Content</span>
            </div>
            
            <div className="flex items-center gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
               <button 
                  onClick={(e) => { e.stopPropagation(); openCreateFolderModal(EntityType.BLANK, ''); }} 
                  className="p-1.5 hover:bg-slate-300 dark:hover:bg-[#444] rounded-md text-slate-600 dark:text-slate-300 transition-colors"
                  title="New Folder (Root)"
               >
                  <FolderPlus className="w-3.5 h-3.5" />
               </button>
               <button 
                  onClick={(e) => { e.stopPropagation(); openCreationModal(EntityType.BLANK, ''); }} 
                  className="p-1.5 hover:bg-slate-300 dark:hover:bg-[#444] rounded-md text-slate-600 dark:text-slate-300 transition-colors"
                  title="New File (Root)"
               >
                  <Plus className="w-3.5 h-3.5" />
               </button>
            </div>
        </div>

        {expandedFolders.content && (
            <div className="py-2 pr-2">
                {renderTree(fileTree)}
                {/* MENSAGEM SE ESTIVER VAZIO */}
                {Object.keys(fileTree.children).length === 0 && (
                    <div className="px-6 py-6 text-center opacity-40">
                        <Box className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                        <p className="text-[10px] font-righteous text-slate-500 uppercase tracking-widest">Empty Content</p>
                    </div>
                )}
            </div>
        )}

        <div className="mt-4">
          <div className="flex items-center w-full px-4 py-2.5 text-xs text-slate-400 font-righteous uppercase tracking-widest border-b border-slate-200 dark:border-[#333] mb-1">System</div>
          <button onClick={() => setActiveEntity('main')} className={`w-full flex items-center gap-2 px-4 py-2 text-[11px] transition-colors rounded-none ${activeEntityId === 'main' ? 'bg-[#007acc]/10 text-[#007acc] font-bold border-r-2 border-[#007acc]' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-[#2a2d2e] border-r-2 border-transparent'}`}>
              <Terminal className="w-3.5 h-3.5" /> main.js
          </button>
          <button onClick={() => setActiveEntity('settings')} className={`w-full flex items-center gap-2 px-4 py-2 text-[11px] transition-colors rounded-none ${activeEntityId === 'settings' ? 'bg-[#007acc]/10 text-[#007acc] font-bold border-r-2 border-[#007acc]' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-[#2a2d2e] border-r-2 border-transparent'}`}>
              <FileJson className="w-3.5 h-3.5" /> Settings.json
          </button>
        </div>
      </div>

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