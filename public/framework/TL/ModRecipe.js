import { Terraria } from './ModImports.js';
import { ItemLoader } from './Loaders/ItemLoader.js';

const maxRequirements = 14;

export class ModRecipe {
    static MAX_VANILLA_RECIPES = 2940;
    
    constructor() {
        this.numIngredients = 0;
        this.numTiles = 0;
    }
    
    SetResult(itemId, stack = 1) {
        Terraria.Recipe.currentRecipe.createItem['void SetDefaults(int Type)'](itemId);
        Terraria.Recipe.currentRecipe.createItem.stack = Math.max(1, Math.min(stack, Terraria.Recipe.currentRecipe.createItem?.maxStack ?? 9999));
        return this;
    }
    
    SetProperty(propertyName, value) {
        Terraria.Recipe.currentRecipe[propertyName] = value;
        return this;
    }
    
    AddIngredient(itemId, stack = 1) {
        if (this.numIngredients === maxRequirements) {
            tl.log(`Failed to add ingredient <type: ${itemId}, stack: ${stack}>. The maximum number of ingredients has been reached (${maxRequirements}).`);
            return this;
        }
        // Add 'material' tooltip
        if (ItemLoader.isModType(itemId)) {
            ItemLoader.getModItem(itemId).Item.material = true;
            Terraria.ID.ItemID.Sets.IsAMaterial[itemId] = true;
        }
        Terraria.Recipe.currentRecipe.requiredItem[this.numIngredients]['void SetDefaults(int Type)'](itemId);
        Terraria.Recipe.currentRecipe.requiredItem[this.numIngredients].stack = Math.max(1, Math.min(stack, Terraria.Recipe.currentRecipe.requiredItem[this.numIngredients]?.maxStack ?? 9999));
        this.numIngredients++;
        return this;
    }
    
    AddTile(tileId) {
        if (this.numTiles === maxRequirements) {
            tl.log(`Failed to add tile <type: ${tileId}>. The maximum number of tiles has been reached (${maxRequirements}).`);
            return this;
        }
        Terraria.Recipe.currentRecipe.requiredTile[this.numTiles] = tileId;
        this.numTiles++;
        return this;
    }
    
    Register() {
        const nextSlot = ModRecipe.NextSlot();
        
        if (nextSlot >= 3000) {
            ModRecipe.skipRecipeLoop = true;
            
            const index1 = nextSlot;
            Terraria.Main.recipe = Terraria.Main.recipe.cloneResized(index1 + 1);
            Terraria.Main.recipe[index1] = Terraria.Recipe.currentRecipe;
            
            const index2 = Terraria.Main.availableRecipe.length;
            Terraria.Main.availableRecipe = Terraria.Main.availableRecipe.cloneResized(index2 + 1);
            
            const index3 = Terraria.Main.availableRecipeY.length;
            Terraria.Main.availableRecipeY = Terraria.Main.availableRecipeY.cloneResized(index3 + 1);
        }
        
        Terraria.Recipe.CreateRequiredItemQuickLookups();
        Terraria.Recipe.UpdateMaterialFieldForAllRecipes();
        Terraria.Recipe.UpdateWhichItemsAreMaterials();
        Terraria.Recipe.UpdateWhichItemsAreCrafted();
        Terraria.Recipe.AddRecipe();
        
        return new ModRecipe();
    }
    
    static NextSlot() {
        if (!ModRecipe.skipRecipeLoop) {
            for (let i = this.MAX_VANILLA_RECIPES; i < 3000; i++) {
                if (Terraria.Main.recipe[i]?.createItem?.type == 0)
                    return i;
            }
        }
        return Terraria.Main.recipe.length;
    }
}