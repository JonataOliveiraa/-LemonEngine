import { SystemLoader } from './Loaders/SystemLoader.js';

export class ModSystem {
    constructor() {}
    
    OnModLoad() {}
    
    SetupContent() {}
    
    PostSetupContent() {}
    
    OnLocalizationsLoaded() {}
    
    AddRecipes() {}
    
    OnWorldLoad() {}
    
    OnWorldUnload() {}
    
    PreSaveAndQuit() {}
    
    OnStartDay() {}
    
    OnStartNight() {}
    
    SendMessage(player, message) {
        return true;
    }
    
    static SetTimeout(cb, delay) {
        SystemLoader.SetTimeout(cb, delay);
    }
    
    static SetInterval(cb, interval, stopCondition = null) {
        SystemLoader.SetInterval(cb, interval, stopCondition);
    }
    
    static register(system) {
        SystemLoader.RegisteredSystems.push(new system());
    }
    static getByName(name) { return SystemLoader.getByName(name); }
}