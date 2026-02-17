import { NPCHooks } from './Hooks/NPC.js';
import { LangHooks } from './Hooks/Lang.js';
import { MainHooks } from './Hooks/Main.js';
import { ItemHooks } from './Hooks/Item.js';
import { PlayerHooks } from './Hooks/Player.js';
import { ProjectileHooks } from './Hooks/Projectile.js';
import { WiringHooks } from './Hooks/Wiring.js';
import { WorldGenHooks } from './Hooks/WorldGen.js';
import { GameContentHooks } from './Hooks/GameContent.js';
import { CloudHooks } from './Hooks/Cloud.js';
import { RecipeHooks } from './Hooks/Recipe.js';
import { ChatHooks } from './Hooks/Chat.js';

import { GlobalHooks } from './GlobalHooks.js';

export class ModHooks {
    static initialized = false;
    
    static Initialize() {
        if (this.initialized) return;
        
        const IntPtr = new NativeClass('System', 'IntPtr');
        const is32bits = IntPtr.Size === 4;
        
        if (is32bits) {
            tl.log('\n32-bit device detected: the mod will not work correctly.');
        }
        
        MainHooks.Initialize(!is32bits);
        LangHooks.Initialize();
        NPCHooks.Initialize();
        ProjectileHooks.Initialize();
        ItemHooks.Initialize();
        PlayerHooks.Initialize();
        WiringHooks.Initialize();
        WorldGenHooks.Initialize();
        GameContentHooks.Initialize();
        CloudHooks.Initialize();
        RecipeHooks.Initialize();
        ChatHooks.Initialize();
        
        for (const hook of GlobalHooks.RegisteredHooks) {
            if (!hook.initialized) {
                hook.Initialize();
                hook.initialized = true;
            }
        }
        
        this.initialized = true;
    }
    
    // Initialize temp data
    static OnWorldLoad() {
        GlobalHooks.RegisteredHooks.forEach(h => h.OnWorldLoad());
    }
    
    // Clear temp data
    static OnWorldUnload() {
        ProjectileHooks.OnWorldUnload();
        PlayerHooks.OnWorldUnload();
        NPCHooks.OnWorldUnload();
        
        GlobalHooks.RegisteredHooks.forEach(h => h.OnWorldUnload());
    }
}