import { Terraria, Microsoft, Modules } from './../ModImports.js';
import { TileData } from './../Modules/TileData.js';
import { TileLoader } from './../Loaders/TileLoader.js';
import { GlobalTile } from './../GlobalTile.js';
import { SystemLoader } from './../Loaders/SystemLoader.js';
import { NPCLoader } from './../Loaders/NPCLoader.js';
import { SubworldLoader } from './../Loaders/SubworldLoader.js';

const { Rectangle } = Modules;
const Vec2 = (x, y) => Microsoft.Xna.Framework.Vector2.new()['void .ctor(float x, float y)'](x, y);
const PlaySound = (id, x, y) => Terraria.Audio.SoundEngine['void PlaySound(int type, Vector2 position, int style)'](id, Vec2(x, y), 1);

export class WorldGenHooks {
    static initialized = false;
    
    // Here you can disable the hooks that won't be used in your mod to avoid unnecessary processing
    static HookList = {
        PlaceTile: true,
        IsTileReplacable: true,
        ReplaceTile: true,
        CanKillTile: true,
        KillTile: true,
        KillTile_PlaySounds: true,
        KillTile_DropItems: true,
        SlopeTile: true,
        SaveAndQuit: true,
        SpawnTownNPC: true
    };
    
    static Initialize() {
        if (this.initialized) return;
        
        if (this.HookList.PlaceTile) {
            Terraria.WorldGen['bool PlaceTile(int i, int j, int Type, bool mute, bool forced, int plr, int style)'
            ].hook((original, i, j, type, mute, forced, plr, style) => {
                if (TileLoader.CanPlace(i, j, type, mute, forced, plr, style) === false) {
                    return false;
                }
                
                if (!TileLoader.isModType(type)) {
                    const placed = original(i, j, type, mute, forced, plr, style);
                    if (placed) TileLoader.OnPlace(i, j, type, plr, style);
                    return placed;
                }
                
                let flag = false;
                
                if (i >= 0 && j >= 0 && i < Terraria.Main.maxTilesX && j < Terraria.Main.maxTilesY) {
                    let trackCache = Terraria.Main.tile.get_Item(i, j);
                    if (trackCache == null) return false;
                    
                    const isEmptyTile = Terraria.Collision.EmptyTile(i, j, false);
                    
                    if ((forced || isEmptyTile) && !trackCache['bool active()']()) {
                        // Solid Tiles
                        if (Terraria.Main.tileSolid[type]) {
                            trackCache['void active(bool active)'](true);
                            trackCache.type = type;
                            flag = true;
                        }
                    } 
                    
                    if (trackCache['bool active()']() && flag) {
                        if (Terraria.ID.TileID.Sets.BlocksWaterDrawingBehindSelf) {
                            Terraria.WorldGen.SquareWallFrame(i, j, true);
                        }
                        Terraria.WorldGen.SquareTileFrame(i, j, true);
                        
                        if (!mute) {
                            PlaySound(Terraria.ID.SoundID.Dig, i * 16, j * 16);
                        }
                    }
                }
                
                if (flag) TileLoader.OnPlace(i, j, type, plr, style);
                return flag;
            });
        }
        
        if (this.HookList.IsTileReplacable) {
            Terraria.WorldGen['bool IsTileReplacable(int x, int y)'
            ].hook((original, x, y) => {
                const type = new TileData(x, y).type;
                if (TileLoader.IsReplaceable(type, x, y) === false) {
                    return false;
                }
                if (type < TileLoader.MAX_VANILLA_ID) {
                    return original(x, y);
                }
                return true;
            });
        }
        
        if (this.HookList.ReplaceTile) {
            Terraria.WorldGen['bool ReplaceTile(int x, int y, ushort targetType, int targetStyle)'
            ].hook((original, x, y, targetType, targetStyle) => {
                const result = original(x, y, targetType, targetStyle);
                if (result) {
                    TileLoader.OnReplace(x, y, targetType, targetStyle);
                }
                return result;
            });
        }
        
        if (this.HookList.CanKillTile) {
            Terraria.WorldGen['bool CanKillTile(int i, int j, ref bool blockDamaged)'
            ].hook((original, i, j, blockDamaged) => {
                if (TileLoader.CanKillTile(i, j, blockDamaged) === false) {
                    return false;
                }
                return original(i, j, blockDamaged);
            });
        }
        
        if (this.HookList.KillTile) {
            Terraria.WorldGen['void KillTile(int i, int j, bool fail, bool effectOnly, bool noItem)'
            ].hook((original, i, j, fail, effectOnly, noItem) => {
                original(i, j, fail, effectOnly, noItem);
                TileLoader.KillTile(i, j, fail, effectOnly, noItem);
            });
        }
        
        if (this.HookList.KillTile_PlaySounds) {
            Terraria.WorldGen['void KillTile_PlaySounds(int i, int j, bool fail, Tile tileCache)'
            ].hook((original, i, j, fail, tile) => {
                if (TileLoader.KillSound(i, j, tile.type, fail) === false) {
                    return;
                }
                original(i, j, fail, tile);
            });
        }
        
        if (this.HookList.KillTile_DropItems) {
            Terraria.WorldGen['void KillTile_DropItems(int x, int y, Tile tileCache, bool includeLargeObjectDrops)'
            ].hook((original, x, y, tile, includeLargeObjectDrops) => {
                if (!TileLoader.isModType(tile.type)) {
                    if (GlobalTile.RegisteredTiles.some(gT => gT.CanDrop(x, y, tile.type) === false)) {
                        return;
                    }
                    GlobalTile.RegisteredTiles.forEach(gT => gT.Drop(x, y, tile.type));
                    original(x, y, tile, includeLargeObjectDrops);
                    return;
                }
                TileLoader.Drop(x, y, tile, includeLargeObjectDrops);
            });
        }
        
        if (this.HookList.SlopeTile) {
            Terraria.WorldGen['bool SlopeTile(int i, int j, int slope, bool noEffects)'
            ].hook((original, i, j, slope, noEffects) => {
                if (!noEffects) {
                    const type = new TileData(i, j).type;
                    if (TileLoader.Slope(i, j, type, slope) === false) {
                        return false;
                    }
                }
                return original(i, j, slope, noEffects);
            });
        }
        
        if (this.HookList.SaveAndQuit) {
            Terraria.WorldGen['void SaveAndQuit()'
            ].hook((original) => {
                if (SubworldLoader.AnySubworldActive && !SubworldLoader.Leaving) {
                    SubworldLoader.LeaveSubworld();
                    return;
                }
                SystemLoader.PreSaveAndQuit();
                original();
                SystemLoader.OnWorldUnload();
            });
        }
        
        if (this.HookList.SpawnTownNPC) {
            const AchievementsHelper = new NativeClass('Terraria.GameContent.Achievements', 'AchievementsHelper');
            const TownNPCSpawnResult = new NativeClass('Terraria.Enums', 'TownNPCSpawnResult');
            const List = new NativeClass('System.Collections.Generic', 'List`1');
            const Int32 = new NativeClass('System', 'Int32');
            Terraria.WorldGen['TownNPCSpawnResult SpawnTownNPC(int x, int y)'
            ].hook((original, x, y) => {
                if (Terraria.Main.wallHouse[Terraria.Main.tile.get_Item(x, y).wall])
                    Terraria.WorldGen.canSpawn = true;
                if (!Terraria.WorldGen.canSpawn || !Terraria.WorldGen.StartRoomCheck(x, y) || !Terraria.WorldGen.RoomNeeds(Terraria.WorldGen.prioritizedTownNPCType))
                    return TownNPCSpawnResult.Blocked;
                let ahomelessNpc = Terraria.WorldGen.FindAHomelessNPC();
                let npcTypeAskingToScoreRoom = Terraria.WorldGen.prioritizedTownNPCType;
                if (ahomelessNpc != -1) {
                    npcTypeAskingToScoreRoom = Terraria.Main.npc[ahomelessNpc].type;
                }
                if (!NPCLoader.isModType(npcTypeAskingToScoreRoom)) {
                    return original(x, y);
                }
                
                if ((Terraria.WorldGen.roomHasStinkbug || Terraria.WorldGen.roomHasEchoStinkbug) && !(Terraria.ID.NPCID.Sets.IsTownPet[npcTypeAskingToScoreRoom] && Terraria.WorldGen.TownManager._hasRoom[npcTypeAskingToScoreRoom])) {
                    return TownNPCSpawnResult.Blocked;
                }
                
                Terraria.WorldGen.ScoreRoom(-1, npcTypeAskingToScoreRoom);
                
                if (Terraria.WorldGen.hiScore <= 0) {
                    return TownNPCSpawnResult.Blocked;
                }
                
                let canSpawnNewTownNPC = true;
                function IsThereASpawnablePrioritizedTownNPC(x, y) {
                    if (Terraria.WorldGen.CheckSpecialTownNPCSpawningConditions(Terraria.WorldGen.prioritizedTownNPCType) && Terraria.NPC.AnyNPCs(Terraria.WorldGen.prioritizedTownNPCType)) {
                        canSpawnNewTownNPC = false;
                        return true;
                    }
                    const IntList = List.makeGeneric(Int32);
                    let occupantsList = IntList.new();
                    occupantsList['void .ctor()']();
                    Terraria.WorldGen.TownManager['void AddOccupantsToList(int x, int y, List`1 occupantsList)'](x, y, occupantsList);
                    for (let index1 = 0; index1 < occupantsList.Count; ++index1) {
                        let index2 = occupantsList.get_Item(index1);
                        if (Terraria.Main.townNPCCanSpawn[index2] && !Terraria.NPC.AnyNPCs(index2) && Terraria.WorldGen.CheckSpecialTownNPCSpawningConditions(index2)) {
                            Terraria.WorldGen.prioritizedTownNPCType = index2;
                            canSpawnNewTownNPC = true;
                            return true;
                        }
                    }
                    
                    if (Terraria.WorldGen.TownManager._hasRoom.length < NPCLoader.NPCCount) {
                        Terraria.WorldGen.TownManager._hasRoom = Terraria.WorldGen.TownManager._hasRoom.cloneResized(NPCLoader.NPCCount);
                    }
                    
                    for (let index = 0; index < NPCLoader.NPCCount; ++index) {
                        if (Terraria.Main.townNPCCanSpawn[index] && Terraria.WorldGen.CheckSpecialTownNPCSpawningConditions(index)) {
                            if (Terraria.NPC.AnyNPCs(index)) {
                                Terraria.Main.townNPCCanSpawn[index] = false;
                            } else {
                                if (Terraria.WorldGen.TownManager.HasRoomQuick(index)) {
                                    Terraria.WorldGen.prioritizedTownNPCType = index;
                                    canSpawnNewTownNPC = true;
                                    return true;
                                }
                                if (!Terraria.ID.NPCID.Sets.IsTownPet[Terraria.WorldGen.prioritizedTownNPCType] || Terraria.ID.NPCID.Sets.IsTownPet[index]) {
                                    Terraria.WorldGen.prioritizedTownNPCType = index;
                                    canSpawnNewTownNPC = true;
                                    return true;
                                }
                            }
                        }
                    }
                    return false;
                }
                if (!IsThereASpawnablePrioritizedTownNPC(Terraria.WorldGen.bestX, Terraria.WorldGen.bestY)) {
                    return TownNPCSpawnResult.Blocked;
                }
                let prioritizedTownNpcType1 = Terraria.WorldGen.prioritizedTownNPCType;
                if (ahomelessNpc != -1) {
                    Terraria.Main.townNPCCanSpawn[Terraria.WorldGen.prioritizedTownNPCType] = false;
                    Terraria.Main.npc[ahomelessNpc].homeTileX = Terraria.WorldGen.bestX;
                    Terraria.Main.npc[ahomelessNpc].homeTileY = Terraria.WorldGen.bestY;
                    Terraria.Main.npc[ahomelessNpc].homeless = false;
                    AchievementsHelper.NotifyProgressionEvent(8);
                    Terraria.WorldGen.prioritizedTownNPCType = 0;
                    return TownNPCSpawnResult.RelocatedHomeless;
                }
                if (canSpawnNewTownNPC && ahomelessNpc == -1) {
                    let roomPosition = Microsoft.Xna.Framework.Point.new();
                    roomPosition['void .ctor(int x, int y)'](0, 0);
                    function HasRoom(npcID) {
                        if (!Terraria.WorldGen.TownManager._hasRoom[npcID]) return false;
                        const pairs = Terraria.WorldGen.TownManager._roomLocationPairs.ToArray();
                        for (let i = 0; i < pairs.length; i++) {
                            const roomLocationPair = pairs[i];
                            if (roomLocationPair.Item1 === npcID) {
                                roomPosition = roomLocationPair.Item2;
                                return true;
                            }
                        }
                        return false;
                    }
                    if (HasRoom(prioritizedTownNpcType1) && !Terraria.WorldGen.currentlyTryingToUseAlternateHousingSpot) {
                        let bestX = Terraria.WorldGen.bestX;
                        let bestY = Terraria.WorldGen.bestY;
                        Terraria.WorldGen.currentlyTryingToUseAlternateHousingSpot = true;
                        let townNpcSpawnResult = Terraria.WorldGen.SpawnTownNPC(roomPosition.X, roomPosition.Y - 2);
                        Terraria.WorldGen.currentlyTryingToUseAlternateHousingSpot = false;
                        Terraria.WorldGen.bestX = bestX;
                        Terraria.WorldGen.bestY = bestY;
                        if (townNpcSpawnResult == TownNPCSpawnResult.Successful)
                            return townNpcSpawnResult;
                    }
                    let player = Terraria.Main.player[Terraria.Main.myPlayer];
                    let spawnTileX = Terraria.WorldGen.bestX;
                    let spawnTileY = Terraria.WorldGen.bestY;
                    let prioritizedTownNpcType2 = Terraria.WorldGen.prioritizedTownNPCType;
                    if (Terraria.WorldGen.IsRoomConsideredAlreadyOccupied(spawnTileX, spawnTileY, prioritizedTownNpcType2))
                        return TownNPCSpawnResult.BlockedInfiHousing;
                    let flag = false;
                    if (!flag) {
                        flag = true;
                        let rectangle = Rectangle.new(spawnTileX * 16 + 8 - Terraria.NPC.sWidth / 2 - Terraria.NPC.safeRangeX, spawnTileY * 16 + 8 - Terraria.NPC.sHeight / 2 - Terraria.NPC.safeRangeY, Terraria.NPC.sWidth + Terraria.NPC.safeRangeX * 2, Terraria.NPC.sHeight + Terraria.NPC.safeRangeY * 2);
                        if (player.active && Rectangle.new(player.position.X, player.position.Y, player.width, player.height)['bool Intersects(Rectangle rect)'](rectangle)) {
                            flag = false;
                        }
                    }
                    if (!flag && spawnTileY <= Terraria.Main.worldSurface) {
                        for (let index1 = 1; index1 < 500; ++index1) {
                            for (let index2 = 0; index2 < 2; ++index2) {
                                spawnTileX = index2 != 0 ? (Terraria.WorldGen.bestX - index1) : (Terraria.WorldGen.bestX + index1);
                                if (spawnTileX > 10 && spawnTileX < Terraria.Main.maxTilesX - 10) {
                                    let num1 = Terraria.WorldGen.bestY - index1;
                                    let num2 = Terraria.WorldGen.bestY + index1;
                                    if (num1 > 10) num1 = 10;
                                    if (num2 > Terraria.Main.worldSurface) num2 = Terraria.Main.worldSurface;
                                    for (let index3 = num1; index3 < num2; ++index3) {
                                        spawnTileY = index3;
                                        const tile = Terraria.Main.tile.get_Item(spawnTileX, spawnTileY);
                                        if (tile.nactive() && Terraria.Main.tileSolid[tile.type]) {
                                            if (!Terraria.Collision['bool SolidTiles(int startX, int endX, int startY, int endY)'](spawnTileX - 1, spawnTileX + 1, spawnTileY - 3, spawnTileY - 1)) {
                                                flag = true;
                                                let rectangle = Rectangle.new(spawnTileX * 16 + 8 - Terraria.NPC.sWidth / 2 - Terraria.NPC.safeRangeX, spawnTileY * 16 + 8 - Terraria.NPC.sHeight / 2 - Terraria.NPC.safeRangeY, Terraria.NPC.sWidth + Terraria.NPC.safeRangeX * 2, Terraria.NPC.sHeight + Terraria.NPC.safeRangeY * 2);
                                                if (player.active && Rectangle.new(player.position.X, player.position.Y, player.width, player.height)['bool Intersects(Rectangle rect)'](rectangle)) {
                                                    flag = false;
                                                }
                                                break;
                                            }
                                            break;
                                        }
                                    }
                                }
                                if (flag) break;
                            }
                            if (flag) break;
                        }
                    }
                    
                    let index5 = Terraria.NPC.NewNPC(Terraria.NPC.GetSpawnSourceForTownSpawn(), spawnTileX * 16, spawnTileY * 16, prioritizedTownNpcType1, 1, 0, 0, 0, 0, 255);
                    Terraria.Main.townNPCCanSpawn[prioritizedTownNpcType1] = false;
                    const npc = Terraria.Main.npc[index5];
                    
                    npc.homeTileX = Terraria.WorldGen.bestX;
                    npc.homeTileY = Terraria.WorldGen.bestY;
                    
                    if (spawnTileX < Terraria.WorldGen.bestX)
                        npc.direction = 1;
                    else if (spawnTileX > Terraria.WorldGen.bestX)
                        npc.direction = -1;
                    
                    npc.netUpdate = true;
                    
                    let fullName = npc.FullName;
                    switch (Terraria.Main.netMode) {
                        case 0:
                            Terraria.Main.NewText(Terraria.Localization.Language.GetText('Announcement.HasArrived').Value.replace('{0}', fullName), 50, 125, 255);
                            break;
                        case 2:
                            //ChatHelper.BroadcastChatMessage(NetworkText.FromKey("Announcement.HasArrived", (object) Main.npc[index5].GetFullNetName()), new Color(50, 125, (int) byte.MaxValue));
                            break;
                    }
                    
                    AchievementsHelper.NotifyProgressionEvent(8);
                    if (npc.type == 160)
                        AchievementsHelper.NotifyProgressionEvent(18);
                    else if (npc.type == 17)
                        Terraria.NPC.unlockedMerchantSpawn = true;
                    else if (npc.type == 207)
                        Terraria.NPC.unlockedDyeTraderSpawn = true;
                    else if (npc.type == 18)
                        Terraria.NPC.unlockedNurseSpawn = true;
                    else if (npc.type == 19)
                        Terraria.NPC.unlockedArmsDealerSpawn = true;
                    else if (npc.type == 38)
                        Terraria.NPC.unlockedDemolitionistSpawn = true;
                    else if (npc.type == 208)
                        Terraria.NPC.unlockedPartyGirlSpawn = true;
                    else if (npc.type == 663)
                        Terraria.NPC.unlockedPrincessSpawn = true;
                    else if (npc.type == 678)
                        Terraria.NPC.unlockedSlimeGreenSpawn = true;
                    
                    Terraria.WorldGen.CheckAchievement_RealEstateAndTownSlimes();
                    Terraria.WorldGen.prioritizedTownNPCType = 0;
                }
                return TownNPCSpawnResult.Successful;
            });
            
            Terraria.WorldGen['bool CheckSpecialTownNPCSpawningConditions(int type)'
            ].hook((original, type) => {
                if (NPCLoader.isModType(type)) {
                    if (!(NPCLoader.getModNPC(type)?.CheckConditions(Terraria.WorldGen.roomX1, Terraria.WorldGen.roomX2, Terraria.WorldGen.roomY1, Terraria.WorldGen.roomY2) ?? true)) {
                        return false;
                    }
                    return true;
                }
                return original(type);
            });
        }
        
        this.initialized = true;
    }
}