// Procedural pixel icons for tools and craftable items
function createPixelIcon(drawFn: (ctx: CanvasRenderingContext2D, size: number) => void): string {
  const canvas = document.createElement('canvas');
  canvas.width = 16;
  canvas.height = 16;
  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;
  drawFn(ctx, 16);
  return canvas.toDataURL('image/png');
}

// Wooden Stick icon
export const STICK_ICON = createPixelIcon((ctx) => {
  ctx.fillStyle = '#6b4f10';
  for (let i = 3; i <= 12; i++) {
    ctx.fillRect(15 - i, i, 2, 2);
  }
  ctx.fillStyle = '#b8860b';
  for (let i = 4; i <= 11; i++) {
    ctx.fillRect(15 - i, i, 1, 1);
  }
});

// Wooden Pickaxe icon
export const WOOD_PICKAXE_ICON = createPixelIcon((ctx) => {
  // Handle (Stick)
  ctx.fillStyle = '#6b4f10';
  for (let i = 5; i <= 13; i++) {
    ctx.fillRect(15 - i, i, 1, 1);
  }
  // Pickaxe head (Wood)
  ctx.fillStyle = '#b8860b';
  ctx.fillRect(8, 2, 6, 2);
  ctx.fillRect(12, 4, 2, 4);
  ctx.fillRect(4, 3, 2, 2);
  ctx.fillRect(2, 5, 2, 2);
  ctx.fillStyle = '#d4a32e';
  ctx.fillRect(9, 2, 4, 1);
});

// Stone Pickaxe icon
export const STONE_PICKAXE_ICON = createPixelIcon((ctx) => {
  // Handle
  ctx.fillStyle = '#6b4f10';
  for (let i = 5; i <= 13; i++) {
    ctx.fillRect(15 - i, i, 1, 1);
  }
  // Head (Stone)
  ctx.fillStyle = '#777777';
  ctx.fillRect(8, 2, 6, 2);
  ctx.fillRect(12, 4, 2, 4);
  ctx.fillRect(4, 3, 2, 2);
  ctx.fillRect(2, 5, 2, 2);
  ctx.fillStyle = '#9e9e9e';
  ctx.fillRect(9, 2, 4, 1);
});

// Wooden Sword icon
export const WOOD_SWORD_ICON = createPixelIcon((ctx) => {
  // Blade
  ctx.fillStyle = '#b8860b';
  for (let i = 3; i <= 8; i++) {
    ctx.fillRect(i + 2, 13 - i, 2, 2);
  }
  ctx.fillStyle = '#d4a32e';
  for (let i = 3; i <= 8; i++) {
    ctx.fillRect(i + 2, 13 - i, 1, 1);
  }
  // Guard
  ctx.fillStyle = '#543d0e';
  ctx.fillRect(5, 10, 3, 1);
  ctx.fillRect(4, 11, 1, 3);
  // Handle
  ctx.fillStyle = '#6b4f10';
  ctx.fillRect(3, 12, 2, 2);
  ctx.fillRect(2, 13, 2, 2);
});

// Coal Lump icon
export const COAL_ICON = createPixelIcon((ctx) => {
  ctx.fillStyle = '#1c1c1c';
  ctx.fillRect(5, 5, 6, 6);
  ctx.fillRect(4, 7, 8, 3);
  ctx.fillStyle = '#3a3a3a';
  ctx.fillRect(6, 6, 2, 2);
  ctx.fillRect(8, 9, 2, 1);
});

// Iron Ingot icon
export const IRON_INGOT_ICON = createPixelIcon((ctx) => {
  ctx.fillStyle = '#b0bec5';
  ctx.fillRect(4, 6, 8, 4);
  ctx.fillStyle = '#eceff1';
  ctx.fillRect(4, 5, 7, 2);
  ctx.fillStyle = '#78909c';
  ctx.fillRect(5, 9, 7, 1);
});

// Gold Ingot icon
export const GOLD_INGOT_ICON = createPixelIcon((ctx) => {
  ctx.fillStyle = '#ffd32a';
  ctx.fillRect(4, 6, 8, 4);
  ctx.fillStyle = '#fff275';
  ctx.fillRect(4, 5, 7, 2);
  ctx.fillStyle = '#d48b00';
  ctx.fillRect(5, 9, 7, 1);
});

// Diamond Gem icon
export const DIAMOND_ICON = createPixelIcon((ctx) => {
  ctx.fillStyle = '#00d2d3';
  ctx.fillRect(6, 3, 4, 3);
  ctx.fillRect(4, 6, 8, 4);
  ctx.fillRect(6, 10, 4, 3);
  ctx.fillStyle = '#c7ecee';
  ctx.fillRect(6, 4, 2, 2);
  ctx.fillRect(5, 6, 2, 2);
});

// Iron Pickaxe icon
export const IRON_PICKAXE_ICON = createPixelIcon((ctx) => {
  ctx.fillStyle = '#6b4f10';
  for (let i = 5; i <= 13; i++) ctx.fillRect(15 - i, i, 1, 1);
  ctx.fillStyle = '#cfd8dc';
  ctx.fillRect(8, 2, 6, 2);
  ctx.fillRect(12, 4, 2, 4);
  ctx.fillRect(4, 3, 2, 2);
  ctx.fillRect(2, 5, 2, 2);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(9, 2, 4, 1);
});

// Diamond Pickaxe icon
export const DIAMOND_PICKAXE_ICON = createPixelIcon((ctx) => {
  ctx.fillStyle = '#6b4f10';
  for (let i = 5; i <= 13; i++) ctx.fillRect(15 - i, i, 1, 1);
  ctx.fillStyle = '#00d2d3';
  ctx.fillRect(8, 2, 6, 2);
  ctx.fillRect(12, 4, 2, 4);
  ctx.fillRect(4, 3, 2, 2);
  ctx.fillRect(2, 5, 2, 2);
  ctx.fillStyle = '#c7ecee';
  ctx.fillRect(9, 2, 4, 1);
});

// Diamond Sword icon
export const DIAMOND_SWORD_ICON = createPixelIcon((ctx) => {
  ctx.fillStyle = '#00d2d3';
  for (let i = 3; i <= 8; i++) ctx.fillRect(i + 2, 13 - i, 2, 2);
  ctx.fillStyle = '#c7ecee';
  for (let i = 3; i <= 8; i++) ctx.fillRect(i + 2, 13 - i, 1, 1);
  ctx.fillStyle = '#543d0e';
  ctx.fillRect(5, 10, 3, 1);
  ctx.fillRect(4, 11, 1, 3);
  ctx.fillStyle = '#6b4f10';
  ctx.fillRect(3, 12, 2, 2);
  ctx.fillRect(2, 13, 2, 2);
});

// Iron Sword icon
export const IRON_SWORD_ICON = createPixelIcon((ctx) => {
  ctx.fillStyle = '#cfd8dc';
  for (let i = 3; i <= 8; i++) ctx.fillRect(i + 2, 13 - i, 2, 2);
  ctx.fillStyle = '#ffffff';
  for (let i = 3; i <= 8; i++) ctx.fillRect(i + 2, 13 - i, 1, 1);
  ctx.fillStyle = '#543d0e';
  ctx.fillRect(5, 10, 3, 1);
  ctx.fillRect(4, 11, 1, 3);
  ctx.fillStyle = '#6b4f10';
  ctx.fillRect(3, 12, 2, 2);
  ctx.fillRect(2, 13, 2, 2);
});

// --- HELMET ICONS ---
export const IRON_HELMET_ICON = createPixelIcon((ctx) => {
  ctx.fillStyle = '#cfd8dc';
  ctx.fillRect(4, 3, 8, 4);
  ctx.fillRect(3, 5, 10, 6);
  ctx.fillRect(3, 7, 2, 5);
  ctx.fillRect(11, 7, 2, 5);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(5, 4, 6, 1);
  ctx.fillRect(4, 5, 1, 3);
  ctx.fillStyle = '#90a4ae';
  ctx.fillRect(3, 11, 2, 1);
  ctx.fillRect(11, 11, 2, 1);
});

export const DIAMOND_HELMET_ICON = createPixelIcon((ctx) => {
  ctx.fillStyle = '#00d2d3';
  ctx.fillRect(4, 3, 8, 4);
  ctx.fillRect(3, 5, 10, 6);
  ctx.fillRect(3, 7, 2, 5);
  ctx.fillRect(11, 7, 2, 5);
  ctx.fillStyle = '#c7ecee';
  ctx.fillRect(5, 4, 6, 1);
  ctx.fillRect(4, 5, 1, 3);
  ctx.fillStyle = '#0097a7';
  ctx.fillRect(3, 11, 2, 1);
  ctx.fillRect(11, 11, 2, 1);
});

export const GOLD_HELMET_ICON = createPixelIcon((ctx) => {
  ctx.fillStyle = '#ffd32a';
  ctx.fillRect(4, 3, 8, 4);
  ctx.fillRect(3, 5, 10, 6);
  ctx.fillRect(3, 7, 2, 5);
  ctx.fillRect(11, 7, 2, 5);
  ctx.fillStyle = '#fff275';
  ctx.fillRect(5, 4, 6, 1);
  ctx.fillStyle = '#d48b00';
  ctx.fillRect(3, 11, 2, 1);
  ctx.fillRect(11, 11, 2, 1);
});

export const LEATHER_HELMET_ICON = createPixelIcon((ctx) => {
  ctx.fillStyle = '#8d5524';
  ctx.fillRect(4, 3, 8, 4);
  ctx.fillRect(3, 5, 10, 6);
  ctx.fillRect(3, 7, 2, 5);
  ctx.fillRect(11, 7, 2, 5);
  ctx.fillStyle = '#a66832';
  ctx.fillRect(5, 4, 6, 1);
  ctx.fillStyle = '#5c3311';
  ctx.fillRect(3, 11, 2, 1);
  ctx.fillRect(11, 11, 2, 1);
});

// --- CHESTPLATE ICONS ---
export const IRON_CHESTPLATE_ICON = createPixelIcon((ctx) => {
  ctx.fillStyle = '#cfd8dc';
  ctx.fillRect(3, 3, 10, 10);
  ctx.fillRect(2, 4, 2, 5);
  ctx.fillRect(12, 4, 2, 5);
  // Cutout neck
  ctx.clearRect(6, 3, 4, 3);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(3, 3, 2, 2);
  ctx.fillRect(11, 3, 2, 2);
  ctx.fillRect(4, 6, 2, 4);
  ctx.fillStyle = '#90a4ae';
  ctx.fillRect(3, 12, 10, 1);
});

export const DIAMOND_CHESTPLATE_ICON = createPixelIcon((ctx) => {
  ctx.fillStyle = '#00d2d3';
  ctx.fillRect(3, 3, 10, 10);
  ctx.fillRect(2, 4, 2, 5);
  ctx.fillRect(12, 4, 2, 5);
  ctx.clearRect(6, 3, 4, 3);
  ctx.fillStyle = '#c7ecee';
  ctx.fillRect(3, 3, 2, 2);
  ctx.fillRect(11, 3, 2, 2);
  ctx.fillRect(4, 6, 2, 4);
  ctx.fillStyle = '#0097a7';
  ctx.fillRect(3, 12, 10, 1);
});

export const GOLD_CHESTPLATE_ICON = createPixelIcon((ctx) => {
  ctx.fillStyle = '#ffd32a';
  ctx.fillRect(3, 3, 10, 10);
  ctx.fillRect(2, 4, 2, 5);
  ctx.fillRect(12, 4, 2, 5);
  ctx.clearRect(6, 3, 4, 3);
  ctx.fillStyle = '#fff275';
  ctx.fillRect(3, 3, 2, 2);
  ctx.fillRect(11, 3, 2, 2);
  ctx.fillStyle = '#d48b00';
  ctx.fillRect(3, 12, 10, 1);
});

export const LEATHER_CHESTPLATE_ICON = createPixelIcon((ctx) => {
  ctx.fillStyle = '#8d5524';
  ctx.fillRect(3, 3, 10, 10);
  ctx.fillRect(2, 4, 2, 5);
  ctx.fillRect(12, 4, 2, 5);
  ctx.clearRect(6, 3, 4, 3);
  ctx.fillStyle = '#a66832';
  ctx.fillRect(3, 3, 2, 2);
  ctx.fillRect(11, 3, 2, 2);
  ctx.fillStyle = '#5c3311';
  ctx.fillRect(3, 12, 10, 1);
});

// --- LEGGINGS ICONS ---
export const IRON_LEGGINGS_ICON = createPixelIcon((ctx) => {
  ctx.fillStyle = '#cfd8dc';
  ctx.fillRect(3, 2, 10, 4);
  ctx.fillRect(3, 6, 4, 8);
  ctx.fillRect(9, 6, 4, 8);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(4, 3, 2, 2);
  ctx.fillRect(4, 7, 1, 6);
  ctx.fillStyle = '#90a4ae';
  ctx.fillRect(3, 13, 4, 1);
  ctx.fillRect(9, 13, 4, 1);
});

export const DIAMOND_LEGGINGS_ICON = createPixelIcon((ctx) => {
  ctx.fillStyle = '#00d2d3';
  ctx.fillRect(3, 2, 10, 4);
  ctx.fillRect(3, 6, 4, 8);
  ctx.fillRect(9, 6, 4, 8);
  ctx.fillStyle = '#c7ecee';
  ctx.fillRect(4, 3, 2, 2);
  ctx.fillRect(4, 7, 1, 6);
  ctx.fillStyle = '#0097a7';
  ctx.fillRect(3, 13, 4, 1);
  ctx.fillRect(9, 13, 4, 1);
});

export const GOLD_LEGGINGS_ICON = createPixelIcon((ctx) => {
  ctx.fillStyle = '#ffd32a';
  ctx.fillRect(3, 2, 10, 4);
  ctx.fillRect(3, 6, 4, 8);
  ctx.fillRect(9, 6, 4, 8);
  ctx.fillStyle = '#fff275';
  ctx.fillRect(4, 3, 2, 2);
  ctx.fillStyle = '#d48b00';
  ctx.fillRect(3, 13, 4, 1);
  ctx.fillRect(9, 13, 4, 1);
});

export const LEATHER_LEGGINGS_ICON = createPixelIcon((ctx) => {
  ctx.fillStyle = '#8d5524';
  ctx.fillRect(3, 2, 10, 4);
  ctx.fillRect(3, 6, 4, 8);
  ctx.fillRect(9, 6, 4, 8);
  ctx.fillStyle = '#a66832';
  ctx.fillRect(4, 3, 2, 2);
  ctx.fillStyle = '#5c3311';
  ctx.fillRect(3, 13, 4, 1);
  ctx.fillRect(9, 13, 4, 1);
});

// --- BOOTS ICONS ---
export const IRON_BOOTS_ICON = createPixelIcon((ctx) => {
  ctx.fillStyle = '#cfd8dc';
  ctx.fillRect(3, 7, 4, 6);
  ctx.fillRect(2, 10, 5, 3);
  ctx.fillRect(9, 7, 4, 6);
  ctx.fillRect(9, 10, 5, 3);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(4, 8, 2, 2);
  ctx.fillRect(10, 8, 2, 2);
  ctx.fillStyle = '#90a4ae';
  ctx.fillRect(2, 12, 5, 1);
  ctx.fillRect(9, 12, 5, 1);
});

export const DIAMOND_BOOTS_ICON = createPixelIcon((ctx) => {
  ctx.fillStyle = '#00d2d3';
  ctx.fillRect(3, 7, 4, 6);
  ctx.fillRect(2, 10, 5, 3);
  ctx.fillRect(9, 7, 4, 6);
  ctx.fillRect(9, 10, 5, 3);
  ctx.fillStyle = '#c7ecee';
  ctx.fillRect(4, 8, 2, 2);
  ctx.fillRect(10, 8, 2, 2);
  ctx.fillStyle = '#0097a7';
  ctx.fillRect(2, 12, 5, 1);
  ctx.fillRect(9, 12, 5, 1);
});

export const GOLD_BOOTS_ICON = createPixelIcon((ctx) => {
  ctx.fillStyle = '#ffd32a';
  ctx.fillRect(3, 7, 4, 6);
  ctx.fillRect(2, 10, 5, 3);
  ctx.fillRect(9, 7, 4, 6);
  ctx.fillRect(9, 10, 5, 3);
  ctx.fillStyle = '#fff275';
  ctx.fillRect(4, 8, 2, 2);
  ctx.fillRect(10, 8, 2, 2);
  ctx.fillStyle = '#d48b00';
  ctx.fillRect(2, 12, 5, 1);
  ctx.fillRect(9, 12, 5, 1);
});

export const LEATHER_BOOTS_ICON = createPixelIcon((ctx) => {
  ctx.fillStyle = '#8d5524';
  ctx.fillRect(3, 7, 4, 6);
  ctx.fillRect(2, 10, 5, 3);
  ctx.fillRect(9, 7, 4, 6);
  ctx.fillRect(9, 10, 5, 3);
  ctx.fillStyle = '#a66832';
  ctx.fillRect(4, 8, 2, 2);
  ctx.fillRect(10, 8, 2, 2);
  ctx.fillStyle = '#5c3311';
  ctx.fillRect(2, 12, 5, 1);
  ctx.fillRect(9, 12, 5, 1);
});

// Food icons
export const APPLE_ICON = createPixelIcon((ctx) => {
  ctx.fillStyle = '#ff3838';
  ctx.fillRect(4, 5, 8, 7);
  ctx.fillRect(5, 4, 6, 9);
  ctx.fillRect(6, 3, 4, 11);
  ctx.fillStyle = '#ff7675';
  ctx.fillRect(5, 5, 2, 2);
  ctx.fillStyle = '#795548';
  ctx.fillRect(8, 2, 1, 2);
  ctx.fillStyle = '#2ed573';
  ctx.fillRect(9, 2, 2, 1);
});

export const BREAD_ICON = createPixelIcon((ctx) => {
  ctx.fillStyle = '#8d5524';
  ctx.fillRect(3, 7, 10, 4);
  ctx.fillRect(4, 6, 8, 6);
  ctx.fillStyle = '#c99b79';
  ctx.fillRect(5, 7, 2, 2);
  ctx.fillRect(9, 7, 2, 2);
});

// Bucket Icon
export const BUCKET_ICON = createPixelIcon((ctx) => {
  ctx.fillStyle = '#b0bec5';
  ctx.fillRect(4, 4, 8, 8);
  ctx.clearRect(6, 4, 4, 7);
  ctx.fillStyle = '#eceff1';
  ctx.fillRect(4, 4, 2, 8);
  ctx.fillStyle = '#78909c';
  ctx.fillRect(10, 4, 2, 8);
  ctx.fillRect(4, 11, 8, 2);
});

// Water Bucket Icon
export const WATER_BUCKET_ICON = createPixelIcon((ctx) => {
  ctx.fillStyle = '#b0bec5';
  ctx.fillRect(4, 4, 8, 8);
  ctx.fillStyle = '#2979ff';
  ctx.fillRect(6, 5, 4, 6);
  ctx.fillStyle = '#eceff1';
  ctx.fillRect(4, 4, 2, 8);
  ctx.fillStyle = '#78909c';
  ctx.fillRect(10, 4, 2, 8);
  ctx.fillRect(4, 11, 8, 2);
});

// Lava Bucket Icon
export const LAVA_BUCKET_ICON = createPixelIcon((ctx) => {
  ctx.fillStyle = '#b0bec5';
  ctx.fillRect(4, 4, 8, 8);
  ctx.fillStyle = '#ff3d00';
  ctx.fillRect(6, 5, 4, 6);
  ctx.fillStyle = '#ff9100';
  ctx.fillRect(7, 6, 2, 3);
  ctx.fillStyle = '#eceff1';
  ctx.fillRect(4, 4, 2, 8);
  ctx.fillStyle = '#78909c';
  ctx.fillRect(10, 4, 2, 8);
  ctx.fillRect(4, 11, 8, 2);
});

// Golden Apple Icon
export const GOLDEN_APPLE_ICON = createPixelIcon((ctx) => {
  ctx.fillStyle = '#ffd32a';
  ctx.fillRect(4, 5, 8, 7);
  ctx.fillRect(5, 4, 6, 9);
  ctx.fillRect(6, 3, 4, 11);
  ctx.fillStyle = '#fff275';
  ctx.fillRect(5, 5, 2, 2);
  ctx.fillStyle = '#795548';
  ctx.fillRect(8, 2, 1, 2);
  ctx.fillStyle = '#d48b00';
  ctx.fillRect(9, 2, 2, 1);
});

// Melon Slice Icon
export const MELON_SLICE_ICON = createPixelIcon((ctx) => {
  ctx.fillStyle = '#ff3838';
  ctx.fillRect(4, 6, 7, 7);
  ctx.fillStyle = '#2ed573';
  ctx.fillRect(3, 13, 9, 2);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(3, 12, 9, 1);
  ctx.fillStyle = '#1e272e';
  ctx.fillRect(6, 8, 1, 1);
  ctx.fillRect(8, 10, 1, 1);
});

// Mushroom Stew Icon
export const MUSHROOM_STEW_ICON = createPixelIcon((ctx) => {
  ctx.fillStyle = '#8d5524';
  ctx.fillRect(4, 8, 8, 5);
  ctx.fillStyle = '#dcd0bc';
  ctx.fillRect(5, 7, 6, 2);
  ctx.fillStyle = '#e53935';
  ctx.fillRect(6, 6, 2, 2);
  ctx.fillStyle = '#795548';
  ctx.fillRect(8, 6, 2, 2);
});

// Amethyst Shard Icon
export const AMETHYST_SHARD_ICON = createPixelIcon((ctx) => {
  ctx.fillStyle = '#9b59b6';
  ctx.fillRect(6, 3, 4, 9);
  ctx.fillRect(5, 5, 6, 5);
  ctx.fillStyle = '#e8d7f1';
  ctx.fillRect(7, 4, 2, 4);
  ctx.fillStyle = '#5c2d91';
  ctx.fillRect(6, 9, 3, 3);
});

// Raw Beef Icon
export const RAW_BEEF_ICON = createPixelIcon((ctx) => {
  ctx.fillStyle = '#b71c1c';
  ctx.fillRect(4, 5, 8, 6);
  ctx.fillRect(5, 4, 6, 8);
  // White fat marbling
  ctx.fillStyle = '#ffcdd2';
  ctx.fillRect(5, 6, 2, 1);
  ctx.fillRect(8, 8, 2, 1);
  ctx.fillRect(6, 9, 3, 1);
  // Darker shadow
  ctx.fillStyle = '#7f0000';
  ctx.fillRect(4, 10, 7, 2);
});

// Cooked Beef (Steak) Icon
export const COOKED_BEEF_ICON = createPixelIcon((ctx) => {
  ctx.fillStyle = '#5d4037';
  ctx.fillRect(4, 5, 8, 6);
  ctx.fillRect(5, 4, 6, 8);
  // Grill marks & highlights
  ctx.fillStyle = '#271c19';
  ctx.fillRect(5, 6, 6, 1);
  ctx.fillRect(5, 8, 6, 1);
  ctx.fillStyle = '#8d6e63';
  ctx.fillRect(6, 5, 4, 1);
  ctx.fillRect(6, 7, 4, 1);
});

// Raw Porkchop Icon
export const RAW_PORKCHOP_ICON = createPixelIcon((ctx) => {
  ctx.fillStyle = '#f48fb1';
  ctx.fillRect(4, 5, 8, 6);
  ctx.fillRect(5, 4, 7, 7);
  // White bone / fat edge
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(3, 7, 2, 3);
  ctx.fillStyle = '#c2185b';
  ctx.fillRect(6, 6, 4, 3);
});

// Cooked Porkchop Icon
export const COOKED_PORKCHOP_ICON = createPixelIcon((ctx) => {
  ctx.fillStyle = '#bcaaa4';
  ctx.fillRect(4, 5, 8, 6);
  ctx.fillRect(5, 4, 7, 7);
  // Golden savory crust
  ctx.fillStyle = '#6d4c41';
  ctx.fillRect(5, 5, 6, 2);
  ctx.fillRect(6, 8, 5, 2);
  ctx.fillStyle = '#3e2723';
  ctx.fillRect(3, 7, 2, 3); // Bone
});

// Raw Mutton Icon
export const RAW_MUTTON_ICON = createPixelIcon((ctx) => {
  ctx.fillStyle = '#c62828';
  ctx.fillRect(4, 6, 8, 5);
  ctx.fillRect(5, 5, 6, 7);
  ctx.fillStyle = '#ff8a80';
  ctx.fillRect(5, 7, 3, 2);
  ctx.fillStyle = '#eeeeee';
  ctx.fillRect(10, 5, 2, 2); // bone tip
});

// Cooked Mutton Icon
export const COOKED_MUTTON_ICON = createPixelIcon((ctx) => {
  ctx.fillStyle = '#4e342e';
  ctx.fillRect(4, 6, 8, 5);
  ctx.fillRect(5, 5, 6, 7);
  ctx.fillStyle = '#795548';
  ctx.fillRect(5, 7, 4, 2);
  ctx.fillStyle = '#d7ccc8';
  ctx.fillRect(10, 5, 2, 2);
});

// Raw Chicken Icon
export const RAW_CHICKEN_ICON = createPixelIcon((ctx) => {
  ctx.fillStyle = '#ffcdd2';
  ctx.fillRect(5, 6, 6, 5);
  ctx.fillRect(6, 5, 5, 6);
  ctx.fillStyle = '#ef9a9a';
  ctx.fillRect(6, 7, 3, 3);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(4, 9, 2, 2); // bone knob
});

// Cooked Chicken Icon
export const COOKED_CHICKEN_ICON = createPixelIcon((ctx) => {
  ctx.fillStyle = '#8d6e63';
  ctx.fillRect(5, 6, 6, 5);
  ctx.fillRect(6, 5, 5, 6);
  ctx.fillStyle = '#d7ccc8';
  ctx.fillRect(4, 9, 2, 2); // bone knob
  ctx.fillStyle = '#4e342e';
  ctx.fillRect(7, 7, 3, 2);
});

// Leather Icon
export const LEATHER_ICON = createPixelIcon((ctx) => {
  ctx.fillStyle = '#8d5524';
  ctx.fillRect(4, 4, 8, 8);
  ctx.fillRect(3, 5, 10, 6);
  ctx.fillRect(5, 3, 6, 10);
  ctx.fillStyle = '#5c3817';
  ctx.fillRect(6, 6, 4, 4);
});

// Feather Icon
export const FEATHER_ICON = createPixelIcon((ctx) => {
  ctx.fillStyle = '#eceff1';
  ctx.fillRect(6, 3, 4, 3);
  ctx.fillRect(5, 5, 5, 4);
  ctx.fillRect(4, 8, 5, 4);
  ctx.fillStyle = '#b0bec5';
  ctx.fillRect(7, 4, 1, 9); // Quill
  ctx.fillRect(3, 12, 2, 2);
});

// Egg Icon
export const EGG_ICON = createPixelIcon((ctx) => {
  ctx.fillStyle = '#eceff1';
  ctx.fillRect(5, 5, 6, 7);
  ctx.fillRect(6, 4, 4, 9);
  ctx.fillStyle = '#cfd8dc';
  ctx.fillRect(7, 10, 3, 2);
});

// Furnace Block Icon
export const FURNACE_ICON = createPixelIcon((ctx) => {
  ctx.fillStyle = '#616161';
  ctx.fillRect(2, 2, 12, 12);
  ctx.fillStyle = '#757575';
  ctx.fillRect(3, 3, 10, 2);
  // Dark furnace opening
  ctx.fillStyle = '#212121';
  ctx.fillRect(4, 6, 8, 6);
  // Grate
  ctx.fillStyle = '#424242';
  ctx.fillRect(5, 8, 6, 1);
  ctx.fillRect(7, 6, 2, 6);
});

// Snowball Item Icon
export const SNOWBALL_ICON = createPixelIcon((ctx) => {
  ctx.fillStyle = '#e1f5fe';
  ctx.beginPath();
  ctx.arc(8, 8, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(7, 7, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#b3e5fc';
  ctx.fillRect(8, 10, 3, 2);
  ctx.fillRect(9, 9, 2, 1);
});

// Flint and Steel Item Icon
export const FLINT_AND_STEEL_ICON = createPixelIcon((ctx) => {
  // Curved iron striker
  ctx.fillStyle = '#b0bec5';
  ctx.fillRect(5, 4, 6, 2);
  ctx.fillRect(10, 5, 2, 6);
  ctx.fillRect(5, 9, 6, 2);
  ctx.fillStyle = '#78909c';
  ctx.fillRect(4, 5, 2, 5);
  // Dark flint piece
  ctx.fillStyle = '#263238';
  ctx.fillRect(6, 6, 4, 4);
  // Golden spark
  ctx.fillStyle = '#ffeb3b';
  ctx.fillRect(7, 5, 2, 2);
  ctx.fillStyle = '#ff9800';
  ctx.fillRect(8, 4, 1, 1);
});

// Sweet Berries Icon
export const SWEET_BERRIES_ICON = createPixelIcon((ctx) => {
  // Little green stem
  ctx.fillStyle = '#2e7d32';
  ctx.fillRect(7, 3, 2, 3);
  // Berries cluster
  ctx.fillStyle = '#d32f2f';
  ctx.fillRect(5, 6, 4, 4);
  ctx.fillRect(8, 7, 4, 4);
  ctx.fillRect(6, 9, 4, 4);
  // Highlights
  ctx.fillStyle = '#ff5252';
  ctx.fillRect(5, 6, 2, 2);
  ctx.fillRect(8, 7, 2, 2);
  ctx.fillRect(6, 9, 2, 2);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(6, 7, 1, 1);
  ctx.fillRect(9, 8, 1, 1);
});

// Netherrack Block Icon
export const NETHERRACK_ICON = createPixelIcon((ctx) => {
  ctx.fillStyle = '#6b1b1b';
  ctx.fillRect(2, 2, 12, 12);
  ctx.fillStyle = '#8a2525';
  ctx.fillRect(3, 3, 3, 3);
  ctx.fillRect(8, 4, 4, 3);
  ctx.fillRect(4, 9, 4, 3);
  ctx.fillStyle = '#420f0f';
  ctx.fillRect(7, 7, 3, 3);
  ctx.fillRect(10, 10, 3, 3);
});

// Soul Sand Block Icon
export const SOUL_SAND_ICON = createPixelIcon((ctx) => {
  ctx.fillStyle = '#49372b';
  ctx.fillRect(2, 2, 12, 12);
  ctx.fillStyle = '#241a13';
  ctx.fillRect(4, 5, 2, 2);
  ctx.fillRect(8, 5, 2, 2);
  ctx.fillRect(5, 8, 4, 2);
});

// Nether Bricks Block Icon
export const NETHER_BRICKS_ICON = createPixelIcon((ctx) => {
  ctx.fillStyle = '#2c1519';
  ctx.fillRect(2, 2, 12, 12);
  ctx.fillStyle = '#1b0c0e';
  ctx.fillRect(2, 6, 12, 1);
  ctx.fillRect(2, 10, 12, 1);
  ctx.fillRect(7, 2, 1, 4);
  ctx.fillRect(5, 7, 1, 3);
  ctx.fillRect(10, 7, 1, 3);
  ctx.fillRect(8, 11, 1, 3);
  ctx.fillStyle = '#3f1f25';
  ctx.fillRect(3, 3, 3, 2);
  ctx.fillRect(8, 3, 3, 2);
});

// Nether Portal Icon
export const NETHER_PORTAL_ICON = createPixelIcon((ctx) => {
  ctx.fillStyle = '#120024';
  ctx.fillRect(2, 2, 12, 12);
  ctx.fillStyle = '#4a148c';
  ctx.fillRect(3, 3, 10, 10);
  ctx.fillStyle = '#7b1fa2';
  ctx.fillRect(4, 5, 8, 6);
  ctx.fillStyle = '#ab47bc';
  ctx.fillRect(6, 6, 4, 4);
  ctx.fillStyle = '#e1bee7';
  ctx.fillRect(7, 7, 2, 2);
});




