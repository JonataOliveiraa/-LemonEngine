import { Terraria, Modules } from './../ModImports.js';
import { ModLoader } from './../Core/ModLoader.js';
import { ModTexture } from './../ModTexture.js';
import { ModLocalization } from './../ModLocalization.js';
import { ModItem } from './../ModItem.js';
import { GlobalItem } from './../GlobalItem.js';
import { TileLoader } from './TileLoader.js';

const { Vector2 } = Modules;

function cloneResizedSetLastItem(array, newSize, value) {
    const resized = array.cloneResized(newSize);
    if (value != null) resized[newSize - 1] = value;
    return resized;
}

function resizeArrayProperty(propertyHolder, propertyName, newSize, value) {
    propertyHolder[propertyName] = cloneResizedSetLastItem(propertyHolder[propertyName], newSize, value);
}

function addToArray(propertyHolder, propertyName, value) {
    const array = propertyHolder[propertyName];
    const arrayLength = array.length;
    propertyHolder[propertyName] = cloneResizedSetLastItem(array, arrayLength + 1, value);
}

export class ItemLoader {
    static Items = [];
    static MAX_VANILLA_ID = Terraria.ID.ItemID.Count;
    static Count = 0;
    static TypeOffset = 0;
    static ModTypes = new Set();
    static TypeToIndex = {};
    static ItemCount = this.MAX_VANILLA_ID + this.Count;
    static MenuCategories = {};
    static TL_Categories = tl.cheatMenu.getItemCategories();
    
    static isModItem(item) { return this.isModType(item.type); }
    static isModType(type) { return this.ModTypes.has(type); }
    static getByName(name) { return this.Items.find(t => t.constructor.name === name); }
    static getTypeByName(name) { return this.getByName(name)?.Type; }
    static getModItem(type) {
        if (this.ModTypes.has(type)) {
            return this.Items[this.TypeToIndex[type]];
        }
        return undefined;
    }
    
    static _NPCToBanner = {};
    static _BannerToNPC = {};
    static _BannerToItem = {};
    
    static ItemProperties = [
        'tooltipContext',
        'BestiaryNotes',
        'sentry',
        'canBePlacedInVanityRegardlessOfConditions',
        'DD2Summon',
        'shopSpecialCurrency',
        'expert',
        'expertOnly',
        'questItem',
        'fishingPole',
        'bait',
        'hairDye',
        'makeNPC',
        'dye',
        'paint',
        'tileWand',
        'notAmmo',
        'prefix',
        'crit',
        'mech',
        'reuseDelay',
        'melee',
        'magic',
        'ranged',
        'summon',
        'placeStyle',
        'buffTime',
        'buffType',
        'mountType',
        'cartTrack',
        'material',
        'noWet',
        'vanity',
        'mana',
        'wet',
        'wetCount',
        'lavaWet',
        'channel',
        'manaIncrease',
        'timeSinceTheItemHasBeenReservedForSomeone',
        'noMelee',
        'noUseGraphic',
        'lifeRegen',
        'shootSpeed',
        'alpha',
        'ammo',
        'useAmmo',
        'autoReuse',
        'accessory',
        'axe',
        'healMana',
        'potion',
        'color',
        'consumable',
        'createTile',
        'createWall',
        'damage',
        'defense',
        'hammer',
        'healLife',
        'holdStyle',
        'knockBack',
        'maxStack',
        'pick',
        'rare',
        'scale',
        'shoot',
        'tileBoost',
        'useStyle',
        'useTime',
        'useAnimation',
        'value',
        'useTurn',
        'buy',
        'uniqueStack'
    ];
    
    static LoadItems() {
        this.TypeOffset = ModLoader.ModData.ItemCount ?? 0;
        
        if (this.Items.length > 0) {
            class BugFix extends ModItem {
                constructor() {
                    super();
                }
                
                PostStaticDefaults() {
                    this.MenuCategories = [];
                }
                
                AddRecipes() {
                    this.CreateRecipe()
                    .AddIngredient(this.Type)
                    .SetProperty('needHoney', true)
                    .SetProperty('needWater', true)
                    .SetProperty('needLava', true)
                    .SetProperty('needSnowBiome', true)
                    .SetProperty('needGraveyardBiome', true)
                    .AddTile(668)
                    .Register();
                }
            }
            this.Items.push(new BugFix());
        }
        
        for (const item of this.Items) {
            this.LoadItem(item);
        }
    }
    
    static LoadItem(item) {
        this.Count++;
        let itemName = item.IsTileItem ? item.TileName + 'Item' : item.constructor.name;
        
        item.Item = {};
        item.Type = item.Item.type = item.Item.netID = tl.item.registerNew(itemName);
        this.ModTypes.add(item.Type);
        const nextItem = item.Type + 1;
        this.TypeToIndex[item.Type] = this.Items.indexOf(item);
        
        addToArray(Terraria.Lang, '_itemNameCache', ModLocalization.getTranslationItemName(item.Type));
        addToArray(Terraria.Lang, '_itemTooltipCache', Terraria.UI.ItemTooltip.None);
        
        resizeArrayProperty(Terraria.ID.ItemID.Sets, 'ToolTipDamageMultiplier', nextItem, 1);
        resizeArrayProperty(Terraria.ID.ItemID.Sets, 'CanGetPrefixes', nextItem, true);
        resizeArrayProperty(Terraria.ID.ItemID.Sets, 'ExtractinatorMode', nextItem, -1);
        resizeArrayProperty(Terraria.ID.ItemID.Sets, 'SortingPriorityRopes', nextItem, -1);
        resizeArrayProperty(Terraria.ID.ItemID.Sets, 'KillsToBanner', nextItem);
        
        resizeArrayProperty(Terraria.Item, 'cachedItemSpawnsByType', nextItem, -1);
        resizeArrayProperty(Terraria.Item, 'staff', nextItem);
        resizeArrayProperty(Terraria.Item, 'claw', nextItem);
        
        if (item?.IsQuestFish()) {
            const newSize = Terraria.Main.anglerQuestItemNetIDs.length + 1;
            resizeArrayProperty(Terraria.Main, 'anglerQuestItemNetIDs', newSize, item.Type);
        }
        
        this.SetupTextures(item);
        
        if (item.IsTileItem) {
            const tile = TileLoader.getModTile(item.TileType);
            if (tile?.Item) {
                tile.ModifyTileItem(tile.Item);
            }
        }
        
        item.SetDefaults();
        item.SetStaticDefaults();
        
        item.MenuCategories.push('ModIcon');
        item.MenuCategories.push('all');
        
        if (typeof item.Item.createTile === 'number'
        && item.Item.createTile > -1) item.MenuCategories.push('tile');
        
        if (typeof item.Item.createWall === 'number'
        && item.Item.createWall > -1) item.MenuCategories.push('wall');
        
        if (item.Item.pick) item.MenuCategories.push('pick');
        if (item.Item.axe) item.MenuCategories.push('axe');
        if (item.Item.hammer) item.MenuCategories.push('hammer');
        if (item.Item.fishingPole) item.MenuCategories.push('fishingPole');
        
        if (item.Item.accessory) item.MenuCategories.push('accessory');
        if (item.Item.melee) item.MenuCategories.push('melee');
        if (item.Item.ranged) item.MenuCategories.push('ranged');
        if (item.Item.magic) item.MenuCategories.push('magic');
        if (item.Item.summon || item.Item.sentry) item.MenuCategories.push('summon');
        if (item.Item.consumable && item.Item.shoot > 0 && !item.Item.ammo) item.MenuCategories.push('thrown');
        if (item.Item.expert || item.Item.expertOnly) item.MenuCategories.push('expert');
        if (item.Item.questItem) item.MenuCategories.push('questItem');
        
        if (item.Item.headSlot || item.Item.bodySlot || item.Item.legSlot) {
            item.MenuCategories.push('armor');
            if (item.Item.headSlot) item.MenuCategories.push('helmet');
            if (item.Item.bodySlot) item.MenuCategories.push('breastplate');
            if (item.Item.legSlot) item.MenuCategories.push('boots');
        }
        
        if (item.Item.shieldSlot) item.MenuCategories.push('shield');
        if (item.Item.wingSlot) item.MenuCategories.push('wings');
        
        if (item.Item.accessory || item.Item.consumable
        || item.Item.melee || item.Item.ranged || item.Item.magic
        || item.Item.summon || item.Item.sentry
        ) {
            item.Item.maxStack = item.Item.consumable ? 9999 : 1;
            item.Item.reforge = true;
            if (!item.Item.melee) item.Item.noMelee = item.Item.noMelee ?? true;
        }
        
        const itemTexture = Terraria.GameContent.TextureAssets.Item[item.Type].Value;
        if (item.Item.width == undefined) item.Item.width = itemTexture.Width;
        if (item.Item.height == undefined) item.Item.height = itemTexture.Height;
        
        item.PostSetDefaults();
        item.PostStaticDefaults();
    }
    
    // Automatic creation and addition to TL menus
    static AddToMenu(item) {
        if (item.MenuCategories.length > 0) {
            item.MenuCategories = [...new Set(item.MenuCategories)];
            for (const category of item.MenuCategories) {
                if (this.TL_Categories.includes(category)) tl.cheatMenu.addItemToCategory(category, item.Type);
                else {
                    if (!this.MenuCategories[category]) {
                        const texture = `Textures/Icons/${category}.png`;
                        if (tl.file.exists(texture)) {
                            this.MenuCategories[category] = tl.cheatMenu.addItemCategory(category, texture);
                        }
                    }
                    if (this.MenuCategories[category]) tl.cheatMenu.addItemToCategory(this.MenuCategories[category], item.Type);
                }
            }
        }
    }
    
    static SetupContent() {
        this.LoadItems();
        ModLoader.ModData.ItemCount += this.Count;
        
        for (const item of this.Items) {
            item.SetupContent();
        }
    }
    
    static PostSetupContent() {
        this.ItemCount = this.MAX_VANILLA_ID + ModLoader.ModData.ItemCount;
        for (const item of this.Items) {
            item.PostSetupContent();
            if (Terraria.ID.ItemID.Sets.BossBag[item.Type]) {
                item.Item.useStyle = Terraria.ID.ItemUseStyleID.HoldUp;
            }
        }
    }
    
    static SetupTextures(item) {
        if (!item.Texture?.startsWith('Textures/')) {
            item.Texture = 'Textures/' + item.Texture;
        }
        
        const itemTexture = new ModTexture(item.Texture, item.horizontalFrames, item.frameCount, item.ticksPerFrame);
        if (itemTexture?.exists) {
            Terraria.GameContent.TextureAssets.Item[item.Type] = itemTexture.asset.asset;
        }
        
        // _Head
        const itemHeadTexture = new ModTexture(`${item.Texture}_Head`, 20);
        if (itemHeadTexture?.exists) {
            const newIndex = Terraria.ID.ArmorIDs.Head.Count;
            const newSize = newIndex + 1;
            Terraria.ID.ArmorIDs.Head.Count = newSize;
            
            resizeArrayProperty(Terraria.GameContent.TextureAssets, 'ArmorHead', newSize, itemHeadTexture.asset.asset);
            resizeArrayProperty(Terraria.ID.ArmorIDs.Head.Sets, 'FrontToBackID', newSize, -1);
            resizeArrayProperty(Terraria.ID.ArmorIDs.Head.Sets, 'PreventBeardDraw', newSize, false);
            resizeArrayProperty(Terraria.ID.ArmorIDs.Head.Sets, 'UseAltFaceHeadDraw', newSize, false);
            resizeArrayProperty(Terraria.ID.ArmorIDs.Head.Sets, 'UseSkinColor', newSize, false);
            resizeArrayProperty(Terraria.Item, 'headType', newSize, item.Type);
            item.Item.headSlot = newIndex;
        }
        
        // _Beard
        const itemBeardTexture = new ModTexture(`${item.Texture}_Beard`, 20);
        if (itemBeardTexture.exists) {
            const newIndex = Terraria.ID.ArmorIDs.Beard.Count;
            const newSize = newIndex + 1;
            Terraria.ID.ArmorIDs.Beard.Count = newSize;
            resizeArrayProperty(Terraria.GameContent.TextureAssets, 'AccBeard', newSize, itemBeardTexture.asset.asset);
            resizeArrayProperty(Terraria.ID.ArmorIDs.Beard.Sets, 'UseHairColor', newSize, false);
            item.Item.beardSlot = newIndex;
        }
        
        // _Back
        const itemBackTexture = new ModTexture(`${item.Texture}_Back`);
        if (itemBackTexture?.exists) {
            const newIndex = Terraria.ID.ArmorIDs.Back.Count;
            const newSize = newIndex + 1;
            Terraria.ID.ArmorIDs.Back.Count = newSize;
            resizeArrayProperty(Terraria.GameContent.TextureAssets, 'AccBack', newSize, itemBackTexture.asset.asset);
            resizeArrayProperty(Terraria.ID.ArmorIDs.Back.Sets, 'DrawInBackpackLayer', newSize, false);
            resizeArrayProperty(Terraria.ID.ArmorIDs.Back.Sets, 'DrawInTailLayer', newSize, false);
            item.Item.backSlot = newIndex;
        }
        
        // _Body
        const itemBodyTexture = new ModTexture(`${item.Texture}_Body`);
        if (itemBodyTexture?.exists) {
            const newIndex = Terraria.ID.ArmorIDs.Body.Count;
            const newSize = newIndex + 1;
            Terraria.ID.ArmorIDs.Body.Count = newSize;
            
            resizeArrayProperty(Terraria.GameContent.TextureAssets, 'ArmorBodyComposite', newSize, itemBodyTexture.asset.asset);
            resizeArrayProperty(Terraria.GameContent.TextureAssets, 'ArmorBody', newSize, itemBodyTexture.asset.asset);
            resizeArrayProperty(Terraria.GameContent.TextureAssets, 'FemaleBody', newSize, itemBodyTexture.asset.asset);
            resizeArrayProperty(Terraria.GameContent.TextureAssets, 'ArmorArm', newSize, itemBodyTexture.asset.asset);
            
            const includeCapeFrontAndBackInfoObject = Terraria.ID.ArmorIDs.Body.Sets.IncludeCapeFrontAndBackInfo.new();
            includeCapeFrontAndBackInfoObject.backCape = item.Item?.backSlot ?? -1;
            includeCapeFrontAndBackInfoObject.frontCape = -1;
            resizeArrayProperty(Terraria.ID.ArmorIDs.Body.Sets, 'IncludeCapeFrontAndBack', newSize, includeCapeFrontAndBackInfoObject);
            resizeArrayProperty(Terraria.ID.ArmorIDs.Body.Sets, 'IncludedCapeBack', newSize, item.Item?.backSlot ?? -1);
            resizeArrayProperty(Terraria.ID.ArmorIDs.Body.Sets, 'IncludedCapeBackFemale', newSize, item.Item?.backSlot ?? -1);
            resizeArrayProperty(Terraria.ID.ArmorIDs.Body.Sets, 'NeedsToDrawArm', newSize, true);
            resizeArrayProperty(Terraria.ID.ArmorIDs.Body.Sets, 'IncludedCapeFront', newSize, -1);
            resizeArrayProperty(Terraria.ID.ArmorIDs.Body.Sets, 'UsesNewFramingCode', newSize, true);
            resizeArrayProperty(Terraria.ID.ArmorIDs.Body.Sets, 'showsShouldersWhileJumping', newSize, false);
            resizeArrayProperty(Terraria.ID.ArmorIDs.Body.Sets, 'shouldersAreAlwaysInTheBack', newSize, false);
            resizeArrayProperty(Terraria.ID.ArmorIDs.Body.Sets, 'DisableHandOnAndOffAccDraw', newSize, false);
            resizeArrayProperty(Terraria.ID.ArmorIDs.Body.Sets, 'DisableBeltAccDraw', newSize, false);
            resizeArrayProperty(Terraria.Item, 'bodyType', newSize, item.Type);
            item.Item.bodySlot = newIndex;
        }
        
        // _Legs
        const itemLegsTexture = new ModTexture(`${item.Texture}_Legs`);
        if (itemLegsTexture?.exists) {
            const newIndex = Terraria.ID.ArmorIDs.Legs.Count;
            const newSize = newIndex + 1;
            Terraria.ID.ArmorIDs.Legs.Count = newSize;
            resizeArrayProperty(Terraria.GameContent.TextureAssets, 'ArmorLeg', newSize, itemLegsTexture.asset.asset);
            //resizeArrayProperty(Terraria.ID.ArmorIDs.Legs.Sets, 'MannequinIncompatible', newSize, false);
            resizeArrayProperty(Terraria.ID.ArmorIDs.Legs.Sets, 'IncompatibleWithFrogLeg', newSize, false);
            resizeArrayProperty(Terraria.Item, 'legType', newSize, item.Type);
            item.Item.legSlot = newIndex;
        }
        
        // _Glow
        const itemGlowTexture = new ModTexture(`${item.Texture}_Glow`);
        if (itemGlowTexture?.exists) {
            const newIndex = Terraria.GameContent.TextureAssets.GlowMask.length;
            const newSize = newIndex + 1;
            resizeArrayProperty(Terraria.GameContent.TextureAssets, 'GlowMask', newSize, itemGlowTexture.asset.asset);
            item.Item.glowMask = newIndex;
        }
        
        // _Shield
        const itemShieldTexture = new ModTexture(`${item.Texture}_Shield`);
        if (itemShieldTexture?.exists) {
            const newIndex = Terraria.ID.ArmorIDs.Shield.Count;
            const newSize = newIndex + 1;
            Terraria.ID.ArmorIDs.Shield.Count = newSize;
            resizeArrayProperty(Terraria.GameContent.TextureAssets, 'AccShield', newSize, itemShieldTexture.asset.asset);
            item.Item.shieldSlot = newIndex;
        }
        
        // _Neck
        const itemNeckTexture = new ModTexture(`${item.Texture}_Neck`);
        if (itemNeckTexture?.exists) {
            const newIndex = Terraria.ID.ArmorIDs.Neck.Count;
            const newSize = newIndex + 1;
            Terraria.ID.ArmorIDs.Neck.Count = newSize;
            resizeArrayProperty(Terraria.GameContent.TextureAssets, 'AccNeck', newSize, itemNeckTexture.asset.asset);
            item.Item.neckSlot = newIndex;
        }
        
        // _Shoes
        const itemShoesTexture = new ModTexture(`${item.Texture}_Shoes`);
        if (itemShoesTexture?.exists) {
            const newIndex = Terraria.ID.ArmorIDs.Shoe.Count;
            const newSize = newIndex + 1;
            Terraria.ID.ArmorIDs.Shoe.Count = newSize;
            resizeArrayProperty(Terraria.GameContent.TextureAssets, 'AccShoes', newSize, itemShoesTexture.asset.asset);
            resizeArrayProperty(Terraria.ID.ArmorIDs.Shoe.Sets, 'MaleToFemaleID', newSize, -1);
            item.Item.shoeSlot = newIndex;
        }
        
        // _Waist
        const itemWaistTexture = new ModTexture(`${item.Texture}_Waist`);
        if (itemWaistTexture?.exists) {
            const newIndex = Terraria.ID.ArmorIDs.Waist.Count;
            const newSize = newIndex + 1;
            Terraria.ID.ArmorIDs.Waist.Count = newSize;
            resizeArrayProperty(Terraria.GameContent.TextureAssets, 'AccWaist', newSize, itemWaistTexture.asset.asset);
            resizeArrayProperty(Terraria.ID.ArmorIDs.Waist.Sets, 'UsesTorsoFraming', newSize, false);
            resizeArrayProperty(Terraria.ID.ArmorIDs.Waist.Sets, 'IsABelt', newSize, false);
            item.Item.waistSlot = newIndex;
        }
        
        // _Face
        const itemFaceTexture = new ModTexture(`${item.Texture}_Face`);
        if (itemFaceTexture?.exists) {
            const newIndex = Terraria.ID.ArmorIDs.Face.Count;
            const newSize = newIndex + 1;
            Terraria.ID.ArmorIDs.Face.Count = newSize;
            resizeArrayProperty(Terraria.GameContent.TextureAssets, 'AccFace', newSize, itemFaceTexture.asset.asset);
            resizeArrayProperty(Terraria.ID.ArmorIDs.Face.Sets, 'PreventHairDraw', newSize, false);
            resizeArrayProperty(Terraria.ID.ArmorIDs.Face.Sets, 'OverrideHelmet', newSize, false);
            resizeArrayProperty(Terraria.ID.ArmorIDs.Face.Sets, 'DrawInFaceUnderHairLayer', newSize, false);
            resizeArrayProperty(Terraria.ID.ArmorIDs.Face.Sets, 'DrawInFaceFlowerLayer', newSize, false);
            resizeArrayProperty(Terraria.ID.ArmorIDs.Face.Sets, 'DrawInFaceHeadLayer', newSize, false);
            resizeArrayProperty(Terraria.ID.ArmorIDs.Face.Sets, 'AltFaceHead', newSize, -1);
            item.Item.faceSlot = newIndex;
        }
        
        // _HandsOn
        const itemHandsOnTexture = new ModTexture(`${item.Texture}_HandsOn`);
        if (itemHandsOnTexture?.exists) {
            const newIndex = Terraria.ID.ArmorIDs.HandOn.Count;
            const newSize = newIndex + 1;
            Terraria.ID.ArmorIDs.HandOn.Count = newSize;
            resizeArrayProperty(Terraria.GameContent.TextureAssets, 'AccHandsOn', newSize, itemHandsOnTexture.asset.asset);
            resizeArrayProperty(Terraria.GameContent.TextureAssets, 'AccHandsOnComposite', newSize, itemHandsOnTexture.asset.asset);
            resizeArrayProperty(Terraria.ID.ArmorIDs.HandOn.Sets, 'UsesNewFramingCode', newSize, true);
            resizeArrayProperty(Terraria.ID.ArmorIDs.HandOn.Sets, 'UsesOldFramingTexturesForWalking', newSize, false);
            item.Item.handOnSlot = newIndex;
        }
        
        // _HandsOff
        const itemHandsOffTexture = new ModTexture(`${item.Texture}_HandsOff`);
        if (itemHandsOffTexture?.exists) {
            const newIndex = Terraria.ID.ArmorIDs.HandOff.Count;
            const newSize = newIndex + 1;
            Terraria.ID.ArmorIDs.HandOff.Count = newSize;
            resizeArrayProperty(Terraria.GameContent.TextureAssets, 'AccHandsOff', newSize, itemHandsOffTexture.asset.asset);
            resizeArrayProperty(Terraria.GameContent.TextureAssets, 'AccHandsOffComposite', newSize, itemHandsOffTexture.asset.asset);
            resizeArrayProperty(Terraria.ID.ArmorIDs.HandOff.Sets, 'UsesNewFramingCode', newSize, true);
            item.Item.handOffSlot = newIndex;
        }
        
        // _Front
        const itemFrontTexture = new ModTexture(`${item.Texture}_Front`);
        if (itemFrontTexture?.exists) {
            const newIndex = Terraria.ID.ArmorIDs.Front.Count;
            const newSize = newIndex + 1;
            Terraria.ID.ArmorIDs.Front.Count = newSize;
            resizeArrayProperty(Terraria.GameContent.TextureAssets, 'AccFront', newSize, itemFrontTexture.asset.asset);
            resizeArrayProperty(Terraria.ID.ArmorIDs.Front.Sets, 'DrawsInNeckLayer', newSize, false);
            item.Item.frontSlot = newIndex;
        }
        
        // _Balloon
        const itemBalloonTexture = new ModTexture(`${item.Texture}_Balloon`);
        if (itemBalloonTexture?.exists) {
            const newIndex = Terraria.ID.ArmorIDs.Balloon.Count;
            const newSize = newIndex + 1;
            Terraria.ID.ArmorIDs.Balloon.Count = newSize;
            resizeArrayProperty(Terraria.GameContent.TextureAssets, 'AccBalloon', newSize, itemBalloonTexture.asset.asset);
            resizeArrayProperty(Terraria.ID.ArmorIDs.Balloon.Sets, 'DrawInFrontOfBackArmLayer', newSize, false);
            resizeArrayProperty(Terraria.ID.ArmorIDs.Balloon.Sets, 'UsesTorsoFraming', newSize, false);
            item.Item.balloonSlot = newIndex;
        }
        
        // _Wings
        const itemWingsTexture = new ModTexture(`${item.Texture}_Wings`);
        if (itemWingsTexture?.exists) {
            const newIndex = Terraria.ID.ArmorIDs.Wing.Count;
            const newSize = newIndex + 1;
            Terraria.ID.ArmorIDs.Wing.Count = newSize;
            resizeArrayProperty(Terraria.GameContent.TextureAssets, 'Wings', newSize, itemWingsTexture.asset.asset);
            resizeArrayProperty(Terraria.ID.ArmorIDs.Wing.Sets, 'Stats', newSize, Terraria.DataStructures.WingStats.new());
            item.Item.wingSlot = newIndex;
        }
    }
    
    static SetDefaults(item) {
        for (const gItem of GlobalItem.RegisteredItems) {
            gItem.SetDefaults(item);
        }
    }
    
    static GeneralPrefix(item) { return item.maxStack === 1 && item.damage > 0 && item.ammo === 0 && !item.accessory; }
    static MeleePrefix(item) { return this.isModType(item.type) && this.GeneralPrefix(item) && item.melee && !item.noUseGraphic; }
    static WeaponPrefix(item) { return this.isModType(item.type) && this.GeneralPrefix(item) && item.melee && item.noUseGraphic; }
    static RangedPrefix(item) { return this.isModType(item.type) && this.GeneralPrefix(item) && item.ranged; }
    static MagicPrefix(item) { return this.isModType(item.type) && this.GeneralPrefix(item) && (item.magic || item.summon || item.sentry); }
    
    static AllowPrefix(self, pre) {
        let result = false;
        if (this.isModType(self.type)) {
            const item = this.getModItem(self.type);
            if (typeof item?.AllowPrefix === 'function') {
                result = item?.AllowPrefix(pre);
                if (pre == -3) result = true;
            }
        }
        return result;
    }
    
    static ChoosePrefix(item, rand, originalPrefix) {
        const pre = this.getModItem(item.type)?.ChoosePrefix(rand, originalPrefix) ?? -1;
        if (pre > 0) return pre;
        return -1;
    }
    
    static CanUseItem(item, player) {
        let value = true;
        if (this.isModType(item.type)) {
            value = this.getModItem(item.type)?.CanUseItem(item, player) ?? true;
        }
        if (GlobalItem.RegisteredItems.some(gI => (gI?.CanUseItem(item, player) ?? true) === false)) {
            value = false;
        }
        return value;
    }
    
    static CanAutoReuseItem(item, player) {
        let value = true;
        if (this.isModType(item.type)) {
            value = this.getModItem(item.type)?.CanAutoReuseItem(item, player) ?? true;
        }
        if (GlobalItem.RegisteredItems.some(gI => (gI?.CanAutoReuseItem(item, player) ?? true) === false)) {
            value = false;
        }
        return value;
    }
    
    static ConsumeItem(item, player) {
        let value = false;
        if (this.isModType(item.type)) {
            value = this.getModItem(item.type)?.ConsumeItem(item, player) ?? item.consumable;
        }
        return value;
    }
    
    static OnConsumeItem(item, player) {
        if (this.isModType(item.type)) {
            this.getModItem(item.type)?.OnConsumeItem(item, player);
        }
    }
    
    static OpenBossBag(item, player) {
        if (this.isModType(item.type)) {
            this.getModItem(item.type)?.OpenBossBag(item, player);
        }
    }
    
    static HoldItem(item, player) {
        if (this.isModType(item.type)) {
            this.getModItem(item.type)?.HoldItem(item, player);
        } 
        for (const gItem of GlobalItem.RegisteredItems) {
            gItem?.HoldItem(item, player);
        }
    }
    
    static UseStyle(item, player, mountOffset, heldItemFrame) {
        if (this.isModType(item.type)) {
            this.getModItem(item.type)?.UseStyle(item, player, mountOffset, heldItemFrame);
        } 
        for (const gItem of GlobalItem.RegisteredItems) {
            gItem?.UseStyle(item, player, mountOffset, heldItemFrame);
        }
    }
    
    static HoldStyle(item, player, mountOffset, heldItemFrame) {
        if (this.isModType(item.type)) {
            this.getModItem(item.type)?.HoldStyle(item, player, mountOffset, heldItemFrame);
        } 
        for (const gItem of GlobalItem.RegisteredItems) {
            gItem?.HoldStyle(item, player, mountOffset, heldItemFrame);
        }
    }
    
    static UseTimeMultiplier(item, player) {
        if (item.IsAir) return 1.0;
        let multiplier = 1.0;
        if (this.isModType(item.type)) {
            multiplier = this.getModItem(item.type)?.UseTimeMultiplier(item, player) ?? 1.0;
        }
        for (const gItem of GlobalItem.RegisteredItems) {
            multiplier *= gItem?.UseTimeMultiplier(item, player) ?? 1.0;
        }
        return multiplier;
    }
    
    static UseAnimationMultiplier(item, player) {
        if (item.IsAir) return 1.0;
        let multiplier = 1.0;
        if (this.isModType(item.type)) {
            multiplier = this.getModItem(item.type)?.UseAnimationMultiplier(item, player) ?? 1.0;
        }
        for (const gItem of GlobalItem.RegisteredItems) {
            multiplier *= gItem?.UseAnimationMultiplier(item, player) ?? 1.0;
        }
        return multiplier;
    }
    
    static UseSpeedMultiplier(item, player) {
        if (item.IsAir) return 1.0;
        let multiplier = 1.0;
        if (this.isModType(item.type)) {
            multiplier = this.getModItem(item.type)?.UseSpeedMultiplier(item, player) ?? 1.0;
        }
        for (const gItem of GlobalItem.RegisteredItems) {
            multiplier *= gItem?.UseSpeedMultiplier(item, player) ?? 1.0;
        }
        return multiplier;
    }
    
    static GetHealLife(item, player, healValue = 0) {
        let newValue = healValue;
        if (this.isModType(item.type)) {
            newValue = this.getModItem(item.type)?.GetHealLife(item, player, healValue) ?? healValue;
        }
        for (const gItem of GlobalItem.RegisteredItems) {
            newValue = gItem?.GetHealLife(item, player, newValue) ?? newValue;
        }
        return newValue;
    }
    
    static GetHealMana(item, player, healValue = 0) {
        let newValue = healValue;
        if (this.isModType(item.type)) {
            newValue = this.getModItem(item.type)?.GetHealMana(item, player, healValue) ?? healValue;
        }
        for (const gItem of GlobalItem.RegisteredItems) {
            newValue = gItem?.GetHealMana(item, player, newValue) ?? newValue;
        }
        return newValue;
    }
    
    static OnConsumeMana(item, player, manaConsumed) {
        if (this.isModType(item.type)) {
            this.getModItem(item.type)?.OnConsumeMana(item, player, manaConsumed);
        }
        for (const gItem of GlobalItem.RegisteredItems) {
            gItem?.OnConsumeMana(item, player, manaConsumed);
        }
    }
    
    static OnMissingMana(item, player, neededMana) {
        if (this.isModType(item.type)) {
            this.getModItem(item.type)?.OnMissingMana(item, player, neededMana);
        }
        for (const gItem of GlobalItem.RegisteredItems) {
            gItem?.OnMissingMana(item, player, neededMana);
        }
    }
    
    static ModifyManaCost(item, player, mana) {
        let newValue = mana;
        if (this.isModType(item.type)) {
            newValue = this.getModItem(item.type)?.ModifyManaCost(item, player, mana) ?? mana;
        }
        for (const gItem of GlobalItem.RegisteredItems) {
            newValue = gItem?.ModifyManaCost(item, player, newValue) ?? newValue;
        }
        return newValue;
    }
    
    static ModifyWeaponDamage(item, player, damage) {
        let newValue = damage;
        if (this.isModType(item.type)) {
            newValue = this.getModItem(item.type)?.ModifyWeaponDamage(item, player, damage) ?? damage;
        }
        for (const gItem of GlobalItem.RegisteredItems) {
            newValue = gItem?.ModifyWeaponDamage(item, player, newValue) ?? newValue;
        }
        return newValue;
    }
    
    static ModifyWeaponKnockback(item, player, knockBack) {
        let newValue = knockBack;
        if (this.isModType(item.type)) {
            newValue = this.getModItem(item.type)?.ModifyWeaponKnockback(item, player, knockBack) ?? knockBack;
        }
        for (const gItem of GlobalItem.RegisteredItems) {
            newValue = gItem?.ModifyWeaponKnockback(item, player, newValue) ?? newValue;
        }
        return newValue;
    }
    
    static CanShoot(item, player) {
        let value = true;
        if (this.isModType(item.type)) {
            value = this.getModItem(item.type)?.CanShoot(item, player) ?? true;
        }
        if (GlobalItem.RegisteredItems.some(gI => (gI?.CanShoot(item, player) ?? true) === false)) {
            value = false;
        }
        return value;
    }
    
    static ModifyShootStats(item, player, stats) {
        if (this.isModType(item.type)) {
            this.getModItem(item.type)?.ModifyShootStats(item, player, stats);
        }
        for (const gItem of GlobalItem.RegisteredItems) {
            gItem?.ModifyShootStats(item, player, stats);
        }
    }
    
    static Shoot(item, player, position, velocity, type, damage, knockBack) {
        let value = true;
        if (this.isModType(item.type)) {
            value = this.getModItem(item.type)?.Shoot(item, player, position, velocity, type, damage, knockBack) ?? true;
        }
        if (GlobalItem.RegisteredItems.some(gI => (gI?.Shoot(item, player, position, velocity, type, damage, knockBack) ?? true) === false)) {
            value = false;
        }
        return value;
    }
    
    static OnHitNPC(item, player, npc, damageDone, knockBack) {
        if (this.isModType(item.type)) {
            this.getModItem(item.type)?.OnHitNPC(item, player, npc, damageDone, knockBack);
        }
        for (const gItem of GlobalItem.RegisteredItems) {
            gItem?.OnHitNPC(item, player, npc, damageDone, knockBack);
        }
    }
    
    static UseItem(item, player) {
        let value = true;
        if (this.isModType(item.type)) {
            value = this.getModItem(item.type)?.UseItem(item, player) ?? true;
        }
        if (GlobalItem.RegisteredItems.some(gI => (gI?.UseItem(item, player) ?? true) === false)) {
            value = false;
        }
        return value;
    }
    
    static UseAnimation(item, player) {
        if (this.isModType(item.type)) {
            this.getModItem(item.type)?.UseAnimation(item, player);
        }
        for (const gItem of GlobalItem.RegisteredItems) {
            gItem?.UseAnimation(item, player);
        }
    }
    
    static UpdateInventory(item, player) {
        if (this.isModType(item.type)) {
            this.getModItem(item.type)?.UpdateInventory(item, player);
        }
        for (const gItem of GlobalItem.RegisteredItems) {
            gItem?.UpdateInventory(item, player);
        }
    }
    
    static UpdateEquip(item, player) {
        if (this.isModType(item.type)) {
            this.getModItem(item.type)?.UpdateEquip(item, player);
        }
        for (const gItem of GlobalItem.RegisteredItems) {
            gItem?.UpdateEquip(item, player);
        }
    }
    
    static UpdateAccessory(item, player, hideVisual) {
        if (this.isModType(item.type)) {
            this.getModItem(item.type)?.UpdateAccessory(item, player, hideVisual);
        }
        for (const gItem of GlobalItem.RegisteredItems) {
            gItem?.UpdateAccessory(item, player, hideVisual);
        }
    }
    
    static UpdateVanityAccessory(item, player) {
        if (this.isModType(item.type)) {
            this.getModItem(item.type)?.UpdateVanityAccessory(item, player);
        }
        for (const gItem of GlobalItem.RegisteredItems) {
            gItem?.UpdateVanityAccessory(item, player);
        }
    }
    
    static IsArmorSet(item, head, body, legs) {
        let value = false;
        if (this.isModType(item.type)) {
            value = this.getModItem(item.type)?.IsArmorSet(head, body, legs) ?? false;
        } else if (item.type < this.MAX_VANILLA_ID) {
            value = true;
        }
        return value;
    }
    
    static IsVanitySet(item, head, body, legs) {
        let value = false;
        if (this.isModType(item.type)) {
            value = this.getModItem(item.type)?.IsVanitySet(head, body, legs) ?? false;
        } else if (item.type < this.MAX_VANILLA_ID) {
            value = true;
        }
        return value;
    }
    
    static UpdateArmorSet(item, player) {
        if (this.isModType(item.type)) {
            this.getModItem(item.type)?.UpdateArmorSet(item, player);
        }
        for (const gItem of GlobalItem.RegisteredItems) {
            gItem?.UpdateArmorSet(item, player);
        }
    }
    
    static UpdateVanitySet(item, player) {
        if (this.isModType(item.type)) {
            this.getModItem(item.type)?.UpdateVanitySet(item, player);
        }
        for (const gItem of GlobalItem.RegisteredItems) {
            gItem?.UpdateVanitySet(item, player);
        }
    }
    
    static WingMovement(item, player) {
        if (this.isModType(item.type)) {
            this.getModItem(item.type)?.WingMovement(item, player);
        }
        for (const gItem of GlobalItem.RegisteredItems) {
            gItem?.WingMovement(item, player);
        }
    }
    
    static CanPickup(item, player) {
        let value = true;
        if (this.isModType(item.type)) {
            value = this.getModItem(item.type)?.CanPickup(item, player) ?? true;
        }
        if (GlobalItem.RegisteredItems.some(gI => (gI?.CanPickup(item, player) ?? true) === false)) {
            value = false;
        }
        return value;
    }
    
    static OnPickup(item, player) {
        if (this.isModType(item.type)) {
            this.getModItem(item.type)?.OnPickup(item, player);
        }
        for (const gItem of GlobalItem.RegisteredItems) {
            gItem?.OnPickup(item, player);
        }
    }
    
    static GetAlpha(item, color) {
        let value = color;
        if (this.isModType(item.type)) {
            value = this.getModItem(item.type)?.GetAlpha(item, color) ?? color;
        }
        for (const gItem of GlobalItem.RegisteredItems) {
            value = gItem?.GetAlpha(item, value) ?? value;
        }
        return value;
    }
    
    static HoldoutOffset(item, player) {
        if (!this.isModType(item.type)) return;
        const offset = this.getModItem(item.type)?.HoldoutOffset(item, player);
        if (offset && (offset.X || offset.Y)) {
            const rotated = Terraria.Utils['Vector2 RotatedBy(Vector2 spinningpoint, double radians, Vector2 center)'](
                Vector2.new(offset.X * player.direction, offset.Y * player.gravDir),
                player.itemRotation, Vector2.Zero
            );
            player.itemLocation = Vector2.Add(player.itemLocation, rotated);
        }
    }
    
    static ExtractinatorUse(item, player, extractType, extractinatorBlockType) {
        let value = true;
        if (this.isModType(item.type)) {
            value = this.getModItem(item.type)?.ExtractinatorUse(item, player, extractType, extractinatorBlockType) ?? true;
        }
        if (GlobalItem.RegisteredItems.some(gI => (gI?.ExtractinatorUse(item, player, extractType, extractinatorBlockType) ?? true) === false)) {
            value = false;
        }
        return value;
    }
    
    static OnCraft(item, player, recipe) {
        if (this.isModType(item.type)) {
            this.getModItem(item.type)?.OnCraft(item, player, recipe);
        }
        for (const gItem of GlobalItem.RegisteredItems) {
            gItem?.OnCraft(item, player, recipe);
        }
    }
    
    static IsAnglerQuestAvailable(type) {
        let value = true;
        if (this.isModType(type)) {
            value = this.getModItem(type)?.IsAnglerQuestAvailable() ?? true;
        }
        if (GlobalItem.RegisteredItems.some(gI => (gI?.IsAnglerQuestAvailable() ?? true) === false)) {
            value = false;
        }
        return value;
    }
    
    static NPCToBanner(type) {
        return this._NPCToBanner[type];
    }
    
    static BannerToNPC(bannerID) {
        return this._BannerToNPC[bannerID];
    }
    
    static BannerToItem(bannerID) {
        return this._BannerToItem[bannerID];
    }
}