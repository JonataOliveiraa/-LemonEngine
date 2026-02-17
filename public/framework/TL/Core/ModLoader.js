import { Terraria } from './../ModImports.js';
import { CameraShake, FadeController } from './../Modules/Camera.js';
import { Prototypes } from './Prototypes.js';
import { FileManager } from './FileManager.js';

// Loaders
import { SystemLoader } from './../Loaders/SystemLoader.js';
import { TileLoader } from './../Loaders/TileLoader.js';
import { BiomeLoader } from './../Loaders/BiomeLoader.js';
import { ProjectileLoader } from './../Loaders/ProjectileLoader.js';
import { ItemLoader } from './../Loaders/ItemLoader.js';
import { PlayerLoader } from './../Loaders/PlayerLoader.js';
import { BuffLoader } from './../Loaders/BuffLoader.js';
import { NPCLoader } from './../Loaders/NPCLoader.js';
import { GoreLoader } from './../Loaders/GoreLoader.js';
import { CloudLoader } from './../Loaders/CloudLoader.js';
import { BackgroundLoaders } from './../Loaders/BackgroundLoaders.js';
import { SceneEffectLoader } from './../Loaders/SceneEffectLoader.js';
import { MenuLoader } from './../Loaders/MenuLoader.js';
import { SubworldLoader } from './../Loaders/SubworldLoader.js';

// ModTypes
import { ModSystem } from './../ModSystem.js';
import { ModRecipe } from './../ModRecipe.js';
import { ModHooks } from './../ModHooks.js';
import { ModLocalization } from './../ModLocalization.js';

// Global
import { GlobalItem } from './../GlobalItem.js';

// Other
import { WorldDB } from './../WorldDB.js';
import { PlayerDB } from './../PlayerDB.js';

export class ModLoader extends ModSystem {
    static ModData = {
        TileCount: 0,
        BuffCount: 0,
        ProjectileCount: 0,
        ItemCount: 0,
        NPCCount: 0
    };
    
    constructor() {
        super();
        this.TILE_NAMES_COUNT = Terraria.ID.TileID.Search.Names.Count;
        this.BUFF_NAMES_COUNT = Terraria.ID.BuffID.Search.Names.Count;
        this.PROJECTILE_NAMES_COUNT = Terraria.ID.ProjectileID.Search.Names.Count;
        this.ITEM_NAMES_COUNT = Terraria.ID.ItemID.Search.Names.Count;
        this.NPC_NAMES_COUNT = Terraria.ID.NPCID.Search.Names.Count;
    }
    
    UpdateModData() {
        ModLoader.ModData.TileCount = Terraria.ID.TileID.Search.Names.Count - this.TILE_NAMES_COUNT;
        ModLoader.ModData.BuffCount = Terraria.ID.BuffID.Search.Names.Count - this.BUFF_NAMES_COUNT;
        ModLoader.ModData.ProjectileCount = Terraria.ID.ProjectileID.Search.Names.Count - this.PROJECTILE_NAMES_COUNT;
        ModLoader.ModData.ItemCount = Terraria.ID.ItemID.Search.Names.Count - this.ITEM_NAMES_COUNT;
        ModLoader.ModData.NPCCount = Terraria.ID.NPCID.Search.Names.Count - this.NPC_NAMES_COUNT;
    }
    
    OnModLoad() {
        FileManager._path = tl.mod.path.split('/tl_files/')[0] + '/';
        Prototypes.Initialize();
        
        // Hooks
        ModHooks.Initialize();
    }
    
    SetupContent() {
        this.UpdateModData();
        
        // Loaders
        TileLoader.SetupContent();
        BiomeLoader.SetupContent();
        BackgroundLoaders.SetupContent();
        BuffLoader.SetupContent();
        ProjectileLoader.SetupContent();
        ItemLoader.SetupContent();
        NPCLoader.SetupContent();
        GoreLoader.SetupContent();
        CloudLoader.SetupContent();
        MenuLoader.SetStaticDefaults();
        
        // Localizations
        ModLocalization.UpdateTranslations();
        SystemLoader.OnLocalizationsLoaded();
    }
    
    PostSetupContent() {
        this.UpdateModData();
        
        // Loaders
        TileLoader.PostSetupContent();
        BiomeLoader.PostSetupContent();
        BuffLoader.PostSetupContent();
        ProjectileLoader.PostSetupContent();
        ItemLoader.PostSetupContent();
        NPCLoader.PostSetupContent();
        GoreLoader.PostSetupContent();
        MenuLoader.OnEnter();
        
        this.CheckFiles('Players/', '.plr');
        this.CheckFiles('Worlds/', '.wld');
    }
    
    AddRecipes() {
        GlobalItem.RegisteredItems.forEach(g => g?.AddRecipes());
        ItemLoader.Items.forEach(i => i?.AddRecipes());
        Terraria.ID.ContentSamples.FixItemsAfterRecipesAreAdded();
    }
    
    OnWorldLoad() {
        if (!SubworldLoader.AnySubworldActive && FileManager.IsSafe(Terraria.Main.ActivePlayerFileData.Path + '.bin')) {
            PlayerDB.Instance = new PlayerDB(Terraria.Main.ActivePlayerFileData.Path + '.bin');
            PlayerDB.Instance.Load();
        }
        if (!SubworldLoader.AnySubworldActive && FileManager.IsSafe(Terraria.Main.ActiveWorldFileData.Path + '.bin')) {
            WorldDB.Instance = new WorldDB(Terraria.Main.ActiveWorldFileData.Path + '.bin');
            WorldDB.Instance.Load();
        }
        
        if (PlayerDB.Instance) {
            const savedBuffs = PlayerDB.get('modsystem:buffs')?.split('/') ?? [];
            if (savedBuffs.length > 0) {
                const player = Terraria.Main.player[Terraria.Main.myPlayer];
                for (const b of savedBuffs) {
                    const [name, time] = b.split('|');
                    const type = BuffLoader.getTypeByName(name);
                    if (type) player.AddBuff(type, +time, true, false);
                }
                PlayerDB.delete('modsystem:buffs');
            }
        }
        
        MenuLoader.OnLeave();
        ModHooks.OnWorldLoad();
    }
    
    PreSaveAndQuit() {
        if (PlayerDB.Instance) {
            const player = Terraria.Main.player[Terraria.Main.myPlayer];
            const buffs = [];
            for (let i = 0; i < player.buffTime.length; i++) {
                const type = player.buffType[i];
                if (Terraria.Main.buffNoSave[type]) continue;
                if (player.buffTime[i] > 0 && BuffLoader.isModType(type)) {
                    const modBuff = BuffLoader.getModBuff(type);
                    if (modBuff) buffs.push(`${modBuff.constructor.name}|${player.buffTime[i]}`);
                }
            }
            if (buffs.length) PlayerDB.set('modsystem:buffs', buffs.join('/'));
            PlayerDB.Instance.Save();
        }
        if (WorldDB.Instance) WorldDB.Instance.Save();
        
        SceneEffectLoader.PreSaveAndQuit();
        CameraShake.Clear();
        FadeController.Clear();
        MenuLoader.OnEnter();
    }
    
    OnWorldUnload() {
        if (!SubworldLoader.Joining) {
            if (PlayerDB.Instance) PlayerDB.Instance.Clear();
            if (WorldDB.Instance) WorldDB.Instance.Clear();
        }
        ModHooks.OnWorldUnload();
    }
    
    CheckFiles(folder, extension) {
        const files = Array.from(FileManager.ListFiles(FileManager.path + folder));
        const files2 = files.filter(f => f.endsWith(extension + '.bin'));
        for (let bin of files2) {
            if (!FileManager.Exists(bin.replace(extension + '.bin', extension))) {
                FileManager.Delete(bin);
            }
        }
    }
    
    static DeleteDatabase(path) {
        if (FileManager.Exists(path + '.bin')) {
            FileManager.Delete(path + '.bin');
        }
    }
}