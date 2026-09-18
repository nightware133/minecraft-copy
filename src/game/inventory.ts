import { BLOCK_TYPES } from './world';
import {
  STICK_ICON,
  WOOD_PICKAXE_ICON,
  STONE_PICKAXE_ICON,
  WOOD_SWORD_ICON,
  COAL_ICON,
  IRON_INGOT_ICON,
  GOLD_INGOT_ICON,
  DIAMOND_ICON,
  IRON_PICKAXE_ICON,
  DIAMOND_PICKAXE_ICON,
  DIAMOND_SWORD_ICON,
  IRON_SWORD_ICON,
  IRON_HELMET_ICON,
  IRON_CHESTPLATE_ICON,
  IRON_LEGGINGS_ICON,
  IRON_BOOTS_ICON,
  DIAMOND_HELMET_ICON,
  DIAMOND_CHESTPLATE_ICON,
  DIAMOND_LEGGINGS_ICON,
  DIAMOND_BOOTS_ICON,
  GOLD_HELMET_ICON,
  GOLD_CHESTPLATE_ICON,
  GOLD_LEGGINGS_ICON,
  GOLD_BOOTS_ICON,
  LEATHER_HELMET_ICON,
  LEATHER_CHESTPLATE_ICON,
  LEATHER_LEGGINGS_ICON,
  LEATHER_BOOTS_ICON,
  APPLE_ICON,
  BREAD_ICON,
} from './itemIcons';

export interface ItemStack {
  id: number;
  count: number;
  durability?: number;
  maxDurability?: number;
}

export type ArmorSlotType = 'helmet' | 'chestplate' | 'leggings' | 'boots';

export interface ArmorInfo {
  slot: ArmorSlotType;
  slotIndex: number; // 0: helmet, 1: chest, 2: legs, 3: boots
  defense: number;
  tier: 'leather' | 'iron' | 'diamond' | 'gold';
  color: string;
}

export interface ItemDef {
  id: number;
  name: string;
  isBlock: boolean;
  blockType?: number;
  icon?: string;
  maxStack: number;
  isTool?: boolean;
  isArmor?: boolean;
  armorInfo?: ArmorInfo;
}

// Extra craftable items (non-block items start at ID 100)
export const ITEM_TYPES = {
  STICK: 100,
  WOOD_PICKAXE: 101,
  STONE_PICKAXE: 102,
  WOOD_SWORD: 103,
  COAL: 104,
  IRON_INGOT: 105,
  GOLD_INGOT: 106,
  DIAMOND: 107,
  IRON_PICKAXE: 108,
  DIAMOND_PICKAXE: 109,
  DIAMOND_SWORD: 110,
  IRON_SWORD: 111,
  // Armor items (Canonical Minecraft IDs & Defense points)
  LEATHER_HELMET: 120,
  LEATHER_CHESTPLATE: 121,
  LEATHER_LEGGINGS: 122,
  LEATHER_BOOTS: 123,
  IRON_HELMET: 124,
  IRON_CHESTPLATE: 125,
  IRON_LEGGINGS: 126,
  IRON_BOOTS: 127,
  DIAMOND_HELMET: 128,
  DIAMOND_CHESTPLATE: 129,
  DIAMOND_LEGGINGS: 130,
  DIAMOND_BOOTS: 131,
  GOLD_HELMET: 132,
  GOLD_CHESTPLATE: 133,
  GOLD_LEGGINGS: 134,
  GOLD_BOOTS: 135,
  // Food items
  APPLE: 136,
  BREAD: 137,
};

// Canonical Minecraft Armor Defense Ratings (Total full set = 20 points = 10 armor icons)
export const ARMOR_DATA: Record<number, ArmorInfo> = {
  // Leather: Helmet 1, Chest 3, Legs 2, Boots 1 (Total 7)
  [ITEM_TYPES.LEATHER_HELMET]: { slot: 'helmet', slotIndex: 0, defense: 1, tier: 'leather', color: '#8d5524' },
  [ITEM_TYPES.LEATHER_CHESTPLATE]: { slot: 'chestplate', slotIndex: 1, defense: 3, tier: 'leather', color: '#8d5524' },
  [ITEM_TYPES.LEATHER_LEGGINGS]: { slot: 'leggings', slotIndex: 2, defense: 2, tier: 'leather', color: '#8d5524' },
  [ITEM_TYPES.LEATHER_BOOTS]: { slot: 'boots', slotIndex: 3, defense: 1, tier: 'leather', color: '#8d5524' },

  // Iron: Helmet 2, Chest 6, Legs 5, Boots 2 (Total 15)
  [ITEM_TYPES.IRON_HELMET]: { slot: 'helmet', slotIndex: 0, defense: 2, tier: 'iron', color: '#cfd8dc' },
  [ITEM_TYPES.IRON_CHESTPLATE]: { slot: 'chestplate', slotIndex: 1, defense: 6, tier: 'iron', color: '#cfd8dc' },
  [ITEM_TYPES.IRON_LEGGINGS]: { slot: 'leggings', slotIndex: 2, defense: 5, tier: 'iron', color: '#cfd8dc' },
  [ITEM_TYPES.IRON_BOOTS]: { slot: 'boots', slotIndex: 3, defense: 2, tier: 'iron', color: '#cfd8dc' },

  // Diamond: Helmet 3, Chest 8, Legs 6, Boots 3 (Total 20 = 100% full armor bar)
  [ITEM_TYPES.DIAMOND_HELMET]: { slot: 'helmet', slotIndex: 0, defense: 3, tier: 'diamond', color: '#00d2d3' },
  [ITEM_TYPES.DIAMOND_CHESTPLATE]: { slot: 'chestplate', slotIndex: 1, defense: 8, tier: 'diamond', color: '#00d2d3' },
  [ITEM_TYPES.DIAMOND_LEGGINGS]: { slot: 'leggings', slotIndex: 2, defense: 6, tier: 'diamond', color: '#00d2d3' },
  [ITEM_TYPES.DIAMOND_BOOTS]: { slot: 'boots', slotIndex: 3, defense: 3, tier: 'diamond', color: '#00d2d3' },

  // Gold: Helmet 2, Chest 5, Legs 3, Boots 1 (Total 11)
  [ITEM_TYPES.GOLD_HELMET]: { slot: 'helmet', slotIndex: 0, defense: 2, tier: 'gold', color: '#ffd32a' },
  [ITEM_TYPES.GOLD_CHESTPLATE]: { slot: 'chestplate', slotIndex: 1, defense: 5, tier: 'gold', color: '#ffd32a' },
  [ITEM_TYPES.GOLD_LEGGINGS]: { slot: 'leggings', slotIndex: 2, defense: 3, tier: 'gold', color: '#ffd32a' },
  [ITEM_TYPES.GOLD_BOOTS]: { slot: 'boots', slotIndex: 3, defense: 1, tier: 'gold', color: '#ffd32a' },
};

// Maximum durability values for all tools
export const TOOL_DURABILITIES: Record<number, number> = {
  [ITEM_TYPES.WOOD_PICKAXE]: 60,
  [ITEM_TYPES.STONE_PICKAXE]: 132,
  [ITEM_TYPES.IRON_PICKAXE]: 251,
  [ITEM_TYPES.DIAMOND_PICKAXE]: 1562,
  [ITEM_TYPES.WOOD_SWORD]: 60,
  [ITEM_TYPES.IRON_SWORD]: 251,
  [ITEM_TYPES.DIAMOND_SWORD]: 1562,
};

export const ITEM_DEFINITIONS: Record<number, ItemDef> = {
  [BLOCK_TYPES.GRASS]: { id: BLOCK_TYPES.GRASS, name: 'Grass Block', isBlock: true, blockType: BLOCK_TYPES.GRASS, maxStack: 64 },
  [BLOCK_TYPES.DIRT]: { id: BLOCK_TYPES.DIRT, name: 'Dirt', isBlock: true, blockType: BLOCK_TYPES.DIRT, maxStack: 64 },
  [BLOCK_TYPES.STONE]: { id: BLOCK_TYPES.STONE, name: 'Stone', isBlock: true, blockType: BLOCK_TYPES.STONE, maxStack: 64 },
  [BLOCK_TYPES.WOOD]: { id: BLOCK_TYPES.WOOD, name: 'Wood Log', isBlock: true, blockType: BLOCK_TYPES.WOOD, maxStack: 64 },
  [BLOCK_TYPES.LEAVES]: { id: BLOCK_TYPES.LEAVES, name: 'Leaves', isBlock: true, blockType: BLOCK_TYPES.LEAVES, maxStack: 64 },
  [BLOCK_TYPES.BRICK]: { id: BLOCK_TYPES.BRICK, name: 'Bricks', isBlock: true, blockType: BLOCK_TYPES.BRICK, maxStack: 64 },
  [BLOCK_TYPES.SAND]: { id: BLOCK_TYPES.SAND, name: 'Sand', isBlock: true, blockType: BLOCK_TYPES.SAND, maxStack: 64 },
  [BLOCK_TYPES.CORAL_PINK]: { id: BLOCK_TYPES.CORAL_PINK, name: 'Pink Coral', isBlock: true, blockType: BLOCK_TYPES.CORAL_PINK, maxStack: 64 },
  [BLOCK_TYPES.CORAL_CYAN]: { id: BLOCK_TYPES.CORAL_CYAN, name: 'Cyan Coral', isBlock: true, blockType: BLOCK_TYPES.CORAL_CYAN, maxStack: 64 },
  [BLOCK_TYPES.CORAL_YELLOW]: { id: BLOCK_TYPES.CORAL_YELLOW, name: 'Yellow Coral', isBlock: true, blockType: BLOCK_TYPES.CORAL_YELLOW, maxStack: 64 },
  [BLOCK_TYPES.WOOD_PLANKS]: { id: BLOCK_TYPES.WOOD_PLANKS, name: 'Wood Planks', isBlock: true, blockType: BLOCK_TYPES.WOOD_PLANKS, maxStack: 64 },
  [BLOCK_TYPES.GLASS]: { id: BLOCK_TYPES.GLASS, name: 'Glass', isBlock: true, blockType: BLOCK_TYPES.GLASS, maxStack: 64 },
  [BLOCK_TYPES.CRAFTING_TABLE]: { id: BLOCK_TYPES.CRAFTING_TABLE, name: 'Crafting Table', isBlock: true, blockType: BLOCK_TYPES.CRAFTING_TABLE, maxStack: 64 },
  [BLOCK_TYPES.COAL_ORE]: { id: BLOCK_TYPES.COAL_ORE, name: 'Coal Ore', isBlock: true, blockType: BLOCK_TYPES.COAL_ORE, maxStack: 64 },
  [BLOCK_TYPES.IRON_ORE]: { id: BLOCK_TYPES.IRON_ORE, name: 'Iron Ore', isBlock: true, blockType: BLOCK_TYPES.IRON_ORE, maxStack: 64 },
  [BLOCK_TYPES.GOLD_ORE]: { id: BLOCK_TYPES.GOLD_ORE, name: 'Gold Ore', isBlock: true, blockType: BLOCK_TYPES.GOLD_ORE, maxStack: 64 },
  [BLOCK_TYPES.DIAMOND_ORE]: { id: BLOCK_TYPES.DIAMOND_ORE, name: 'Diamond Ore', isBlock: true, blockType: BLOCK_TYPES.DIAMOND_ORE, maxStack: 64 },
  [BLOCK_TYPES.BIRCH_WOOD]: { id: BLOCK_TYPES.BIRCH_WOOD, name: 'Birch Log', isBlock: true, blockType: BLOCK_TYPES.BIRCH_WOOD, maxStack: 64 },
  [BLOCK_TYPES.RED_FLOWER]: { id: BLOCK_TYPES.RED_FLOWER, name: 'Red Poppy', isBlock: true, blockType: BLOCK_TYPES.RED_FLOWER, maxStack: 64 },
  [BLOCK_TYPES.YELLOW_FLOWER]: { id: BLOCK_TYPES.YELLOW_FLOWER, name: 'Dandelion', isBlock: true, blockType: BLOCK_TYPES.YELLOW_FLOWER, maxStack: 64 },
  [BLOCK_TYPES.SEAWEED]: { id: BLOCK_TYPES.SEAWEED, name: 'Seaweed', isBlock: true, blockType: BLOCK_TYPES.SEAWEED, maxStack: 64 },
  [BLOCK_TYPES.TORCH]: { id: BLOCK_TYPES.TORCH, name: 'Torch', isBlock: true, blockType: BLOCK_TYPES.TORCH, maxStack: 64 },
  // Non-block items
  [ITEM_TYPES.STICK]: { id: ITEM_TYPES.STICK, name: 'Wooden Stick', isBlock: false, icon: STICK_ICON, maxStack: 64 },
  [ITEM_TYPES.WOOD_PICKAXE]: { id: ITEM_TYPES.WOOD_PICKAXE, name: 'Wooden Pickaxe', isBlock: false, icon: WOOD_PICKAXE_ICON, maxStack: 1 },
  [ITEM_TYPES.STONE_PICKAXE]: { id: ITEM_TYPES.STONE_PICKAXE, name: 'Stone Pickaxe', isBlock: false, icon: STONE_PICKAXE_ICON, maxStack: 1 },
  [ITEM_TYPES.WOOD_SWORD]: { id: ITEM_TYPES.WOOD_SWORD, name: 'Wooden Sword', isBlock: false, icon: WOOD_SWORD_ICON, maxStack: 1 },
  [ITEM_TYPES.COAL]: { id: ITEM_TYPES.COAL, name: 'Coal', isBlock: false, icon: COAL_ICON, maxStack: 64 },
  [ITEM_TYPES.IRON_INGOT]: { id: ITEM_TYPES.IRON_INGOT, name: 'Iron Ingot', isBlock: false, icon: IRON_INGOT_ICON, maxStack: 64 },
  [ITEM_TYPES.GOLD_INGOT]: { id: ITEM_TYPES.GOLD_INGOT, name: 'Gold Ingot', isBlock: false, icon: GOLD_INGOT_ICON, maxStack: 64 },
  [ITEM_TYPES.DIAMOND]: { id: ITEM_TYPES.DIAMOND, name: 'Diamond Gem', isBlock: false, icon: DIAMOND_ICON, maxStack: 64 },
  [ITEM_TYPES.IRON_PICKAXE]: { id: ITEM_TYPES.IRON_PICKAXE, name: 'Iron Pickaxe', isBlock: false, icon: IRON_PICKAXE_ICON, maxStack: 1 },
  [ITEM_TYPES.DIAMOND_PICKAXE]: { id: ITEM_TYPES.DIAMOND_PICKAXE, name: 'Diamond Pickaxe', isBlock: false, icon: DIAMOND_PICKAXE_ICON, maxStack: 1 },
  [ITEM_TYPES.DIAMOND_SWORD]: { id: ITEM_TYPES.DIAMOND_SWORD, name: 'Diamond Sword', isBlock: false, icon: DIAMOND_SWORD_ICON, maxStack: 1 },
  [ITEM_TYPES.IRON_SWORD]: { id: ITEM_TYPES.IRON_SWORD, name: 'Iron Sword', isBlock: false, icon: IRON_SWORD_ICON, maxStack: 1 },

  // Leather Armor
  [ITEM_TYPES.LEATHER_HELMET]: { id: ITEM_TYPES.LEATHER_HELMET, name: 'Leather Cap', isBlock: false, icon: LEATHER_HELMET_ICON, maxStack: 1, isArmor: true, armorInfo: ARMOR_DATA[ITEM_TYPES.LEATHER_HELMET] },
  [ITEM_TYPES.LEATHER_CHESTPLATE]: { id: ITEM_TYPES.LEATHER_CHESTPLATE, name: 'Leather Tunic', isBlock: false, icon: LEATHER_CHESTPLATE_ICON, maxStack: 1, isArmor: true, armorInfo: ARMOR_DATA[ITEM_TYPES.LEATHER_CHESTPLATE] },
  [ITEM_TYPES.LEATHER_LEGGINGS]: { id: ITEM_TYPES.LEATHER_LEGGINGS, name: 'Leather Pants', isBlock: false, icon: LEATHER_LEGGINGS_ICON, maxStack: 1, isArmor: true, armorInfo: ARMOR_DATA[ITEM_TYPES.LEATHER_LEGGINGS] },
  [ITEM_TYPES.LEATHER_BOOTS]: { id: ITEM_TYPES.LEATHER_BOOTS, name: 'Leather Boots', isBlock: false, icon: LEATHER_BOOTS_ICON, maxStack: 1, isArmor: true, armorInfo: ARMOR_DATA[ITEM_TYPES.LEATHER_BOOTS] },

  // Iron Armor
  [ITEM_TYPES.IRON_HELMET]: { id: ITEM_TYPES.IRON_HELMET, name: 'Iron Helmet', isBlock: false, icon: IRON_HELMET_ICON, maxStack: 1, isArmor: true, armorInfo: ARMOR_DATA[ITEM_TYPES.IRON_HELMET] },
  [ITEM_TYPES.IRON_CHESTPLATE]: { id: ITEM_TYPES.IRON_CHESTPLATE, name: 'Iron Chestplate', isBlock: false, icon: IRON_CHESTPLATE_ICON, maxStack: 1, isArmor: true, armorInfo: ARMOR_DATA[ITEM_TYPES.IRON_CHESTPLATE] },
  [ITEM_TYPES.IRON_LEGGINGS]: { id: ITEM_TYPES.IRON_LEGGINGS, name: 'Iron Leggings', isBlock: false, icon: IRON_LEGGINGS_ICON, maxStack: 1, isArmor: true, armorInfo: ARMOR_DATA[ITEM_TYPES.IRON_LEGGINGS] },
  [ITEM_TYPES.IRON_BOOTS]: { id: ITEM_TYPES.IRON_BOOTS, name: 'Iron Boots', isBlock: false, icon: IRON_BOOTS_ICON, maxStack: 1, isArmor: true, armorInfo: ARMOR_DATA[ITEM_TYPES.IRON_BOOTS] },

  // Diamond Armor
  [ITEM_TYPES.DIAMOND_HELMET]: { id: ITEM_TYPES.DIAMOND_HELMET, name: 'Diamond Helmet', isBlock: false, icon: DIAMOND_HELMET_ICON, maxStack: 1, isArmor: true, armorInfo: ARMOR_DATA[ITEM_TYPES.DIAMOND_HELMET] },
  [ITEM_TYPES.DIAMOND_CHESTPLATE]: { id: ITEM_TYPES.DIAMOND_CHESTPLATE, name: 'Diamond Chestplate', isBlock: false, icon: DIAMOND_CHESTPLATE_ICON, maxStack: 1, isArmor: true, armorInfo: ARMOR_DATA[ITEM_TYPES.DIAMOND_CHESTPLATE] },
  [ITEM_TYPES.DIAMOND_LEGGINGS]: { id: ITEM_TYPES.DIAMOND_LEGGINGS, name: 'Diamond Leggings', isBlock: false, icon: DIAMOND_LEGGINGS_ICON, maxStack: 1, isArmor: true, armorInfo: ARMOR_DATA[ITEM_TYPES.DIAMOND_LEGGINGS] },
  [ITEM_TYPES.DIAMOND_BOOTS]: { id: ITEM_TYPES.DIAMOND_BOOTS, name: 'Diamond Boots', isBlock: false, icon: DIAMOND_BOOTS_ICON, maxStack: 1, isArmor: true, armorInfo: ARMOR_DATA[ITEM_TYPES.DIAMOND_BOOTS] },

  // Gold Armor
  [ITEM_TYPES.GOLD_HELMET]: { id: ITEM_TYPES.GOLD_HELMET, name: 'Golden Helmet', isBlock: false, icon: GOLD_HELMET_ICON, maxStack: 1, isArmor: true, armorInfo: ARMOR_DATA[ITEM_TYPES.GOLD_HELMET] },
  [ITEM_TYPES.GOLD_CHESTPLATE]: { id: ITEM_TYPES.GOLD_CHESTPLATE, name: 'Golden Chestplate', isBlock: false, icon: GOLD_CHESTPLATE_ICON, maxStack: 1, isArmor: true, armorInfo: ARMOR_DATA[ITEM_TYPES.GOLD_CHESTPLATE] },
  [ITEM_TYPES.GOLD_LEGGINGS]: { id: ITEM_TYPES.GOLD_LEGGINGS, name: 'Golden Leggings', isBlock: false, icon: GOLD_LEGGINGS_ICON, maxStack: 1, isArmor: true, armorInfo: ARMOR_DATA[ITEM_TYPES.GOLD_LEGGINGS] },
  [ITEM_TYPES.GOLD_BOOTS]: { id: ITEM_TYPES.GOLD_BOOTS, name: 'Golden Boots', isBlock: false, icon: GOLD_BOOTS_ICON, maxStack: 1, isArmor: true, armorInfo: ARMOR_DATA[ITEM_TYPES.GOLD_BOOTS] },

  // Food
  [ITEM_TYPES.APPLE]: { id: ITEM_TYPES.APPLE, name: 'Red Apple', isBlock: false, icon: APPLE_ICON, maxStack: 64 },
  [ITEM_TYPES.BREAD]: { id: ITEM_TYPES.BREAD, name: 'Bread Loaf', isBlock: false, icon: BREAD_ICON, maxStack: 64 },
};

export interface CraftingRecipe {
  id: string;
  name: string;
  ingredients: { id: number; count: number }[];
  result: { id: number; count: number };
  pattern?: (number | null)[]; // 2x2 grid pattern (null = empty)
}

export const CRAFTING_RECIPES: CraftingRecipe[] = [
  {
    id: 'wood-to-planks',
    name: 'Oak Planks',
    ingredients: [{ id: BLOCK_TYPES.WOOD, count: 1 }],
    result: { id: BLOCK_TYPES.WOOD_PLANKS, count: 4 },
    pattern: [BLOCK_TYPES.WOOD, null, null, null],
  },
  {
    id: 'birch-to-planks',
    name: 'Birch Planks',
    ingredients: [{ id: BLOCK_TYPES.BIRCH_WOOD, count: 1 }],
    result: { id: BLOCK_TYPES.WOOD_PLANKS, count: 4 },
    pattern: [BLOCK_TYPES.BIRCH_WOOD, null, null, null],
  },
  {
    id: 'planks-to-sticks',
    name: 'Sticks',
    ingredients: [{ id: BLOCK_TYPES.WOOD_PLANKS, count: 2 }],
    result: { id: ITEM_TYPES.STICK, count: 4 },
    pattern: [BLOCK_TYPES.WOOD_PLANKS, null, BLOCK_TYPES.WOOD_PLANKS, null],
  },
  {
    id: 'torches',
    name: 'Torches',
    ingredients: [
      { id: ITEM_TYPES.COAL, count: 1 },
      { id: ITEM_TYPES.STICK, count: 1 },
    ],
    result: { id: BLOCK_TYPES.TORCH, count: 4 },
  },
  {
    id: 'crafting-table',
    name: 'Crafting Table',
    ingredients: [{ id: BLOCK_TYPES.WOOD_PLANKS, count: 4 }],
    result: { id: BLOCK_TYPES.CRAFTING_TABLE, count: 1 },
    pattern: [
      BLOCK_TYPES.WOOD_PLANKS, BLOCK_TYPES.WOOD_PLANKS,
      BLOCK_TYPES.WOOD_PLANKS, BLOCK_TYPES.WOOD_PLANKS,
    ],
  },
  {
    id: 'wood-pickaxe',
    name: 'Wooden Pickaxe',
    ingredients: [
      { id: BLOCK_TYPES.WOOD_PLANKS, count: 3 },
      { id: ITEM_TYPES.STICK, count: 2 },
    ],
    result: { id: ITEM_TYPES.WOOD_PICKAXE, count: 1 },
  },
  {
    id: 'stone-pickaxe',
    name: 'Stone Pickaxe',
    ingredients: [
      { id: BLOCK_TYPES.STONE, count: 3 },
      { id: ITEM_TYPES.STICK, count: 2 },
    ],
    result: { id: ITEM_TYPES.STONE_PICKAXE, count: 1 },
  },
  {
    id: 'iron-smelt',
    name: 'Refine Iron Ingot',
    ingredients: [{ id: BLOCK_TYPES.IRON_ORE, count: 1 }],
    result: { id: ITEM_TYPES.IRON_INGOT, count: 1 },
  },
  {
    id: 'gold-smelt',
    name: 'Refine Gold Ingot',
    ingredients: [{ id: BLOCK_TYPES.GOLD_ORE, count: 1 }],
    result: { id: ITEM_TYPES.GOLD_INGOT, count: 1 },
  },
  {
    id: 'iron-pickaxe',
    name: 'Iron Pickaxe',
    ingredients: [
      { id: ITEM_TYPES.IRON_INGOT, count: 3 },
      { id: ITEM_TYPES.STICK, count: 2 },
    ],
    result: { id: ITEM_TYPES.IRON_PICKAXE, count: 1 },
  },
  {
    id: 'diamond-pickaxe',
    name: 'Diamond Pickaxe',
    ingredients: [
      { id: ITEM_TYPES.DIAMOND, count: 3 },
      { id: ITEM_TYPES.STICK, count: 2 },
    ],
    result: { id: ITEM_TYPES.DIAMOND_PICKAXE, count: 1 },
  },
  {
    id: 'diamond-sword',
    name: 'Diamond Sword',
    ingredients: [
      { id: ITEM_TYPES.DIAMOND, count: 2 },
      { id: ITEM_TYPES.STICK, count: 1 },
    ],
    result: { id: ITEM_TYPES.DIAMOND_SWORD, count: 1 },
  },
  {
    id: 'iron-sword',
    name: 'Iron Sword',
    ingredients: [
      { id: ITEM_TYPES.IRON_INGOT, count: 2 },
      { id: ITEM_TYPES.STICK, count: 1 },
    ],
    result: { id: ITEM_TYPES.IRON_SWORD, count: 1 },
  },
  {
    id: 'wood-sword',
    name: 'Wooden Sword',
    ingredients: [
      { id: BLOCK_TYPES.WOOD_PLANKS, count: 2 },
      { id: ITEM_TYPES.STICK, count: 1 },
    ],
    result: { id: ITEM_TYPES.WOOD_SWORD, count: 1 },
  },
  // --- ARMOR CRAFTING RECIPES ---
  {
    id: 'iron-helmet',
    name: 'Iron Helmet',
    ingredients: [{ id: ITEM_TYPES.IRON_INGOT, count: 5 }],
    result: { id: ITEM_TYPES.IRON_HELMET, count: 1 },
  },
  {
    id: 'iron-chestplate',
    name: 'Iron Chestplate',
    ingredients: [{ id: ITEM_TYPES.IRON_INGOT, count: 8 }],
    result: { id: ITEM_TYPES.IRON_CHESTPLATE, count: 1 },
  },
  {
    id: 'iron-leggings',
    name: 'Iron Leggings',
    ingredients: [{ id: ITEM_TYPES.IRON_INGOT, count: 7 }],
    result: { id: ITEM_TYPES.IRON_LEGGINGS, count: 1 },
  },
  {
    id: 'iron-boots',
    name: 'Iron Boots',
    ingredients: [{ id: ITEM_TYPES.IRON_INGOT, count: 4 }],
    result: { id: ITEM_TYPES.IRON_BOOTS, count: 1 },
  },
  {
    id: 'diamond-helmet',
    name: 'Diamond Helmet',
    ingredients: [{ id: ITEM_TYPES.DIAMOND, count: 5 }],
    result: { id: ITEM_TYPES.DIAMOND_HELMET, count: 1 },
  },
  {
    id: 'diamond-chestplate',
    name: 'Diamond Chestplate',
    ingredients: [{ id: ITEM_TYPES.DIAMOND, count: 8 }],
    result: { id: ITEM_TYPES.DIAMOND_CHESTPLATE, count: 1 },
  },
  {
    id: 'diamond-leggings',
    name: 'Diamond Leggings',
    ingredients: [{ id: ITEM_TYPES.DIAMOND, count: 7 }],
    result: { id: ITEM_TYPES.DIAMOND_LEGGINGS, count: 1 },
  },
  {
    id: 'diamond-boots',
    name: 'Diamond Boots',
    ingredients: [{ id: ITEM_TYPES.DIAMOND, count: 4 }],
    result: { id: ITEM_TYPES.DIAMOND_BOOTS, count: 1 },
  },
  {
    id: 'stone-to-bricks',
    name: 'Stone Bricks',
    ingredients: [{ id: BLOCK_TYPES.STONE, count: 4 }],
    result: { id: BLOCK_TYPES.BRICK, count: 4 },
    pattern: [
      BLOCK_TYPES.STONE, BLOCK_TYPES.STONE,
      BLOCK_TYPES.STONE, BLOCK_TYPES.STONE,
    ],
  },
  {
    id: 'sand-to-glass',
    name: 'Clear Glass',
    ingredients: [{ id: BLOCK_TYPES.SAND, count: 1 }],
    result: { id: BLOCK_TYPES.GLASS, count: 1 },
  },
];

export class InventorySystem {
  // Slots 0-5: Hotbar
  // Slots 6-23: Main Inventory (18 slots)
  slots: (ItemStack | null)[] = new Array(24).fill(null);
  selectedHotbarIndex: number = 0; // 0-5

  // 4 Dedicated Armor Slots: [0: Helmet, 1: Chestplate, 2: Leggings, 3: Boots]
  armorSlots: (ItemStack | null)[] = new Array(4).fill(null);

  // 2x2 Crafting Grid
  craftingGrid: (ItemStack | null)[] = new Array(4).fill(null);

  constructor() {
    this.initDefaultInventory();
  }

  private initDefaultInventory() {
    // Hotbar starter tools & blocks
    this.slots[0] = {
      id: ITEM_TYPES.WOOD_PICKAXE,
      count: 1,
      durability: 60,
      maxDurability: 60,
    };
    this.slots[1] = {
      id: ITEM_TYPES.WOOD_SWORD,
      count: 1,
      durability: 60,
      maxDurability: 60,
    };
    this.slots[2] = { id: BLOCK_TYPES.GRASS, count: 32 };
    this.slots[3] = { id: BLOCK_TYPES.WOOD, count: 16 };
    this.slots[4] = { id: BLOCK_TYPES.STONE, count: 32 };
    this.slots[5] = { id: BLOCK_TYPES.TORCH, count: 16 };

    // Extra starter supplies in main inventory
    this.slots[6] = {
      id: ITEM_TYPES.IRON_PICKAXE,
      count: 1,
      durability: 251,
      maxDurability: 251,
    };
    this.slots[7] = {
      id: ITEM_TYPES.DIAMOND_SWORD,
      count: 1,
      durability: 1562,
      maxDurability: 1562,
    };
    this.slots[8] = { id: BLOCK_TYPES.DIRT, count: 64 };
    this.slots[9] = { id: BLOCK_TYPES.SAND, count: 32 };
    this.slots[10] = { id: BLOCK_TYPES.BRICK, count: 32 };
    this.slots[11] = { id: BLOCK_TYPES.CORAL_PINK, count: 16 };
    // Starter Iron Armor and materials so the player can experience the armor system immediately!
    this.slots[12] = { id: ITEM_TYPES.IRON_HELMET, count: 1 };
    this.slots[13] = { id: ITEM_TYPES.IRON_CHESTPLATE, count: 1 };
    this.slots[14] = { id: ITEM_TYPES.IRON_INGOT, count: 16 };
    this.slots[15] = { id: ITEM_TYPES.DIAMOND, count: 8 };

    // Equip Starter Iron Chestplate & Helmet for immediate visual Minecraft protection!
    this.armorSlots[0] = { id: ITEM_TYPES.IRON_HELMET, count: 1 };
    this.armorSlots[1] = { id: ITEM_TYPES.IRON_CHESTPLATE, count: 1 };
  }

  // Calculate total defense points from all equipped armor (0 to 20)
  getTotalDefense(): number {
    let defense = 0;
    for (const piece of this.armorSlots) {
      if (piece && ARMOR_DATA[piece.id]) {
        defense += ARMOR_DATA[piece.id].defense;
      }
    }
    return Math.min(20, defense);
  }

  // Calculate damage reduction percentage (Canonical Minecraft: 4% per defense point, up to 80%)
  getDamageReduction(): number {
    return this.getTotalDefense() * 0.04;
  }

  // Equips an item into the appropriate armor slot.
  // Returns success and any replaced item that was previously in that slot.
  equipArmorItem(slotFromIndex: number): {
    success: boolean;
    replacedItem: ItemStack | null;
    armorSlotIndex?: number;
  } {
    const item = this.slots[slotFromIndex];
    if (!item) return { success: false, replacedItem: null };

    const armorInfo = ARMOR_DATA[item.id];
    if (!armorInfo) return { success: false, replacedItem: null };

    const slotIdx = armorInfo.slotIndex;
    const previousArmor = this.armorSlots[slotIdx];

    // Equip
    this.armorSlots[slotIdx] = { ...item, count: 1 };
    // Replace source slot with previous armor or clear it
    this.slots[slotFromIndex] = previousArmor;

    return {
      success: true,
      replacedItem: previousArmor,
      armorSlotIndex: slotIdx,
    };
  }

  // Unequips armor from slot 0-3 back into main inventory
  unequipArmorSlot(armorSlotIndex: number): boolean {
    const armorItem = this.armorSlots[armorSlotIndex];
    if (!armorItem) return false;

    // Find empty slot in inventory
    const added = this.addItem(armorItem.id, 1, armorItem.durability);
    if (added) {
      this.armorSlots[armorSlotIndex] = null;
      return true;
    }
    return false;
  }

  getDropForBlock(blockType: number): number {
    switch (blockType) {
      case BLOCK_TYPES.COAL_ORE:
        return ITEM_TYPES.COAL;
      case BLOCK_TYPES.DIAMOND_ORE:
        return ITEM_TYPES.DIAMOND;
      default:
        return blockType;
    }
  }

  getSelectedBlockId(): number | null {
    const stack = this.slots[this.selectedHotbarIndex];
    if (!stack || stack.count <= 0) return null;
    const def = ITEM_DEFINITIONS[stack.id];
    if (def && def.isBlock && def.blockType) {
      return def.blockType;
    }
    return null;
  }

  consumeActiveBlock(): boolean {
    const stack = this.slots[this.selectedHotbarIndex];
    if (!stack || stack.count <= 0) return false;
    stack.count--;
    if (stack.count <= 0) {
      this.slots[this.selectedHotbarIndex] = null;
    }
    return true;
  }

  // Damage active tool upon breaking a block. Returns whether the tool was destroyed.
  damageActiveTool(amount: number = 1): {
    destroyed: boolean;
    toolId?: number;
    remainingDurability?: number;
  } {
    const stack = this.slots[this.selectedHotbarIndex];
    if (!stack || stack.durability === undefined || stack.maxDurability === undefined) {
      return { destroyed: false };
    }

    const toolId = stack.id;
    stack.durability -= amount;

    if (stack.durability <= 0) {
      this.slots[this.selectedHotbarIndex] = null;
      return { destroyed: true, toolId, remainingDurability: 0 };
    }

    return { destroyed: false, toolId, remainingDurability: stack.durability };
  }

  // Calculate mining speed multiplier based on active tool and block type
  getActiveToolSpeedMultiplier(blockType: number): number {
    const stack = this.slots[this.selectedHotbarIndex];
    if (!stack) return 1.0;

    const id = stack.id;
    const isStoneLike =
      blockType === BLOCK_TYPES.STONE ||
      blockType === BLOCK_TYPES.BRICK ||
      blockType === BLOCK_TYPES.COAL_ORE ||
      blockType === BLOCK_TYPES.IRON_ORE ||
      blockType === BLOCK_TYPES.GOLD_ORE ||
      blockType === BLOCK_TYPES.DIAMOND_ORE;

    const isWoodLike =
      blockType === BLOCK_TYPES.WOOD ||
      blockType === BLOCK_TYPES.WOOD_PLANKS ||
      blockType === BLOCK_TYPES.BIRCH_WOOD ||
      blockType === BLOCK_TYPES.CRAFTING_TABLE;

    const isFoliage =
      blockType === BLOCK_TYPES.LEAVES ||
      blockType === BLOCK_TYPES.RED_FLOWER ||
      blockType === BLOCK_TYPES.YELLOW_FLOWER ||
      blockType === BLOCK_TYPES.SEAWEED;

    // Pickaxes heavily accelerate stone and ores
    if (id === ITEM_TYPES.WOOD_PICKAXE) {
      return isStoneLike ? 2.5 : isWoodLike ? 1.5 : 1.0;
    }
    if (id === ITEM_TYPES.STONE_PICKAXE) {
      return isStoneLike ? 4.0 : isWoodLike ? 1.8 : 1.0;
    }
    if (id === ITEM_TYPES.IRON_PICKAXE) {
      return isStoneLike ? 6.5 : isWoodLike ? 2.2 : 1.0;
    }
    if (id === ITEM_TYPES.DIAMOND_PICKAXE) {
      return isStoneLike ? 10.0 : isWoodLike ? 3.0 : 1.0;
    }

    // Swords accelerate foliage and leaves
    if (id === ITEM_TYPES.WOOD_SWORD) {
      return isFoliage ? 4.0 : 1.2;
    }
    if (id === ITEM_TYPES.DIAMOND_SWORD) {
      return isFoliage ? 8.0 : 1.5;
    }

    return 1.0;
  }

  addItem(id: number, count: number = 1, customDurability?: number): boolean {
    const def = ITEM_DEFINITIONS[id];
    const maxStack = def ? def.maxStack : 64;
    const isTool = !!TOOL_DURABILITIES[id];

    if (isTool) {
      // Tools do not stack: find empty slot
      const maxDur = TOOL_DURABILITIES[id];
      const dur = customDurability ?? maxDur;
      for (let i = 0; i < this.slots.length; i++) {
        if (!this.slots[i]) {
          this.slots[i] = { id, count: 1, durability: dur, maxDurability: maxDur };
          return true;
        }
      }
      return false;
    }

    // Standard stackable items: First try to add to an existing stack
    for (let i = 0; i < this.slots.length; i++) {
      const s = this.slots[i];
      if (s && s.id === id && s.count < maxStack) {
        const added = Math.min(count, maxStack - s.count);
        s.count += added;
        count -= added;
        if (count <= 0) return true;
      }
    }

    // Then find empty slot
    for (let i = 0; i < this.slots.length; i++) {
      if (!this.slots[i]) {
        const added = Math.min(count, maxStack);
        this.slots[i] = { id, count: added };
        count -= added;
        if (count <= 0) return true;
      }
    }

    return count === 0;
  }

  hasIngredients(ingredients: { id: number; count: number }[]): boolean {
    const totalCounts: Record<number, number> = {};
    for (const slot of this.slots) {
      if (slot) {
        totalCounts[slot.id] = (totalCounts[slot.id] || 0) + slot.count;
      }
    }

    for (const ing of ingredients) {
      if ((totalCounts[ing.id] || 0) < ing.count) {
        return false;
      }
    }
    return true;
  }

  craftRecipe(recipe: CraftingRecipe): boolean {
    if (!this.hasIngredients(recipe.ingredients)) return false;

    // Deduct ingredients
    for (const ing of recipe.ingredients) {
      let needed = ing.count;
      for (let i = 0; i < this.slots.length; i++) {
        const s = this.slots[i];
        if (s && s.id === ing.id) {
          const deduct = Math.min(needed, s.count);
          s.count -= deduct;
          needed -= deduct;
          if (s.count <= 0) this.slots[i] = null;
          if (needed <= 0) break;
        }
      }
    }

    // Add result item
    this.addItem(recipe.result.id, recipe.result.count);
    return true;
  }

  swapSlots(fromIndex: number, toIndex: number) {
    if (fromIndex < 0 || fromIndex >= this.slots.length) return;
    if (toIndex < 0 || toIndex >= this.slots.length) return;
    const temp = this.slots[fromIndex];
    this.slots[fromIndex] = this.slots[toIndex];
    this.slots[toIndex] = temp;
  }
}
