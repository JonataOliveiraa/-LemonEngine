import { Terraria } from './ModImports.js';
import { ModItem } from './ModItem.js';
import { ModBuff } from './ModBuff.js';
import { ModNPC } from './ModNPC.js';
import { ModProjectile } from './ModProjectile.js';

export class ModLocalization {
    static Translations = {};
    static CurrentLanguage = null;
    
    static CultureNames = new Set([
    'de-DE', 'en-US', 'es-ES',
    'fr-FR', 'it-IT', 'pl-PL',
    'pt-BR', 'ru-RU', 'zh-Hans'
    ]);
    
    static get ActiveCultureName() {
        return Terraria.Localization.Language.ActiveCulture?.Name ?? 'en-US';
    }
    
    static path(key) {
        return './Localization/{0}.json'.replace('{0}', key ?? this.ActiveCultureName);
    }
    
    static UpdateTranslations() {
        const activeCultureName = this.ActiveCultureName;
        if (activeCultureName !== this.CurrentLanguage) {
            this.CurrentLanguage = activeCultureName;
            const path = this.path();
            if (tl.file.exists(path)) this.Translations = JSON.parse(tl.file.read(path));
            else this.Translations = JSON.parse(tl.file.read(this.path('en-US')));
        }
    }
    
    static Translate(key, update = true) {
        if (update) this.UpdateTranslations();
        return key.split('.').reduce((o, k) => (o && o[k] !== undefined) ? o[k] : key, this.Translations);
    }
    
    static getTranslationItemName(type) {
        this.UpdateTranslations();
        const item = ModItem.getModItem(type);
        if (!item) return this.empty();
        if (item.IsTileItem) {
            return this.getTranslationMapEntry(item.TileName);
        }
        const entryName = item.constructor.name;
        item.DisplayName = this.Translations?.ItemName[entryName] ?? 'ItemName.' + entryName;
        item.ModifyDisplayName();
        return this.getTranslation(item.DisplayName);
    }
    
    static getTranslationItemTooltip(type) {
        this.UpdateTranslations();
        const item = ModItem.getModItem(type);
        const entryName = item.IsTileItem ? item.TileName + 'Item' : item.constructor.name;
        const tooltip = Terraria.UI.ItemTooltip.new();
        const lines = [];
        if (item.Item.wingSlot != undefined) {
            lines.push(Terraria.Localization.Language.GetText('CommonItemTooltip.FlightAndSlowfall')?.Value);
        }
        if (Terraria.ID.ItemID.Sets.BossBag[item.Type]) {
            lines.push(Terraria.Localization.Language.GetText('CommonItemTooltip.RightClickToOpen')?.Value);
        }
        if (this.Translations?.ItemTooltip[entryName]) {
            lines.push(this.Translations.ItemTooltip[entryName]);
        }
        item.TooltipLines = lines;
        item.ModifyTooltipLines();
        tooltip._text = this.getTranslation(item.TooltipLines.join('\n'));
        return tooltip;
    }
    
    static getTranslationAnglerQuest(type) {
        this.UpdateTranslations();
        const item = ModItem.getModItem(type);
        return this.Translations?.AnglerQuest[item.constructor.name] ?? 'AnglerQuest.' + item.constructor.name;
    }
    
    static getTranslationArmorSetBonus(entryName) {
        return this.Translations?.ArmorSetBonus[entryName] ?? 'ArmorSetBonus.' + entryName;
    }
    
    static getTranslationProjectileName(type) {
        this.UpdateTranslations();
        const proj = ModProjectile.getModProjectile(type);
        if (!proj) return this.empty();
        const entryName = proj.constructor.name;
        return this.getTranslation(this.Translations?.ProjectileName[entryName] ?? 'ProjectileName.' + entryName);
    }
    
    static getTranslationNPCName(type) {
        this.UpdateTranslations();
        const npc = ModNPC.getModNPC(type);
        if (!npc) return this.empty();
        const entryName = npc.constructor.name;
        npc.DisplayName = this.Translations?.NPCName[entryName] ?? 'NPCName.' + entryName;
        npc.ModifyDisplayName();
        return this.getTranslation(npc.DisplayName);
    }
    
    static getTranslationBuffName(type) {
        this.UpdateTranslations();
        const buff = ModBuff.getModBuff(type);
        if (!buff) return this.empty();
        const entryName = buff.constructor.name;
        buff.DisplayName = this.Translations?.BuffName[entryName] ?? 'BuffName.' + entryName;
        buff.ModifyDisplayName();
        return buff.DisplayName;
    }
    
    static getTranslationBuffDescription(type) {
        this.UpdateTranslations();
        const buff = ModBuff.getModBuff(type);
        if (!buff) return this.empty();
        const entryName = buff.constructor.name;
        buff.Description = this.Translations?.BuffDescription[entryName] ?? 'BuffDescription.' + entryName;
        buff.ModifyDescription();
        return buff.Description;
    }
    
    static getTranslation(key) {
        return Terraria.Localization.Language.GetText(key);
    }
    
    static exists(key) {
        return Terraria.Localization.Language['bool Exists(string key)'](key);
    }
    
    static empty() {
        return Terraria.Localization.LocalizedText.Empty;
    }
    
    static getLanguageID() {
        return Terraria.Localization.Language.ActiveCulture.CultureInfo.cultureID;
    }
}