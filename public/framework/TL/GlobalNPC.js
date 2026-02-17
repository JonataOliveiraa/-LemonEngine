import { NPCLoader } from './Loaders/NPCLoader.js';

export class GlobalNPC {
    static RegisteredNPCs = [];
    constructor() {
        
    }
    
    SetDefaults(npc) {
        
    }
    
    OnSpawn(npc, source) {
        
    }
    
    PreAI(npc) {
        return true;
    }
    
    AI(npc) {
        
    }
    
    PostAI(npc) {
        
    }
    
    GetAlpha(npc, newColor) {
        return newColor;
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
    
    HitEffect(npc, hitDirection, damage) {
        
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
    
    SetNPCNameList(type) {
        
    }
    
    CanChat(npc) {
        
    }
    
    GetChat(npc) {
        
    }
    
    SetChatButtons(npc, button1, button2) {
        
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
    
    PostSetupShop(npc, player, npcShop) {
        
    }
    
    ModifyNPCHappiness(npc, player, primaryPlayerBiome, shopHelper, nearbyNPCsByType) {
        
    }
    
    CanGoToStatue(npc, toKingStatue) {
        return null;
    }
    
    OnGoToStatue(npc, toKingStatue) {
        
    }
    
    static register(npc) {
        this.RegisteredNPCs.push(new npc());
    }
    static getByName(name) {
        return this.RegisteredNPCs.find(n => n.constructor.name === name);
    }
}