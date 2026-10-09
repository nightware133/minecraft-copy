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
  BUCKET_ICON,
  WATER_BUCKET_ICON,
  LAVA_BUCKET_ICON,
  GOLDEN_APPLE_ICON,
  MELON_SLICE_ICON,
  MUSHROOM_STEW_ICON,
  AMETHYST_SHARD_ICON,
  RAW_BEEF_ICON,
  COOKED_BEEF_ICON,
  RAW_PORKCHOP_ICON,
  COOKED_PORKCHOP_ICON,
  RAW_MUTTON_ICON,
  COOKED_MUTTON_ICON,
  RAW_CHICKEN_ICON,
  COOKED_CHICKEN_ICON,
  LEATHER_ICON,
  FEATHER_ICON,
  EGG_ICON,
  FURNACE_ICON,
  SNOWBALL_ICON,
  FLINT_AND_STEEL_ICON,
  SWEET_BERRIES_ICON,
  NETHERRACK_ICON,
  SOUL_SAND_ICON,
  NETHER_BRICKS_ICON,
  NETHER_PORTAL_ICON,
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
  durability?: number;
  maxDurability?: number;
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
  // Buckets & Special items
  BUCKET: 138,
  WATER_BUCKET: 139,
  LAVA_BUCKET: 140,
  GOLDEN_APPLE: 141,
  MELON_SLICE: 142,
  MUSHROOM_STEW: 143,
  AMETHYST_SHARD: 144,
  // Animal drops & Meat
  RAW_BEEF: 145,
  COOKED_BEEF: 146,
  RAW_PORKCHOP: 147,
  COOKED_PORKCHOP: 148,
  RAW_MUTTON: 149,
  COOKED_MUTTON: 150,
  RAW_CHICKEN: 151,
  COOKED_CHICKEN: 152,
  LEATHER: 153,
  FEATHER: 154,
  EGG: 155,
  SNOWBALL: 156,
  FLINT_AND_STEEL: 157,
  SWEET_BERRIES: 158,
};

// Canonical Minecraft Armor Defense Ratings (Total full set = 20 points = 10 armor icons)
export const ARMOR_DATA: Record<number, ArmorInfo> = {
  [ITEM_TYPES.LEATHER_HELMET]: { slot: 'helmet', slotIndex: 0, defense: 1, tier: 'leather', color: '#8d5524' },
  [ITEM_TYPES.LEATHER_CHESTPLATE]: { slot: 'chestplate', slotIndex: 1, defense: 3, tier: 'leather', color: '#8d5524' },
  [ITEM_TYPES.LEATHER_LEGGINGS]: { slot: 'leggings', slotIndex: 2, defense: 2, tier: 'leather', color: '#8d5524' },
  [ITEM_TYPES.LEATHER_BOOTS]: { slot: 'boots', slotIndex: 3, defense: 1, tier: 'leather', color: '#8d5524' },

  [ITEM_TYPES.IRON_HELMET]: { slot: 'helmet', slotIndex: 0, defense: 2, tier: 'iron', color: '#cfd8dc' },
  [ITEM_TYPES.IRON_CHESTPLATE]: { slot: 'chestplate', slotIndex: 1, defense: 6, tier: 'iron', color: '#cfd8dc' },
  [ITEM_TYPES.IRON_LEGGINGS]: { slot: 'leggings', slotIndex: 2, defense: 5, tier: 'iron', color: '#cfd8dc' },
  [ITEM_TYPES.IRON_BOOTS]: { slot: 'boots', slotIndex: 3, defense: 2, tier: 'iron', color: '#cfd8dc' },

  [ITEM_TYPES.DIAMOND_HELMET]: { slot: 'helmet', slotIndex: 0, defense: 3, tier: 'diamond', color: '#00d2d3' },
  [ITEM_TYPES.DIAMOND_CHESTPLATE]: { slot: 'chestplate', slotIndex: 1, defense: 8, tier: 'diamond', color: '#00d2d3' },
  [ITEM_TYPES.DIAMOND_LEGGINGS]: { slot: 'leggings', slotIndex: 2, defense: 6, tier: 'diamond', color: '#00d2d3' },
  [ITEM_TYPES.DIAMOND_BOOTS]: { slot: 'boots', slotIndex: 3, defense: 3, tier: 'diamond', color: '#00d2d3' },

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
  [BLOCK_TYPES.SNOW]: { id: BLOCK_TYPES.SNOW, name: 'Snow Block', isBlock: true, blockType: BLOCK_TYPES.SNOW, maxStack: 64 },
  [BLOCK_TYPES.ICE]: { id: BLOCK_TYPES.ICE, name: 'Ice', isBlock: true, blockType: BLOCK_TYPES.ICE, maxStack: 64 },
  [BLOCK_TYPES.CACTUS]: { id: BLOCK_TYPES.CACTUS, name: 'Cactus', isBlock: true, blockType: BLOCK_TYPES.CACTUS, maxStack: 64 },
  [BLOCK_TYPES.CHERRY_LEAVES]: { id: BLOCK_TYPES.CHERRY_LEAVES, name: 'Cherry Leaves', isBlock: true, blockType: BLOCK_TYPES.CHERRY_LEAVES, maxStack: 64 },
  [BLOCK_TYPES.RED_SAND]: { id: BLOCK_TYPES.RED_SAND, name: 'Red Sand', isBlock: true, blockType: BLOCK_TYPES.RED_SAND, maxStack: 64 },

  // New Biome & Special Blocks
  [BLOCK_TYPES.TERRACOTTA]: { id: BLOCK_TYPES.TERRACOTTA, name: 'Terracotta', isBlock: true, blockType: BLOCK_TYPES.TERRACOTTA, maxStack: 64 },
  [BLOCK_TYPES.RED_TERRACOTTA]: { id: BLOCK_TYPES.RED_TERRACOTTA, name: 'Red Terracotta', isBlock: true, blockType: BLOCK_TYPES.RED_TERRACOTTA, maxStack: 64 },
  [BLOCK_TYPES.ORANGE_TERRACOTTA]: { id: BLOCK_TYPES.ORANGE_TERRACOTTA, name: 'Orange Terracotta', isBlock: true, blockType: BLOCK_TYPES.ORANGE_TERRACOTTA, maxStack: 64 },
  [BLOCK_TYPES.YELLOW_TERRACOTTA]: { id: BLOCK_TYPES.YELLOW_TERRACOTTA, name: 'Yellow Terracotta', isBlock: true, blockType: BLOCK_TYPES.YELLOW_TERRACOTTA, maxStack: 64 },
  [BLOCK_TYPES.WHITE_TERRACOTTA]: { id: BLOCK_TYPES.WHITE_TERRACOTTA, name: 'White Terracotta', isBlock: true, blockType: BLOCK_TYPES.WHITE_TERRACOTTA, maxStack: 64 },
  [BLOCK_TYPES.BROWN_TERRACOTTA]: { id: BLOCK_TYPES.BROWN_TERRACOTTA, name: 'Brown Terracotta', isBlock: true, blockType: BLOCK_TYPES.BROWN_TERRACOTTA, maxStack: 64 },
  [BLOCK_TYPES.DARK_OAK_WOOD]: { id: BLOCK_TYPES.DARK_OAK_WOOD, name: 'Dark Oak Log', isBlock: true, blockType: BLOCK_TYPES.DARK_OAK_WOOD, maxStack: 64 },
  [BLOCK_TYPES.DARK_OAK_LEAVES]: { id: BLOCK_TYPES.DARK_OAK_LEAVES, name: 'Dark Oak Leaves', isBlock: true, blockType: BLOCK_TYPES.DARK_OAK_LEAVES, maxStack: 64 },
  [BLOCK_TYPES.RED_MUSHROOM_BLOCK]: { id: BLOCK_TYPES.RED_MUSHROOM_BLOCK, name: 'Red Mushroom Block', isBlock: true, blockType: BLOCK_TYPES.RED_MUSHROOM_BLOCK, maxStack: 64 },
  [BLOCK_TYPES.BROWN_MUSHROOM_BLOCK]: { id: BLOCK_TYPES.BROWN_MUSHROOM_BLOCK, name: 'Brown Mushroom Block', isBlock: true, blockType: BLOCK_TYPES.BROWN_MUSHROOM_BLOCK, maxStack: 64 },
  [BLOCK_TYPES.MUSHROOM_STEM]: { id: BLOCK_TYPES.MUSHROOM_STEM, name: 'Mushroom Stem', isBlock: true, blockType: BLOCK_TYPES.MUSHROOM_STEM, maxStack: 64 },
  [BLOCK_TYPES.JUNGLE_WOOD]: { id: BLOCK_TYPES.JUNGLE_WOOD, name: 'Jungle Log', isBlock: true, blockType: BLOCK_TYPES.JUNGLE_WOOD, maxStack: 64 },
  [BLOCK_TYPES.JUNGLE_LEAVES]: { id: BLOCK_TYPES.JUNGLE_LEAVES, name: 'Jungle Leaves', isBlock: true, blockType: BLOCK_TYPES.JUNGLE_LEAVES, maxStack: 64 },
  [BLOCK_TYPES.MELON]: { id: BLOCK_TYPES.MELON, name: 'Melon Block', isBlock: true, blockType: BLOCK_TYPES.MELON, maxStack: 64 },
  [BLOCK_TYPES.PUMPKIN]: { id: BLOCK_TYPES.PUMPKIN, name: 'Pumpkin', isBlock: true, blockType: BLOCK_TYPES.PUMPKIN, maxStack: 64 },
  [BLOCK_TYPES.LILY_PAD]: { id: BLOCK_TYPES.LILY_PAD, name: 'Lily Pad', isBlock: true, blockType: BLOCK_TYPES.LILY_PAD, maxStack: 64 },
  [BLOCK_TYPES.MUD]: { id: BLOCK_TYPES.MUD, name: 'Mud Block', isBlock: true, blockType: BLOCK_TYPES.MUD, maxStack: 64 },
  [BLOCK_TYPES.MOSS]: { id: BLOCK_TYPES.MOSS, name: 'Moss Block', isBlock: true, blockType: BLOCK_TYPES.MOSS, maxStack: 64 },
  [BLOCK_TYPES.AMETHYST]: { id: BLOCK_TYPES.AMETHYST, name: 'Amethyst Block', isBlock: true, blockType: BLOCK_TYPES.AMETHYST, maxStack: 64 },
  [BLOCK_TYPES.MAGMA]: { id: BLOCK_TYPES.MAGMA, name: 'Magma Block', isBlock: true, blockType: BLOCK_TYPES.MAGMA, maxStack: 64 },
  [BLOCK_TYPES.GLOWSTONE]: { id: BLOCK_TYPES.GLOWSTONE, name: 'Glowstone', isBlock: true, blockType: BLOCK_TYPES.GLOWSTONE, maxStack: 64 },
  [BLOCK_TYPES.OBSIDIAN]: { id: BLOCK_TYPES.OBSIDIAN, name: 'Obsidian', isBlock: true, blockType: BLOCK_TYPES.OBSIDIAN, maxStack: 64 },
  [BLOCK_TYPES.DEEPSLATE]: { id: BLOCK_TYPES.DEEPSLATE, name: 'Deepslate', isBlock: true, blockType: BLOCK_TYPES.DEEPSLATE, maxStack: 64 },

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

  // Buckets & Special items
  [ITEM_TYPES.BUCKET]: { id: ITEM_TYPES.BUCKET, name: 'Iron Bucket', isBlock: false, icon: BUCKET_ICON, maxStack: 16 },
  [ITEM_TYPES.WATER_BUCKET]: { id: ITEM_TYPES.WATER_BUCKET, name: 'Water Bucket', isBlock: false, icon: WATER_BUCKET_ICON, maxStack: 1 },
  [ITEM_TYPES.LAVA_BUCKET]: { id: ITEM_TYPES.LAVA_BUCKET, name: 'Lava Bucket', isBlock: false, icon: LAVA_BUCKET_ICON, maxStack: 1 },
  [ITEM_TYPES.GOLDEN_APPLE]: { id: ITEM_TYPES.GOLDEN_APPLE, name: 'Golden Apple', isBlock: false, icon: GOLDEN_APPLE_ICON, maxStack: 64 },
  [ITEM_TYPES.MELON_SLICE]: { id: ITEM_TYPES.MELON_SLICE, name: 'Melon Slice', isBlock: false, icon: MELON_SLICE_ICON, maxStack: 64 },
  [ITEM_TYPES.MUSHROOM_STEW]: { id: ITEM_TYPES.MUSHROOM_STEW, name: 'Mushroom Stew', isBlock: false, icon: MUSHROOM_STEW_ICON, maxStack: 1 },
  [ITEM_TYPES.AMETHYST_SHARD]: { id: ITEM_TYPES.AMETHYST_SHARD, name: 'Amethyst Shard', isBlock: false, icon: AMETHYST_SHARD_ICON, maxStack: 64 },

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

  // Food & Animal Drops
  [ITEM_TYPES.APPLE]: { id: ITEM_TYPES.APPLE, name: 'Red Apple', isBlock: false, icon: APPLE_ICON, maxStack: 64 },
  [ITEM_TYPES.BREAD]: { id: ITEM_TYPES.BREAD, name: 'Bread Loaf', isBlock: false, icon: BREAD_ICON, maxStack: 64 },
  [ITEM_TYPES.RAW_BEEF]: { id: ITEM_TYPES.RAW_BEEF, name: 'Raw Beef', isBlock: false, icon: RAW_BEEF_ICON, maxStack: 64 },
  [ITEM_TYPES.COOKED_BEEF]: { id: ITEM_TYPES.COOKED_BEEF, name: 'Steak', isBlock: false, icon: COOKED_BEEF_ICON, maxStack: 64 },
  [ITEM_TYPES.RAW_PORKCHOP]: { id: ITEM_TYPES.RAW_PORKCHOP, name: 'Raw Porkchop', isBlock: false, icon: RAW_PORKCHOP_ICON, maxStack: 64 },
  [ITEM_TYPES.COOKED_PORKCHOP]: { id: ITEM_TYPES.COOKED_PORKCHOP, name: 'Cooked Porkchop', isBlock: false, icon: COOKED_PORKCHOP_ICON, maxStack: 64 },
  [ITEM_TYPES.RAW_MUTTON]: { id: ITEM_TYPES.RAW_MUTTON, name: 'Raw Mutton', isBlock: false, icon: RAW_MUTTON_ICON, maxStack: 64 },
  [ITEM_TYPES.COOKED_MUTTON]: { id: ITEM_TYPES.COOKED_MUTTON, name: 'Cooked Mutton', isBlock: false, icon: COOKED_MUTTON_ICON, maxStack: 64 },
  [ITEM_TYPES.RAW_CHICKEN]: { id: ITEM_TYPES.RAW_CHICKEN, name: 'Raw Chicken', isBlock: false, icon: RAW_CHICKEN_ICON, maxStack: 64 },
  [ITEM_TYPES.COOKED_CHICKEN]: { id: ITEM_TYPES.COOKED_CHICKEN, name: 'Cooked Chicken', isBlock: false, icon: COOKED_CHICKEN_ICON, maxStack: 64 },
  [ITEM_TYPES.LEATHER]: { id: ITEM_TYPES.LEATHER, name: 'Leather', isBlock: false, icon: LEATHER_ICON, maxStack: 64 },
  [ITEM_TYPES.FEATHER]: { id: ITEM_TYPES.FEATHER, name: 'Feather', isBlock: false, icon: FEATHER_ICON, maxStack: 64 },
  [ITEM_TYPES.EGG]: { id: ITEM_TYPES.EGG, name: 'Egg', isBlock: false, icon: EGG_ICON, maxStack: 16 },

  // Furnace & Spruce Blocks
  [BLOCK_TYPES.FURNACE]: { id: BLOCK_TYPES.FURNACE, name: 'Furnace', isBlock: true, blockType: BLOCK_TYPES.FURNACE, icon: FURNACE_ICON, maxStack: 64 },
  [BLOCK_TYPES.SPRUCE_WOOD]: { id: BLOCK_TYPES.SPRUCE_WOOD, name: 'Spruce Log', isBlock: true, blockType: BLOCK_TYPES.SPRUCE_WOOD, maxStack: 64 },
  [BLOCK_TYPES.SPRUCE_LEAVES]: { id: BLOCK_TYPES.SPRUCE_LEAVES, name: 'Spruce Leaves', isBlock: true, blockType: BLOCK_TYPES.SPRUCE_LEAVES, maxStack: 64 },

  // Nether & Taiga Items & Blocks
  [ITEM_TYPES.SNOWBALL]: { id: ITEM_TYPES.SNOWBALL, name: 'Snowball', isBlock: false, icon: SNOWBALL_ICON, maxStack: 16 },
  [ITEM_TYPES.FLINT_AND_STEEL]: { id: ITEM_TYPES.FLINT_AND_STEEL, name: 'Flint and Steel', isBlock: false, icon: FLINT_AND_STEEL_ICON, maxStack: 1, durability: 64, maxDurability: 64 },
  [ITEM_TYPES.SWEET_BERRIES]: { id: ITEM_TYPES.SWEET_BERRIES, name: 'Sweet Berries', isBlock: false, icon: SWEET_BERRIES_ICON, maxStack: 64 },
  [BLOCK_TYPES.SWEET_BERRY_BUSH]: { id: BLOCK_TYPES.SWEET_BERRY_BUSH, name: 'Sweet Berry Bush', isBlock: true, blockType: BLOCK_TYPES.SWEET_BERRY_BUSH, maxStack: 64 },
  [BLOCK_TYPES.NETHERRACK]: { id: BLOCK_TYPES.NETHERRACK, name: 'Netherrack', isBlock: true, blockType: BLOCK_TYPES.NETHERRACK, icon: NETHERRACK_ICON, maxStack: 64 },
  [BLOCK_TYPES.SOUL_SAND]: { id: BLOCK_TYPES.SOUL_SAND, name: 'Soul Sand', isBlock: true, blockType: BLOCK_TYPES.SOUL_SAND, icon: SOUL_SAND_ICON, maxStack: 64 },
  [BLOCK_TYPES.NETHER_BRICKS]: { id: BLOCK_TYPES.NETHER_BRICKS, name: 'Nether Bricks', isBlock: true, blockType: BLOCK_TYPES.NETHER_BRICKS, icon: NETHER_BRICKS_ICON, maxStack: 64 },
  [BLOCK_TYPES.NETHER_PORTAL]: { id: BLOCK_TYPES.NETHER_PORTAL, name: 'Nether Portal', isBlock: true, blockType: BLOCK_TYPES.NETHER_PORTAL, icon: NETHER_PORTAL_ICON, maxStack: 64 },
};

// Food nutrition ratings for hunger and saturation
export const FOOD_NUTRITION: Record<number, { hunger: number; saturation: number }> = {
  [ITEM_TYPES.APPLE]: { hunger: 4, saturation: 2.4 },
  [ITEM_TYPES.BREAD]: { hunger: 5, saturation: 6.0 },
  [ITEM_TYPES.MELON_SLICE]: { hunger: 2, saturation: 1.2 },
  [ITEM_TYPES.MUSHROOM_STEW]: { hunger: 6, saturation: 7.2 },
  [ITEM_TYPES.GOLDEN_APPLE]: { hunger: 10, saturation: 12.0 },
  [ITEM_TYPES.RAW_BEEF]: { hunger: 3, saturation: 1.8 },
  [ITEM_TYPES.COOKED_BEEF]: { hunger: 8, saturation: 12.8 }, // Steak
  [ITEM_TYPES.RAW_PORKCHOP]: { hunger: 3, saturation: 1.8 },
  [ITEM_TYPES.COOKED_PORKCHOP]: { hunger: 8, saturation: 12.8 },
  [ITEM_TYPES.RAW_MUTTON]: { hunger: 2, saturation: 1.2 },
  [ITEM_TYPES.COOKED_MUTTON]: { hunger: 6, saturation: 9.6 },
  [ITEM_TYPES.RAW_CHICKEN]: { hunger: 2, saturation: 1.2 },
  [ITEM_TYPES.COOKED_CHICKEN]: { hunger: 6, saturation: 7.2 },
  [ITEM_TYPES.SWEET_BERRIES]: { hunger: 2, saturation: 1.2 },
};

// Furnace Smelting conversion recipes
export const SMELTING_RECIPES: Record<number, number> = {
  [ITEM_TYPES.RAW_BEEF]: ITEM_TYPES.COOKED_BEEF,
  [ITEM_TYPES.RAW_PORKCHOP]: ITEM_TYPES.COOKED_PORKCHOP,
  [ITEM_TYPES.RAW_MUTTON]: ITEM_TYPES.COOKED_MUTTON,
  [ITEM_TYPES.RAW_CHICKEN]: ITEM_TYPES.COOKED_CHICKEN,
  [BLOCK_TYPES.IRON_ORE]: ITEM_TYPES.IRON_INGOT,
  [BLOCK_TYPES.GOLD_ORE]: ITEM_TYPES.GOLD_INGOT,
  [BLOCK_TYPES.SAND]: BLOCK_TYPES.GLASS,
  [BLOCK_TYPES.RED_SAND]: BLOCK_TYPES.GLASS,
  [BLOCK_TYPES.WOOD]: ITEM_TYPES.COAL, // Charcoal
  [BLOCK_TYPES.SPRUCE_WOOD]: ITEM_TYPES.COAL,
  [BLOCK_TYPES.BIRCH_WOOD]: ITEM_TYPES.COAL,
  [BLOCK_TYPES.DARK_OAK_WOOD]: ITEM_TYPES.COAL,
  [BLOCK_TYPES.JUNGLE_WOOD]: ITEM_TYPES.COAL,
  [BLOCK_TYPES.NETHERRACK]: BLOCK_TYPES.NETHER_BRICKS,
};

// Fuel burn durations in seconds
export const FUEL_VALUES: Record<number, number> = {
  [ITEM_TYPES.COAL]: 16.0,
  [ITEM_TYPES.LAVA_BUCKET]: 60.0,
  [BLOCK_TYPES.WOOD]: 6.0,
  [BLOCK_TYPES.SPRUCE_WOOD]: 6.0,
  [BLOCK_TYPES.BIRCH_WOOD]: 6.0,
  [BLOCK_TYPES.DARK_OAK_WOOD]: 6.0,
  [BLOCK_TYPES.JUNGLE_WOOD]: 6.0,
  [BLOCK_TYPES.WOOD_PLANKS]: 4.0,
  [ITEM_TYPES.STICK]: 1.5,
  [BLOCK_TYPES.NETHERRACK]: 80.0,
};

export interface CraftingRecipe {
  id: string;
  name: string;
  ingredients: { id: number; count: number }[];
  result: { id: number; count: number };
  pattern?: (number | null)[];
}

export const CRAFTING_RECIPES: CraftingRecipe[] = [
  {
    id: 'snow-block',
    name: 'Snow Block',
    ingredients: [{ id: ITEM_TYPES.SNOWBALL, count: 4 }],
    result: { id: BLOCK_TYPES.SNOW, count: 1 },
    pattern: [
      ITEM_TYPES.SNOWBALL, ITEM_TYPES.SNOWBALL,
      ITEM_TYPES.SNOWBALL, ITEM_TYPES.SNOWBALL,
    ],
  },
  {
    id: 'flint-and-steel',
    name: 'Flint and Steel',
    ingredients: [
      { id: ITEM_TYPES.IRON_INGOT, count: 1 },
      { id: ITEM_TYPES.COAL, count: 1 },
    ],
    result: { id: ITEM_TYPES.FLINT_AND_STEEL, count: 1 },
    pattern: [ITEM_TYPES.IRON_INGOT, null, null, ITEM_TYPES.COAL],
  },
  {
    id: 'nether-bricks-craft',
    name: 'Nether Bricks Block',
    ingredients: [{ id: BLOCK_TYPES.NETHERRACK, count: 4 }],
    result: { id: BLOCK_TYPES.NETHER_BRICKS, count: 1 },
    pattern: [
      BLOCK_TYPES.NETHERRACK, BLOCK_TYPES.NETHERRACK,
      BLOCK_TYPES.NETHERRACK, BLOCK_TYPES.NETHERRACK,
    ],
  },
  {
    id: 'nether-portal-craft',
    name: 'Nether Portal Frame',
    ingredients: [{ id: BLOCK_TYPES.OBSIDIAN, count: 10 }],
    result: { id: BLOCK_TYPES.NETHER_PORTAL, count: 2 },
  },
  {
    id: 'furnace',
    name: 'Furnace',
    ingredients: [{ id: BLOCK_TYPES.STONE, count: 8 }],
    result: { id: BLOCK_TYPES.FURNACE, count: 1 },
  },
  {
    id: 'spruce-to-planks',
    name: 'Spruce Planks',
    ingredients: [{ id: BLOCK_TYPES.SPRUCE_WOOD, count: 1 }],
    result: { id: BLOCK_TYPES.WOOD_PLANKS, count: 4 },
    pattern: [BLOCK_TYPES.SPRUCE_WOOD, null, null, null],
  },
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
    id: 'jungle-to-planks',
    name: 'Jungle Planks',
    ingredients: [{ id: BLOCK_TYPES.JUNGLE_WOOD, count: 1 }],
    result: { id: BLOCK_TYPES.WOOD_PLANKS, count: 4 },
    pattern: [BLOCK_TYPES.JUNGLE_WOOD, null, null, null],
  },
  {
    id: 'dark-oak-to-planks',
    name: 'Dark Oak Planks',
    ingredients: [{ id: BLOCK_TYPES.DARK_OAK_WOOD, count: 1 }],
    result: { id: BLOCK_TYPES.WOOD_PLANKS, count: 4 },
    pattern: [BLOCK_TYPES.DARK_OAK_WOOD, null, null, null],
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
    id: 'bucket',
    name: 'Iron Bucket',
    ingredients: [{ id: ITEM_TYPES.IRON_INGOT, count: 3 }],
    result: { id: ITEM_TYPES.BUCKET, count: 1 },
  },
  {
    id: 'golden-apple',
    name: 'Golden Apple',
    ingredients: [
      { id: ITEM_TYPES.APPLE, count: 1 },
      { id: ITEM_TYPES.GOLD_INGOT, count: 4 },
    ],
    result: { id: ITEM_TYPES.GOLDEN_APPLE, count: 1 },
  },
  {
    id: 'melon-slice',
    name: 'Melon Slices',
    ingredients: [{ id: BLOCK_TYPES.MELON, count: 1 }],
    result: { id: ITEM_TYPES.MELON_SLICE, count: 4 },
  },
  {
    id: 'mushroom-stew',
    name: 'Mushroom Stew',
    ingredients: [
      { id: BLOCK_TYPES.RED_MUSHROOM_BLOCK, count: 1 },
      { id: BLOCK_TYPES.BROWN_MUSHROOM_BLOCK, count: 1 },
    ],
    result: { id: ITEM_TYPES.MUSHROOM_STEW, count: 1 },
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
    id: 'wood-sword',
    name: 'Wooden Sword',
    ingredients: [
      { id: BLOCK_TYPES.WOOD_PLANKS, count: 2 },
      { id: ITEM_TYPES.STICK, count: 1 },
    ],
    result: { id: ITEM_TYPES.WOOD_SWORD, count: 1 },
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
    id: 'diamond-sword',
    name: 'Diamond Sword',
    ingredients: [
      { id: ITEM_TYPES.DIAMOND, count: 2 },
      { id: ITEM_TYPES.STICK, count: 1 },
    ],
    result: { id: ITEM_TYPES.DIAMOND_SWORD, count: 1 },
  },
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
      id: ITEM_TYPES.IRON_PICKAXE,
      count: 1,
      durability: 251,
      maxDurability: 251,
    };
    this.slots[1] = {
      id: ITEM_TYPES.DIAMOND_SWORD,
      count: 1,
      durability: 1562,
      maxDurability: 1562,
    };
    this.slots[2] = { id: ITEM_TYPES.WATER_BUCKET, count: 1 };
    this.slots[3] = { id: BLOCK_TYPES.GRASS, count: 64 };
    this.slots[4] = { id: BLOCK_TYPES.WOOD, count: 32 };
    this.slots[5] = { id: BLOCK_TYPES.TORCH, count: 32 };

    // Extra starter supplies in main inventory showcasing biomes & blocks
    this.slots[6] = { id: BLOCK_TYPES.RED_SAND, count: 64 };
    this.slots[7] = { id: BLOCK_TYPES.TERRACOTTA, count: 64 };
    this.slots[8] = { id: BLOCK_TYPES.DARK_OAK_WOOD, count: 32 };
    this.slots[9] = { id: BLOCK_TYPES.JUNGLE_WOOD, count: 32 };
    this.slots[10] = { id: BLOCK_TYPES.AMETHYST, count: 16 };
    this.slots[11] = { id: BLOCK_TYPES.GLOWSTONE, count: 16 };
    this.slots[12] = { id: BLOCK_TYPES.MELON, count: 16 };
    this.slots[13] = { id: ITEM_TYPES.GOLDEN_APPLE, count: 8 };
    this.slots[14] = { id: ITEM_TYPES.IRON_INGOT, count: 32 };
    this.slots[15] = { id: ITEM_TYPES.DIAMOND, count: 16 };

    // Equip Starter Iron Armor
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

  equipArmor(item: ItemStack): { success: boolean; replacedItem: ItemStack | null } {
    const info = ARMOR_DATA[item.id];
    if (!info) return { success: false, replacedItem: null };

    const idx = info.slotIndex;
    const oldItem = this.armorSlots[idx];
    this.armorSlots[idx] = { ...item, count: 1 };
    return { success: true, replacedItem: oldItem };
  }

  unequipArmor(slotIndex: number): ItemStack | null {
    if (slotIndex < 0 || slotIndex >= 4) return null;
    const item = this.armorSlots[slotIndex];
    this.armorSlots[slotIndex] = null;
    return item;
  }

  addItem(itemId: number, count: number = 1): boolean {
    const def = ITEM_DEFINITIONS[itemId];
    if (!def) return false;

    // 1. Try to stack into existing non-full slots
    for (let i = 0; i < this.slots.length; i++) {
      const slot = this.slots[i];
      if (slot && slot.id === itemId && slot.count < def.maxStack) {
        const canAdd = Math.min(count, def.maxStack - slot.count);
        slot.count += canAdd;
        count -= canAdd;
        if (count === 0) return true;
      }
    }

    // 2. Put remainder into first empty slot
    for (let i = 0; i < this.slots.length; i++) {
      if (!this.slots[i]) {
        const canAdd = Math.min(count, def.maxStack);
        const maxDurability = TOOL_DURABILITIES[itemId];
        this.slots[i] = {
          id: itemId,
          count: canAdd,
          durability: maxDurability,
          maxDurability,
        };
        count -= canAdd;
        if (count === 0) return true;
      }
    }

    return count === 0;
  }

  consumeSelected(): boolean {
    const slot = this.slots[this.selectedHotbarIndex];
    if (!slot) return false;
    slot.count--;
    if (slot.count <= 0) {
      this.slots[this.selectedHotbarIndex] = null;
    }
    return true;
  }

  reduceToolDurability(slotIndex: number, amount: number = 1): boolean {
    const slot = this.slots[slotIndex];
    if (!slot || slot.durability === undefined) return false;

    slot.durability -= amount;
    if (slot.durability <= 0) {
      this.slots[slotIndex] = null;
      return true; // Broke
    }
    return false;
  }

  getSelectedBlockId(): number | null {
    const slot = this.slots[this.selectedHotbarIndex];
    if (!slot) return null;
    const def = ITEM_DEFINITIONS[slot.id];
    if (def && def.isBlock && def.blockType !== undefined) {
      return def.blockType;
    }
    return null;
  }

  getSelectedSlot(): ItemStack | null {
    return this.slots[this.selectedHotbarIndex];
  }

  consumeActiveBlock(): boolean {
    return this.consumeSelected();
  }

  equipArmorItem(item: ItemStack): { success: boolean; replacedItem: ItemStack | null } {
    return this.equipArmor(item);
  }

  unequipArmorSlot(slotIndex: number): ItemStack | null {
    return this.unequipArmor(slotIndex);
  }

  giveItemDirect(itemId: number, count: number = 1): boolean {
    return this.addItem(itemId, count);
  }

  swapSlots(fromIndex: number, toIndex: number) {
    if (fromIndex < 0 || fromIndex >= this.slots.length || toIndex < 0 || toIndex >= this.slots.length) return;
    const temp = this.slots[fromIndex];
    this.slots[fromIndex] = this.slots[toIndex];
    this.slots[toIndex] = temp;
  }

  clearBackpack() {
    for (let i = 6; i < this.slots.length; i++) {
      this.slots[i] = null;
    }
  }

  hasIngredients(recipe: CraftingRecipe): boolean {
    const totalCounts: Record<number, number> = {};
    for (const slot of this.slots) {
      if (slot) {
        totalCounts[slot.id] = (totalCounts[slot.id] || 0) + slot.count;
      }
    }
    for (const ing of recipe.ingredients) {
      if ((totalCounts[ing.id] || 0) < ing.count) {
        return false;
      }
    }
    return true;
  }

  craftRecipe(recipe: CraftingRecipe): boolean {
    if (!this.hasIngredients(recipe)) return false;

    // Deduct ingredients
    for (const ing of recipe.ingredients) {
      let needed = ing.count;
      for (let i = 0; i < this.slots.length; i++) {
        const slot = this.slots[i];
        if (slot && slot.id === ing.id) {
          const take = Math.min(needed, slot.count);
          slot.count -= take;
          needed -= take;
          if (slot.count <= 0) {
            this.slots[i] = null;
          }
          if (needed <= 0) break;
        }
      }
    }

    this.addItem(recipe.result.id, recipe.result.count);
    return true;
  }

  getActiveToolSpeedMultiplier(blockType: number): number {
    const activeItem = this.slots[this.selectedHotbarIndex];
    if (!activeItem) return 1.0;

    if (activeItem.id === ITEM_TYPES.DIAMOND_PICKAXE) return 5.0;
    if (activeItem.id === ITEM_TYPES.IRON_PICKAXE) return 3.2;
    if (activeItem.id === ITEM_TYPES.STONE_PICKAXE) return 2.0;
    if (activeItem.id === ITEM_TYPES.WOOD_PICKAXE) return 1.4;
    return 1.0;
  }

  getDropForBlock(blockType: number): number {
    if (blockType === BLOCK_TYPES.COAL_ORE) return ITEM_TYPES.COAL;
    if (blockType === BLOCK_TYPES.IRON_ORE) return ITEM_TYPES.IRON_INGOT;
    if (blockType === BLOCK_TYPES.GOLD_ORE) return ITEM_TYPES.GOLD_INGOT;
    if (blockType === BLOCK_TYPES.DIAMOND_ORE) return ITEM_TYPES.DIAMOND;
    if (blockType === BLOCK_TYPES.AMETHYST) return ITEM_TYPES.AMETHYST_SHARD;
    if (blockType === BLOCK_TYPES.MELON) return ITEM_TYPES.MELON_SLICE;
    return blockType;
  }

  damageActiveTool(amount: number = 1): { destroyed: boolean; toolId?: number } {
    const activeItem = this.slots[this.selectedHotbarIndex];
    if (!activeItem || activeItem.durability === undefined) return { destroyed: false };

    const toolId = activeItem.id;
    const broke = this.reduceToolDurability(this.selectedHotbarIndex, amount);
    return { destroyed: broke, toolId };
  }

  checkCraftingResult(): ItemStack | null {
    const gridItems = this.craftingGrid.filter((s): s is ItemStack => s !== null && s.count > 0);
    if (gridItems.length === 0) return null;

    for (const recipe of CRAFTING_RECIPES) {
      if (recipe.pattern) {
        let matches = true;
        for (let i = 0; i < 4; i++) {
          const reqId = recipe.pattern[i];
          const slot = this.craftingGrid[i];
          if (reqId === null && slot !== null) {
            matches = false;
            break;
          }
          if (reqId !== null && (!slot || slot.id !== reqId)) {
            matches = false;
            break;
          }
        }
        if (matches) {
          const maxDurability = TOOL_DURABILITIES[recipe.result.id];
          return {
            id: recipe.result.id,
            count: recipe.result.count,
            durability: maxDurability,
            maxDurability,
          };
        }
      } else {
        const counts: Record<number, number> = {};
        for (const item of gridItems) {
          counts[item.id] = (counts[item.id] || 0) + 1;
        }

        let recipeMatches = true;
        for (const ing of recipe.ingredients) {
          if ((counts[ing.id] || 0) < ing.count) {
            recipeMatches = false;
            break;
          }
        }

        if (recipeMatches) {
          const maxDurability = TOOL_DURABILITIES[recipe.result.id];
          return {
            id: recipe.result.id,
            count: recipe.result.count,
            durability: maxDurability,
            maxDurability,
          };
        }
      }
    }
    return null;
  }

  craft(): boolean {
    const result = this.checkCraftingResult();
    if (!result) return false;

    for (let i = 0; i < 4; i++) {
      const slot = this.craftingGrid[i];
      if (slot) {
        slot.count--;
        if (slot.count <= 0) {
          this.craftingGrid[i] = null;
        }
      }
    }

    this.addItem(result.id, result.count);
    return true;
  }
}
