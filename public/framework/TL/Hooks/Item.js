import { Terraria, Microsoft } from './../ModImports.js';
import { ModLocalization } from './../ModLocalization.js';
import { ItemLoader } from './../Loaders/ItemLoader.js';
import { PrefixUtils } from './../Modules/Utils/Prefix.js';

export class ItemHooks {
    static initialized = false;
    
    // Here you can disable the hooks that won't be used in your mod to avoid unnecessary processing
    static HookList = {
        SetDefaults: true,
        GetDrawHitbox: true,
        RebuildTooltip: true,
        Prefix: true,
        GetAlpha: true,
        BannerHooks: false
    }
    
    static Initialize() {
        if (this.initialized) return;
        
        if (this.HookList.SetDefaults) {
            Terraria.Item['void SetDefaults(int Type, bool noMatCheck, ItemVariant variant)'
            ].hook((original, self, type, noMatCheck, variant) => {
                if (type < ItemLoader.MAX_VANILLA_ID) {
                    original(self, type, noMatCheck, variant);
                    ItemLoader.SetDefaults(self);
                    return;
                }
                if (!ItemLoader.isModType(type)) return;
                
                self.tooltipContext = -1;
                self.BestiaryNotes = '';
                self.sentry = false;
                self.canBePlacedInVanityRegardlessOfConditions = false;
                self.DD2Summon = false;
                self.shopSpecialCurrency = -1;
                self.expert = false;
                self.isAShopItem = false;
                self.expertOnly = false;
                self.instanced = false;
                self.questItem = false;
                self.fishingPole = 0;
                self.bait = 0;
                self.hairDye = -1;
                self.makeNPC = 0;
                self.dye = 0;
                self.paint = 0;
                self.tileWand = -1;
                self.notAmmo = false;
                self.netID = 0;
                self.prefix = 0;
                self.crit = 0;
                self.mech = false;
                self.flame = false;
                self.reuseDelay = 0;
                self.melee = false;
                self.magic = false;
                self.ranged = false;
                self.summon = false;
                self.placeStyle = 0;
                self.buffTime = 0;
                self.buffType = 0;
                self.mountType = -1;
                self.cartTrack = false;
                self.material = false;
                self.noWet = false;
                self.vanity = false;
                self.mana = 0;
                self.wet = false;
                self.wetCount = 0;
                self.lavaWet = false;
                self.channel = false;
                self.manaIncrease = 0;
                self.timeSinceTheItemHasBeenReservedForSomeone = 0;
                self.noMelee = false;
                self.noUseGraphic = false;
                self.lifeRegen = 0;
                self.shootSpeed = 0;
                self.active = true;
                self.alpha = 0;
                self.ammo = Terraria.ID.AmmoID.None;
                self.useAmmo = Terraria.ID.AmmoID.None;
                self.autoReuse = false;
                self.accessory = false;
                self.axe = 0;
                self.healMana = 0;
                self.bodySlot = -1;
                self.legSlot = -1;
                self.headSlot = -1;
                self.potion = false;
                self.color = Microsoft.Xna.Framework.Graphics.Color.new();
                self.glowMask = -1;
                self.consumable = false;
                self.createTile = -1;
                self.createWall = -1;
                self.damage = -1;
                self.defense = 0;
                self.hammer = 0;
                self.healLife = 0;
                self.holdStyle = 0;
                self.knockBack = 0;
                self.maxStack = 1;
                self.pick = 0;
                self.rare = 0;
                self.scale = 1;
                self.shoot = 0;
                self.stack = 1;
                self.tileBoost = 0;
                self.useStyle = 0;
                self.useTime = 100;
                self.useAnimation = 100;
                self.value = 0;
                self.useTurn = false;
                self.buy = false;
                self.handOnSlot = -1;
                self.handOffSlot = -1;
                self.backSlot = -1;
                self.frontSlot = -1;
                self.shoeSlot = -1;
                self.waistSlot = -1;
                self.wingSlot = -1;
                self.shieldSlot = -1;
                self.neckSlot = -1;
                self.faceSlot = -1;
                self.balloonSlot = -1;
                self.uniqueStack = false;
                self.favorited = false;
                self.type = type;
                
                const item = ItemLoader.getModItem(type);
                item?.SetDefaults();
                self.RebuildTooltip();
                item?.PostSetDefaults();
                Object.assign(self, item.Item);
            });
        }
        
        if (this.HookList.GetDrawHitbox) {
            Terraria.Item['Rectangle GetDrawHitbox(int type, Player user)'
            ].hook((original, type, player) => {
                if (ItemLoader.isModType(type)) {
                    const item = ItemLoader.getModItem(type).Item;
                    const rect = Microsoft.Xna.Framework.Rectangle.new();
                    rect.X = 0; rect.Y = 0;
                    rect.Width = item.width;
                    rect.Height = item.height;
                    return rect;
                }
                return original(type, player);
            });
        }
        
        if (this.HookList.RebuildTooltip) {
            Terraria.Item['void RebuildTooltip()'
            ].hook((original, self) => {
                if (ItemLoader.isModType(self.type)) {
                    self.ToolTip = ModLocalization.getTranslationItemTooltip(self.type);
                    return;
                }
                original(self);
            });
        }
        
        if (this.HookList.Prefix) {
            Terraria.Item['bool Prefix(int prefixWeWant)'
            ].hook((original, self, pre) => {
                if (!ItemLoader.isModType(self.type)) {
                    return original(self, pre);
                }
                if (pre === 0) return false;
                
                const unifiedRandom = Terraria.WorldGen ? Terraria.WorldGen.genRand : Terraria.Main.rand;
                let prefix = pre,
                damage = 1.0,
                knockBack = 1.0,
                animation = 1.0,
                scale = 1.0,
                shootSpeed = 1.0,
                mana = 1.0,
                crit = 0,
                flag = true;
                while (flag) {
                    flag = false;
                    damage = 1.0;
                    knockBack = 1.0;
                    animation = 1.0;
                    scale = 1.0;
                    shootSpeed = 1.0;
                    mana = 1.0;
                    crit = 0;
                    if (pre === -1 && unifiedRandom['int Next(int maxValue)'](4) === 0) {
                        prefix = 0;
                    }
                    
                    if (pre < -1) prefix = -1;
                    
                    if (prefix === -1 || prefix === -2 || prefix === -3) {
                        const modPrefix = ItemLoader.ChoosePrefix(self, unifiedRandom, prefix);
                        if (modPrefix >= 0) prefix = modPrefix;
                        else if (ItemLoader.MeleePrefix(self)) {
                        	prefix = PrefixUtils.GetMeleePrefix();
                        } else if (ItemLoader.WeaponPrefix(self)) {
                        	prefix = PrefixUtils.GetWeaponPrefix();
                        } else if (ItemLoader.RangedPrefix(self)) {
                            prefix = PrefixUtils.GetRangedPrefix();
                        } else if (ItemLoader.MagicPrefix(self)) {
                            prefix = PrefixUtils.GetMagicPrefix();
                        } else {
                            if (!self.IsAPrefixableAccessory()) {
                                return false;
                            }
                            prefix = unifiedRandom['int Next(int minValue, int maxValue)'](62, 81);
                        }
                    }
                    
                    switch (pre) {
                        case -3: return true;
                        case -1: {
                            if ((prefix === 7 || prefix === 8 || prefix === 9
                            || prefix === 10 || prefix === 11 || prefix === 22
                            || prefix === 23 || prefix === 24 || prefix === 29
                            || prefix === 30 || prefix === 31 || prefix === 39
                            || prefix === 40 || prefix === 56 || prefix === 41
                            || prefix === 47 || prefix === 48 || prefix === 49
                            ) && Math.floor(Math.random()*3) !== 0
                            ) prefix = 0;
                            break;
                        }
                    }
                    
                    const stats = PrefixUtils.GetPrefixStats(prefix);
                    damage = stats.damage;
                    knockBack = stats.knockBack;
                    animation = stats.animation;
                    scale = stats.scale;
                    shootSpeed = stats.shootSpeed;
                    mana = stats.mana;
                    crit = stats.crit;
                    
                    if (damage != 1.0 && Math.round(self.damage * damage) === self.damage) {
                        flag = true;
                        prefix = -1;
                    }
                    if (animation != 1.0 && Math.round(self.useAnimation * animation) === self.useAnimation) {
                        flag = true;
                        prefix = -1;
                    }
                    if (mana != 1.0 && Math.round(self.mana * mana) === self.mana) {
                        flag = true;
                        prefix = -1;
                    }
                    if (knockBack != 1.0 && self.knockBack == 0.0) {
                        flag = true;
                        prefix = -1;
                    }
                    if (pre === -2 && prefix === 0) {
                        prefix = -1;
                        flag = true;
                    }
                    
                    if (!flag && !ItemLoader.AllowPrefix(self, prefix)) {
                        flag = true;
                    }
                }
                
                self.damage = Math.round(self.damage * damage);
                self.useAnimation = Math.round(self.useAnimation * animation);
                self.useTime = Math.round(self.useTime * animation);
                self.reuseDelay = Math.round(self.reuseDelay * animation);
                self.mana = Math.round(self.mana * mana);
                self.knockBack *= knockBack;
                self.scale *= scale;
                self.shootSpeed *= shootSpeed;
                self.crit += crit;
                
                let value = 1.0 * damage * (2.0 - animation) * (2.0 - mana) * scale * knockBack * shootSpeed * (1.0 + crit * 0.02);
                if (prefix === 62 || prefix === 69 || prefix === 73 || prefix === 77) {
                    value *= 1.05;
                } else if (prefix === 63 || prefix === 70 || prefix === 74 || prefix === 78 || prefix === 67) {
                    value *= 1.1;
                } else if (prefix === 64 || prefix === 71 || prefix === 75 || prefix === 79 || prefix === 66) {
                    value *= 1.15;
                } else if (prefix === 65 || prefix === 72 || prefix === 76 || prefix === 80 || prefix === 68) {
                    value *= 1.2;
                }
                
                if (value >= 1.2) {
                    self.rare += 2;
                } else if (value >= 1.05) {
                    self.rare++;
                } else if (value <= 0.8) {
                    self.rare -= 2;
                } else if (value <= 0.95) {
                    self.rare--;
                }
                
                if (self.rare > -11) self.rare = Math.min(11, Math.max(-1, self.rare));
                
                value *= value;
                self.value = self.value * value;
                self.prefix = prefix;
                
                return true;
            });
        }
        
        if (this.HookList.GetAlpha) {
            Terraria.Item['Color GetAlpha(Color newColor)'
            ].hook((original, self, color) => {
                return original(self, ItemLoader.GetAlpha(self, color));
            });
        }
        
        if (this.HookList.BannerHooks) {
            Terraria.Item.NPCtoBanner.hook((original, type) => {
                const result = original(type);
                if (result > 0) return result;
                return ItemLoader.NPCToBanner(type) ?? 0;
            });
            
            Terraria.Item.BannerToNPC.hook((original, bannerID) => {
                const result = original(bannerID);
                if (result > 0) return result;
                return ItemLoader.BannerToNPC(bannerID) ?? 0;
            });
            
            Terraria.Item.BannerToItem.hook((original, bannerID) => {
                return ItemLoader.BannerToItem(bannerID) ?? original(bannerID);
            });
            
            Terraria.NPC.BannerID.hook((original, self) => {
                return ItemLoader.NPCToBanner(self.type) ?? original(self);
            });
        }
        
        this.initialized = true;
    }
}