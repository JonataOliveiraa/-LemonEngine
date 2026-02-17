import React from 'react';
import { snippet } from "@codemirror/autocomplete";
import { EntityType } from './types';
import { 
  Sword, Wand2, Crosshair, Shield, Pickaxe, Ghost, Users, Target,
  Zap, Compass, Palette, Cloud, Globe, Layout, Layers, Box, FileCode,
  Hammer, Anchor, Disc, FlaskConical, Fish, Skull, Shirt, Footprints, HardHat,
  Gem, Scroll, PlayCircle, Bot
} from 'lucide-react';

export const APP_NAME = "ExMod Creator";
export const VERSION = "1.9.0-PRO";

export interface TLMember {
  label: string;
  type: 'property' | 'method' | 'constant' | 'class';
  info: string;
  detail?: string; 
  returnType?: string; 
  insertText?: string; 
}

export interface TLClassDef {
  inherits?: string; 
  members: Record<string, TLMember>; 
}

// 1. Árvore de Definições para o 'this.'
export const TL_DEFINITIONS: Record<string, TLClassDef> = {
  'ModItem': {
    members: {
      'Item': { label: 'Item', type: 'property', info: 'Objeto Item interno.', returnType: 'TerrariaItem', detail: 'Terraria.Item' },
      'SetDefaults': { label: 'SetDefaults', type: 'method', info: 'Defina status aqui.', insertText: 'SetDefaults() {\n\t${}\n}' },
      'OnHitNPC': { label: 'OnHitNPC', type: 'method', info: 'Ao acertar inimigo.', insertText: 'OnHitNPC(player, target, hit, damageDone) {\n\t${}\n}' },
      'Shoot': { label: 'Shoot', type: 'method', info: 'Logica de tiro.', insertText: 'Shoot(player, source, position, velocity, type, damage, knockback) {\n\treturn true;\n}' },
      'AddRecipes': { label: 'AddRecipes', type: 'method', info: 'Receitas de craft.', insertText: 'AddRecipes() {\n\t${}\n}' }
    }
  },
  'ModNPC': {
    members: {
      'NPC': { label: 'NPC', type: 'property', info: 'Objeto NPC interno.', returnType: 'TerrariaNPC', detail: 'Terraria.NPC' },
      'SetDefaults': { label: 'SetDefaults', type: 'method', info: 'Status do NPC.', insertText: 'SetDefaults() {\n\t${}\n}' },
      'AI': { label: 'AI', type: 'method', info: 'Loop principal.', insertText: 'AI() {\n\t${}\n}' },
      'OnKill': { label: 'OnKill', type: 'method', info: 'Ao morrer.', insertText: 'OnKill() {\n\t${}\n}' }
    }
  },
  'ModProjectile': {
    members: {
      'Projectile': { label: 'Projectile', type: 'property', info: 'Objeto Projectile interno.', returnType: 'TerrariaProjectile', detail: 'Terraria.Projectile' },
      'SetDefaults': { label: 'SetDefaults', type: 'method', info: 'Status do Projétil.', insertText: 'SetDefaults() {\n\t${}\n}' },
      'AI': { label: 'AI', type: 'method', info: 'Loop principal.', insertText: 'AI() {\n\t${}\n}' }
    }
  },
  'TerrariaItem': {
    members: {
      'damage': { label: 'damage', type: 'property', info: 'Dano base.', detail: 'int' },
      'width': { label: 'width', type: 'property', info: 'Largura.', detail: 'int' },
      'height': { label: 'height', type: 'property', info: 'Altura.', detail: 'int' },
      'useTime': { label: 'useTime', type: 'property', info: 'Tempo de uso.', detail: 'int' },
      'useAnimation': { label: 'useAnimation', type: 'property', info: 'Duração animação.', detail: 'int' },
      'knockBack': { label: 'knockBack', type: 'property', info: 'Empurrão.', detail: 'float' },
      'value': { label: 'value', type: 'property', info: 'Valor em moedas.', detail: 'int' },
      'rare': { label: 'rare', type: 'property', info: 'Raridade.', detail: 'int' },
      'autoReuse': { label: 'autoReuse', type: 'property', info: 'Auto-clique?', detail: 'bool' },
      'shoot': { label: 'shoot', type: 'property', info: 'ID do Projétil.', detail: 'int' },
      'shootSpeed': { label: 'shootSpeed', type: 'property', info: 'Velocidade do tiro.', detail: 'float' }
    }
  },
  'TerrariaNPC': {
    members: {
      'lifeMax': { label: 'lifeMax', type: 'property', info: 'Vida Máxima.', detail: 'int' },
      'damage': { label: 'damage', type: 'property', info: 'Dano contato.', detail: 'int' },
      'defense': { label: 'defense', type: 'property', info: 'Defesa.', detail: 'int' },
      'width': { label: 'width', type: 'property', info: 'Largura.', detail: 'int' },
      'height': { label: 'height', type: 'property', info: 'Altura.', detail: 'int' },
      'aiStyle': { label: 'aiStyle', type: 'property', info: 'Estilo de IA.', detail: 'int' },
      'HitSound': { label: 'HitSound', type: 'property', info: 'Som de dano.', detail: 'SoundStyle' },
      'DeathSound': { label: 'DeathSound', type: 'property', info: 'Som de morte.', detail: 'SoundStyle' }
    }
  },
  'TerrariaProjectile': {
    members: {
      'timeLeft': { label: 'timeLeft', type: 'property', info: 'Tempo de vida.', detail: 'int' },
      'velocity': { label: 'velocity', type: 'property', info: 'Vetor de movimento.', returnType: 'Vector2', detail: 'Vector2' },
      'position': { label: 'position', type: 'property', info: 'Posição no mundo.', returnType: 'Vector2', detail: 'Vector2' },
      'friendly': { label: 'friendly', type: 'property', info: 'Acerta inimigos?', detail: 'bool' },
      'hostile': { label: 'hostile', type: 'property', info: 'Acerta jogadores?', detail: 'bool' },
      'tileCollide': { label: 'tileCollide', type: 'property', info: 'Colide com blocos?', detail: 'bool' },
      'penetrate': { label: 'penetrate', type: 'property', info: 'Perfuração.', detail: 'int' }
    }
  },
  'Vector2': {
    members: {
      'X': { label: 'X', type: 'property', info: 'Coordenada X', detail: 'float' },
      'Y': { label: 'Y', type: 'property', info: 'Coordenada Y', detail: 'float' },
      'Normalize': { label: 'Normalize', type: 'method', info: 'Normalizar vetor.', detail: 'void' },
      'Length': { label: 'Length', type: 'method', info: 'Magnitude.', detail: 'float' }
    }
  }
};

export const AUTOCOMPLETE_DATA = {
    classMembers: [],
    itemHooks: [],
    npcHooks: [],
    projectileHooks: [],
    tlUtils: []
};

export const TL_MODULES: Record<string, string> = {
    'ModItem': 'TL/ModItem.js',
    'ModNPC': 'TL/ModNPC.js',
    'ModProjectile': 'TL/ModProjectile.js',
    'ModBuff': 'TL/ModBuff.js',
    'ModTile': 'TL/ModTile.js',
    'ModSystem': 'TL/ModSystem.js',
    'ModBiome': 'TL/ModBiome.js',
    'Vector2': 'TL/Utils/Vector2.js',
    'MathHelper': 'TL/Utils/MathHelper.js',
    'Main': 'TL/Main.js'
};

export const SNIPPETS = [
  { label: "if", detail: "if statement", type: "keyword", template: snippet("if (${condition}) {\n\t${}\n}") },
  { label: "for", detail: "for loop", type: "keyword", template: snippet("for (let i = 0; i < ${count}; i++) {\n\t${}\n}") },
  { label: "v2", detail: "New Vector2", type: "function", template: snippet("Vector2.new(${x}, ${y})") }
];

export interface TemplateMetadata {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  requiresTexture: boolean; 
  getCode: (name: string) => string;
}

// --- GENERADORES DE CÓDIGO (BASE) ---

const getBlankCode = (name: string, type: string) => 
`import { Mod${type} } from '../../TL/Mod${type}.js';

export class ${name} extends Mod${type} {
    constructor() {
        super();
    }
}`;

const getTexturePath = (name: string, folder: string) => `this.Texture = '${folder}/' + this.constructor.name;`;

// --- TEMPLATES ESPECÍFICOS (ITEMS) ---

const TPL_ACCESSORY = (name: string) => `import { Terraria } from './../../../TL/ModImports.js';
import { ModItem } from './../../../TL/ModItem.js';

export class ${name} extends ModItem {
    constructor() {
        super();
        ${getTexturePath(name, 'Items/Accessories')}
    }
    
    SetDefaults() {
        this.Item.accessory = true;
        this.Item.value = Terraria.Item.sellPrice(0, 1, 0, 0);
        this.Item.rare = Terraria.ID.ItemRarityID.Blue;
    }
    
    UpdateAccessory(item, player, vanity, hideVisual) {
        if (vanity) return;
        // player.moveSpeed += 0.1;
    }
}`;

const TPL_AMMO = (name: string) => `import { Terraria } from './../../../TL/ModImports.js';
import { ModItem } from './../../../TL/ModItem.js';
import { ModProjectile } from './../../../TL/ModProjectile.js';

export class ${name} extends ModItem {
    constructor() {
        super();
        ${getTexturePath(name, 'Items/Ammo')}
    }
    
    SetDefaults() {
        this.Item.damage = 12;
        this.Item.ranged = true;
        this.Item.maxStack = 9999;
        this.Item.consumable = true;
        this.Item.knockBack = 1.0;
        this.Item.value = Terraria.Item.sellPrice(0, 0, 10, 0);
        this.Item.rare = Terraria.ID.ItemRarityID.Green;
        this.Item.shoot = ModProjectile.getTypeByName('${name}Projectile'); // Create the projectile!
        this.Item.shootSpeed = 4.5;
        this.Item.ammo = Terraria.ID.AmmoID.Bullet;
    }
}`;

const TPL_ARMOR_HEAD = (name: string) => `import { Terraria } from './../../../TL/ModImports.js';
import { ModItem } from './../../../TL/ModItem.js';
import { ModLocalization } from './../../../TL/ModLocalization.js';

export class ${name} extends ModItem {
    constructor() {
        super();
        ${getTexturePath(name, 'Items/Armor')}
    }
    
    SetDefaults() {
        this.Item.defense = 5;
        this.Item.value = Terraria.Item.sellPrice(0, 1, 0, 0);
        this.Item.rare = Terraria.ID.ItemRarityID.Green;
    }
    
    PostSetupContent() {
        // Set Bonus text
        this.SetBonusText = "Increases something by 10%";
    }
    
    IsArmorSet(head, body, legs) {
        // return body.type === ModItem.getTypeByName('BodyName') && legs.type === ModItem.getTypeByName('LegsName');
        return false;
    }
    
    UpdateArmorSet(item, player) {
        player.setBonus = this.SetBonusText;
        // player.moveSpeed += 0.1;
    }
}`;

const TPL_ARMOR_BODY = (name: string) => `import { Terraria } from './../../../TL/ModImports.js';
import { ModItem } from './../../../TL/ModItem.js';

export class ${name} extends ModItem {
    constructor() {
        super();
        ${getTexturePath(name, 'Items/Armor')}
    }
    
    SetDefaults() {
        this.Item.defense = 6;
        this.Item.value = Terraria.Item.sellPrice(0, 2, 0, 0);
        this.Item.rare = Terraria.ID.ItemRarityID.Green;
    }
}`;

const TPL_ARMOR_LEGS = (name: string) => `import { Terraria } from './../../../TL/ModImports.js';
import { ModItem } from './../../../TL/ModItem.js';

export class ${name} extends ModItem {
    constructor() {
        super();
        ${getTexturePath(name, 'Items/Armor')}
    }
    
    SetDefaults() {
        this.Item.defense = 5;
        this.Item.value = Terraria.Item.sellPrice(0, 1, 0, 0);
        this.Item.rare = Terraria.ID.ItemRarityID.Green;
    }
}`;

const TPL_FISHING_ROD = (name: string) => `import { Terraria } from './../../../TL/ModImports.js';
import { ModItem } from './../../../TL/ModItem.js';
import { ModProjectile } from './../../../TL/ModProjectile.js';

export class ${name} extends ModItem {
    constructor() {
        super();
        ${getTexturePath(name, 'Items/Tools')}
    }
    
    SetStaticDefaults() {
        Terraria.ID.ItemID.Sets.CanFishInLava[this.Type] = false;
    }
    
    SetDefaults() {
        this.CloneDefaults(Terraria.ID.ItemID.WoodFishingPole);
        this.Item.fishingPole = 20;
        this.Item.shootSpeed = 10;
        this.Item.shoot = ModProjectile.getTypeByName('${name}Bobber'); // Create the bobber projectile!
    }
    
    HoldItem(item, player) {
        player.accFishingLine = true;
    }
}`;

const TPL_CONSUMABLE = (name: string) => `import { Terraria } from './../../../TL/ModImports.js';
import { ModItem } from './../../../TL/ModItem.js';
import { ModBuff } from './../../../TL/ModBuff.js';

export class ${name} extends ModItem {
    constructor() {
        super();
        ${getTexturePath(name, 'Items/Consumables')}
    }
    
    SetDefaults() {
        this.Item.useStyle = Terraria.ID.ItemUseStyleID.DrinkLiquid;
        this.Item.useAnimation = 15;
        this.Item.useTime = 15;
        this.Item.useTurn = true;
        this.Item.UseSound = Terraria.ID.SoundID.Item3;
        this.Item.maxStack = 9999;
        this.Item.consumable = true;
        this.Item.rare = Terraria.ID.ItemRarityID.Blue;
        this.Item.value = Terraria.Item.sellPrice(0, 0, 10, 0);
        
        // this.Item.buffType = ModBuff.getTypeByName('MyBuff');
        // this.Item.buffTime = 3600;
    }
}`;

const TPL_QUEST_FISH = (name: string) => `import { Terraria } from './../../../TL/ModImports.js';
import { ModItem } from './../../../TL/ModItem.js';

export class ${name} extends ModItem {
    constructor() {
        super();
        ${getTexturePath(name, 'Items/Quests')}
    }
    
    SetDefaults() {
        this.DefaultToQuestFish();
    }
    
    IsQuestFish() {
        return true;
    }
}`;

const TPL_DRILL = (name: string) => `import { Terraria } from './../../../TL/ModImports.js';
import { ModItem } from './../../../TL/ModItem.js';
import { ModProjectile } from './../../../TL/ModProjectile.js';

export class ${name} extends ModItem {
    constructor() {
        super();
        ${getTexturePath(name, 'Items/Tools')}
    }
    
    SetStaticDefaults() {
        Terraria.ID.ItemID.Sets.IsDrill[this.Type] = true;
    }
    
    SetDefaults() {
        this.Item.damage = 10;
        this.Item.melee = true;
        this.Item.shoot = ModProjectile.getTypeByName('${name}Projectile'); // Create the projectile!
        this.Item.shootSpeed = 32;
        this.Item.useStyle = 5;
        this.Item.useTime = 4;
        this.Item.useAnimation = 15;
        this.Item.noMelee = true;
        this.Item.noUseGraphic = true;
        this.Item.channel = true;
        this.Item.pick = 50;
        this.Item.tileBoost = 1;
        this.Item.value = 1000;
        this.Item.rare = Terraria.ID.ItemRarityID.Blue;
        this.Item.UseSound = Terraria.ID.SoundID.Item23;
    }
}`;

const TPL_PICKAXE = (name: string) => `import { Terraria } from './../../../TL/ModImports.js';
import { ModItem } from './../../../TL/ModItem.js';

export class ${name} extends ModItem {
    constructor() {
        super();
        ${getTexturePath(name, 'Items/Tools')}
    }
    
    SetDefaults() {
        this.Item.melee = true;
        this.Item.pick = 55;
        this.Item.damage = 8;
        this.Item.knockBack = 2;
        this.Item.useTime = 15;
        this.Item.useAnimation = 15;
        this.Item.useStyle = 1;
        this.Item.autoReuse = true;
        this.Item.value = 1000;
        this.Item.rare = Terraria.ID.ItemRarityID.Blue;
        this.Item.UseSound = Terraria.ID.SoundID.Item1;
    }
}`;

const TPL_HAMAXE = (name: string) => `import { Terraria } from './../../../TL/ModImports.js';
import { ModItem } from './../../../TL/ModItem.js';

export class ${name} extends ModItem {
    constructor() {
        super();
        ${getTexturePath(name, 'Items/Tools')}
    }
    
    SetDefaults() {
        this.Item.melee = true;
        this.Item.axe = 10;
        this.Item.hammer = 50;
        this.Item.damage = 12;
        this.Item.knockBack = 4;
        this.Item.useTime = 20;
        this.Item.useAnimation = 20;
        this.Item.useStyle = 1;
        this.Item.autoReuse = true;
        this.Item.value = 1000;
        this.Item.rare = Terraria.ID.ItemRarityID.Blue;
        this.Item.UseSound = Terraria.ID.SoundID.Item1;
    }
}`;

const TPL_MELEE = (name: string) => `import { Terraria } from './../../../TL/ModImports.js';
import { ModItem } from './../../../TL/ModItem.js';

export class ${name} extends ModItem {
    constructor() {
        super();
        ${getTexturePath(name, 'Items/Weapons/Melee')}
    }
    
    SetDefaults() {
        this.Item.melee = true;
        this.SetWeaponValues(25, 6, 4); // Damage, Knockback, Crit
        this.SetDefaultWeaponStyle(20, true); // UseTime, AutoReuse
        
        this.Item.value = Terraria.Item.sellPrice(0, 1, 0, 0);
        this.Item.rare = Terraria.ID.ItemRarityID.Green;
        this.Item.UseSound = Terraria.ID.SoundID.Item1;
    }
}`;

const TPL_GUN = (name: string) => `import { Terraria } from './../../../TL/ModImports.js';
import { ModItem } from './../../../TL/ModItem.js';

export class ${name} extends ModItem {
    constructor() {
        super();
        ${getTexturePath(name, 'Items/Weapons/Ranged')}
    }
    
    SetDefaults() {
        this.Item.ranged = true;
        this.Item.shoot = Terraria.ID.ProjectileID.PurificationPowder;
        this.Item.shootSpeed = 10;
        this.Item.useAmmo = Terraria.ID.AmmoID.Bullet;
        
        this.SetWeaponValues(20, 2, 4);
        this.SetDefaultWeaponStyle(20, true);
        
        this.Item.value = Terraria.Item.sellPrice(0, 1, 0, 0);
        this.Item.rare = Terraria.ID.ItemRarityID.Green;
        this.Item.UseSound = Terraria.ID.SoundID.Item41;
    }

    HoldoutOffset(item, player) {
        return { X: -10, Y: 0 };
    }
}`;

const TPL_MAGIC = (name: string) => `import { Terraria } from './../../../TL/ModImports.js';
import { ModItem } from './../../../TL/ModItem.js';
import { ModProjectile } from './../../../TL/ModProjectile.js';

export class ${name} extends ModItem {
    constructor() {
        super();
        ${getTexturePath(name, 'Items/Weapons/Magic')}
    }
    
    SetDefaults() {
        this.Item.magic = true;
        this.Item.mana = 10;
        this.Item.shoot = ModProjectile.getTypeByName('${name}Projectile');
        this.Item.shootSpeed = 12;
        
        this.SetWeaponValues(30, 4, 4);
        this.SetDefaultWeaponStyle(25, true);
        
        this.Item.rare = Terraria.ID.ItemRarityID.Green;
        this.Item.value = Terraria.Item.sellPrice(0, 2, 0, 0);
        this.Item.UseSound = Terraria.ID.SoundID.Item43;
    }
}`;

const TPL_SUMMON = (name: string) => `import { Terraria } from './../../../TL/ModImports.js';
import { ModBuff } from './../../../TL/ModBuff.js';
import { ModItem } from './../../../TL/ModItem.js';
import { ModProjectile } from './../../../TL/ModProjectile.js';

const NewProjectile = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, Vector2 position, Vector2 velocity, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2)'];

export class ${name} extends ModItem {
    constructor() {
        super();
        ${getTexturePath(name, 'Items/Weapons/Summon')}
    }
    
    SetStaticDefaults() {
        Terraria.ID.ItemID.Sets.GamepadWholeScreenUseRange[this.Type] = true;
        Terraria.ID.ItemID.Sets.LockOnIgnoresCollision[this.Type] = true;
        Terraria.ID.ItemID.Sets.StaffMinionSlotsRequired[this.Type] = 1;
    }
    
    SetDefaults() {
        this.Item.damage = 15;
        this.Item.knockBack = 3;
        this.Item.mana = 10;
        this.Item.width = 32;
        this.Item.height = 32;
        this.Item.useTime = 36;
        this.Item.useAnimation = 36;
        this.Item.useStyle = Terraria.ID.ItemUseStyleID.Swing;
        this.Item.value = Terraria.Item.sellPrice(0, 10, 0, 0);
        this.Item.rare = Terraria.ID.ItemRarityID.Blue;
        this.Item.UseSound = Terraria.ID.SoundID.Item44;
        
        this.Item.noMelee = true;
        this.Item.summon = true;
        this.Item.buffType = ModBuff.getTypeByName('${name}Buff');
        this.Item.shoot = ModProjectile.getTypeByName('${name}Minion');
    }
    
    ModifyShootStats(item, player, stats) {
        stats.position = Terraria.Main.MouseWorld;
    }
    
    Shoot(item, player, position, velocity, type, damage, knockBack) {
        player.AddBuff(this.Item.buffType, 2, true, false);
        
        const projIndex = NewProjectile(
            player.GetProjectileSource_Item(item),
            position, velocity,
            type, damage, knockBack,
            player.whoAmI, 0, 0, 0
        );
        const proj = Terraria.Main.projectile[projIndex];
        proj.originalDamage = item.damage;
        
        return false;
    }
}`;

const TPL_WHIP_ITEM = (name: string) => `import { Terraria } from './../../../TL/ModImports.js';
import { ModItem } from './../../../TL/ModItem.js';
import { ModProjectile } from './../../../TL/ModProjectile.js';

export class ${name} extends ModItem {
    constructor() {
        super();
        ${getTexturePath(name, 'Items/Weapons/Summon')}
    }
    
    SetDefaults() {
        this.DefaultToWhip(ModProjectile.getTypeByName('${name}Projectile'), 20, 2, 4);
        this.Item.rare = Terraria.ID.ItemRarityID.Green;
        this.Item.channel = true;
    }
}`;

// --- TEMPLATES NPC ---

const TPL_BOSS = (name: string) => `import { Terraria, Modules } from './../../TL/ModImports.js';
import { ModNPC } from './../../TL/ModNPC.js';
import { ModLocalization } from './../../TL/ModLocalization.js';

const { Vector2 } = Modules;

export class ${name} extends ModNPC {
    constructor() {
        super();
        ${getTexturePath(name, 'NPCs/Boss')}
    }
    
    SetStaticDefaults() {
        Terraria.Main.npcFrameCount[this.Type] = 3;
        Terraria.ID.NPCID.Sets.MPAllowedEnemies[this.Type] = true;
        this.BestiaryRarityStars = 5;
    }
    
    SetDefaults() {
        this.NPC.width = 100;
        this.NPC.height = 100;
        this.NPC.aiStyle = -1; // Custom AI
        this.NPC.damage = 40;
        this.NPC.defense = 15;
        this.NPC.lifeMax = 2500;
        this.NPC.knockBackResist = 0.0;
        this.NPC.noGravity = true;
        this.NPC.noTileCollide = true;
        this.NPC.boss = true;
        this.NPC.HitSound = Terraria.ID.SoundID.NPCHit1;
        this.NPC.DeathSound = Terraria.ID.SoundID.NPCDeath1;
    }

    AI(npc) {
        if (npc.target < 0 || npc.target == 255 || !Terraria.Main.player[npc.target].active) {
            npc.TargetClosest(true);
        }
        // AI Logic Here
    }
}`;

const TPL_TOWN_NPC = (name: string) => `import { Terraria } from './../../TL/ModImports.js';
import { ModNPC } from './../../TL/ModNPC.js';

export class ${name} extends ModNPC {
    constructor() {
        super();
        ${getTexturePath(name, 'NPCs/Town')}
    }
    
    SetStaticDefaults() {
        Terraria.Main.npcFrameCount[this.Type] = 25;
        Terraria.ID.NPCID.Sets.AttackFrameCount[this.Type] = 4;
        Terraria.ID.NPCID.Sets.AttackType[this.Type] = 0;
        Terraria.ID.NPCID.Sets.AttackTime[this.Type] = 90;
        Terraria.ID.NPCID.Sets.AttackAverageChance[this.Type] = 30;
    }
    
    SetDefaults() {
        this.NPC.townNPC = true;
        this.NPC.friendly = true;
        this.NPC.width = 18;
        this.NPC.height = 40;
        this.NPC.aiStyle = 7;
        this.NPC.damage = 10;
        this.NPC.defense = 15;
        this.NPC.lifeMax = 250;
        this.NPC.HitSound = Terraria.ID.SoundID.NPCHit1;
        this.NPC.DeathSound = Terraria.ID.SoundID.NPCDeath1;
        this.AnimationType = Terraria.ID.NPCID.Guide;
    }

    SetNPCNameList() {
        return ['Bob', 'Dave', 'Jerry'];
    }

    GetChat(npc) {
        return "Hello world!";
    }
}`;

const TPL_SLIME = (name: string) => `import { Terraria, Modules } from './../../TL/ModImports.js';
import { ModNPC } from './../../TL/ModNPC.js';

const { Color } = Modules;

export class ${name} extends ModNPC {
    constructor() {
        super();
        ${getTexturePath(name, 'NPCs')}
    }
    
    SetStaticDefaults() {
        Terraria.Main.npcFrameCount[this.Type] = 2;
    }
    
    SetDefaults() {
        this.NPC.aiStyle = Terraria.ID.NPCAIStyleID.Slime;
        this.NPC.damage = 10;
        this.NPC.defense = 2;
        this.NPC.lifeMax = 50;
        this.NPC.alpha = 50;
        this.NPC.color = Color.new(0, 255, 0, 100);
        this.NPC.HitSound = Terraria.ID.SoundID.NPCHit1;
        this.NPC.DeathSound = Terraria.ID.SoundID.NPCDeath1;
        this.AnimationType = Terraria.ID.NPCID.BlueSlime;
    }
}`;

// --- TEMPLATES PROJECTILE ---

const TPL_PROJ_NORMAL = (name: string) => `import { Terraria } from './../../TL/ModImports.js';
import { ModProjectile } from './../../TL/ModProjectile.js';

export class ${name} extends ModProjectile {
    constructor() {
        super();
        ${getTexturePath(name, 'Projectiles')}
    }
    
    SetDefaults() {
        this.Projectile.width = 16;
        this.Projectile.height = 16;
        this.Projectile.aiStyle = 1;
        this.Projectile.friendly = true;
        this.Projectile.hostile = false;
        this.Projectile.ranged = true;
        this.Projectile.penetrate = 1;
        this.Projectile.timeLeft = 600;
        this.Projectile.ignoreWater = false;
        this.Projectile.tileCollide = true;
    }
}`;

const TPL_PROJ_MINION = (name: string) => `import { Terraria } from './../../TL/ModImports.js';
import { ModProjectile } from './../../TL/ModProjectile.js';

export class ${name} extends ModProjectile {
    constructor() {
        super();
        ${getTexturePath(name, 'Projectiles')}
    }
    
    SetStaticDefaults() {
        Terraria.Main.projFrames[this.Type] = 1;
        Terraria.ID.ProjectileID.Sets.MinionTargettingFeature[this.Type] = true;
        Terraria.ID.ProjectileID.Sets.MinionSacrificable[this.Type] = true;
        Terraria.ID.ProjectileID.Sets.CultistIsResistantTo[this.Type] = true;
    }
    
    SetDefaults() {
        this.Projectile.width = 24;
        this.Projectile.height = 24;
        this.Projectile.tileCollide = false;
        this.Projectile.friendly = true;
        this.Projectile.minion = true;
        this.Projectile.minionSlots = 1;
        this.Projectile.penetrate = -1;
        this.Projectile.netImportant = true;
        this.Projectile.aiStyle = 66; // Standard Minion AI
    }
    
    AI(proj) {
        // Active check
        const player = Terraria.Main.player[proj.owner];
        if (player.dead || !player.active) {
            player.ClearBuff(ModBuff.getTypeByName('${name}Buff'));
        }
        if (player.HasBuff(ModBuff.getTypeByName('${name}Buff'))) {
            proj.timeLeft = 2;
        }
    }
}`;

const TPL_PROJ_WHIP = (name: string) => `import { Terraria, Microsoft, Modules, System } from './../../TL/ModImports.js';
import { ModProjectile } from './../../TL/ModProjectile.js';
import { ProjAI } from './../../TL/ProjAI.js';

const { SpriteEffects } = Microsoft.Xna.Framework.Graphics;
const { MathHelper, Vector2, Rectangle, Color } = Modules;
const GetLerpValue = Terraria.Utils['float GetLerpValue(float from, float to, float t, bool clamped)'];

export class ${name} extends ModProjectile {
    constructor() {
        super();
        ${getTexturePath(name, 'Projectiles')}
    }
    
    SetStaticDefaults() {
        Terraria.ID.ProjectileID.Sets.IsAWhip[this.Type] = true;
    }
    
    SetDefaults() {
        this.DefaultToWhip();
    }
    
    CachedValues = {
        Frame: Rectangle.new(0, 0, 10, 26), 
        Origin: Vector2.new(5, 8) 
    };
    
    PreDraw(proj) {
        const ai = new ProjAI(proj);
        let list = System.Collections.Generic.List.makeGeneric(Microsoft.Xna.Framework.Vector2).new();
        list['void .ctor()']();
        Terraria.Projectile.FillWhipControlPoints(proj, list);
        list = list.ToArray();
        
        let flip = proj.spriteDirection < 0 ? SpriteEffects.None : SpriteEffects.FlipHorizontally;
        let texture = Terraria.GameContent.TextureAssets.Projectile[this.Type].Value;
        
        let pos = list[0];
        const length = list.length - 1;
        
        for (let i = 0; i < length; i++) {
            let frame = this.CachedValues.Frame;
            let origin = this.CachedValues.Origin;
            let scale = 1;
            
            if (i === length - 1) {
                frame.Y = 74; frame.Height = 18;
                let t = ai[0] / (Terraria.Main.player[proj.owner].itemAnimationMax * proj.MaxUpdates);
                scale = MathHelper.Lerp(0.5, 1.5, GetLerpValue(0.1, 0.7, t, true) * GetLerpValue(0.9, 0.7, t, true));
            } else if (i > 10) { frame.Y = 58; frame.Height = 16; } 
            else if (i > 5) { frame.Y = 42; frame.Height = 16; } 
            else if (i > 0) { frame.Y = 26; frame.Height = 16; }
            
            let element = list[i];
            let diff = Vector2.Subtract(list[i + 1], element);
            let rotation = Vector2.ToRotation(diff) - MathHelper.PiOver2;
            let color = Terraria.Lighting['Color GetColor(Point tileCoords, Color originalColor)'](Vector2.ToTileCoordinates(element), Color.getByName('White'));
            
            Terraria.Main['void EntitySpriteDraw(Texture2D texture, Vector2 position, Rectangle sourceRectangle, Color color, float rotation, Vector2 origin, float scale, SpriteEffects effects, float worthless)'](
                texture, Vector2.Subtract(pos, Terraria.Main.screenPosition), frame, color, rotation, origin, scale, flip, 0
            );
            pos = Vector2.Add(pos, diff);
        }
        return false;
    }
}`;

// --- MAPA FINAL DE TEMPLATES ---

export const TEMPLATES_BY_CATEGORY: Record<string, TemplateMetadata[]> = {
  [EntityType.ITEM]: [
    { id: 'Accessory', label: 'Accessory', description: 'Stat booster.', icon: <Gem className="w-4 h-4" />, requiresTexture: true, getCode: TPL_ACCESSORY },
    { id: 'Ammo', label: 'Ammo', description: 'Bullet/Arrow.', icon: <Disc className="w-4 h-4" />, requiresTexture: true, getCode: TPL_AMMO },
    { id: 'ArmorHead', label: 'Helmet', description: 'Head armor.', icon: <HardHat className="w-4 h-4" />, requiresTexture: true, getCode: TPL_ARMOR_HEAD },
    { id: 'ArmorBody', label: 'Breastplate', description: 'Body armor.', icon: <Shirt className="w-4 h-4" />, requiresTexture: true, getCode: TPL_ARMOR_BODY },
    { id: 'ArmorLegs', label: 'Leggings', description: 'Leg armor.', icon: <Footprints className="w-4 h-4" />, requiresTexture: true, getCode: TPL_ARMOR_LEGS },
    { id: 'Consumable', label: 'Consumable', description: 'Potion/Food.', icon: <FlaskConical className="w-4 h-4" />, requiresTexture: true, getCode: TPL_CONSUMABLE },
    { id: 'Quest', label: 'Quest Item', description: 'Quest fish.', icon: <Scroll className="w-4 h-4" />, requiresTexture: true, getCode: TPL_QUEST_FISH },
    { id: 'Drill', label: 'Drill', description: 'Mining tool.', icon: <Disc className="w-4 h-4" />, requiresTexture: true, getCode: TPL_DRILL },
    { id: 'Pickaxe', label: 'Pickaxe', description: 'Mining tool.', icon: <Pickaxe className="w-4 h-4" />, requiresTexture: true, getCode: TPL_PICKAXE },
    { id: 'Hammer', label: 'Hammer/Axe', description: 'Wall/Tree tool.', icon: <Hammer className="w-4 h-4" />, requiresTexture: true, getCode: TPL_HAMAXE },
    { id: 'FishingRod', label: 'Fishing Rod', description: 'Fishing tool.', icon: <Fish className="w-4 h-4" />, requiresTexture: true, getCode: TPL_FISHING_ROD },
    { id: 'Melee', label: 'Melee Weapon', description: 'Sword.', icon: <Sword className="w-4 h-4" />, requiresTexture: true, getCode: TPL_MELEE },
    { id: 'Ranged', label: 'Gun', description: 'Ranged weapon.', icon: <Crosshair className="w-4 h-4" />, requiresTexture: true, getCode: TPL_GUN },
    { id: 'Magic', label: 'Magic Weapon', description: 'Magic weapon.', icon: <Wand2 className="w-4 h-4" />, requiresTexture: true, getCode: TPL_MAGIC },
    { id: 'Summon', label: 'Summon Staff', description: 'Minion spawner.', icon: <Bot className="w-4 h-4" />, requiresTexture: true, getCode: TPL_SUMMON },
    { id: 'Whip', label: 'Whip', description: 'Summoner whip.', icon: <PlayCircle className="w-4 h-4" />, requiresTexture: true, getCode: TPL_WHIP_ITEM },
    { id: 'Blank Item', label: 'Blank Item', description: 'Empty base.', icon: <Box className="w-4 h-4" />, requiresTexture: true, getCode: (name) => getBlankCode(name, 'Item') },
  ],
  [EntityType.NPC]: [
    { id: 'Boss', label: 'Boss', description: 'Big enemy.', icon: <Skull className="w-4 h-4" />, requiresTexture: true, getCode: TPL_BOSS },
    { id: 'Town', label: 'Town NPC', description: 'Friendly NPC.', icon: <Users className="w-4 h-4" />, requiresTexture: true, getCode: TPL_TOWN_NPC },
    { id: 'Slime', label: 'Slime', description: 'Simple enemy.', icon: <Ghost className="w-4 h-4" />, requiresTexture: true, getCode: TPL_SLIME },
    { id: 'Blank NPC', label: 'Blank NPC', description: 'Empty base.', icon: <Ghost className="w-4 h-4" />, requiresTexture: true, getCode: (name) => getBlankCode(name, 'NPC') },
  ],
  [EntityType.PROJECTILE]: [
    { id: 'Normal', label: 'Projectile', description: 'Basic projectile.', icon: <Target className="w-4 h-4" />, requiresTexture: true, getCode: TPL_PROJ_NORMAL },
    { id: 'Minion', label: 'Minion', description: 'Summon unit.', icon: <Bot className="w-4 h-4" />, requiresTexture: true, getCode: TPL_PROJ_MINION },
    { id: 'Whip', label: 'Whip', description: 'Whip render.', icon: <PlayCircle className="w-4 h-4" />, requiresTexture: true, getCode: TPL_PROJ_WHIP },
  ],
  [EntityType.BUFF]: [{ id: 'Blank', label: 'Blank Buff', description: 'Empty.', icon: <Zap className="w-4 h-4" />, requiresTexture: true, getCode: (name) => getBlankCode(name, 'Buff') }],
  [EntityType.BIOME]: [{ id: 'Blank', label: 'Blank Biome', description: 'Empty.', icon: <Compass className="w-4 h-4" />, requiresTexture: false, getCode: (name) => getBlankCode(name, 'Biome') }],
  [EntityType.BACKGROUND]: [{ id: 'Blank', label: 'Blank BG', description: 'Empty.', icon: <Palette className="w-4 h-4" />, requiresTexture: false, getCode: (name) => `export class ${name} {}` }],
  [EntityType.CLOUD]: [{ id: 'Blank', label: 'Blank Cloud', description: 'Empty.', icon: <Cloud className="w-4 h-4" />, requiresTexture: true, getCode: (name) => `export class ${name} {}` }],
  [EntityType.GLOBAL]: [{ id: 'Blank', label: 'Global', description: 'Empty.', icon: <Globe className="w-4 h-4" />, requiresTexture: false, getCode: (name) => `export class ${name} {}` }],
  [EntityType.MENU]: [{ id: 'Blank', label: 'Menu', description: 'Empty.', icon: <Layout className="w-4 h-4" />, requiresTexture: false, getCode: (name) => `export class ${name} {}` }],
  [EntityType.PET]: [{ id: 'Blank', label: 'Pet', description: 'Empty.', icon: <Bot className="w-4 h-4" />, requiresTexture: true, getCode: (name) => `export class ${name} {}` }],
  [EntityType.SUBWORLD]: [{ id: 'Blank', label: 'Subworld', description: 'Empty.', icon: <Layers className="w-4 h-4" />, requiresTexture: false, getCode: (name) => getBlankCode(name, 'Subworld') }],
  [EntityType.TILE]: [{ id: 'Blank', label: 'Tile', description: 'Empty.', icon: <Box className="w-4 h-4" />, requiresTexture: true, getCode: (name) => getBlankCode(name, 'Tile') }],
  [EntityType.SYSTEM]: [{ id: 'Blank', label: 'System', description: 'Empty.', icon: <Layout className="w-4 h-4" />, requiresTexture: false, getCode: (name) => getBlankCode(name, 'System') }],
  [EntityType.BLANK]: []
};

export const CATEGORIES_CONFIG = [
  { id: EntityType.ITEM, label: 'Items', icon: <Box className="w-4 h-4" /> },
  { id: EntityType.NPC, label: 'NPCs', icon: <Ghost className="w-4 h-4" /> },
  { id: EntityType.PROJECTILE, label: 'Projectiles', icon: <Target className="w-4 h-4" /> },
  { id: EntityType.BUFF, label: 'Buffs', icon: <Zap className="w-4 h-4" /> },
  { id: EntityType.BIOME, label: 'Biomes', icon: <Compass className="w-4 h-4" /> },
  { id: EntityType.BACKGROUND, label: 'Backgrounds', icon: <Palette className="w-4 h-4" /> },
  { id: EntityType.CLOUD, label: 'Clouds', icon: <Cloud className="w-4 h-4" /> },
  { id: EntityType.GLOBAL, label: 'Global', icon: <Globe className="w-4 h-4" /> },
  { id: EntityType.MENU, label: 'Menus', icon: <Layout className="w-4 h-4" /> },
  { id: EntityType.SUBWORLD, label: 'Subworlds', icon: <Layers className="w-4 h-4" /> },
  { id: EntityType.SYSTEM, label: 'Systems', icon: <Layout className="w-4 h-4" /> },
  { id: EntityType.TILE, label: 'Tiles', icon: <Box className="w-4 h-4" /> },
  { id: EntityType.PET, label: 'Pets', icon: <Bot className="w-4 h-4" /> },
];