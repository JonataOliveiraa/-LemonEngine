import { Terraria, Microsoft } from './../ModImports.js';
import { ModLoader } from './../Core/ModLoader.js';
import { ModTexture } from './../ModTexture.js';
import { ModLocalization } from './../ModLocalization.js';
import { GlobalProjectile } from './../GlobalProjectile.js';

function cloneResizedSetLastItem(array, newSize, value) {
    const resized = array.cloneResized(newSize);
    if (value != null) resized[newSize - 1] = value;
    return resized;
}

function resizeArrayProperty(propertyHolder, propertyName, newSize, value) {
    propertyHolder[propertyName] = cloneResizedSetLastItem(propertyHolder[propertyName], newSize, value);
}

function addToArray(propertyHolder, propertyName, value) {
    const array = propertyHolder[propertyName];
    const arrayLength = array.length;
    propertyHolder[propertyName] = cloneResizedSetLastItem(array, arrayLength + 1, value);
}

export class ProjectileLoader {
    static Projectiles = [];
    static MAX_VANILLA_ID = Terraria.ID.ProjectileID.Count;
    static Count = 0;
    static TypeOffset = 0;
    static ModTypes = new Set();
    static TypeToIndex = {};
    static ProjectileCount = this.MAX_VANILLA_ID + this.Count;
    
    static isModProjectile(proj) { return this.isModType(proj.type); }
    static isModType(type) { return this.ModTypes.has(type); }
    static getByName(name) { return this.Projectiles.find(t => t.constructor.name === name); }
    static getTypeByName(name) { return this.getByName(name)?.Type; }
    static getModProjectile(type) {
        if (this.ModTypes.has(type)) {
            return this.Projectiles[this.TypeToIndex[type]];
        }
        return undefined;
    }
    
    static ProjectileProperties = [
        'ownerHitCheckDistance',
        'arrow',
        'numHits',
        'bobber',
        'netImportant',
        'noDropItem',
        'counterweight',
        'sentry',
        'owner',
        'gfxOffY',
        'stepSpeed',
        'aiStyle',
        'timeLeft',
        'soundDelay',
        'damage',
        'originalDamage',
        'hostile',
        'reflected',
        'knockBack',
        'friendly',
        'penetrate',
        'localNPCImmunity',
        'usesLocalNPCImmunity',
        'maxPenetrate',
        'light',
        'netUpdate',
        'netUpdate2',
        'netSpam',
        'minion',
        'minionSlots',
        'restrikeDelay',
        'tileCollide',
        'extraUpdates',
        'stopsDealingDamageAfterPenetrateHits',
        'numUpdates',
        'ignoreWater',
        'isAPreviewDummy',
        'hide',
        'ownerHitCheck',
        'usesOwnerMeleeHitCD',
        'playerImmune',
        'miscText',
        'melee',
        'ranged',
        'magic',
        'coldDamage',
        'noEnchantments',
        'noEnchantmentVisuals',
        'trap',
        'npcProj',
        'originatedFromActivableTile',
        'manualDirectionChange',
        'decidesManualFallThrough',
        'shouldFallThrough',
        'localNPCHitCooldown',
        'idStaticNPCHitCooldown',
        'bannerIdToRespondTo'
    ];
    
    static LoadProjectiles() {
        this.TypeOffset = ModLoader.ModData.ProjectileCount ?? 0;
        for (const proj of this.Projectiles) {
            this.LoadProjectile(proj);
        }
    }
    
    static LoadProjectile(proj) {
        this.Count++;
        proj.Projectile = {};
        proj.Type = proj.Projectile.type = tl.projectile.registerNew(proj.constructor.name);
        this.ModTypes.add(proj.Type);
        const nextProjectile = proj.Type + 1;
        this.TypeToIndex[proj.Type] = this.Projectiles.indexOf(proj);
        
        resizeArrayProperty(Terraria.Main, 'projHostile', nextProjectile);
        resizeArrayProperty(Terraria.Main, 'projHook', nextProjectile);
        resizeArrayProperty(Terraria.Main, 'projPet', nextProjectile);
        resizeArrayProperty(Terraria.Main, 'projFrames', nextProjectile);
        
        addToArray(Terraria.Lang, '_projectileNameCache', ModLocalization.empty());
        
        //resizeArrayProperty(Terraria.Projectile, 'perIDStaticNPCImmunity', nextProjectile);
        
        this.SetupTextures(proj);
        
        proj.SetDefaults();
        proj.SetStaticDefaults();
        
        if (proj.Projectile.hostile) {
            Terraria.Main.projHostile[proj.Type] = true;
        }
        if (proj.Projectile.aiStyle === Terraria.ID.ProjAIStyleID.Hook) {
            Terraria.Main.projHook[proj.Type] = true;
        }
        Terraria.Lang._projectileNameCache[proj.Type] = ModLocalization.getTranslationProjectileName(proj.Type);
        
        const projTexture = Terraria.GameContent.TextureAssets.Projectile[proj.Type].Value;
        if (proj.Projectile.width == undefined) proj.Projectile.width = projTexture.Width;
        if (proj.Projectile.height == undefined) proj.Projectile.height = projTexture.Height;
        
        proj.PostStaticDefaults();
    }
    
    static SetupContent() {
        this.LoadProjectiles();
        ModLoader.ModData.ProjectileCount += this.Count;
        for (const proj of this.Projectiles) {
            proj?.SetupContent();
        }
    }
    
    static PostSetupContent() {
        this.ProjectileCount = this.MAX_VANILLA_ID + ModLoader.ModData.ProjectileCount;
        for (const proj of this.Projectiles) {
            proj?.PostSetupContent();
        }
    }
    
    static SetupTextures(proj) {
        if (!proj.Texture?.startsWith('Textures/')) {
            proj.Texture = 'Textures/' + proj.Texture;
        }
        
        const projTexture = new ModTexture(proj.Texture, proj.horizontalFrames, proj.frameCount, proj.ticksPerFrame);
        if (projTexture?.exists) {
            Terraria.GameContent.TextureAssets.Projectile[proj.Type] = projTexture.asset.asset;
        }
    }
    
    static SetDefaults(proj) {
        for (const gProj of GlobalProjectile.RegisteredProjectiles) {
            gProj?.SetDefaults(proj);
        }
    }
    
    static OnSpawn(proj) {
        if (this.isModType(proj.type)) {
            this.getModProjectile(proj.type)?.OnSpawn(proj);
        }
        for (const gProj of GlobalProjectile.RegisteredProjectiles) {
            gProj?.OnSpawn(proj);
        }
    }
    
    static PreAI(proj) {
        let value = true;
        if (this.isModType(proj.type)) {
            value = this.getModProjectile(proj.type)?.PreAI(proj) ?? true;
        }
        if (GlobalProjectile.RegisteredProjectiles.some(gP => (gP?.PreAI(proj) ?? true) === false)) {
            value = false;
        }
        return value;
    }
    
    static AI(proj) {
        if (this.isModType(proj.type)) {
            this.getModProjectile(proj.type)?.AI(proj);
        }
        for (const gProj of GlobalProjectile.RegisteredProjectiles) {
            gProj?.AI(proj);
        }
    }
    
    static PreKill(proj, timeLeft) {
        let value = true;
        if (this.isModType(proj.type)) {
            value = this.getModProjectile(proj.type)?.PreKill(proj, timeLeft) ?? true;
        }
        if (GlobalProjectile.RegisteredProjectiles.some(gP => (gP?.PreKill(proj, timeLeft) ?? true) === false)) {
            value = false;
        }
        return value;
    }
    
    static OnKill(proj, timeLeft) {
        if (this.isModType(proj.type)) {
            this.getModProjectile(proj.type)?.OnKill(proj, timeLeft);
        }
        for (const gProj of GlobalProjectile.RegisteredProjectiles) {
            gProj?.OnKill(proj, timeLeft);
        }
    }
    
    static Colliding(proj, myRect, targetRect) {
        let value = null;
        if (this.isModType(proj.type)) {
            value = this.getModProjectile(proj.type)?.Colliding(proj, myRect, targetRect);
        }
        return value;
    }
    
    static OnTileCollide(proj, hitDirection) {
        let value = true;
        if (this.isModType(proj.type)) {
            value = this.getModProjectile(proj.type)?.OnTileCollide(proj, hitDirection) ?? true;
        }
        return value;
    }
    
    static CanCutTiles(proj) {
        let value = null;
        if (this.isModType(proj.type)) {
            value = this.getModProjectile(proj.type)?.CanCutTiles(proj);
        }
        for (const gProj of GlobalProjectile.RegisteredProjectiles) {
            let result = gProj?.CanCutTiles(proj);
            if (result != null) {
                if (value || value == null) {
                    value = result;
                }
            }
        }
        return value;
    }
    
    static CutTiles(proj) {
        if (this.isModType(proj.type)) {
            this.getModProjectile(proj.type)?.CutTiles(proj);
        }
        for (const gProj of GlobalProjectile.RegisteredProjectiles) {
            gProj?.CutTiles(proj);
        }
    }
    
    static OnHitNPC(proj, npc) {
        if (this.isModType(proj.type)) {
            this.getModProjectile(proj.type)?.OnHitNPC(proj, npc);
        }
        for (const gProj of GlobalProjectile.RegisteredProjectiles) {
            gProj?.OnHitNPC(proj, npc);
        }
    }
    
    static OnHitPlayer(proj, player) {
        if (this.isModType(proj.type)) {
            this.getModProjectile(proj.type)?.OnHitPlayer(proj, player);
        }
        for (const gProj of GlobalProjectile.RegisteredProjectiles) {
            gProj?.OnHitPlayer(proj, player);
        }
    }
    
    static ApplyShader(proj) {
        let value = null;
        if (this.isModType(proj.type)) {
            value = this.getModProjectile(proj.type)?.ApplyShader(proj);
        }
        return value;
    }
    
    static GetAlpha(proj, color) {
        let value = color;
        if (this.isModType(proj.type)) {
            value = this.getModProjectile(proj.type)?.GetAlpha(proj, value) ?? value;
        }
        for (const gProj of GlobalProjectile.RegisteredProjectiles) {
            value = gProj?.GetAlpha(proj, value) ?? value;
        }
        return value;
    }
    
    static PreDraw(proj, lightColor) {
        let value = true;
        if (this.isModType(proj.type)) {
            value = this.getModProjectile(proj.type)?.PreDraw(proj, lightColor) ?? value;
        }
        for (const gProj of GlobalProjectile.RegisteredProjectiles) {
            value = gProj?.PreDraw(proj) ?? value;
        }
        return value;
    }
    
    static PostDraw(proj, lightColor) {
        if (this.isModType(proj.type)) {
            this.getModProjectile(proj.type)?.PostDraw(proj, lightColor);
        }
        for (const gProj of GlobalProjectile.RegisteredProjectiles) {
            gProj.PostDraw(proj);
        }
    }
    
    static CanDamage(proj) {
        let value = true;
        if (this.isModType(proj.type)) {
            value = this.getModProjectile(proj.type)?.CanDamage(proj) ?? true;
        }
        if (GlobalProjectile.RegisteredProjectiles.some(gP => (gP?.CanDamage(proj) ?? true) === false)) {
            value = false;
        }
        return value;
    }
    
    static ModifyDamageHitbox(proj, hitbox) {
        if (this.isModType(proj.type)) {
            this.getModProjectile(proj.type)?.ModifyDamageHitbox(proj, hitbox);
        }
        for (const gProj of GlobalProjectile.RegisteredProjectiles) {
            gProj.ModifyDamageHitbox(proj, hitbox);
        }
        return hitbox;
    }
}