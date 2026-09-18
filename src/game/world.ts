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

export class VoxelWorld {
  chunks: Map<string, Chunk> = new Map();
  scene: THREE.Scene;
  atlas: BlockTextureAtlas;
  chunkMeshes: THREE.Mesh[] = [];

  lastPlayerCx: number = 999999;
  lastPlayerCz: number = 999999;

  constructor(scene: THREE.Scene, atlas: BlockTextureAtlas) {
    this.scene = scene;
    this.atlas = atlas;
    // Initial spawn chunks around (0, 0)
    this.update(0, 0, true);
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
    return this.chunks.get(this.chunkKey(cx, cz));
  }

  getBlock(wx: number, wy: number, wz: number): number {
    if (wy < 0 || wy >= WORLD_HEIGHT) return BLOCK_TYPES.AIR;
    const cx = Math.floor(wx / CHUNK_SIZE);
    const cz = Math.floor(wz / CHUNK_SIZE);
    const chunk = this.getChunk(cx, cz);
    if (chunk) {
      const lx = ((wx % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
      const lz = ((wz % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
      return chunk.getBlock(lx, wy, lz);
    }
    // Safe procedural fallback without mutating chunks
    if (wy === 0) return BLOCK_TYPES.BEDROCK;
    const surfH = this.getTerrainHeight(wx, wz);
    if (wy <= surfH) {
      return surfH < SEA_LEVEL ? BLOCK_TYPES.SAND : BLOCK_TYPES.STONE;
    }
    if (wy <= SEA_LEVEL) return BLOCK_TYPES.WATER;
    return BLOCK_TYPES.AIR;
  }

  setBlock(wx: number, wy: number, wz: number, id: number): boolean {
    if (wy < 0 || wy >= WORLD_HEIGHT) return false;
    const cx = Math.floor(wx / CHUNK_SIZE);
    const cz = Math.floor(wz / CHUNK_SIZE);
    const chunk = this.getOrCreateChunk(cx, cz);

    const lx = ((wx % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
    const lz = ((wz % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
    chunk.setBlock(lx, wy, lz, id);

    // Build the modified chunk mesh immediately
    this.buildChunkMesh(chunk);

    // If near chunk boundary, remesh neighbor chunk
    if (lx === 0) {
      const neighbor = this.getChunk(cx - 1, cz);
      if (neighbor) this.buildChunkMesh(neighbor);
    } else if (lx === CHUNK_SIZE - 1) {
      const neighbor = this.getChunk(cx + 1, cz);
      if (neighbor) this.buildChunkMesh(neighbor);
    }
    if (lz === 0) {
      const neighbor = this.getChunk(cx, cz - 1);
      if (neighbor) this.buildChunkMesh(neighbor);
    } else if (lz === CHUNK_SIZE - 1) {
      const neighbor = this.getChunk(cx, cz + 1);
      if (neighbor) this.buildChunkMesh(neighbor);
    }

    this.updateChunkMeshesList();
    return true;
  }

  updateChunkMeshesList() {
    this.chunkMeshes = [];
    this.chunks.forEach((chunk) => {
      if (chunk.mesh) {
        this.chunkMeshes.push(chunk.mesh);
      }
    });
  }

  isSolid(wx: number, wy: number, wz: number): boolean {
    const b = this.getBlock(wx, wy, wz);
    return (
      b !== BLOCK_TYPES.AIR &&
      b !== BLOCK_TYPES.WATER &&
      b !== BLOCK_TYPES.RED_FLOWER &&
      b !== BLOCK_TYPES.YELLOW_FLOWER &&
      b !== BLOCK_TYPES.SEAWEED &&
      b !== BLOCK_TYPES.TORCH
    );
  }

  isWater(wx: number, wy: number, wz: number): boolean {
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

  private pseudoNoise(x: number, y: number, seed: number = 777): number {
    const n = Math.sin(x * 12.9898 + y * 78.233 + seed * 43.123) * 43758.5453;
    return n - Math.floor(n);
  }

  getTerrainHeight(wx: number, wz: number): number {
    // Multi-octave continuous noise generating diverse infinite biomes:
    // 1. Continental macro layer (oceans vs continents)
    const continental = Math.sin(wx * 0.012) * Math.cos(wz * 0.014) * 6.5;

    // 2. Rolling hills and valleys
    const hills = Math.sin(wx * 0.045 + 1.2) * Math.cos(wz * 0.05) * 4.5 + Math.cos((wx + wz) * 0.032) * 3.0;

    // 3. High-frequency surface ridge detail
    const detail = Math.sin(wx * 0.12 - wz * 0.1) * 1.6;

    const raw = 14.5 + continental + hills + detail;
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

    // 1. Base terrain columns (Bedrock, Stone, Caves, Sand, Dirt, Grass, Water)
    for (let lx = 0; lx < CHUNK_SIZE; lx++) {
      for (let lz = 0; lz < CHUNK_SIZE; lz++) {
        const wx = startX + lx;
        const wz = startZ + lz;
        const surfHeight = this.getTerrainHeight(wx, wz);

        // Bedrock floor
        chunk.setBlock(lx, 0, lz, BLOCK_TYPES.BEDROCK);

        const isUnderwater = surfHeight < SEA_LEVEL;

        for (let wy = 1; wy <= Math.max(surfHeight, SEA_LEVEL); wy++) {
          if (wy > surfHeight) {
            // Above ground but below or at sea level -> WATER
            if (wy <= SEA_LEVEL) {
              chunk.setBlock(lx, wy, lz, BLOCK_TYPES.WATER);
            }
            continue;
          }

          // 3D Subterranean Caves
          if (this.isCave(wx, wy, wz, surfHeight)) {
            if (isUnderwater && wy > surfHeight - 3) {
              chunk.setBlock(lx, wy, lz, BLOCK_TYPES.WATER);
            } else {
              chunk.setBlock(lx, wy, lz, BLOCK_TYPES.AIR);
            }
            continue;
          }

          // Stratified layers
          let stoneType = BLOCK_TYPES.STONE;
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

          if (isUnderwater) {
            // Ocean seabed: Sand on top 2 layers, stone/ores deeper
            if (wy >= surfHeight - 2) {
              chunk.setBlock(lx, wy, lz, BLOCK_TYPES.SAND);
            } else {
              chunk.setBlock(lx, wy, lz, stoneType);
            }
          } else {
            // Land biomes: Grass surface, Dirt beneath, Stone/Ores underneath
            if (wy === surfHeight) {
              if (surfHeight <= SEA_LEVEL + 1) {
                chunk.setBlock(lx, wy, lz, BLOCK_TYPES.SAND); // Beach
              } else {
                chunk.setBlock(lx, wy, lz, BLOCK_TYPES.GRASS);
                // Flowers on top of lush grass
                const flowerNoise = this.pseudoNoise(wx, wz, 555);
                if (flowerNoise > 0.935) {
                  chunk.setBlock(lx, wy + 1, lz, BLOCK_TYPES.RED_FLOWER);
                } else if (flowerNoise > 0.875) {
                  chunk.setBlock(lx, wy + 1, lz, BLOCK_TYPES.YELLOW_FLOWER);
                }
              }
            } else if (wy >= surfHeight - 3) {
              chunk.setBlock(lx, wy, lz, BLOCK_TYPES.DIRT);
            } else {
              chunk.setBlock(lx, wy, lz, stoneType);
            }
          }
        }

        // 2. Coral Reefs in shallow ocean waters
        if (isUnderwater && surfHeight >= 7 && surfHeight < SEA_LEVEL - 1) {
          const noise = this.pseudoNoise(wx, wz, 999);
          if (noise > 0.82) {
            const coralType =
              noise > 0.94
                ? BLOCK_TYPES.CORAL_PINK
                : noise > 0.88
                ? BLOCK_TYPES.CORAL_CYAN
                : BLOCK_TYPES.CORAL_YELLOW;

            const coralHeight = Math.min(2 + Math.floor((noise - 0.82) * 15), SEA_LEVEL - surfHeight);
            for (let cy = 1; cy <= coralHeight; cy++) {
              chunk.setBlock(lx, surfHeight + cy, lz, coralType);
            }
          }
        }

        // 3. Underwater Seaweed/Kelp stalks
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

    // 4. Procedural Oak & Birch Trees
    // Check tree trunks within and slightly beyond chunk borders [-2 .. CHUNK_SIZE+1]
    // so canopy overhang is 100% seamless and deterministic
    for (let tx = startX - 2; tx <= startX + CHUNK_SIZE + 1; tx++) {
      for (let tz = startZ - 2; tz <= startZ + CHUNK_SIZE + 1; tz++) {
        // Tree spacing check: grid of 3 with pseudoNoise
        if (Math.abs(tx) % 3 === 0 && Math.abs(tz) % 3 === 0) {
          if (this.pseudoNoise(tx, tz, 42) > 0.72) {
            const surfY = this.getTerrainHeight(tx, tz);
            if (surfY > SEA_LEVEL + 1 && surfY < WORLD_HEIGHT - 9) {
              const isBirch = this.pseudoNoise(tx, tz, 123) > 0.45;
              const trunkBlock = isBirch ? BLOCK_TYPES.BIRCH_WOOD : BLOCK_TYPES.WOOD;
              const trunkHeight = 4 + Math.floor(this.pseudoNoise(tx, tz, 99) * 2);

              // Place trunk if inside current chunk
              for (let y = 1; y <= trunkHeight; y++) {
                const wx = tx;
                const wy = surfY + y;
                const wz = tz;
                if (wx >= startX && wx < startX + CHUNK_SIZE && wz >= startZ && wz < startZ + CHUNK_SIZE) {
                  chunk.setBlock(wx - startX, wy, wz - startZ, trunkBlock);
                }
              }

              // Soil under trunk
              if (tx >= startX && tx < startX + CHUNK_SIZE && tz >= startZ && tz < startZ + CHUNK_SIZE) {
                chunk.setBlock(tx - startX, surfY, tz - startZ, BLOCK_TYPES.DIRT);
              }

              // Foliage canopy
              const leafStart = surfY + trunkHeight - 1;
              const leafEnd = surfY + trunkHeight + 2;

              for (let ly = leafStart; ly <= leafEnd; ly++) {
                const radius = ly >= surfY + trunkHeight + 1 ? 1 : 2;
                for (let ox = -radius; ox <= radius; ox++) {
                  for (let oz = -radius; oz <= radius; oz++) {
                    if (ox === 0 && oz === 0 && ly <= surfY + trunkHeight) continue;
                    if (
                      Math.abs(ox) === radius &&
                      Math.abs(oz) === radius &&
                      this.pseudoNoise(tx + ox, tz + oz, ly) > 0.4
                    ) {
                      continue;
                    }
                    const wx = tx + ox;
                    const wz = tz + oz;
                    if (wx >= startX && wx < startX + CHUNK_SIZE && wz >= startZ && wz < startZ + CHUNK_SIZE) {
                      const lx = wx - startX;
                      const lz = wz - startZ;
                      if (chunk.getBlock(lx, ly, lz) === BLOCK_TYPES.AIR) {
                        chunk.setBlock(lx, ly, lz, BLOCK_TYPES.LEAVES);
                      }
                    }
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

  private getFaceMaterialIndex(blockId: number, normY: number): number {
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
              // Water block renders face if adjacent block is AIR, Flower, or Torch
              if (
                neighbor === BLOCK_TYPES.AIR ||
                neighbor === BLOCK_TYPES.RED_FLOWER ||
                neighbor === BLOCK_TYPES.YELLOW_FLOWER ||
                neighbor === BLOCK_TYPES.TORCH
              ) {
                renderFace = true;
              }
            } else {
              // Solid or transparent block
              if (
                neighbor === BLOCK_TYPES.AIR ||
                neighbor === BLOCK_TYPES.WATER ||
                neighbor === BLOCK_TYPES.RED_FLOWER ||
                neighbor === BLOCK_TYPES.YELLOW_FLOWER ||
                neighbor === BLOCK_TYPES.SEAWEED ||
                neighbor === BLOCK_TYPES.TORCH ||
                (neighbor === BLOCK_TYPES.LEAVES && block !== BLOCK_TYPES.LEAVES) ||
                (neighbor === BLOCK_TYPES.GLASS && block !== BLOCK_TYPES.GLASS)
              ) {
                renderFace = true;
              }
            }

            if (renderFace) {
              const matIndex = this.getFaceMaterialIndex(block, face.norm[1]);

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

  // Infinite procedural chunk streaming around player
  update(playerX: number, playerZ: number, forceAll: boolean = false) {
    const playerCx = Math.floor(playerX / CHUNK_SIZE);
    const playerCz = Math.floor(playerZ / CHUNK_SIZE);

    const chunkMoved = playerCx !== this.lastPlayerCx || playerCz !== this.lastPlayerCz;
    if (chunkMoved) {
      this.lastPlayerCx = playerCx;
      this.lastPlayerCz = playerCz;
    }

    // 1. Ensure all chunks within RENDER_RADIUS + 1 are generated so block queries along boundaries succeed
    const loadDist = RENDER_RADIUS + 1;
    for (let cx = playerCx - loadDist; cx <= playerCx + loadDist; cx++) {
      for (let cz = playerCz - loadDist; cz <= playerCz + loadDist; cz++) {
        this.getOrCreateChunk(cx, cz);
      }
    }

    // 2. Mesh dirty chunks in render radius
    let meshedCount = 0;
    const maxMeshPerFrame = forceAll ? 999 : 3;

    // Sort candidate chunks from nearest to farthest from player
    const candidates: Chunk[] = [];
    for (let cx = playerCx - RENDER_RADIUS; cx <= playerCx + RENDER_RADIUS; cx++) {
      for (let cz = playerCz - RENDER_RADIUS; cz <= playerCz + RENDER_RADIUS; cz++) {
        const chunk = this.getChunk(cx, cz);
        if (chunk && chunk.isDirty) {
          candidates.push(chunk);
        }
      }
    }

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

    // 3. Unload chunks beyond UNLOAD_RADIUS to keep memory lean
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

    // 4. Keep chunkMeshes list refreshed for raycaster
    if (meshedCount > 0 || chunkMoved || forceAll) {
      this.chunkMeshes = [];
      this.chunks.forEach((chunk) => {
        if (chunk.mesh) {
          this.chunkMeshes.push(chunk.mesh);
        }
      });
    }
  }
}
