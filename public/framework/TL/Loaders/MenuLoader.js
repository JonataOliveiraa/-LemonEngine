import { Terraria } from './../ModImports.js';
import { ModTexture } from './../ModTexture.js';

export class MenuLoader {
    static Menus = [];
    static CurrentMenu = null;
    
    static oldLogo1 = null;
    static oldLogo2 = null;
    static oldLogo3 = null;
    static oldLogo4 = null;
    static oldSun = null;
    static oldMoon = null;
    
    static ChangeTextures() {
        const assets = Terraria.GameContent.TextureAssets;
        
        const logoTexture = new ModTexture('Textures/' + this.CurrentMenu.Logo);
        if (logoTexture?.exists) {
            this.oldLogo1 = assets.Logo;
            this.oldLogo2 = assets.Logo2;
            this.oldLogo3 = assets.Logo3;
            this.oldLogo4 = assets.Logo4;
            
            assets.Logo = logoTexture.asset.asset;
            assets.Logo2 = logoTexture.asset.asset;
            assets.Logo3 = logoTexture.asset.asset;
            assets.Logo4 = logoTexture.asset.asset;
        }
        
        const sunTexture = new ModTexture('Textures/' + this.CurrentMenu.SunTexture);
        if (sunTexture?.exists) {
            this.oldSun = assets.Sun;
            assets.Sun = sunTexture.asset.asset;
        }
        
        const moonTexture = new ModTexture('Textures/' + this.CurrentMenu.MoonTexture);
        if (moonTexture?.exists) {
            this.oldMoon = assets.Moon[0];
            assets.Moon[0] = moonTexture.asset.asset;
        }
    }
    
    static ResetTextures() {
        const assets = Terraria.GameContent.TextureAssets;
        
        if (this.oldLogo1) {
            assets.Logo = this.oldLogo1;
            assets.Logo2 = this.oldLogo2;
            assets.Logo3 = this.oldLogo3;
            assets.Logo4 = this.oldLogo4;
            
            this.oldLogo1 = this.oldLogo2 = this.oldLogo3 = this.oldLogo4 = null;
        }
        
        if (this.oldSun) {
            assets.Sun = this.oldSun;
            this.oldSun = null;
        }
        
        if (this.oldMoon) {
            assets.Moon[0] = this.oldMoon;
            this.oldMoon = null;
        }
    }
    
    static SetStaticDefaults() {
        for (const m of this.Menus) {
            m.SetStaticDefaults();
        }
    }
    
    static OnEnter() {
        this.CurrentMenu = this.ChooseMenu();
        if (this.CurrentMenu) {
            this.CurrentMenu.OnSelected();
            this.ChangeTextures();
        }
    }
    
    static OnLeave() {
        if (this.CurrentMenu) {
            this.CurrentMenu.OnDeselected();
            this.CurrentMenu = null;
        }
        this.ResetTextures();
    }
    
    static ChooseMenu() {
        const arr = this.Menus.length > 0 ? this.Menus.filter(m => m.IsAvailable()) : [];
        if (arr.length === 0) return null;
        let total = arr.reduce((a, b) => a + b.Weight, 0);
        let r = Math.random() * total;
        for (let o of arr) {
            if ((r -= o.Weight) <= 0) return o;
        }
        return null;
    }
    
    static Update() {
        if (!this.CurrentMenu) return;
        if (this.CurrentMenu.MoonTexture) {
            Terraria.Main.moonType = 0;
        }
        
        this.CurrentMenu.Update(Terraria.Main.menuMode === 0);
    }
}