import * as THREE from 'three';

export interface BlockTextureAtlas {
  materials: THREE.Material[];
  dataUrls: Record<string, string>;
  matIndices: {
    dirt: number;
    grassTop: number;
    grassSide: number;
    stone: number;
    woodSide: number;
    woodTop: number;
    leaves: number;
    brick: number;
    bedrock: number;
    water: number;
    sand: number;
    coralPink: number;
    coralCyan: number;
    coralYellow: number;
    woodPlanks: number;
    glass: number;
    craftingTableTop: number;
    craftingTableSide: number;
    coalOre: number;
    ironOre: number;
    goldOre: number;
    diamondOre: number;
    birchWood: number;
    redFlower: number;
    yellowFlower: number;
    seaweed: number;
    torch: number;
    snow: number;
    ice: number;
    cactus: number;
    cherryLeaves: number;
    redSand: number;
    // New Biome & Special Blocks
    terracotta: number;
    redTerracotta: number;
    orangeTerracotta: number;
    yellowTerracotta: number;
    whiteTerracotta: number;
    brownTerracotta: number;
    darkOakWood: number;
    darkOakLeaves: number;
    redMushroomBlock: number;
    brownMushroomBlock: number;
    mushroomStem: number;
    jungleWood: number;
    jungleLeaves: number;
    melon: number;
    pumpkin: number;
    lilyPad: number;
    mud: number;
    moss: number;
    amethyst: number;
    magma: number;
    glowstone: number;
    obsidian: number;
    deepslate: number;
    furnaceTop: number;
    furnaceSide: number;
    furnaceFront: number;
    furnaceFrontLit: number;
    spruceWood: number;
    spruceLeaves: number;
    netherrack: number;
    soulSand: number;
    netherBricks: number;
    netherPortal: number;
    sweetBerryBush: number;
  };
}

// Deterministic 2D noise for procedural pixel textures
function pseudoNoise(x: number, y: number, seed: number = 1337): number {
  const n = Math.sin(x * 12.9898 + y * 78.233 + seed * 43.123) * 43758.5453;
  return n - Math.floor(n);
}

function createTextureCanvas(
  drawFn: (ctx: CanvasRenderingContext2D, size: number) => void,
  size: number = 16
): { texture: THREE.CanvasTexture; dataUrl: string } {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;

  drawFn(ctx, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  texture.generateMipmaps = false;

  return { texture, dataUrl: canvas.toDataURL('image/png') };
}

export function generateProceduralBlockTextures(): BlockTextureAtlas {
  // 1. Dirt Texture
  const dirt = createTextureCanvas((ctx, s) => {
    ctx.fillStyle = '#866043';
    ctx.fillRect(0, 0, s, s);
    for (let x = 0; x < s; x++) {
      for (let y = 0; y < s; y++) {
        const val = pseudoNoise(x, y, 1);
        if (val > 0.75) {
          ctx.fillStyle = '#9c724f';
          ctx.fillRect(x, y, 1, 1);
        } else if (val < 0.25) {
          ctx.fillStyle = '#6e4e36';
          ctx.fillRect(x, y, 1, 1);
        }
      }
    }
  });

  // 2. Grass Top Texture
  const grassTop = createTextureCanvas((ctx, s) => {
    ctx.fillStyle = '#5c8e32';
    ctx.fillRect(0, 0, s, s);
    for (let x = 0; x < s; x++) {
      for (let y = 0; y < s; y++) {
        const val = pseudoNoise(x, y, 2);
        if (val > 0.75) {
          ctx.fillStyle = '#6fa33c';
          ctx.fillRect(x, y, 1, 1);
        } else if (val < 0.25) {
          ctx.fillStyle = '#497327';
          ctx.fillRect(x, y, 1, 1);
        }
      }
    }
  });

  // 3. Grass Side Texture
  const grassSide = createTextureCanvas((ctx, s) => {
    ctx.fillStyle = '#866043';
    ctx.fillRect(0, 0, s, s);
    for (let x = 0; x < s; x++) {
      for (let y = 0; y < s; y++) {
        const val = pseudoNoise(x, y, 3);
        if (val > 0.75) {
          ctx.fillStyle = '#9c724f';
          ctx.fillRect(x, y, 1, 1);
        } else if (val < 0.25) {
          ctx.fillStyle = '#6e4e36';
          ctx.fillRect(x, y, 1, 1);
        }
      }
    }
    // Grass top layer with organic drips
    ctx.fillStyle = '#5c8e32';
    for (let x = 0; x < s; x++) {
      const depth = 2 + Math.floor(pseudoNoise(x, 0, 4) * 3);
      for (let y = 0; y < depth; y++) {
        const val = pseudoNoise(x, y, 5);
        ctx.fillStyle = val > 0.5 ? '#6fa33c' : '#497327';
        ctx.fillRect(x, y, 1, 1);
      }
    }
  });

  // 4. Stone Texture
  const stone = createTextureCanvas((ctx, s) => {
    ctx.fillStyle = '#777777';
    ctx.fillRect(0, 0, s, s);
    for (let x = 0; x < s; x++) {
      for (let y = 0; y < s; y++) {
        const val = pseudoNoise(x, y, 6);
        if (val > 0.8) {
          ctx.fillStyle = '#8f8f8f';
          ctx.fillRect(x, y, 1, 1);
        } else if (val < 0.2) {
          ctx.fillStyle = '#5e5e5e';
          ctx.fillRect(x, y, 1, 1);
        }
      }
    }
  });

  // 5. Wood Side Texture (Oak Log)
  const woodSide = createTextureCanvas((ctx, s) => {
    ctx.fillStyle = '#6b5030';
    ctx.fillRect(0, 0, s, s);
    for (let x = 0; x < s; x++) {
      for (let y = 0; y < s; y++) {
        const val = pseudoNoise(x, Math.floor(y / 2), 7);
        if (val > 0.7) {
          ctx.fillStyle = '#7d5f3a';
          ctx.fillRect(x, y, 1, 1);
        } else if (val < 0.3) {
          ctx.fillStyle = '#523c21';
          ctx.fillRect(x, y, 1, 1);
        }
      }
    }
  });

  // 6. Wood Top Texture (Rings)
  const woodTop = createTextureCanvas((ctx, s) => {
    ctx.fillStyle = '#9e7f53';
    ctx.fillRect(0, 0, s, s);
    const center = s / 2;
    for (let x = 0; x < s; x++) {
      for (let y = 0; y < s; y++) {
        const dist = Math.hypot(x - center, y - center);
        if (dist >= s / 2 - 1) {
          ctx.fillStyle = '#523c21'; // Bark outer ring
          ctx.fillRect(x, y, 1, 1);
        } else if (Math.sin(dist * 2.2) > 0.4) {
          ctx.fillStyle = '#80643e';
          ctx.fillRect(x, y, 1, 1);
        }
      }
    }
  });

  // 7. Leaves Texture
  const leaves = createTextureCanvas((ctx, s) => {
    ctx.fillStyle = '#3a7a28';
    ctx.fillRect(0, 0, s, s);
    for (let x = 0; x < s; x++) {
      for (let y = 0; y < s; y++) {
        const val = pseudoNoise(x, y, 8);
        if (val > 0.75) {
          ctx.fillStyle = '#4ea035';
          ctx.fillRect(x, y, 1, 1);
        } else if (val < 0.3) {
          ctx.fillStyle = '#29571c';
          ctx.fillRect(x, y, 1, 1);
        }
      }
    }
  });

  // 8. Brick Texture
  const brick = createTextureCanvas((ctx, s) => {
    ctx.fillStyle = '#a04030';
    ctx.fillRect(0, 0, s, s);
    // Mortar lines
    ctx.fillStyle = '#cfc3b8';
    for (let y = 0; y < s; y += 4) {
      ctx.fillRect(0, y, s, 1);
    }
    for (let y = 0; y < s; y += 4) {
      const offset = (y / 4) % 2 === 0 ? 0 : 4;
      for (let x = offset; x < s; x += 8) {
        ctx.fillRect(x, y, 1, 4);
      }
    }
    // Brick shading
    for (let x = 0; x < s; x++) {
      for (let y = 0; y < s; y++) {
        if (y % 4 !== 0) {
          const val = pseudoNoise(x, y, 9);
          if (val > 0.8) {
            ctx.fillStyle = '#b54b39';
            ctx.fillRect(x, y, 1, 1);
          } else if (val < 0.2) {
            ctx.fillStyle = '#883325';
            ctx.fillRect(x, y, 1, 1);
          }
        }
      }
    }
  });

  // 9. Bedrock Texture
  const bedrock = createTextureCanvas((ctx, s) => {
    ctx.fillStyle = '#2c2c2c';
    ctx.fillRect(0, 0, s, s);
    for (let x = 0; x < s; x++) {
      for (let y = 0; y < s; y++) {
        const val = pseudoNoise(x, y, 10);
        if (val > 0.85) {
          ctx.fillStyle = '#444444';
          ctx.fillRect(x, y, 1, 1);
        } else if (val < 0.25) {
          ctx.fillStyle = '#111111';
          ctx.fillRect(x, y, 1, 1);
        }
      }
    }
  });

  // 10. Water Texture
  const water = createTextureCanvas((ctx, s) => {
    ctx.fillStyle = '#2979ff';
    ctx.fillRect(0, 0, s, s);
    for (let x = 0; x < s; x++) {
      for (let y = 0; y < s; y++) {
        const wave = Math.sin(x * 0.8 + y * 0.6) + Math.cos(x * 0.4 - y * 0.8);
        if (wave > 0.7) {
          ctx.fillStyle = '#5393ff';
          ctx.fillRect(x, y, 1, 1);
        } else if (wave < -0.7) {
          ctx.fillStyle = '#1c54b2';
          ctx.fillRect(x, y, 1, 1);
        }
      }
    }
  });

  // 11. Sand Texture
  const sand = createTextureCanvas((ctx, s) => {
    ctx.fillStyle = '#dec187';
    ctx.fillRect(0, 0, s, s);
    for (let x = 0; x < s; x++) {
      for (let y = 0; y < s; y++) {
        const val = pseudoNoise(x, y, 11);
        if (val > 0.75) {
          ctx.fillStyle = '#edd6a4';
          ctx.fillRect(x, y, 1, 1);
        } else if (val < 0.25) {
          ctx.fillStyle = '#cbb075';
          ctx.fillRect(x, y, 1, 1);
        }
      }
    }
  });

  // 12. Coral Pink
  const coralPink = createTextureCanvas((ctx, s) => {
    ctx.fillStyle = '#ff4081';
    ctx.fillRect(0, 0, s, s);
    for (let x = 0; x < s; x++) {
      for (let y = 0; y < s; y++) {
        const val = pseudoNoise(x, y, 12);
        if (val > 0.7) {
          ctx.fillStyle = '#ff79b0';
          ctx.fillRect(x, y, 1, 1);
        } else if (val < 0.3) {
          ctx.fillStyle = '#c60055';
          ctx.fillRect(x, y, 1, 1);
        }
      }
    }
  });

  // 13. Coral Cyan
  const coralCyan = createTextureCanvas((ctx, s) => {
    ctx.fillStyle = '#00e5ff';
    ctx.fillRect(0, 0, s, s);
    for (let x = 0; x < s; x++) {
      for (let y = 0; y < s; y++) {
        const val = pseudoNoise(x, y, 13);
        if (val > 0.7) {
          ctx.fillStyle = '#6effff';
          ctx.fillRect(x, y, 1, 1);
        } else if (val < 0.3) {
          ctx.fillStyle = '#00b2cc';
          ctx.fillRect(x, y, 1, 1);
        }
      }
    }
  });

  // 14. Coral Yellow
  const coralYellow = createTextureCanvas((ctx, s) => {
    ctx.fillStyle = '#ffd600';
    ctx.fillRect(0, 0, s, s);
    for (let x = 0; x < s; x++) {
      for (let y = 0; y < s; y++) {
        const val = pseudoNoise(x, y, 14);
        if (val > 0.7) {
          ctx.fillStyle = '#ffff52';
          ctx.fillRect(x, y, 1, 1);
        } else if (val < 0.3) {
          ctx.fillStyle = '#c7a500';
          ctx.fillRect(x, y, 1, 1);
        }
      }
    }
  });

  // 15. Wood Planks
  const woodPlanks = createTextureCanvas((ctx, s) => {
    ctx.fillStyle = '#9e7f53';
    ctx.fillRect(0, 0, s, s);
    ctx.fillStyle = '#6b5030';
    for (let y = 0; y < s; y += 4) {
      ctx.fillRect(0, y, s, 1);
    }
    for (let y = 0; y < s; y += 4) {
      const off = (y / 4) % 2 === 0 ? 3 : 11;
      ctx.fillRect(off, y, 1, 4);
    }
  });

  // 16. Glass
  const glass = createTextureCanvas((ctx, s) => {
    ctx.fillStyle = 'rgba(215, 235, 255, 0.25)';
    ctx.fillRect(0, 0, s, s);
    ctx.strokeStyle = '#e0f2fe';
    ctx.lineWidth = 1;
    ctx.strokeRect(0.5, 0.5, s - 1, s - 1);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(2, 2, 2, 1);
    ctx.fillRect(3, 3, 2, 1);
    ctx.fillRect(11, 10, 3, 1);
  });

  // 17. Crafting Table Top
  const craftingTableTop = createTextureCanvas((ctx, s) => {
    ctx.fillStyle = '#a6804a';
    ctx.fillRect(0, 0, s, s);
    ctx.strokeStyle = '#4e3419';
    ctx.lineWidth = 1;
    ctx.strokeRect(1.5, 1.5, s - 3, s - 3);
    ctx.strokeRect(5.5, 5.5, 5, 5);
  });

  // 18. Crafting Table Side
  const craftingTableSide = createTextureCanvas((ctx, s) => {
    ctx.fillStyle = '#8f6734';
    ctx.fillRect(0, 0, s, s);
    ctx.fillStyle = '#4e3419';
    ctx.fillRect(0, 0, s, 2);
    ctx.fillRect(0, s - 2, s, 2);
    ctx.fillStyle = '#4a5568';
    ctx.fillRect(3, 4, 3, 7);
  });

  // 19. Coal Ore
  const coalOre = createTextureCanvas((ctx, s) => {
    ctx.fillStyle = '#777777';
    ctx.fillRect(0, 0, s, s);
    ctx.fillStyle = '#1c1c1c';
    const spots = [[3,3],[4,3],[3,4],[10,4],[11,4],[11,5],[5,10],[6,10],[6,11],[12,11],[12,12]];
    spots.forEach(([x, y]) => ctx.fillRect(x, y, 1, 1));
  });

  // 20. Iron Ore
  const ironOre = createTextureCanvas((ctx, s) => {
    ctx.fillStyle = '#777777';
    ctx.fillRect(0, 0, s, s);
    ctx.fillStyle = '#d8af93';
    const spots = [[3,3],[4,3],[3,4],[10,4],[11,4],[11,5],[5,10],[6,10],[6,11],[12,11],[12,12]];
    spots.forEach(([x, y]) => ctx.fillRect(x, y, 1, 1));
  });

  // 21. Gold Ore
  const goldOre = createTextureCanvas((ctx, s) => {
    ctx.fillStyle = '#777777';
    ctx.fillRect(0, 0, s, s);
    ctx.fillStyle = '#fcee4b';
    const spots = [[3,3],[4,3],[3,4],[10,4],[11,4],[11,5],[5,10],[6,10],[6,11],[12,11],[12,12]];
    spots.forEach(([x, y]) => ctx.fillRect(x, y, 1, 1));
  });

  // 22. Diamond Ore
  const diamondOre = createTextureCanvas((ctx, s) => {
    ctx.fillStyle = '#777777';
    ctx.fillRect(0, 0, s, s);
    ctx.fillStyle = '#4dedf4';
    const spots = [[3,3],[4,3],[3,4],[10,4],[11,4],[11,5],[5,10],[6,10],[6,11],[12,11],[12,12]];
    spots.forEach(([x, y]) => ctx.fillRect(x, y, 1, 1));
  });

  // 23. Birch Wood
  const birchWood = createTextureCanvas((ctx, s) => {
    ctx.fillStyle = '#e8e5db';
    ctx.fillRect(0, 0, s, s);
    ctx.fillStyle = '#302a24';
    ctx.fillRect(2, 3, 3, 1);
    ctx.fillRect(8, 7, 4, 1);
    ctx.fillRect(3, 11, 4, 1);
    ctx.fillRect(11, 13, 2, 1);
  });

  // 24. Red Flower
  const redFlower = createTextureCanvas((ctx, s) => {
    ctx.fillStyle = 'rgba(0,0,0,0)';
    ctx.clearRect(0, 0, s, s);
    ctx.fillStyle = '#3a7a28';
    ctx.fillRect(7, 7, 2, 9);
    ctx.fillStyle = '#e53935';
    ctx.fillRect(6, 3, 4, 4);
    ctx.fillStyle = '#ffeb3b';
    ctx.fillRect(7, 4, 2, 2);
  });

  // 25. Yellow Flower
  const yellowFlower = createTextureCanvas((ctx, s) => {
    ctx.fillStyle = 'rgba(0,0,0,0)';
    ctx.clearRect(0, 0, s, s);
    ctx.fillStyle = '#3a7a28';
    ctx.fillRect(7, 7, 2, 9);
    ctx.fillStyle = '#fdd835';
    ctx.fillRect(5, 3, 6, 4);
    ctx.fillStyle = '#ffb300';
    ctx.fillRect(7, 4, 2, 2);
  });

  // 26. Seaweed
  const seaweed = createTextureCanvas((ctx, s) => {
    ctx.fillStyle = 'rgba(0,0,0,0)';
    ctx.clearRect(0, 0, s, s);
    ctx.fillStyle = '#2e7d32';
    ctx.fillRect(6, 0, 4, s);
    ctx.fillStyle = '#4caf50';
    ctx.fillRect(7, 0, 2, s);
  });

  // 27. Torch
  const torch = createTextureCanvas((ctx, s) => {
    ctx.fillStyle = 'rgba(0,0,0,0)';
    ctx.clearRect(0, 0, s, s);
    ctx.fillStyle = '#6b5030';
    ctx.fillRect(6, 5, 4, 11);
    ctx.fillStyle = '#ff9800';
    ctx.fillRect(5, 1, 6, 5);
    ctx.fillStyle = '#ffeb3b';
    ctx.fillRect(6, 2, 4, 3);
  });

  // 28. Snow
  const snow = createTextureCanvas((ctx, s) => {
    ctx.fillStyle = '#f0f4f8';
    ctx.fillRect(0, 0, s, s);
    for (let x = 0; x < s; x++) {
      for (let y = 0; y < s; y++) {
        const v = pseudoNoise(x, y, 44);
        if (v > 0.8) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(x, y, 1, 1);
        } else if (v < 0.2) {
          ctx.fillStyle = '#d9e2ec';
          ctx.fillRect(x, y, 1, 1);
        }
      }
    }
  });

  // 29. Ice
  const ice = createTextureCanvas((ctx, s) => {
    ctx.fillStyle = '#8bc34a';
    ctx.fillStyle = '#7ac0e6';
    ctx.fillRect(0, 0, s, s);
    for (let x = 0; x < s; x++) {
      for (let y = 0; y < s; y++) {
        const v = pseudoNoise(x, y, 55);
        if (v > 0.8) {
          ctx.fillStyle = '#a8dcfa';
          ctx.fillRect(x, y, 1, 1);
        } else if (v < 0.2) {
          ctx.fillStyle = '#58a0cc';
          ctx.fillRect(x, y, 1, 1);
        }
      }
    }
  });

  // 30. Cactus
  const cactus = createTextureCanvas((ctx, s) => {
    ctx.fillStyle = '#3f7a2d';
    ctx.fillRect(0, 0, s, s);
    for (let y = 0; y < s; y += 3) {
      for (let x = 0; x < s; x += 4) {
        ctx.fillStyle = '#1c3d14';
        ctx.fillRect(x, y, 1, 2);
        ctx.fillStyle = '#e8f5e9';
        ctx.fillRect(x + 1, y, 1, 1);
      }
    }
  });

  // 31. Cherry Leaves
  const cherryLeaves = createTextureCanvas((ctx, s) => {
    ctx.fillStyle = '#f48fb1';
    ctx.fillRect(0, 0, s, s);
    for (let x = 0; x < s; x++) {
      for (let y = 0; y < s; y++) {
        const v = pseudoNoise(x, y, 66);
        if (v > 0.75) {
          ctx.fillStyle = '#f8bbd0';
          ctx.fillRect(x, y, 1, 1);
        } else if (v < 0.25) {
          ctx.fillStyle = '#ec407a';
          ctx.fillRect(x, y, 1, 1);
        }
      }
    }
  });

  // 32. Red Sand
  const redSand = createTextureCanvas((ctx, s) => {
    ctx.fillStyle = '#c75932';
    ctx.fillRect(0, 0, s, s);
    for (let x = 0; x < s; x++) {
      for (let y = 0; y < s; y++) {
        const v = pseudoNoise(x, y, 77);
        if (v > 0.75) {
          ctx.fillStyle = '#dc6f45';
          ctx.fillRect(x, y, 1, 1);
        } else if (v < 0.25) {
          ctx.fillStyle = '#a84523';
          ctx.fillRect(x, y, 1, 1);
        }
      }
    }
  });

  // 33. Terracotta (Base)
  const terracotta = createTextureCanvas((ctx, s) => {
    ctx.fillStyle = '#d17d5a';
    ctx.fillRect(0, 0, s, s);
    for (let x = 0; x < s; x++) {
      for (let y = 0; y < s; y++) {
        const v = pseudoNoise(x, y, 80);
        if (v > 0.75) {
          ctx.fillStyle = '#de8d6a';
          ctx.fillRect(x, y, 1, 1);
        } else if (v < 0.25) {
          ctx.fillStyle = '#be6a46';
          ctx.fillRect(x, y, 1, 1);
        }
      }
    }
  });

  // 34. Red Terracotta
  const redTerracotta = createTextureCanvas((ctx, s) => {
    ctx.fillStyle = '#8f3d2e';
    ctx.fillRect(0, 0, s, s);
    for (let x = 0; x < s; x++) {
      for (let y = 0; y < s; y++) {
        const v = pseudoNoise(x, y, 81);
        if (v > 0.75) {
          ctx.fillStyle = '#a64a38';
          ctx.fillRect(x, y, 1, 1);
        } else if (v < 0.25) {
          ctx.fillStyle = '#7a3123';
          ctx.fillRect(x, y, 1, 1);
        }
      }
    }
  });

  // 35. Orange Terracotta
  const orangeTerracotta = createTextureCanvas((ctx, s) => {
    ctx.fillStyle = '#a05325';
    ctx.fillRect(0, 0, s, s);
    for (let x = 0; x < s; x++) {
      for (let y = 0; y < s; y++) {
        const v = pseudoNoise(x, y, 82);
        if (v > 0.75) {
          ctx.fillStyle = '#b56230';
          ctx.fillRect(x, y, 1, 1);
        } else if (v < 0.25) {
          ctx.fillStyle = '#88431c';
          ctx.fillRect(x, y, 1, 1);
        }
      }
    }
  });

  // 36. Yellow Terracotta
  const yellowTerracotta = createTextureCanvas((ctx, s) => {
    ctx.fillStyle = '#ba8523';
    ctx.fillRect(0, 0, s, s);
    for (let x = 0; x < s; x++) {
      for (let y = 0; y < s; y++) {
        const v = pseudoNoise(x, y, 83);
        if (v > 0.75) {
          ctx.fillStyle = '#cd962e';
          ctx.fillRect(x, y, 1, 1);
        } else if (v < 0.25) {
          ctx.fillStyle = '#a27119';
          ctx.fillRect(x, y, 1, 1);
        }
      }
    }
  });

  // 37. White Terracotta
  const whiteTerracotta = createTextureCanvas((ctx, s) => {
    ctx.fillStyle = '#d1b1a1';
    ctx.fillRect(0, 0, s, s);
    for (let x = 0; x < s; x++) {
      for (let y = 0; y < s; y++) {
        const v = pseudoNoise(x, y, 84);
        if (v > 0.75) {
          ctx.fillStyle = '#dec0b0';
          ctx.fillRect(x, y, 1, 1);
        } else if (v < 0.25) {
          ctx.fillStyle = '#bc9e90';
          ctx.fillRect(x, y, 1, 1);
        }
      }
    }
  });

  // 38. Brown Terracotta
  const brownTerracotta = createTextureCanvas((ctx, s) => {
    ctx.fillStyle = '#4d3224';
    ctx.fillRect(0, 0, s, s);
    for (let x = 0; x < s; x++) {
      for (let y = 0; y < s; y++) {
        const v = pseudoNoise(x, y, 85);
        if (v > 0.75) {
          ctx.fillStyle = '#5e3e2d';
          ctx.fillRect(x, y, 1, 1);
        } else if (v < 0.25) {
          ctx.fillStyle = '#3d261a';
          ctx.fillRect(x, y, 1, 1);
        }
      }
    }
  });

  // 39. Dark Oak Wood
  const darkOakWood = createTextureCanvas((ctx, s) => {
    ctx.fillStyle = '#3b2713';
    ctx.fillRect(0, 0, s, s);
    for (let x = 0; x < s; x++) {
      for (let y = 0; y < s; y++) {
        const v = pseudoNoise(x, Math.floor(y / 2), 86);
        if (v > 0.7) {
          ctx.fillStyle = '#4c331a';
          ctx.fillRect(x, y, 1, 1);
        } else if (v < 0.3) {
          ctx.fillStyle = '#26190b';
          ctx.fillRect(x, y, 1, 1);
        }
      }
    }
  });

  // 40. Dark Oak Leaves
  const darkOakLeaves = createTextureCanvas((ctx, s) => {
    ctx.fillStyle = '#1e3c12';
    ctx.fillRect(0, 0, s, s);
    for (let x = 0; x < s; x++) {
      for (let y = 0; y < s; y++) {
        const v = pseudoNoise(x, y, 87);
        if (v > 0.75) {
          ctx.fillStyle = '#2c541c';
          ctx.fillRect(x, y, 1, 1);
        } else if (v < 0.3) {
          ctx.fillStyle = '#14290c';
          ctx.fillRect(x, y, 1, 1);
        }
      }
    }
  });

  // 41. Red Mushroom Block
  const redMushroomBlock = createTextureCanvas((ctx, s) => {
    ctx.fillStyle = '#ba2323';
    ctx.fillRect(0, 0, s, s);
    // Big white mushroom spots
    ctx.fillStyle = '#ede8e1';
    const spots = [[2, 2, 2, 2], [10, 3, 3, 2], [4, 9, 3, 3], [11, 10, 2, 2], [8, 7, 2, 2]];
    spots.forEach(([x, y, w, h]) => ctx.fillRect(x, y, w, h));
  });

  // 42. Brown Mushroom Block
  const brownMushroomBlock = createTextureCanvas((ctx, s) => {
    ctx.fillStyle = '#8c6747';
    ctx.fillRect(0, 0, s, s);
    for (let x = 0; x < s; x++) {
      for (let y = 0; y < s; y++) {
        const v = pseudoNoise(x, y, 88);
        if (v > 0.75) {
          ctx.fillStyle = '#9e7653';
          ctx.fillRect(x, y, 1, 1);
        } else if (v < 0.25) {
          ctx.fillStyle = '#735235';
          ctx.fillRect(x, y, 1, 1);
        }
      }
    }
  });

  // 43. Mushroom Stem
  const mushroomStem = createTextureCanvas((ctx, s) => {
    ctx.fillStyle = '#dcd0bc';
    ctx.fillRect(0, 0, s, s);
    for (let x = 0; x < s; x++) {
      for (let y = 0; y < s; y++) {
        const v = pseudoNoise(x, Math.floor(y / 2), 89);
        if (v > 0.7) {
          ctx.fillStyle = '#ece1cf';
          ctx.fillRect(x, y, 1, 1);
        } else if (v < 0.3) {
          ctx.fillStyle = '#c5b8a3';
          ctx.fillRect(x, y, 1, 1);
        }
      }
    }
  });

  // 44. Jungle Wood
  const jungleWood = createTextureCanvas((ctx, s) => {
    ctx.fillStyle = '#564426';
    ctx.fillRect(0, 0, s, s);
    for (let x = 0; x < s; x++) {
      for (let y = 0; y < s; y++) {
        const v = pseudoNoise(x, Math.floor(y / 2), 90);
        if (v > 0.7) {
          ctx.fillStyle = '#6a5532';
          ctx.fillRect(x, y, 1, 1);
        } else if (v < 0.3) {
          ctx.fillStyle = '#40321a';
          ctx.fillRect(x, y, 1, 1);
        }
      }
    }
    // Subtle green moss flecks
    ctx.fillStyle = '#4a7024';
    ctx.fillRect(3, 4, 2, 2);
    ctx.fillRect(9, 11, 2, 2);
  });

  // 45. Jungle Leaves
  const jungleLeaves = createTextureCanvas((ctx, s) => {
    ctx.fillStyle = '#2c6e14';
    ctx.fillRect(0, 0, s, s);
    for (let x = 0; x < s; x++) {
      for (let y = 0; y < s; y++) {
        const v = pseudoNoise(x, y, 91);
        if (v > 0.75) {
          ctx.fillStyle = '#3c8f1e';
          ctx.fillRect(x, y, 1, 1);
        } else if (v < 0.3) {
          ctx.fillStyle = '#1c4c0a';
          ctx.fillRect(x, y, 1, 1);
        }
      }
    }
  });

  // 46. Melon Block
  const melon = createTextureCanvas((ctx, s) => {
    ctx.fillStyle = '#708a28';
    ctx.fillRect(0, 0, s, s);
    ctx.fillStyle = '#4a6115';
    for (let x = 0; x < s; x += 4) {
      for (let y = 0; y < s; y++) {
        const v = pseudoNoise(x, y, 92);
        if (v > 0.35) {
          ctx.fillRect(x, y, 2, 1);
        }
      }
    }
  });

  // 47. Pumpkin Block
  const pumpkin = createTextureCanvas((ctx, s) => {
    ctx.fillStyle = '#d07416';
    ctx.fillRect(0, 0, s, s);
    ctx.fillStyle = '#9e520a';
    for (let x = 3; x < s; x += 4) {
      ctx.fillRect(x, 0, 1, s);
    }
  });

  // 48. Lily Pad
  const lilyPad = createTextureCanvas((ctx, s) => {
    ctx.fillStyle = 'rgba(0,0,0,0)';
    ctx.clearRect(0, 0, s, s);
    ctx.fillStyle = '#24581f';
    ctx.fillRect(2, 2, 12, 12);
    // V-shaped notch
    ctx.clearRect(8, 2, 3, 6);
    ctx.fillStyle = '#367b30';
    ctx.fillRect(3, 3, 10, 2);
    // Pink flower dot
    ctx.fillStyle = '#ff80ab';
    ctx.fillRect(7, 7, 2, 2);
  });

  // 49. Mud Block
  const mud = createTextureCanvas((ctx, s) => {
    ctx.fillStyle = '#3c2e26';
    ctx.fillRect(0, 0, s, s);
    for (let x = 0; x < s; x++) {
      for (let y = 0; y < s; y++) {
        const v = pseudoNoise(x, y, 93);
        if (v > 0.75) {
          ctx.fillStyle = '#4c3a30';
          ctx.fillRect(x, y, 1, 1);
        } else if (v < 0.25) {
          ctx.fillStyle = '#2b201a';
          ctx.fillRect(x, y, 1, 1);
        }
      }
    }
  });

  // 50. Moss Block
  const moss = createTextureCanvas((ctx, s) => {
    ctx.fillStyle = '#596e2a';
    ctx.fillRect(0, 0, s, s);
    for (let x = 0; x < s; x++) {
      for (let y = 0; y < s; y++) {
        const v = pseudoNoise(x, y, 94);
        if (v > 0.75) {
          ctx.fillStyle = '#6f8836';
          ctx.fillRect(x, y, 1, 1);
        } else if (v < 0.25) {
          ctx.fillStyle = '#445520';
          ctx.fillRect(x, y, 1, 1);
        }
      }
    }
  });

  // 51. Amethyst Block (Glowing Crystal)
  const amethyst = createTextureCanvas((ctx, s) => {
    ctx.fillStyle = '#834eb8';
    ctx.fillRect(0, 0, s, s);
    for (let x = 0; x < s; x++) {
      for (let y = 0; y < s; y++) {
        const v = pseudoNoise(x, y, 95);
        if (v > 0.75) {
          ctx.fillStyle = '#c58cf2';
          ctx.fillRect(x, y, 1, 1);
        } else if (v < 0.25) {
          ctx.fillStyle = '#5c3186';
          ctx.fillRect(x, y, 1, 1);
        }
      }
    }
  });

  // 52. Magma Block
  const magma = createTextureCanvas((ctx, s) => {
    ctx.fillStyle = '#4a1508';
    ctx.fillRect(0, 0, s, s);
    ctx.fillStyle = '#d94b0d';
    for (let x = 0; x < s; x++) {
      for (let y = 0; y < s; y++) {
        const v = pseudoNoise(x, y, 96);
        if (v > 0.6) {
          ctx.fillStyle = v > 0.8 ? '#ffb300' : '#d94b0d';
          ctx.fillRect(x, y, 1, 1);
        }
      }
    }
  });

  // 53. Glowstone
  const glowstone = createTextureCanvas((ctx, s) => {
    ctx.fillStyle = '#d69e38';
    ctx.fillRect(0, 0, s, s);
    for (let x = 0; x < s; x++) {
      for (let y = 0; y < s; y++) {
        const v = pseudoNoise(x, y, 97);
        if (v > 0.75) {
          ctx.fillStyle = '#fff176';
          ctx.fillRect(x, y, 1, 1);
        } else if (v < 0.25) {
          ctx.fillStyle = '#a6721d';
          ctx.fillRect(x, y, 1, 1);
        }
      }
    }
  });

  // 54. Obsidian
  const obsidian = createTextureCanvas((ctx, s) => {
    ctx.fillStyle = '#161124';
    ctx.fillRect(0, 0, s, s);
    for (let x = 0; x < s; x++) {
      for (let y = 0; y < s; y++) {
        const v = pseudoNoise(x, y, 98);
        if (v > 0.8) {
          ctx.fillStyle = '#3a2468';
          ctx.fillRect(x, y, 1, 1);
        } else if (v < 0.2) {
          ctx.fillStyle = '#0a0812';
          ctx.fillRect(x, y, 1, 1);
        }
      }
    }
  });

  // 55. Deepslate
  const deepslate = createTextureCanvas((ctx, s) => {
    ctx.fillStyle = '#33333d';
    ctx.fillRect(0, 0, s, s);
    for (let y = 0; y < s; y += 3) {
      ctx.fillStyle = '#22222a';
      ctx.fillRect(0, y, s, 1);
    }
    for (let x = 0; x < s; x++) {
      for (let y = 0; y < s; y++) {
        const v = pseudoNoise(x, y, 99);
        if (v > 0.8) {
          ctx.fillStyle = '#484856';
          ctx.fillRect(x, y, 1, 1);
        }
      }
    }
  });

  // 56. Furnace Top
  const furnaceTop = createTextureCanvas((ctx, s) => {
    ctx.fillStyle = '#6b6b6b';
    ctx.fillRect(0, 0, s, s);
    ctx.strokeStyle = '#4b4b4b';
    ctx.strokeRect(1, 1, s - 2, s - 2);
    for (let x = 0; x < s; x++) {
      for (let y = 0; y < s; y++) {
        if (pseudoNoise(x, y, 12) > 0.8) {
          ctx.fillStyle = '#828282';
          ctx.fillRect(x, y, 1, 1);
        }
      }
    }
  });

  // 57. Furnace Side
  const furnaceSide = createTextureCanvas((ctx, s) => {
    ctx.fillStyle = '#686868';
    ctx.fillRect(0, 0, s, s);
    for (let x = 0; x < s; x++) {
      for (let y = 0; y < s; y++) {
        const n = pseudoNoise(x, y, 13);
        if (n > 0.75) {
          ctx.fillStyle = '#7e7e7e';
          ctx.fillRect(x, y, 1, 1);
        } else if (n < 0.25) {
          ctx.fillStyle = '#4c4c4c';
          ctx.fillRect(x, y, 1, 1);
        }
      }
    }
  });

  // 58. Furnace Front (Unlit)
  const furnaceFront = createTextureCanvas((ctx, s) => {
    // Stone frame
    ctx.fillStyle = '#686868';
    ctx.fillRect(0, 0, s, s);
    for (let x = 0; x < s; x++) {
      for (let y = 0; y < s; y++) {
        const n = pseudoNoise(x, y, 13);
        if (n > 0.75) {
          ctx.fillStyle = '#7e7e7e';
          ctx.fillRect(x, y, 1, 1);
        } else if (n < 0.25) {
          ctx.fillStyle = '#4c4c4c';
          ctx.fillRect(x, y, 1, 1);
        }
      }
    }
    // Dark opening
    ctx.fillStyle = '#1c1c1c';
    ctx.fillRect(3, 4, 10, 8);
    // Metal grate
    ctx.fillStyle = '#3a3a3a';
    ctx.fillRect(4, 7, 8, 1);
    ctx.fillRect(4, 10, 8, 1);
    ctx.fillRect(6, 4, 1, 8);
    ctx.fillRect(9, 4, 1, 8);
  });

  // 59. Furnace Front (Lit)
  const furnaceFrontLit = createTextureCanvas((ctx, s) => {
    // Stone frame
    ctx.fillStyle = '#686868';
    ctx.fillRect(0, 0, s, s);
    // Fiery opening
    ctx.fillStyle = '#180800';
    ctx.fillRect(3, 4, 10, 8);
    // Glowing flames
    ctx.fillStyle = '#e65100';
    ctx.fillRect(4, 6, 8, 6);
    ctx.fillStyle = '#f57c00';
    ctx.fillRect(5, 7, 6, 5);
    ctx.fillStyle = '#ffb300';
    ctx.fillRect(6, 8, 4, 3);
    ctx.fillStyle = '#fff9c4';
    ctx.fillRect(7, 9, 2, 2);
    // Grate silhouette
    ctx.fillStyle = '#3e2723';
    ctx.fillRect(4, 8, 8, 1);
    ctx.fillRect(7, 4, 2, 8);
  });

  // 60. Spruce Wood Bark
  const spruceWood = createTextureCanvas((ctx, s) => {
    ctx.fillStyle = '#3a2416';
    ctx.fillRect(0, 0, s, s);
    for (let x = 0; x < s; x++) {
      for (let y = 0; y < s; y++) {
        const v = pseudoNoise(x, y * 0.4, 71);
        if (v > 0.7) {
          ctx.fillStyle = '#4c3220';
          ctx.fillRect(x, y, 1, 1);
        } else if (v < 0.3) {
          ctx.fillStyle = '#26170d';
          ctx.fillRect(x, y, 1, 1);
        }
      }
    }
  });

  // 61. Spruce Needle Leaves
  const spruceLeaves = createTextureCanvas((ctx, s) => {
    ctx.fillStyle = '#213a23';
    ctx.fillRect(0, 0, s, s);
    for (let x = 0; x < s; x++) {
      for (let y = 0; y < s; y++) {
        const v = pseudoNoise(x, y, 92);
        if (v > 0.72) {
          ctx.fillStyle = '#2d4f30';
          ctx.fillRect(x, y, 1, 1);
        } else if (v < 0.28) {
          ctx.fillStyle = '#152617';
          ctx.fillRect(x, y, 1, 1);
        }
      }
    }
  });

  // 62. Netherrack
  const netherrack = createTextureCanvas((ctx, s) => {
    ctx.fillStyle = '#6b1b1b';
    ctx.fillRect(0, 0, s, s);
    for (let x = 0; x < s; x++) {
      for (let y = 0; y < s; y++) {
        const v = pseudoNoise(x, y, 661);
        if (v > 0.72) {
          ctx.fillStyle = '#8a2525';
          ctx.fillRect(x, y, 1, 1);
        } else if (v < 0.28) {
          ctx.fillStyle = '#420f0f';
          ctx.fillRect(x, y, 1, 1);
        }
      }
    }
  });

  // 63. Soul Sand
  const soulSand = createTextureCanvas((ctx, s) => {
    ctx.fillStyle = '#49372b';
    ctx.fillRect(0, 0, s, s);
    for (let x = 0; x < s; x++) {
      for (let y = 0; y < s; y++) {
        const v = pseudoNoise(x, y, 773);
        if (v > 0.75) {
          ctx.fillStyle = '#5c4637';
          ctx.fillRect(x, y, 1, 1);
        } else if (v < 0.25) {
          ctx.fillStyle = '#31231a';
          ctx.fillRect(x, y, 1, 1);
        }
      }
    }
    // Subtle ghostly soul faces
    ctx.fillStyle = '#241a13';
    ctx.fillRect(3, 4, 2, 2);
    ctx.fillRect(7, 4, 2, 2);
    ctx.fillRect(4, 8, 4, 2);
    ctx.fillRect(11, 10, 2, 2);
  });

  // 64. Nether Bricks
  const netherBricks = createTextureCanvas((ctx, s) => {
    ctx.fillStyle = '#2c1519';
    ctx.fillRect(0, 0, s, s);
    ctx.fillStyle = '#1b0c0e';
    for (let y = 0; y < s; y += 4) {
      ctx.fillRect(0, y, s, 1);
    }
    for (let x = 0; x < s; x += 8) {
      ctx.fillRect(x, 0, 1, 4);
      ctx.fillRect((x + 4) % s, 4, 1, 4);
      ctx.fillRect(x, 8, 1, 4);
      ctx.fillRect((x + 4) % s, 12, 1, 4);
    }
    ctx.fillStyle = '#3f1f25';
    for (let x = 1; x < s; x += 4) {
      for (let y = 1; y < s; y += 4) {
        if (pseudoNoise(x, y, 881) > 0.5) ctx.fillRect(x, y, 2, 1);
      }
    }
  });

  // 65. Nether Portal
  const netherPortal = createTextureCanvas((ctx, s) => {
    ctx.fillStyle = '#4a148c';
    ctx.fillRect(0, 0, s, s);
    for (let x = 0; x < s; x++) {
      for (let y = 0; y < s; y++) {
        const v = pseudoNoise(x, y, 999);
        if (v > 0.65) {
          ctx.fillStyle = '#7b1fa2';
          ctx.fillRect(x, y, 1, 1);
        } else if (v > 0.45) {
          ctx.fillStyle = '#ab47bc';
          ctx.fillRect(x, y, 1, 1);
        } else if (v < 0.2) {
          ctx.fillStyle = '#311b92';
          ctx.fillRect(x, y, 1, 1);
        }
      }
    }
  });

  // 66. Sweet Berry Bush
  const sweetBerryBush = createTextureCanvas((ctx, s) => {
    ctx.clearRect(0, 0, s, s);
    ctx.fillStyle = '#2e7d32';
    ctx.fillRect(2, 4, 12, 11);
    ctx.fillRect(4, 2, 8, 13);
    ctx.fillStyle = '#1b5e20';
    ctx.fillRect(3, 5, 10, 9);
    ctx.fillStyle = '#d32f2f';
    ctx.fillRect(4, 6, 2, 2);
    ctx.fillRect(9, 5, 2, 2);
    ctx.fillRect(6, 9, 2, 2);
    ctx.fillRect(11, 10, 2, 2);
    ctx.fillRect(3, 11, 2, 2);
    ctx.fillStyle = '#ff5252';
    ctx.fillRect(4, 6, 1, 1);
    ctx.fillRect(9, 5, 1, 1);
    ctx.fillRect(6, 9, 1, 1);
  });

  // Three.js Materials List
  const createMat = (tex: THREE.CanvasTexture, transparent: boolean = false, opacity: number = 1.0) =>
    new THREE.MeshLambertMaterial({
      map: tex,
      transparent,
      opacity,
      roughness: 0.9,
    } as THREE.MeshLambertMaterialParameters);

  const materials = [
    createMat(dirt.texture),              // 0: dirt
    createMat(grassTop.texture),          // 1: grassTop
    createMat(grassSide.texture),         // 2: grassSide
    createMat(stone.texture),             // 3: stone
    createMat(woodSide.texture),          // 4: woodSide
    createMat(woodTop.texture),           // 5: woodTop
    createMat(leaves.texture, true, 0.95),// 6: leaves
    createMat(brick.texture),             // 7: brick
    createMat(bedrock.texture),           // 8: bedrock
    createMat(water.texture, true, 0.72), // 9: water
    createMat(sand.texture),              // 10: sand
    createMat(coralPink.texture),         // 11: coralPink
    createMat(coralCyan.texture),         // 12: coralCyan
    createMat(coralYellow.texture),       // 13: coralYellow
    createMat(woodPlanks.texture),        // 14: woodPlanks
    createMat(glass.texture, true, 0.6),  // 15: glass
    createMat(craftingTableTop.texture),  // 16: craftingTableTop
    createMat(craftingTableSide.texture), // 17: craftingTableSide
    createMat(coalOre.texture),           // 18: coalOre
    createMat(ironOre.texture),           // 19: ironOre
    createMat(goldOre.texture),           // 20: goldOre
    createMat(diamondOre.texture),        // 21: diamondOre
    createMat(birchWood.texture),         // 22: birchWood
    createMat(redFlower.texture, true),   // 23: redFlower
    createMat(yellowFlower.texture, true),// 24: yellowFlower
    createMat(seaweed.texture, true, 0.9),// 25: seaweed
    createMat(torch.texture, true),       // 26: torch
    createMat(snow.texture),              // 27: snow
    createMat(ice.texture, true, 0.72),   // 28: ice
    createMat(cactus.texture),            // 29: cactus
    createMat(cherryLeaves.texture, true, 0.96), // 30: cherryLeaves
    createMat(redSand.texture),           // 31: redSand
    // New Materials
    createMat(terracotta.texture),        // 32: terracotta
    createMat(redTerracotta.texture),     // 33: redTerracotta
    createMat(orangeTerracotta.texture),  // 34: orangeTerracotta
    createMat(yellowTerracotta.texture),  // 35: yellowTerracotta
    createMat(whiteTerracotta.texture),   // 36: whiteTerracotta
    createMat(brownTerracotta.texture),   // 37: brownTerracotta
    createMat(darkOakWood.texture),       // 38: darkOakWood
    createMat(darkOakLeaves.texture, true, 0.96), // 39: darkOakLeaves
    createMat(redMushroomBlock.texture),  // 40: redMushroomBlock
    createMat(brownMushroomBlock.texture),// 41: brownMushroomBlock
    createMat(mushroomStem.texture),      // 42: mushroomStem
    createMat(jungleWood.texture),        // 43: jungleWood
    createMat(jungleLeaves.texture, true, 0.96),  // 44: jungleLeaves
    createMat(melon.texture),             // 45: melon
    createMat(pumpkin.texture),           // 46: pumpkin
    createMat(lilyPad.texture, true),     // 47: lilyPad
    createMat(mud.texture),               // 48: mud
    createMat(moss.texture),              // 49: moss
    createMat(amethyst.texture),          // 50: amethyst
    createMat(magma.texture),             // 51: magma
    createMat(glowstone.texture),         // 52: glowstone
    createMat(obsidian.texture),          // 53: obsidian
    createMat(deepslate.texture),         // 54: deepslate
    createMat(furnaceTop.texture),        // 55: furnaceTop
    createMat(furnaceSide.texture),       // 56: furnaceSide
    createMat(furnaceFront.texture),      // 57: furnaceFront
    createMat(furnaceFrontLit.texture),   // 58: furnaceFrontLit
    createMat(spruceWood.texture),        // 59: spruceWood
    createMat(spruceLeaves.texture, true, 0.96), // 60: spruceLeaves
    createMat(netherrack.texture),        // 61: netherrack
    createMat(soulSand.texture),          // 62: soulSand
    createMat(netherBricks.texture),      // 63: netherBricks
    createMat(netherPortal.texture, true, 0.75), // 64: netherPortal
    createMat(sweetBerryBush.texture, true, 0.98), // 65: sweetBerryBush
  ];

  return {
    materials,
    dataUrls: {
      dirt: dirt.dataUrl,
      grass: grassTop.dataUrl,
      grassSide: grassSide.dataUrl,
      stone: stone.dataUrl,
      wood: woodSide.dataUrl,
      leaves: leaves.dataUrl,
      brick: brick.dataUrl,
      bedrock: bedrock.dataUrl,
      water: water.dataUrl,
      sand: sand.dataUrl,
      coralPink: coralPink.dataUrl,
      coralCyan: coralCyan.dataUrl,
      coralYellow: coralYellow.dataUrl,
      woodPlanks: woodPlanks.dataUrl,
      glass: glass.dataUrl,
      craftingTable: craftingTableTop.dataUrl,
      coalOre: coalOre.dataUrl,
      ironOre: ironOre.dataUrl,
      goldOre: goldOre.dataUrl,
      diamondOre: diamondOre.dataUrl,
      birchWood: birchWood.dataUrl,
      redFlower: redFlower.dataUrl,
      yellowFlower: yellowFlower.dataUrl,
      seaweed: seaweed.dataUrl,
      torch: torch.dataUrl,
      snow: snow.dataUrl,
      ice: ice.dataUrl,
      cactus: cactus.dataUrl,
      cherryLeaves: cherryLeaves.dataUrl,
      redSand: redSand.dataUrl,
      terracotta: terracotta.dataUrl,
      redTerracotta: redTerracotta.dataUrl,
      orangeTerracotta: orangeTerracotta.dataUrl,
      yellowTerracotta: yellowTerracotta.dataUrl,
      whiteTerracotta: whiteTerracotta.dataUrl,
      brownTerracotta: brownTerracotta.dataUrl,
      darkOakWood: darkOakWood.dataUrl,
      darkOakLeaves: darkOakLeaves.dataUrl,
      redMushroomBlock: redMushroomBlock.dataUrl,
      brownMushroomBlock: brownMushroomBlock.dataUrl,
      mushroomStem: mushroomStem.dataUrl,
      jungleWood: jungleWood.dataUrl,
      jungleLeaves: jungleLeaves.dataUrl,
      melon: melon.dataUrl,
      pumpkin: pumpkin.dataUrl,
      lilyPad: lilyPad.dataUrl,
      mud: mud.dataUrl,
      moss: moss.dataUrl,
      amethyst: amethyst.dataUrl,
      magma: magma.dataUrl,
      glowstone: glowstone.dataUrl,
      obsidian: obsidian.dataUrl,
      deepslate: deepslate.dataUrl,
      furnace: furnaceFront.dataUrl,
      spruceWood: spruceWood.dataUrl,
      spruceLeaves: spruceLeaves.dataUrl,
      netherrack: netherrack.dataUrl,
      soulSand: soulSand.dataUrl,
      netherBricks: netherBricks.dataUrl,
      netherPortal: netherPortal.dataUrl,
      sweetBerryBush: sweetBerryBush.dataUrl,
    },
    matIndices: {
      dirt: 0,
      grassTop: 1,
      grassSide: 2,
      stone: 3,
      woodSide: 4,
      woodTop: 5,
      leaves: 6,
      brick: 7,
      bedrock: 8,
      water: 9,
      sand: 10,
      coralPink: 11,
      coralCyan: 12,
      coralYellow: 13,
      woodPlanks: 14,
      glass: 15,
      craftingTableTop: 16,
      craftingTableSide: 17,
      coalOre: 18,
      ironOre: 19,
      goldOre: 20,
      diamondOre: 21,
      birchWood: 22,
      redFlower: 23,
      yellowFlower: 24,
      seaweed: 25,
      torch: 26,
      snow: 27,
      ice: 28,
      cactus: 29,
      cherryLeaves: 30,
      redSand: 31,
      terracotta: 32,
      redTerracotta: 33,
      orangeTerracotta: 34,
      yellowTerracotta: 35,
      whiteTerracotta: 36,
      brownTerracotta: 37,
      darkOakWood: 38,
      darkOakLeaves: 39,
      redMushroomBlock: 40,
      brownMushroomBlock: 41,
      mushroomStem: 42,
      jungleWood: 43,
      jungleLeaves: 44,
      melon: 45,
      pumpkin: 46,
      lilyPad: 47,
      mud: 48,
      moss: 49,
      amethyst: 50,
      magma: 51,
      glowstone: 52,
      obsidian: 53,
      deepslate: 54,
      furnaceTop: 55,
      furnaceSide: 56,
      furnaceFront: 57,
      furnaceFrontLit: 58,
      spruceWood: 59,
      spruceLeaves: 60,
      netherrack: 61,
      soulSand: 62,
      netherBricks: 63,
      netherPortal: 64,
      sweetBerryBush: 65,
    },
  };
}
