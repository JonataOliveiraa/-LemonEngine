import { Terraria, Microsoft, Modules } from './../ModImports.js';
import { ProjectileLoader } from './../Loaders/ProjectileLoader.js';
import { PlayerLoader } from './../Loaders/PlayerLoader.js';
import { CombinedLoader } from './../Loaders/CombinedLoader.js';

const { Vector2 } = Modules;

export class ProjectileHooks {
    static initialized = false;
    
    static tempProj = new Set();
    
    // Here you can disable the hooks that won't be used in your mod to avoid unnecessary processing
    static HookList = {
        SetDefaults: true,
        StatusNPC: true,
        StatusPlayer: true,
        Colliding: true,
        CanCutTiles: true,
        AI_061_FishingBobber_GiveItemToPlayer: true,
        OnSpawn: true, // requires AI hook = true;
        AI: true,
        Kill: true,
        GetAlpha: true,
        Damage: false
    };
    
    static Initialize() {
        if (this.initialized) return;
        
        if (this.HookList.SetDefaults) {
            Terraria.Projectile['void SetDefaults(int Type)'
            ].hook((original, self, type) => {
                original(self, type);
                
                if (!ProjectileLoader.isModType(type)) {
                    ProjectileLoader.SetDefaults(self);
                    return;
                }
                
                self.ownerHitCheckDistance = 1000;
                self.counterweight = false;
                self.sentry = false;
                self.arrow = false;
                self.bobber = false;
                self.numHits = 0;
                self.netImportant = false;
                self.manualDirectionChange = false;
                self.decidesManualFallThrough = false;
                self.shouldFallThrough = false;
                self.bannerIdToRespondTo = 0;
                self.stopsDealingDamageAfterPenetrateHits = false;
                self.localNPCHitCooldown = -2;
                self.idStaticNPCHitCooldown = -1;
                self.usesLocalNPCImmunity = false;
                self.usesIDStaticNPCImmunity = false;
                self.usesOwnerMeleeHitCD = false;
                self.appliesImmunityTimeOnSingleHits = false;
                self.noDropItem = false;
                self.minion = false;
                self.minionSlots = 0;
                self.soundDelay = 0;
                self.spriteDirection = 1;
                self.melee = false;
                self.ranged = false;
                self.magic = false;
                self.ownerHitCheck = false;
                self.hide = false;
                self.lavaWet = false;
                self.wetCount = 0;
                self.wet = false;
                self.ignoreWater = false;
                self.isAPreviewDummy = false;
                self.hostile = false;
                self.reflected = false;
                self.netUpdate = false;
                self.netUpdate2 = false;
                self.netSpam = 0;
                self.numUpdates = 0;
                self.extraUpdates = 0;
                self.identity = 0;
                self.restrikeDelay = 0;
                self.light = 0;
                self.penetrate = 1;
                self.tileCollide = true;
                self.position = Microsoft.Xna.Framework.Vector2.Zero;
                self.velocity = Microsoft.Xna.Framework.Vector2.Zero;
                self.aiStyle = 0;
                self.alpha = 0;
                self.glowMask = -1;
                self.type = type;
                self.active = true;
                self.rotation = 0;
                self.scale = 1;
                self.owner = 255;
                self.timeLeft = 3600;
                self.friendly = false;
                self.damage = 0;
                self.originalDamage = 0;
                self.knockBack = 0;
                self.miscText = '';
                self.coldDamage = false;
                self.noEnchantments = false;
                self.noEnchantmentVisuals = false;
                self.trap = false;
                self.npcProj = false;
                self.originatedFromActivableTile = false;
                self.projUUID = -1;
                self.frame = 0;
                self.frameCounter = 0;
                
                const proj = ProjectileLoader.getModProjectile(type);
                if (proj) {
                    proj?.SetDefaults();
                    Object.assign(self, proj?.Projectile);
                }
                
                self.width = self.width * self.scale;
                self.height = self.height * self.scale;
                self.maxPenetrate = self.penetrate;
            });
        }
        
        if (this.HookList.StatusNPC) {
            Terraria.Projectile['void StatusNPC(int i)'
            ].hook((original, self, npcIndex) => {
                original(self, npcIndex);
                CombinedLoader.OnHitNPCWithProj(self, Terraria.Main.npc[npcIndex]);
            });
        }
        
        if (this.HookList.StatusPlayer) {
            Terraria.Projectile['void StatusPlayer(int i)'
            ].hook((original, self, playerIndex) => {
                original(self, playerIndex);
                ProjectileLoader.OnHitPlayer(self, Terraria.Main.player[playerIndex]);
            });
        }
        
        if (this.HookList.Colliding) {
            Terraria.Projectile['bool Colliding(Rectangle myRect, Rectangle targetRect)'
            ].hook((original, self, rect1, rect2) => {
                return ProjectileLoader.Colliding(self, rect1, rect2) ?? original(self, rect1, rect2);
            });
        }
        
        if (this.HookList.CanCutTiles) {
            Terraria.Projectile['bool CanCutTiles()'
            ].hook((original, self) => {
                return ProjectileLoader.CanCutTiles(self) ?? original(self);
            });
        }
        
        if (this.HookList.CutTiles) {
            Terraria.Projectile['void CutTiles()'
            ].hook((original, self) => {
                original(self);
                ProjectileLoader.CutTiles(self);
            });
        }
        
        if (this.HookList.AI_061_FishingBobber_GiveItemToPlayer) {
            Terraria.Projectile['void AI_061_FishingBobber_GiveItemToPlayer(Player thePlayer, int itemType)'
            ].hook((original, self, player, itemType) => {
                original(self, player, PlayerLoader.ModifyCaughtFish(player, itemType));
            });
        }
        
        if (this.HookList.AI) {
            Terraria.Projectile['void AI()'
            ].hook((original, self) => {
                if (!this.tempProj.has(self.whoAmI) && this.HookList.OnSpawn) {
                    ProjectileLoader.OnSpawn(self);
                    this.tempProj.add(self.whoAmI);
                }
                if (ProjectileLoader.PreAI(self)) {
                    let oldType = 0;
                    const overrideAI = ProjectileLoader.getModProjectile(self.type)?.AIType ?? 0;
                    if (overrideAI > 0) {
                        oldType = self.type;
                        self.type = overrideAI;
                    }
                    original(self);
                    if (oldType > 0) self.type = oldType;
                    ProjectileLoader.AI(self);
                }
            });
        }
        
        if (this.HookList.Kill) {
            Terraria.Projectile['void Kill()'
            ].hook((original, self) => {
                if (this.tempProj.has(self.whoAmI)) 
                    this.tempProj.delete(self.whoAmI);
                const timeLeft = self.timeLeft;
                let flag = true;
                if (self.tileCollide) {
                    if (self.type >= Terraria.ID.ProjectileID.Count) {
                        const hitDirection = Vector2.Normalize(self.velocity);
                        if (Terraria.Collision['bool SolidTiles(Vector2 position, int width, int height)'](Vector2.Add(self.position, hitDirection), self.width, self.height)) {
                            flag = ProjectileLoader.OnTileCollide(self, hitDirection);
                        }
                    }
                }
                if (flag && ProjectileLoader.PreKill(self, timeLeft)) {
                    original(self);
                    ProjectileLoader.OnKill(self, timeLeft);
                }
            });
        }
        
        if (this.HookList.GetAlpha) {
            Terraria.Projectile['Color GetAlpha(Color newColor)'
            ].hook((original, self, newColor) => {
                return original(self, ProjectileLoader.GetAlpha(self, newColor));
            });
        }
        
        if (this.HookList.Damage) {
            Terraria.Projectile['void Damage()'
            ].hook((original, self) => {
                if (ProjectileLoader.CanDamage(self)) {
                    original(self);
                }
            });
            Terraria.Projectile['Rectangle Damage_GetHitbox()'
            ].hook((original, self) => {
                return ProjectileLoader.ModifyDamageHitbox(self, original(self));
            });
        }
        
        this.initialized = true;
    }
    
    static OnWorldUnload() {
        this.tempProj = new Set();
    }
}