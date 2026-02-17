import { Terraria, Microsoft } from './../ModImports.js';
import { ModLoader } from './../Core/ModLoader.js';
import { TileData } from './../Modules/TileData.js';
import { GlobalTile } from './../GlobalTile.js';
import { ModTexture } from './../ModTexture.js';

function cloneResizedSetLastTile(array, newSize, value) {
    const resized = array.cloneResized(newSize);
    if (value != null) resized[newSize - 1] = value;
    return resized;
}

function resizeArrayProperty(propertyHolder, propertyName, newSize, value) {
    propertyHolder[propertyName] = cloneResizedSetLastTile(propertyHolder[propertyName], newSize, value);
}

const { Color } = Microsoft.Xna.Framework.Graphics;
const Vec2 = (x, y) => Microsoft.Xna.Framework.Vector2.new()['void .ctor(float x, float y)'](x, y);
const PlaySound = (id, x, y) => Terraria.Audio.SoundEngine['void PlaySound(int type, Vector2 position, int style)'](id, Vec2(x, y), 1);
const NewDustFromTile = (i, j, type) => Terraria.Dust['int NewDust(Vector2 Position, int Width, int Height, int Type, float SpeedX, float SpeedY, int Alpha, Color newColor, float Scale)'](Vec2(i * 16, j * 16), 16, 16, type, 0, 0, 0, Color.White, 1.0);

export class TileLoader {
    static Tiles = [];
    static NearbyTiles = [];
    static MAX_VANILLA_ID = Terraria.ID.TileID.Count;
    static Count = 0;
    static TypeOffset = 0;
    static ModTypes = new Set();
    static TypeToIndex = {};
    static TileCount = this.MAX_VANILLA_ID + this.Count;
    
    static vanillaChairCount = Terraria.ID.TileID.Sets.RoomNeeds.CountsAsChair.length;
    static vanillaTableCount = Terraria.ID.TileID.Sets.RoomNeeds.CountsAsTable.length;
    static vanillaTorchCount = Terraria.ID.TileID.Sets.RoomNeeds.CountsAsTorch.length;
    static vanillaDoorCount = Terraria.ID.TileID.Sets.RoomNeeds.CountsAsDoor.length;
    
    static isModType(type) { return false; }
    static getByName(name) { return this.Tiles.find(t => t.constructor.name === name); }
    static getTypeByName(name) { return this.getByName(name)?.Type; }
    static getModTile(type) {
        if (this.ModTypes.has(type)) {
            return this.Tiles[this.TypeToIndex[type]];
        }
        return undefined;
    }
    
    static LoadTiles() {
        this.TypeOffset = ModLoader.ModData.TileCount ?? 0;
        
        for (const tile of this.Tiles) {
            this.LoadTile(tile);
        }
    }
    
    static LoadTile(tile) {
        this.Count++;
        const nextTile = this.MAX_VANILLA_ID + this.TypeOffset + this.Count;
        tile.Type = nextTile - 1;
        
        this.ModTypes.add(tile.Type);
        this.TypeToIndex[tile.Type] = this.Tiles.indexOf(tile);
        
        // Resize Arrays
        resizeArrayProperty(Terraria.Main.SceneMetrics, 'NPCBannerBuff', nextTile, false);
        resizeArrayProperty(Terraria.Main.SceneMetrics, '_tileCounts', nextTile, 0);
        resizeArrayProperty(Terraria.Main.PylonSystem._sceneMetrics, '_tileCounts', nextTile, 0);
        resizeArrayProperty(Terraria.Main, 'tileLighted', nextTile, false);
        resizeArrayProperty(Terraria.Main, 'tileMergeDirt', nextTile, false);
        resizeArrayProperty(Terraria.Main, 'tileCut', nextTile, false);
        resizeArrayProperty(Terraria.Main, 'tileAlch', nextTile, false);
        resizeArrayProperty(Terraria.Main, 'tileShine', nextTile, -1);
        resizeArrayProperty(Terraria.Main, 'tileShine2', nextTile, false);
        resizeArrayProperty(Terraria.Main, 'tileStone', nextTile, false);
        resizeArrayProperty(Terraria.Main, 'tileAxe', nextTile, false);
        resizeArrayProperty(Terraria.Main, 'tileHammer', nextTile, false);
        resizeArrayProperty(Terraria.Main, 'tileWaterDeath', nextTile, false);
        resizeArrayProperty(Terraria.Main, 'tileLavaDeath', nextTile, false);
        resizeArrayProperty(Terraria.Main, 'tileTable', nextTile, false);
        resizeArrayProperty(Terraria.Main, 'tileBlockLight', nextTile, false);
        resizeArrayProperty(Terraria.Main, 'tileNoSunLight', nextTile, false);
        resizeArrayProperty(Terraria.Main, 'tileDungeon', nextTile, false);
        resizeArrayProperty(Terraria.Main, 'tileSpelunker', nextTile, false);
        resizeArrayProperty(Terraria.Main, 'tileSolidTop', nextTile, false);
        resizeArrayProperty(Terraria.Main, 'tileSolid', nextTile, false);
        resizeArrayProperty(Terraria.Main, 'tileBouncy', nextTile, false);
        resizeArrayProperty(Terraria.Main, 'tileLargeFrames', nextTile, 0);
        resizeArrayProperty(Terraria.Main, 'tileRope', nextTile, false);
        resizeArrayProperty(Terraria.Main, 'tileBrick', nextTile, false);
        resizeArrayProperty(Terraria.Main, 'tileMoss', nextTile, false);
        resizeArrayProperty(Terraria.Main, 'tileNoAttach', nextTile, false);
        resizeArrayProperty(Terraria.Main, 'tileNoFail', nextTile, false);
        resizeArrayProperty(Terraria.Main, 'tileObsidianKill', nextTile, false);
        resizeArrayProperty(Terraria.Main, 'tileFrameImportant', nextTile, false);
        resizeArrayProperty(Terraria.Main, 'tilePile', nextTile, false);
        resizeArrayProperty(Terraria.Main, 'tileBlendAll', nextTile, false);
        resizeArrayProperty(Terraria.Main, 'tileContainer', nextTile, false);
        resizeArrayProperty(Terraria.Main, 'tileSign', nextTile, false);
        resizeArrayProperty(Terraria.Main, 'tileSand', nextTile, false);
        resizeArrayProperty(Terraria.Main, 'tileFlame', nextTile, false);
        resizeArrayProperty(Terraria.Main, 'tileFrame', nextTile, 0);
        resizeArrayProperty(Terraria.Main, 'tileFrameCounter', nextTile, 0);
        
        Terraria.Main.tileMerge = Terraria.Main.tileMerge.cloneResized(nextTile);
        Terraria.Main.tileMerge[tile.Type] = Terraria.Main.tileMerge[Terraria.ID.TileID.Stone].cloneResized(nextTile);
        
        resizeArrayProperty(Terraria.Main, 'tileOreFinderPriority', nextTile, 0);
        resizeArrayProperty(Terraria.Main, 'tileGlowMask', nextTile, -1);
        resizeArrayProperty(Terraria.Main, 'tileCracked', nextTile);
        resizeArrayProperty(Terraria.WorldGen, 'tileCounts', nextTile);
        resizeArrayProperty(Terraria.WorldGen, 'houseTile', nextTile);
        resizeArrayProperty(Terraria.GameContent.Biomes.CorruptionPitBiome, 'ValidTiles', nextTile, false);
        resizeArrayProperty(Terraria.GameContent.Metadata.TileMaterials, 'MaterialsByTileId', nextTile, Terraria.GameContent.Metadata.TileMaterials['TileMaterial GetByTileId(ushort tileId)'](0));
        
        Terraria.GameContent.TextureAssets.Tile = Terraria.GameContent.TextureAssets.Tile.cloneResized(nextTile);
        
        // Resize Sets
        resizeArrayProperty(Terraria.ID.TileID.Sets, 'FrameDrawModifier', nextTile, null);
        resizeArrayProperty(Terraria.ID.TileID.Sets, 'IceSkateSlippery', nextTile, false);
        resizeArrayProperty(Terraria.ID.TileID.Sets, 'DontDrawTileSliced', nextTile, false);
        resizeArrayProperty(Terraria.ID.TileID.Sets, 'AllowsSaveCompressionBatching', nextTile, false);
        resizeArrayProperty(Terraria.ID.TileID.Sets, 'CountsAsGemTree', nextTile, false);
        resizeArrayProperty(Terraria.ID.TileID.Sets, 'IsATreeTrunk', nextTile, false);
        resizeArrayProperty(Terraria.ID.TileID.Sets, 'IsShakeable', nextTile, false);
        resizeArrayProperty(Terraria.ID.TileID.Sets, 'GetsDestroyedForMeteors', nextTile, false);
        resizeArrayProperty(Terraria.ID.TileID.Sets, 'GetsCheckedForLeaves', nextTile, false);
        resizeArrayProperty(Terraria.ID.TileID.Sets, 'PreventsTileRemovalIfOnTopOfIt', nextTile, false);
        resizeArrayProperty(Terraria.ID.TileID.Sets, 'PreventsTileReplaceIfOnTopOfIt', nextTile, false);
        resizeArrayProperty(Terraria.ID.TileID.Sets, 'CommonSapling', nextTile, false);
        resizeArrayProperty(Terraria.ID.TileID.Sets, 'CacheSpecialDrawTree', nextTile, false);
        resizeArrayProperty(Terraria.ID.TileID.Sets, 'AllBlocksWithSmoothBordersToResolveHalfBlockIssue', nextTile, false);
        resizeArrayProperty(Terraria.ID.TileID.Sets, 'CanBeDugByShovel', nextTile, false);
        resizeArrayProperty(Terraria.ID.TileID.Sets, 'NonSolidSaveSlopes', nextTile, false);
        resizeArrayProperty(Terraria.ID.TileID.Sets, 'ResetsHalfBrickPlacementAttempt', nextTile, false);
        resizeArrayProperty(Terraria.ID.TileID.Sets, 'CrackedBricks', nextTile, false);
        resizeArrayProperty(Terraria.ID.TileID.Sets, 'ForcedDirtMerging', nextTile, false);
        resizeArrayProperty(Terraria.ID.TileID.Sets, 'Paintings', nextTile, false);
        resizeArrayProperty(Terraria.ID.TileID.Sets, 'isDesertBiomeSand', nextTile, false);
        resizeArrayProperty(Terraria.ID.TileID.Sets, 'MergesWithClouds', nextTile, false);
        resizeArrayProperty(Terraria.ID.TileID.Sets, 'Boulders', nextTile, false);
        resizeArrayProperty(Terraria.ID.TileID.Sets, 'Clouds', nextTile, false);
        resizeArrayProperty(Terraria.ID.TileID.Sets, 'CritterCageLidStyle', nextTile, -1);
        resizeArrayProperty(Terraria.ID.TileID.Sets, 'SmartCursorPickaxePriorityOverride', nextTile, -1);
        resizeArrayProperty(Terraria.ID.TileID.Sets, 'IgnoreSmartCursorPriorityAxe', nextTile, false);
        resizeArrayProperty(Terraria.ID.TileID.Sets, 'CanBeSatOnForNPCs', nextTile, false);
        resizeArrayProperty(Terraria.ID.TileID.Sets, 'CanBeSatOnForPlayers', nextTile, false);
        resizeArrayProperty(Terraria.ID.TileID.Sets, 'CanBeSleptIn', nextTile, false);
        resizeArrayProperty(Terraria.ID.TileID.Sets, 'IgnoresTileReplacementDropCheckWhenBeingPlaced', nextTile, false);
        resizeArrayProperty(Terraria.ID.TileID.Sets, 'DrawTileInSolidLayer', nextTile, null);
        resizeArrayProperty(Terraria.ID.TileID.Sets, 'DoesntPlaceWithTileReplacement', nextTile, false);
        resizeArrayProperty(Terraria.ID.TileID.Sets, 'DoesntGetReplacedWithTileReplacement', nextTile, false);
        resizeArrayProperty(Terraria.ID.TileID.Sets, 'IsVine', nextTile, false);
        resizeArrayProperty(Terraria.ID.TileID.Sets, 'IsBeam', nextTile, false);
        resizeArrayProperty(Terraria.ID.TileID.Sets, 'Platforms', nextTile, false);
        resizeArrayProperty(Terraria.ID.TileID.Sets, 'ReplaceTileBreakUp', nextTile, false);
        resizeArrayProperty(Terraria.ID.TileID.Sets, 'ReplaceTileBreakDown', nextTile, false);
        resizeArrayProperty(Terraria.ID.TileID.Sets, 'SlowlyDiesInWater', nextTile, false);
        resizeArrayProperty(Terraria.ID.TileID.Sets, 'DrawsWalls', nextTile, false);
        resizeArrayProperty(Terraria.ID.TileID.Sets, 'GemsparkFramingTypes', nextTile, 0);
        resizeArrayProperty(Terraria.ID.TileID.Sets, 'TeamTiles', nextTile, false);
        resizeArrayProperty(Terraria.ID.TileID.Sets, 'ConveyorDirection', nextTile, 0);
        resizeArrayProperty(Terraria.ID.TileID.Sets, 'VineThreads', nextTile, false);
        resizeArrayProperty(Terraria.ID.TileID.Sets, 'ReverseVineThreads', nextTile, false);
        resizeArrayProperty(Terraria.ID.TileID.Sets, 'HasSlopeFrames', nextTile, false);
        resizeArrayProperty(Terraria.ID.TileID.Sets, 'TileInteractRead', nextTile, false);
        resizeArrayProperty(Terraria.ID.TileID.Sets, 'IgnoresNearbyHalfbricksWhenDrawn', nextTile, false);
        resizeArrayProperty(Terraria.ID.TileID.Sets, 'SwaysInWindBasic', nextTile, false);
        resizeArrayProperty(Terraria.ID.TileID.Sets, 'DrawFlipMode', nextTile, 0);
        resizeArrayProperty(Terraria.ID.TileID.Sets, 'CollectSpecials', nextTile, false);
        resizeArrayProperty(Terraria.ID.TileID.Sets, 'HasOutlines', nextTile, false);
        resizeArrayProperty(Terraria.ID.TileID.Sets, 'AllTiles', nextTile, false);
        resizeArrayProperty(Terraria.ID.TileID.Sets, 'Dirt', nextTile, false);
        resizeArrayProperty(Terraria.ID.TileID.Sets, 'Mud', nextTile, false);
        resizeArrayProperty(Terraria.ID.TileID.Sets, 'Ash', nextTile, false);
        resizeArrayProperty(Terraria.ID.TileID.Sets, 'Snow', nextTile, false);
        resizeArrayProperty(Terraria.ID.TileID.Sets, 'Ices', nextTile, false);
        resizeArrayProperty(Terraria.ID.TileID.Sets, 'IcesSlush', nextTile, false);
        resizeArrayProperty(Terraria.ID.TileID.Sets, 'IcesSnow', nextTile, false);
        resizeArrayProperty(Terraria.ID.TileID.Sets, 'GrassSpecial', nextTile, false);
        resizeArrayProperty(Terraria.ID.TileID.Sets, 'JungleSpecial', nextTile, false);
        resizeArrayProperty(Terraria.ID.TileID.Sets, 'HellSpecial', nextTile, false);
        resizeArrayProperty(Terraria.ID.TileID.Sets, 'Leaves', nextTile, false);
        resizeArrayProperty(Terraria.ID.TileID.Sets, 'tileMossBrick', nextTile, false);
        resizeArrayProperty(Terraria.ID.TileID.Sets, 'GeneralPlacementTiles', nextTile, false);
        resizeArrayProperty(Terraria.ID.TileID.Sets, 'BasicChest', nextTile, false);
        resizeArrayProperty(Terraria.ID.TileID.Sets, 'BasicChestFake', nextTile, false);
        resizeArrayProperty(Terraria.ID.TileID.Sets, 'BasicDresser', nextTile, false);
        resizeArrayProperty(Terraria.ID.TileID.Sets, 'CanBeClearedDuringGeneration', nextTile, false);
        //resizeArrayProperty(Terraria.ID.TileID.Sets, 'CorruptCountCollection', nextTile, false);
        resizeArrayProperty(Terraria.ID.TileID.Sets, 'CorruptBiomeSight', nextTile, false);
        resizeArrayProperty(Terraria.ID.TileID.Sets, 'Corrupt', nextTile, false);
        //resizeArrayProperty(Terraria.ID.TileID.Sets, 'HallowCountCollection', nextTile, false);
        resizeArrayProperty(Terraria.ID.TileID.Sets, 'HallowBiomeSight', nextTile, false);
        resizeArrayProperty(Terraria.ID.TileID.Sets, 'Hallow', nextTile, false);
        resizeArrayProperty(Terraria.ID.TileID.Sets, 'CanGrowCrystalShards', nextTile, false);
        //resizeArrayProperty(Terraria.ID.TileID.Sets, 'CrimsonCountCollection', nextTile, false);
        resizeArrayProperty(Terraria.ID.TileID.Sets, 'CrimsonBiomeSight', nextTile, false);
        resizeArrayProperty(Terraria.ID.TileID.Sets, 'Crimson', nextTile, false);
        resizeArrayProperty(Terraria.ID.TileID.Sets, 'IsSkippedForNPCSpawningGroundTypeCheck', nextTile, false);
        resizeArrayProperty(Terraria.ID.TileID.Sets, 'BlocksStairs', nextTile, false);
        resizeArrayProperty(Terraria.ID.TileID.Sets, 'BlocksStairsAbove', nextTile, false);
        resizeArrayProperty(Terraria.ID.TileID.Sets, 'NotReallySolid', nextTile, false);
        resizeArrayProperty(Terraria.ID.TileID.Sets, 'BlocksWaterDrawingBehindSelf', nextTile, false);
        resizeArrayProperty(Terraria.ID.TileID.Sets, 'AllowLightInWater', nextTile, false);
        resizeArrayProperty(Terraria.ID.TileID.Sets, 'NeedsGrassFraming', nextTile, false);
        resizeArrayProperty(Terraria.ID.TileID.Sets, 'NeedsGrassFramingDirt', nextTile, 0);
        resizeArrayProperty(Terraria.ID.TileID.Sets, 'ChecksForMerge', nextTile, false);
        resizeArrayProperty(Terraria.ID.TileID.Sets, 'FramesOnKillWall', nextTile, false);
        resizeArrayProperty(Terraria.ID.TileID.Sets, 'AvoidedByNPCs', nextTile, false);
        resizeArrayProperty(Terraria.ID.TileID.Sets, 'InteractibleByNPCs', nextTile, false);
        resizeArrayProperty(Terraria.ID.TileID.Sets, 'HousingWalls', nextTile, false);
        resizeArrayProperty(Terraria.ID.TileID.Sets, 'BreakableWhenPlacing', nextTile, false);
        resizeArrayProperty(Terraria.ID.TileID.Sets, 'TouchDamageDestroyTile', nextTile, false);
        resizeArrayProperty(Terraria.ID.TileID.Sets, 'Suffocate', nextTile, false);
        resizeArrayProperty(Terraria.ID.TileID.Sets, 'TouchDamageHot', nextTile, false);
        resizeArrayProperty(Terraria.ID.TileID.Sets, 'TouchDamageBleeding', nextTile, false);
        resizeArrayProperty(Terraria.ID.TileID.Sets, 'TouchDamageImmediate', nextTile, -1);
        resizeArrayProperty(Terraria.ID.TileID.Sets, 'Falling', nextTile, false);
        resizeArrayProperty(Terraria.ID.TileID.Sets, 'BlockMergesWithMergeAllBlock', nextTile, false);
        resizeArrayProperty(Terraria.ID.TileID.Sets, 'OreMergesWithMud', nextTile, false);
        resizeArrayProperty(Terraria.ID.TileID.Sets, 'Ore', nextTile, false);
        resizeArrayProperty(Terraria.ID.TileID.Sets, 'IsAContainer', nextTile, false);
        resizeArrayProperty(Terraria.ID.TileID.Sets, 'IsAMechanism', nextTile, false);
        resizeArrayProperty(Terraria.ID.TileID.Sets, 'IsATrigger', nextTile, false);
        resizeArrayProperty(Terraria.ID.TileID.Sets, 'FriendlyFairyCanLureTo', nextTile, false);
        resizeArrayProperty(Terraria.ID.TileID.Sets, 'IgnoredInHouseScore', nextTile, false);
        resizeArrayProperty(Terraria.ID.TileID.Sets, 'SpreadOverground', nextTile, false);
        resizeArrayProperty(Terraria.ID.TileID.Sets, 'SpreadUnderground', nextTile, false);
        // Sets.Conversion
        resizeArrayProperty(Terraria.ID.TileID.Sets.Conversion, 'MergesWithDirtInASpecialWay', nextTile, false);
        resizeArrayProperty(Terraria.ID.TileID.Sets.Conversion, 'JungleGrass', nextTile, false);
        resizeArrayProperty(Terraria.ID.TileID.Sets.Conversion, 'MushroomGrass', nextTile, false);
        resizeArrayProperty(Terraria.ID.TileID.Sets.Conversion, 'Grass', nextTile, false);
        resizeArrayProperty(Terraria.ID.TileID.Sets.Conversion, 'GolfGrass', nextTile, false);
        resizeArrayProperty(Terraria.ID.TileID.Sets.Conversion, 'Dirt', nextTile, false);
        resizeArrayProperty(Terraria.ID.TileID.Sets.Conversion, 'Snow', nextTile, false);
        resizeArrayProperty(Terraria.ID.TileID.Sets.Conversion, 'Stone', nextTile, false);
        resizeArrayProperty(Terraria.ID.TileID.Sets.Conversion, 'Ice', nextTile, false);
        resizeArrayProperty(Terraria.ID.TileID.Sets.Conversion, 'Sand', nextTile, false);
        resizeArrayProperty(Terraria.ID.TileID.Sets.Conversion, 'HardenedSand', nextTile, false);
        resizeArrayProperty(Terraria.ID.TileID.Sets.Conversion, 'Sandstone', nextTile, false);
        resizeArrayProperty(Terraria.ID.TileID.Sets.Conversion, 'Thorn', nextTile, false);
        resizeArrayProperty(Terraria.ID.TileID.Sets.Conversion, 'Moss', nextTile, false);
        resizeArrayProperty(Terraria.ID.TileID.Sets.Conversion, 'MossBrick', nextTile, false);
        // Sets.TileCutIgnore
        resizeArrayProperty(Terraria.ID.TileID.Sets.TileCutIgnore, 'None', nextTile, false);
        resizeArrayProperty(Terraria.ID.TileID.Sets.TileCutIgnore, 'IgnoreDontHurtNature', nextTile, true);
        resizeArrayProperty(Terraria.ID.TileID.Sets.TileCutIgnore, 'Regrowth', nextTile, false);
        // Sets.ForAdvancedCollision
        resizeArrayProperty(Terraria.ID.TileID.Sets.ForAdvancedCollision, 'ForSandshark', nextTile, false);
        
        for (let i = 0; i < nextTile; i++) {
            Terraria.Main.tileMerge[i] = Terraria.Main.tileMerge[i].cloneResized(nextTile);
        }
        
        while (Terraria.ObjectData.TileObjectData._data.Count < nextTile) {
            Terraria.ObjectData.TileObjectData._data.Add(null);
        }
        
        this.SetupTextures(tile);
    }
    
    static SetupContent() {
        //this.LoadTiles();
        //ModLoader.ModData.TileCount += this.Count;
        
        //for (const tile of this.Tiles) {
        //    tile.SetupContent();
        //}
        
        for (const gTile of GlobalTile.RegisteredTiles) {
            gTile.SetStaticDefaults();
        }
    }
    
    static PostSetupContent() {
        this.TileCount = this.MAX_VANILLA_ID + ModLoader.ModData.TileCount;
        //Terraria.ID.TileID.Count = this.TileCount;
        //this.PostSetupTileMerge();
        /*for (const modTile of this.Tiles) {
            modTile?.PostSetupContent();
            if (modTile?.AllowNearbyEffects) {
                this.NearbyTiles.push(modTile.Type);
            }
        }*/
    }
    
    static PostSetupTileMerge() {
        for (let i = 0; i < this.TileCount; i++) {
            for (let j = this.MAX_VANILLA_ID; j < this.TileCount; j++) {
                Terraria.Main.tileMerge[i][j] = i === j;
                Terraria.Main.tileMerge[j][i] = i === j;
            }
        }
        this.Tiles.forEach(t => t.PostSetupTileMerge());
    }
    
    static SetupTextures(tile) {
        if (!tile.Texture?.startsWith('Textures/')) {
            tile.Texture = 'Textures/' + tile.Texture;
        }
        
        const tileTexture = new ModTexture(tile.Texture);
        if (tileTexture?.exists) {
            Terraria.GameContent.TextureAssets.Tile[tile.Type] = tileTexture.asset.asset;
        }
        
        const tileGlowTexture = new ModTexture(tile.Texture + '_Glow');
        if (tileGlowTexture?.exists) {
            const nextGlow = Terraria.GameContent.TextureAssets.GlowMask.length;
            resizeArrayProperty(Terraria.GameContent.TextureAssets, 'GlowMask', nextGlow + 1, tileGlowTexture.asset.asset);
            Terraria.Main.tileGlowMask[tile.Type] = nextGlow;
        }
    }
    
    static CanPlace(i, j, type, mute, forced, plr, style) {
        if (GlobalTile.RegisteredTiles.some(gT => gT.CanPlace(i, j, type, mute, forced, plr, style))) {
            return false;
        }
        if (this.isModType(type)) {
            if (this.getModTile(type).CanPlace(i, j) === false) {
                return false;
            }
        }
        
        return true;
    }
    
    static OnPlace(i, j, type, plr, style) {
        if (this.isModType(type)) {
            this.getModTile(type).OnPlace(Terraria.Main.player[plr], i, j, style);
        }
        GlobalTile.RegisteredTiles.forEach(gT => gT.OnPlace(Terraria.Main.player[plr], i, j, type, style));
    }
    
    static Convert(i, j, conversionType) {
        const type = new TileData(i, j).type;
        if (this.isModType(type)) {
            this.getModTile(type).Convert(i, j, conversionType);
        }
    }
    
    static IsReplaceable(type, x, y) {
        if (GlobalTile.RegisteredTiles.some(gT => gT.IsReplaceable(type, x, y) === false)) {
            return false;
        }
        if (this.isModType(type)) {
            return this.getModTile(type).IsReplaceable(x, y);
        }
        return true;
    }
    
    static OnReplace(x, y, targetType, targetStyle) {
        for (const gTile of GlobalTile.RegisteredTiles) {
            gTile.OnReplace(x, y, targetType, targetStyle);
        }
        if (this.isModType(targetType)) {
            this.getModTile(targetType).OnReplace(x, y, targetStyle);
        }
    }
    
    static CanKillTile(i, j, blockDamaged) {
        const type = new TileData(i, j).type;
        
        if (GlobalTile.RegisteredTiles.some(gT => gT.CanKillTile(i, j, type, blockDamaged) === false)) {
            return false;
        }
        if (this.isModType(type)) {
            return this.getModTile(type).CanKillTile(i, j, blockDamaged);
        }
        
        return true;
    }
    
    static KillTile(i, j, fail, effectOnly, noItem) {
        const type = new TileData(i, j).type;
        
        for (const gTile of GlobalTile.RegisteredTiles) {
            gTile.KillTile(i, j, type, fail, effectOnly, noItem);
        }
        if (this.isModType(type)) {
            this.getModTile(type).KillTile(i, j, fail, effectOnly, noItem);
        }
    }
    
    static KillMultiTile(i, j, frameX, frameY, type) {
        if (this.isModType(type)) {
            this.getModTile(type).KillMultiTile(i, j, frameX, frameY);
        }
    }
    
    static KillSound(i, j, type, fail) {
        if (GlobalTile.RegisteredTiles.some(gT => gT.KillSound(i, j, type, fail) === false)) {
            return false;
        }
        if (this.isModType(type)) {
            const modTile = this.getModTile(type);
            if (modTile.KillSound(i, j, fail)) {
                if (modTile.HitSound >= 0) PlaySound(modTile.HitSound, i * 16, j * 16);
            } else {
                return false;
            }
        }
        return true;
    }
    
    static NumDust(type, fail) {
        return this.getModTile(type)?.NumDust(fail) ?? 0;
    }

    static CreateDust(i, j, tile) {
        if (this.isModType(tile.type)) {
            const modTile = this.getModTile(tile.type);
            const fail = !tile['bool active()']();
            const num = this.NumDust(tile.type, fail);
            const dust = modTile.DustType ?? 0;
            if (dust >= 0) {
                if (modTile.CreateDust(i, j, dust, num, fail)) {
                    return NewDustFromTile(i, j, dust);
                }
            }
        }
        return 0;
    }
    
    static UpdateAdjTiles(type, player) {
        if (this.isModType(type)) {
            return this.getModTile(type).UpdateAdjTiles(player);
        }
        return [];
    }
    
    static Drop(x, y, tile, includeLargeObjectDrops = false, includeAllModdedLargeObjectDrops = false) {
        
        if (!this.isModType(tile.type)) return;
        if (this.getModTile(tile.type).CanDrop(x, y) === false) return false;
        
        let isLarge = false;
        if (Terraria.Main.tileFrameImportant[tile.type]) {
            const tileData = Terraria.ObjectData.TileObjectData['TileObjectData GetTileData(Tile getTile)'](tile);
            if (tileData != null) {
                if (tileData.Width != 1 || tileData.Height != 1) {
                    isLarge = true;
                }
            }
            else if (Terraria.ID.TileID.Sets.IsMultitile[tile.type]) {
                isLarge = true;
            }
        }
        if (!includeLargeObjectDrops && isLarge) {
            return true;
        }
        
        this.GetItemDrops(x, y, tile, includeLargeObjectDrops, includeAllModdedLargeObjectDrops);
        
        return true;
    }
    
    static GetItemDrops(x, y, tile, includeLargeObjectDrops = false, includeAllModdedLargeObjectDrops = false) {
        let needDrops = false;
        const tileData = Terraria.ObjectData.TileObjectData['TileObjectData GetTileData(Tile getTile)'](tile);
        
        if (!tileData) {
            needDrops = true;
        } else if (tileData.Width === 1 && tileData.Height === 1) {
            needDrops = !includeAllModdedLargeObjectDrops;
        } else if (includeAllModdedLargeObjectDrops) {
            needDrops = true;
        } else if (includeLargeObjectDrops) {
            const sets = Terraria.ID.TileID.Sets;
            if (sets.BasicChest[tile.type] || sets.BasicDresser[tile.type] || sets.Campfire[tile.type]) {
                needDrops = true;
            }
        }
        
        if (!needDrops) return;

        const drops = [];
        
        if (this.isModType(tile.type)) {
            const modTile = this.getModTile(tile.type);
            drops.push(...modTile.GetItemDrops(x, y));
        }
        
        for (const drop of drops) {
            if (drop.type > 0) {
                const id = Terraria.Item['int NewItem(IEntitySource source, int X, int Y, int Width, int Height, int Type, int Stack, bool noBroadcast, int pfix, bool noGrabDelay, bool reverseLookup)'](
                    Terraria.WorldGen.GetItemSource_FromTileBreak(x, y),
                    x * 16, y * 16, 16, 16,
                    drop.type,
                    drop.count ?? 1,
                    false, -1, false, false
                );
                Terraria.Main.item[id]?.TryCombiningIntoNearbyItems(id);
            }
        }
    }
    
    static IsTileSpelunkable(tile) {
        let retVal = null;
        const i = tile._tileOffset % Terraria.Main.maxTilesX;
        const j = Math.floor(tile._tileOffset / Terraria.Main.maxTilesX);
        
        if (this.isModType(tile.type)) {
            const modTile = this.getModTile(tile.type);
            if (!Terraria.Main.tileSpelunker[tile.type] && modTile && modTile.IsTileSpelunkable(i, j)) {
                retVal = true;
            }
        }
        
        for (const gTile of GlobalTile.RegisteredTiles) {
            let globalRetVal = gTile.IsTileSpelunkable(i, j, tile.type);
            if (globalRetVal === false) return false;
            if (globalRetVal === true) retVal = true;
        }
        
        return retVal;
    }
    
    static IsTileBiomeSightable(type, frameX, frameY) {
        let retVal = null;
        
        if (this.isModType(type)) {
            const modTile = this.getModTile(type);
            if (modTile && modTile.IsTileBiomeSightable(frameX, frameY)) {
                retVal = true;
            }
        }
        
        for (const gTile of GlobalTile.RegisteredTiles) {
            let globalRetVal = gTile.IsTileBiomeSightable(type, frameX, frameY);
            if (globalRetVal === false) return false;
            if (globalRetVal === true) retVal = true;
        }
        
        return retVal;
    }
    
    static PickPowerCheck(type, pickPower, damage) {
        if (this.isModType(type)) {
            const modTile = this.getModTile(type);
            if (pickPower < modTile.MinPick) damage = 0;
            else damage /= modTile.MineResist;
        }
        return damage;
    }
    
    static CheckModTile(i, j, type) {
        if (Terraria.WorldGen.destroyObject
        || !Terraria.Main.tileFrameImportant[type]
        || !this.isModType(type)
        ) return;
        
        let tileData = Terraria.ObjectData.TileObjectData['TileObjectData GetTileData(int type, int style, int alternate)'](type, 0, 0);
        if (!tileData) return;
        
        let tile = Terraria.Main.tile.get_Item(i, j),
        frameX = tile.frameX,
        frameY = tile.frameY,
        subX = frameX / tileData.CoordinateFullWidth,
        subY = frameY / tileData.CoordinateFullHeight,
        wrap = tileData.StyleWrapLimit;
        if (wrap == 0) {
            wrap = 1;
        }
        let styleLineSkip = tileData.StyleLineSkip;
        let subTile = tileData.StyleHorizontal ? subY / styleLineSkip * wrap + subX : subX / styleLineSkip * wrap + subY;
        let style = Math.floor(subTile / tileData.StyleMultiplier);
        
        /*
        let alternate = subTile % tileData.StyleMultiplier;
        for (let k = 0; k < tileData.AlternatesCount; k++) {
            if (alternate >= tileData.Alternates[k].Style && alternate <= tileData.Alternates[k].Style + tileData.RandomStyleRange) {
                alternate = k;
                break;
            }
        }*/
        
        tileData = Terraria.ObjectData.TileObjectData['TileObjectData GetTileData(Tile getTile)'](tile);
        let partFrameX = frameX % tileData.CoordinateFullWidth,
        partFrameY = frameY % tileData.CoordinateFullHeight,
        partX = partFrameX / (tileData.CoordinateWidth + tileData.CoordinatePadding),
        partY = 0;
        for (let remainingFrameY = partFrameY; partY + 1 < tileData.Height && remainingFrameY - tileData.CoordinateHeights[partY] - tileData.CoordinatePadding >= 0; partY++) {
            remainingFrameY -= tileData.CoordinateHeights[partY] + tileData.CoordinatePadding;
        }
        
        // We need to use the tile that trigger this, since it still has the tile type instead of air
        let originalI = i, originalJ = j;
        
        i -= partX; j -= partY;
        
        let originX = i + tileData.Origin.X;
        let originY = j + tileData.Origin.Y;
        
        let partiallyDestroyed = false;
        for (let x = i; x < i + tileData.Width; x++) {
            for (let y = j; y < j + tileData.Height; y++) {
                let tempTile = Terraria.Main.tile.get_Item(x, y);
                if (!tempTile['bool active()']() || tempTile.type != type) {
                    partiallyDestroyed = true;
                    break;
                }
            }
            if (partiallyDestroyed) {
                break;
            }
        }
        
        // TODO: Placed modded tiles can't automatically reorient themselves to an alternate placement, like Torch and Sign do.
        if (partiallyDestroyed) {// || !Terraria.TileObject['bool CanPlace(int x, int y, int type, int style, int dir, ref TileObject objectData, bool onlyCheck, Nullable`1 forcedRandom)'](originX, originY, type, style, 0, Terraria.TileObject.new(), true, null)) {
            Terraria.WorldGen.destroyObject = true;
            // First the Items to drop are tallied and spawned, then Kill each tile, then KillMultiTile can clean up TileEntities or Chests
            // KillTile will handle calling DropItems for 1x1 tiles.
            if (tileData.Width != 1 || tileData.Height != 1) {
                this.Drop(originalI, originalJ, Terraria.Main.tile.get_Item(originalI, originalJ), true, true); // include all drops.
            }
            for (let x = i; x < i + tileData.Width; x++) {
                for (let y = j; y < j + tileData.Height; y++) {
                    let tempTile = Terraria.Main.tile.get_Item(x, y);
                    if (tempTile.type == type && tempTile['bool active()']()) {
                        Terraria.WorldGen.KillTile(x, y, false, false, false);
                    }
                }
            }
            
            this.KillMultiTile(i, j, frameX - partFrameX, frameY - partFrameY, type);
            Terraria.WorldGen.destroyObject = false;
            for (let x = i - 1; x < i + tileData.Width + 2; x++) {
                for (let y = j - 1; y < j + tileData.Height + 2; y++) {
                    Terraria.WorldGen.TileFrame(x, y, false, false);
                }
            }
        }
        
        Terraria.TileObject.objectPreview.Active = false;
    }
    
    static RandomUpdate(i, j) {
        const type = new TileData(i, j).type;
        if (this.isModType(type)) {
            this.getModTile(type).RandomUpdate(i, j);
        }
    }
    
    static RightClick(player, i, j, type) {
        if (GlobalTile.RegisteredTiles.some(gT => gT.RightClick(player, i, j, type) === false)) {
            return false;
        }
        if (this.isModType(type)) {
            return this.getModTile(type).RightClick(player, i, j);
        }
        return true;
    }
    
    static MouseOver(player, i, j, type) {
        for (const gTile of GlobalTile.RegisteredTiles) {
            gTile.MouseOver(player, i, j, type);
        }
        if (this.isModType(type)) {
            this.getModTile(type).MouseOver(player, i, j);
        }
    }
    
    static MouseOverFar(player, i, j, type) {
        for (const gTile of GlobalTile.RegisteredTiles) {
            gTile.MouseOverFar(player, i, j, type);
        }
        if (this.isModType(type)) {
            this.getModTile(type).MouseOverFar(player, i, j);
        }
    }
    
    static PreHitWire(i, j, type) {
        if (GlobalTile.RegisteredTiles.some(gT => gT.PreHitWire(i, j, type) === false)) {
            return false;
        }
        if (this.isModType(type)) {
            return this.getModTile(type).PreHitWire(i, j);
        }
        return true;
    }
    
    static HitWire(i, j, type) {
        for (const gTile of GlobalTile.RegisteredTiles) {
            gTile.HitWire(i, j, type);
        }
        if (this.isModType(type)) {
            this.getModTile(type).HitWire(i, j);
        }
    }
    
    static Slope(i, j, type, slope) {
        if (GlobalTile.RegisteredTiles.some(gT => gT.Slope(i, j, type, slope) === false)) {
            return false;
        }
        if (this.isModType(type)) {
            return this.getModTile(type).Slope(i, j, slope);
        }
    }
}