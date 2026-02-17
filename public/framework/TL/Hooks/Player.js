import { Terraria, Microsoft } from './../ModImports.js';
import { CombinedLoader } from './../Loaders/CombinedLoader.js';
import { PlayerLoader } from './../Loaders/PlayerLoader.js';
import { ItemLoader } from './../Loaders/ItemLoader.js';
import { TileLoader } from './../Loaders/TileLoader.js';
import { BiomeLoader } from './../Loaders/BiomeLoader.js';
import { BuffLoader } from './../Loaders/BuffLoader.js';
import { NPCLoader } from './../Loaders/NPCLoader.js';
import { SystemLoader } from './../Loaders/SystemLoader.js';
import { ProjectileLoader } from './../Loaders/ProjectileLoader.js';
import { TileData } from './../Modules/TileData.js';
import { RecipeHooks } from './Recipe.js'; 
import { SubworldLoader } from './../Loaders/SubworldLoader.js';

const GUIPlayerCreateMenu = new NativeClass('', 'GUIPlayerCreateMenu');

export class PlayerHooks {
    static initialized = false;
    static worldLoaded = false;
    
    // Here you can disable the hooks that won't be used in your mod to avoid unnecessary processing
    static HookList = {
        Spawn: true,
        TileInteractionsCheck: true,
        TileInteractionsCheckLongDistance: true,
        TileInteractionsUse: true,
        ItemCheck: true,
        ItemCheck_CheckCanUse: true,
        ItemCheck_ApplyUseStyle: true,
        ItemCheck_ApplyHoldStyle: true,
        ItemCheck_StartActualUse: true,
        ApplyItemTime: true,
        ApplyItemAnimation: true,
        QuickHeal: true,
        QuickMana: true,
        ItemCheck_PayMana: true,
        GetWeaponDamage: true,
        GetWeaponKnockback: true,
        ItemCheck_Shoot: true,
        ApplyNPCOnHitEffects: true,
        UpdateEquips: true,
        ApplyEquipFunctional: true,
        ApplyEquipVanity: true,
        UpdateDyes: true,
        UpdateArmorSets: true,
        WingMovement: true,
        CanAcceptItemIntoInventory: true,
        GetItem: true,
        ExtractinatorUse: true,
        RecalculateLuck: true,
        Update: true,
        UpdateLifeRegen: true,
        UpdateManaRegen: true,
        UpdateBuffs: true,
        UpdateDead: true,
        UpdateBiomes: true,
        BordersMovement: true,
        ResetEffects: true,
        Hurt: true,
        KillMe: true,
        GetDyeTraderReward: true,
        GetAnglerQuestReward: true,
        SellItem: true,
        SetupStartingItems: true,
        AddBuff_ActuallyTryToAddTheBuff: true,
        AddBuff_TryUpdatingExistingBuffTime: true,
        RemoveBuff: true
    };
    
    static Initialize() {
        if (this.initialized) return;
        
        Terraria.Player.Hooks.EnterWorld.hook((original, playerIndex) => {
            const player = Terraria.Main.player[playerIndex];
            
            // Resize arrays
            player.buffImmune = player.buffImmune.cloneResized(BuffLoader.BuffCount);
            player.ownedProjectileCounts = player.ownedProjectileCounts.cloneResized(ProjectileLoader.ProjectileCount);
            player.npcTypeNoAggro = player.npcTypeNoAggro.cloneResized(NPCLoader.NPCCount);
            
            BiomeLoader.SetupPlayer(player);
            
            if (!this.worldLoaded) {
                this.worldLoaded = true;
                SystemLoader.OnWorldLoad();
            }
            
            original(playerIndex);
            PlayerLoader.OnEnterWorld(player);
            if (SubworldLoader.AnySubworldActive) {
                SubworldLoader.ActiveSubworld.OnEnter(player);
            }
        });
        
        if (this.HookList.Spawn) {
            Terraria.Player['void Spawn(PlayerSpawnContext context)'
            ].hook((original, self, context) => {
                original(self, context);
                if (context.ReviveFromDeath) {
                    if (self.difficulty === 1) PlayerLoader.SetupStartingItems(self, true);
                    PlayerLoader.OnRespawn(self);
                }
            });
        }
        
        if (this.HookList.TileInteractionsCheck) {
            Terraria.Player['void TileInteractionsCheck(int myX, int myY)'
            ].hook((original, self, mX, mY) => {
                original(self, mX, mY);
                const type = new TileData(mX, mY).type;
                TileLoader.MouseOver(self, mX, mY, type);
            });
        }
        
        if (this.HookList.TileInteractionsCheckLongDistance) {
            Terraria.Player['void TileInteractionsCheckLongDistance(int myX, int myY)'
            ].hook((original, self, mX, mY) => {
                original(self, mX, mY);
                const type = new TileData(mX, mY).type;
                TileLoader.MouseOverFar(self, mX, mY, type);
            });
        }
        
        if (this.HookList.TileInteractionsUse) {
            Terraria.Player['void TileInteractionsUse(int myX, int myY)'
            ].hook((original, self, mX, mY) => {
                const type = new TileData(mX, mY).type;
                if (type < TileLoader.MAX_VANILLA_ID) {
                    original(self, mX, mY);
                    return;
                }
                if (Terraria.GameContent.UI.WiresUI.Open) return;
                if (!self.tileInteractAttempted) return;
                TileLoader.RightClick(self, mX, mY, type);
            });
        }
        
        if (this.HookList.ItemCheck) {
            Terraria.Player['void ItemCheck()'
            ].hook((original, self) => {
                if (PlayerLoader.PreItemCheck(self)) {
                    original(self);
                    const item = self.HeldItem;
                    if (!item.IsAir && item.type > 0) {
                        CombinedLoader.HoldItem(item, self);
                    }
                }
                PlayerLoader.PostItemCheck(self);
            });
        }
        
        if (this.HookList.ItemCheck_CheckCanUse) {
            Terraria.Player['bool ItemCheck_CheckCanUse(Item sItem)'
            ].hook((original, self, item) => {
                if (!CombinedLoader.CanUseItem(item, self)) return false;
                if (!CombinedLoader.CanAutoReuseItem(item, self)) {
                    self.disableUseUntilRelease = true;
                }
                return original(self, item);
            });
        }
        
        if (this.HookList.ItemCheck_ApplyUseStyle) {
            Terraria.Player['void ItemCheck_ApplyUseStyle(float mountOffset, Item sItem, Rectangle heldItemFrame)'
            ].hook((original, self, mountOffset, item, heldItemFrame) => {
                original(self, mountOffset, item, heldItemFrame);
                CombinedLoader.UseStyle(item, self, mountOffset, heldItemFrame);
            });
        }
        
        if (this.HookList.ItemCheck_ApplyHoldStyle) {
            Terraria.Player['void ItemCheck_ApplyHoldStyle(float mountOffset, Item sItem, Rectangle heldItemFrame)'
            ].hook((original, self, mountOffset, item, heldItemFrame) => {
                original(self, mountOffset, item, heldItemFrame);
                CombinedLoader.HoldStyle(item, self, mountOffset, heldItemFrame);
            });
        }
        
        if (this.HookList.ApplyItemTime) {
            Terraria.Player['void ApplyItemTime(Item sItem)'
            ].hook((original, self, item) => {
                self.SetItemTime(item.useTime * CombinedLoader.UseSpeedMultiplier(item, self));
            });
        }
        
        if (this.HookList.ApplyItemAnimation) {
            Terraria.Player['void ApplyItemAnimation(Item sItem)'
            ].hook((original, self, item) => {
                const multiplier = CombinedLoader.UseAnimationMultiplier(item, self);
                if (item.melee) {
                    self.SetItemAnimation(item.useAnimation * self.meleeSpeed * multiplier);
                } else if (item.summon && Terraria.ID.ItemID.Sets.SummonerWeaponThatScalesWithAttackSpeed[item.type]) {
                    self.SetItemAnimation(item.useAnimation * self.meleeSpeed * multiplier);
                } else if (item.createTile >= 0) {
                    self.SetItemAnimation(item.useAnimation * self.tileSpeed * multiplier);
                } else if (item.createWall >= 0) {
                    self.SetItemAnimation(item.useAnimation * self.wallSpeed * multiplier);
                } else {
                    self.SetItemAnimation(item.useAnimation * multiplier);
                    self.reuseDelay = item.reuseDelay;
                }
                if (self.itemAnimation == self.itemAnimationMax) {
                    CombinedLoader.UseAnimation(item, self);
                }
            });
        }
        
        if (this.HookList.ItemCheck_StartActualUse) {
            Terraria.Player['void ItemCheck_StartActualUse(Item sItem)'
            ].hook((original, self, item) => {
                let flag = true;
                if (Terraria.ID.ItemID.Sets.BossBag[item.type]) {
                    self.disableUseUntilRelease = true;
                    ItemLoader.OpenBossBag(item, self);
                    flag = false;
                }
                else {
                    flag = CombinedLoader.UseItem(item, self);
                }
                
                if (!flag) {
                    let flag1 = item.type == 4711;
                    if (((item.pick > 0 || item.axe > 0 ? 1 : (item.hammer > 0 ? 1 : 0)) | (flag1 ? 1 : 0)) != 0)
                        self.toolTime = 1;
                    if (self.grappling[0] > -1) {
                        self.pulley = false;
                        self.pulleyDir = 1;
                        if (self.controlRight)
                            self.direction = 1;
                        else if (self.controlLeft)
                            self.direction = -1;
                    }
                    self.channel = item.channel;
                    self.attackCD = 0;
                    let flag2 = Terraria.ID.ItemID.Sets.SkipsInitialUseSound[item.type];
                    if (item.UseSound && !flag2) {
                        Terraria.Audio.SoundEngine['SoundEffectInstance PlaySound(LegacySoundStyle type, Vector2 position)'
                        ](item.UseSound, self.Center);
                    }
                } else {
                    original(self, item);
                }
                
                if (ItemLoader.isModType(item.type)) {
                    if (item.maxStack == 1 
                        || item.createTile != -1
                        || item.createWall != -1
                        || item.buffType != 0
                        || item.potion
                        || item.shoot > 0
                    ) return;
                    if (CombinedLoader.ConsumeItem(item, self)) {
                        if (item.stack > 1) --item.stack;
                        else item.TurnToAir(true);
                        CombinedLoader.OnConsumeItem(item, self);
                    }
                }
            });
        }
        
        if (this.HookList.QuickHeal) {
            Terraria.Player['void QuickHeal()'
            ].hook((original, self) => {
                if (self.cursed || self.CCed || self.dead || self.statLife == self.statLifeMax2 || self.potionDelay > 0) return;
                let itemToUse = self['Item QuickHeal_GetItemToUse()']();
                if (!itemToUse) return;
                Terraria.Audio.SoundEngine['SoundEffectInstance PlaySound(LegacySoundStyle type, Vector2 position)'](itemToUse.UseSound, self.position);
                if (itemToUse.potion) {
                    if (itemToUse.type == 227) {
                        self.potionDelay = self.restorationDelayTime;
                    } else {
                        self.potionDelay = self.potionDelayTime;
                    }
                    self.AddBuff(21, self.potionDelay, true, false);
                }
                const healLife = CombinedLoader.GetHealLife(itemToUse, self, itemToUse.healLife);
                const healMana = CombinedLoader.GetHealMana(itemToUse, self, itemToUse.healMana);
                self.statLife = Math.max(0, Math.min(self.statLife + healLife, self.statLifeMax2));
                self.statMana = Math.max(0, Math.min(self.statMana + healMana, self.statManaMax2));
                if (healLife > 0 && Terraria.Main.myPlayer == self.whoAmI) {
                    self.HealEffect(healLife, true);
                }
                if (healMana > 0) {
                    self.addBuff(94, self.manaSickTime, true, false);
                    if (Terraria.Main.myPlayer == self.whoAmI) {
                        self.ManaEffect(healMana);
                    }
                }
                if (itemToUse.stack <= 1) {
                    itemToUse.TurnToAir(true);
                } else {
                    itemToUse.stack--;
                }
                Terraria.Recipe.FindRecipes(false);
            });
        }
        
        if (this.HookList.QuickMana) {
            Terraria.Player['void QuickMana()'
            ].hook((original, self) => {
                if (self.cursed || self.CCed || self.dead || self.statMana == self.statManaMax2) return;
                let itemToUse = self['Item QuickMana_GetItemToUse()']();
                if (!itemToUse) return;
                Terraria.Audio.SoundEngine['SoundEffectInstance PlaySound(LegacySoundStyle type, Vector2 position)'](itemToUse.UseSound, self.position);
                if (itemToUse.potion) {
                    if (itemToUse.type == 227) {
                        self.potionDelay = self.restorationDelayTime;
                    } else {
                        self.potionDelay = self.potionDelayTime;
                    }
                    self.AddBuff(21, self.potionDelay, true, false);
                }
                const healLife = CombinedLoader.GetHealLife(itemToUse, self, itemToUse.healLife);
                const healMana = CombinedLoader.GetHealMana(itemToUse, self, itemToUse.healMana);
                self.statLife = Math.max(0, Math.min(self.statLife + healLife, self.statLifeMax2));
                self.statMana = Math.max(0, Math.min(self.statMana + healMana, self.statManaMax2));
                if (healLife > 0 && Terraria.Main.myPlayer == self.whoAmI) {
                    self.HealEffect(healLife, true);
                }
                if (healMana > 0) {
                    self.AddBuff(94, self.manaSickTime, true, false);
                    if (Terraria.Main.myPlayer == self.whoAmI) {
                        self.ManaEffect(healMana);
                    }
                }
                if (itemToUse.stack <= 1) {
                    itemToUse.TurnToAir(true);
                } else {
                    itemToUse.stack--;
                }
                Terraria.Recipe.FindRecipes(false);
            });
        }
        
        if (this.HookList.ItemCheck_PayMana) {
            Terraria.Player['bool ItemCheck_PayMana(Item sItem, bool canUse)'
            ].hook((original, self, item, canUse) => {
                let flag1 = self.altFunctionUse == 2;
                let flag2 = false;
                let num = Math.floor(item.mana * self.manaCost);
                if (item.type == 2795) flag2 = true;
                if (item.type == 3852 && flag1) num = Math.floor((item.mana * 2) + self.manaCost);
                if (((item.shoot <= 0 ? 0 : (Terraria.ID.ProjectileID.Sets.TurretFeature[item.shoot] ? 1 : 0)) && (flag1 ? 1 : 0)) != 0) flag2 = true;
                if (((item.shoot <= 0 ? 0 : (Terraria.ID.ProjectileID.Sets.MinionTargettingFeature[item.shoot] ? 1 : 0)) && (flag1 ? 1 : 0)) != 0) flag2 = true;
                if (item.type != 3269 && (!self.spaceGun || item.type != 127 && item.type != 4347 && item.type != 4348)) {
                    num = CombinedLoader.ModifyManaCost(item, self, num);
                    if (self.statMana >= num) {
                        if (!flag2) {
                            self.statMana -= num;
                            CombinedLoader.OnConsumeMana(item, self, num);
                        }
                    } else if (self.manaFlower) {
                        self.QuickMana();
                        if (self.statMana >= num) {
                            if (!flag2) {
                                self.statMana -= num;
                                CombinedLoader.OnConsumeMana(item, self, num);
                            }
                        } else canUse = false;
                    } else canUse = false;
                    if (!canUse) {
                        CombinedLoader.OnMissingMana(item, self, num);
                        if (self.statMana >= num) {
                            if (!flag2) {
                                self.statMana -= num;
                                CombinedLoader.OnConsumeMana(item, self, num);
                                canUse = true;
                            }
                        }
                    }
                }
                return canUse;
            });
        }
        
        if (this.HookList.GetWeaponDamage) {
            Terraria.Player['int GetWeaponDamage(Item sItem)'
            ].hook((original, self, item) => {
                return CombinedLoader.ModifyWeaponDamage(item, self, original(self, item));
            });
        }
        
        if (this.HookList.GetWeaponKnockback) {
            Terraria.Player['float GetWeaponKnockback(Item sItem, float KnockBack)'
            ].hook((original, self, item, KnockBack) => {
                return CombinedLoader.ModifyWeaponKnockback(item, self, original(self, item, KnockBack));
            });
        }
        
        if (this.HookList.ItemCheck_Shoot) {
            Terraria.Player['void ItemCheck_Shoot(int i, Item sItem, int weaponDamage)'
            ].hook((original, self, i, item, damage) => {
                if (!CombinedLoader.CanShoot(item, self)) {
                    self['void ApplyItemTime(Item sItem)'](item);
                    return;
                }
                
                let type = item.shoot;
                let knockBack = self.GetWeaponKnockback(item, item.knockBack);
                let position = self.RotatedRelativePoint(self.MountedCenter, true, true);
                
                let velocity = Microsoft.Xna.Framework.Vector2.new();
                velocity.X = Terraria.Main.mouseX + Terraria.Main.screenPosition.X - position.X;
                velocity.Y = Terraria.Main.mouseY + Terraria.Main.screenPosition.Y - position.Y;
                velocity['void Normalize()']();
                velocity = Microsoft.Xna.Framework.Vector2['Vector2 op_Multiply(Vector2 value, float scaleFactor)'](velocity, item.shootSpeed);
                
                const stats = CombinedLoader.ModifyShootStats(item, self, position, velocity, type, damage, knockBack);
                position = stats.position;
                velocity = stats.velocity;
                type = stats.type;
                damage = stats.damage;
                knockBack = stats.knockBack;
                
                if (CombinedLoader.Shoot(item, self, position, velocity, type, damage, knockBack)) {
                    const oldType = item.shoot;
                    const oldAmmo = item.useAmmo;
                    if (item.shoot !== type) {
                        item.shoot = type;
                        item.useAmmo = -1;
                    }
                    original(self, i, item, damage);
                    item.shoot = oldType;
                    item.useAmmo = oldAmmo;
                } else {
                    self['void ApplyItemTime(Item sItem)'](item);
                }
            });
        }
        
        if (this.HookList.ApplyNPCOnHitEffects) {
            Terraria.Player['void ApplyNPCOnHitEffects(Item sItem, Rectangle itemRectangle, int damage, float knockBack, int npcIndex, int dmgRandomized, int dmgDone)'
            ].hook((original, self, item, itemRect, damage, knockBack, npcIndex, dmgRandomized, dmgDone) => {
                original(self, item, itemRect, damage, knockBack, npcIndex, dmgRandomized, dmgDone);
                CombinedLoader.OnHitNPC(item, self, Terraria.Main.npc[npcIndex], dmgDone, knockBack);
            });
        }
        
        if (this.HookList.UpdateEquips) {
            Terraria.Player['void UpdateEquips(int i)'
            ].hook((original, self, i) => {
                original(self, i);
                if (Terraria.Main.myPlayer == i) {
                    CombinedLoader.UpdateEquips(self);
                }
            });
        }
        
        if (this.HookList.ApplyEquipFunctional) {
            Terraria.Player['void ApplyEquipFunctional(int itemSlot, Item currentItem)'
            ].hook((original, self, itemSlot, item) => {
                original(self, itemSlot, item);
                CombinedLoader.UpdateAccessory(item, self, false, self.hideVisibleAccessory[itemSlot]);
            });
        }
        
        if (this.HookList.ApplyEquipVanity) {
            Terraria.Player['void ApplyEquipVanity(int itemSlot, Item currentItem)'
            ].hook((original, self, itemSlot, item) => {
                original(self, itemSlot, item);
                CombinedLoader.UpdateAccessory(item, self, true);
            });
        }
        
        if (this.HookList.UpdateDyes) {
            Terraria.Player['void UpdateDyes()'
            ].hook((original, self) => {
                original(self);
                PlayerLoader.UpdateDyes(self);
            });
        }
        
        if (this.HookList.UpdateArmorSets) {
            Terraria.Player['void UpdateArmorSets(int i)'
            ].hook((original, self, i) => {
                original(self, i);
                CombinedLoader.UpdateArmorSets(self);
            });
        }
        
        if (this.HookList.WingMovement) {
            Terraria.Player['void WingMovement()'
            ].hook((original, self) => {
                original(self);
                CombinedLoader.WingMovement(self);
            });
        }
        
        if (this.HookList.CanAcceptItemIntoInventory) {
            Terraria.Player['bool CanAcceptItemIntoInventory(Item item)'
            ].hook((original, self, item) => {
                if (CombinedLoader.CanPickup(item, self)) {
                    return original(self, item);
                }
                return false;
            });
        }
        
        if (this.HookList.GetItem) {
            Terraria.Player['Item GetItem(int plr, Item newItem, GetItemSettings settings, bool disableMerge)'
            ].hook((original, self, plr, newItem, settings, disableMerge) => {
                const result = original(self, plr, newItem, settings, disableMerge);
                if (result.type === 0) {
                    CombinedLoader.OnPickup(newItem, self);
                }
                return result;
            });
        }
        
        if (this.HookList.ExtractinatorUse) {
            Terraria.Player['void ExtractinatorUse(int extractType, int extractinatorBlockType)'
            ].hook((original, self, extractType, extractinatorBlockType) => {
                const item = self.inventory[self.selectedItem];
                if (CombinedLoader.ExtractinatorUse(item, self, extractType, extractinatorBlockType)) {
                    original(self, extractType, extractinatorBlockType);
                }
            });
        }
        
        if (this.HookList.RecalculateLuck) {
            Terraria.Player['void RecalculateLuck()'
            ].hook((original, self) => {
                if (PlayerLoader.PreModifyLuck(self, self.luck)) {
                    original(self);
                    PlayerLoader.ModifyLuck(self, self.luck);
                }
            });
        }
        
        if (this.HookList.Update) {
            Terraria.Player['void Update(int i)'
            ].hook((original, self, i) => {
                PlayerLoader.PreUpdate(self, i);
                original(self, i);
                PlayerLoader.PostUpdate(self, i);
            });
        }
        
        if (this.HookList.UpdateLifeRegen) {
            Terraria.Player['void UpdateLifeRegen()'
            ].hook((original, self) => {
                PlayerLoader.UpdateBadLifeRegen(self);
                original(self);
                PlayerLoader.UpdateLifeRegen(self);
            });
        }
        
        if (this.HookList.UpdateManaRegen) {
            Terraria.Player['void UpdateManaRegen()'
            ].hook((original, self) => {
                original(self);
                PlayerLoader.UpdateManaRegen(self);
            });
        }
        
        if (this.HookList.UpdateBuffs) {
            Terraria.Player['void UpdateBuffs(int i)'
            ].hook((original, self, i) => {
                PlayerLoader.PreUpdateBuffs(self);
                original(self, i);
                for (let i = 0; i < self.buffType.length; i++) {
                    if (self.buffType[i] < 1) continue;
                    BuffLoader.UpdatePlayer(self, i);
                }
                PlayerLoader.PostUpdateBuffs(self);
            });
        }
        
        if (this.HookList.UpdateDead) {
            Terraria.Player['void UpdateDead()'
            ].hook((original, self) => {
                original(self);
                PlayerLoader.UpdateDead(self);
            });
        }
        
        if (this.HookList.UpdateBiomes) {
            Terraria.Player['void UpdateBiomes()'
            ].hook((original, self) => {
                original(self);
                BiomeLoader.UpdateBiomes(self);
            });
        }
        
        if (this.HookList.BordersMovement) {
            Terraria.Player['void BordersMovement()'].hook((original, self) => {
                PlayerLoader.UpdateMovement(self);
                original(self);
            });
        }
        
        if (this.HookList.ResetEffects) {
            Terraria.Player['void ResetEffects()'
            ].hook((original, self) => {
                original(self);
                for (let i = BuffLoader.MinBuffID; i <= BuffLoader.MaxBuffID; i++) {
                    if (i >= self.buffImmune.length)
                        self.buffImmune = self.buffImmune.cloneResized(BuffLoader.BuffCount);
                    self.buffImmune[i] = false;
                }
                PlayerLoader.ModifyMaxStats(self);
                PlayerLoader.ResetEffects(self);
                
                // NearbyEffects
                for (const tileType of TileLoader.NearbyTiles) {
                    if (Terraria.Main.SceneMetrics.GetTileCount(tileType) > 0) {
                        TileLoader.getModTile(tileType)?.NearbyEffects();
                    }
                }
            });
        }
        
        if (this.HookList.Hurt) {
            Terraria.Player['double Hurt(PlayerDeathReason damageSource, int Damage, int hitDirection, bool pvp, bool quiet, bool Crit, int cooldownCounter, bool dodgeable)'
            ].hook((original, self, damageSource, damage, hitDirection, pvp, quiet, crit, cooldownCounter, dodgeable) => {
                if (PlayerLoader.ImmuneTo(self, damageSource, cooldownCounter, dodgeable)) {
                    return 0.0;
                }
                
                if (PlayerLoader.FreeDodge(self, damageSource, damage, hitDirection, pvp, quiet, crit, cooldownCounter, dodgeable)) {
                    return 0.0;
                }
                
                const modifiers = PlayerLoader.ModifyHurt(self, damage, hitDirection, quiet, crit, dodgeable);
                damage = modifiers.damage;
                hitDirection = modifiers.hitDirection;
                quiet = modifiers.quiet;
                crit = modifiers.crit;
                dodgeable = modifiers.dodgeable;
                
                const result = original(self, damageSource, damage, hitDirection, pvp, quiet, crit, cooldownCounter, dodgeable);
                PlayerLoader.OnHurt(self, damageSource, result, hitDirection, pvp, quiet, crit, cooldownCounter, dodgeable);
                
                if (!self.dead && self.statLife > 0) {
                    PlayerLoader.PostHurt(self, damageSource, result, hitDirection, pvp, quiet, crit, cooldownCounter, dodgeable);
                }
                
                return result;
            });
        }
        
        if (this.HookList.KillMe) {
            Terraria.Player['void KillMe(PlayerDeathReason damageSource, double dmg, int hitDirection, bool pvp)'
            ].hook((original, self, damageSource, damage, hitDirection, pvp) => {
                let flag = !(self.creativeGodMode || self.dead);
                if (flag) PlayerLoader.PreKill(self, damageSource, damage, hitDirection, pvp);
                original(self, damageSource, damage, hitDirection, pvp);
                if (flag) PlayerLoader.Kill(self, damageSource, damage, hitDirection, pvp);
            });
        }
        
        if (this.HookList.GetDyeTraderReward) {
            Terraria.Player['void GetDyeTraderReward(NPC dyeTrader)'
            ].hook((original, self, dyeTrader) => {
                let intList = [
                    3560,
                    3028,
                    3041,
                    3040,
                    3025,
                    3190,
                    3027,
                    3026,
                    3554,
                    3553,
                    3555,
                    2872,
                    3534,
                    2871
                ];
                if (Terraria.Main.hardMode) {
                    intList.push(3039);
                    intList.push(3038);
                    intList.push(3598);
                    intList.push(3597);
                    intList.push(3600);
                    intList.push(3042);
                    intList.push(3533);
                    intList.push(3561);
                    if (Terraria.NPC.downedMechBossAny) {
                        intList.push(2883);
                        intList.push(2869);
                        intList.push(2873);
                        intList.push(2870);
                    }
                    if (Terraria.NPC.downedPlantBoss) {
                        intList.push(2878);
                        intList.push(2879);
                        intList.push(2884);
                        intList.push(2885);
                    }
                    if (Terraria.NPC.downedMartians) {
                        intList.push(2864);
                        intList.push(3556);
                    }
                    if (Terraria.NPC.downedMoonlord) {
                        intList.push(3024);
                    }
                }
                PlayerLoader.GetDyeTraderReward(self, dyeTrader, intList);
                if (intList.length <= 0) return;
                intList = [...new Set(intList)];
                let Type = intList[Math.floor(Math.random()*intList.length)];
                let newItem = Terraria.Item.new();
                newItem['void SetDefaults(int Type)'](Type);
                newItem.stack = 3;
                newItem.position = self.Center;
                let obj = self.GetItem(self.whoAmI, newItem, Terraria.GetItemSettings.NPCEntityToPlayerInventorySettings, false);
                if (obj.stack <= 0) return;
                let idx = Terraria.Item['int NewItem(int X, int Y, int Width, int Height, int Type, int Stack, bool noBroadcast, int pfix, bool noGrabDelay, bool reverseLookup)'
                ](self.position.X, self.position.Y, self.width, self.height, obj.type, obj.stack, false, 0, true, false);
                if (Terraria.Main.netMode != 1) return;
                Terraria.NetMessage.SendData(21, -1, -1, Terraria.Localization.NetworkText.Empty, idx, 1.0, 0, 0, 0, 0, 0);
            });
        }
        
        if (this.HookList.GetAnglerQuestReward) {
            Terraria.Player['void GetAnglerReward(NPC angler, int questItemType)'
            ].hook((original, self, angler, questItemType) => {
                if (PlayerLoader.AnglerQuestReward(self, angler, questItemType)) {
                    original(self, angler, questItemType);
                }
            });
        }
        
        if (this.HookList.SellItem) {
            Terraria.Player['bool SellItem(Item item, int stack)'
            ].hook((original, self, item, stack) => {
                const vendor = Terraria.Main.npc[self.talkNPC];
                const shopInventory = Array.from(Terraria.Main['Chest[] get_shop()'](Terraria.Main.instance))[Terraria.Main.npcShop].item;
                if (!PlayerLoader.CanSellItem(self, vendor, shopInventory, item)) {
                    return false;
                }
                const result = original(self, item, stack);
                if (result) {
                    PlayerLoader.PostSellItem(self, vendor, shopInventory, item);
                }
                return result;
            });
        }
        
        if (this.HookList.SetupStartingItems) {
            GUIPlayerCreateMenu['void SetupStartingItems()'
            ].hook((original, self) => {
                original(self);
                PlayerLoader.SetupStartingItems(Terraria.Main.PendingPlayer);
            });
        }
        
        if (this.HookList.AddBuff_ActuallyTryToAddTheBuff) {
            Terraria.Player['bool AddBuff_ActuallyTryToAddTheBuff(int type, int time)'
            ].hook((original, self, buffType, buffTime) => {
                const result = original(self, buffType, buffTime);
                if (result) {
                    BuffLoader.ApplyPlayer(self, buffType, buffTime);
                }
                return result;
            });
        }
        
        if (this.HookList.AddBuff_TryUpdatingExistingBuffTime) {
            Terraria.Player['bool AddBuff_TryUpdatingExistingBuffTime(int type, int time)'
            ].hook((original, self, buffType, buffTime) => {
                let result = BuffLoader.ReApplyPlayer(self, buffTime, self['int FindBuffIndex(int type)'](buffType)) ?? true;
                if (result) {
                    result = original(self, buffType, buffTime);
                }
                return result;
            });
        }
        
        if (this.HookList.RemoveBuff) {
            const GUIBuffs = new NativeClass('', 'GUIBuffs');
            GUIBuffs['void RemoveBuff(int buff)'
            ].hook((original, self, buffIndex) => {
                const player = Terraria.Main.player[Terraria.Main.myPlayer];
                const buffType = player.buffType[buffIndex];
                const buffTime = player.buffTime[buffIndex];
                if (BuffLoader.CanRemove(player, buffType, buffTime, buffIndex)) {
                    if (Terraria.Main.debuff[buffType]) {
                        player.DelBuff(buffIndex);
                        BuffLoader.OnRemove(player, buffType, buffTime, buffIndex);
                        return;
                    }
                    original(self, buffIndex);
                    BuffLoader.OnRemove(player, buffType, buffTime, buffIndex);
                }
            });
        }
        
        this.initialized = true;
    }
    
    static OnWorldUnload() {
        this.worldLoaded = false;
    }
}