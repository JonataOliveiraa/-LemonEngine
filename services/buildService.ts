import JSZip from 'jszip';
import { Workspace, EntityType } from '../types';
import { toast } from 'sonner';

const FRAMEWORK_FILES = [
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

// --- CONFIGURAÇÃO DE REGISTRO ---
const REGISTER_CONFIG: Record<string, { file: string, wrapper: string, class: string }> = {
  [EntityType.ITEM]: { file: 'RegisterItems.js', wrapper: 'ModItem', class: 'ModItem' },
  [EntityType.NPC]: { file: 'RegisterNPCs.js', wrapper: 'ModNPC', class: 'ModNPC' },
  [EntityType.PROJECTILE]: { file: 'RegisterProjectiles.js', wrapper: 'ModProjectile', class: 'ModProjectile' },
  [EntityType.BUFF]: { file: 'RegisterBuffs.js', wrapper: 'ModBuff', class: 'ModBuff' },
  [EntityType.BIOME]: { file: 'RegisterBiomes.js', wrapper: 'ModBiome', class: 'ModBiome' },
  [EntityType.BACKGROUND]: { file: 'RegisterBackgrounds.js', wrapper: 'ModBackground', class: 'ModBackground' },
  [EntityType.CLOUD]: { file: 'RegisterClouds.js', wrapper: 'ModCloud', class: 'ModCloud' },
  [EntityType.MENU]: { file: 'RegisterMenus.js', wrapper: 'ModMenu', class: 'ModMenu' },
  [EntityType.SUBWORLD]: { file: 'RegisterSubworlds.js', wrapper: 'ModSubworld', class: 'ModSubworld' },
  [EntityType.SYSTEM]: { file: 'RegisterSystems.js', wrapper: 'ModSystem', class: 'ModSystem' },
};

// --- HELPER: Conversão de Base64 ---
const base64ToUint8Array = (base64: string) => {
  try {
    const cleanBase64 = base64.includes(',') ? base64.split(',')[1] : base64;
    const binaryString = atob(cleanBase64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  } catch (e) {
    console.error("Error converting base64", e);
    return new Uint8Array(0);
  }
};

// --- HELPER: Formatação de Categoria ---
const getFolderFromCategory = (cat: EntityType) => {
    if (!cat) return 'Unknown';
    
    // CORREÇÃO: NPCs deve ser maiúsculo
    if (cat === EntityType.NPC) return 'NPCs';
    
    // Padrão para os outros (Item -> Items, Projectile -> Projectiles)
    const lower = cat.toLowerCase();
    return lower.charAt(0).toUpperCase() + lower.slice(1) + 's';
};

// --- FUNÇÃO PARA COPIAR O FRAMEWORK ---
const addFrameworkFiles = async (tlFolder: JSZip) => {
    const promises = FRAMEWORK_FILES.map(async (filePath) => {
        try {
            const response = await fetch(`/framework/TL/${filePath}?t=${Date.now()}`);
            if (!response.ok) throw new Error(`HTTP Error ${response.status}`);
            
            const content = await response.text();

            // Proteção contra fallback HTML (404)
            if (content.trim().startsWith('<!DOCTYPE') || content.trim().startsWith('<html')) {
                throw new Error("File not found (Server returned HTML fallback)");
            }
            
            tlFolder.file(filePath, content);
        } catch (error) {
            console.warn(`Could not load framework file: ${filePath}. Reason: ${error}`);
            tlFolder.file(filePath, `// [BUILD ERROR] Missing Framework File: ${filePath}\n// Ensure the file exists in /public/framework/TL/`);
        }
    });
    await Promise.all(promises);
};

// --- MAIN BUILD FUNCTION ---
export const buildMod = async (workspace: Workspace) => {
  const zip = new JSZip();

  // 1. ROOT FILES
  if (workspace.icon) {
    const iconData = base64ToUint8Array(workspace.icon);
    zip.file("Icon.png", iconData);
    zip.folder("Previews")?.file("0.png", iconData);
  }

  // Authors
  const authorsZipFolder = zip.folder("Authors");
  const processedAuthors = workspace.authors.map((author, index) => {
    let fileName = "";
    if (author.file && author.file.length > 0) {
       if (author.file.startsWith('data:')) {
           const avatarData = base64ToUint8Array(author.file);
           
           let extension = 'png';
           try {
               const mime = author.file.split(';')[0].split(':')[1];
               const mimeExt = mime.split('/')[1];
               if (mimeExt && mimeExt !== 'octet-stream') {
                   extension = mimeExt;
               }
           } catch (e) { /* fallback */ }

           fileName = `${index}.${extension}`;
           authorsZipFolder?.file(fileName, avatarData);
       } else {
           fileName = author.file; 
       }
    }
    return { 
        name: author.name, 
        file: fileName, 
        icon_height: author.icon_height || 50, 
        color: author.color || '#ffffff', 
        link: author.link || '' 
    };
  });

  // Settings.json
  zip.file("Settings.json", JSON.stringify({
    packStructureVersion: 30,
    title: workspace.name,
    guid: workspace.settingsGuid,
    authors: processedAuthors,
    version: workspace.version,
    description: workspace.description || "Created with ExMod Creator"
  }, null, 4));

  // 2. MOD STRUCTURE
  const modFolder = zip.folder("Modified")!.folder("1.mod");
  
  const contentFolder = modFolder!.folder("Content");
  const texturesFolder = modFolder!.folder("Textures");
  const registerFolder = modFolder!.folder("Register");
  const tlFolder = modFolder!.folder("TL");

  // 3. COPIAR FRAMEWORK
  await addFrameworkFiles(tlFolder!);

  // 4. MAIN.JS
  modFolder!.file("main.js", `import { RegisterAll } from './Register/RegisterAll.js';
import { SystemLoader } from './TL/Loaders/SystemLoader.js';

RegisterAll();
SystemLoader.OnModLoad();`);

  // Registro de classes para gerar os arquivos Register*.js
  const registryData: Record<string, { className: string, path: string }[]> = {};

  // 5. PROCESSAR ENTIDADES
  workspace.entities.forEach(entity => {
    if (entity.type === EntityType.BLANK) return;

    // Determina a pasta base (Agora NPCs virá correto)
    const categoryFolder = getFolderFromCategory(entity.category); 
    const relativePath = entity.folder ? `${categoryFolder}/${entity.folder}` : categoryFolder;
    
    // Salva JS
    contentFolder!.folder(relativePath)!.file(`${entity.internalName}.js`, entity.code);

    // Salva Textura Principal
    if (entity.texture) {
        texturesFolder!.folder(relativePath)!.file(`${entity.internalName}.png`, base64ToUint8Array(entity.texture));
    }
    
    // Salva Textura Secundária
    if (entity.secondaryTexture) {
        const texName = entity.relatedProjectileName || `${entity.internalName}_Secondary`;
        texturesFolder!.folder(relativePath)!.file(`${texName}.png`, base64ToUint8Array(entity.secondaryTexture));
    }

    // Adiciona ao registro
    if (!registryData[entity.type]) registryData[entity.type] = [];
    
    const importPath = `./../Content/${relativePath}/${entity.internalName}.js`;
    
    registryData[entity.type].push({
        className: entity.internalName,
        path: importPath
    });
  });

  // 6. GERAR ARQUIVOS DE REGISTRO
  
  Object.keys(REGISTER_CONFIG).forEach(type => {
      const config = REGISTER_CONFIG[type];
      const entities = registryData[type] || [];
      
      let content = `import { ${config.wrapper} } from './../TL/${config.wrapper}.js';\n\n`;
      
      entities.forEach(e => {
          content += `import { ${e.className} } from '${e.path}';\n`;
      });

      content += `\nexport function ${config.file.replace('.js', '')}() {\n`;
      
      entities.forEach(e => {
          content += `    ${config.class}.register(${e.className});\n`;
      });
      
      content += `}`;

      registerFolder!.file(config.file, content);
  });

  // RegisterGlobal.js
  const globalEntities = registryData[EntityType.GLOBAL] || [];
  let globalContent = `import { GlobalHooks } from './../TL/GlobalHooks.js';\n`;
  globalContent += `import { ModPlayer } from './../TL/ModPlayer.js';\n`;
  globalContent += `import { GlobalNPC } from './../TL/GlobalNPC.js';\n`;
  globalContent += `import { GlobalItem } from './../TL/GlobalItem.js';\n\n`;

  globalEntities.forEach(e => {
      globalContent += `import { ${e.className} } from '${e.path}';\n`;
  });

  globalContent += `\nexport function RegisterGlobal() {\n`;
  globalEntities.forEach(e => {
      if(e.className.includes('Player')) globalContent += `    ModPlayer.register(${e.className});\n`;
      else if(e.className.includes('Hooks')) globalContent += `    GlobalHooks.register(${e.className});\n`;
      else if(e.className.includes('GlobalNPC')) globalContent += `    GlobalNPC.register(${e.className});\n`;
      else if(e.className.includes('GlobalItem')) globalContent += `    GlobalItem.register(${e.className});\n`;
      else globalContent += `    // TODO: Register ${e.className} manually\n`;
  });
  globalContent += `}`;
  registerFolder!.file('RegisterGlobal.js', globalContent);

  // RegisterAll.js
  const registerAllContent = `import { ModSystem } from './../TL/ModSystem.js';
import { ModLoader } from './../TL/Core/ModLoader.js';

import { RegisterSystems } from './RegisterSystems.js';
import { RegisterBiomes } from './RegisterBiomes.js';
import { RegisterBuffs } from './RegisterBuffs.js';
import { RegisterNPCs } from './RegisterNPCs.js';
import { RegisterItems } from './RegisterItems.js';
import { RegisterProjectiles } from './RegisterProjectiles.js';
import { RegisterClouds } from './RegisterClouds.js';
import { RegisterBackgrounds } from './RegisterBackgrounds.js';
import { RegisterMenus } from './RegisterMenus.js';
import { RegisterSubworlds } from './RegisterSubworlds.js';
import { RegisterGlobal } from './RegisterGlobal.js';

export function RegisterAll() {
    ModSystem.register(ModLoader);
    RegisterSystems();
    RegisterBackgrounds();
    RegisterBiomes();
    RegisterBuffs();
    RegisterNPCs();
    RegisterProjectiles();
    RegisterItems();
    RegisterClouds();
    RegisterMenus();
    RegisterSubworlds();
    RegisterGlobal();
}`;
  registerFolder!.file("RegisterAll.js", registerAllContent);

  // 7. DOWNLOAD
  const blob = await zip.generateAsync({ type: "blob" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${workspace.internalId || 'MyMod'}.zip`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};