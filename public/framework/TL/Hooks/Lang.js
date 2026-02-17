import { Terraria } from './../ModImports.js';
import { ModLocalization } from './../ModLocalization.js';
import { TileLoader } from './../Loaders/TileLoader.js';
import { ItemLoader } from './../Loaders/ItemLoader.js';
import { BuffLoader } from './../Loaders/BuffLoader.js';
import { NPCLoader } from './../Loaders/NPCLoader.js';
import { ProjectileLoader } from './../Loaders/ProjectileLoader.js';

export class LangHooks {
    static initialized = false;
    
    // Here you can disable the hooks that won't be used in your mod to avoid unnecessary processing
    static HookList = {
        GetItemName: true,
        GetItemTooltip: true,
        GetBuffName: true,
        GetBuffDescription: true,
        GetProjectileName: true,
        GetNPCName: true,
        AnglerQuestChat: true
    };
    
    static Initialize() {
        if (this.initialized) return;
        
        if (this.HookList.GetItemName) {
            Terraria.Lang.GetItemName.hook((original, id) => {
                const type = Terraria.ID.ItemID.FromNetId(id);
                if (!ItemLoader.isModType(type)) {
                    return original(id);
                }
                return ModLocalization.getTranslationItemName(type);
            });
        }
        
        if (this.HookList.GetBuffName) {
            Terraria.Lang.GetBuffName.hook((original, id) => {
                if (!BuffLoader.isModType(id)) {
                    return original(id);
                }
                return ModLocalization.getTranslationBuffName(id);
            });
        }
        
        if (this.HookList.GetBuffDescription) {
            Terraria.Lang.GetBuffDescription.hook((original, id) => {
                if (!BuffLoader.isModType(id)) {
                    return original(id);
                }
                return ModLocalization.getTranslationBuffDescription(id);
            });
        }
        
        if (this.HookList.GetProjectileName) {
            Terraria.Lang.GetProjectileName.hook((original, type) => {
                if (!ProjectileLoader.isModType(type)) {
                    return original(type);
                }
                return ModLocalization.getTranslationProjectileName(type);
            });
        }
        
        if (this.HookList.GetNPCName) {
            Terraria.Lang.GetNPCName.hook((original, type) => {
                if (!NPCLoader.isModType(type)) {
                    return original(type);
                }
                return ModLocalization.getTranslationNPCName(type);
            });
            
            Terraria.Lang.GetNPCNameValue.hook((original, type) => {
                if (!NPCLoader.isModType(type)) {
                    return original(type);
                }
                return ModLocalization.Translate(`NPCName.${NPCLoader.getModNPC(type)?.constructor?.name ?? ''}`);
            });
        }
        
        if (this.HookList.AnglerQuestChat) {
            Terraria.Lang.AnglerQuestChat.hook((original, turnIn) => {
                const questItemType = Terraria.Main.anglerQuestItemNetIDs[Terraria.Main.anglerQuest];
                if (ItemLoader.isModType(questItemType)) {
                    if (!turnIn && !Terraria.Main.anglerQuestFinished) {
                        Terraria.Main.npcChatCornerItem = questItemType;
                        return ModLocalization.getTranslationAnglerQuest(questItemType);
                    }
                }
                return original(turnIn);
            });
        }
        
        this.initialized = true;
    }
}