import { PlayerLoader } from './Loaders/PlayerLoader.js';

export class ModPlayer {
    
    CumulativeHealth = 0;
    CumulativeMana = 0;
    Luck = 0;
    ManaCost = 0;
    WeaponDamage = 0;
    WeaponKnockback = 0;
    
    constructor() {}
    
    OnEnterWorld(player) {
        
    }
    
    OnRespawn(player) {
        
    }
    
    SetupStartingItems(player, mediumCoreDeath) {
        
    }
    
    ResetEffects(player) {
        
    }
    
    UpdateDead(player) {
        
    }
    
    ModifyMaxStats(player) {
        this.CumulativeHealth = 0;
        this.CumulativeMana = 0;
    }
    
    UpdateBadLifeRegen(player) {
        
    }
    
    UpdateLifeRegen(player) {
        
    }
    
    UpdateManaRegen(player) {
        
    }
    
    PreUpdate(player) {
        
    }
    
    PostUpdate(player) {
        
    }
    
    PreUpdateBuffs(player) {
        
    }
    
    PostUpdateBuffs(player) {
        
    }
    
    PreItemCheck(player) {
        return true;
    }
    
    PostItemCheck(player) {
        
    }
    
    CanUseItem(player, item) {
        return true;
    }
    
    CanAutoReuseItem(player, item) {
        return true;
    }
    
    ConsumeItem(player, item) {
        return true;
    }
    
    OnConsumeItem(player, item) {
        
    }
    
    UseTimeMultiplier(player, item) {
        return 1.0;
    }
    
    UseAnimationMultiplier(player, item) {
        return 1.0;
    }
    
    UseSpeedMultiplier(player, item) {
        return 1.0;
    }
    
    UseItem(player, item) {
        return true;
    }
    
    UseAnimation(player, item) {
        
    }
    
    GetHealLife(player, item, healValue) {
        return healValue;
    }
    
    GetHealMana(player, item, healValue) {
        return healValue;
    }
    
    OnMissingMana(player, item, neededMana) {
        
    }
    
    OnConsumeMana(player, item, manaConsumed) {
        
    }
    
    ModifyManaCost(player, item, mana) {
        this.ManaCost = mana;
    }
    
    ModifyWeaponDamage(player, item, damage) {
        this.WeaponDamage = damage;
    }
    
    // Called only if the item can shoot
    ModifyWeaponKnockback(player, item, knockBack) {
        this.WeaponKnockback = knockBack;
    }
    
    PreModifyLuck(player, luck) {
        return true;
    }
    
    ModifyLuck(player, luck) {
        this.Luck = luck;
    }
    
    CanShoot(player, item) {
        return true;
    }
    
    // stats = { position, velocity, type, damage, knockBack };
    ModifyShootStats(player, stats) {
        
    }
    
    Shoot(player, item, position, velocity, type, damage, knockBack) {
        return true;
    }
    
    OnHitNPC(player, item, npc, damageDone, knockBack) {
        
    }
    
    OnHitNPCWithProj(player, npc, projectile) {
        
    }
    
    UpdateInventory(player) {
        
    }
    
    UpdateEquips(player) {
        
    }
    
    UpdateAccessory(player, item, vanity, hideVisual) {
        
    }
    
    UpdateDyes(player) {
        
    }
    
    IsArmorSet(player, head, body, legs) {
        return false;
    }
    
    UpdateArmorSet(player) {
        
    }
    
    IsVanitySet(player, head, body, legs) {
        return this.IsArmorSet(player, head, body, legs);
    }
    
    UpdateVanitySet(player) {
        
    }
    
    UpdateCamera(player) {
        
    }
    
    UpdateMovement(player) {
        
    }
    
    WingMovement(player, item) {
        
    }
    
    CanPickup(player, item) {
        return true;
    }
    
    OnPickup(player, item) {
        
    }
    
    OnCraft(player, recipe) {
        
    }
    
    ExtractinatorUse(player, item, extractType, extractinatorBlockType) {
        return true;
    }
    
    ImmuneTo(player, damageSource, cooldownCounter, dodgeable) {
        return false;
    }
    
    FreeDodge(player, damageSource, damage, hitDirection, pvp, quiet, crit, cooldownCounter, dodgeable) {
        return false;
    }
    
    // modifiers = { damage, hitDirection, quiet, crit, dodgeable };
    ModifyHurt(player, modifiers) {
        
    }
    
    OnHurt(player, damageSource, damage, hitDirection, pvp, quiet, crit, cooldownCounter, dodgeable) {
        
    }
    
    PostHurt(player, damageSource, damage, hitDirection, pvp, quiet, crit, cooldownCounter, dodgeable) {
        
    }
    
    PreKill(player, damageSource, damage, hitDirection, pvp) {
        
    }
    
    Kill(player, damageSource, damage, hitDirection, pvp) {
        
    }
    
    GetDyeTraderReward(player, dyeTrader, rewardItems) {
        
    }
    
    AnglerQuestReward(player, angler, questItemType) {
        return true;
    }
    
    CanSellItem(player, npc, shopInventory, item) {
        return true;
    }
    
    PostSellItem(player, npc, shopInventory, item) {
        
    }
    
    CanCatchNPC(player, npc, item) {
        return true;
    }
    
    OnCatchNPC(player, npc, item, failed) {
        
    }
    
    CanReleaseNPC(player, npcType, item, x, y) {
        return true;
    }
    
    OnReleaseNPC(player, npc) {
        
    }
    
    ModifyCaughtFish(player, itemType) {
        return itemType;
    }
    
    SendMessage(player, message) {
        return true;
    }
    
    static register(player) {
        PlayerLoader.RegisteredPlayers.push(new player());
    }
    static getAll() {
        return PlayerLoader?.RegisteredPlayers ?? [];
    }
    static getByName(name) {
        return PlayerLoader.getByName(name);
    }
}