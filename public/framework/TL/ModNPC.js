import { Terraria } from './ModImports.js';
import { NPCLoader } from './Loaders/NPCLoader.js';
import { ModTexturedType } from './ModTexturedType.js';

export class ModNPC extends ModTexturedType {
    NPC = null;
    
    Type = null;
    AIType = 0;
    AnimationType = 0;
    Music = -1;
    
    // string
    DisplayName = '';
    // @returns string Message
    DeathMessage = (npc) => '';
    // @returns Color || Object { R, G, B }
    DeathMessageColor = (npc) => null;
    
    Banner = 0;
    BannerItem = 0;
    KillsToBanner = 25;
    
    hideFromBestiary = false;
    BestiaryRarityStars = 1;
    
    // int
    SpawnWithHigherTime = null;
    // string []
    MenuCategories = [];
    
    constructor() {
        super();
    }
    
    SetupContent() {
        let name = this.constructor.name;
        let originalName = name, i = 1;
        while (Terraria.ID.NPCID.Search.ContainsName(name)) name = originalName + i++;
        Terraria.ID.NPCID.Search.Add(name, this.Type);
        
        if (this.NPC.townNPC) {
            if (!this.NPC.housingCategory) this.NPC.housingCategory = 0;
            this.NPC.homeless = false;
            this.NPC.homeTileX = -1;
            this.NPC.homeTileY = -1;
        }
        
        const npc = Terraria.NPC.new();
        npc['void .ctor()']();
        Object.assign(npc, this.NPC);
        npc.type = npc.netID = this.Type;
        
        Terraria.ID.ContentSamples.NpcsByNetId.Add(this.Type, npc);
        Terraria.ID.ContentSamples.NpcBestiarySortingId.Add(this.Type, this.Type);
        Terraria.ID.ContentSamples.NpcBestiaryRarityStars.Add(this.Type, this.BestiaryRarityStars);
        Terraria.ID.ContentSamples.NpcBestiaryCreditIdsByNpcNetIds.Add(this.Type, name);
        Terraria.ID.ContentSamples.NpcNetIdsByPersistentIds.Add(name, this.Type);
        Terraria.ID.ContentSamples.NpcPersistentIdsByNetIds.Add(this.Type, name);
        
        NPCLoader.AddToMenu(this);
    }
    
    SetStaticDefaults() {
        
    }
    
    SetDefaults() {
        
    }
    
    // Used to override settings after SetStaticDefaults();
    PostStaticDefaults() {
        
    }
    
    // Used to ensure that all npcs have been initialized
    PostSetupContent() {
        
    }
    
    // Allows you to modify the DisplayName after the translation is applied
    ModifyDisplayName() {
        
    }
    
    // npc.buffImmune[buffType] = true;
    ApplyBuffImmunity(npc) {
        
    }
    
    ApplyDifficultyAndPlayerScaling(npc, numPlayers, balance, bossAdjustment) {
        
    }
    
    SetBestiary(database, bestiaryEntry) {
        
    }
    
    OnSpawn(npc, source) {
        
    }
    
    SpawnChance(spawnInfo) {
        return 0;
    }
    
    SpawnNPC(spawnX, spawnY) {
        return Terraria.NPC.NewNPC(
            Terraria.NPC.GetSpawnSourceForNaturalSpawn(),
            spawnX, spawnY, this.Type,
            0, 0, 0, 0, 0, 255
        );
    }
    
    PreAI(npc) {
        return true;
    }
    
    AI(npc) {
        
    }
    
    PostAI(npc) {
        
    }
    
    PreDraw(npc, spriteBatch, screenPos) {
        return true;
    }
    
    PostDraw(npc, spriteBatch, screenPos) {
        
    }
    
    FindFrame(npc, frameHeight) {
        
    }
    
    GetAlpha(npc, newColor) {
        return newColor;
    }
    
    BossHeadSlot(npc) {
        return null;
    }
    
    BossHeadRotation(npc) {
        return null;
    }
    
    NPCHeadSlot() {
        return NPCLoader.TypeToNPCHead[this.Type] ?? -1;
    }
    
    CheckActive(npc) {
        return true;
    }
    
    CheckDead(npc) {
        return true;
    }
    
    PreKill(npc) {
        return true;
    }
    
    OnKill(npc) {
        
    }
    
    BeforeLoot(npc, player) {
        return true;
    }
    
    DropHeals(npc, player) {
        return true;
    }
    
    ModifyNPCLoot(npcLoot) {
        
    }
    
    ModifyItemDropFromNPC(npc, itemIndex) {
        
    }
    
    BossLoot(npc, potionType) {
        return potionType;
    }
    
    HitEffect(npc, hitDirection, damage) {
        
    }
    
    CanFallThroughPlatforms(npc) {
        return null;
    }
    
    CanBeCaughtBy(npc, player, item) {
        return true;
    }
    
    OnCaughtBy(npc, player, item, failed) {
        
    }
    
    OnHitByPlayer(npc, player, item, damageDone, knockBack) {
        
    }
    
    OnHitByProjectile(npc, projectile) {
        
    }
    
    UpdateLifeRegen(npc, damage) {
        
    }
    
    SetNPCNameList() {
        return [];
    }
    
    CanTownNPCSpawn() {
        return false;
    }
    
    CheckConditions(left, right, top, bottom) {
        return true;
    }
    
    UsesPartyHat(npc) {
        return true;
    }
    
    CanChat(npc) {
        return npc.townNPC;
    }
    
    GetChat(npc) {
        return '';
    }
    
    SetChatButtons(npc, player, button1, button2) {
        button1.text = '';
        button1.texture = null;
        button1.cost = 0;
        button2.text = '';
        button2.texture = null;
    }
    
    Option1Clicked(npc, player, cost) {
        
    }
    
    Option2Clicked(npc, player) {
        
    }
    
    OpenShop(npc, player, shopIndexOrName = null) {
        NPCLoader.OpenShop(npc, player, shopIndexOrName);
    }
    
    SetupShop(npc, player, npcShop) {
        
    }
    
    ModifyNPCHappiness(npc, player, primaryPlayerBiome, shopHelper, nearbyNPCsByType) {
        
    }
    
    CanGoToStatue(npc, toKingStatue) {
        return false;
    }
    
    OnGoToStatue(npc, toKingStatue) {
        
    }
    
    /**
     * Terraria.ID.NPCID.Sets.AttackType[this.Type];
     *   0 - Throwing
     *   1 - Shooting
     *   2 - Magic
     *   3 - Swinging
     */
    TownNPCAttack(npc, justStarted, attackTime) {
        
    }
    
    static NPCValue(p = 0, g = 0, s = 0, c = 0) {
        return p * 1000000 + g * 10000 + s * 100 + c;
    }
    
    static register(npc) {
        NPCLoader.NPCs.push(new npc());
    }
    static isModType(type) { return NPCLoader.isModType(type); }
    static isModNPC(npc) { return NPCLoader.isModNPC(npc); }
    static getByName(name) { return NPCLoader.getByName(name); }
    static getTypeByName(name) { return NPCLoader.getTypeByName(name); }
    static getModNPC(type) { return NPCLoader.getModNPC(type); }
}