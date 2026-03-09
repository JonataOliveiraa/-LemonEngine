import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useEditorStore } from '../../store';
import { EntityType } from '../../types';
import { 
  Plus, ChevronDown, ChevronRight, Folder, FileCode, FileJson, X, 
  FolderPlus, Terminal, Trash2, FolderInput, Box, Globe, Image as ImageIcon, 
  FolderLock, FolderCog, Code2, Settings
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

// Arquivos do Framework TL para simular o diretório /public/framework/TL
const TL_FILES = [
    'GlobalHooks.js',
    'GlobalItem.js',
    'GlobalLoot.js',
    'GlobalNPC.js',
    'GlobalProjectile.js',
    'GlobalTile.js',
    'ModAsset.js',
    'ModBackgrounds.js',
    'ModBiome.js',
    'ModBuff.js',
    'ModCloud.js',
    'ModGore.js',
    'ModHooks.js',
    'ModImports.js',
    'ModItem.js',
    'ModLocalization.js',
    'ModMenu.js',
    'ModNPC.js',
    'ModPlayer.js',
    'ModProjectile.js',
    'ModRecipe.js',
    'ModSystem.js',
    'ModTexture.js',
    'ModTexturedType.js',
    'NPCHappiness.js',
    'NPCLoot.js',
    'NPCShop.js',
    'NPCSpawnInfo.js',
    'PlayerDB.js',
    'ProjAI.js',
    'SceneEffectPriority.js',
    'Subworld.js',
    'WorldDB.js',
    'Core/BinarySerializer.js',
    'Core/DatabaseManager.js',
    'Core/FileManager.js',
    'Core/ModLoader.js',
    'Core/Prototypes.js',
    'Enums/BiomeID.js',
    'Enums/CloudID.js',
    'Enums/DashID.js',
    'Enums/ItemRarityID.js',
    'Enums/MusicID.js',
    'Enums/NPCAIStyleID.js',
    'Enums/ProjAIStyleID.js',
    'Hooks/Chat.js',
    'Hooks/Cloud.js',
    'Hooks/GameContent.js',
    'Hooks/Item.js',
    'Hooks/Lang.js',
    'Hooks/Main.js',
    'Hooks/NPC.js',
    'Hooks/Player.js',
    'Hooks/Projectile.js',
    'Hooks/Recipe.js',
    'Hooks/Wiring.js',
    'Hooks/WorldGen.js',
    'Loaders/BackgroundLoaders.js',
    'Loaders/BiomeLoader.js',
    'Loaders/BuffLoader.js',
    'Loaders/CloudLoader.js',
    'Loaders/CombinedLoader.js',
    'Loaders/GoreLoader.js',
    'Loaders/ItemLoader.js',
    'Loaders/MenuLoader.js',
    'Loaders/NPCLoader.js',
    'Loaders/PlayerLoader.js',
    'Loaders/ProjectileLoader.js',
    'Loaders/SceneEffectLoader.js',
    'Loaders/SubworldLoader.js',
    'Loaders/SystemLoader.js',
    'Loaders/TileLoader.js',
    'Modules/Camera.js',
    'Modules/Color.js',
    'Modules/Effects.js',
    'Modules/MathHelper.js',
    'Modules/Point16.js',
    'Modules/Rand.js',
    'Modules/Rectangle.js',
    'Modules/TileData.js',
    'Modules/Vector2.js',
    'Modules/Utils/Prefix.js',
    'Modules/Utils/World.js'
];

interface TreeNode {
  name: string;
  path: string; 
  type: 'folder' | 'file';
  category?: EntityType; 
  entityId?: string;
  children: Record<string, TreeNode>;
}

const Sidebar: React.FC = () => {
  // Puxando tudo do store, incluindo o viewMode que usaremos para as abas especiais
  const { 
    workspaces, activeWorkspaceId, setActiveEntity, activeEntityId, 
    setSidebarOpen, expandedFolders, toggleFolder,
    openCreateFolderModal, openCreationModal, openDeleteConfirmation,
    moveEntity
  } = useEditorStore();
  
  const viewMode = useEditorStore(state => state.viewMode);

  const workspace = workspaces.find(w => w.id === activeWorkspaceId);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const dragTimer = useRef<NodeJS.Timeout | null>(null); 
  const [isDragging, setIsDragging] = useState(false);
  const [dragItem, setDragItem] = useState<{ id: string, name: string } | null>(null);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const [dropTarget, setDropTarget] = useState<string | null>(null);

  useEffect(() => {
    if (activeEntityId) {
      const activeEl = document.getElementById(`tree-item-${activeEntityId.replace(/[/\\.]/g, '-')}`);
      if (activeEl) activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [activeEntityId]);

  // ==========================================
  // 1. ÁRVORE DO CONTEÚDO DO USUÁRIO (CONTENT)
  // ==========================================
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

    // Inserir Pastas Vazias
    Object.entries(workspace.emptyFolders).forEach(([cat, paths]) => {
       const catFolder = CATEGORY_TO_FOLDER[cat as EntityType];
       paths.forEach(p => {
           const fullPath = catFolder ? (p ? `${catFolder}/${p}` : catFolder) : p;
           if (!fullPath) return;
           insertNode(fullPath.split('/'), { type: 'folder', category: cat as EntityType });
       });
    });

    // Inserir Entidades (Arquivos js criados pelo usuário)
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

  // ==========================================
  // 2. ÁRVORE DO FRAMEWORK (TL)
  // ==========================================
  const tlTree = useMemo(() => {
    const root: TreeNode = { name: 'root', path: '', type: 'folder', children: {} };
    const insertNode = (pathParts: string[]) => {
        let current = root;
        let pathAccumulator = 'tl'; // Prefixo "tl" para evitar colisão de pastas no estado expandedFolders

        pathParts.forEach((part, idx) => {
            const isLast = idx === pathParts.length - 1;
            pathAccumulator = `${pathAccumulator}/${part}`;

            if (!current.children[part]) {
                current.children[part] = { 
                    name: part, 
                    path: pathAccumulator, 
                    type: isLast ? 'file' : 'folder',
                    // Para arquivos TL, o entityId terá o prefixo "tl:" para o Editor.tsx identificar depois
                    entityId: isLast ? `tl:${pathParts.join('/')}` : undefined,
                    children: {} 
                };
            }
            current = current.children[part];
        });
    };

    TL_FILES.forEach(file => insertNode(file.split('/')));
    return root;
  }, []);

  // ==========================================
  // LÓGICA DE EVENTOS (Drag & Drop, Criação, Deleção)
  // ==========================================
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
          openDeleteConfirmation({ type: 'entity', id: node.entityId, name: node.name, position: clickPosition });
      } else {
          const { category, dbFolder } = getContextFromPath(node.path);
          openDeleteConfirmation({ type: 'folder', id: dbFolder, name: node.name, category: category, position: clickPosition });
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

  // ==========================================
  // MOTOR DE RENDERIZAÇÃO DA ÁRVORE (Usado para Content e TL)
  // ==========================================
  const renderTree = (node: TreeNode, isReadonly: boolean = false) => {
      const nodes = Object.values(node.children).sort((a, b) => {
          if (a.type !== b.type) return a.type === 'folder' ? -1 : 1; 
          return a.name.localeCompare(b.name);
      });

      return (
          <div className="pl-3 border-l border-slate-200 dark:border-[#333] ml-4 mt-0.5">
              {nodes.map(child => {
                  const isExpanded = expandedFolders[child.path];
                  const isDropTarget = !isReadonly && isDragging && dropTarget === child.path;
                  
                  if (child.type === 'folder') {
                      return (
                          <div key={child.path}>
                              <div 
                                  className={`flex items-center group py-1.5 pr-2 cursor-pointer rounded-lg select-none transition-colors ${isDropTarget ? 'bg-[#007acc]/20 border border-[#007acc]' : 'hover:bg-slate-100 dark:hover:bg-[#2a2d2e]'}`}
                                  onClick={() => toggleFolder(child.path)}
                                  onMouseEnter={() => !isReadonly && isDragging && setDropTarget(child.path)}
                              >
                                  <div className="mr-1 text-slate-400">
                                      {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                                  </div>
                                  <div className={`mr-1.5 ${isReadonly ? 'text-slate-400' : 'text-[#007acc]'}`}>
                                      <Folder className="w-3.5 h-3.5 fill-current" />
                                  </div>
                                  <span className={`text-xs font-medium flex-1 truncate ${isReadonly ? 'text-slate-500 dark:text-slate-400' : 'text-slate-700 dark:text-slate-300'}`}>
                                      {child.name}
                                  </span>
                                  
                                  {/* Botões de Ação Ocultos (Apenas para pastas editáveis) */}
                                  {!isReadonly && (
                                      <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity gap-0.5">
                                          {!child.category && (
                                              <button onClick={(e) => handleDelete(e, child)} className="p-1 hover:bg-rose-500/20 text-slate-400 hover:text-rose-500 rounded-md transition-colors"><Trash2 className="w-3 h-3" /></button>
                                          )}
                                          <button onClick={(e) => handleCreateFolder(e, child.path)} className="p-1 hover:bg-slate-300 dark:hover:bg-[#444] rounded-md text-slate-500 transition-colors"><FolderPlus className="w-3 h-3" /></button>
                                          <button onClick={(e) => handleCreateFile(e, child.path)} className="p-1 hover:bg-slate-300 dark:hover:bg-[#444] rounded-md text-slate-500 transition-colors"><Plus className="w-3 h-3" /></button>
                                      </div>
                                  )}
                              </div>
                              {isExpanded && renderTree(child, isReadonly)}
                          </div>
                      );
                  } else {
                      return (
                          <div 
                              key={child.path} 
                              id={`tree-item-${child.entityId?.replace(/[/\\.]/g, '-')}`}
                              className={`flex items-center group py-1.5 pl-5 pr-2 cursor-pointer rounded-lg mb-0.5 select-none transition-colors ${activeEntityId === child.entityId ? 'bg-[#007acc]/10 text-[#007acc] font-bold' : 'hover:bg-slate-100 dark:hover:bg-[#2a2d2e] text-slate-500 dark:text-slate-400'} ${isDragging && dragItem?.id === child.entityId ? 'opacity-50' : ''}`}
                              onClick={() => {
                                  if (child.entityId) {
                                      useEditorStore.setState({ viewMode: 'entities' }); // Força o painel do editor de código
                                      setActiveEntity(child.entityId);
                                  }
                              }}
                              onMouseDown={(e) => !isReadonly && child.entityId && handleMouseDown(e, child.entityId, child.name)}
                          >
                              <FileCode className={`w-3.5 h-3.5 mr-2 shrink-0 ${isReadonly ? 'opacity-40' : 'opacity-70'}`} />
                              <span className="text-xs truncate flex-1">{child.name}</span>
                              {!isReadonly && (
                                  <button onClick={(e) => handleDelete(e, child)} className="p-1 opacity-0 group-hover:opacity-100 hover:text-rose-500 rounded-md hover:bg-rose-500/10 transition-all"><Trash2 className="w-3 h-3" /></button>
                              )}
                          </div>
                      );
                  }
              })}
          </div>
      );
  };

  return (
    <div 
        className="h-full bg-slate-50 dark:bg-[#202020] flex flex-col overflow-hidden w-full border-r border-slate-200 dark:border-[#333]"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
    >
      <div className="p-4 border-b border-slate-200 dark:border-[#333] flex items-center justify-between bg-white dark:bg-[#252526] shrink-0">
        <h2 className="text-xs font-righteous text-slate-400 dark:text-slate-500 uppercase tracking-widest">Explorer</h2>
        <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-2 hover:bg-slate-100 dark:hover:bg-[#333] rounded-lg text-slate-400 transition-colors"><X className="w-5 h-5" /></button>
      </div>
      
      <div ref={scrollRef} className="flex-1 overflow-y-auto custom-scrollbar pb-20 pt-3 space-y-0.5 px-2">
        
        {/* ======================= */}
        {/* PASTA RAIZ: CONTENT     */}
        {/* ======================= */}
        <div className="group">
            <div 
                onClick={() => toggleFolder('root_content')} 
                className="flex items-center justify-between w-full px-2 py-2 rounded-lg cursor-pointer hover:bg-slate-200 dark:hover:bg-[#2a2d2e] transition-colors"
                onMouseEnter={() => isDragging && setDropTarget('')}
            >
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                    {expandedFolders.root_content ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
                    <Folder className="w-4 h-4 text-emerald-500 fill-emerald-500/20" />
                    <span className="text-xs font-bold tracking-wide">Content</span>
                </div>
                
                {/* Botões de Ação Ocultos */}
                <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={(e) => { e.stopPropagation(); openCreateFolderModal(EntityType.BLANK, ''); }} className="p-1 hover:bg-slate-300 dark:hover:bg-[#444] rounded-md text-slate-500 transition-colors" title="New Folder"><FolderPlus className="w-3.5 h-3.5" /></button>
                    <button onClick={(e) => { e.stopPropagation(); openCreationModal(EntityType.BLANK, ''); }} className="p-1 hover:bg-slate-300 dark:hover:bg-[#444] rounded-md text-slate-500 transition-colors" title="New File"><Plus className="w-3.5 h-3.5" /></button>
                </div>
            </div>
            {/* Conteúdo da Pasta Content */}
            {expandedFolders.root_content && (
                <div className="pb-2">
                    {renderTree(fileTree, false)}
                    {Object.keys(fileTree.children).length === 0 && (
                        <div className="pl-10 py-3 flex items-center gap-2 opacity-40">
                            <Box className="w-4 h-4 text-slate-400" />
                            <span className="text-[10px] font-righteous text-slate-500 uppercase tracking-widest">Empty</span>
                        </div>
                    )}
                </div>
            )}
        </div>

        {/* ======================= */}
        {/* PASTA RAIZ: LOCALIZATION*/}
        {/* ======================= */}
        <div 
            onClick={() => { useEditorStore.setState({ viewMode: 'localization' }); setActiveEntity(null); }}
            className={`flex items-center gap-3 px-2 py-2 ml-5 cursor-pointer rounded-lg transition-colors ${viewMode === 'localization' ? 'bg-[#007acc]/10 text-[#007acc] font-bold' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-[#2a2d2e]'}`}
        >
            <Globe className="w-4 h-4 text-blue-500" />
            <span className="text-xs font-bold tracking-wide">Localization</span>
        </div>

        {/* ======================= */}
        {/* PASTA RAIZ: REGISTER    */}
        {/* ======================= */}
        <div className="flex items-center gap-3 px-2 py-2 ml-5 cursor-not-allowed opacity-50 rounded-lg text-slate-500">
            <FolderLock className="w-4 h-4" />
            <span className="text-xs font-bold tracking-wide">Register</span>
        </div>

        {/* ======================= */}
        {/* PASTA RAIZ: TEXTURES    */}
        {/* ======================= */}
        <div 
            onClick={() => { useEditorStore.setState({ viewMode: 'textures' }); setActiveEntity(null); }}
            className={`flex items-center gap-3 px-2 py-2 ml-5 cursor-pointer rounded-lg transition-colors ${viewMode === 'textures' ? 'bg-[#007acc]/10 text-[#007acc] font-bold' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-[#2a2d2e]'}`}
        >
            <ImageIcon className="w-4 h-4 text-purple-500" />
            <span className="text-xs font-bold tracking-wide">Textures</span>
        </div>

        {/* ======================= */}
        {/* PASTA RAIZ: TL (READONLY)*/}
        {/* ======================= */}
        <div className="group mt-2">
            <div 
                onClick={() => toggleFolder('root_tl')} 
                className="flex items-center justify-between w-full px-2 py-2 rounded-lg cursor-pointer hover:bg-slate-200 dark:hover:bg-[#2a2d2e] transition-colors"
            >
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                    {expandedFolders.root_tl ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
                    <FolderCog className="w-4 h-4 text-rose-500 fill-rose-500/20" />
                    <span className="text-xs font-bold tracking-wide">TL</span>
                </div>
            </div>
            {/* Conteúdo da Pasta TL */}
            {expandedFolders.root_tl && (
                <div className="pb-2">
                    {renderTree(tlTree, true)}
                </div>
            )}
        </div>

        {/* ======================= */}
        {/* ARQUIVO RAIZ: main.js   */}
        {/* ======================= */}
        <div 
            onClick={() => { useEditorStore.setState({ viewMode: 'entities' }); setActiveEntity('main'); }}
            className={`flex items-center gap-3 px-2 py-2 ml-5 cursor-pointer rounded-lg transition-colors mt-2 ${activeEntityId === 'main' ? 'bg-[#007acc]/10 text-[#007acc] font-bold' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-[#2a2d2e]'}`}
        >
            <Code2 className="w-4 h-4 text-[#f7ff00]" />
            <span className="text-xs font-bold tracking-wide">main.js</span>
        </div>

        {/* ======================= */}
        {/* SEÇÃO DO SISTEMA        */}
        {/* ======================= */}
        <div className="mt-8 mb-2">
          <div className="px-4 py-2 text-[10px] text-slate-400 font-righteous uppercase tracking-widest border-b border-slate-200 dark:border-[#333]/50 mb-2">
              System
          </div>
          <div 
              onClick={() => { useEditorStore.setState({ viewMode: 'entities' }); setActiveEntity('settings'); }}
              className={`flex items-center gap-3 px-4 py-2 mx-2 cursor-pointer rounded-lg transition-colors ${activeEntityId === 'settings' ? 'bg-[#007acc]/10 text-[#007acc] font-bold' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-[#2a2d2e]'}`}
          >
              <Settings className="w-4 h-4 text-slate-500" />
              <span className="text-xs font-bold tracking-wide">Settings.json</span>
          </div>
        </div>

      </div>

      {/* FLOAT DE DRAG & DROP */}
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