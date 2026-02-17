import { Terraria } from './ModImports.js';
import { ItemLoader } from './Loaders/ItemLoader.js';
import { ModRecipe } from './ModRecipe.js';
import { ModTexturedType } from './ModTexturedType.js';
import { ModLocalization } from './ModLocalization.js';

export class ModItem extends ModTexturedType {
    static CommonMaxStack = 9999;
    
    Item = undefined;
    Type = undefined;
    
    // string
    DisplayName = '';
    // string []
    TooltipLines = [];
    
    // string []
    MenuCategories = [];
    
    constructor() {
        super();
    }
    
    SetupContent() {
        let name = '';
        if (this.IsTileItem) {
            name = ModTile.getModTile(this.TileType).constructor.name + 'Item';
        } else {
            name = this.constructor.name;
        }
        
        let originalName = name, i = 1;
        while (Terraria.ID.ItemID.Search.ContainsName(name)) name = originalName + i++;
        Terraria.ID.ItemID.Search.Add(name, this.Type);
        
        const item = Terraria.Item.new();
        item['void .ctor()']();
        item.type = item.netID = this.Type;
        item.ToolTip = ModLocalization.getTranslationItemTooltip(this.Type);
        
        Terraria.ID.ContentSamples.ItemsByType.Add(this.Type, item);
        Terraria.ID.ContentSamples.ItemPersistentIdsByNetIds.Add(this.Type, name);
        Terraria.ID.ContentSamples.ItemNetIdsByPersistentIds.Add(name, this.Type);
        
        ItemLoader.AddToMenu(this);
    }
    
    SetStaticDefaults() {
        
    }
    
    SetDefaults() {
        
    }
    
    CloneDefaults(Type) {
        if (Type > 0 && Type < ItemLoader.MAX_VANILLA_ID) {
            const obj = Terraria.Item.new();
            obj['void .ctor()']();
            obj['void SetDefaults(int Type)'](Type);
            for (const key of ItemLoader.ItemProperties) {
                if (obj[key] == null) continue;
                this.Item[key] = obj[key];
            }
        }
    }
    
    // Used to override settings after SetStaticDefaults();
    PostStaticDefaults() {
        
    }
    
    // Used to override settings after SetDefaults();
    PostSetDefaults() {
        
    }
    
    // Used to ensure that all items have been initialized
    PostSetupContent() {
        
    }
    
    // Here you can modify the item name after the translation is applied
    ModifyDisplayName() {
        
    }
    
    // Here you can modify the tooltip lines before they are added
    // This method doesn't return anything; you must modify the this.TooltipLines array. This array will be populated with the item's tooltip before the method is called.
    // See "Content/Items/Accessories/ExampleStatAccessory.js";
    ModifyTooltipLines() {
        
    }
    
    // Set the useTime and useStyle of your item along with other related properties easily
    SetDefaultWeaponStyle(useTime = 30, autoReuse = false) {
        this.Item.useTime = useTime;
        this.Item.useAnimation = useTime;
        this.Item.autoReuse = autoReuse;
        if (this.Item.melee) {
            this.Item.useStyle = Terraria.ID.ItemUseStyleID.Swing;
        } else if (this.Item.shoot > 0) {
            if (this.Item.consumable) this.Item.useStyle = Terraria.ID.ItemUseStyleID.Swing;
            else this.Item.useStyle = Terraria.ID.ItemUseStyleID.Shoot;
        } else {
            this.Item.useStyle = Terraria.ID.ItemUseStyleID.Swing;
        }
    }
    
    // Set your weapon's base values
    SetWeaponValues(damage = 0, knockBack = 0, crit = 0) {
        this.Item.damage = damage;
        this.Item.knockBack = knockBack;
        this.Item.crit = crit;
    }
    
    // Set the default properties of a placeable item easily
    DefaultToPlaceableTile(typeToPlace, styleToPlace = 0) {
        this.Item.createTile = typeToPlace;
        this.Item.placeStyle = styleToPlace;
        this.Item.useStyle = Terraria.ID.ItemUseStyleID.Swing;
        this.Item.useAnimation = 15;
        this.Item.useTime = 10;
        this.Item.maxStack = ModItem.CommonMaxStack;
        this.Item.useTurn = true;
        this.Item.autoReuse = true;
        this.Item.consumable = true;
    }
    
    // Set the default properties of a QuestFish
    DefaultToQuestFish() {
        this.Item.questItem = true;
        this.Item.maxStack = 1;
        this.Item.uniqueStack = true;
        this.Item.rare = Terraria.ID.ItemRarityID.Quest;
    }
    
    // Set the default properties of a Whip
    DefaultToWhip(projectileId, dmg, kb, shootSpeed, useTime = 30) {
        this.Item.autoReuse = false;
        this.Item.useStyle = Terraria.ID.ItemUseStyleID.Swing;
        this.Item.useAnimation = useTime;
        this.Item.useTime = useTime;
        this.Item.width = 18;
        this.Item.height = 18;
        this.Item.shoot = projectileId;
        this.Item.UseSound = Terraria.ID.SoundID.Item152;
        this.Item.noMelee = true;
        this.Item.summon = true;
        this.Item.noUseGraphic = true;
        this.Item.damage = dmg;
        this.Item.knockBack = kb;
        this.Item.shootSpeed = shootSpeed;
    }
    
    AllowPrefix(pre) {
        return true;
    }
    
    ChoosePrefix(rand, originalPrefix) {
        return -1;
    }
    
    CanUseItem(item, player) {
        return true;
    }
    
    CanAutoReuseItem(item, player) {
        return true;
    }
    
    ConsumeItem(item, player) {
        return item.consumable;
    }
    
    OnConsumeItem(item, player) {
        
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
    
    GetHealLife(item, player, healValue) {
        return healValue;
    }
    
    GetHealMana(item, player, healValue) {
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
    
    IsArmorSet(head, body, legs) {
        return false;
    }
    
    UpdateArmorSet(item, player) {
        
    }
    
    IsVanitySet(head, body, legs) {
        return this.IsArmorSet(head, body, legs);
    }
    
    UpdateVanitySet(item, player) {
        
    }
    
    SetWingStats(
        flyTime = 100,
        flySpeedOverride = -1,
        accelerationMultiplier = 1,
        hasHoldDownHoverFeatures = false,
        hoverFlySpeedOverride = -1,
        hoverAccelerationMultiplier = 1
    ) {
        if (this.Item.wingSlot > 0) {
            const stats = Terraria.DataStructures.WingStats.new();
            stats.FlyTime = flyTime;
            stats.AccRunSpeedOverride = flySpeedOverride;
            stats.AccRunAccelerationMult = accelerationMultiplier;
            stats.HasDownHoverStats = hasHoldDownHoverFeatures;
            stats.DownHoverSpeedOverride = hoverFlySpeedOverride;
            stats.DownHoverAccelerationMult = hoverAccelerationMultiplier;
            Terraria.ID.ArmorIDs.Wing.Sets.Stats[this.Item.wingSlot] = stats;
        }
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
    
    // return { X: 0, Y: 0 };
    HoldoutOffset(item, player) {
        return null;
    }
    
    // only if Terraria.ID.ItemID.Sets.ExtractinatorMode[this.Type] >= 0
    // For tile items use Terraria.ID.ItemID.Sets.ExtractinatorMode[this.Item.Type] = 1; in ModTile.PostSetupContent();
    // Return false to prevent vanilla behavior
    ExtractinatorUse(item, player, extractType, extractinatorBlockType) {
        return true;
    }
    
    IsQuestFish() {
        return false;
    }
    
    IsAnglerQuestAvailable() {
        return true;
    }
    
    AddRecipes() {
        
    }
    
    CreateRecipe(count = 1) {
        return new ModRecipe().SetResult(this.Type, count);
    }
    
    static sellPrice(platinum = 0, gold = 0, silver = 0, copper = 0) {
        return Terraria.Item.sellPrice(platinum, gold, silver, copper);
    }
    static buyPrice(platinum = 0, gold = 0, silver = 0, copper = 0) {
        return Terraria.Item.buyPrice(platinum, gold, silver, copper);
    }
    
    static register(item) {
        if (typeof item === 'function') {
            ItemLoader.Items.push(new item());
        } else {
            ItemLoader.Items.push(item);
        }
    }
    
    static isModType(type) { return ItemLoader.isModType(type); }
    static isModItem(item) { return ItemLoader.isModItem(item); }
    static getByName(name) { return ItemLoader.getByName(name); }
    static getTypeByName(name) { return ItemLoader.getTypeByName(name); }
    static getModItem(type) { return ItemLoader.getModItem(type); }
}