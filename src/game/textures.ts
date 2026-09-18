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
        } else if (val < 0.35) {
          ctx.fillStyle = '#6a6a6a';
          ctx.fillRect(x, y, 1, 1);
        }
      }
    }
  });

  // 5. Wood Side (Bark) Texture
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

  // 6. Wood Top (Tree Rings) Texture
  const woodTop = createTextureCanvas((ctx, s) => {
    ctx.fillStyle = '#9e7f53';
    ctx.fillRect(0, 0, s, s);
    const center = s / 2;
    for (let x = 0; x < s; x++) {
      for (let y = 0; y < s; y++) {
        const dist = Math.hypot(x - center, y - center);
        if (dist >= s / 2 - 1) {
          ctx.fillStyle = '#523c21';
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

  // 10. Water Texture (Translucent Blue with Ripple Lines)
  const water = createTextureCanvas((ctx, s) => {
    ctx.fillStyle = '#1e78c6';
    ctx.fillRect(0, 0, s, s);
    for (let x = 0; x < s; x++) {
      for (let y = 0; y < s; y++) {
        const val = Math.sin(x * 0.8 + y * 0.4) + Math.cos(x * 0.4 - y * 0.8);
        if (val > 0.8) {
          ctx.fillStyle = '#3aa0eb';
          ctx.fillRect(x, y, 1, 1);
        } else if (val < -0.8) {
          ctx.fillStyle = '#145ea0';
          ctx.fillRect(x, y, 1, 1);
        }
      }
    }
  });

  // 11. Sand Texture (Ocean floor and beaches)
  const sand = createTextureCanvas((ctx, s) => {
    ctx.fillStyle = '#d8c287';
    ctx.fillRect(0, 0, s, s);
    for (let x = 0; x < s; x++) {
      for (let y = 0; y < s; y++) {
        const val = pseudoNoise(x, y, 11);
        if (val > 0.8) {
          ctx.fillStyle = '#e8d59d';
          ctx.fillRect(x, y, 1, 1);
        } else if (val < 0.22) {
          ctx.fillStyle = '#c7b075';
          ctx.fillRect(x, y, 1, 1);
        }
      }
    }
  });

  // 12. Coral Pink
  const coralPink = createTextureCanvas((ctx, s) => {
    ctx.fillStyle = '#e05688';
    ctx.fillRect(0, 0, s, s);
    for (let x = 0; x < s; x++) {
      for (let y = 0; y < s; y++) {
        const val = pseudoNoise(x, y, 12);
        if (val > 0.75) {
          ctx.fillStyle = '#ff7675';
          ctx.fillRect(x, y, 1, 1);
        } else if (val < 0.25) {
          ctx.fillStyle = '#c0392b';
          ctx.fillRect(x, y, 1, 1);
        }
      }
    }
  });

  // 13. Coral Cyan
  const coralCyan = createTextureCanvas((ctx, s) => {
    ctx.fillStyle = '#17c0eb';
    ctx.fillRect(0, 0, s, s);
    for (let x = 0; x < s; x++) {
      for (let y = 0; y < s; y++) {
        const val = pseudoNoise(x, y, 13);
        if (val > 0.75) {
          ctx.fillStyle = '#7efff5';
          ctx.fillRect(x, y, 1, 1);
        } else if (val < 0.25) {
          ctx.fillStyle = '#0984e3';
          ctx.fillRect(x, y, 1, 1);
        }
      }
    }
  });

  // 14. Coral Yellow
  const coralYellow = createTextureCanvas((ctx, s) => {
    ctx.fillStyle = '#f5cd79';
    ctx.fillRect(0, 0, s, s);
    for (let x = 0; x < s; x++) {
      for (let y = 0; y < s; y++) {
        const val = pseudoNoise(x, y, 14);
        if (val > 0.75) {
          ctx.fillStyle = '#fed330';
          ctx.fillRect(x, y, 1, 1);
        } else if (val < 0.25) {
          ctx.fillStyle = '#e17055';
          ctx.fillRect(x, y, 1, 1);
        }
      }
    }
  });

  // 15. Wood Planks Texture (Crafted)
  const woodPlanks = createTextureCanvas((ctx, s) => {
    ctx.fillStyle = '#b8860b';
    ctx.fillRect(0, 0, s, s);
    ctx.fillStyle = '#6b4f10';
    for (let y = 0; y < s; y += 4) {
      ctx.fillRect(0, y, s, 1);
    }
    for (let y = 0; y < s; y += 4) {
      const off = (y / 4) % 2 === 0 ? 0 : 8;
      ctx.fillRect(off, y, 1, 4);
    }
    for (let x = 0; x < s; x++) {
      for (let y = 0; y < s; y++) {
        if (y % 4 !== 0) {
          const val = pseudoNoise(x, y, 15);
          if (val > 0.7) {
            ctx.fillStyle = '#cda02a';
            ctx.fillRect(x, y, 1, 1);
          } else if (val < 0.3) {
            ctx.fillStyle = '#9b7107';
            ctx.fillRect(x, y, 1, 1);
          }
        }
      }
    }
  });

  // 16. Glass Texture
  const glass = createTextureCanvas((ctx, s) => {
    ctx.fillStyle = 'rgba(215, 235, 252, 0.45)';
    ctx.fillRect(0, 0, s, s);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, s, s);
    // diagonal shine streak
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.fillRect(3, 3, 2, 2);
    ctx.fillRect(5, 5, 2, 2);
    ctx.fillRect(10, 10, 3, 1);
  });

  // 17. Crafting Table Top
  const craftingTableTop = createTextureCanvas((ctx, s) => {
    ctx.fillStyle = '#b8860b';
    ctx.fillRect(0, 0, s, s);
    ctx.fillStyle = '#543d0e';
    ctx.fillRect(2, 2, s - 4, s - 4);
    ctx.fillStyle = '#cda02a';
    ctx.fillRect(3, 3, s - 6, s - 6);
    // 3x3 grid lines
    ctx.fillStyle = '#543d0e';
    ctx.fillRect(6, 3, 1, s - 6);
    ctx.fillRect(9, 3, 1, s - 6);
    ctx.fillRect(3, 6, s - 6, 1);
    ctx.fillRect(3, 9, s - 6, 1);
  });

  // 18. Crafting Table Side
  const craftingTableSide = createTextureCanvas((ctx, s) => {
    ctx.fillStyle = '#b8860b';
    ctx.fillRect(0, 0, s, s);
    // Draw hammer & saw icon in pixel art
    ctx.fillStyle = '#543d0e';
    ctx.fillRect(3, 3, 4, 10);
    ctx.fillStyle = '#8f8f8f';
    ctx.fillRect(2, 3, 6, 3);
    // Saw blade
    ctx.fillStyle = '#b2bec3';
    ctx.fillRect(10, 4, 3, 8);
    ctx.fillStyle = '#543d0e';
    ctx.fillRect(10, 11, 3, 2);
  });

  // 19. Coal Ore
  const coalOre = createTextureCanvas((ctx, s) => {
    ctx.fillStyle = '#787878';
    ctx.fillRect(0, 0, s, s);
    for (let x = 0; x < s; x++) {
      for (let y = 0; y < s; y++) {
        const v = pseudoNoise(x, y, 31);
        if (v > 0.8) {
          ctx.fillStyle = '#909090';
          ctx.fillRect(x, y, 1, 1);
        } else if (v < 0.25) {
          ctx.fillStyle = '#606060';
          ctx.fillRect(x, y, 1, 1);
        }
      }
    }
    // Coal chunks
    const clusters = [[3, 3], [4, 3], [3, 4], [4, 4], [10, 6], [11, 6], [10, 7], [7, 11], [8, 11], [7, 12]];
    for (const [cx, cy] of clusters) {
      ctx.fillStyle = '#1c1c1c';
      ctx.fillRect(cx, cy, 2, 2);
      ctx.fillStyle = '#333333';
      ctx.fillRect(cx, cy, 1, 1);
    }
  });

  // 20. Iron Ore
  const ironOre = createTextureCanvas((ctx, s) => {
    ctx.fillStyle = '#787878';
    ctx.fillRect(0, 0, s, s);
    for (let x = 0; x < s; x++) {
      for (let y = 0; y < s; y++) {
        const v = pseudoNoise(x, y, 32);
        if (v > 0.8) {
          ctx.fillStyle = '#909090';
          ctx.fillRect(x, y, 1, 1);
        } else if (v < 0.25) {
          ctx.fillStyle = '#606060';
          ctx.fillRect(x, y, 1, 1);
        }
      }
    }
    // Iron flecks
    const flecks = [[4, 4], [5, 4], [11, 3], [12, 3], [6, 9], [7, 9], [10, 11], [11, 11], [3, 12]];
    for (const [fx, fy] of flecks) {
      ctx.fillStyle = '#d49970';
      ctx.fillRect(fx, fy, 2, 2);
      ctx.fillStyle = '#efbb93';
      ctx.fillRect(fx, fy, 1, 1);
    }
  });

  // 21. Gold Ore
  const goldOre = createTextureCanvas((ctx, s) => {
    ctx.fillStyle = '#787878';
    ctx.fillRect(0, 0, s, s);
    for (let x = 0; x < s; x++) {
      for (let y = 0; y < s; y++) {
        const v = pseudoNoise(x, y, 33);
        if (v > 0.8) {
          ctx.fillStyle = '#909090';
          ctx.fillRect(x, y, 1, 1);
        } else if (v < 0.25) {
          ctx.fillStyle = '#606060';
          ctx.fillRect(x, y, 1, 1);
        }
      }
    }
    // Gold clusters
    const spots = [[3, 5], [4, 5], [10, 4], [11, 4], [7, 8], [8, 8], [4, 11], [5, 11], [11, 12]];
    for (const [gx, gy] of spots) {
      ctx.fillStyle = '#ffd32a';
      ctx.fillRect(gx, gy, 2, 2);
      ctx.fillStyle = '#fff275';
      ctx.fillRect(gx, gy, 1, 1);
    }
  });

  // 22. Diamond Ore
  const diamondOre = createTextureCanvas((ctx, s) => {
    ctx.fillStyle = '#787878';
    ctx.fillRect(0, 0, s, s);
    for (let x = 0; x < s; x++) {
      for (let y = 0; y < s; y++) {
        const v = pseudoNoise(x, y, 34);
        if (v > 0.8) {
          ctx.fillStyle = '#909090';
          ctx.fillRect(x, y, 1, 1);
        } else if (v < 0.25) {
          ctx.fillStyle = '#606060';
          ctx.fillRect(x, y, 1, 1);
        }
      }
    }
    // Glittering cyan crystals
    const gems = [[4, 3], [5, 3], [10, 5], [11, 5], [6, 9], [7, 9], [3, 11], [4, 11], [11, 11]];
    for (const [dx, dy] of gems) {
      ctx.fillStyle = '#00d2d3';
      ctx.fillRect(dx, dy, 2, 2);
      ctx.fillStyle = '#c7ecee';
      ctx.fillRect(dx, dy, 1, 1);
    }
  });

  // 23. Birch Wood Bark (White with dark horizontal spots)
  const birchWood = createTextureCanvas((ctx, s) => {
    ctx.fillStyle = '#ebe6dc';
    ctx.fillRect(0, 0, s, s);
    for (let x = 0; x < s; x++) {
      for (let y = 0; y < s; y++) {
        const v = pseudoNoise(x, y, 35);
        if (v > 0.75) {
          ctx.fillStyle = '#ded7cb';
          ctx.fillRect(x, y, 1, 1);
        }
      }
    }
    // Horizontal dark bark notches
    ctx.fillStyle = '#303030';
    ctx.fillRect(2, 3, 3, 1);
    ctx.fillRect(9, 6, 4, 1);
    ctx.fillRect(4, 10, 4, 1);
    ctx.fillRect(11, 13, 3, 1);
    ctx.fillStyle = '#555555';
    ctx.fillRect(3, 4, 2, 1);
    ctx.fillRect(10, 7, 2, 1);
  });

  // 24. Red Flower (Rose / Poppy)
  const redFlower = createTextureCanvas((ctx, s) => {
    ctx.fillStyle = '#4ea035';
    ctx.fillRect(0, 0, s, s);
    // Green stem
    ctx.fillStyle = '#2d6a1d';
    ctx.fillRect(7, 7, 2, 9);
    // Leaves
    ctx.fillRect(5, 10, 2, 2);
    ctx.fillRect(9, 12, 2, 2);
    // Red petals
    ctx.fillStyle = '#e74c3c';
    ctx.fillRect(5, 2, 6, 6);
    ctx.fillStyle = '#c0392b';
    ctx.fillRect(6, 3, 4, 4);
    ctx.fillStyle = '#f39c12';
    ctx.fillRect(7, 4, 2, 2);
  });

  // 25. Yellow Flower (Dandelion)
  const yellowFlower = createTextureCanvas((ctx, s) => {
    ctx.fillStyle = '#4ea035';
    ctx.fillRect(0, 0, s, s);
    // Stem
    ctx.fillStyle = '#2d6a1d';
    ctx.fillRect(7, 7, 2, 9);
    // Leaves
    ctx.fillRect(4, 11, 3, 2);
    ctx.fillRect(9, 10, 3, 2);
    // Yellow bloom
    ctx.fillStyle = '#f1c40f';
    ctx.fillRect(5, 2, 6, 6);
    ctx.fillStyle = '#f39c12';
    ctx.fillRect(6, 3, 4, 4);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(7, 4, 2, 2);
  });

  // 26. Seaweed / Kelp
  const seaweed = createTextureCanvas((ctx, s) => {
    ctx.fillStyle = '#1e78c6';
    ctx.fillRect(0, 0, s, s);
    // Wavy green kelp
    ctx.fillStyle = '#1b7a42';
    ctx.fillRect(6, 0, 4, s);
    for (let y = 0; y < s; y += 3) {
      const offset = (y % 6 === 0) ? -2 : 2;
      ctx.fillStyle = '#2ecc71';
      ctx.fillRect(7 + offset, y, 3, 2);
    }
  });

  // 27. Torch
  const torch = createTextureCanvas((ctx, s) => {
    ctx.fillStyle = '#222222';
    ctx.fillRect(0, 0, s, s);
    // Wooden stick
    ctx.fillStyle = '#8b5a2b';
    ctx.fillRect(6, 6, 4, 10);
    ctx.fillStyle = '#654321';
    ctx.fillRect(7, 7, 2, 9);
    // Glowing ember head
    ctx.fillStyle = '#e67e22';
    ctx.fillRect(5, 3, 6, 4);
    ctx.fillStyle = '#f1c40f';
    ctx.fillRect(6, 2, 4, 4);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(7, 3, 2, 2);
  });

  // Three.js Materials
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
    createMat(leaves.texture),            // 6: leaves
    createMat(brick.texture),             // 7: brick
    createMat(bedrock.texture),           // 8: bedrock
    createMat(water.texture, true, 0.65), // 9: water
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
    createMat(redFlower.texture),         // 23: redFlower
    createMat(yellowFlower.texture),      // 24: yellowFlower
    createMat(seaweed.texture, true, 0.9),// 25: seaweed
    createMat(torch.texture),             // 26: torch
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
    },
  };
}
