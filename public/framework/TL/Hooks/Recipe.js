import { Terraria } from './../ModImports.js';

export class RecipeHooks {
    static initialized = false;
    
    static HookList = {
        FindRecipes: true
    };
    
    static Initialize() {
        if (this.initialized) return;
        
        if (this.HookList.FindRecipes) {
            Terraria.Recipe['void FindRecipes(bool canDelayCheck)'
            ].hook((original, canDelayCheck) => {
                if (!canDelayCheck) RecipeHooks.CycleRecipes();
                original(canDelayCheck);
            });
        }
    }
    
    static offset = 0;
    static lastAvailableCount = null;
    static startIndex = 2500;
    static canCycleRecipes = true;
    
    static CycleRecipes() {
        if (!this.canCycleRecipes) return;
        
        const available = Terraria.Main.availableRecipe;
        const numAvailable = Terraria.Main.numAvailableRecipes || 0;
        
        if (numAvailable === this.lastAvailableCount) return;
        this.lastAvailableCount = numAvailable;
        
        const recipes = Terraria.Main.recipe;
        const total = recipes.length;
        if (total <= Terraria.Recipe.maxRecipes || this.startIndex >= total) return;
        
        const isAvailable = {};
        for (let i = 0; i < numAvailable; i++) {
            const idx = available[i];
            isAvailable[idx] = true;
        }
        
        const unavailable = [];
        for (let i = this.startIndex; i < total; i++) {
            if (!isAvailable[i]) unavailable.push(i);
        }
        
        if (unavailable.length <= 1) return;
        const pool = new Array(unavailable.length);
        for (let i = 0; i < unavailable.length; i++) {
            pool[i] = recipes[unavailable[i]];
        }
        
        this.offset = (this.offset + 1) % pool.length;
        const clone = recipes.cloneResized(total);
        
        for (let i = 0; i < total; i++) {
            clone[i] = recipes[i];
        }
        
        let src = this.offset;
        for (let k = 0; k < unavailable.length; k++) {
            clone[unavailable[k]] = pool[src++];
            if (src >= pool.length) src = 0;
        }
        
        Terraria.Main.recipe = clone;
    }
}