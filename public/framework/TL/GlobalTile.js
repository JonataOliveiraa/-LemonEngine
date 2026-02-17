export class GlobalTile {
    static RegisteredTiles = [];
    constructor() {}
    
    SetStaticDefaults() {
        
    }
    
    CanPlace(i, j, type, mute, forced, plr, style) {
        return true;
    }
    
    OnPlace(player, i, j, type, style) {
        
    }
    
    IsReplaceable(type, x, y) {
        return true;
    }
    
    OnReplace(x, y, targetType, targetStyle) {
        
    }
    
    CanKillTile(i, j, type, blockDamaged) {
        return true;
    }
    
    KillTile(i, j, type, fail, effectOnly, noItem) {
        
    }
    
    KillSound(i, j, type, fail) {
        return true;
    }
    
    CanDrop(x, y, type) {
        return true;
    }
    
    Drop(x, y, type) {
        
    }
    
    IsTileSpelunkable(i, j, type) {
        
    }
    
    IsTileBiomeSightable(type, frameX, frameY) {
        
    }
    
    RightClick(player, i, j, type) {
        return true;
    }
    
    MouseOver(player, i, j, type) {
        
    }
    
    MouseOverFar(player, i, j, type) {
        
    }
    
    PreHitWire(i, j, type) {
        
    }
    
    HitWire(i, j, type) {
        
    }
    
    Slope(i, j, type, slope) {
        return true;
    }
    
    static register(gTile) {
        this.RegisteredTiles.push(new gTile());
    }
    static getByName(name) {
        return this.RegisteredTiles.find(t => t.constructor.name === name);
    }
}