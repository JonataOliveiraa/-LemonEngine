import { Terraria, Microsoft } from './../ModImports.js';
import { ModLoader } from './../Core/ModLoader.js';
import { TileLoader } from './../Loaders/TileLoader.js';
import { BiomeLoader } from './../Loaders/BiomeLoader.js';
import { ItemLoader } from './../Loaders/ItemLoader.js';
import { ModTexture } from './../ModTexture.js';
import { ModLocalization } from './../ModLocalization.js';
import { GlobalNPC } from './../GlobalNPC.js';
import { GlobalLoot } from './../GlobalLoot.js';
import { NPCLoot } from './../NPCLoot.js';
import { NPCShop } from './../NPCShop.js';
import { SubworldLoader } from './SubworldLoader.js';

const GUIInstance = new NativeClass('', 'GUIInstance');
const GUIPageIcons = new NativeClass('', 'GUIPageIcons');

function cloneResizedSetLastNPC(array, newSize, value) {
    const resized = array.cloneResized(newSize);
    if (value != null) resized[newSize - 1] = value;
    return resized;
}

function resizeArrayProperty(propertyHolder, propertyName, newSize, value) {
    propertyHolder[propertyName] = cloneResizedSetLastNPC(propertyHolder[propertyName], newSize, value);
}

function addToArray(propertyHolder, propertyName, value) {
    const array = propertyHolder[propertyName];
    const arrayLength = array.length;
    propertyHolder[propertyName] = cloneResizedSetLastNPC(array, arrayLength + 1, value);
}

export class NPCLoader {
    static NPCs = [];
    static TownNPCs = [];
    static MAX_VANILLA_ID = Terraria.ID.NPCID.Count;
    static Count = 0;
    static TypeOffset = 0;
    static ModTypes = new Set();
    static TypeToIndex = {};
    static NPCCount = this.MAX_VANILLA_ID + this.Count;
    static MenuCategories = {};
    static TL_Categories = tl.cheatMenu.getNpcCategories();
    
    static isModNPC(npc) { return this.isModType(npc.type); }
    static isModType(type) { return this.ModTypes.has(type); }
    static getByName(name) { return this.NPCs.find(t => t.constructor.name === name); }
    static getTypeByName(name) { return this.getByName(name)?.Type; }
    static getModNPC(type) {
        if (this.ModTypes.has(type)) {
            return this.NPCs[this.TypeToIndex[type]];
        }
        return undefined;
    }
    
    static TypeToNPCHead = {};
    static NPCHeadToType = {};
    static ShimmerHeads = {};
    
    static AnyBossActive = false;
    static ActiveBoss = -1;
    
    // Vanilla NPCs
    static KingStatueNPCs = new Set([
        17, 19, 22, 38, 54, 107, 108,
        142, 160, 207, 209, 227, 228,
        229, 368, 369, 550, 441, 588
    ]);
    static QueenStatueNPCs = new Set([
        18, 20, 124, 178, 208, 353, 633
    ]);
    
    static LoadNPCs() {
        this.TypeOffset = ModLoader.ModData.NPCCount ?? 0;
        for (const npc of this.NPCs) {
            this.LoadNPC(npc);
        }
    }
    
    static LoadNPC(npc) {
        npc.NPC = {};
        this.Count++;
        const nextNPC = this.MAX_VANILLA_ID + this.TypeOffset + this.Count;
        npc.Type = npc.NPC.type = npc.NPC.netID = nextNPC - 1;
        this.ModTypes.add(npc.Type);
        this.TypeToIndex[npc.Type] = this.NPCs.indexOf(npc);
        
        // Sets
        resizeArrayProperty(Terraria.ID.NPCID, 'NetIdMap', nextNPC);
        resizeArrayProperty(Terraria.ID.NPCHeadID.Sets, 'CannotBeDrawnInHousingUI', nextNPC);
        resizeArrayProperty(Terraria.ID.NPCID.Sets, 'DontDoHardmodeScaling', nextNPC);
        resizeArrayProperty(Terraria.ID.NPCID.Sets, 'ReflectStarShotsInForTheWorthy', nextNPC);
        resizeArrayProperty(Terraria.ID.NPCID.Sets, 'IsTownPet', nextNPC);
        resizeArrayProperty(Terraria.ID.NPCID.Sets, 'IsTownSlime', nextNPC);
        resizeArrayProperty(Terraria.ID.NPCID.Sets, 'CanConvertIntoCopperSlimeTownNPC', nextNPC);
        resizeArrayProperty(Terraria.ID.NPCID.Sets, 'ZappingJellyfish', nextNPC);
        resizeArrayProperty(Terraria.ID.NPCID.Sets, 'CantTakeLunchMoney', nextNPC);
        resizeArrayProperty(Terraria.ID.NPCID.Sets, 'TrailingMode', nextNPC, -1);
        resizeArrayProperty(Terraria.ID.NPCID.Sets, 'TrailCacheLength', nextNPC);
        resizeArrayProperty(Terraria.ID.NPCID.Sets, 'IsDragonfly', nextNPC);
        resizeArrayProperty(Terraria.ID.NPCID.Sets, 'BelongsToInvasionOldOnesArmy', nextNPC);
        resizeArrayProperty(Terraria.ID.NPCID.Sets, 'TeleportationImmune', nextNPC);
        resizeArrayProperty(Terraria.ID.NPCID.Sets, 'UsesNewTargetting', nextNPC);
        resizeArrayProperty(Terraria.ID.NPCID.Sets, 'TakesDamageFromHostilesWithoutBeingFriendly', nextNPC);
        resizeArrayProperty(Terraria.ID.NPCID.Sets, 'AllNPCs', nextNPC, true);
        resizeArrayProperty(Terraria.ID.NPCID.Sets, 'HurtingBees', nextNPC);
        resizeArrayProperty(Terraria.ID.NPCID.Sets, 'FighterUsesDD2PortalAppearEffect', nextNPC);
        resizeArrayProperty(Terraria.ID.NPCID.Sets, 'StatueSpawnedDropRarity', nextNPC);
        resizeArrayProperty(Terraria.ID.NPCID.Sets, 'NoEarlymodeLootWhenSpawnedFromStatue', nextNPC);
        resizeArrayProperty(Terraria.ID.NPCID.Sets, 'NeedsExpertScaling', nextNPC);
        resizeArrayProperty(Terraria.ID.NPCID.Sets, 'ProjectileNPC', nextNPC);
        resizeArrayProperty(Terraria.ID.NPCID.Sets, 'SavesAndLoads', nextNPC);
        resizeArrayProperty(Terraria.ID.NPCID.Sets, 'UsesMultiplayerProximitySyncing', nextNPC);
        resizeArrayProperty(Terraria.ID.NPCID.Sets, 'NoMultiplayerSmoothingByType', nextNPC);
        resizeArrayProperty(Terraria.ID.NPCID.Sets, 'NoMultiplayerSmoothingByAI', nextNPC);
        resizeArrayProperty(Terraria.ID.NPCID.Sets, 'MPAllowedEnemies', nextNPC);
        resizeArrayProperty(Terraria.ID.NPCID.Sets, 'TownCritter', nextNPC);
        resizeArrayProperty(Terraria.ID.NPCID.Sets, 'CountsAsCritter', nextNPC);
        resizeArrayProperty(Terraria.ID.NPCID.Sets, 'HasNoPartyText', nextNPC);
        resizeArrayProperty(Terraria.ID.NPCID.Sets, 'HatOffsetY', nextNPC);
        resizeArrayProperty(Terraria.ID.NPCID.Sets, 'FaceEmote', nextNPC);
        resizeArrayProperty(Terraria.ID.NPCID.Sets, 'ExtraFramesCount', nextNPC, 0);
        resizeArrayProperty(Terraria.ID.NPCID.Sets, 'AttackFrameCount', nextNPC, 0);
        resizeArrayProperty(Terraria.ID.NPCID.Sets, 'DangerDetectRange', nextNPC, -1);
        resizeArrayProperty(Terraria.ID.NPCID.Sets, 'ShimmerImmunity', nextNPC);
        resizeArrayProperty(Terraria.ID.NPCID.Sets, 'ShimmerTransformToItem', nextNPC);
        resizeArrayProperty(Terraria.ID.NPCID.Sets, 'ShimmerTownTransform', nextNPC);
        resizeArrayProperty(Terraria.ID.NPCID.Sets, 'ShimmerTransformToNPC', nextNPC);
        resizeArrayProperty(Terraria.ID.NPCID.Sets, 'AttackTime', nextNPC);
        resizeArrayProperty(Terraria.ID.NPCID.Sets, 'AttackAverageChance', nextNPC);
        resizeArrayProperty(Terraria.ID.NPCID.Sets, 'AttackType', nextNPC, -1);
        resizeArrayProperty(Terraria.ID.NPCID.Sets, 'PrettySafe', nextNPC, -1);
        resizeArrayProperty(Terraria.ID.NPCID.Sets, 'MagicAuraColor', nextNPC, Microsoft.Xna.Framework.Graphics.Color.TransparentBlack);
        resizeArrayProperty(Terraria.ID.NPCID.Sets, 'DemonEyes', nextNPC);
        resizeArrayProperty(Terraria.ID.NPCID.Sets, 'Zombies', nextNPC);
        resizeArrayProperty(Terraria.ID.NPCID.Sets, 'Skeletons', nextNPC);
        resizeArrayProperty(Terraria.ID.NPCID.Sets, 'BossHeadTextures', nextNPC, -1);
        resizeArrayProperty(Terraria.ID.NPCID.Sets, 'PositiveNPCTypesExcludedFromDeathTally', nextNPC);
        resizeArrayProperty(Terraria.ID.NPCID.Sets, 'ShouldBeCountedAsBoss', nextNPC);
        resizeArrayProperty(Terraria.ID.NPCID.Sets, 'DangerThatPreventsOtherDangers', nextNPC);
        resizeArrayProperty(Terraria.ID.NPCID.Sets, 'MustAlwaysDraw', nextNPC);
        resizeArrayProperty(Terraria.ID.NPCID.Sets, 'ExpandedCullDraw', nextNPC);
        resizeArrayProperty(Terraria.ID.NPCID.Sets, 'ExtraTextureCount', nextNPC, 0);
        resizeArrayProperty(Terraria.ID.NPCID.Sets, 'NPCFramingGroup', nextNPC);
        resizeArrayProperty(Terraria.ID.NPCID.Sets, 'CanHitPastShimmer', nextNPC);
        resizeArrayProperty(Terraria.ID.NPCID.Sets, 'TownNPCsFramingGroups', nextNPC);
        
        // Resize Arrays
        resizeArrayProperty(Terraria.Main, 'townNPCCanSpawn', nextNPC);
        resizeArrayProperty(Terraria.Main, 'slimeRainNPC', nextNPC);
        resizeArrayProperty(Terraria.Main, 'npcCatchable', nextNPC);
        resizeArrayProperty(Terraria.Main, 'npcFrameCount', nextNPC, 1);
        resizeArrayProperty(Terraria.Main.SceneMetrics, 'NPCBannerBuff', nextNPC);
        resizeArrayProperty(Terraria.NPC, 'ShimmeredTownNPCs', nextNPC);
        resizeArrayProperty(Terraria.NPC, 'npcsFoundForCheckActive', nextNPC);
        resizeArrayProperty(Terraria.GameContent.UI.EmoteBubble, 'CountNPCs', nextNPC);
        resizeArrayProperty(Terraria.WorldGen.TownManager, '_hasRoom', nextNPC);
        resizeArrayProperty(Terraria.GameContent.TextureAssets, 'Npc', nextNPC);
        
        addToArray(Terraria.Lang, '_npcNameCache', ModLocalization.empty());
        
        this.SetupTextures(npc);
        
        npc.SetDefaults();
        npc.SetStaticDefaults();
        
        npc.MenuCategories.push('ModIcon');
        npc.MenuCategories.push('all');
        
        if ((npc.NPC.damage ?? 0) > 0 && !npc.NPC.friendly) npc.MenuCategories.push('enemy');
        if (npc.NPC.boss) npc.MenuCategories.push('boss');
        if (npc.NPC.townNPC) npc.MenuCategories.push('npc');
        if (npc.NPC.friendly && !npc.NPC.townNPC) npc.MenuCategories.push('friendly');
        
        const texture = Terraria.GameContent.TextureAssets.Npc[npc.Type]?.Value;
        if (texture && texture.Width && texture.Height) {
            if (npc.NPC.width === undefined) {
                npc.NPC.width = texture.Width;
            }
            if (npc.NPC.height === undefined) {
                npc.NPC.height = texture.Height / Terraria.Main.npcFrameCount[npc.Type];
            }
        }
        
        if (npc.NPC.townNPC && npc.NPC.housingCategory == null) {
            npc.NPC.housingCategory = 0;
        }
        
        const bannerTile = TileLoader.getByName(npc.constructor.name + 'Banner');
        if (bannerTile) {
            npc.Banner = bannerTile.Type;
            npc.BannerItem = bannerTile.Item?.Type ?? 0;
        }
        
        npc.PostStaticDefaults();
    }
    
    static AddToMenu(npc) {
        if (npc.MenuCategories.length > 0) {
            npc.MenuCategories = [...new Set(npc.MenuCategories)];
            for (const category of npc.MenuCategories) {
                if (this.TL_Categories.includes(category)) tl.cheatMenu.addNpcToCategory(category, npc.Type);
                else {
                    if (!this.MenuCategories[category]) {
                        const texture = `Textures/Icons/${category}.png`;
                        if (tl.file.exists(texture)) {
                            this.MenuCategories[category] = tl.cheatMenu.addNpcCategory(category, texture);
                        }
                    }
                    if (this.MenuCategories[category]) tl.cheatMenu.addNpcToCategory(this.MenuCategories[category], npc.Type);
                }
            }
        }
    }
    
    static SetupContent() {
        this.LoadNPCs();
        ModLoader.ModData.NPCCount += this.Count;
        
        for (const npc of this.NPCs) {
            npc.SetupContent();
        }
    }
    
    static PostSetupContent() {
        this.NPCCount = this.MAX_VANILLA_ID + ModLoader.ModData.NPCCount;
        resizeArrayProperty(Terraria.NPC, 'killCount', Math.max(NPCLoader.NPCCount, TileLoader.TileCount));
        
        for (const npc of this.NPCs) {
            // NPCLoot
            npc.ModifyNPCLoot(new NPCLoot(npc.NPC.netID, Terraria.Main.ItemDropsDB));
            
            // SetBestiary
            if (!npc.hideFromBestiary) {
                let bestiaryEntry = null;
                if (npc.NPC.townNPC) {
                    bestiaryEntry = Terraria.GameContent.Bestiary.BestiaryEntry.TownNPC(npc.Type);
                }
                else if (Terraria.ID.NPCID.Sets.CountsAsCritter[npc.Type]) {
                    bestiaryEntry = Terraria.GameContent.Bestiary.BestiaryEntry.Critter(npc.Type);
                }
                else {
                    bestiaryEntry = Terraria.GameContent.Bestiary.BestiaryEntry.Enemy(npc.Type);
                }
                
                const customBestiaryIcon = new ModTexture(npc.Texture + '_BestiaryIcon');
                if (customBestiaryIcon?.exists) {
                    bestiaryEntry.Icon._customTexture = customBestiaryIcon.asset.asset;
                }
                
                npc.SetBestiary(Terraria.Main.BestiaryDB, bestiaryEntry);
                
                Terraria.Main.BestiaryDB['BestiaryEntry Register(BestiaryEntry entry)'](bestiaryEntry);
                Terraria.Main.BestiaryDB.ExtractDropsForNPC(Terraria.Main.ItemDropsDB, npc.Type);
                
                if (npc.NPC.townNPC) this.TownNPCs.push(npc);
            }
            
            npc.PostSetupContent();
            
            if (npc.Banner > 0 && npc.BannerItem > 0) {
                Terraria.ID.ItemID.Sets.BannerStrength[npc.BannerItem] = Terraria.ID.ItemID.Sets.BannerStrength[0];
                Terraria.ID.ItemID.Sets.BannerStrength[npc.BannerItem].Enabled = true;
                Terraria.ID.ItemID.Sets.KillsToBanner[npc.BannerItem] = npc.KillsToBanner;
                
                ItemLoader._NPCToBanner[npc.Type] = npc.Banner ?? 0;
                ItemLoader._BannerToNPC[npc.Banner] = npc.Type ?? 0;
                ItemLoader._BannerToItem[npc.Banner] = npc.BannerItem ?? 0;
                
                const bannerTile = TileLoader.Tiles.find(t => t.Type === npc.Banner);
                bannerTile.BannerID = npc.Banner;
                bannerTile.BannerItem = npc.BannerItem;
            }
        }
        
        for (const gLoot of GlobalLoot.Loots) {
            const gL = new gLoot(Terraria.Main.ItemDropsDB);
            gL.ModifyGlobalLoot();
        }
    }
    
    static SetupTextures(npc) {
        if (!npc.Texture?.startsWith('Textures/')) {
            npc.Texture = 'Textures/' + npc.Texture;
        }
        
        npc.AltTextures = {
            Party: -1,
            Shimmer: -1,
            ShimmerParty: -1
        };
        
        // NPC Texture
        const npcTexture = new ModTexture(npc.Texture);
        if (npcTexture?.exists) {
            Terraria.GameContent.TextureAssets.Npc[npc.Type] = npcTexture.asset.asset;
        }
        
        // NPC Party Texture
        const npcPartyTexture = new ModTexture(npc.Texture + '_Party');
        if (npcPartyTexture?.exists) {
            const nextSlot = Terraria.GameContent.TextureAssets.Extra.length;
            resizeArrayProperty(Terraria.GameContent.TextureAssets, 'Extra', nextSlot + 1, npcPartyTexture.asset.asset);
            npc.AltTextures.Party = nextSlot;
        }
        
        // NPC Shimmer Texture
        const npcShimmerTexture = new ModTexture(npc.Texture + '_Shimmer');
        if (npcShimmerTexture?.exists) {
            const nextSlot = Terraria.GameContent.TextureAssets.Extra.length;
            resizeArrayProperty(Terraria.GameContent.TextureAssets, 'Extra', nextSlot + 1, npcShimmerTexture.asset.asset);
            npc.AltTextures.Shimmer = nextSlot;
        }
        
        // NPC Shimmer Party Texture
        const npcShimmerPartyTexture = new ModTexture(npc.Texture + '_Shimmer_Party');
        if (npcShimmerPartyTexture?.exists) {
            const nextSlot = Terraria.GameContent.TextureAssets.Extra.length;
            resizeArrayProperty(Terraria.GameContent.TextureAssets, 'Extra', nextSlot + 1, npcShimmerPartyTexture.asset.asset);
            npc.AltTextures.ShimmerParty = nextSlot;
        }
        
        // Boss Heads
        const bossHeadTexture = new ModTexture(npc.Texture + '_Head_Boss');
        if (bossHeadTexture?.exists) {
            let nextBossHead = Terraria.GameContent.TextureAssets.NpcHeadBoss.length;
            resizeArrayProperty(Terraria.GameContent.TextureAssets, 'NpcHeadBoss', nextBossHead + 1, bossHeadTexture.asset.asset);
            Terraria.ID.NPCID.Sets.BossHeadTextures[npc.Type] = nextBossHead;
            let i = 2;
            let otherBossHeadTexture = new ModTexture(npc.Texture + '_Head_Boss_' + i);
            while (otherBossHeadTexture?.exists) {
                i++;
                nextBossHead++;
                resizeArrayProperty(Terraria.GameContent.TextureAssets, 'NpcHeadBoss', nextBossHead + 1, otherBossHeadTexture.asset.asset);
                otherBossHeadTexture = new ModTexture(npc.Texture + '_Head_Boss_' + i);
            }
        }
        
        // NPC Heads
        const npcHeadTexture = new ModTexture(npc.Texture + '_Head');
        if (npcHeadTexture?.exists) {
            let nextHead = Terraria.GameContent.TextureAssets.NpcHead.length;
            resizeArrayProperty(Terraria.GameContent.TextureAssets, 'NpcHead', nextHead + 1, npcHeadTexture.asset.asset);
            this.TypeToNPCHead[npc.Type] = nextHead;
            this.NPCHeadToType[nextHead] = npc.Type;
            if (npc.AltTextures.Shimmer != -1) {
                const npcShimmerHeadTexture = new ModTexture(npc.Texture + '_Shimmer_Head');
                if (npcShimmerHeadTexture?.exists) {
                    nextHead++;
                    resizeArrayProperty(Terraria.GameContent.TextureAssets, 'NpcHead', nextHead + 1, npcShimmerHeadTexture.asset.asset);
                    this.ShimmerHeads[npc.Type] = nextHead;
                }
            }
        }
    }
    
    static SetDefaults(npc) {
        for (const gNPC of GlobalNPC.RegisteredNPCs) {
            gNPC?.SetDefaults(npc);
        }
    }
    
    static ChooseSpawn(spawnInfo) {
        const pool = { 0: 1 };
        
        for (const npc of this.NPCs) {
            const w = npc.SpawnChance(spawnInfo);
            if (w > 0) pool[npc.Type] = w;
        }
        
        BiomeLoader.ModifySpawnPool(spawnInfo, pool);
        if (SubworldLoader.AnySubworldActive) {
            SubworldLoader.ActiveSubworld.ModifySpawnPool(spawnInfo, pool);
        }
        
        let r = Math.random() * Object.values(pool).reduce((a, b) => a + b, 0);
        for (const k in pool) {
            const w = pool[k];
            if (r < w) return +k;
            r -= w;
        }
        
        return -1;
    }
    
    static OnSpawn(npc, source) {
        if (this.isModType(npc.type)) {
            this.getModNPC(npc.type)?.OnSpawn(npc, source);
        }
        for (const gNpc of GlobalNPC.RegisteredNPCs) {
            gNpc?.OnSpawn(npc, source);
        }
    }
    
    static PreAI(npc) {
        let value = true;
        if (this.isModType(npc.type)) {
            value = this.getModNPC(npc.type)?.PreAI(npc) ?? true;
        }
        if (GlobalNPC.RegisteredNPCs.some(gN => (gN?.PreAI(npc) ?? true) === false)) {
            value = false;
        }
        return value;
    }
    
    static AI(npc) {
        if (this.isModType(npc.type)) {
            this.getModNPC(npc.type)?.AI(npc);
        }
        for (const gNpc of GlobalNPC.RegisteredNPCs) {
            gNpc?.AI(npc);
        }
    }
    
    static PostAI(npc) {
        if (this.isModType(npc.type)) {
            this.getModNPC(npc.type)?.PostAI(npc);
        }
        for (const gNpc of GlobalNPC.RegisteredNPCs) {
            gNpc?.PostAI(npc);
        }
    }
    
    static PreDraw(npc, spriteBatch, screenPos) {
        let value = true;
        if (this.isModType(npc.type)) {
            value = this.getModNPC(npc.type)?.PreDraw(npc, spriteBatch, screenPos) ?? true;
        }
        return value;
    }
    
    static PostDraw(npc, spriteBatch, screenPos) {
        if (this.isModType(npc.type)) {
            this.getModNPC(npc.type)?.PostDraw(npc, spriteBatch, screenPos);
        }
    }
    
    static FindFrame(npc, frameHeight) {
        if (this.isModType(npc.type)) {
            this.getModNPC(npc.type)?.FindFrame(npc, frameHeight);
        }
    }
    
    static GetAltTextureIndex(npc) {
        if (!this.isModType(npc.type)) return -1;
        
        let variant = '';
        if (npc.IsShimmerVariant) variant += 'Shimmer';
        if (npc.altTexture === 1) variant += 'Party';
        
        return this.getModNPC(npc.type).AltTextures[variant] ?? -1;
    }
    
    static GetAlpha(npc, newColor) {
        let value = newColor;
        if (this.isModType(npc.type)) {
            value = this.getModNPC(npc.type)?.GetAlpha(npc, newColor) ?? value;
        }
        for (const gNpc of GlobalNPC.RegisteredNPCs) {
            value = gNpc?.GetAlpha(npc, value);
        }
        return value;
    }
    
    static BossHeadSlot(npc) {
        let value = null;
        if (this.isModType(npc.type)) {
            value = this.getModNPC(npc.type)?.BossHeadSlot(npc);
        }
        return value;
    }
    
    static BossHeadRotation(npc, originalSlot) {
        let value = null;
        if (this.isModType(npc.type)) {
            value = this.getModNPC(npc.type)?.BossHeadRotation(npc, originalSlot);
        }
        return value;
    }
    
    static NPCHeadSlot(type) {
        if (this.isModType(type)) {
            return this.getModNPC(type)?.NPCHeadSlot() ?? -1;
        }
        return undefined;
    }
    
    static CheckActive(npc) {
        let value = true;
        if (this.isModType(npc.type)) {
            value = this.getModNPC(npc.type)?.CheckActive(npc) ?? true;
        }
        if (GlobalNPC.RegisteredNPCs.some(gN => (gN?.CheckActive(npc) ?? true) === false)) {
            value = false;
        }
        return value;
    }
    
    static CheckDead(npc) {
        let value = true;
        if (this.isModType(npc.type)) {
            value = this.getModNPC(npc.type)?.CheckDead(npc) ?? true;
        }
        if (GlobalNPC.RegisteredNPCs.some(gN => (gN?.CheckDead(npc) ?? true) === false)) {
            value = false;
        }
        return value;
    }
    
    static PreKill(npc) {
        let value = true;
        if (this.isModType(npc.type)) {
            value = this.getModNPC(npc.type)?.PreKill(npc) ?? true;
        }
        if (GlobalNPC.RegisteredNPCs.some(gN => (gN?.PreKill(npc) ?? true) === false)) {
            value = false;
        }
        return value;
    }
    
    static OnKill(npc) {
        if (this.isModType(npc.type)) {
            this.getModNPC(npc.type)?.OnKill(npc);
        }
        for (const gNpc of GlobalNPC.RegisteredNPCs) {
            gNpc?.OnKill(npc);
        }
    }
    
    static BossLoot(npc, potionType) {
        let value = potionType;
        if (this.isModType(npc.type)) {
            value = this.getModNPC(npc.type)?.BossLoot(npc, potionType) ?? value;
        }
        return value;
    }
    
    static BeforeLoot(npc, player) {
        let value = true;
        if (this.isModType(npc.type)) {
            value = this.getModNPC(npc.type)?.BeforeLoot(npc, player) ?? true;
        }
        return value;
    }
    
    static DropHeals(npc, player) {
        let value = true;
        if (this.isModType(npc.type)) {
            value = this.getModNPC(npc.type)?.DropHeals(npc, player) ?? true;
        }
        return value;
    }
    
    static ModifyItemDropFromNPC(npc, itemIndex) {
        if (this.isModType(npc.type)) {
            this.getModNPC(npc.type)?.ModifyItemDropFromNPC(npc, itemIndex);
        }
    }
    
    static HitEffect(npc, hitDirection, damage) {
        if (this.isModType(npc.type)) {
            this.getModNPC(npc.type)?.HitEffect(npc, hitDirection, damage);
        }
        for (const gNpc of GlobalNPC.RegisteredNPCs) {
            gNpc?.HitEffect(npc, hitDirection, damage);
        }
    }
    
    static CanFallThroughPlatforms(npc) {
        let value = null;
        if (this.isModType(npc.type)) {
            value = this.getModNPC(npc.type)?.CanFallThroughPlatforms(npc);
        }
        return value;
    }
    
    static CanBeCaughtBy(npc, player, item) {
        let value = true;
        if (this.isModType(npc.type)) {
            value = this.getModNPC(npc.type)?.CanBeCaughtBy(npc, player, item) ?? value;
        }
        if (GlobalNPC.RegisteredNPCs.some(gN => (gN?.CanBeCaughtBy(npc, player, item) ?? true) === false)) {
            value = false;
        }
        return value;
    }
    
    static OnCaughtBy(npc, player, item, failed) {
        if (this.isModType(npc.type)) {
            this.getModNPC(npc.type)?.OnCaughtBy(npc, player, item, failed);
        }
        for (const gNpc of GlobalNPC.RegisteredNPCs) {
            gNpc?.OnCaughtBy(npc, player, item, failed);
        }
    }
    
    static OnHitByPlayer(npc, player, item, damageDone, knockBack) {
        if (this.isModType(npc.type)) {
            this.getModNPC(npc.type)?.OnHitByPlayer(npc, player, item, damageDone, knockBack);
        }
        for (const gNpc of GlobalNPC.RegisteredNPCs) {
            gNpc?.OnHitByPlayer(npc, player, item, damageDone, knockBack);
        }
    }
    
    static OnHitByProjectile(npc, projectile) {
        if (this.isModType(npc.type)) {
            this.getModNPC(npc.type)?.OnHitByProjectile(npc, projectile);
        }
        for (const gNpc of GlobalNPC.RegisteredNPCs) {
            gNpc?.OnHitByProjectile(npc, projectile);
        }
    }
    
    static UpdateLifeRegen(npc, damage) {
        let dmg = damage;
        if (this.isModType(npc.type)) {
            this.getModNPC(npc.type)?.UpdateLifeRegen(npc, dmg);
        }
        for (const gNpc of GlobalNPC.RegisteredNPCs) {
            dmg = npc.lifeRegenExpectedLossPerSecond;
            gNpc?.UpdateLifeRegen(npc, dmg);
        }
    }
    
    static GetNewNPCName(type) {
        const list = [];
        if (this.isModType(type)) {
            list.push(...(this.getModNPC(type)?.SetNPCNameList() ?? []));
        }
        for (const gNpc of GlobalNPC.RegisteredNPCs) {
            const r = gNpc?.SetNPCNameList(type) ?? [];
            if (r.length > 0) list.push(...r);
        }
        if (list.length == 0) return null;
        return list[Math.floor(Math.random()*list.length)];
    }
    
    static CanChat(npc) {
        let value = npc.townNPC || npc.type === Terraria.ID.NPCID.SkeletonMerchant;
        if (this.isModType(npc.type)) {
            value = this.getModNPC(npc.type)?.CanChat(npc) ?? value;
        }
        if (GlobalNPC.RegisteredNPCs.some(gN => (gN?.CanChat(npc) ?? value) === false)) {
            value = false;
        }
        return value;
    }
    
    static GetChat(npc) {
        let value = '';
        if (this.isModType(npc.type)) {
            value += this.getModNPC(npc.type)?.GetChat(npc) ?? '';
        }
        for (const gNpc of GlobalNPC.RegisteredNPCs) {
            value += gNpc?.GetChat(npc) ?? '';
        }
        if (value.length > 0) {
            Terraria.Recipe.FindRecipes(false);
            return value;
        }
        return null;
    }
    
    static CanGoToStatue(npc, toKingStatue) {
        let value = null;
        if (this.isModType(npc.type)) {
            value = this.getModNPC(npc.type)?.CanGoToStatue(npc, toKingStatue);
        }
        for (const gNpc of GlobalNPC.RegisteredNPCs) {
            let flag = gNpc?.CanGoToStatue(npc, toKingStatue);
            if (flag != null) {
                value = flag;
            }
        }
        return value;
    }
    
    static OnGoToStatue(npc, toKingStatue) {
        if (this.isModType(npc.type)) {
            this.getModNPC(npc.type)?.OnGoToStatue(npc, toKingStatue);
        }
        for (const gNpc of GlobalNPC.RegisteredNPCs) {
            gNpc?.OnGoToStatue(npc, toKingStatue);
        }
    }
    
    static SetChatButtons(npc, player, button1, button2) {
        if (this.isModType(npc.type)) {
            this.getModNPC(npc.type)?.SetChatButtons(npc, player, button1, button2);
            return;
        }
        for (const gNpc of GlobalNPC.RegisteredNPCs) {
            gNpc?.SetChatButtons(npc, player, button1, button2);
        }
    }
    
    static Option1Clicked(npc, player, cost) {
        if (this.isModType(npc.type)) {
            this.getModNPC(npc.type)?.Option1Clicked(npc, player, cost);
            return;
        }
        for (const gNpc of GlobalNPC.RegisteredNPCs) {
            gNpc?.Option1Clicked(npc, player, cost);
        }
    }
    
    static Option2Clicked(npc, player) {
        if (this.isModType(npc.type)) {
            this.getModNPC(npc.type)?.Option2Clicked(npc, player);
            return;
        }
        for (const gNpc of GlobalNPC.RegisteredNPCs) {
            gNpc?.Option2Clicked(npc, player);
        }
    }
    
    static OpenShop(npc, player, shopIndexOrName) {
        let flag1 = this.isModType(npc.type);
        if (!flag1 && npc.type >= this.MAX_VANILLA_ID) return;
        
        let shopIndex = (typeof shopIndexOrName === 'string'
        ? NPCShop.GetShopByName(shopIndexOrName) : shopIndexOrName) ?? 99;
        
        Terraria.Main.playerInventory = true;
        Terraria.Main.npcChatText = "";
        Terraria.Main.npcShop = shopIndex;
        GUIInstance.Active.GUIPageIcons.OpenUI(GUIPageIcons.Category.Inventory, GUIPageIcons.Category.Shop);
        
        const shop = new NPCShop(shopIndex);
        if (flag1) {
            const modNpc = this.getModNPC(npc.type);
            modNpc.SetupShop(npc, player, shop);
        }
    }
    
    static SetupShop(npc, player, type) {
        const shop = new NPCShop(type);
        GlobalNPC.RegisteredNPCs.forEach(gP => gP.SetupShop(npc, player, shop));
    }
    
    static ModifyNPCHappiness(npc, player, primaryPlayerBiome, shopHelper, nearbyNPCsByType) {
        if (this.isModType(npc.type)) {
            this.getModNPC(npc.type)?.ModifyNPCHappiness(npc, player, primaryPlayerBiome, shopHelper, nearbyNPCsByType);
        }
        for (const gNpc of GlobalNPC.RegisteredNPCs) {
            gNpc?.ModifyNPCHappiness(npc, player, primaryPlayerBiome, shopHelper, nearbyNPCsByType);
        }
    }
}