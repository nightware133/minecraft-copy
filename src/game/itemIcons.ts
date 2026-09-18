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


