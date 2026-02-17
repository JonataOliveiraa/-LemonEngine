import { Terraria, Microsoft, Modules, System } from './../ModImports.js';
import { PlayerLoader } from './../Loaders/PlayerLoader.js';
import { BuffLoader } from './../Loaders/BuffLoader.js';
import { NPCLoader } from './../Loaders/NPCLoader.js';
import { CombinedLoader } from './../Loaders/CombinedLoader.js';
import { NPCSpawnInfo } from './../NPCSpawnInfo.js';

const { Rectangle } = Modules;

export class NPCHooks {
    static initialized = false;
    static LoadedTypes = new Set();
    
    // Here you can disable the hooks that won't be used in your mod to avoid unnecessary processing
    static HookList = {
        SetDefaults: true,
        DrawNPCs: true,
        CheckActive: true,
        CheckDead: true,
        NPCLoot: true,
        BossHeadSlot: true,
        BossHeadRotation: true,
        AI: true,
        GetAlpha: true,
        TypeToDefaultHeadIndex: true,
        CatchNPC: true,
        ReleaseNPC: true,
        AddBuff: true,
        UpdateNPC_BuffApplyDOTs: false,
        UpdateNPC_BuffSetFlags: false, // lag
        HitEffect: true,
        Collision_DecideFallThroughPlatforms: true,
        GetChat: true,
        getNewNPCName: true,
        GetShimmered: true,
        UsesPartyHat: true,
        GUINPCDialogue: true,
        SpawnNPC: true,
        NewNPC: true,
        SetupShop: true
    };
    
    static realTypes = {};
    static NPCsToDraw_BehindTiles = new Set();
    static NPCsToDraw_OverTiles = new Set();
    
    // These NPCs usually appear in large numbers and can cause lag.
    static BlackListedNPCs = new Set([
        135, 136 // destroyer
    ]);
    
    static Initialize() {
        if (this.initialized) return;
        
        if (this.HookList.SetDefaults) {
            Terraria.NPC['void SetDefaults(int Type, NPCSpawnParams spawnparams)'
            ].hook((original, self, type, spawnparams) => {
                original(self, type, spawnparams);
                self.buffImmune = self.buffImmune.cloneResized(BuffLoader.BuffCount);
                
                if (!NPCLoader.isModType(type)) {
                    NPCLoader.SetDefaults(self);
                    return;
                }
                
                if (!spawnparams.gameModeData)
                    spawnparams.gameModeData = Terraria.Main.GameModeInfo;
                if (Terraria.Main.getGoodWorld && spawnparams.sizeScaleOverride)
                    spawnparams.sizeScaleOverride = (spawnparams.sizeScaleOverride + spawnparams.sizeScaleOverride * spawnparams.sizeScaleOverride) / 2;
                
                self.waterMovementSpeed = 0.5;
                self.lavaMovementSpeed = 0.5;
                self.honeyMovementSpeed = 0.25;
                self.shimmerMovementSpeed = 0.5;
                self.netSpam = 0;
                self.nameOver = 0;
                self.SpawnedFromStatue = false;
                self.CanBeReplacedByOtherNPCs = false;
                self.altTexture = 0;
                self.townNpcVariationIndex = 0;
                self.catchItem = 0;
                self.releaseOwner = 255;
                self.rarity = 0;
                self.takenDamageMultiplier = 1;
                self.netStream = 32;
                self.needsUniqueInfoUpdate = true;
                self.setFrameSize = true;
                self.netSkip = -2;
                self.netAlways = false;
                self.realLife = -1;
                self._givenName = '';
                self.npcSlots = 1;
                self.shimmerTransparency = 0;
                if (self.netShimmer) {
                    self.shimmerTransparency = 1;
                    self.netShimmer = false;
                }
                self.dontCountMe = false;
                self.canDisplayBuffs = true;
                self.midas = false;
                self.ichor = false;
                self.onFire = false;
                self.onFire2 = false;
                self.onFire3 = false;
                self.onFrostBurn = false;
                self.onFrostBurn2 = false;
                self.poisoned = false;
                self.markedByScytheWhip = false;
                self.venom = false;
                self.shadowFlame = false;
                self.soulDrain = false;
                self.shimmering = false;
                self.lifeRegen = 0;
                self.lifeRegenCount = 0;
                self.lifeRegenExpectedLossPerSecond = -1;
                self.confused = false;
                self.loveStruck = false;
                self.stinky = false;
                self.dryadWard = false;
                self.immortal = false;
                self.chaseable = true;
                self.canGhostHeal = true;
                self.javelined = false;
                self.tentacleSpiked = false;
                self.bloodButchered = false;
                self.celled = false;
                self.dryadBane = false;
                self.daybreak = false;
                self.dontTakeDamageFromHostiles = false;
                self.betsysCurse = false;
                self.oiled = false;
                self.type = type;
                self.netID = type;
                self.aiStyle = -1;
                self.justHit = false;
                self.timeLeft = self.activeTime;
                self.target = 255;
                self.defDamage = self.damage;
                self.defDefense = self.defense;
                self.coldDamage = false;
                self.trapImmune = false;
                self.direction = 1;
                self.oldDirection = self.direction;
                self.frameCounter = 0;
                self.alpha = 0;
                self.hide = false;
                self.scale = 1;
                self.knockBackResist = 1;
                self.oldTarget = self.target;
                self.rotation = 0;
                self.noGravity = false;
                self.noTileCollide = false;
                self.netUpdate = true;
                self.netUpdate2 = false;
                self.collideX = false;
                self.collideY = false;
                self.boss = false;
                self.spriteDirection = self.direction;
                self.behindTiles = false;
                self.lavaImmune = false;
                self.value = 0;
                self.extraValue = 0;
                self.dontTakeDamage = false;
                self.catchableNPCTempImmunityCounter = 0;
                self.frame = Rectangle.new(
                    0, 0,
                    Terraria.GameContent.TextureAssets.Npc[self.type].Value.Width,
                    Terraria.GameContent.TextureAssets.Npc[self.type].Value.Height / Terraria.Main.npcFrameCount[self.type]
                );
                self.statsAreScaledForThisManyPlayers = 0;
                self.strengthMultiplier = 1;
                self.townNPC = false;
                self.homeless = false;
                self.homeTileX = -1;
                self.homeTileY = -1;
                self.housingCategory = 0;
                self.friendly = false;
                self.breath = 200;
                self.breathCounter = 0;
                self.reflectsProjectiles = false;
                self.despawnEncouraged = false;
                
                const npc = NPCLoader.getModNPC(self.type);
                if (!npc) {
                    self.active = false;
                    return;
                }
                    
                npc.SetDefaults();
                Object.assign(self, npc.NPC);
                
                if (!Terraria.ID.NPCID.Sets.NeedsExpertScaling[type] && (npc.lifeMax <= 5 || npc.damage == 0 || npc.friendly || npc.townNPC)) {
                    return;
                }
                
                Terraria.NPC.ScaleStats(self, spawnparams.playerCountForMultiplayerDifficultyOverride, spawnparams.gameModeData, spawnparams.strengthMultiplierOverride);
                
                let strength = 1;
                if (spawnparams.strengthMultiplierOverride?.HasValue) {
                    strength = spawnparams.strengthMultiplier.Value;
                }
                if (strength >= 2 || Terraria.Main.expertMode) {
                    let numPlayers = Terraria.NPC.GetActivePlayerCount();
                    let balance = Terraria.NPC.GetBalance();
                    let bossAdjustment = 1.0;
                    if (strength >= 3 || Terraria.Main.masterMode) {
                        bossAdjustment = 0.85;
                    }
                    npc.ApplyDifficultyAndPlayerScaling(self, numPlayers, balance, bossAdjustment);
                }
                
                npc.ApplyBuffImmunity(self);
                if (npc.SpawnWithHigherTime) self.SpawnWithHigherTime(npc.SpawnWithHigherTime);
                
                self.defDefense = self.defense;
                self.defDamage = self.damage;
                self.life = self.lifeMax;
                self.active = self.life > 0;
            });
        }
        
        if (this.HookList.DrawNPCs) {
            Terraria.Main['void DrawNPCs(bool behindTiles)'
            ].hook((original, self, behindTiles) => {
                original(self, behindTiles);
                
                let drawNpcs = [];
                if (behindTiles) drawNpcs.push(...NPCHooks.NPCsToDraw_BehindTiles);
                else drawNpcs.push(...NPCHooks.NPCsToDraw_OverTiles);
                
                for (const npcIndex of drawNpcs) {
                    const npc = Terraria.Main.npc[npcIndex];
                    if (npc.active) {
                        if (NPCLoader.PreDraw(npc, Terraria.Main.spriteBatch, Terraria.Main.screenPosition)) {
                            let originalTexture = null;
                            let altTextureIndex = npc.townNPC ? NPCLoader.GetAltTextureIndex(npc) : -1;
                            if (altTextureIndex > 0) {
                                originalTexture = Terraria.GameContent.TextureAssets.Npc[npc.type];
                                Terraria.GameContent.TextureAssets.Npc[npc.type] = Terraria.GameContent.TextureAssets.Extra[altTextureIndex];
                            }
                            
                            Terraria.Main.instance['void DrawNPCDirect(SpriteBatch mySpriteBatch, NPC rCurrentNPC, bool behindTiles, Vector2 screenPos)'
                            ](Terraria.Main.spriteBatch, npc, behindTiles, Terraria.Main.screenPosition);
                            
                            if (originalTexture != null) {
                                Terraria.GameContent.TextureAssets.Npc[npc.type] = originalTexture;
                            }
                            
                            NPCLoader.PostDraw(npc, Terraria.Main.spriteBatch, Terraria.Main.screenPosition);
                        }
                    } else if (behindTiles) {
                        NPCHooks.NPCsToDraw_BehindTiles.delete(npcIndex);
                    } else {
                        NPCHooks.NPCsToDraw_OverTiles.delete(npcIndex);
                    }
                }
            });
            
            Terraria.NPC['void FindFrame()'
            ].hook((original, self) => {
                // Vanilla Code
                if (!NPCLoader.isModType(self.type)) {
                    original(self);
                    return;
                }
                
                let frameHeight = 1;
                if (!Terraria.Main.dedServ) {
                    if (!Terraria.GameContent.TextureAssets.Npc[self.type].IsLoaded)
                        return;
                    frameHeight = Terraria.GameContent.TextureAssets.Npc[self.type].Value.Height / Terraria.Main.npcFrameCount[self.type];
                }
                
                // AnimationType
                const modnpc = NPCLoader.getModNPC(self.type);
                if (modnpc && modnpc.AnimationType > 0) {
                    self.type = modnpc.AnimationType;
                    if (!this.LoadedTypes.has(modnpc.AnimationType)) {
                        Terraria.Main.instance.LoadNPC(modnpc.AnimationType);
                        this.LoadedTypes.add(modnpc.AnimationType);
                    }
                    original(self);
                    self.type = modnpc.Type;
                    NPCLoader.FindFrame(self, frameHeight);
                    return;
                }
                
                // FindFrame
                const newPos = self.position;
                newPos.X + self.netOffset.X;
                newPos.Y + self.netOffset.Y;
                self.position = newPos;
                
                NPCLoader.FindFrame(self, frameHeight);
            });
        }
        
        if (this.HookList.CheckActive) {
            Terraria.NPC['void CheckActive()'
            ].hook((original, self) => {
                if (this.BlackListedNPCs.has(self.type)) {
                    original(self);
                    return;
                }
                
                if (NPCLoader.CheckActive(self)) {
                    original(self);
                }
                
                if (self.active) {
                    if (self.boss) NPCLoader.AnyBossActive = true;
                    if (NPCLoader.ModTypes.has(self.type)) {
                        if (self.boss) NPCLoader.ActiveBoss = self.type;
                        if (self.behindTiles) {
                            if (!NPCHooks.NPCsToDraw_BehindTiles.has(self.whoAmI)) {
                                NPCHooks.NPCsToDraw_BehindTiles.add(self.whoAmI);
                            }
                        } else {
                            if (!NPCHooks.NPCsToDraw_OverTiles.has(self.whoAmI)) {
                                NPCHooks.NPCsToDraw_OverTiles.add(self.whoAmI);
                            }
                        }
                    }
                }
            });
        }
        
        if (this.HookList.CheckDead) {
            Terraria.NPC['void checkDead()'
            ].hook((original, self) => {
                if (NPCHooks.BlackListedNPCs.has(self.type)) {
                    original(self);
                    return;
                }
                
                if (NPCLoader.CheckDead(self)) {
                    if (!self.active || (self.realLife >= 0 && self.realLife !== self.whoAmI) || self.life > 0) {
                        original(self);
                        return;
                    } else {
                        if (NPCLoader.PreKill(self)) {
                            original(self);
                        } else {
                            self.active = false;
                        }
                    }
                }
            });
        }
        
        if (this.HookList.NPCLoot) {
            Terraria.NPC['void NPCLoot()'
            ].hook((original, self) => {
                if (!NPCLoader.isModType(self.type)) {
                    original(self);
                    NPCLoader.OnKill(self);
                    return;
                }
                
                if (Terraria.Main.netMode == 1) return;
                
                const closestPlayer = Terraria.Main.player[Terraria.Main.myPlayer];
                
                if (self.GetWereThereAnyInteractions()) {
                    if (self.IsNPCValidForBestiaryKillCredit()) {
                        Terraria.Main.BestiaryTracker.Kills.RegisterKill(self);
                    }
                    self.CountKillForBannersAndDropThem();
                }
                
                let canDrop = false;
                if (NPCLoader.BeforeLoot(self, closestPlayer)) {
                    canDrop = true;
                    self.NPCLoot_DropItems(closestPlayer);
                }
                NPCLoader.OnKill(self);
                
                if (self.boss) {
                    // DropBossPotionsAndHearts
                    if (canDrop) {
                        const Next = Terraria.Main.rand['int Next(int minValue, int maxValue)'];
                        let Stack = Next(5, 16);
                        let Type = NPCLoader.BossLoot(self, 28);
                        Terraria.Item['int NewItem(int X, int Y, int Width, int Height, int Type, int Stack, bool noBroadcast, int pfix, bool noGrabDelay, bool reverseLookup)'
                        ](self.position.X, self.position.Y, self.width, self.height, Type, Stack, false, 0, false, false);
                        let num = Next(0, 5) + 5;
                        for (let i = 0; i < num; i++) {
                            Terraria.Item['int NewItem(int X, int Y, int Width, int Height, int Type, int Stack, bool noBroadcast, int pfix, bool noGrabDelay, bool reverseLookup)'
                            ](self.position.X, self.position.Y, self.width, self.height, 58, 1, false, 0, false, false);
                        }
                    }
                    
                    // CelebrateBossDeath
                    if (Terraria.Main.netMode == 0) {
                        const modNPC = NPCLoader.getModNPC(self.type);
                        if (modNPC) {
                            if (typeof modNPC.DeathMessage === 'function') {
                                const deathMessage = modNPC.DeathMessage(self);
                                if (deathMessage) {
                                    const msgColor = modNPC.DeathMessageColor(self);
                                    Terraria.Main.NewText(deathMessage, msgColor?.R ?? 175, msgColor?.G ?? 75, msgColor?.B ?? 255);
                                }
                            }
                        }
                    }
                }
                
                // Notify NPC Death
                if (self.townNPC) {
                    if (Terraria.Main.netMode == 0) {
                        const modNPC = NPCLoader.getModNPC(self.type);
                        if (modNPC && typeof modNPC.DeathMessage === 'function') {
                            const deathMessage = modNPC.DeathMessage(self);
                            if (deathMessage) {
                                const msgColor = modNPC.DeathMessageColor(self);
                                Terraria.Main.NewText(deathMessage, msgColor?.R ?? 255, msgColor?.G ?? 25, msgColor?.B ?? 25);
                            }
                        }
                    }
                }
                
                self.NPCLoot_DropMoney(closestPlayer);
                if (NPCLoader.DropHeals(self, closestPlayer)) {
                    self.NPCLoot_DropCommonLifeAndMana(closestPlayer);
                }
            });
        }
        
        if (this.HookList.BossHeadSlot) {
            Terraria.NPC['int GetBossHeadTextureIndex()'
            ].hook((original, self) => {
                return NPCLoader.BossHeadSlot(self) ?? original(self);
            });
        }
        
        if (this.HookList.BossHeadRotation) {
            Terraria.NPC['float GetBossHeadRotation()'
            ].hook((original, self) => {
                return NPCLoader.BossHeadRotation(self) ?? original(self);
            });
        }
        
        if (this.HookList.AI) {
            Terraria.NPC['void AI()'
            ].hook((original, self) => {
                if (NPCHooks.BlackListedNPCs.has(self.type)) {
                    original(self);
                    return;
                }
                if (NPCLoader.PreAI(self)) {
                    let oldType = 0;
                    const overrideAI = NPCLoader.getModNPC(self.type)?.AIType ?? 0;
                    if (overrideAI > 0) {
                        NPCHooks.realTypes[self.whoAmI] = self.type;
                        oldType = self.type;
                        self.type = overrideAI;
                    }
                    original(self);
                    if (oldType) {
                        delete NPCHooks.realTypes[self.whoAmI];
                        self.type = oldType;
                    } else if (self.aiStyle == 7) {
                        if (NPCLoader.isModType(self.type)) {
                            const attackType = Terraria.ID.NPCID.Sets.AttackType[self.type];
                            let flag = false;
                            if (attackType === 0) {
                                if (self.ai[0] == 10.0) {
                                    flag = true;
                                }
                            } else if (attackType === 1) {
                                if (self.ai[0] == 12.0) {
                                    flag = true;
                                }
                            } else if (attackType === 2) {
                                if (self.ai[0] == 14.0) {
                                    flag = true;
                                }
                            } else if (attackType === 3) {
                                if (self.ai[0] == 15.0) {
                                    flag = true;
                                }
                            }
                            if (flag) {
                                NPCLoader.getModNPC(self.type)?.TownNPCAttack(self, self.ai[1] === Terraria.ID.NPCID.Sets.AttackTime[self.type], self.ai[1]);
                            }
                        }
                    }
                    NPCLoader.AI(self);
                }
                NPCLoader.PostAI(self);
            });
        }
        
        if (this.HookList.GetAlpha) {
            Terraria.NPC['Color GetAlpha(Color newColor)'
            ].hook((original, self, newColor) => {
                if (NPCHooks.BlackListedNPCs.has(self.type))
                    return original(self, newColor);
                return original(self, NPCLoader.GetAlpha(self, newColor));
            });
        }
        
        if (this.HookList.TypeToDefaultHeadIndex) {
            Terraria.NPC['int TypeToDefaultHeadIndex(int type)'
            ].hook((original, type) => {
                return NPCLoader.NPCHeadSlot(type) ?? original(type);
            });
        }
        
        if (this.HookList.CatchNPC) {
            Terraria.NPC['void CatchNPC(int i, int who)'
            ].hook((original, npcIndex, playerIndex) => {
                const npc = Terraria.Main.npc[npcIndex];
                const player = Terraria.Main.player[playerIndex];
                if (!npc || !npc.active) return;
                if (!CombinedLoader.CanCatchNPC(player, npc, player.inventory[player.selectedItem])) return;
                if (Terraria.Main.netMode == 1) {
                    npc.active = false;
                    Terraria.NetMessage.SendData(70, -1, -1, Terraria.Localization.NetworkText.Empty, npcIndex, playerIndex, 0, 0, 0, 0, 0);
                } else {
                    if (npc.catchItem <= 0) return;
                    if (npc.SpawnedFromStatue) {
                        let position = Vec2(npc.Center.X - 20, npc.Center.Y);
                        Terraria.Utils.PoofOfSmoke(position);
                        CombinedLoader.OnCatchNPC(player, npc, player.inventory[player.selectedItem], true);
                        Terraria.NetMessage.SendData(23, -1, -1, Terraria.Localization.NetworkText.Empty, npcIndex, 0, 0, 0, 0, 0, 0);
                        Terraria.NetMessage.SendData(106, -1, -1, Terraria.Localization.NetworkText.Empty, Math.floor(position.X), position.Y, 0, 0, 0, 0, 0);
                    } else {
                        Terraria.Item['int NewItem(int X, int Y, int Width, int Height, int Type, int Stack, bool noBroadcast, int pfix, bool noGrabDelay, bool reverseLookup)'
                        ](player.Center.X, player.Center.Y, 0, 0, npc.catchItem, 1, false, 0, true, false);
                        npc.active = false;
                        Terraria.NetMessage.SendData(23, -1, -1, Terraria.Localization.NetworkText.Empty, npcIndex, 0, 0, 0, 0, 0, 0);
                        CombinedLoader.OnCatchNPC(player, npc, player.inventory[player.selectedItem], false);
                    }
                }
            });
        }
        
        if (this.HookList.ReleaseNPC) {
            Terraria.NPC['int ReleaseNPC(int x, int y, int Type, int Style, int who)'
            ].hook((original, x, y, type, style, playerIndex) => {
                const player = Terraria.Main.player[playerIndex];
                const item = player.inventory[player.selectedItem];
                let result = -1;
                if (PlayerLoader.CanReleaseNPC(player, type, item, x, y)) {
                    result = original(x, y, type, style, playerIndex);
                }
                if (result !== -1) {
                    PlayerLoader.OnReleaseNPC(player, Terraria.Main.npc[result]);
                }
                return result;
            });
        }
        
        if (this.HookList.AddBuff) {
            Terraria.NPC['void AddBuff(int type, int time, bool quiet)'
            ].hook((original, self, buffType, buffTime, quiet) => {
                const currentIndex = self.FindBuffIndex(buffType);
                if (currentIndex >= 0) {
                    if (BuffLoader.ReApplyNPC(self, buffTime, currentIndex)) {
                        original(self, buffType, buffTime, quiet);
                        return;
                    }
                }
                original(self, buffType, buffTime, quiet);
                if (self.FindBuffIndex(buffType) >= 0) {
                    BuffLoader.ApplyNPC(self, buffType, buffTime);
                }
            });
        }
        
        if (this.HookList.UpdateNPC_BuffApplyDOTs) {
            Terraria.NPC['void UpdateNPC_BuffApplyDOTs()'
            ].hook((original, self) => {
                original(self);
                if (this.BlackListedNPCs.has(self.type)) return;
                if (self.dontTakeDamage) return;
                NPCLoader.UpdateLifeRegen(self, self.lifeRegenExpectedLossPerSecond);
            });
        }
        
        if (this.HookList.UpdateNPC_BuffSetFlags) {
            Terraria.NPC['void UpdateNPC_BuffSetFlags(bool lowerBuffTime)'
            ].hook((original, self, lowerBuffTime) => {
                original(self, lowerBuffTime);
                if (!NPCHooks.BlackListedNPCs.has(self.type)) {
                    for (let i = 0; i < 5; i++) {
                        if (self.buffType[i] > 0) {
                            if (self.buffTime[i] > 0) {
                                BuffLoader.UpdateNPC(self, i);
                            }
                        }
                    }
                }
            });
        }
        
        if (this.HookList.HitEffect) {
            Terraria.NPC['void HitEffect(int hitDirection, double dmg)'
            ].hook((original, self, hitDirection, dmg) => {
                original(self, hitDirection, dmg);
                NPCLoader.HitEffect(self, hitDirection, dmg);
            });
        }
        
        if (this.HookList.Collision_DecideFallThroughPlatforms) {
            Terraria.NPC['bool Collision_DecideFallThroughPlatforms()'
            ].hook((original, self) => {
                if (self.type < NPCLoader.MAX_VANILLA_ID) {
                    return original(self);
                }
                if (NPCLoader.ModTypes.has(self.type)) {
                    return NPCLoader.CanFallThroughPlatforms(self) ?? original(self);
                }
                return false;
            });
        }
        
        if (this.HookList.GetChat) {
            Terraria.NPC['string GetChat()'
            ].hook((original, self) => {
                if (NPCLoader.CanChat(self)) {
                    return NPCLoader.GetChat(self) ?? original(self);
                }
                return '';
            });
        }
        
        if (this.HookList.getNewNPCName) {
            Terraria.NPC['string getNewNPCName(int npcType)'
            ].hook((original, type) => {
                return NPCLoader.GetNewNPCName(type) ?? original(type);
            });
        }
        
        if (this.HookList.GetShimmered) {
            Terraria.NPC['void GetShimmered()'
            ].hook((original, self) => {
                let flag = false;
                let oldType = self.type;
                if (NPCLoader.isModType(self.type)
                && Terraria.ID.NPCID.Sets.ShimmerTownTransform[self.type]
                ) {
                    self.type = Terraria.ID.NPCID.Guide;
                    flag = true;
                }
                original(self);
                if (flag) {
                    self.type = oldType;
                }
            });
        }
        
        if (this.HookList.UsesPartyHat) {
            Terraria.NPC['bool UsesPartyHat()'
            ].hook((original, self) => {
                let result = original(self);
                if (result && NPCLoader.isModType(self.type)) {
                    return NPCLoader.getModNPC(self.type)?.UsesPartyHat(self) ?? result;
                }
                return result;
            });
        }
        
        if (this.HookList.GUINPCDialogue) {
            const SpriteSortMode = new NativeClass('Microsoft.Xna.Framework.Graphics', 'SpriteSortMode');
            const GUINPCDialogue = new NativeClass('', 'GUINPCDialogue');
            const GUIControlsBanner = new NativeClass('', 'GUIControlsBanner');
            const GUIInstance = new NativeClass('', 'GUIInstance');
            const GUIInputRegionManager = new NativeClass('', 'GUIInputRegionManager');
            const GUIInputRegionManager_RegisterInputRegion = GUIInputRegionManager['bool RegisterInputRegion(Rectangle rect)'];
            const GUITransactionButton = new NativeClass('', 'GUITransactionButton');
            const GUITransactionButton_Draw = GUITransactionButton['InputState Draw(TransactionButton_Layout layout, Texture2D itemTexture, string label, bool disabled, ref float scale, Nullable`1 overloadedItemColour, bool forcedPressed, bool hasControllerFocus, bool forceOver, bool disablePressedState)'];
            const ControllerActionManager = new NativeClass('Controller', 'ControllerActionManager');
            const NPCDialogue_Layout = new NativeClass('', 'NPCDialogue_Layout');
            const LayoutCalculator = new NativeClass('', 'LayoutCalculator');
            const TutorialLevel = new NativeClass('', 'TutorialLevel');
            const ItemSlot = new NativeClass('Terraria.UI', 'ItemSlot');
            const Int64 = new NativeClass('System', 'Int64');
            GUINPCDialogue.Draw.hook((original, self) => {
                const player = Terraria.Main.player[Terraria.Main.myPlayer];
                if (player.talkNPC < 0 || TutorialLevel.Instance?.Enabled) {
                    original(self);
                    return;
                }
                
                const npc = Terraria.Main.npc[player.talkNPC];
                if (!NPCLoader.isModType(npc.type) && npc.type >= NPCLoader.MAX_VANILLA_ID) {
                    original(self);
                    return;
                }
                
                let originalTexture = null;
                let altTextureIndex = npc.townNPC ? NPCLoader.GetAltTextureIndex(npc) : -1;
                if (altTextureIndex > 0) {
                    originalTexture = Terraria.GameContent.TextureAssets.Npc[npc.type];
                    Terraria.GameContent.TextureAssets.Npc[npc.type] = Terraria.GameContent.TextureAssets.Extra[altTextureIndex];
                }
                original(self);
                if (originalTexture != null) {
                    Terraria.GameContent.TextureAssets.Npc[npc.type] = originalTexture;
                }
                
                const modNpc = NPCLoader.getModNPC(npc.type);
                
                let active = GUIInstance.Active;
                let layout = NPCDialogue_Layout.Instance;
                
                const button1 = {
                    text: '',
                    texture: null,
                    cost: 0
                };
                const button2 = {
                    text: '',
                    texture: null
                }
                NPCLoader.SetChatButtons(npc, player, button1, button2);
                
                ControllerActionManager.Instance.get_ActiveController();
                
                let option1Clicked = false;
                if (self.NumberOfOptions < 1 && button1.text.length > 0) {
                    self.NumberOfOptions = 1;
                    let option1State = GUITransactionButton_Draw(
                        layout.Option1, button1.texture, button1.text,
                        false, 0, null,
                        active.GUIVirtualInputController.ControllerActive,
                        false, false, false
                    );
                    if (option1State.value__ != GUITransactionButton.InputState.None.value__ && ControllerActionManager.AnyControllerConnected) {
                        active.GUIControlsBanner.AddAction(
                            GUIControlsBanner.ActionSource.NPCDialogue,
                            active.GUIControllerNavigationController.UIAction[0],
                            button1.text
                        );
                    }
                    option1Clicked = option1State.value__ == GUITransactionButton.InputState.Clicked.value__;
                }
                
                let option2Clicked = false;
                if (self.NumberOfOptions < 2 && button2.text.length > 0) {
                    self.NumberOfOptions = 2;
                    let option2State = GUITransactionButton_Draw(
                        layout.Option2, button2.texture, button2.text,
                        false, 0, null,
                        active.GUIVirtualInputController.ControllerActive,
                        false, false, false
                    );
                    if (option2State.value__ != GUITransactionButton.InputState.None.value__ && ControllerActionManager.AnyControllerConnected) {
                        active.GUIControlsBanner.AddAction(
                            GUIControlsBanner.ActionSource.NPCDialogue,
                            active.GUIControllerNavigationController.UIAction[0],
                            button2.text
                        );
                    }
                    option2Clicked = option2State.value__ == GUITransactionButton.InputState.Clicked.value__;
                }
                
                if (button1.cost > 0) {
                    let costLayout = ControllerActionManager.AnyControllerConnected 
                        ? layout.Option1CostController
                        : layout.Option1Cost;
                    
                    let costPosition = LayoutCalculator.GetAnchoredPosition(
                        costLayout.AnchorControl,
                        costLayout.Anchor,
                        costLayout.Location);
                    
                    Terraria.Main.spriteBatch.End();
                    Terraria.Main.spriteBatch['void Begin(SpriteSortMode sortMode, BlendState blendState, SamplerState samplerState, DepthStencilState depthStencilState, RasterizerState rasterizerState, Effect effect, Nullable`1 transformMatrix, bool defferedBatch)'
                    ](SpriteSortMode.Deferred, null, null, null, null, null, null, true);
                    
                    Terraria.Main.spriteBatch2['void Begin(SpriteSortMode sortMode, BlendState blendState, SamplerState samplerState, DepthStencilState depthStencilState, RasterizerState rasterizerState, Effect effect, Nullable`1 transformMatrix, bool defferedBatch)'
                    ](SpriteSortMode.Deferred, null, null, null, null, null, null, true);
                    ItemSlot.DrawCost(Terraria.Main.spriteBatch, costPosition.X, costPosition.Y, BigInt(button1.cost), Terraria.Main.spriteBatch2);
                    Terraria.Main.spriteBatch.End();
                    Terraria.Main.spriteBatch2.End();
                    
                    Terraria.Main.spriteBatch['void Begin(SpriteSortMode sortMode, BlendState blendState, SamplerState samplerState, DepthStencilState depthStencilState, RasterizerState rasterizerState, Effect effect, Nullable`1 transformMatrix, bool defferedBatch)'
                    ](SpriteSortMode.Deferred, null, null, null, null, null, null, true);
                }
                
                if (option1Clicked) {
                    NPCLoader.Option1Clicked(npc, player, button1.cost);
                } else if (option2Clicked) {
                    NPCLoader.Option2Clicked(npc, player);
                }
            });
        }
        
        if (this.HookList.SpawnNPC) {
            Terraria.NPC['void SpawnNPC()'
            ].hook((original) => {
                if (Terraria.NPC.noSpawnCycle) {
                    original();
                    return;
                }
                
                let nextSlot = -1;
                for (let i = 0; i < 200; i++) {
                    if (!Terraria.Main.npc[i].active) {
                        nextSlot = i;
                        break;
                    }
                }
                
                original();
                
                if (nextSlot >= 0) {
                    let npc = Terraria.Main.npc[nextSlot];
                    if (!npc.active) return;
                    
                    const spawnX = npc.Center.X;
                    const spawnY = npc.Bottom.Y;
                    const newNpc = NPCLoader.ChooseSpawn(new NPCSpawnInfo(spawnX, spawnY, Terraria.Main.player[Terraria.Main.myPlayer]));
                    if (newNpc == null || newNpc === 0) return;
                    if (newNpc == -1) {
                        npc.active = false;
                        return;
                    }
                    
                    Terraria.Main.npc[nextSlot].active = false;
                    if (NPCLoader.isModType(newNpc)) {
                        NPCLoader.getModNPC(newNpc)?.SpawnNPC(spawnX, spawnY);
                    } else {
                        Terraria.NPC.NewNPC(
                            Terraria.NPC.GetSpawnSourceForNaturalSpawn(),
                            spawnX, spawnY, newNpc,
                            0, 0, 0, 0, 0, 255
                        );
                    }
                }
            });
        }
        
        if (this.HookList.NewNPC) {
            Terraria.NPC['int NewNPC(IEntitySource source, int X, int Y, int Type, int Start, float ai0, float ai1, float ai2, float ai3, int Target)'
            ].hook((original, source, x, y, type, start, ai0, ai1, ai2, ai3, target) => {
                let index = original(source, x, y, type, start, ai0, ai1, ai2, ai3, target);
                if (index < 200) {
                    NPCLoader.OnSpawn(Terraria.Main.npc[index], source);
                }
                return index;
            });
        }
        
        if (this.HookList.SetupShop) {
            Terraria.Chest['void SetupShop(int type)'
            ].hook((original, self, type) => {
                original(self, type);
                const player = Terraria.Main.player[Terraria.Main.myPlayer];
                if (player && player.talkNPC >= 0 && player.talkNPC < 200) {
                    const npc = Terraria.Main.npc[player.talkNPC];
                    if (npc && npc.active) {
                        NPCLoader.SetupShop(npc, player, type);
                    }
                }
            });
        }
        
        this.initialized = true;
    }
    
    static OnWorldUnload() {
        this.realTypes = {};
        this.NPCsToDraw_BehindTiles = new Set();
        this.NPCsToDraw_OverTiles = new Set();
    }
}