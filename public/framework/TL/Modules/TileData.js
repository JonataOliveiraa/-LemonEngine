import { Terraria } from './../ModImports.js';

export class TileData {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.offset = y * Terraria.Main.maxTilesX + x;
    }
    
    get tile() {
        return Terraria.Main.tile.get_Item(this.x, this.y);
    }
    get type() {
        return Terraria.TileData['ushort GetType(int tileIndex)'](this.offset);
    }
    get wall() {
        return Terraria.TileData['ushort GetWall(int tileIndex)'](this.offset);
    }
    get sHeader() {
        return Terraria.TileData['short GetSHeader(int tileIndex)'](this.offset);
    }
    get frameX() {
        return Terraria.TileData['short GetFrameX(int tileIndex)'](this.offset);
    }
    get frameY() {
        return Terraria.TileData['short GetFrameY(int tileIndex)'](this.offset);
    }
    get bHeader() {
        return Terraria.TileData['byte GetBHeader(int tileIndex)'](this.offset);
    }
    get bHeader2() {
        return Terraria.TileData['byte GetBHeader2(int tileIndex)'](this.offset);
    }
    get bHeader3() {
        return Terraria.TileData['byte GetBHeader3(int tileIndex)'](this.offset);
    }
    get liquid() {
        return Terraria.TileData['byte GetLiquid(int tileIndex)'](this.offset);
    }
    get isSolid() {
        return Terraria.WorldGen['bool SolidTile(short tileSHeader, ushort tileType)'](this.sHeader, this.type);
    }
    get isSolidOrSloped() {
        return Terraria.WorldGen['bool SolidOrSlopedTile(int x, int y)'](this.x, this.y);
    }
}