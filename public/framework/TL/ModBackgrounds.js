import { BackgroundLoaders } from './Loaders/BackgroundLoaders.js';

export class ModUndergroundBackground {
    Slot = -1;
    
    constructor() {
        
    }
    
    FillTextureArray(textureSlots) {
        
    }
    
    static register(bg) {
        BackgroundLoaders.RegisterUndergroundBG(bg);
    }
    static getByName(name) {
        return BackgroundLoaders.getByName(name, false);
    }
    static getBackgroundSlot(name) {
        return BackgroundLoaders.GetBackgroundSlot(name);
    }
}

export class ModSurfaceBackground {
    Slot = -1;
    
    DrawOffsetY = 0;
    ScaleMultiplier = 1.0;
    
    constructor() {
        
    }
    
    ModifyFarFades() {
        
    }
    
    ChooseFarTexture() {
        return -1;
    }
    
    ChooseMiddleTexture() {
        return -1;
    }
    
    ChooseCloseTexture() {
        return -1;
    }
    
    PreDrawCloseBackground(spriteBatch) {
        return true;
    }
    
    ModifyCloseTexture(drawInfo) {
        return drawInfo;
    }
    
    static register(bg) {
        BackgroundLoaders.RegisterSurfaceBG(bg);
    }
    static getByName(name) {
        return BackgroundLoaders.getByName(name);
    }
    static getBackgroundSlot(name) {
        return BackgroundLoaders.GetBackgroundSlot(name);
    }
}