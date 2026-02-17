import { create } from 'zustand';
import { EditorState, Workspace, ModEntity, EntityType, UserProfile } from './types';
import { v4 as uuidv4 } from 'uuid';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';
import { get, set, del } from 'idb-keyval';
import { toast } from 'sonner';

const storage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    const value = await get(name);
    return value || null;
  },
  setItem: async (name: string, value: string): Promise<void> => {
    await set(name, value);
  },
  removeItem: async (name: string): Promise<void> => {
    await del(name);
  },
};

interface EditorStore extends EditorState {
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
  importWorkspace: (ws: Workspace) => void;
  
  updateWorkspace: (id: string, data: Partial<Workspace>) => void;
  addWorkspace: (ws: Partial<Workspace>) => void;
  setActiveWorkspace: (id: string | null) => void;
  
  // --- Tab Management ---
  setActiveEntity: (id: string | null) => void;
  closeFile: (id: string) => void;
  closeAllFiles: () => void;
  // ---------------------

  addEntity: (workspaceId: string, entity: Partial<ModEntity>) => void;
  updateEntity: (workspaceId: string, entity: ModEntity) => void;
  updateEntityCode: (workspaceId: string, entityId: string, code: string) => void;
  renameEntity: (workspaceId: string, entityId: string, newName: string) => void;
  renameFolder: (workspaceId: string, type: EntityType, oldPath: string, newName: string) => void;
  moveEntity: (workspaceId: string, entityId: string, targetFolder: string) => void;
  addFolder: (workspaceId: string, type: EntityType, path: string) => void;
  updateMainJs: (workspaceId: string, code: string) => void;
  
  deleteEntity: (workspaceId: string, entityId: string) => void;
  deleteFolder: (workspaceId: string, type: EntityType, path: string) => void;

  modalAddTexture: { isOpen: boolean };
  openAddTextureModal: () => void;
  closeAddTextureModal: () => void;

  deleteConfirmation: { isOpen: boolean; type: 'entity' | 'folder'; id: string; category?: EntityType; name: string; position?: { x: number; y: number }; };
  openDeleteConfirmation: (data: Omit<EditorStore['deleteConfirmation'], 'isOpen'>) => void;
  closeDeleteConfirmation: () => void;

  renameModal: { isOpen: boolean; type: 'entity' | 'folder'; id: string; currentName: string; category?: EntityType; position?: { x: number; y: number }; };
  openRenameModal: (data: Omit<EditorStore['renameModal'], 'isOpen'>) => void;
  closeRenameModal: () => void;

  deleteWorkspace: (id: string) => void;

  moveModal: { isOpen: boolean; entityId: string | null; currentFolder: string };
  openMoveModal: (entityId: string, currentFolder: string) => void;
  closeMoveModal: () => void;

  setViewMode: (mode: 'entities' | 'files' | 'textures') => void;
  setFocusMode: (val: boolean) => void;
  setFullscreen: (val: boolean) => void;
  setSidebarOpen: (val: boolean) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setUserProfile: (profile: Partial<UserProfile>) => void;
  setGlobalSettingsOpen: (val: boolean) => void;
  setPropertiesOpen: (val: boolean) => void;
  toggleFolder: (key: string) => void;
  expandToPath: (category: EntityType, path: string) => void;
  
  openCreationModal: (initialCategory?: EntityType, folder?: string) => void;
  closeCreationModal: () => void;
  resetCreationState: () => void;
  
  modalCreateFolder: { isOpen: false, category: null, parentPath: '' };
  openCreateFolderModal: (category: EntityType, parentPath?: string) => void;
  closeCreateFolderModal: () => void;

  creationModal: { isOpen: boolean; activeCategory: EntityType; targetFolder: string; };
}

const DEFAULT_FOLDERS: Record<EntityType, string[]> = {
  [EntityType.ITEM]: ['Weapons', 'Tools', 'Accessories','Ammo', 'Armor', 'Quests', 'Consumables'],
  [EntityType.NPC]: [],
  [EntityType.PROJECTILE]: [],
  [EntityType.BUFF]: [],
  [EntityType.BIOME]: [], [EntityType.BACKGROUND]: [], [EntityType.CLOUD]: [], 
  [EntityType.GLOBAL]: [], [EntityType.MENU]: [], [EntityType.PET]: [], 
  [EntityType.SUBWORLD]: [], [EntityType.TILE]: [], [EntityType.SYSTEM]: [], [EntityType.BLANK]: []
};

const checkDuplicateEntity = (workspace: Workspace, category: EntityType, folder: string, name: string, excludeId?: string) => {
    return workspace.entities?.some(e => 
        e.category === category && 
        e.folder === folder && 
        e.internalName.toLowerCase() === name.toLowerCase() &&
        e.id !== excludeId
    ) ?? false;
};

const generateBoilerplate = (entity: Partial<ModEntity>) => ""; 

export const useEditorStore = create<EditorStore>()(
  persist(
    (set, get) => ({
      _hasHydrated: false,
      setHasHydrated: (state) => set({ _hasHydrated: state }),

      workspaces: [],
      activeWorkspaceId: null,
      activeEntityId: null,
      openFiles: [], 
      viewMode: 'entities',
      focusMode: false,
      isFullscreen: false,
      isSidebarOpen: true,
      theme: 'dark',
      userProfile: { name: 'Terraria Modder', editorFontSize: 14, wordWrap: true, autoSave: true, mobileNavHelper: true },
      isGlobalSettingsOpen: false,
      isPropertiesOpen: false,
      expandedFolders: { content: true },
      
      modalCreateFolder: { isOpen: false, category: null, parentPath: '' },
      creationModal: { isOpen: false, activeCategory: EntityType.ITEM, targetFolder: '' },
      deleteConfirmation: { isOpen: false, type: 'entity', id: '', name: '' },
      renameModal: { isOpen: false, type: 'entity', id: '', currentName: '' },
      moveModal: { isOpen: false, entityId: null, currentFolder: '' },

      importWorkspace: (ws) => set((state) => ({ 
        workspaces: [...state.workspaces, ws], 
        activeWorkspaceId: ws.id 
      })),

      updateWorkspace: (id, data) => set(state => ({
        workspaces: state.workspaces.map(ws => ws.id === id ? { ...ws, ...data, lastModified: Date.now() } : ws)
      })),

      deleteWorkspace: (id) => set((state) => ({
        workspaces: state.workspaces.filter((w) => w.id !== id)
      })),

      // --- ABAS ---
      setActiveEntity: (id) => set(state => {
          if (!id) return { activeEntityId: null };
          
          // Garante que não adiciona duplicados
          const newOpenFiles = state.openFiles.includes(id) 
            ? state.openFiles 
            : [...state.openFiles, id];
            
          return { activeEntityId: id, openFiles: newOpenFiles };
      }),

      closeFile: (id) => set(state => {
          const newOpenFiles = state.openFiles.filter(fid => fid !== id);
          
          let newActiveId = state.activeEntityId;
          if (state.activeEntityId === id) {
              const index = state.openFiles.indexOf(id);
              if (newOpenFiles.length > 0) {
                  // Tenta selecionar o anterior, senão o próximo
                  newActiveId = newOpenFiles[Math.max(0, index - 1)];
              } else {
                  newActiveId = null;
              }
          }
          
          return { openFiles: newOpenFiles, activeEntityId: newActiveId };
      }),

      closeAllFiles: () => set({ openFiles: [], activeEntityId: null }),
      // ----------

      openMoveModal: (entityId, currentFolder) => set({ moveModal: { isOpen: true, entityId, currentFolder } }),
      closeMoveModal: () => set(state => ({ moveModal: { ...state.moveModal, isOpen: false } })),
      openRenameModal: (data) => set({ renameModal: { ...data, isOpen: true } }),
      closeRenameModal: () => set(state => ({ renameModal: { ...state.renameModal, isOpen: false } })),
      openDeleteConfirmation: (data) => set({ deleteConfirmation: { ...data, isOpen: true } }),
      closeDeleteConfirmation: () => set(state => ({ deleteConfirmation: { ...state.deleteConfirmation, isOpen: false } })),

      deleteEntity: (workspaceId, entityId) => set(state => ({
        workspaces: state.workspaces.map(ws => ws.id === workspaceId ? {
          ...ws, entities: ws.entities.filter(e => e.id !== entityId)
        } : ws),
        openFiles: state.openFiles.filter(id => id !== entityId),
        activeEntityId: state.activeEntityId === entityId ? null : state.activeEntityId
      })),

      deleteFolder: (workspaceId, type, path) => set(state => ({
        workspaces: state.workspaces.map(ws => {
          if (ws.id !== workspaceId) return ws;
          return {
            ...ws,
            emptyFolders: { ...ws.emptyFolders, [type]: ws.emptyFolders[type].filter(f => f !== path && !f.startsWith(path + '/')) },
            entities: ws.entities.filter(e => {
              if (e.category !== type) return true;
              if (!e.folder) return true;
              return e.folder !== path && !e.folder.startsWith(path + '/');
            })
          };
        }),
        activeEntityId: null
      })),

      addEntity: (workspaceId, entity) => set((state) => {
    const ws = state.workspaces.find(w => w.id === workspaceId);
    if (!ws) return {};

    // FALLBACK DE SEGURANÇA: Se não vier category, usa o type. Se não vier folder, usa vazio.
    const finalCategory = entity.category || entity.type; 
    const finalFolder = entity.folder || '';

    // Verifica duplicatas com os dados sanitizados
    if (checkDuplicateEntity(ws, finalCategory!, finalFolder, entity.internalName!)) {
        toast.error(`File '${entity.internalName}' already exists.`);
        return {};
    }

        const newEntity: ModEntity = { 
          id: uuidv4(), 
          type: entity.type!, 
          category: finalCategory!, // <--- AGORA USA O VALOR GARANTIDO
          template: entity.template, 
          internalName: entity.internalName!, 
          displayName: entity.internalName!, 
          tooltip: [], 
          texture: entity.texture, 
          folder: finalFolder, 
          properties: {}, 
          hooks: {}, 
          code: entity.code || '' 
        };
          
        return { 
            workspaces: state.workspaces.map(w => w.id === workspaceId ? { 
                ...w, 
                entities: [...(w.entities || []), newEntity] 
            } : w) 
        };
      }),

      openCreationModal: (initialCategory = EntityType.ITEM, folder = '') => set({ creationModal: { isOpen: true, activeCategory: initialCategory, targetFolder: folder } }),
      closeCreationModal: () => set(state => ({ creationModal: { ...state.creationModal, isOpen: false } })),
      resetCreationState: () => set({ creationModal: { isOpen: false, activeCategory: EntityType.ITEM, targetFolder: '' } }),
      openCreateFolderModal: (category, parentPath = '') => set({ modalCreateFolder: { isOpen: true, category, parentPath } }),
      closeCreateFolderModal: () => set(state => ({ modalCreateFolder: { ...state.modalCreateFolder, isOpen: false } })),
      toggleFolder: (key) => set(state => ({ expandedFolders: { ...state.expandedFolders, [key]: !state.expandedFolders[key] } })),
      expandToPath: (category, folderPath) => set((state) => {
          const newExpanded = { ...state.expandedFolders };
          newExpanded['content'] = true;
          newExpanded[category] = true;
          if (folderPath) {
              const parts = folderPath.split('/');
              let currentPath = '';
              parts.forEach(part => {
                  currentPath = currentPath ? `${currentPath}/${part}` : part;
                  newExpanded[`folder-${category}-${currentPath}`] = true;
              });
          }
          return { expandedFolders: newExpanded };
      }),
      modalAddTexture: { isOpen: false },
      openAddTextureModal: () => set({ modalAddTexture: { isOpen: true } }),
      closeAddTextureModal: () => set({ modalAddTexture: { isOpen: false } }),
      addWorkspace: (ws) => set((state) => {
          const newId = uuidv4();

          const newWorkspace: Workspace = {
              version: 1,
              entities: [],
              emptyFolders: {
                  [EntityType.ITEM]: [], [EntityType.NPC]: [], [EntityType.PROJECTILE]: [],
                  [EntityType.BUFF]: [], [EntityType.BIOME]: [], [EntityType.BACKGROUND]: [],
                  [EntityType.CLOUD]: [], [EntityType.GLOBAL]: [], [EntityType.MENU]: [],
                  [EntityType.PET]: [], [EntityType.SUBWORLD]: [], [EntityType.TILE]: [],
                  [EntityType.SYSTEM]: [], [EntityType.BLANK]: []
              },
              manifestId: uuidv4(),
              settingsGuid: uuidv4(),
              lastModified: Date.now(),
              description: '',
              internalId: ws.name?.replace(/\s+/g, '') || 'MyMod',
              authors: [],
              name: 'New Mod',
              ...ws,
              id: newId, 
          };

          return {
              workspaces: [...state.workspaces, newWorkspace], 
              activeWorkspaceId: newId 
          };
      }),
      setActiveWorkspace: (id) => set({ activeWorkspaceId: id, activeEntityId: null, viewMode: 'entities', openFiles: [] }),
      setViewMode: (mode) => set({ viewMode: mode }),
      setFocusMode: (val) => set({ focusMode: val }),
      setFullscreen: (val) => set({ isFullscreen: val }),
      setSidebarOpen: (val) => set({ isSidebarOpen: val }),
      setTheme: (theme) => set({ theme }),
      setUserProfile: (profile) => set((state) => ({ userProfile: { ...state.userProfile, ...profile } })),
      setGlobalSettingsOpen: (val) => set({ isGlobalSettingsOpen: val }),
      setPropertiesOpen: (val) => set({ isPropertiesOpen: val }),
      addFolder: (workspaceId, type, path) => set((state) => ({ workspaces: state.workspaces.map(ws => ws.id === workspaceId ? { ...ws, emptyFolders: { ...ws.emptyFolders, [type]: [...(ws.emptyFolders[type] || []), path] } } : ws) })),
      updateMainJs: (workspaceId, code) => set((state) => ({ workspaces: state.workspaces.map(ws => ws.id === workspaceId ? { ...ws, mainJsInjection: code } : ws) })),
      updateEntityCode: (workspaceId, entityId, code) => set((state) => ({ workspaces: state.workspaces.map(ws => ws.id === workspaceId ? { ...ws, entities: ws.entities.map(e => e.id === entityId ? { ...e, code } : e) } : ws) })),
      renameEntity: (workspaceId, entityId, newName) => set((state) => ({ workspaces: state.workspaces.map(ws => ws.id === workspaceId ? { ...ws, entities: ws.entities.map(e => e.id === entityId ? { ...e, internalName: newName, displayName: newName } : e) } : ws) })),
      updateEntity: (workspaceId, entity) => set((state) => ({ workspaces: state.workspaces.map(ws => ws.id === workspaceId ? { ...ws, entities: ws.entities.map(e => e.id === entity.id ? entity : e) } : ws) })),
      moveEntity: (workspaceId, entityId, targetFolder) => set((state) => {
        const ws = state.workspaces.find(w => w.id === workspaceId);
        const entity = ws?.entities.find(e => e.id === entityId);
        if (ws && entity && checkDuplicateEntity(ws, entity.category, targetFolder, entity.internalName, entityId)) {
            toast.error(`Cannot move: '${entity.internalName}' already exists in destination.`);
            return {};
        }
        return {
            workspaces: state.workspaces.map(ws => ws.id === workspaceId ? {
            ...ws, entities: ws.entities.map(e => e.id === entityId ? { ...e, folder: targetFolder } : e)
            } : ws)
        };
      }),
      renameFolder: (workspaceId, type, oldPath, newName) => set((state) => ({ workspaces: state.workspaces })),
    }),
    {
      name: 'exmod-storage-v2',
      storage: createJSONStorage(() => storage),
      onRehydrateStorage: () => (state) => { state?.setHasHydrated(true); },
      partialize: (state) => ({ 
        workspaces: state.workspaces || [],
        activeWorkspaceId: state.activeWorkspaceId, 
        userProfile: state.userProfile, 
        theme: state.theme, 
        openFiles: state.openFiles,
        expandedFolders: state.expandedFolders // <--- AQUI ESTAVA FALTANDO
      }),
    }
  )
);

export interface EditorHandle {
  save: () => void;
  focus: () => void;
}