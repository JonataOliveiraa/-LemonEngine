import { Terraria, Modules } from './../ModImports.js';
import { MenuLoader } from './MenuLoader.js';
import { BiomeLoader } from './BiomeLoader.js';
import { SceneEffectPriority } from './../SceneEffectPriority.js';

const { Color } = Modules;

function getTextureArray(style) {
    let array = new Array(4);
    
    switch (style) {
        case 0:
            array[0] = 1;
            array[1] = 2;
            array[2] = 4;
            array[3] = 3;
            break;
        case 1:
            if (Terraria.Main.iceBackStyle == 0) {
                array[1] = 33;
                array[3] = 32;
                array[0] = 40;
                array[2] = 34;
            } else if (Terraria.Main.iceBackStyle == 1) {
                array[1] = 118;
                array[3] = 117;
                array[0] = 160;
                array[2] = 161;
            } else if (Terraria.Main.iceBackStyle == 2) {
                array[1] = 165;
                array[3] = 167;
                array[0] = 164;
                array[2] = 166;
            } else {
                array[1] = 120;
                array[3] = 119;
                array[0] = 162;
                array[2] = 163;
            }
            break;
        case 2:
            array[0] = 62;
            array[1] = 63;
            array[2] = 64;
            array[3] = 65;
            break;
        case 3:
            array[0] = 66;
            array[1] = 67;
            array[2] = 68;
            array[3] = 69;
            break;
        case 4:
            array[0] = 70;
            array[1] = 71;
            array[2] = 68;
            array[3] = 72;
            break;
        case 5:
            array[0] = 73;
            array[1] = 74;
            array[2] = 75;
            array[3] = 76;
            break;
        case 6:
            array[0] = 77;
            array[1] = 78;
            array[2] = 79;
            array[3] = 80;
            break;
        case 7:
            array[0] = 77;
            array[1] = 81;
            array[2] = 79;
            array[3] = 82;
            break;
        case 8:
            array[0] = 83;
            array[1] = 84;
            array[2] = 85;
            array[3] = 86;
            break;
        case 9:
            array[0] = 83;
            array[1] = 87;
            array[2] = 88;
            array[3] = 89;
            break;
        case 10:
            array[0] = 121;
            array[1] = 122;
            array[2] = 123;
            array[3] = 124;
            break;
        case 11:
            if (Terraria.Main.jungleBackStyle == 0) {
                array[0] = 153;
                array[1] = 147;
                array[2] = 148;
                array[3] = 149;
            } else {
                array[0] = 146;
                array[1] = 154;
                array[2] = 155;
                array[3] = 156;
            }
            break;
        case 12:
        case 13:
        case 14:
            array[0] = 66;
            array[1] = 67;
            array[2] = 68;
            switch (style) {
                case 12:
                    array[3] = 193 + Terraria.Main.worldID % 4;
                    break;
                case 13:
                    array[3] = 188 + Terraria.Main.worldID % 5;
                    break;
                case 14:
                    array[3] = 197 + Terraria.Main.worldID % 3;
                    break;
            }
            break;
        case 15:
        case 16:
        case 17:
            array[0] = 40;
            array[1] = 33;
            array[2] = 34;
            switch (style) {
                case 15:
                    array[3] = 200;
                    break;
                case 16:
                    array[3] = 201 + Terraria.Main.worldID % 2;
                    break;
                case 17:
                    array[3] = 203 + Terraria.Main.worldID % 4;
                    break;
            }
            break;
        default: {
            switch (style) {
                case 18:
                    array[0] = 290;
                    array[1] = 291;
                    break;
                case 19:
                    array[0] = 292;
                    array[1] = 293;
                    break;
                case 20:
                    array[0] = 294;
                    array[1] = 295;
                    break;
                case 21:
                    array[0] = 296;
                    array[1] = 297;
                    break;
            }
            array[2] = -1;
            array[3] = -1;
            break;
        }
    }
    
    return array;
}

export class SceneEffectLoader {
    static AnySceneActive = false;
    static OldAnySceneActive = false;
    static CurrentScene = null;
    static CurrentSkyColor = null;
    static VanillaPriority = 0;
    
    static OldMapBGs = [];
    static OldRain = null;
    static OldDroplet = null;
    static OldWater1 = null;
    static OldWater2 = null;
    static OldWater3 = null;
    
    static oldUndergroundBgStyle = -1;
    static oldIceStyle = -1;
    static oldJungleStyle = -1;
    static oldBgTextures = new Array(4);
    static oldBgTextureIndexes = new Array(4);
    
    static FindPriorityScene() {
        if (this.CurrentScene?.IsActive)
            return this.CurrentScene;
        if (BiomeLoader.ActiveBiomes.length > 0)
            return BiomeLoader.ActiveBiomes?.reduce((a, b) => a.Priority >= b.Priority ? a : b);
        return null;
    }
    
    static Update() {
        this.CalculateVanillaPriority();
        this.OldScene = this.CurrentScene;
        this.CurrentScene = this.FindPriorityScene();
        this.OldAnySceneActive = this.AnySceneActive;
        
        if ((this.CurrentScene?.Priority ?? -1) >= this.VanillaPriority) {
            this.AnySceneActive = true;
        } else {
            this.AnySceneActive = false;
        }
        
        if (this.OldAnySceneActive !== this.AnySceneActive) {
            this.ResetTextures();
            if (this.AnySceneActive) {
                this.ChangeTextures();
            }
        }
    }
    
    static UpdateUndergroundScene() {
        if (!this.AnySceneActive) return;
        if (this.CurrentScene.UndergroundBackground) {
            if (this.oldUndergroundBgStyle !== Terraria.Main.undergroundBackground
            || (this.oldUndergroundBgStyle === 1 && this.oldIceStyle !== Terraria.Main.iceBackStyle)
            || (this.oldUndergroundBgStyle === 11 && this.oldJungleStyle !== Terraria.Main.jungleBackStyle)
            ) {
                this.oldUndergroundBgStyle = Terraria.Main.undergroundBackground;
                if (this.oldUndergroundBgStyle === 1) {
                    this.oldIceStyle = Terraria.Main.iceBackStyle;
                }
                if (this.oldUndergroundBgStyle === 11) {
                    this.oldJungleStyle = Terraria.Main.jungleBackStyle;
                }
                
                for (let i = 0; i < 4; i++) {
                    if (this.oldBgTextureIndexes[i] !== -1)
                        Terraria.GameContent.TextureAssets.Background[this.oldBgTextureIndexes[i]] = this.oldBgTextures[i];
                }
                
                const arr = getTextureArray(Terraria.Main.undergroundBackground);
                
                for (let i = 0; i < 4; i++) {
                    this.oldBgTextureIndexes[i] = arr[i];
                    this.oldBgTextures[i] = Terraria.GameContent.TextureAssets.Background[arr[i]];
                }
                
                this.CurrentScene.UndergroundBackground.FillTextureArray(arr);
                
                for (let i = 0; i < 4; i++) {
                    if (this.oldBgTextureIndexes[i] === arr[i]) continue;
                    Terraria.GameContent.TextureAssets.Background[this.oldBgTextureIndexes[i]] = Terraria.GameContent.TextureAssets.Background[arr[i]];
                }
            }
        }
    }
    
    static ChangeTextures() {
        if (this.CurrentScene.MapBackground) {
            for (let i = 0; i < 42; i++) {
                this.OldMapBGs.push(Terraria.GameContent.TextureAssets.MapBGs[i]);
                Terraria.GameContent.TextureAssets.MapBGs[i] = Terraria.GameContent.TextureAssets.MapBGs[this.CurrentScene.MapBackground];
            }
        }
        
        if (this.CurrentScene.Rain) {
            this.OldRain = Terraria.GameContent.TextureAssets.Rain;
            Terraria.GameContent.TextureAssets.Rain = this.CurrentScene.Rain;
        }
        
        if (this.CurrentScene.Droplet) {
            this.OldDroplet = Terraria.GameContent.TextureAssets.Gore[706];
            Terraria.GameContent.TextureAssets.Gore[706] = this.CurrentScene.Droplet;
        }
        
        if (this.CurrentScene.WaterTexture2D) {
            const slot = this.CurrentScene.WaterStyle;
            const s = 0;
            
            this.OldWater1 = Terraria.GameContent.Liquid.LiquidRenderer.Instance._liquidTextures[s];
            Terraria.GameContent.Liquid.LiquidRenderer.Instance._liquidTextures[s] = this.CurrentScene.WaterTexture2D;//Terraria.GameContent.Liquid.LiquidRenderer.Instance._liquidTextures[slot];
            
            this.OldWater2 = Terraria.GameContent.TextureAssets.Liquid[s];
            Terraria.GameContent.TextureAssets.Liquid[s] = Terraria.GameContent.TextureAssets.Liquid[slot];
            
            this.OldWater3 = Terraria.GameContent.TextureAssets.LiquidSlope[s];
            Terraria.GameContent.TextureAssets.LiquidSlope[s] = Terraria.GameContent.TextureAssets.LiquidSlope[slot];
        }
    }
    
    static ResetTextures() {
        if (this.OldMapBGs.length > 0) {
            for (let i = 0; i < 42; i++) {
                Terraria.GameContent.TextureAssets.MapBGs[i] = this.OldMapBGs[i];
            }
            this.OldMapBGs = [];
        }
        
        if (this.OldRain) {
            Terraria.GameContent.TextureAssets.Rain = this.OldRain;
            this.OldRain = null;
        }
        
        if (this.OldDroplet) {
            Terraria.GameContent.TextureAssets.Gore[706] = this.OldDroplet;
            this.OldDroplet = null;
        }
        
        if (this.OldWater1) {
            const s = 0;
            Terraria.GameContent.Liquid.LiquidRenderer.Instance._liquidTextures[s] = this.OldWater1;
            Terraria.GameContent.TextureAssets.Liquid[s] = this.OldWater2;
            Terraria.GameContent.TextureAssets.LiquidSlope[s] = this.OldWater3;
            this.OldWater1 = null;
            this.OldWater2 = null;
            this.OldWater3 = null;
        }
        
        let flag = false;
        for (let i = 0; i < 4; i++) {
            if (this.oldBgTextureIndexes[i] !== -1) {
                flag = true;
                Terraria.GameContent.TextureAssets.Background[this.oldBgTextureIndexes[i]] = this.oldBgTextures[i];
            }
        }
        if (flag) {
            this.oldUndergroundBgStyle = -1;
            this.oldIceStyle = -1;
            this.oldJungleStyle = -1;
            this.oldBgTextures = new Array(4);
            this.oldBgTextureIndexes = new Array(4);
        }
    }
    
    static CalculateVanillaPriority() {
        const player = Terraria.Main.player[Terraria.Main.myPlayer];
        
        if (player.ZoneTowerSolar || player.ZoneTowerVortex || player.ZoneTowerNebula || player.ZoneTowerStardust)
            this.VanillaPriority = 4;
        else if (player.ZoneDungeon || player.ZoneLihzhardTemple || player.ZoneGlowshroom || player.ZoneCorrupt || player.ZoneCrimson || player.ZoneShimmer)
            this.VanillaPriority = 3;
        else if (player.ZoneMeteor || player.ZoneJungle || player.ZoneGraveyard || player.ZoneSnow)
            this.VanillaPriority = 2;
        else if (player.ZoneHallow || player.ZoneBeach || player.ZoneDesert)
            this.VanillaPriority = 1;
        else
            this.VanillaPriority = 0;
    }
    
    static GetLightFactor() {
        const t = Terraria.Main.time, n = 0.08;
        if (!Terraria.Main.dayTime) return n;
        return t < 27000 ? n + (t/27000)*(1-n) :
        t < 40500 ? 1 : 1 - ((t-40500)/16200)*(1-n);
    }
    
    static ModifySunLightColor(skyColor) {
        if (!this._skyColor) this._skyColor = skyColor;
        
        const base = this.CurrentScene?.GetBiomeBaseColor();
        const light = this.GetLightFactor();
        
        const target = base && this.AnySceneActive
        ? Color.Lerp(skyColor, Color.Multiply(base, light), 0.7) : skyColor;
        
        const t = this.AnySceneActive ? 0.1 : 0.05;
        
        this._skyColor = Color.Lerp(this._skyColor, target, t);
        this._skyColor.A = skyColor.A;
        
        if (MenuLoader.CurrentMenu) MenuLoader.CurrentMenu.ModifySkyColor(this._skyColor);
        Terraria.Main.ColorOfTheSkies = this._skyColor;
    }
    
    static SpecialVisuals(player, skyColor) {
        this.ModifySunLightColor(skyColor);
        if (this.AnySceneActive) {
            this.CurrentScene.SpecialVisuals(player, Terraria.Main.ColorOfTheSkies);
        }
    }
    
    static PreSaveAndQuit() {
        this.ResetTextures();
        this.AnySceneActive = false;
        this.OldAnySceneActive = false;
        this.CurrentScene = null;
        this.VanillaPriority = 0;
    }
}