export enum EntityType {
  ITEM = 'ITEM',
  NPC = 'NPC',
  PROJECTILE = 'PROJECTILE',
  TILE = 'TILE',
  SYSTEM = 'SYSTEM',
  BLANK = 'BLANK',
  BUFF = 'BUFF',
  BIOME = 'BIOME',
  BACKGROUND = 'BACKGROUND',
  CLOUD = 'CLOUD',
  GLOBAL = 'GLOBAL',
  MENU = 'MENU',
  PET = 'PET',
  SUBWORLD = 'SUBWORLD'
}

export type TemplateType = 
  | 'Melee Weapon' | 'Magic Weapon' | 'Ranged Weapon' | 'Gun' | 'Yoyo' | 'Whip' | 'Pickaxe' | 'Hamaxe' | 'Drill' | 'Fishing Rod' | 'Boss Bag' | 'Boss Summon Item' | 'Buff Potion' | 'Minion Item' | 'Quest Fish' | 'Blank Item'
  | 'Minion Buff' | 'Debuff' | 'Buff' | 'Blank Buff'
  | 'Boss' | 'Town NPC' | 'Monster' | 'Blank NPC'
  | 'Blank' | string;

export enum ItemSubtype {
  MELEE = 'MELEE',
  RANGED = 'RANGED',
  MAGIC = 'MAGIC',
  SUMMON = 'SUMMON',
  TOOL = 'TOOL',
  CONSUMABLE = 'CONSUMABLE',
  ACCESSORY = 'ACCESSORY',
  AMMO = 'AMMO',
  ARMOR = 'ARMOR',
  BUFF = 'BUFF',
  QUEST = 'QUEST'
}

export interface Author {
  name: string;
  file: string;
  avatar?: string;
  icon_height: number;
  color: string;
  link: string;
}

export interface UserProfile {
  name: string;
  editorFontSize: number;
  wordWrap: boolean;
  autoSave: boolean;
  mobileNavHelper: boolean; 
}

export interface ModEntity {
  id: string;
  type: EntityType;
  category: EntityType;
  template?: TemplateType;
  subtype?: ItemSubtype | string;
  internalName: string;
  displayName: string;
  tooltip: string[];
  texture?: string;
  secondaryTexture?: string;
  folder?: string;
  properties: Record<string, any>;
  hooks: Record<string, string>;
  code: string;
  relatedProjectileName?: string;
}

export interface Workspace {
  id: string;
  name: string;
  icon?: string;
  internalId: string;
  description: string;
  version: number;
  authors: Author[];
  entities: ModEntity[];
  emptyFolders: Record<EntityType, string[]>;
  lastModified: number;
  settingsGuid: string;
  manifestId: string;
  mainJsInjection?: string;
}

export interface EditorState {
  workspaces: Workspace[];
  activeWorkspaceId: string | null;
  activeEntityId: string | null;
  // Lista de arquivos abertos (Abas)
  openFiles: string[]; 
  viewMode: 'entities' | 'files' | 'textures';
  focusMode: boolean; 
  isFullscreen: boolean;
  isSidebarOpen: boolean;
  theme: 'light' | 'dark';
  userProfile: UserProfile;
  isGlobalSettingsOpen: boolean;
  isPropertiesOpen: boolean;
  expandedFolders: Record<string, boolean>;
  
  modalCreateFolder: { isOpen: boolean; category: EntityType | null; parentPath: string };

  deleteWorkspace: (id: string) => void;
}