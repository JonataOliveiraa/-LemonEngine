export class GlobalItem {
    static RegisteredItems = [];
    constructor() {}
    
    SetDefaults(item) {
        
    }
    
    CanUseItem(item, player) {
        return true;
    }
    
    CanAutoReuseItem(item, player) {
        return true;
    }
    
    UseStyle(item, player, mountOffset, heldItemFrame) {
        
    }
    
    HoldStyle(item, player, mountOffset, heldItemFrame) {
        
    }
    
    HoldItem(item, player) {
        
    }
    
    UseTimeMultiplier(item, player) {
        return 1.0;
    }
    
    UseAnimationMultiplier(item, player) {
        return 1.0;
    }
    
    UseSpeedMultiplier(item, player) {
        return 1.0;
    }
    
    UseItem(item, player) {
        return true;
    }
    
    UseAnimation(item, player) {
        
    }
    
    GetHealLife(player, healValue) {
        return healValue;
    }
    
    GetHealMana(player, healValue) {
        return healValue;
    }
    
    OnMissingMana(item, player, neededMana) {
        
    }
    
    OnConsumeMana(item, player, manaConsumed) {
        
    }
    
    ModifyManaCost(item, player, mana) {
        return mana;
    }
    
    ModifyWeaponDamage(item, player, damage) {
        return damage;
    }
    
    // Called only if the item can shoot
    ModifyWeaponKnockback(item, player, knockBack) {
        return knockBack;
    }
    
    CanShoot(item, player) {
        return true;
    }
    
    // stats = { position, velocity, type, damage, knockBack };
    ModifyShootStats(item, player, stats) {
        
    }
    
    Shoot(item, player, position, velocity, type, damage, knockBack) {
        return true;
    }
    
    OnHitNPC(item, player, npc, damageDone, knockBack) {
        
    }
    
    UpdateInventory(item, player) {
        
    }
    
    UpdateEquip(item, player) {
        
    }
    
    UpdateAccessory(item, player, vanity, hideVisual) {
        
    }
    
    UpdateArmorSet(item, player) {
        
    }
    
    UpdateVanitySet(item, player) {
        
    }
    
    WingMovement(item, player) {
        
    }
    
    CanPickup(item, player) {
        return true;
    }
    
    OnPickup(item, player) {
        
    }
    
    OnCraft(item, player, recipe) {
        
    }
    
    GetAlpha(item, color) {
        return color;
    }
    
    // only if Terraria.ID.ItemID.Sets.ExtractinatorMode[item.type] > 0
    // Return false to prevent vanilla behavior
    ExtractinatorUse(item, player, extractType, extractinatorBlockType) {
        return true;
    }
    
    IsAnglerQuestAvailable() {
        return true;
    }
    
    AddRecipes() {
        
    }
    
    CreateRecipe(itemId, count = 1) {
        return new ModRecipe().SetResult(itemId, count);
    }
    
    static register(gItem) {
        this.RegisteredItems.push(new gItem());
    }
    static getByName(name) {
        return this.RegisteredItems.find(i => i.constructor.name === name);
    }
}