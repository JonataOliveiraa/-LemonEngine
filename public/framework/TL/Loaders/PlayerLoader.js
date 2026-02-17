import { Terraria } from './../ModImports.js';

export class PlayerLoader {
    static RegisteredPlayers = [];
    
    static getByName(name) { return this.RegisteredPlayers.find(p => p.constructor.name === name); }
    
    static OnEnterWorld(player) {
        for (const modPlayer of this.RegisteredPlayers) {
            modPlayer?.OnEnterWorld(player);
        }
    }
    
    static OnRespawn(player) {
        for (const modPlayer of this.RegisteredPlayers) {
            modPlayer?.OnRespawn(player);
        }
    }
    
    static ModifyMaxStats(player) {
        let cumulativeHealth = 0;
        let cumulativeMana = 0;
        
        for (const modPlayer of this.RegisteredPlayers) {
            modPlayer?.ModifyMaxStats(player);
            cumulativeHealth += modPlayer?.CumulativeHealth ?? 0;
            cumulativeMana += modPlayer?.CumulativeMana ?? 0;
        }
        
        if (cumulativeHealth !== 0) player.statLifeMax2 = Math.max(1, player.statLifeMax2 + cumulativeHealth);
        if (cumulativeMana !== 0) player.statManaMax2 = Math.max(1, player.statManaMax2 + cumulativeMana);
    }
    
    static ResetEffects(player) {
        for (const modPlayer of this.RegisteredPlayers) {
            modPlayer.ResetEffects(player);
        }
    }
    
    static UpdateDead(player) {
        for (const modPlayer of this.RegisteredPlayers) {
            modPlayer.UpdateDead(player);
        }
    }
    
    static UpdateBadLifeRegen(player) {
        for (const modPlayer of this.RegisteredPlayers) {
            modPlayer?.UpdateBadLifeRegen(player);
        }
    }
    
    static UpdateLifeRegen(player) {
        for (const modPlayer of this.RegisteredPlayers) {
            modPlayer?.UpdateLifeRegen(player);
        }
    }
    
    static UpdateManaRegen(player) {
        for (const modPlayer of this.RegisteredPlayers) {
            modPlayer?.UpdateManaRegen(player);
        }
    }
    
    static PreUpdate(player) {
        for (const modPlayer of this.RegisteredPlayers) {
            modPlayer?.PreUpdate(player);
        }
    }
    
    static PostUpdate(player) {
        for (const modPlayer of this.RegisteredPlayers) {
            modPlayer?.PostUpdate(player);
        }
    }
    
    static PreUpdateBuffs(player) {
        for (const modPlayer of this.RegisteredPlayers) {
            modPlayer?.PreUpdateBuffs(player);
        }
    }
    
    static PostUpdateBuffs(player) {
        for (const modPlayer of this.RegisteredPlayers) {
            modPlayer?.PostUpdateBuffs(player);
        }
    }
    
    static PreItemCheck(player) {
        if (this.RegisteredPlayers.some(mP => (mP?.PreItemCheck(player) ?? true) === false)) {
            return false;
        }
        return true;
    }
    
    static PostItemCheck(player) {
        for (const modPlayer of this.RegisteredPlayers) {
            modPlayer?.PostItemCheck(player);
        }
    }
    
    static CanUseItem(player, item) {
        let value = true;
        if (this.RegisteredPlayers.some(mP => (mP?.CanUseItem(player, item) ?? true) === false)) {
            value = false;
        }
        return value;
    }
    
    static CanAutoReuseItem(player, item) {
        let value = true;
        if (this.RegisteredPlayers.some(mP => (mP?.CanAutoReuseItem(player, item) ?? true) === false)) {
            value = false;
        }
        return value;
    }
    
    static ConsumeItem(player, item) {
        let value = true;
        if (this.RegisteredPlayers.some(mP => (mP?.ConsumeItem(player, item) ?? true) === false)) {
            value = false;
        }
        return value;
    }
    
    static OnConsumeItem(player, item) {
        for (const modPlayer of this.RegisteredPlayers) {
            modPlayer?.OnConsumeItem(player, item);
        }
    }
    
    static UseTimeMultiplier(player, item) {
        if (item.IsAir) return 1.0;
        let multiplier = 1.0;
        for (const modPlayer of this.RegisteredPlayers) {
            multiplier *= modPlayer?.UseTimeMultiplier(player, item) ?? 1.0;
        }
        return multiplier;
    }
    
    static UseAnimationMultiplier(player, item) {
        if (item.IsAir) return 1.0;
        let multiplier = 1.0;
        for (const modPlayer of this.RegisteredPlayers) {
            multiplier *= modPlayer?.UseAnimationMultiplier(player, item) ?? 1.0;
        }
        return multiplier;
    }
    
    static UseSpeedMultiplier(item, player) {
        if (item.IsAir) return 1.0;
        let multiplier = 1.0;
        for (const modPlayer of this.RegisteredPlayers) {
            multiplier *= modPlayer?.UseSpeedMultiplier(player, item) ?? 1.0;
        }
        return multiplier;
    }
    
    static UseItem(player, item) {
        if (this.RegisteredPlayers.some(gP => (gP?.UseItem(player, item) ?? true) === false)) {
            return false;
        }
        return true;
    }
    
    static UseAnimation(player, item) {
        for (const modPlayer of this.RegisteredPlayers) {
            modPlayer?.UseAnimation(player, item);
        }
    }
    
    static GetHealLife(player, item, healValue = 0) {
        let newValue = healValue;
        for (const modPlayer of this.RegisteredPlayers) {
            newValue = modPlayer?.GetHealLife(player, item, newValue) ?? newValue;
        }
        return newValue;
    }
    
    static GetHealMana(item, player, healValue = 0) {let newValue = healValue;
        for (const modPlayer of this.RegisteredPlayers) {
            newValue = modPlayer?.GetHealMana(player, item, newValue) ?? newValue;
        }
        return newValue;
    }
    
    static OnConsumeMana(player, item, manaConsumed) {
        for (const modPlayer of this.RegisteredPlayers) {
            modPlayer?.OnConsumeMana(player, item, manaConsumed);
        }
    }
    
    static OnMissingMana(player, item, neededMana) {
        for (const modPlayer of this.RegisteredPlayers) {
            modPlayer?.OnMissingMana(player, item, neededMana);
        }
    }
    
    static ModifyManaCost(player, item, mana) {
        let newValue = mana;
        for (const modPlayer of this.RegisteredPlayers) {
            modPlayer?.ModifyManaCost(player, item, newValue);
            newValue = modPlayer?.ManaCost ?? newValue;
        }
        return newValue;
    }
    
    static ModifyWeaponDamage(player, item, damage) {
        let newValue = damage;
        for (const modPlayer of this.RegisteredPlayers) {
            modPlayer?.ModifyWeaponDamage(player, item, newValue);
            newValue = modPlayer?.WeaponDamage ?? newValue;
        }
        return newValue;
    }
    
    static ModifyWeaponKnockback(player, item, knockBack) {
        let newValue = knockBack;
        for (const modPlayer of this.RegisteredPlayers) {
            modPlayer?.ModifyWeaponKnockback(player, item, newValue);
            newValue = modPlayer?.WeaponKnockback ?? newValue;
        }
        return newValue;
    }
    
    static CanShoot(player, item) {
        if (this.RegisteredPlayers.some(mP => (mP?.CanShoot(player, item) ?? true) === false)) {
            return false;
        }
        return true;
    }
    
    static ModifyShootStats(player, stats) {
        for (const modPlayer of this.RegisteredPlayers) {
            modPlayer?.ModifyShootStats(player, stats);
        }
    }
    
    static Shoot(player, item, position, velocity, type, damage, knockBack) {
        if (this.RegisteredPlayers.some(mP => (mP?.Shoot(player, item, position, velocity, type, damage, knockBack) ?? true) === false)) {
            return false;
        }
        return true;
    }
    
    static OnHitNPC(player, item, npc, damageDone, knockBack) {
        for (const modPlayer of this.RegisteredPlayers) {
            modPlayer?.OnHitNPC(player, item, npc, damageDone, knockBack);
        }
    }
    
    static OnHitNPCWithProj(player, npc, projectile) {
        for (const modPlayer of this.RegisteredPlayers) {
            modPlayer?.OnHitNPCWithProj(player, npc, projectile);
        }
    }
    
    static UpdateInventory(player) {
        for (const modPlayer of this.RegisteredPlayers) {
            modPlayer?.UpdateInventory(player);
        }
    }
    
    static UpdateEquips(player, item) {
        for (const modPlayer of this.RegisteredPlayers) {
            modPlayer?.UpdateEquips(player);
        }
    }
    
    static UpdateAccessory(player, item, vanity, hideVisual) {
        for (const modPlayer of this.RegisteredPlayers) {
            modPlayer?.UpdateAccessory(player, item, vanity, hideVisual);
        }
    }
    
    static UpdateDyes(player) {
        for (const modPlayer of this.RegisteredPlayers) {
            modPlayer?.UpdateDyes(player);
        }
    }
    
    static IsArmorSet(player, head, body, legs) {
        if (this.RegisteredPlayers.some(mP => (mP?.IsArmorSet(player, head, body, legs) ?? false) === true)) {
            return true;
        }
        return false;
    }
    
    static UpdateArmorSet(player, item) {
        for (const modPlayer of this.RegisteredPlayers) {
            modPlayer?.UpdateArmorSet(player, item);
        }
    }
    
    static IsVanitySet(player, head, body, legs) {
        if (this.RegisteredPlayers.some(mP => (mP?.IsVanitySet(player, head, body, legs) ?? false) === true)) {
            return true;
        }
        return false;
    }
    
    static UpdateVanitySet(player, item) {
        for (const modPlayer of this.RegisteredPlayers) {
            modPlayer?.UpdateVanitySet(player, item);
        }
    }
    
    static UpdateCamera(player) {
        for (const modPlayer of this.RegisteredPlayers) {
            modPlayer?.UpdateCamera(player);
        }
    }
    
    static UpdateMovement(player) {
        for (const modPlayer of this.RegisteredPlayers) {
            modPlayer?.UpdateMovement(player);
        }
    }
    
    static WingMovement(player, item) {
        for (const modPlayer of this.RegisteredPlayers) {
            modPlayer?.WingMovement(player, item);
        }
    }
    
    static CanPickup(player, item) {
        if (this.RegisteredPlayers.some(mP => (mP?.CanPickup(player, item) ?? true) === false)) {
            return false;
        }
        return true;
    }
    
    static OnPickup(player, item) {
        for (const modPlayer of this.RegisteredPlayers) {
            modPlayer?.OnPickup(player, item);
        }
    }
    
    static ExtractinatorUse(player, item, extractType, extractinatorBlockType) {
        if (this.RegisteredPlayers.some(mP => (mP?.ExtractinatorUse(player, item, extractType, extractinatorBlockType) ?? true) === false)) {
            return false;
        }
        return true;
    }
    
    static OnCraft(player, recipe) {
        for (const modPlayer of this.RegisteredPlayers) {
            modPlayer?.OnCraft(player, recipe);
        }
    }
    
    static PreModifyLuck(player, luck) {
        if (this.RegisteredPlayers.some(mP => (mP?.PreModifyLuck(player, luck) ?? true) === false)) {
            return false;
        }
        return true;
    }
    
    static ModifyLuck(player, luck) {
        for (const modPlayer of this.RegisteredPlayers) {
            modPlayer?.ModifyLuck(player, luck);
            luck = modPlayer?.Luck ?? luck;
        }
        player.luck = luck;
    }
    
    static ImmuneTo(player, damageSource, cooldownCounter, dodgeable) {
        if (this.RegisteredPlayers.some(mP => (mP?.ImmuneTo(player, damageSource, cooldownCounter, dodgeable) ?? false) === true)) {
            return true;
        }
        return false;
    }
    
    static FreeDodge(self, damageSource, damage, hitDirection, pvp, quiet, crit, cooldownCounter, dodgeable) {
        if (this.RegisteredPlayers.some(mP => (mP?.FreeDodge(self, damageSource, damage, hitDirection, pvp, quiet, crit, cooldownCounter, dodgeable) ?? false) === true)) {
            return true;
        }
        return false;
    }
    
    static ModifyHurt(player, damage, hitDirection, quiet, crit, dodgeable) {
        let modifiers = { damage, hitDirection, quiet, crit, dodgeable };
        for (const modPlayer of this.RegisteredPlayers) {
            modPlayer?.ModifyHurt(player, modifiers);
        }
        return modifiers;
    }
    
    static OnHurt(player, damageSource, damage, hitDirection, pvp, quiet, crit, cooldownCounter, dodgeable) {
        for (const modPlayer of this.RegisteredPlayers) {
            modPlayer?.OnHurt(player, damageSource, damage, hitDirection, pvp, quiet, crit, cooldownCounter, dodgeable);
        }
    }
    
    static PostHurt(player, damageSource, damage, hitDirection, pvp, quiet, crit, cooldownCounter, dodgeable) {
        for (const modPlayer of this.RegisteredPlayers) {
            modPlayer?.PostHurt(player, damageSource, damage, hitDirection, pvp, quiet, crit, cooldownCounter, dodgeable);
        }
    }
    
    static PreKill(player, damageSource, damage, hitDirection, pvp) {
        for (const modPlayer of this.RegisteredPlayers) {
            modPlayer?.PreKill(player, damageSource, damage, hitDirection, pvp);
        }
    }
    
    static Kill(player, damageSource, damage, hitDirection, pvp) {
        for (const modPlayer of this.RegisteredPlayers) {
            modPlayer?.Kill(player, damageSource, damage, hitDirection, pvp);
        }
    }
    
    static GetDyeTraderReward(player, dyeTrader, rewardItems) {
        for (const modPlayer of this.RegisteredPlayers) {
            modPlayer?.GetDyeTraderReward(player, dyeTrader, rewardItems);
        }
    }
    
    static AnglerQuestReward(player, angler, questItemType) {
        if (this.RegisteredPlayers.some(mP => (mP?.AnglerQuestReward(player, angler, questItemType) ?? true) === false)) {
            return false;
        }
        return true;
    }
    
    static CanSellItem(player, npc, shopInventory, item) {
        if (this.RegisteredPlayers.some(mP => (mP?.CanSellItem(player, npc, shopInventory, item) ?? true) === false)) {
            return false;
        }
        return true;
    }
    
    static PostSellItem(player, npc, shopInventory, item) {
        for (const modPlayer of this.RegisteredPlayers) {
            modPlayer?.PostSellItem(player, npc, shopInventory, item);
        }
    }
    
    static SetupStartingItems(player, mediumCoreDeath = false) {
        for (const modPlayer of this.RegisteredPlayers) {
            modPlayer?.SetupStartingItems(player, mediumCoreDeath);
        }
    }
    
    static CanCatchNPC(player, npc, item) {
        if (this.RegisteredPlayers.some(mP => (mP?.CanCatchNPC(player, npc, item) ?? true) === false)) {
            return false;
        }
        return true;
    }
    
    static OnCatchNPC(player, npc, item, failed) {
        for (const modPlayer of this.RegisteredPlayers) {
            modPlayer?.OnCatchNPC(player, npc, item, failed);
        }
    }
    
    static CanReleaseNPC(player, npcType, item, x, y) {
        if (this.RegisteredPlayers.some(mP => (mP?.CanReleaseNPC(player, npcType, item, x, y) ?? true) === false)) {
            return false;
        }
        return true;
    }
    
    static OnReleaseNPC(player, npc) {
        for (const modPlayer of this.RegisteredPlayers) {
            modPlayer?.OnReleaseNPC(player, npc);
        }
    }
    
    static ModifyCaughtFish(player, itemType) {
        let newType = itemType;
        for (const modPlayer of this.RegisteredPlayers) {
            newType = modPlayer?.ModifyCaughtFish(player, newType) ?? newType;
        }
        return newType ?? itemType;
    }
    
    static SendMessage(player, message) {
        if (this.RegisteredPlayers.some(gP => (gP?.SendMessage(player, message) ?? true) === false)) {
            return false;
        }
        return true;
    }
}