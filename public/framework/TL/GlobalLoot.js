import { Terraria } from './ModImports.js';
import { NPCLoader } from './Loaders/NPCLoader.js';

export class GlobalLoot {
    static Loots = [];
    
    itemDropDatabase = null;
    
    constructor(itemDropDatabase) {
        this.itemDropDatabase = itemDropDatabase;
    }
    
    Get = () => this.itemDropDatabase._globalEntries;
    Add = (entry) => this.itemDropDatabase.RegisterToGlobal(entry);
    
    Remove(entry) {
        this.itemDropDatabase._globalEntries.Remove(entry);
        return entry;
    }
    
    ModifyGlobalLoot() {
        
    }
    
    static register(loot) {
        this.Loots.push(loot);
    }
}