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

// Mapeamento de Pastas -> EntityType
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

    // 2. Ler Ícone
    let iconBase64: string | undefined = undefined;
    const iconFile = zip.file("icon.png") || zip.file("Icon.png");
    if (iconFile) {
        const iconBlob = await iconFile.async("blob");
        iconBase64 = await fileToBase64(iconBlob);
    }

    // 3. Processar Autores e Avatares
    const authors: Author[] = await Promise.all(
        (settings.authors || []).map(async (auth: any, index: number) => {
            let avatarBase64 = "";
            // Tenta achar a imagem em Authors/
            // O formato costuma ser Authors/nome.png ou Authors/0.png dependendo de como foi buildado
            // Vamos tentar pelo nome do arquivo referenciado no JSON ou pelo index
            const possiblePaths = [
                `Authors/${auth.file}`,
                `Authors/${index}.png`,
                `Authors/${index}.jpg`
            ];

            for (const path of possiblePaths) {
                const img = zip.file(path);
                if (img) {
                    const blob = await img.async("blob");
                    avatarBase64 = await fileToBase64(blob);
                    break;
                }
            }

            return {
                name: auth.name,
                file: avatarBase64 || "", // Base64 para visualização
                icon_height: auth.icon_height || 70,
                color: auth.color || '#ffffff',
                link: auth.link || ''
            };
        })
    );

    // 4. Varrer Conteúdo (Modified/1.mod/Content/...)
    const contentPrefix = "Modified/1.mod/Content/";
    const texturesPrefix = "Modified/1.mod/Textures/";
    
    // Filtra apenas arquivos dentro de Content e que sejam .js
    const contentFiles = Object.keys(zip.files).filter(path => 
        path.startsWith(contentPrefix) && path.endsWith(".js")
    );

    for (const path of contentFiles) {
        // Ex: Modified/1.mod/Content/Items/Weapons/Sword.js
        const relativePath = path.substring(contentPrefix.length); // Items/Weapons/Sword.js
        const parts = relativePath.split('/');
        
        // parts[0] = "Items" (Categoria)
        const categoryFolder = parts[0];
        const category = FOLDER_TO_TYPE[categoryFolder] || EntityType.BLANK;

        // O nome do arquivo é o último
        const fileName = parts[parts.length - 1]; // Sword.js
        const internalName = fileName.replace('.js', '');

        // A pasta interna é tudo que está entre a Categoria e o Arquivo
        // Ex: parts = ['Items', 'Weapons', 'Sword.js'] -> folderParts = ['Weapons']
        const folderParts = parts.slice(1, parts.length - 1);
        const folderPath = folderParts.join('/'); // "Weapons"

        // Ler Código
        const code = await zip.file(path)!.async("string");

        // Tentar achar Textura correspondente
        // A textura costuma estar na mesma estrutura mas dentro de Textures/
        // Ex: Modified/1.mod/Textures/Items/Weapons/Sword.png
        const texturePath = `${texturesPrefix}${categoryFolder}/${folderPath ? folderPath + '/' : ''}${internalName}.png`;
        let textureBase64: string | undefined = undefined;
        
        const textureFile = zip.file(texturePath);
        if (textureFile) {
            const blob = await textureFile.async("blob");
            textureBase64 = await fileToBase64(blob);
        }

        entities.push({
            id: uuidv4(),
            internalName: internalName,
            displayName: internalName,
            type: category, // Baseado na pasta Items/NPCs/etc
            category: category,
            folder: folderPath, // Pasta relativa (ex: Weapons)
            code: code,
            texture: textureBase64,
            properties: {}, // Seria complexo parsear do JS agora, deixar vazio
            hooks: {},
            template: 'Blank'
        });
    }

    // 5. Construir Workspace
    const newWorkspace: Workspace = {
        id: uuidv4(), // Novo ID interno para evitar conflitos
        name: settings.title || "Imported Mod",
        icon: iconBase64,
        version: settings.version || 1,
        settingsGuid: settings.guid || uuidv4(), // Mantém GUID se existir para compatibilidade
        internalId: settings.title?.replace(/\s+/g, '') || "ImportedMod",
        description: "Imported via ZIP",
        authors: authors,
        entities: entities,
        lastModified: Date.now(),
        emptyFolders: {},
        mainJsInjection: undefined 
    };

    // Tenta ler o main.js customizado se existir
    const mainJsFile = zip.file("Modified/1.mod/main.js");
    if (mainJsFile) {
        newWorkspace.mainJsInjection = await mainJsFile.async("string");
    }

    return newWorkspace;
};