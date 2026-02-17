import { Terraria, Modules } from './../ModImports.js';
import { ModLoader } from './../Core/ModLoader.js';
import { CameraShake, FadeController } from './../Modules/Camera.js';

import { NPCLoader } from './../Loaders/NPCLoader.js';
import { TileLoader } from './../Loaders/TileLoader.js';
import { BiomeLoader } from './../Loaders/BiomeLoader.js';
import { SystemLoader } from './../Loaders/SystemLoader.js';
import { PlayerLoader } from './../Loaders/PlayerLoader.js';
import { CombinedLoader } from './../Loaders/CombinedLoader.js';
import { ProjectileLoader } from './../Loaders/ProjectileLoader.js';
import { SurfaceBackgroundLoader, UndergroundBackgroundLoader } from './../Loaders/BackgroundLoaders.js';
import { SceneEffectLoader } from './../Loaders/SceneEffectLoader.js';
import { MenuLoader } from './../Loaders/MenuLoader.js';
import { SubworldLoader } from './../Loaders/SubworldLoader.js';

let isFirstJoin = true;

export class MainHooks {
    static initialized = false;
    
    static HookList = {
        IsTileSpelunkable: false,
        IsTileBiomeSightable: false,
        AnglerQuestSwap: true,
        DrawProj: true,
        DrawNPCHeadFriendly: true,
        UpdateTime: true,
        UpdateTime_SpawnTownNPCs: true,
        UpdateAudio_DecideOnNewMusic: true,
        UpdateMenu: true,
        DrawSunAndMoon: true,
        GetProjectileDesiredShader: true,
        DatabaseHooks: true,
        DoUpdate: true,
        DoDraw_UpdateCameraPosition: true,
        DrawInterface_29_SettingsButton: true,
        ApplyColorOfTheSkiesToTiles: true,
        DrawBackground: true,
        LoadWorlds: true
    };
    
    static Initialize(is64Bits = true) {
        if (this.initialized) return;
        
        Terraria.Main['void Initialize_AlmostEverything()'
        ].hook((original, self) => {
            original(self);
            SystemLoader.SetupContent();
        });
        
        Terraria.Main['void PostContentLoadInitialize()'
        ].hook((original, self) => {
            original(self);
            SystemLoader.PostSetupContent();
            SystemLoader.AddRecipes();
        });
        
        if (this.HookList.IsTileSpelunkable) {
            Terraria.Main['bool IsTileSpelunkable(Tile t)'
            ].hook((original, tile) => {
                const hasValue = TileLoader.IsTileSpelunkable(tile);
                if (typeof hasValue === 'boolean') {
                    return hasValue;
                }
                return original(tile);
            });
        }
        
        if (this.HookList.IsTileBiomeSightable) {
            Terraria.Main['bool IsTileBiomeSightable(ushort type, short tileFrameX, short tileFrameY, ref Color sightColor)'
            ].hook((original, type, frameX, frameY, sightColor) => {
                const hasValue = TileLoader.IsTileBiomeSightable(type, frameX, frameY);
                if (typeof hasValue === 'boolean') {
                    return hasValue;
                }
                return original(type, frameX, frameY, sightColor);
            });
        }
        
        if (this.HookList.AnglerQuestSwap) {
            Terraria.Main['void AnglerQuestSwap()'
            ].hook((original, self) => {
                if (Terraria.Main.netMode == 1) return;
                
                Terraria.Main.anglerWhoFinishedToday.Clear();
                Terraria.Main.anglerQuestFinished = false;
                
                let flag1 = Terraria.NPC.downedBoss1 || Terraria.NPC.downedBoss2 || Terraria.NPC.downedBoss3 || Terraria.Main.hardMode || Terraria.NPC.downedSlimeKing || Terraria.NPC.downedQueenBee;
                let flag2 = true;
                
                const checkedQuests = [];
                
                while (flag2) {
                    flag2 = false;
                    
                    // Prevents infinite loop
                    if (checkedQuests.length === Terraria.Main.anglerQuestItemNetIDs.length) {
                        Terraria.Main.anglerQuestFinished = true;
                        break;
                    }
                    
                    Terraria.Main.anglerQuest = Math.floor(Math.random() * Terraria.Main.anglerQuestItemNetIDs.length);
                    let anglerQuestItemNetId = Terraria.Main.anglerQuestItemNetIDs[Terraria.Main.anglerQuest];
                    
                    if (anglerQuestItemNetId == 2454 && (!Terraria.Main.hardMode || Terraria.WorldGen.crimson))
                        flag2 = true;
                    if (anglerQuestItemNetId == 2457 && Terraria.WorldGen.crimson)
                        flag2 = true;
                    if (anglerQuestItemNetId == 2462 && !Terraria.Main.hardMode)
                        flag2 = true;
                    if (anglerQuestItemNetId == 2463 && (!Terraria.Main.hardMode || !Terraria.WorldGen.crimson))
                        flag2 = true;
                    if (anglerQuestItemNetId == 2465 && !Terraria.Main.hardMode)
                        flag2 = true;
                    if (anglerQuestItemNetId == 2468 && !Terraria.Main.hardMode)
                        flag2 = true;
                    if (anglerQuestItemNetId == 2471 && !Terraria.Main.hardMode)
                        flag2 = true;
                    if (anglerQuestItemNetId == 2473 && !Terraria.Main.hardMode)
                        flag2 = true;
                    if (anglerQuestItemNetId == 2477 && !Terraria.WorldGen.crimson)
                        flag2 = true;
                    if (anglerQuestItemNetId == 2480 && !Terraria.Main.hardMode)
                        flag2 = true;
                    if (anglerQuestItemNetId == 2483 && !Terraria.Main.hardMode)
                        flag2 = true;
                    if (anglerQuestItemNetId == 2484 && !Terraria.Main.hardMode)
                        flag2 = true;
                    if (anglerQuestItemNetId == 2485 && Terraria.WorldGen.crimson)
                        flag2 = true;
                    if ((anglerQuestItemNetId == 2476 || anglerQuestItemNetId == 2453 || anglerQuestItemNetId == 2473) && !flag1)
                        flag2 = true;
                    
                    if (CombinedLoader.IsAnglerQuestAvailable(anglerQuestItemNetId) === false)
                        flag2 = true;
                    
                    if (!checkedQuests.includes(anglerQuestItemNetId))
                        checkedQuests.push(anglerQuestItemNetId);
                }
                Terraria.NetMessage.SendAnglerQuest(-1);
            });
        }
        
        if (this.HookList.DrawProj) {
            Terraria.Main['void DrawProj(int i)'
            ].hook((original, self, i) => {
                const proj = Terraria.Main.projectile[i];
                const lightColor = Terraria.Lighting['Color GetColor(int x, int y)'](Math.floor(proj.Center.X / 16), Math.floor(proj.Center.Y / 16));
                if (ProjectileLoader.PreDraw(proj, lightColor)) {
                    original(self, i);
                    ProjectileLoader.PostDraw(proj, lightColor);
                }
            });
        }
        
        if (this.HookList.DrawNPCHeadFriendly && is64Bits) {
            Terraria.Main['void DrawNPCHeadFriendly(Entity theNPC, byte alpha, float headScale, SpriteEffects dir, int npcID, float x, float y)'
            ].hook((original, npc, alpha, scale, dir, id, x, y) => {
                if (NPCLoader.isModType(npc?.type)) {
                    if (npc.IsShimmerVariant) {
                        id = NPCLoader.ShimmerHeads[npc.type] ?? id;
                    }
                }
                original(npc, alpha, scale, dir, id, x, y);
            });
        }
        
        if (this.HookList.UpdateTime && is64Bits) {
            Terraria.Main['void UpdateTime()'
            ].hook((original, self) => {
                let flag1 = false;
                let flag2 = false;
                let time = Terraria.Main.time + Terraria.Main.dayRate;
                
                if (!Terraria.Main.dayTime) {
                    if (time > 32400.0)
                        flag1 = true;
                } else {
                    if (time > 54000.0)
                        flag2 = true;
                }
                
                original(self);
                
                if (flag1) {
                    SystemLoader.OnStartDay();
                } else if (flag2) {
                    SystemLoader.OnStartNight();
                }
            });
        }
        
        if (this.HookList.UpdateTime_SpawnTownNPCs) {
            Terraria.Main['void UpdateTime_SpawnTownNPCs()'
            ].hook((original, self) => {
                let flag1 = true;
                let worldUpdateRate = Terraria.WorldGen.GetWorldUpdateRate();
                if (Terraria.Main.netMode == 1 || worldUpdateRate <= 0) {
                    flag1 = false;
                }
                if (Terraria.Main.checkForSpawns + 1 < 7200 / worldUpdateRate) {
                    flag1 = false;
                }
                
                if (flag1) {
                    for (let index = NPCLoader.MAX_VANILLA_ID; index < NPCLoader.NPCCount; index++) {
                        Terraria.Main.townNPCCanSpawn[index] = false;
                    }
                }
                
                original(self);
                
                for (const npc of NPCLoader.TownNPCs) {
                    if (Terraria.NPC.AnyNPCs(npc.Type)) continue;
                    
                    if (npc.CanTownNPCSpawn()) {
                        Terraria.Main.townNPCCanSpawn[npc.Type] = true;
                        Terraria.WorldGen.prioritizedTownNPCType = npc.Type;
                    }
                }
            });
        }
        
        if (this.HookList.UpdateAudio_DecideOnNewMusic && is64Bits) {
            Terraria.Main['void UpdateAudio_DecideOnNewMusic()'
            ].hook((original, self) => {
                original(self);
                
                if (!Terraria.Main.snowSplash && !Terraria.Main.gameMenu) {
                    if (NPCLoader.AnyBossActive) {
                        if (NPCLoader.ActiveBoss !== -1) {
                            const musicType = NPCLoader.getModNPC(NPCLoader.ActiveBoss)?.Music ?? -1;
                            if (musicType !== -1) {
                                Terraria.Main.newMusic = musicType;
                            }
                        }
                    } else if (SceneEffectLoader.AnySceneActive) {
                        if (SceneEffectLoader.CurrentScene.Music !== -1) {
                            Terraria.Main.newMusic = SceneEffectLoader.CurrentScene.Music;
                        }
                    }
                } else if (Terraria.Main.gameMenu) {
                    if (MenuLoader.CurrentMenu) {
                        const musicType = MenuLoader.CurrentMenu.Music ?? -1;
                        if (musicType !== -1) {
                            Terraria.Main.newMusic = musicType;
                        }
                    }
                }
                
                if (Terraria.Main.gamePaused && !Terraria.Main.gameMenu) return;
                
                NPCLoader.AnyBossActive = false;
                NPCLoader.ActiveBoss = -1;
            });
        }
        
        if (this.HookList.UpdateMenu && is64Bits) {
            Terraria.Main['void UpdateMenu()'
            ].hook((original, self) => {
                if (typeof SubworldLoader.RunLater === 'function' && Terraria.Main.menuMode === 0) {
                    SubworldLoader.RunLater();
                    SubworldLoader.RunLater = null;
                }
                original(self);
                if (Terraria.Main.gameMenu) {
                    MenuLoader.Update();
                }
            });
        }
        
        if (this.HookList.GetProjectileDesiredShader && is64Bits) {
            Terraria.Main['int GetProjectileDesiredShader(Projectile proj)'
            ].hook((original, proj) => {
                return ProjectileLoader.ApplyShader(proj) ?? original(proj);
            });
        }
        
        if (this.HookList.DatabaseHooks && is64Bits) {
            Terraria.Main['void ErasePlayer(int i)'
            ].hook((original, index) => {
                ModLoader.DeleteDatabase(Terraria.Main.PlayerList.get_Item(index)?.Path);
                original(index);
            });
            
            Terraria.Main['void EraseWorld(int i)'
            ].hook((original, index) => {
                ModLoader.DeleteDatabase(Terraria.Main.WorldList.get_Item(index)?.Path);
                SubworldLoader.DeleteSubworlds(Terraria.Main.WorldList['WorldFileData get_Item(int index)'](index));
                original(index);
            });
        }
        
        if (this.HookList.DoUpdate && is64Bits) {
            Terraria.Main['void DoUpdate(GameTime gameTime)'
            ].hook((original, self, gameTime) => {
                original(self, gameTime);
                SystemLoader.Update((Terraria.Main.gameMenu || !Terraria.Main.gamePaused) && !Terraria.Main.gameInactive);
            });
        }
        
        if (this.HookList.DoDraw_UpdateCameraPosition && is64Bits) {
            Terraria.Main['void DoDraw_UpdateCameraPosition()'
            ].hook((original, self) => {
                original(self);
                PlayerLoader.UpdateCamera();
                CameraShake.Update();
            });
        }
        
        if (this.HookList.DrawInterface_29_SettingsButton && is64Bits) {
            Terraria.Main['void DrawInterface_29_SettingsButton()'
            ].hook((original, self, magnify) => {
                FadeController.Update();
                original(self);
            });
        }
        
        if (this.HookList.ApplyColorOfTheSkiesToTiles && is64Bits) {
            Terraria.Main['void ApplyColorOfTheSkiesToTiles()'
            ].hook((original, self) => {
                SceneEffectLoader.SpecialVisuals(Terraria.Main.player[Terraria.Main.myPlayer], Terraria.Main.ColorOfTheSkies);
                original(self);
            });
        }
        
        if (this.HookList.DrawSunAndMoon && is64Bits) {
            Terraria.Main['void DrawSunAndMoon(SceneArea sceneArea, Color moonColor, Color sunColor, float tempMushroomInfluence)'
            ].hook((original, self, area, moonColor, sunColor, tempMushroomInfluence) => {
                if (MenuLoader.CurrentMenu) {
                    MenuLoader.CurrentMenu.ModifySunAndMoonColor(sunColor, moonColor);
                }
                original(self, area, moonColor, sunColor, tempMushroomInfluence);
            });
        }
        
        if (this.HookList.DrawBackground && is64Bits) {
            Terraria.Main['int GetPreferredBGStyleForPlayer()'
            ].hook((original, self) => {
                return SurfaceBackgroundLoader.ChooseStyle() ?? original(self);
            });
            
            Terraria.Main['float DrawSurfaceBG_GetFogPower()'
            ].hook((original, self) => {
                const flag = Terraria.Main.BackgroundEnabled && (!Terraria.Main.remixWorld || (Terraria.Main.gameMenu && !Terraria.WorldGen.remixWorldGen)) &&
                (!Terraria.WorldGen.remixWorldGen || !Terraria.WorldGen.drunkWorldGen) && !Terraria.Main.mapFullscreen;
                
                if (flag && Terraria.Main.bgStyle >= 14) {
                    SurfaceBackgroundLoader.DrawCloseTexture(Terraria.Main.bgStyle);
                }
                
                return original(self);
            });
            
            Terraria.Main['void UpdateBGVisibility_FrontLayer(Nullable`1 targetBiomeOverride, Nullable`1 transitionAmountOverride)'
            ].hook((original, self, biomeOverride, transitionOverride) => {
                if (MenuLoader.CurrentMenu?.Background) {
                    Terraria.Main.bgStyle = MenuLoader.CurrentMenu.Background.Slot;
                }
                original(self, biomeOverride, transitionOverride);
                SurfaceBackgroundLoader.ModifyFarFades();
            });
            
            Terraria.Main['void DrawSurfaceBG_BackMountainsStep1(double backgroundTopMagicNumber, float bgGlobalScaleMultiplier, int pushBGTopHack)'
            ].hook((original, self, backgroundTopMagicNumber, bgGlobalScaleMultiplier, pushBGTopHack) => {
                original(self, backgroundTopMagicNumber, bgGlobalScaleMultiplier, pushBGTopHack);
                SurfaceBackgroundLoader.DrawFarTexture();
            });
            
            Terraria.Main['void DrawSurfaceBG_BackMountainsStep2(int pushBGTopHack)'
            ].hook((original, self, pushBGTopHack) => {
                original(self, pushBGTopHack);
                SurfaceBackgroundLoader.DrawMiddleTexture();
            });
            
            Terraria.WaterfallManager['void DrawWaterfall(SpriteBatch spriteBatch, int Style, float Alpha)'
            ].hook((original, self, sb, style, alpha) => {
                if (style != 1 && style != 14) {
                    if (SceneEffectLoader.AnySceneActive) {
                        if (SceneEffectLoader.CurrentScene.Waterfall) {
                            style = SceneEffectLoader.CurrentScene.Waterfall;
                        }
                    }
                }
                original(self, sb, style, alpha);
            });
            
            Terraria.Main['int CalculateWaterStyle(bool ignoreFountains)'
            ].hook((original, self, ignoreFountains) => {
                if (SceneEffectLoader.AnySceneActive) {
                    if (SceneEffectLoader.CurrentScene.WaterStyle) {
                        return 0;
                    }
                }
                return original(self, ignoreFountains);
            });
            
            Terraria.Dust['int dustWater()'
            ].hook((original, self) => {
                let result = original(self);
                if (SceneEffectLoader.AnySceneActive) {
                    return SceneEffectLoader.CurrentScene.GetSplashDust(result);
                }
                return result;
            });
            
            Terraria.Main['void DrawBackground()'
            ].hook((original, self) => {
                SceneEffectLoader.UpdateUndergroundScene();
                original(self);
            });
        }
        
        if (this.HookList.LoadWorlds && is64Bits) {
            Terraria.Main['void LoadWorlds()'
            ].hook((original, self) => {
                original(self);
                if (isFirstJoin && Terraria.Main.menuMode === 1) {
                    isFirstJoin = false;
                    SubworldLoader.RecoverSubworlds();
                    original(self);
                }
            });
        }
        
        this.initialized = true;
    }
}