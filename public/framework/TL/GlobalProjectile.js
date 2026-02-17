export class GlobalProjectile {
    static RegisteredProjectiles = [];
    constructor() { }
    
    SetDefaults(proj) {
        
    }
    
    OnSpawn(proj) {
        
    }
    
    PreAI(proj) {
        return true;
    }
    
    AI(proj) {
        
    }
    
    PreKill(proj, timeLeft) {
        return true;
    }
    
    OnKill(proj, timeLeft) {
        
    }
    
    CanCutTiles(proj) {
        return null;
    }
    
    CutTiles(proj) {
        
    }
    
    OnHitNPC(proj, npc) {
        
    }
    
    OnHitPlayer(proj, player) {
        
    }
    
    GetAlpha(proj, color) {
        return color;
    }
    
    PreDraw(proj, lightColor) {
        return true;
    }
    
    PostDraw(proj, lightColor) {
        
    }
    
    CanDamage(proj) {
        return true;
    }
    
    ModifyDamageHitbox(proj, hitbox) {
        
    }
    
    static register(gProj) {
        this.RegisteredProjectiles.push(new gProj());
    }
    static getByName(name) {
        return this.RegisteredProjectiles.find(p => p.constructor.name === name);
    }
}