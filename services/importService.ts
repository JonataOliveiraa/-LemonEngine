import JSZip from 'jszip';
import { v4 as uuidv4 } from 'uuid';
import { Workspace, ModEntity, EntityType, Author } from '../types';

// Utilitário para converter Blob/Buffer para Base64
const fileToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};

const FOLDER_TO_TYPE: Record<string, EntityType> = {
    'Items': EntityType.ITEM,
    'NPCs': EntityType.NPC,
    'Projectiles': EntityType.PROJECTILE,
    'Buffs': EntityType.BUFF,
    'Biomes': EntityType.BIOME,
    'Backgrounds': EntityType.BACKGROUND,
    'Clouds': EntityType.CLOUD,
    'Global': EntityType.GLOBAL,
    'Menus': EntityType.MENU,
    'Pets': EntityType.PET,
    'Subworlds': EntityType.SUBWORLD,
    'Tiles': EntityType.TILE,
    'Systems': EntityType.SYSTEM
};

export const importModFromZip = async (file: File): Promise<Workspace> => {
    const zip = await JSZip.loadAsync(file);
    const entities: ModEntity[] = [];
    
    // 1. Ler Settings.json (Metadados)
    const settingsFile = zip.file("Settings.json");
    if (!settingsFile) throw new Error("Invalid Mod: Settings.json missing");
    
    const settingsText = await settingsFile.async("string");
    const settings = JSON.parse(settingsText);

    // 2. Ler ID do Mod a partir do 1.json
    let modGuid = settings.guid || uuidv4();
    const json1File = zip.file("Modified/1.mod/1.json");
    if (json1File) {
        try {
            const parsed1Json = JSON.parse(await json1File.async("string"));
            if (parsed1Json.id) modGuid = parsed1Json.id;
        } catch (e) {
            console.warn("Could not parse 1.json");
        }
    }

    // 3. Ler Ícone (Busca robusta para ignorar Case Sensitivity)
    let iconBase64: string | undefined = undefined;
    const iconPath = Object.keys(zip.files).find(p => p === 'Icon.png' || p === 'Icon.gif');
    if (iconPath) {
        const iconFile = zip.file(iconPath);
        if (iconFile) {
            iconBase64 = await fileToBase64(await iconFile.async("blob"));
        }
    }

    // 4. Processar Autores
    const authors: Author[] = await Promise.all(
        (settings.authors || []).map(async (auth: any, index: number) => {
            let avatarBase64 = "";
            const possiblePaths = [ `Authors/${auth.file}`, `Authors/${index}.png`, `Authors/${index}.jpg` ];

            for (const path of possiblePaths) {
                // Busca case-insensitive para os avatares também
                const exactPath = Object.keys(zip.files).find(p => p.toLowerCase() === path.toLowerCase());
                if (exactPath) {
                    const img = zip.file(exactPath);
                    if (img) {
                        avatarBase64 = await fileToBase64(await img.async("blob"));
                        break;
                    }
                }
            }

            return {
                name: auth.name,
                file: avatarBase64 || "", 
                icon_height: auth.icon_height || 70,
                color: auth.color || '#ffffff',
                link: auth.link || ''
            };
        })
    );

    // 5. Varrer Conteúdo (Modified/1.mod/Content/...)
    const contentPrefix = "Modified/1.mod/Content/";
    const texturesPrefix = "Modified/1.mod/Textures/";
    
    const contentFiles = Object.keys(zip.files).filter(path => 
        path.startsWith(contentPrefix) && path.endsWith(".js")
    );

    for (const path of contentFiles) {
        const relativePath = path.substring(contentPrefix.length); 
        const parts = relativePath.split('/');
        
        const categoryFolder = parts[0];
        const category = FOLDER_TO_TYPE[categoryFolder] || EntityType.BLANK;

        const fileName = parts[parts.length - 1]; 
        const internalName = fileName.replace('.js', '');

        const folderParts = parts.slice(1, parts.length - 1);
        const folderPath = folderParts.join('/'); 

        const code = await zip.file(path)!.async("string");

        // Textura
        const texturePath = `${texturesPrefix}${categoryFolder}/${folderPath ? folderPath + '/' : ''}${internalName}.png`;
        let textureBase64: string | undefined = undefined;
        
        const textureFile = zip.file(texturePath);
        if (textureFile) {
            textureBase64 = await fileToBase64(await textureFile.async("blob"));
        }

        entities.push({
            id: uuidv4(),
            internalName: internalName,
            displayName: internalName,
            type: category,
            category: category,
            folder: folderPath,
            code: code,
            texture: textureBase64,
            properties: {},
            hooks: {},
            template: 'Blank'
        });
    }

    // 6. Ler Localization (Novo!)
    const localizationData: Record<string, any> = {};
    const locPrefix = "Modified/1.mod/Localization/";
    
    const locFiles = Object.keys(zip.files).filter(path => 
        path.startsWith(locPrefix) && path.endsWith(".json")
    );

    for (const path of locFiles) {
        const langCode = path.split('/').pop()?.replace('.json', '');
        if (langCode) {
            try {
                const content = await zip.file(path)!.async("string");
                localizationData[langCode] = JSON.parse(content);
            } catch (e) {
                console.warn(`Failed to parse localization file: ${langCode}`);
            }
        }
    }

    // 7. Construir Workspace Final
    const newWorkspace: Workspace = {
        id: uuidv4(),
        name: settings.title || "Imported Mod",
        icon: iconBase64,
        version: settings.version || 1,
        settingsGuid: modGuid, 
        internalId: settings.title?.replace(/\s+/g, '') || "ImportedMod",
        description: "Imported via ZIP",
        authors: authors,
        entities: entities,
        localization: Object.keys(localizationData).length > 0 ? localizationData : undefined, // Associa as traduções lidas!
        lastModified: Date.now(),
        emptyFolders: {},
        mainJsInjection: undefined 
    };

    const mainJsFile = zip.file("Modified/1.mod/main.js");
    if (mainJsFile) {
        newWorkspace.mainJsInjection = await mainJsFile.async("string");
    }

    return newWorkspace;
};