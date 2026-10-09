import * as THREE from 'three';
import { BlockTextureAtlas } from './textures';

export const BLOCK_TYPES = {
  AIR: 0,
  GRASS: 1,
  DIRT: 2,
  STONE: 3,
  WOOD: 4,
  LEAVES: 5,
  BRICK: 6,
  BEDROCK: 7,
  WATER: 8,
  SAND: 9,
  CORAL_PINK: 10,
  CORAL_CYAN: 11,
  CORAL_YELLOW: 12,
  WOOD_PLANKS: 13,
  GLASS: 14,
  CRAFTING_TABLE: 15,
  COAL_ORE: 16,
  IRON_ORE: 17,
  GOLD_ORE: 18,
  DIAMOND_ORE: 19,
  BIRCH_WOOD: 20,
  RED_FLOWER: 21,
  YELLOW_FLOWER: 22,
  SEAWEED: 23,
  TORCH: 24,
  SNOW: 25,
  ICE: 26,
  CACTUS: 27,
  CHERRY_LEAVES: 28,
  RED_SAND: 29,
  // New Biome & Special Blocks
  TERRACOTTA: 30,
  RED_TERRACOTTA: 31,
  ORANGE_TERRACOTTA: 32,
  YELLOW_TERRACOTTA: 33,
  WHITE_TERRACOTTA: 34,
  BROWN_TERRACOTTA: 35,
  DARK_OAK_WOOD: 36,
  DARK_OAK_LEAVES: 37,
  RED_MUSHROOM_BLOCK: 38,
  BROWN_MUSHROOM_BLOCK: 39,
  MUSHROOM_STEM: 40,
  JUNGLE_WOOD: 41,
  JUNGLE_LEAVES: 42,
  MELON: 43,
  PUMPKIN: 44,
  LILY_PAD: 45,
  MUD: 46,
  MOSS: 47,
  AMETHYST: 48,
  MAGMA: 49,
  GLOWSTONE: 50,
  OBSIDIAN: 51,
  DEEPSLATE: 52,
  FURNACE: 53,
  FURNACE_LIT: 54,
  SPRUCE_WOOD: 55,
  SPRUCE_LEAVES: 56,
  NETHERRACK: 57,
  SOUL_SAND: 58,
  NETHER_BRICKS: 59,
  NETHER_PORTAL: 60,
  SWEET_BERRY_BUSH: 61,
};

export const CHUNK_SIZE = 16;
export const WORLD_HEIGHT = 36;
export const SEA_LEVEL = 13;

export const RENDER_RADIUS = 3; // 7x7 chunks around player (112x112 blocks)
export const UNLOAD_RADIUS = 5; // Unload beyond 5 chunks distance

interface FaceDefinition {
  dir: [number, number, number];
  verts: [number, number, number][];
  uvs: number[];
  norm: [number, number, number];
}

const FACES: FaceDefinition[] = [
  // Right (+X)
  {
    dir: [1, 0, 0],
    verts: [[1, 0, 0], [1, 1, 0], [1, 1, 1], [1, 0, 0], [1, 1, 1], [1, 0, 1]],
    uvs: [0, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0],
    norm: [1, 0, 0],
  },
  // Left (-X)
  {
    dir: [-1, 0, 0],
    verts: [[0, 0, 1], [0, 1, 1], [0, 1, 0], [0, 0, 1], [0, 1, 0], [0, 0, 0]],
    uvs: [0, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0],
    norm: [-1, 0, 0],
  },
  // Top (+Y)
  {
    dir: [0, 1, 0],
    verts: [[0, 1, 1], [1, 1, 1], [1, 1, 0], [0, 1, 1], [1, 1, 0], [0, 1, 0]],
    uvs: [0, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0],
    norm: [0, 1, 0],
  },
  // Bottom (-Y)
  {
    dir: [0, -1, 0],
    verts: [[0, 0, 0], [1, 0, 0], [1, 0, 1], [0, 0, 0], [1, 0, 1], [0, 0, 1]],
    uvs: [0, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0],
    norm: [0, -1, 0],
  },
  // Front (+Z)
  {
    dir: [0, 0, 1],
    verts: [[1, 0, 1], [1, 1, 1], [0, 1, 1], [1, 0, 1], [0, 1, 1], [0, 0, 1]],
    uvs: [0, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0],
    norm: [0, 0, 1],
  },
  // Back (-Z)
  {
    dir: [0, 0, -1],
    verts: [[0, 0, 0], [0, 1, 0], [1, 1, 0], [0, 0, 0], [1, 1, 0], [1, 0, 0]],
    uvs: [0, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0],
    norm: [0, 0, -1],
  },
];

export class Chunk {
  cx: number;
  cz: number;
  startX: number;
  startZ: number;
  blocks: Uint8Array;
  mesh: THREE.Mesh | null = null;
  isDirty: boolean = true;
  isGenerated: boolean = false;

  constructor(cx: number, cz: number) {
    this.cx = cx;
    this.cz = cz;
    this.startX = cx * CHUNK_SIZE;
    this.startZ = cz * CHUNK_SIZE;
    this.blocks = new Uint8Array(CHUNK_SIZE * WORLD_HEIGHT * CHUNK_SIZE);
  }

  getIndex(lx: number, y: number, lz: number): number {
    return lx + lz * CHUNK_SIZE + y * CHUNK_SIZE * CHUNK_SIZE;
  }

  getBlock(lx: number, y: number, lz: number): number {
    if (lx < 0 || lx >= CHUNK_SIZE || y < 0 || y >= WORLD_HEIGHT || lz < 0 || lz >= CHUNK_SIZE) {
      return BLOCK_TYPES.AIR;
    }
    return this.blocks[this.getIndex(lx, y, lz)];
  }

  setBlock(lx: number, y: number, lz: number, id: number) {
    if (lx < 0 || lx >= CHUNK_SIZE || y < 0 || y >= WORLD_HEIGHT || lz < 0 || lz >= CHUNK_SIZE) {
      return;
    }
    this.blocks[this.getIndex(lx, y, lz)] = id;
    this.isDirty = true;
  }
}

export interface WaterUpdateEvent {
  x: number;
  y: number;
  z: number;
  depth: number;
}

export class VoxelWorld {
  chunks: Map<string, Chunk> = new Map();
  scene: THREE.Scene;
  atlas: BlockTextureAtlas;
  chunkMeshes: THREE.Mesh[] = [];

  lastPlayerCx: number = 999999;
  lastPlayerCz: number = 999999;

  // Water Physics Queue
  private activeWaterQueue: WaterUpdateEvent[] = [];
  private waterTickAccumulator: number = 0;

  constructor(scene: THREE.Scene, atlas: BlockTextureAtlas) {
    this.scene = scene;
    this.atlas = atlas;
    // Initial spawn chunks around (0, 0)
    this.update(0, 0, true);
  }

  // Active World Torches for Dynamic Point Lighting
  public torches: Map<string, { x: number; y: number; z: number }> = new Map();

  addTorch(x: number, y: number, z: number) {
    this.torches.set(`${x},${y},${z}`, { x, y, z });
  }

  removeTorch(x: number, y: number, z: number) {
    this.torches.delete(`${x},${y},${z}`);
  }

  getNearbyTorches(px: number, py: number, pz: number, maxDist: number = 24): { x: number; y: number; z: number }[] {
    const list: { x: number; y: number; z: number; distSq: number }[] = [];
    const maxSq = maxDist * maxDist;
    for (const t of this.torches.values()) {
      const dx = t.x + 0.5 - px;
      const dy = t.y + 0.5 - py;
      const dz = t.z + 0.5 - pz;
      const distSq = dx * dx + dy * dy + dz * dz;
      if (distSq <= maxSq) {
        list.push({ x: t.x, y: t.y, z: t.z, distSq });
      }
    }
    list.sort((a, b) => a.distSq - b.distSq);
    return list.slice(0, 10);
  }

  chunkKey(cx: number, cz: number): string {
    return `${cx},${cz}`;
  }

  getChunk(cx: number, cz: number): Chunk | undefined {
    return this.chunks.get(this.chunkKey(cx, cz));
  }

  getOrCreateChunk(cx: number, cz: number): Chunk {
    const key = this.chunkKey(cx, cz);
    let chunk = this.chunks.get(key);
    if (!chunk) {
      chunk = new Chunk(cx, cz);
      this.generateChunkTerrain(chunk);
      this.chunks.set(key, chunk);
    }
    return chunk;
  }

  getChunkAtWorldPos(wx: number, wz: number): Chunk | undefined {
    const cx = Math.floor(wx / CHUNK_SIZE);
    const cz = Math.floor(wz / CHUNK_SIZE);
    return this.getChunk(cx, cz);
  }

  getBlock(wx: number, wy: number, wz: number): number {
    if (wy < 0 || wy >= WORLD_HEIGHT) return BLOCK_TYPES.AIR;
    const chunk = this.getChunkAtWorldPos(wx, wz);
    if (!chunk) return BLOCK_TYPES.AIR;
    const lx = ((wx % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
    const lz = ((wz % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
    return chunk.getBlock(lx, wy, lz);
  }

  setBlock(wx: number, wy: number, wz: number, id: number): boolean {
    if (wy < 0 || wy >= WORLD_HEIGHT) return false;
    const cx = Math.floor(wx / CHUNK_SIZE);
    const cz = Math.floor(wz / CHUNK_SIZE);
    const chunk = this.getOrCreateChunk(cx, cz);
    const lx = ((wx % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
    const lz = ((wz % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;

    const oldBlock = chunk.getBlock(lx, wy, lz);
    chunk.setBlock(lx, wy, lz, id);

    if (oldBlock === BLOCK_TYPES.TORCH && id !== BLOCK_TYPES.TORCH) {
      this.removeTorch(wx, wy, wz);
    } else if (id === BLOCK_TYPES.TORCH) {
      this.addTorch(wx, wy, wz);
    }

    // If block is placed at chunk border, dirty neighboring chunk so mesh edge updates properly
    if (lx === 0) {
      const neighbor = this.getChunk(cx - 1, cz);
      if (neighbor) neighbor.isDirty = true;
    }
    if (lx === CHUNK_SIZE - 1) {
      const neighbor = this.getChunk(cx + 1, cz);
      if (neighbor) neighbor.isDirty = true;
    }
    if (lz === 0) {
      const neighbor = this.getChunk(cx, cz - 1);
      if (neighbor) neighbor.isDirty = true;
    }
    if (lz === CHUNK_SIZE - 1) {
      const neighbor = this.getChunk(cx, cz + 1);
      if (neighbor) neighbor.isDirty = true;
    }

    // Trigger Water Physics if water placed or neighboring block broken next to water
    if (id === BLOCK_TYPES.WATER) {
      this.queueWaterUpdate(wx, wy, wz, 0);
    } else if (id === BLOCK_TYPES.AIR) {
      // Check surrounding water blocks to flow into empty air
      const adj = [
        [0, 1, 0],
        [1, 0, 0],
        [-1, 0, 0],
        [0, 0, 1],
        [0, 0, -1],
      ];
      for (const [dx, dy, dz] of adj) {
        if (this.getBlock(wx + dx, wy + dy, wz + dz) === BLOCK_TYPES.WATER) {
          this.queueWaterUpdate(wx + dx, wy + dy, wz + dz, 0);
        }
      }
    }

    this.rebuildDirtyChunks();
    return true;
  }

  public queueWaterUpdate(wx: number, wy: number, wz: number, depth: number = 0) {
    if (depth > 6) return; // Prevent runaway water spreading beyond 6 blocks
    this.activeWaterQueue.push({ x: wx, y: wy, z: wz, depth });
  }

  // Real-time Water Flow Simulation
  public updateWaterPhysics(dt: number) {
    this.waterTickAccumulator += dt;
    if (this.waterTickAccumulator < 0.12) return; // Tick water every 120ms
    this.waterTickAccumulator = 0;

    if (this.activeWaterQueue.length === 0) return;

    const currentBatch = this.activeWaterQueue.splice(0, 16);
    let changed = false;

    for (const item of currentBatch) {
      const { x, y, z, depth } = item;
      if (this.getBlock(x, y, z) !== BLOCK_TYPES.WATER) continue;

      // 1. Flow Downward (Gravity takes top priority)
      if (y > 1) {
        const below = this.getBlock(x, y - 1, z);
        if (
          below === BLOCK_TYPES.AIR ||
          below === BLOCK_TYPES.RED_FLOWER ||
          below === BLOCK_TYPES.YELLOW_FLOWER ||
          below === BLOCK_TYPES.TORCH
        ) {
          const cx = Math.floor(x / CHUNK_SIZE);
          const cz = Math.floor(z / CHUNK_SIZE);
          const chunk = this.getOrCreateChunk(cx, cz);
          const lx = ((x % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
          const lz = ((z % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
          chunk.setBlock(lx, y - 1, lz, BLOCK_TYPES.WATER);
          this.queueWaterUpdate(x, y - 1, z, 0);
          changed = true;
          continue; // Vertical flow takes precedence over horizontal spread
        } else if (below === BLOCK_TYPES.MAGMA) {
          // Water touches Magma -> Cobblestone/Obsidian conversion
          const cx = Math.floor(x / CHUNK_SIZE);
          const cz = Math.floor(z / CHUNK_SIZE);
          const chunk = this.getOrCreateChunk(cx, cz);
          const lx = ((x % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
          const lz = ((z % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
          chunk.setBlock(lx, y - 1, lz, BLOCK_TYPES.OBSIDIAN);
          changed = true;
        }
      }

      // 2. Flow Horizontally (Spreads to adjacent empty blocks if on top of solid ground)
      if (depth < 4) {
        const sides = [
          [1, 0, 0],
          [-1, 0, 0],
          [0, 0, 1],
          [0, 0, -1],
        ];
        for (const [dx, dy, dz] of sides) {
          const nx = x + dx;
          const ny = y + dy;
          const nz = z + dz;
          const target = this.getBlock(nx, ny, nz);
          if (
            target === BLOCK_TYPES.AIR ||
            target === BLOCK_TYPES.RED_FLOWER ||
            target === BLOCK_TYPES.YELLOW_FLOWER ||
            target === BLOCK_TYPES.TORCH
          ) {
            const cx = Math.floor(nx / CHUNK_SIZE);
            const cz = Math.floor(nz / CHUNK_SIZE);
            const chunk = this.getOrCreateChunk(cx, cz);
            const lx = ((nx % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
            const lz = ((nz % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
            chunk.setBlock(lx, ny, lz, BLOCK_TYPES.WATER);
            this.queueWaterUpdate(nx, ny, nz, depth + 1);
            changed = true;
          } else if (target === BLOCK_TYPES.MAGMA) {
            const cx = Math.floor(nx / CHUNK_SIZE);
            const cz = Math.floor(nz / CHUNK_SIZE);
            const chunk = this.getOrCreateChunk(cx, cz);
            const lx = ((nx % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
            const lz = ((nz % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
            chunk.setBlock(lx, ny, lz, BLOCK_TYPES.STONE);
            changed = true;
          }
        }
      }
    }

    if (changed) {
      this.rebuildDirtyChunks();
    }
  }

  isSolid(wx: number, wy: number, wz: number): boolean {
    const b = this.getBlock(wx, wy, wz);
    return (
      b !== BLOCK_TYPES.AIR &&
      b !== BLOCK_TYPES.WATER &&
      b !== BLOCK_TYPES.RED_FLOWER &&
      b !== BLOCK_TYPES.YELLOW_FLOWER &&
      b !== BLOCK_TYPES.SEAWEED &&
      b !== BLOCK_TYPES.TORCH &&
      b !== BLOCK_TYPES.LILY_PAD &&
      b !== BLOCK_TYPES.SWEET_BERRY_BUSH &&
      b !== BLOCK_TYPES.NETHER_PORTAL
    );
  }

  isWaterOrFluid(wx: number, wy: number, wz: number): boolean {
    const b = this.getBlock(wx, wy, wz);
    return b === BLOCK_TYPES.WATER || b === BLOCK_TYPES.SEAWEED;
  }

  getHighestSolidBlock(wx: number, wz: number): number {
    for (let y = WORLD_HEIGHT - 1; y >= 0; y--) {
      if (this.isSolid(wx, y, wz)) {
        return y;
      }
    }
    return 10;
  }

  getHighestVisibleBlock(wx: number, wz: number): { y: number; blockId: number } {
    for (let y = WORLD_HEIGHT - 1; y >= 0; y--) {
      const b = this.getBlock(wx, y, wz);
      if (b !== BLOCK_TYPES.AIR) {
        return { y, blockId: b };
      }
    }
    return { y: 0, blockId: BLOCK_TYPES.BEDROCK };
  }

  // Expanded Diverse Procedural Biomes
  getBiome(wx: number, wz: number, surfHeight?: number): { type: string; name: string; color: string } {
    const sh = surfHeight !== undefined ? surfHeight : this.getTerrainHeight(wx, wz);
    if (sh < SEA_LEVEL) {
      return { type: 'ocean', name: 'Coral Ocean', color: '#2980b9' };
    }
    if (sh <= SEA_LEVEL + 1) {
      return { type: 'beach', name: 'Golden Beach', color: '#f1c40f' };
    }

    // Continental climate noises (temperature, humidity, roughness)
    const temp = Math.sin(wx * 0.009 + 1.8) * Math.cos(wz * 0.009 - 0.4) * 0.5 + 0.5;
    const humidity = Math.cos(wx * 0.01 - 1.2) * Math.sin(wz * 0.01 + 0.9) * 0.5 + 0.5;
    const weirdness = Math.sin(wx * 0.015) * Math.sin(wz * 0.015) * 0.5 + 0.5;

    // 1. Snowy Peaks & Tundra
    if (temp < 0.26) {
      return { type: 'snow', name: 'Snowy Peaks & Tundra', color: '#dff9fb' };
    }

    // 2. Badlands / Mesa Canyons (Hot, Arid, High weirdness)
    if (temp > 0.75 && humidity < 0.35) {
      return { type: 'badlands', name: 'Badlands Mesa', color: '#e17055' };
    }

    // 3. Sunken Desert Dunes
    if (temp > 0.65 && humidity < 0.45) {
      return { type: 'desert', name: 'Desert Dunes', color: '#f6e58d' };
    }

    // 4. Tropical Jungle (Hot, High Humidity)
    if (temp > 0.62 && humidity > 0.68) {
      return { type: 'jungle', name: 'Tropical Jungle', color: '#00b894' };
    }

    // 5. Roofed Dark Oak Forest & Giant Mushrooms (Temperate, Moderate-High Humidity, High Weirdness)
    if (humidity > 0.58 && temp >= 0.35 && temp <= 0.65 && weirdness > 0.55) {
      return { type: 'dark_forest', name: 'Roofed Dark Forest', color: '#2d3436' };
    }

    // 6. Murky Swamp (Lowland, High Humidity, Mild Temp)
    if (humidity > 0.72 && sh <= SEA_LEVEL + 3) {
      return { type: 'swamp', name: 'Murky Swamplands', color: '#55efc4' };
    }

    // 7. Cherry Blossom Grove
    if (humidity > 0.62 && temp >= 0.38 && temp <= 0.68) {
      return { type: 'cherry', name: 'Cherry Blossom Grove', color: '#f8a5c2' };
    }

    // 8. Lush Forest & Plains
    return { type: 'plains', name: 'Lush Forest & Plains', color: '#2ecc71' };
  }

  private pseudoNoise(x: number, y: number, seed: number = 777): number {
    const n = Math.sin(x * 12.9898 + y * 78.233 + seed * 43.123) * 43758.5453;
    return n - Math.floor(n);
  }

  getTerrainHeight(wx: number, wz: number): number {
    // Multi-octave continuous noise generating rich natural topography:
    const continental = Math.sin(wx * 0.012) * Math.cos(wz * 0.014) * 6.5;
    const hills = Math.sin(wx * 0.045 + 1.2) * Math.cos(wz * 0.05) * 4.5 + Math.cos((wx + wz) * 0.032) * 3.0;
    const detail = Math.sin(wx * 0.12 - wz * 0.1) * 1.6;

    // Badlands Mesa Plateaus
    const temp = Math.sin(wx * 0.009 + 1.8) * Math.cos(wz * 0.009 - 0.4) * 0.5 + 0.5;
    const humidity = Math.cos(wx * 0.01 - 1.2) * Math.sin(wz * 0.01 + 0.9) * 0.5 + 0.5;
    let mesaBonus = 0;
    if (temp > 0.75 && humidity < 0.35) {
      mesaBonus = Math.min(8, Math.max(0, Math.sin(wx * 0.03) * Math.cos(wz * 0.03) * 12));
    }

    const raw = 14.5 + continental + hills + detail + mesaBonus;
    return Math.max(5, Math.min(Math.floor(raw), WORLD_HEIGHT - 8));
  }

  private isCave(wx: number, wy: number, wz: number, surfaceHeight: number): boolean {
    if (wy <= 1 || wy >= surfaceHeight - 2) return false;
    const c1 = Math.sin(wx * 0.16 + wy * 0.22) * Math.cos(wz * 0.16 + wy * 0.18);
    const c2 = Math.cos(wx * 0.12 - wy * 0.17) * Math.sin(wz * 0.14 + wx * 0.08);
    const chamber = Math.sin(wx * 0.08 + wz * 0.08) * Math.cos(wy * 0.14);
    return (c1 * c1 + c2 * c2 < 0.048) || (chamber > 0.88 && wy < surfaceHeight - 4 && wy > 4);
  }

  generateChunkTerrain(chunk: Chunk) {
    if (chunk.isGenerated) return;
    chunk.isGenerated = true;

    const startX = chunk.startX;
    const startZ = chunk.startZ;

    // 1. Base terrain columns (Bedrock, Deepslate, Stone, Caves, Sand, Dirt, Grass, Terracotta)
    for (let lx = 0; lx < CHUNK_SIZE; lx++) {
      for (let lz = 0; lz < CHUNK_SIZE; lz++) {
        const wx = startX + lx;
        const wz = startZ + lz;
        const surfHeight = this.getTerrainHeight(wx, wz);
        const biome = this.getBiome(wx, wz, surfHeight);

        // Bedrock floor
        chunk.setBlock(lx, 0, lz, BLOCK_TYPES.BEDROCK);

        const isUnderwater = surfHeight < SEA_LEVEL;

        for (let wy = 1; wy <= Math.max(surfHeight, SEA_LEVEL); wy++) {
          if (wy > surfHeight) {
            // Above ground but below or at sea level
            if (wy <= SEA_LEVEL) {
              if (biome.type === 'snow' && wy === SEA_LEVEL) {
                chunk.setBlock(lx, wy, lz, BLOCK_TYPES.ICE);
              } else {
                chunk.setBlock(lx, wy, lz, BLOCK_TYPES.WATER);
                // In Swamp, occasional floating Lily pads
                if (biome.type === 'swamp' && wy === SEA_LEVEL && this.pseudoNoise(wx, wz, 333) > 0.82) {
                  chunk.setBlock(lx, wy + 1, lz, BLOCK_TYPES.LILY_PAD);
                }
              }
            }
            continue;
          }

          // 3D Subterranean Caves & Geodes
          if (this.isCave(wx, wy, wz, surfHeight)) {
            if (isUnderwater && wy > surfHeight - 3) {
              chunk.setBlock(lx, wy, lz, BLOCK_TYPES.WATER);
            } else if (wy <= 4) {
              // Deep cave floors have Magma or Glowstone pools
              const magNoise = this.pseudoNoise(wx, wz, wy);
              if (magNoise > 0.8) {
                chunk.setBlock(lx, wy, lz, BLOCK_TYPES.MAGMA);
              } else if (magNoise > 0.72) {
                chunk.setBlock(lx, wy, lz, BLOCK_TYPES.GLOWSTONE);
              } else {
                chunk.setBlock(lx, wy, lz, BLOCK_TYPES.AIR);
              }
            } else {
              // Occasional glowing Amethyst clusters in cavern walls
              const amyNoise = this.pseudoNoise(wx, wy, wz * 2);
              if (amyNoise > 0.94 && wy <= 12) {
                chunk.setBlock(lx, wy, lz, BLOCK_TYPES.AMETHYST);
              } else {
                chunk.setBlock(lx, wy, lz, BLOCK_TYPES.AIR);
              }
            }
            continue;
          }

          // Deepslate in deep underground (y <= 7)
          let stoneType = wy <= 7 ? BLOCK_TYPES.DEEPSLATE : BLOCK_TYPES.STONE;
          if (wy <= surfHeight - 4) {
            if (wy <= 8 && wy >= 1 && this.pseudoNoise(wx * 2.7 + wy * 1.5, wz * 2.7 + wy * 0.8, 111) > 0.965) {
              stoneType = BLOCK_TYPES.DIAMOND_ORE;
            } else if (wy <= 14 && wy >= 2 && this.pseudoNoise(wx * 2.1 + wy * 1.1, wz * 2.1 + wy * 0.9, 222) > 0.948) {
              stoneType = BLOCK_TYPES.GOLD_ORE;
            } else if (wy <= 22 && wy >= 3 && this.pseudoNoise(wx * 1.6 + wy * 0.7, wz * 1.6 + wy * 0.6, 333) > 0.915) {
              stoneType = BLOCK_TYPES.IRON_ORE;
            } else if (wy <= 28 && wy >= 4 && this.pseudoNoise(wx * 1.3 + wy * 0.5, wz * 1.3 + wy * 0.4, 444) > 0.885) {
              stoneType = BLOCK_TYPES.COAL_ORE;
            }
          }

          // Topsoil / Stratified Biome Layers
          if (wy === surfHeight) {
            if (isUnderwater) {
              chunk.setBlock(lx, wy, lz, BLOCK_TYPES.SAND);
            } else if (biome.type === 'beach') {
              chunk.setBlock(lx, wy, lz, BLOCK_TYPES.SAND);
            } else if (biome.type === 'snow') {
              chunk.setBlock(lx, wy, lz, BLOCK_TYPES.SNOW);
            } else if (biome.type === 'badlands') {
              chunk.setBlock(lx, wy, lz, BLOCK_TYPES.RED_SAND);
            } else if (biome.type === 'desert') {
              chunk.setBlock(lx, wy, lz, BLOCK_TYPES.SAND);
            } else if (biome.type === 'swamp') {
              chunk.setBlock(lx, wy, lz, BLOCK_TYPES.MUD);
            } else if (biome.type === 'dark_forest') {
              chunk.setBlock(lx, wy, lz, BLOCK_TYPES.MOSS);
            } else if (biome.type === 'jungle') {
              chunk.setBlock(lx, wy, lz, BLOCK_TYPES.GRASS);
              // Scatter Melons & Pumpkins
              const vegNoise = this.pseudoNoise(wx, wz, 888);
              if (vegNoise > 0.95) {
                chunk.setBlock(lx, wy + 1, lz, BLOCK_TYPES.MELON);
              } else if (vegNoise > 0.92) {
                chunk.setBlock(lx, wy + 1, lz, BLOCK_TYPES.PUMPKIN);
              }
            } else if (biome.type === 'cherry') {
              chunk.setBlock(lx, wy, lz, BLOCK_TYPES.GRASS);
              const flowerNoise = this.pseudoNoise(wx, wz, 555);
              if (flowerNoise > 0.9) {
                chunk.setBlock(lx, wy + 1, lz, BLOCK_TYPES.RED_FLOWER);
              }
            } else {
              chunk.setBlock(lx, wy, lz, BLOCK_TYPES.GRASS);
              const flowerNoise = this.pseudoNoise(wx, wz, 555);
              if (flowerNoise > 0.935) {
                chunk.setBlock(lx, wy + 1, lz, BLOCK_TYPES.RED_FLOWER);
              } else if (flowerNoise > 0.875) {
                chunk.setBlock(lx, wy + 1, lz, BLOCK_TYPES.YELLOW_FLOWER);
              }
            }
          } else if (wy >= surfHeight - 3) {
            // Sub-surface strata
            if (biome.type === 'badlands') {
              // Terracotta color bands
              const band = (wy + Math.floor(wx * 0.05 + wz * 0.05)) % 6;
              const terraBlock =
                band === 0
                  ? BLOCK_TYPES.RED_TERRACOTTA
                  : band === 1
                  ? BLOCK_TYPES.ORANGE_TERRACOTTA
                  : band === 2
                  ? BLOCK_TYPES.YELLOW_TERRACOTTA
                  : band === 3
                  ? BLOCK_TYPES.WHITE_TERRACOTTA
                  : band === 4
                  ? BLOCK_TYPES.BROWN_TERRACOTTA
                  : BLOCK_TYPES.TERRACOTTA;
              chunk.setBlock(lx, wy, lz, terraBlock);
            } else if (biome.type === 'desert') {
              chunk.setBlock(lx, wy, lz, BLOCK_TYPES.SAND);
            } else if (biome.type === 'swamp') {
              chunk.setBlock(lx, wy, lz, BLOCK_TYPES.MUD);
            } else {
              chunk.setBlock(lx, wy, lz, BLOCK_TYPES.DIRT);
            }
          } else {
            chunk.setBlock(lx, wy, lz, stoneType);
          }
        }

        // 2. Rare Warm Ocean Coral Reefs (Authentic Minecraft clustered warm ocean reefs)
        if (isUnderwater && surfHeight >= 7 && surfHeight < SEA_LEVEL - 1 && biome.type !== 'snow' && biome.type !== 'swamp') {
          // Regional clustering: only ~12% of ocean zones contain a coral reef
          const reefZoneNoise = this.pseudoNoise(Math.floor(wx / 36), Math.floor(wz / 36), 8888);
          if (reefZoneNoise > 0.88) {
            const noise = this.pseudoNoise(wx, wz, 999);
            if (noise > 0.76) {
              const coralType =
                noise > 0.92
                  ? BLOCK_TYPES.CORAL_PINK
                  : noise > 0.84
                  ? BLOCK_TYPES.CORAL_CYAN
                  : BLOCK_TYPES.CORAL_YELLOW;
              const coralHeight = Math.min(2 + Math.floor((noise - 0.76) * 14), SEA_LEVEL - surfHeight);
              for (let cy = 1; cy <= coralHeight; cy++) {
                chunk.setBlock(lx, surfHeight + cy, lz, coralType);
              }
            }
          }
        }

        if (isUnderwater && surfHeight >= 4 && surfHeight <= SEA_LEVEL - 3) {
          const weedNoise = this.pseudoNoise(wx, wz, 777);
          if (weedNoise > 0.84) {
            const weedHeight = Math.min(2 + Math.floor((weedNoise - 0.84) * 15), SEA_LEVEL - surfHeight - 1);
            for (let ky = 1; ky <= weedHeight; ky++) {
              chunk.setBlock(lx, surfHeight + ky, lz, BLOCK_TYPES.SEAWEED);
            }
          }
        }
      }
    }

    // 3. Flora, Giant Trees, Mushrooms & Biome Features
    for (let tx = startX - 2; tx <= startX + CHUNK_SIZE + 1; tx++) {
      for (let tz = startZ - 2; tz <= startZ + CHUNK_SIZE + 1; tz++) {
        const surfY = this.getTerrainHeight(tx, tz);
        if (surfY <= SEA_LEVEL + 1 || surfY >= WORLD_HEIGHT - 9) continue;
        const b = this.getBiome(tx, tz, surfY);

        // A. Desert Cacti
        if (b.type === 'desert' || b.type === 'badlands') {
          if (Math.abs(tx) % 4 === 0 && Math.abs(tz) % 4 === 0 && this.pseudoNoise(tx, tz, 77) > 0.75) {
            const cactusHeight = 2 + Math.floor(this.pseudoNoise(tx, tz, 88) * 2.5);
            for (let cy = 1; cy <= cactusHeight; cy++) {
              const wx = tx;
              const wy = surfY + cy;
              const wz = tz;
              if (wx >= startX && wx < startX + CHUNK_SIZE && wz >= startZ && wz < startZ + CHUNK_SIZE) {
                chunk.setBlock(wx - startX, wy, wz - startZ, BLOCK_TYPES.CACTUS);
              }
            }
          }
          continue;
        }

        // B. Dark Forest Giant Mushrooms & Thick Dark Oak
        if (b.type === 'dark_forest') {
          if (Math.abs(tx) % 4 === 0 && Math.abs(tz) % 4 === 0 && this.pseudoNoise(tx, tz, 512) > 0.65) {
            const isGiantMushroom = this.pseudoNoise(tx, tz, 101) > 0.55;
            if (isGiantMushroom) {
              const isRedMushroom = this.pseudoNoise(tx, tz, 202) > 0.5;
              const shroomHeight = 4 + Math.floor(this.pseudoNoise(tx, tz, 303) * 2);

              // Stem
              for (let y = 1; y <= shroomHeight; y++) {
                if (tx >= startX && tx < startX + CHUNK_SIZE && tz >= startZ && tz < startZ + CHUNK_SIZE) {
                  chunk.setBlock(tx - startX, surfY + y, tz - startZ, BLOCK_TYPES.MUSHROOM_STEM);
                }
              }

              // Mushroom Cap
              const capBlock = isRedMushroom ? BLOCK_TYPES.RED_MUSHROOM_BLOCK : BLOCK_TYPES.BROWN_MUSHROOM_BLOCK;
              const capY = surfY + shroomHeight;
              for (let ox = -2; ox <= 2; ox++) {
                for (let oz = -2; oz <= 2; oz++) {
                  if (Math.abs(ox) === 2 && Math.abs(oz) === 2) continue;
                  const wx = tx + ox;
                  const wz = tz + oz;
                  if (wx >= startX && wx < startX + CHUNK_SIZE && wz >= startZ && wz < startZ + CHUNK_SIZE) {
                    chunk.setBlock(wx - startX, capY, wz - startZ, capBlock);
                    if (isRedMushroom && (Math.abs(ox) === 2 || Math.abs(oz) === 2)) {
                      chunk.setBlock(wx - startX, capY - 1, wz - startZ, capBlock);
                    }
                  }
                }
              }
            } else {
              // Dark Oak Tree
              const trunkH = 5;
              for (let y = 1; y <= trunkH; y++) {
                if (tx >= startX && tx < startX + CHUNK_SIZE && tz >= startZ && tz < startZ + CHUNK_SIZE) {
                  chunk.setBlock(tx - startX, surfY + y, tz - startZ, BLOCK_TYPES.DARK_OAK_WOOD);
                }
              }
              for (let ly = surfY + trunkH - 1; ly <= surfY + trunkH + 2; ly++) {
                for (let ox = -2; ox <= 2; ox++) {
                  for (let oz = -2; oz <= 2; oz++) {
                    const wx = tx + ox;
                    const wz = tz + oz;
                    if (wx >= startX && wx < startX + CHUNK_SIZE && wz >= startZ && wz < startZ + CHUNK_SIZE) {
                      if (chunk.getBlock(wx - startX, ly, wz - startZ) === BLOCK_TYPES.AIR) {
                        chunk.setBlock(wx - startX, ly, wz - startZ, BLOCK_TYPES.DARK_OAK_LEAVES);
                      }
                    }
                  }
                }
              }
            }
          }
          continue;
        }

        // C. Tropical Jungle Trees (Huge tall trees)
        if (b.type === 'jungle') {
          if (Math.abs(tx) % 4 === 0 && Math.abs(tz) % 4 === 0 && this.pseudoNoise(tx, tz, 789) > 0.6) {
            const trunkH = 7 + Math.floor(this.pseudoNoise(tx, tz, 99) * 3);
            for (let y = 1; y <= trunkH; y++) {
              if (tx >= startX && tx < startX + CHUNK_SIZE && tz >= startZ && tz < startZ + CHUNK_SIZE) {
                chunk.setBlock(tx - startX, surfY + y, tz - startZ, BLOCK_TYPES.JUNGLE_WOOD);
              }
            }
            for (let ly = surfY + trunkH - 2; ly <= surfY + trunkH + 2; ly++) {
              const rad = ly >= surfY + trunkH + 1 ? 1 : 2;
              for (let ox = -rad; ox <= rad; ox++) {
                for (let oz = -rad; oz <= rad; oz++) {
                  const wx = tx + ox;
                  const wz = tz + oz;
                  if (wx >= startX && wx < startX + CHUNK_SIZE && wz >= startZ && wz < startZ + CHUNK_SIZE) {
                    if (chunk.getBlock(wx - startX, ly, wz - startZ) === BLOCK_TYPES.AIR) {
                      chunk.setBlock(wx - startX, ly, wz - startZ, BLOCK_TYPES.JUNGLE_LEAVES);
                    }
                  }
                }
              }
            }
          }
          continue;
        }

        // D1. Snow Biome: Tall Conical Spruce Trees (Taiga), Sweet Berry Bushes & Cozy Igloos
        if (b.type === 'snow') {
          // Generously spaced Taiga Spruce Trees (spaced 7 to 9 blocks apart with open walking clearance)
          const cellX = Math.floor(tx / 8);
          const cellZ = Math.floor(tz / 8);
          const treeX = cellX * 8 + Math.floor(this.pseudoNoise(cellX, cellZ, 11) * 3);
          const treeZ = cellZ * 8 + Math.floor(this.pseudoNoise(cellX, cellZ, 22) * 3);

          if (tx === treeX && tz === treeZ && this.pseudoNoise(cellX, cellZ, 51) > 0.35) {
            // Tall trunk (8 to 11 blocks high) so leaves start high above the player
            const trunkHeight = 8 + Math.floor(this.pseudoNoise(tx, tz, 82) * 4);
            for (let y = 1; y <= trunkHeight; y++) {
              const wx = tx;
              const wy = surfY + y;
              const wz = tz;
              if (wx >= startX && wx < startX + CHUNK_SIZE && wz >= startZ && wz < startZ + CHUNK_SIZE) {
                chunk.setBlock(wx - startX, wy, wz - startZ, BLOCK_TYPES.SPRUCE_WOOD);
              }
            }
            if (tx >= startX && tx < startX + CHUNK_SIZE && tz >= startZ && tz < startZ + CHUNK_SIZE) {
              chunk.setBlock(tx - startX, surfY, tz - startZ, BLOCK_TYPES.DIRT);
            }

            const topY = surfY + trunkHeight + 1;
            const placeSpruceLeafWithSnow = (wx: number, wy: number, wz: number) => {
              if (
                wx >= startX &&
                wx < startX + CHUNK_SIZE &&
                wz >= startZ &&
                wz < startZ + CHUNK_SIZE &&
                wy >= 0 &&
                wy < WORLD_HEIGHT
              ) {
                const lx = wx - startX;
                const lz = wz - startZ;
                if (chunk.getBlock(lx, wy, lz) === BLOCK_TYPES.AIR) {
                  chunk.setBlock(lx, wy, lz, BLOCK_TYPES.SPRUCE_LEAVES);
                  if (wy + 1 < WORLD_HEIGHT && chunk.getBlock(lx, wy + 1, lz) === BLOCK_TYPES.AIR) {
                    chunk.setBlock(lx, wy + 1, lz, BLOCK_TYPES.SNOW);
                  }
                }
              }
            };

            // Top needle apex
            placeSpruceLeafWithSnow(tx, topY, tz);

            // Tier 1 (topY - 1): 3x3 cross (r=1)
            for (let ox = -1; ox <= 1; ox++) {
              for (let oz = -1; oz <= 1; oz++) {
                if (Math.abs(ox) === 1 && Math.abs(oz) === 1) continue;
                placeSpruceLeafWithSnow(tx + ox, topY - 1, tz + oz);
              }
            }

            // Tier 2 (topY - 2): 3x3 full square
            for (let ox = -1; ox <= 1; ox++) {
              for (let oz = -1; oz <= 1; oz++) {
                placeSpruceLeafWithSnow(tx + ox, topY - 2, tz + oz);
              }
            }

            // Tier 3 (topY - 3): 3x3 cross
            for (let ox = -1; ox <= 1; ox++) {
              for (let oz = -1; oz <= 1; oz++) {
                if (Math.abs(ox) === 1 && Math.abs(oz) === 1) continue;
                placeSpruceLeafWithSnow(tx + ox, topY - 3, tz + oz);
              }
            }

            // Tier 4 (topY - 4): 5x5 cross (r=2)
            for (let ox = -2; ox <= 2; ox++) {
              for (let oz = -2; oz <= 2; oz++) {
                if (Math.abs(ox) === 2 && Math.abs(oz) === 2) continue;
                placeSpruceLeafWithSnow(tx + ox, topY - 4, tz + oz);
              }
            }

            // Tier 5 (topY - 5): 3x3 cross (Lowest leaves level >= surfY + 4, leaving clean 3-4 blocks of walking space)
            for (let ox = -1; ox <= 1; ox++) {
              for (let oz = -1; oz <= 1; oz++) {
                if (Math.abs(ox) === 1 && Math.abs(oz) === 1) continue;
                placeSpruceLeafWithSnow(tx + ox, topY - 5, tz + oz);
              }
            }
          }

          // Sweet Berry Bushes in the Snow Biome
          if (
            Math.abs(tx + 3) % 11 === 0 &&
            Math.abs(tz + 5) % 11 === 0 &&
            this.pseudoNoise(tx, tz, 819) > 0.42
          ) {
            if (tx >= startX && tx < startX + CHUNK_SIZE && tz >= startZ && tz < startZ + CHUNK_SIZE) {
              const lx = tx - startX;
              const lz = tz - startZ;
              if (surfY + 1 < WORLD_HEIGHT && chunk.getBlock(lx, surfY + 1, lz) === BLOCK_TYPES.AIR) {
                chunk.setBlock(lx, surfY + 1, lz, BLOCK_TYPES.SWEET_BERRY_BUSH);
              }
            }
          }

          // Igloo structure in snow biome
          if (Math.abs(tx) % 20 === 0 && Math.abs(tz) % 20 === 0 && this.pseudoNoise(tx, tz, 903) > 0.65) {
            // Build a cozy round snow igloo
            for (let dx = -2; dx <= 2; dx++) {
              for (let dz = -2; dz <= 2; dz++) {
                const wx = tx + dx;
                const wz = tz + dz;
                if (wx >= startX && wx < startX + CHUNK_SIZE && wz >= startZ && wz < startZ + CHUNK_SIZE) {
                  const lx = wx - startX;
                  const lz = wz - startZ;
                  // Spruce wood floor
                  chunk.setBlock(lx, surfY, lz, BLOCK_TYPES.WOOD_PLANKS);
                  // Dome walls
                  const isEdge = Math.abs(dx) === 2 || Math.abs(dz) === 2;
                  if (isEdge) {
                    chunk.setBlock(lx, surfY + 1, lz, BLOCK_TYPES.SNOW);
                    chunk.setBlock(lx, surfY + 2, lz, BLOCK_TYPES.SNOW);
                  } else {
                    chunk.setBlock(lx, surfY + 1, lz, BLOCK_TYPES.AIR);
                    chunk.setBlock(lx, surfY + 2, lz, BLOCK_TYPES.AIR);
                    chunk.setBlock(lx, surfY + 3, lz, BLOCK_TYPES.SNOW); // Roof
                  }
                }
              }
            }
            // Add interior amenities: Furnace, Crafting Table, Torch
            const placeBlock = (wx: number, wy: number, wz: number, bId: number) => {
              if (wx >= startX && wx < startX + CHUNK_SIZE && wz >= startZ && wz < startZ + CHUNK_SIZE) {
                chunk.setBlock(wx - startX, wy, wz - startZ, bId);
              }
            };
            placeBlock(tx - 1, surfY + 1, tz - 1, BLOCK_TYPES.FURNACE);
            placeBlock(tx + 1, surfY + 1, tz - 1, BLOCK_TYPES.CRAFTING_TABLE);
            placeBlock(tx, surfY + 2, tz - 1, BLOCK_TYPES.TORCH);
            this.addTorch(tx, surfY + 2, tz - 1);
            // Doorway opening at south face
            placeBlock(tx, surfY + 1, tz + 2, BLOCK_TYPES.AIR);
            placeBlock(tx, surfY + 2, tz + 2, BLOCK_TYPES.AIR);
          }
          continue;
        }

        // D2. Forest, Cherry & Plains Trees
        if (Math.abs(tx) % 3 === 0 && Math.abs(tz) % 3 === 0 && this.pseudoNoise(tx, tz, 42) > 0.7) {
          const isCherry = b.type === 'cherry';
          const isBirch = !isCherry && this.pseudoNoise(tx, tz, 123) > 0.45;

          const trunkBlock = isBirch ? BLOCK_TYPES.BIRCH_WOOD : BLOCK_TYPES.WOOD;
          const trunkHeight = 4 + Math.floor(this.pseudoNoise(tx, tz, 99) * 2);

          for (let y = 1; y <= trunkHeight; y++) {
            const wx = tx;
            const wy = surfY + y;
            const wz = tz;
            if (wx >= startX && wx < startX + CHUNK_SIZE && wz >= startZ && wz < startZ + CHUNK_SIZE) {
              chunk.setBlock(wx - startX, wy, wz - startZ, trunkBlock);
            }
          }

          if (tx >= startX && tx < startX + CHUNK_SIZE && tz >= startZ && tz < startZ + CHUNK_SIZE) {
            chunk.setBlock(tx - startX, surfY, tz - startZ, BLOCK_TYPES.DIRT);
          }

          const leafType = isCherry ? BLOCK_TYPES.CHERRY_LEAVES : BLOCK_TYPES.LEAVES;
          const leafStart = surfY + trunkHeight - 1;
          const leafEnd = surfY + trunkHeight + 2;

          for (let ly = leafStart; ly <= leafEnd; ly++) {
            const radius = ly >= surfY + trunkHeight + 1 ? 1 : 2;

            for (let ox = -radius; ox <= radius; ox++) {
              for (let oz = -radius; oz <= radius; oz++) {
                if (ox === 0 && oz === 0 && ly <= surfY + trunkHeight) continue;
                if (Math.abs(ox) === radius && Math.abs(oz) === radius && this.pseudoNoise(tx + ox, tz + oz, ly) > 0.4) {
                  continue;
                }
                const wx = tx + ox;
                const wz = tz + oz;
                if (wx >= startX && wx < startX + CHUNK_SIZE && wz >= startZ && wz < startZ + CHUNK_SIZE) {
                  const lx = wx - startX;
                  const lz = wz - startZ;
                  if (chunk.getBlock(lx, ly, lz) === BLOCK_TYPES.AIR) {
                    chunk.setBlock(lx, ly, lz, leafType);
                  }
                }
              }
            }
          }
        }
      }
    }

    chunk.isDirty = true;
  }

  private getFaceMaterialIndex(blockId: number, normY: number, normZ: number = 0): number {
    const mi = this.atlas.matIndices;
    switch (blockId) {
      case BLOCK_TYPES.GRASS:
        return normY > 0 ? mi.grassTop : normY < 0 ? mi.dirt : mi.grassSide;
      case BLOCK_TYPES.DIRT:
        return mi.dirt;
      case BLOCK_TYPES.STONE:
        return mi.stone;
      case BLOCK_TYPES.WOOD:
        return Math.abs(normY) > 0 ? mi.woodTop : mi.woodSide;
      case BLOCK_TYPES.LEAVES:
        return mi.leaves;
      case BLOCK_TYPES.BRICK:
        return mi.brick;
      case BLOCK_TYPES.BEDROCK:
        return mi.bedrock;
      case BLOCK_TYPES.WATER:
        return mi.water;
      case BLOCK_TYPES.SAND:
        return mi.sand;
      case BLOCK_TYPES.CORAL_PINK:
        return mi.coralPink;
      case BLOCK_TYPES.CORAL_CYAN:
        return mi.coralCyan;
      case BLOCK_TYPES.CORAL_YELLOW:
        return mi.coralYellow;
      case BLOCK_TYPES.WOOD_PLANKS:
        return mi.woodPlanks;
      case BLOCK_TYPES.GLASS:
        return mi.glass;
      case BLOCK_TYPES.CRAFTING_TABLE:
        return normY > 0 ? mi.craftingTableTop : normY < 0 ? mi.woodPlanks : mi.craftingTableSide;
      case BLOCK_TYPES.COAL_ORE:
        return mi.coalOre;
      case BLOCK_TYPES.IRON_ORE:
        return mi.ironOre;
      case BLOCK_TYPES.GOLD_ORE:
        return mi.goldOre;
      case BLOCK_TYPES.DIAMOND_ORE:
        return mi.diamondOre;
      case BLOCK_TYPES.BIRCH_WOOD:
        return Math.abs(normY) > 0 ? mi.woodTop : mi.birchWood;
      case BLOCK_TYPES.RED_FLOWER:
        return mi.redFlower;
      case BLOCK_TYPES.YELLOW_FLOWER:
        return mi.yellowFlower;
      case BLOCK_TYPES.SEAWEED:
        return mi.seaweed;
      case BLOCK_TYPES.TORCH:
        return mi.torch;
      case BLOCK_TYPES.SNOW:
        return mi.snow;
      case BLOCK_TYPES.ICE:
        return mi.ice;
      case BLOCK_TYPES.CACTUS:
        return mi.cactus;
      case BLOCK_TYPES.CHERRY_LEAVES:
        return mi.cherryLeaves;
      case BLOCK_TYPES.RED_SAND:
        return mi.redSand;
      case BLOCK_TYPES.TERRACOTTA:
        return mi.terracotta;
      case BLOCK_TYPES.RED_TERRACOTTA:
        return mi.redTerracotta;
      case BLOCK_TYPES.ORANGE_TERRACOTTA:
        return mi.orangeTerracotta;
      case BLOCK_TYPES.YELLOW_TERRACOTTA:
        return mi.yellowTerracotta;
      case BLOCK_TYPES.WHITE_TERRACOTTA:
        return mi.whiteTerracotta;
      case BLOCK_TYPES.BROWN_TERRACOTTA:
        return mi.brownTerracotta;
      case BLOCK_TYPES.DARK_OAK_WOOD:
        return Math.abs(normY) > 0 ? mi.woodTop : mi.darkOakWood;
      case BLOCK_TYPES.DARK_OAK_LEAVES:
        return mi.darkOakLeaves;
      case BLOCK_TYPES.RED_MUSHROOM_BLOCK:
        return mi.redMushroomBlock;
      case BLOCK_TYPES.BROWN_MUSHROOM_BLOCK:
        return mi.brownMushroomBlock;
      case BLOCK_TYPES.MUSHROOM_STEM:
        return mi.mushroomStem;
      case BLOCK_TYPES.JUNGLE_WOOD:
        return Math.abs(normY) > 0 ? mi.woodTop : mi.jungleWood;
      case BLOCK_TYPES.JUNGLE_LEAVES:
        return mi.jungleLeaves;
      case BLOCK_TYPES.MELON:
        return mi.melon;
      case BLOCK_TYPES.PUMPKIN:
        return mi.pumpkin;
      case BLOCK_TYPES.LILY_PAD:
        return mi.lilyPad;
      case BLOCK_TYPES.MUD:
        return mi.mud;
      case BLOCK_TYPES.MOSS:
        return mi.moss;
      case BLOCK_TYPES.AMETHYST:
        return mi.amethyst;
      case BLOCK_TYPES.MAGMA:
        return mi.magma;
      case BLOCK_TYPES.GLOWSTONE:
        return mi.glowstone;
      case BLOCK_TYPES.OBSIDIAN:
        return mi.obsidian;
      case BLOCK_TYPES.DEEPSLATE:
        return mi.deepslate;
      case BLOCK_TYPES.FURNACE:
        return normY > 0 ? mi.furnaceTop : normY < 0 ? mi.stone : normZ > 0 ? mi.furnaceFront : mi.furnaceSide;
      case BLOCK_TYPES.FURNACE_LIT:
        return normY > 0 ? mi.furnaceTop : normY < 0 ? mi.stone : normZ > 0 ? mi.furnaceFrontLit : mi.furnaceSide;
      case BLOCK_TYPES.SPRUCE_WOOD:
        return Math.abs(normY) > 0 ? mi.woodTop : mi.spruceWood;
      case BLOCK_TYPES.SPRUCE_LEAVES:
        return mi.spruceLeaves;
      case BLOCK_TYPES.NETHERRACK:
        return mi.netherrack;
      case BLOCK_TYPES.SOUL_SAND:
        return mi.soulSand;
      case BLOCK_TYPES.NETHER_BRICKS:
        return mi.netherBricks;
      case BLOCK_TYPES.NETHER_PORTAL:
        return mi.netherPortal;
      case BLOCK_TYPES.SWEET_BERRY_BUSH:
        return mi.sweetBerryBush;
      default:
        return mi.dirt;
    }
  }

  buildChunkMesh(chunk: Chunk) {
    if (chunk.mesh) {
      this.scene.remove(chunk.mesh);
      chunk.mesh.geometry.dispose();
      chunk.mesh = null;
    }

    const positionsByMat: Record<number, number[]> = {};
    const normalsByMat: Record<number, number[]> = {};
    const uvsByMat: Record<number, number[]> = {};

    for (let i = 0; i < this.atlas.materials.length; i++) {
      positionsByMat[i] = [];
      normalsByMat[i] = [];
      uvsByMat[i] = [];
    }

    for (let lx = 0; lx < CHUNK_SIZE; lx++) {
      for (let y = 0; y < WORLD_HEIGHT; y++) {
        for (let lz = 0; lz < CHUNK_SIZE; lz++) {
          const block = chunk.getBlock(lx, y, lz);
          if (block === BLOCK_TYPES.AIR) continue;

          const wx = chunk.startX + lx;
          const wz = chunk.startZ + lz;
          const isWaterBlock = block === BLOCK_TYPES.WATER;

          for (let f = 0; f < FACES.length; f++) {
            const face = FACES[f];
            const nx = wx + face.dir[0];
            const ny = y + face.dir[1];
            const nz = wz + face.dir[2];
            const neighbor = this.getBlock(nx, ny, nz);

            let renderFace = false;

            if (isWaterBlock) {
              if (
                neighbor === BLOCK_TYPES.AIR ||
                neighbor === BLOCK_TYPES.RED_FLOWER ||
                neighbor === BLOCK_TYPES.YELLOW_FLOWER ||
                neighbor === BLOCK_TYPES.TORCH ||
                neighbor === BLOCK_TYPES.LILY_PAD
              ) {
                renderFace = true;
              }
            } else {
              if (
                neighbor === BLOCK_TYPES.AIR ||
                neighbor === BLOCK_TYPES.WATER ||
                neighbor === BLOCK_TYPES.RED_FLOWER ||
                neighbor === BLOCK_TYPES.YELLOW_FLOWER ||
                neighbor === BLOCK_TYPES.SEAWEED ||
                neighbor === BLOCK_TYPES.TORCH ||
                neighbor === BLOCK_TYPES.LILY_PAD ||
                (neighbor === BLOCK_TYPES.LEAVES && block !== BLOCK_TYPES.LEAVES) ||
                (neighbor === BLOCK_TYPES.DARK_OAK_LEAVES && block !== BLOCK_TYPES.DARK_OAK_LEAVES) ||
                (neighbor === BLOCK_TYPES.JUNGLE_LEAVES && block !== BLOCK_TYPES.JUNGLE_LEAVES) ||
                (neighbor === BLOCK_TYPES.CHERRY_LEAVES && block !== BLOCK_TYPES.CHERRY_LEAVES) ||
                (neighbor === BLOCK_TYPES.SPRUCE_LEAVES && block !== BLOCK_TYPES.SPRUCE_LEAVES) ||
                (neighbor === BLOCK_TYPES.NETHER_PORTAL && block !== BLOCK_TYPES.NETHER_PORTAL) ||
                (neighbor === BLOCK_TYPES.SWEET_BERRY_BUSH && block !== BLOCK_TYPES.SWEET_BERRY_BUSH) ||
                (neighbor === BLOCK_TYPES.GLASS && block !== BLOCK_TYPES.GLASS) ||
                (neighbor === BLOCK_TYPES.ICE && block !== BLOCK_TYPES.ICE)
              ) {
                renderFace = true;
              }
            }

            if (renderFace) {
              const matIndex = this.getFaceMaterialIndex(block, face.norm[1], face.norm[2]);

              for (let v = 0; v < face.verts.length; v++) {
                const vert = face.verts[v];
                positionsByMat[matIndex].push(wx + vert[0], y + vert[1], wz + vert[2]);
                normalsByMat[matIndex].push(face.norm[0], face.norm[1], face.norm[2]);
              }

              for (let u = 0; u < face.uvs.length; u++) {
                uvsByMat[matIndex].push(face.uvs[u]);
              }
            }
          }
        }
      }
    }

    const combinedPositions: number[] = [];
    const combinedNormals: number[] = [];
    const combinedUvs: number[] = [];
    const groups: { start: number; count: number; matIndex: number }[] = [];

    let vertexOffset = 0;
    for (let m = 0; m < this.atlas.materials.length; m++) {
      const count = positionsByMat[m].length / 3;
      if (count > 0) {
        groups.push({ start: vertexOffset, count, matIndex: m });
        vertexOffset += count;

        for (let j = 0; j < positionsByMat[m].length; j++) {
          combinedPositions.push(positionsByMat[m][j]);
          combinedNormals.push(normalsByMat[m][j]);
        }
        for (let j = 0; j < uvsByMat[m].length; j++) {
          combinedUvs.push(uvsByMat[m][j]);
        }
      }
    }

    if (combinedPositions.length === 0) {
      chunk.isDirty = false;
      return;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(combinedPositions, 3));
    geometry.setAttribute('normal', new THREE.Float32BufferAttribute(combinedNormals, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(combinedUvs, 2));

    for (const g of groups) {
      geometry.addGroup(g.start, g.count, g.matIndex);
    }

    const mesh = new THREE.Mesh(geometry, this.atlas.materials);
    this.scene.add(mesh);
    chunk.mesh = mesh;
    chunk.isDirty = false;
  }

  rebuildDirtyChunks() {
    this.chunks.forEach((chunk) => {
      if (chunk.isDirty) {
        this.buildChunkMesh(chunk);
      }
    });
    this.updateChunkMeshesList();
  }

  private updateChunkMeshesList() {
    this.chunkMeshes = [];
    this.chunks.forEach((chunk) => {
      if (chunk.mesh) {
        this.chunkMeshes.push(chunk.mesh);
      }
    });
  }

  update(playerX: number, playerZ: number, forceAll: boolean = false) {
    const playerCx = Math.floor(playerX / CHUNK_SIZE);
    const playerCz = Math.floor(playerZ / CHUNK_SIZE);

    const chunkMoved = playerCx !== this.lastPlayerCx || playerCz !== this.lastPlayerCz;
    if (chunkMoved) {
      this.lastPlayerCx = playerCx;
      this.lastPlayerCz = playerCz;
    }

    if (chunkMoved || forceAll) {
      const loadDist = RENDER_RADIUS + 1;
      for (let cx = playerCx - loadDist; cx <= playerCx + loadDist; cx++) {
        for (let cz = playerCz - loadDist; cz <= playerCz + loadDist; cz++) {
          this.getOrCreateChunk(cx, cz);
        }
      }
    }

    let meshedCount = 0;
    const maxMeshPerFrame = forceAll ? 999 : 2;

    const candidates: Chunk[] = [];
    for (let cx = playerCx - RENDER_RADIUS; cx <= playerCx + RENDER_RADIUS; cx++) {
      for (let cz = playerCz - RENDER_RADIUS; cz <= playerCz + RENDER_RADIUS; cz++) {
        const chunk = this.getChunk(cx, cz);
        if (chunk && chunk.isDirty) {
          candidates.push(chunk);
        }
      }
    }

    if (candidates.length > 0) {
      candidates.sort((a, b) => {
        const da = Math.hypot(a.cx - playerCx, a.cz - playerCz);
        const db = Math.hypot(b.cx - playerCx, b.cz - playerCz);
        return da - db;
      });

      for (const chunk of candidates) {
        this.buildChunkMesh(chunk);
        meshedCount++;
        if (meshedCount >= maxMeshPerFrame) break;
      }
    }

    if (chunkMoved || forceAll) {
      const toRemove: string[] = [];
      this.chunks.forEach((chunk, key) => {
        const dist = Math.max(Math.abs(chunk.cx - playerCx), Math.abs(chunk.cz - playerCz));
        if (dist > UNLOAD_RADIUS) {
          if (chunk.mesh) {
            this.scene.remove(chunk.mesh);
            chunk.mesh.geometry.dispose();
            chunk.mesh = null;
          }
          toRemove.push(key);
        }
      });
      for (const key of toRemove) {
        this.chunks.delete(key);
      }
    }

    if (meshedCount > 0 || chunkMoved || forceAll) {
      this.updateChunkMeshesList();
    }
  }
}
