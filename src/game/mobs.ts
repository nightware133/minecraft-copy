import * as THREE from 'three';
import { VoxelWorld, BLOCK_TYPES } from './world';
import { ITEM_TYPES, InventorySystem } from './inventory';
import { sounds } from './audio';

export type MobType = 'sheep' | 'zombie' | 'cow' | 'pig' | 'chicken' | 'polar_bear' | 'creeper';

export type GameDifficulty = 'peaceful' | 'easy' | 'normal' | 'hard';
export type GameMode = 'survival' | 'creative';

// Pixel texture helper
function createPixelTexture(
  width: number,
  height: number,
  draw: (ctx: CanvasRenderingContext2D) => void
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;
  draw(ctx);

  const texture = new THREE.CanvasTexture(canvas);
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  texture.generateMipmaps = false;
  return texture;
}

// Cached textures for mobs
let sheepHeadTex: THREE.CanvasTexture | null = null;
let sheepWoolTex: THREE.CanvasTexture | null = null;
let sheepLegTex: THREE.CanvasTexture | null = null;

let zombieHeadTex: THREE.CanvasTexture | null = null;
let zombieSkinTex: THREE.CanvasTexture | null = null;
let zombieShirtTex: THREE.CanvasTexture | null = null;
let zombiePantsTex: THREE.CanvasTexture | null = null;

let cowHeadTex: THREE.CanvasTexture | null = null;
let cowBodyTex: THREE.CanvasTexture | null = null;
let cowLegTex: THREE.CanvasTexture | null = null;

let pigHeadTex: THREE.CanvasTexture | null = null;
let pigBodyTex: THREE.CanvasTexture | null = null;
let pigLegTex: THREE.CanvasTexture | null = null;

let chickenHeadTex: THREE.CanvasTexture | null = null;
let chickenBodyTex: THREE.CanvasTexture | null = null;
let chickenWingTex: THREE.CanvasTexture | null = null;
let chickenLegTex: THREE.CanvasTexture | null = null;

let polarBearHeadTex: THREE.CanvasTexture | null = null;
let polarBearBodyTex: THREE.CanvasTexture | null = null;
let polarBearLegTex: THREE.CanvasTexture | null = null;

let creeperHeadTex: THREE.CanvasTexture | null = null;
let creeperHeadSideTex: THREE.CanvasTexture | null = null;
let creeperBodyTex: THREE.CanvasTexture | null = null;
let creeperLegTex: THREE.CanvasTexture | null = null;

function getSheepTextures() {
  if (!sheepHeadTex) {
    sheepHeadTex = createPixelTexture(8, 8, (ctx) => {
      ctx.fillStyle = '#e8e5dc'; // Wool top
      ctx.fillRect(0, 0, 8, 2);
      ctx.fillStyle = '#dcd4c5'; // Face base
      ctx.fillRect(0, 2, 8, 6);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 3, 2, 1);
      ctx.fillRect(6, 3, 2, 1);
      ctx.fillStyle = '#1c1b18';
      ctx.fillRect(1, 3, 1, 1);
      ctx.fillRect(6, 3, 1, 1);
      ctx.fillStyle = '#f0b0b8';
      ctx.fillRect(3, 5, 2, 2);
      ctx.fillStyle = '#cf8692';
      ctx.fillRect(3, 6, 2, 1);
    });

    sheepWoolTex = createPixelTexture(8, 8, (ctx) => {
      ctx.fillStyle = '#f2f0e8';
      ctx.fillRect(0, 0, 8, 8);
      ctx.fillStyle = '#dedbd0';
      ctx.fillRect(1, 1, 2, 2);
      ctx.fillRect(5, 2, 2, 2);
      ctx.fillRect(2, 5, 2, 2);
      ctx.fillStyle = '#c7c2b5';
      ctx.fillRect(2, 2, 1, 1);
      ctx.fillRect(6, 3, 1, 1);
      ctx.fillRect(3, 6, 1, 1);
    });

    sheepLegTex = createPixelTexture(4, 4, (ctx) => {
      ctx.fillStyle = '#cfc7b4';
      ctx.fillRect(0, 0, 4, 3);
      ctx.fillStyle = '#6b6354';
      ctx.fillRect(0, 3, 4, 1);
    });
  }
  return { head: sheepHeadTex, wool: sheepWoolTex, leg: sheepLegTex };
}

function getCowTextures() {
  if (!cowHeadTex) {
    cowHeadTex = createPixelTexture(8, 8, (ctx) => {
      ctx.fillStyle = '#5c3a21'; // Brown fur
      ctx.fillRect(0, 0, 8, 8);
      // Horns
      ctx.fillStyle = '#9e9e9e';
      ctx.fillRect(0, 0, 1, 2);
      ctx.fillRect(7, 0, 1, 2);
      // White forehead patch
      ctx.fillStyle = '#f5f5f5';
      ctx.fillRect(3, 1, 2, 3);
      // Eyes
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(1, 3, 2, 1);
      ctx.fillRect(5, 3, 2, 1);
      ctx.fillStyle = '#111111';
      ctx.fillRect(2, 3, 1, 1);
      ctx.fillRect(5, 3, 1, 1);
      // Gray snout muzzle
      ctx.fillStyle = '#757575';
      ctx.fillRect(2, 5, 4, 3);
      ctx.fillStyle = '#424242';
      ctx.fillRect(2, 6, 1, 1);
      ctx.fillRect(5, 6, 1, 1);
    });

    cowBodyTex = createPixelTexture(8, 8, (ctx) => {
      ctx.fillStyle = '#5c3a21';
      ctx.fillRect(0, 0, 8, 8);
      // White cow spots
      ctx.fillStyle = '#f5f5f5';
      ctx.fillRect(1, 1, 3, 2);
      ctx.fillRect(4, 4, 3, 3);
      ctx.fillRect(0, 5, 2, 2);
    });

    cowLegTex = createPixelTexture(4, 4, (ctx) => {
      ctx.fillStyle = '#5c3a21';
      ctx.fillRect(0, 0, 4, 3);
      ctx.fillStyle = '#332114';
      ctx.fillRect(0, 3, 4, 1);
    });
  }
  return { head: cowHeadTex, body: cowBodyTex, leg: cowLegTex };
}

function getPigTextures() {
  if (!pigHeadTex) {
    pigHeadTex = createPixelTexture(8, 8, (ctx) => {
      ctx.fillStyle = '#f48fb1'; // Pink
      ctx.fillRect(0, 0, 8, 8);
      // Eyes
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(1, 3, 2, 1);
      ctx.fillRect(5, 3, 2, 1);
      ctx.fillStyle = '#212121';
      ctx.fillRect(1, 3, 1, 1);
      ctx.fillRect(6, 3, 1, 1);
      // Snout
      ctx.fillStyle = '#ec407a';
      ctx.fillRect(2, 4, 4, 3);
      ctx.fillStyle = '#ad1457';
      ctx.fillRect(3, 5, 1, 1);
      ctx.fillRect(4, 5, 1, 1);
    });

    pigBodyTex = createPixelTexture(8, 8, (ctx) => {
      ctx.fillStyle = '#f48fb1';
      ctx.fillRect(0, 0, 8, 8);
      ctx.fillStyle = '#ec407a';
      ctx.fillRect(2, 2, 2, 2);
      ctx.fillRect(5, 4, 2, 2);
    });

    pigLegTex = createPixelTexture(4, 4, (ctx) => {
      ctx.fillStyle = '#f48fb1';
      ctx.fillRect(0, 0, 4, 3);
      ctx.fillStyle = '#c2185b';
      ctx.fillRect(0, 3, 4, 1);
    });
  }
  return { head: pigHeadTex, body: pigBodyTex, leg: pigLegTex };
}

function getChickenTextures() {
  if (!chickenHeadTex) {
    chickenHeadTex = createPixelTexture(8, 8, (ctx) => {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 8, 8);
      // Eyes
      ctx.fillStyle = '#212121';
      ctx.fillRect(2, 2, 1, 1);
      ctx.fillRect(5, 2, 1, 1);
      // Yellow Beak
      ctx.fillStyle = '#ffb300';
      ctx.fillRect(3, 3, 2, 2);
      // Red Wattle
      ctx.fillStyle = '#d32f2f';
      ctx.fillRect(3, 5, 2, 2);
    });

    chickenBodyTex = createPixelTexture(8, 8, (ctx) => {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 8, 8);
      ctx.fillStyle = '#e0e0e0';
      ctx.fillRect(1, 2, 2, 2);
      ctx.fillRect(5, 4, 2, 2);
    });

    chickenWingTex = createPixelTexture(4, 4, (ctx) => {
      ctx.fillStyle = '#f5f5f5';
      ctx.fillRect(0, 0, 4, 4);
      ctx.fillStyle = '#e0e0e0';
      ctx.fillRect(0, 2, 4, 2);
    });

    chickenLegTex = createPixelTexture(4, 4, (ctx) => {
      ctx.fillStyle = '#ffb300';
      ctx.fillRect(1, 0, 2, 4);
    });
  }
  return { head: chickenHeadTex, body: chickenBodyTex, wing: chickenWingTex, leg: chickenLegTex };
}

function getPolarBearTextures() {
  if (!polarBearHeadTex) {
    polarBearHeadTex = createPixelTexture(8, 8, (ctx) => {
      ctx.fillStyle = '#f5f5f5';
      ctx.fillRect(0, 0, 8, 8);
      // Eyes
      ctx.fillStyle = '#212121';
      ctx.fillRect(1, 3, 1, 1);
      ctx.fillRect(6, 3, 1, 1);
      // Black snout
      ctx.fillStyle = '#e0e0e0';
      ctx.fillRect(2, 4, 4, 3);
      ctx.fillStyle = '#212121';
      ctx.fillRect(3, 4, 2, 2);
      // Ears
      ctx.fillStyle = '#e0e0e0';
      ctx.fillRect(0, 0, 2, 1);
      ctx.fillRect(6, 0, 2, 1);
    });

    polarBearBodyTex = createPixelTexture(8, 8, (ctx) => {
      ctx.fillStyle = '#f5f5f5';
      ctx.fillRect(0, 0, 8, 8);
      ctx.fillStyle = '#e0e0e0';
      ctx.fillRect(2, 1, 3, 2);
      ctx.fillRect(4, 4, 3, 2);
    });

    polarBearLegTex = createPixelTexture(4, 4, (ctx) => {
      ctx.fillStyle = '#f5f5f5';
      ctx.fillRect(0, 0, 4, 4);
      ctx.fillStyle = '#e0e0e0';
      ctx.fillRect(0, 3, 4, 1);
    });
  }
  return { head: polarBearHeadTex, body: polarBearBodyTex, leg: polarBearLegTex };
}

function getZombieTextures() {
  if (!zombieHeadTex) {
    // Zombie green face
    zombieHeadTex = createPixelTexture(8, 8, (ctx) => {
      ctx.fillStyle = '#557c3e'; // Green skin
      ctx.fillRect(0, 0, 8, 8);
      // Dark hair
      ctx.fillStyle = '#22381b';
      ctx.fillRect(0, 0, 8, 2);
      ctx.fillRect(0, 2, 1, 1);
      ctx.fillRect(7, 2, 1, 1);
      // Hollow dark eyes
      ctx.fillStyle = '#11200d';
      ctx.fillRect(1, 3, 2, 1);
      ctx.fillRect(5, 3, 2, 1);
      // Nose
      ctx.fillStyle = '#446631';
      ctx.fillRect(3, 4, 2, 1);
      // Mouth
      ctx.fillStyle = '#22381b';
      ctx.fillRect(2, 5, 4, 1);
    });

    // Undead green skin for arms
    zombieSkinTex = createPixelTexture(4, 4, (ctx) => {
      ctx.fillStyle = '#557c3e';
      ctx.fillRect(0, 0, 4, 4);
      ctx.fillStyle = '#446631';
      ctx.fillRect(1, 1, 2, 2);
    });

    // Cyan blue shirt
    zombieShirtTex = createPixelTexture(4, 4, (ctx) => {
      ctx.fillStyle = '#297274';
      ctx.fillRect(0, 0, 4, 4);
      ctx.fillStyle = '#1e5557';
      ctx.fillRect(1, 2, 2, 2);
    });

    // Dark purple/indigo trousers
    zombiePantsTex = createPixelTexture(4, 4, (ctx) => {
      ctx.fillStyle = '#2b2c54';
      ctx.fillRect(0, 0, 4, 4);
      ctx.fillStyle = '#1d1e3d';
      ctx.fillRect(0, 2, 4, 2);
    });
  }
  return { head: zombieHeadTex, skin: zombieSkinTex, shirt: zombieShirtTex, pants: zombiePantsTex };
}

function getCreeperTextures() {
  if (!creeperHeadTex) {
    // Iconic Creeper Face
    creeperHeadTex = createPixelTexture(8, 8, (ctx) => {
      // Mottled camouflage green
      ctx.fillStyle = '#447d33';
      ctx.fillRect(0, 0, 8, 8);
      ctx.fillStyle = '#396d2b';
      ctx.fillRect(0, 0, 2, 2);
      ctx.fillRect(6, 0, 2, 2);
      ctx.fillRect(1, 5, 1, 2);
      ctx.fillRect(6, 5, 1, 2);
      ctx.fillStyle = '#559c40';
      ctx.fillRect(2, 0, 4, 1);
      ctx.fillRect(0, 3, 1, 3);
      ctx.fillRect(7, 3, 1, 3);

      // Deep dark eyes
      ctx.fillStyle = '#0a1407';
      ctx.fillRect(1, 2, 2, 2);
      ctx.fillRect(5, 2, 2, 2);

      // Sad frowning mouth
      ctx.fillRect(3, 4, 2, 2); // Center bridge
      ctx.fillRect(2, 5, 4, 1); // Upper mouth bar
      ctx.fillRect(2, 6, 1, 2); // Left droop
      ctx.fillRect(5, 6, 1, 2); // Right droop
    });

    creeperHeadSideTex = createPixelTexture(8, 8, (ctx) => {
      ctx.fillStyle = '#447d33';
      ctx.fillRect(0, 0, 8, 8);
      ctx.fillStyle = '#38692a';
      ctx.fillRect(1, 1, 2, 2);
      ctx.fillRect(5, 4, 2, 2);
      ctx.fillStyle = '#559c40';
      ctx.fillRect(4, 1, 2, 2);
      ctx.fillRect(1, 5, 2, 2);
    });

    creeperBodyTex = createPixelTexture(8, 8, (ctx) => {
      ctx.fillStyle = '#447d33';
      ctx.fillRect(0, 0, 8, 8);
      ctx.fillStyle = '#38692a';
      ctx.fillRect(2, 2, 2, 2);
      ctx.fillRect(5, 5, 2, 2);
      ctx.fillStyle = '#559c40';
      ctx.fillRect(0, 1, 2, 2);
      ctx.fillRect(4, 1, 2, 2);
      ctx.fillRect(1, 6, 3, 1);
    });

    creeperLegTex = createPixelTexture(4, 4, (ctx) => {
      ctx.fillStyle = '#447d33';
      ctx.fillRect(0, 0, 4, 3);
      ctx.fillStyle = '#38692a';
      ctx.fillRect(1, 0, 2, 2);
      ctx.fillStyle = '#183013'; // Claws
      ctx.fillRect(0, 3, 4, 1);
    });
  }
  return {
    head: creeperHeadTex,
    headSide: creeperHeadSideTex,
    body: creeperBodyTex,
    leg: creeperLegTex,
  };
}

// Particle emitter for mob hit and death puffs
export class MobParticleSystem {
  group: THREE.Group;
  particles: { mesh: THREE.Mesh; vel: THREE.Vector3; life: number; maxLife: number }[] = [];

  constructor(scene: THREE.Scene) {
    this.group = new THREE.Group();
    scene.add(this.group);
  }

  // Dramatic Explosion Shockwave & Smoke
  spawnExplosionEffect(pos: THREE.Vector3) {
    // 1. Heavy smoke clouds
    const smokeCount = 36;
    const smokeGeom = new THREE.BoxGeometry(0.25, 0.25, 0.25);
    const smokeMat = new THREE.MeshBasicMaterial({ color: 0x888888, transparent: true, opacity: 0.9 });
    for (let i = 0; i < smokeCount; i++) {
      const mesh = new THREE.Mesh(smokeGeom, smokeMat.clone());
      mesh.position.copy(pos).add(new THREE.Vector3(
        (Math.random() - 0.5) * 1.2,
        Math.random() * 1.2,
        (Math.random() - 0.5) * 1.2
      ));
      const vel = new THREE.Vector3(
        (Math.random() - 0.5) * 7.5,
        Math.random() * 6.0 + 1.5,
        (Math.random() - 0.5) * 7.5
      );
      this.group.add(mesh);
      this.particles.push({ mesh, vel, life: 0, maxLife: 0.75 + Math.random() * 0.45 });
    }

    // 2. Blazing Fire & Sparks
    const fireCount = 28;
    const fireGeom = new THREE.BoxGeometry(0.18, 0.18, 0.18);
    for (let i = 0; i < fireCount; i++) {
      const isYellow = Math.random() > 0.45;
      const mat = new THREE.MeshBasicMaterial({
        color: isYellow ? 0xffcc00 : 0xff3b00,
        transparent: true,
        opacity: 0.95,
      });
      const mesh = new THREE.Mesh(fireGeom, mat);
      mesh.position.copy(pos).add(new THREE.Vector3(
        (Math.random() - 0.5) * 0.8,
        Math.random() * 0.8 + 0.2,
        (Math.random() - 0.5) * 0.8
      ));
      const vel = new THREE.Vector3(
        (Math.random() - 0.5) * 8.5,
        Math.random() * 7.5 + 2.0,
        (Math.random() - 0.5) * 8.5
      );
      this.group.add(mesh);
      this.particles.push({ mesh, vel, life: 0, maxLife: 0.5 + Math.random() * 0.35 });
    }
  }

  // Puff of white smoke when a mob dies
  spawnDeathPuff(pos: THREE.Vector3) {
    const count = 16;
    const geom = new THREE.BoxGeometry(0.15, 0.15, 0.15);
    const mat = new THREE.MeshBasicMaterial({ color: 0xeeeeee, transparent: true, opacity: 0.85 });

    for (let i = 0; i < count; i++) {
      const mesh = new THREE.Mesh(geom, mat.clone());
      mesh.position.copy(pos).add(new THREE.Vector3(
        (Math.random() - 0.5) * 0.6,
        Math.random() * 0.8,
        (Math.random() - 0.5) * 0.6
      ));
      const vel = new THREE.Vector3(
        (Math.random() - 0.5) * 3.5,
        Math.random() * 3.0 + 1.0,
        (Math.random() - 0.5) * 3.5
      );
      this.group.add(mesh);
      this.particles.push({ mesh, vel, life: 0, maxLife: 0.6 + Math.random() * 0.4 });
    }
  }

  // Red damage sparks when hit
  spawnHitSparks(pos: THREE.Vector3) {
    const count = 8;
    const geom = new THREE.BoxGeometry(0.1, 0.1, 0.1);
    const mat = new THREE.MeshBasicMaterial({ color: 0xcc2222, transparent: true, opacity: 0.9 });

    for (let i = 0; i < count; i++) {
      const mesh = new THREE.Mesh(geom, mat.clone());
      mesh.position.copy(pos).add(new THREE.Vector3(
        (Math.random() - 0.5) * 0.3,
        Math.random() * 0.5 + 0.2,
        (Math.random() - 0.5) * 0.3
      ));
      const vel = new THREE.Vector3(
        (Math.random() - 0.5) * 2.8,
        Math.random() * 2.2 + 0.5,
        (Math.random() - 0.5) * 2.8
      );
      this.group.add(mesh);
      this.particles.push({ mesh, vel, life: 0, maxLife: 0.4 });
    }
  }

  // Flame particle for burning zombies
  spawnFireParticle(pos: THREE.Vector3) {
    const geom = new THREE.BoxGeometry(0.08, 0.08, 0.08);
    const isYellow = Math.random() > 0.4;
    const mat = new THREE.MeshBasicMaterial({
      color: isYellow ? 0xffbb00 : 0xff3300,
      transparent: true,
      opacity: 0.85
    });
    const mesh = new THREE.Mesh(geom, mat);
    mesh.position.copy(pos).add(new THREE.Vector3(
      (Math.random() - 0.5) * 0.5,
      Math.random() * 1.2 + 0.2,
      (Math.random() - 0.5) * 0.5
    ));
    const vel = new THREE.Vector3(
      (Math.random() - 0.5) * 0.5,
      Math.random() * 1.8 + 0.8,
      (Math.random() - 0.5) * 0.5
    );
    this.group.add(mesh);
    this.particles.push({ mesh, vel, life: 0, maxLife: 0.35 + Math.random() * 0.25 });
  }

  update(dt: number) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life += dt;
      p.mesh.position.addScaledVector(p.vel, dt);
      p.vel.y -= 3.0 * dt; // gravity

      const progress = p.life / p.maxLife;
      const mat = p.mesh.material as THREE.MeshBasicMaterial;
      mat.opacity = Math.max(0, 1 - progress);
      p.mesh.scale.setScalar(Math.max(0.1, 1 - progress * 0.6));

      if (p.life >= p.maxLife) {
        this.group.remove(p.mesh);
        p.mesh.geometry.dispose();
        mat.dispose();
        this.particles.splice(i, 1);
      }
    }
  }

  destroy() {
    for (const p of this.particles) {
      this.group.remove(p.mesh);
      p.mesh.geometry.dispose();
      (p.mesh.material as THREE.Material).dispose();
    }
    this.particles = [];
    if (this.group.parent) {
      this.group.parent.remove(this.group);
    }
  }
}

// Abstract Base Mob
export abstract class BaseMob {
  id: string;
  type: MobType;
  group: THREE.Group;
  position: THREE.Vector3;
  velocity: THREE.Vector3 = new THREE.Vector3();
  rotationY: number = 0;

  health: number;
  maxHealth: number;
  isDead: boolean = false;
  hurtCooldown: number = 0;
  damageFlashTimer: number = 0;

  onGround: boolean = false;
  inWater: boolean = false;
  walkCycle: number = 0;
  isMoving: boolean = false;

  // Collision box
  width: number = 0.6;
  height: number = 1.4;

  // Original materials cache for red flash restoration
  protected meshMaterials: Map<THREE.Mesh, THREE.Material | THREE.Material[]> = new Map();
  protected damageMaterial = new THREE.MeshBasicMaterial({ color: 0xff3333 });

  constructor(id: string, type: MobType, pos: THREE.Vector3, maxHealth: number) {
    this.id = id;
    this.type = type;
    this.position = pos.clone();
    this.maxHealth = maxHealth;
    this.health = maxHealth;
    this.group = new THREE.Group();
    this.group.position.copy(this.position);
  }

  protected registerMesh(mesh: THREE.Mesh) {
    this.meshMaterials.set(mesh, mesh.material);
  }

  takeDamage(amount: number, knockbackDir: THREE.Vector3) {
    if (this.isDead || this.hurtCooldown > 0) return;
    this.health = Math.max(0, this.health - amount);
    this.hurtCooldown = 0.35;
    this.damageFlashTimer = 0.18;

    // Apply knockback impulse
    this.velocity.x += knockbackDir.x * 6.5;
    this.velocity.z += knockbackDir.z * 6.5;
    this.velocity.y = 4.2;
    this.onGround = false;

    // Red damage flash
    this.setFlashColor(true);

    if (this.health <= 0) {
      this.isDead = true;
    }
  }

  private setFlashColor(flashing: boolean) {
    for (const [mesh, origMat] of this.meshMaterials.entries()) {
      if (flashing) {
        mesh.material = this.damageMaterial;
      } else {
        mesh.material = origMat;
      }
    }
  }

  updatePhysics(dt: number, world: VoxelWorld) {
    // Gravity & water
    const blockX = Math.floor(this.position.x);
    const blockY = Math.floor(this.position.y);
    const blockZ = Math.floor(this.position.z);
    this.inWater = world.getBlock(blockX, blockY, blockZ) === BLOCK_TYPES.WATER;

    if (this.inWater) {
      this.velocity.y = Math.min(2.5, this.velocity.y + 7.0 * dt); // Mob floats in water
      this.velocity.x *= 0.85;
      this.velocity.z *= 0.85;
    } else {
      this.velocity.y -= 22.0 * dt; // Gravity
      if (this.velocity.y < -28) this.velocity.y = -28;
    }

    // Move along X
    const newX = this.position.x + this.velocity.x * dt;
    if (this.checkCollisionAt(newX, this.position.y, this.position.z, world)) {
      // Check 1-block auto step-up for smooth mob hill traversal
      if (this.onGround && !this.checkCollisionAt(newX, this.position.y + 1.05, this.position.z, world)) {
        this.position.y += 1.0;
        this.position.x = newX;
      } else {
        this.velocity.x = 0;
      }
    } else {
      this.position.x = newX;
    }

    // Move along Z
    const newZ = this.position.z + this.velocity.z * dt;
    if (this.checkCollisionAt(this.position.x, this.position.y, newZ, world)) {
      // Check 1-block auto step-up
      if (this.onGround && !this.checkCollisionAt(this.position.x, this.position.y + 1.05, newZ, world)) {
        this.position.y += 1.0;
        this.position.z = newZ;
      } else {
        this.velocity.z = 0;
      }
    } else {
      this.position.z = newZ;
    }

    // Move along Y
    const newY = this.position.y + this.velocity.y * dt;
    if (this.checkCollisionAt(this.position.x, newY, this.position.z, world)) {
      if (this.velocity.y < 0) {
        this.onGround = true;
        this.position.y = Math.floor(newY) + 1.0;
      }
      this.velocity.y = 0;
    } else {
      this.position.y = newY;
      this.onGround = false;
    }

    // Friction on ground
    if (this.onGround) {
      this.velocity.x *= Math.pow(0.5, dt * 15);
      this.velocity.z *= Math.pow(0.5, dt * 15);
    }

    // Hurt timers
    if (this.hurtCooldown > 0) this.hurtCooldown -= dt;
    if (this.damageFlashTimer > 0) {
      this.damageFlashTimer -= dt;
      if (this.damageFlashTimer <= 0) {
        this.setFlashColor(false);
      }
    }

    this.group.position.copy(this.position);
    this.group.rotation.y = this.rotationY;
  }

  private checkCollisionAt(x: number, y: number, z: number, world: VoxelWorld): boolean {
    const halfW = this.width * 0.5;
    const minX = Math.floor(x - halfW);
    const maxX = Math.floor(x + halfW);
    const minY = Math.floor(y);
    const maxY = Math.floor(y + this.height - 0.1);
    const minZ = Math.floor(z - halfW);
    const maxZ = Math.floor(z + halfW);

    for (let cy = minY; cy <= maxY; cy++) {
      for (let cx = minX; cx <= maxX; cx++) {
        for (let cz = minZ; cz <= maxZ; cz++) {
          const b = world.getBlock(cx, cy, cz);
          if (b !== BLOCK_TYPES.AIR && b !== BLOCK_TYPES.WATER && b !== BLOCK_TYPES.TORCH) {
            return true;
          }
        }
      }
    }
    return false;
  }

  abstract updateAI(
    dt: number,
    world: VoxelWorld,
    playerPos: THREE.Vector3,
    isDay: boolean,
    difficulty: GameDifficulty,
    onPlayerDamage: (damage: number) => void
  ): void;

  destroy() {
    this.damageMaterial.dispose();
    for (const mat of this.meshMaterials.values()) {
      if (Array.isArray(mat)) {
        mat.forEach((m) => m.dispose());
      } else {
        mat.dispose();
      }
    }
    this.meshMaterials.clear();
    this.group.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
      }
    });
    if (this.group.parent) {
      this.group.parent.remove(this.group);
    }
  }
}

// -------------------------------------------------------------
// 1. SHEEP MOB (Passive animal that grazes and wanders)
// -------------------------------------------------------------
export class SheepMob extends BaseMob {
  private bodyMesh!: THREE.Mesh;
  private headMesh!: THREE.Mesh;
  private legMeshes: THREE.Mesh[] = [];

  private wanderTimer: number = 0;
  private grazeTimer: number = 0;
  private isGrazing: boolean = false;
  private fleeTimer: number = 0;
  private ambientSoundTimer: number = 5 + Math.random() * 12;

  constructor(id: string, pos: THREE.Vector3) {
    super(id, 'sheep', pos, 16);
    this.width = 0.85;
    this.height = 1.25;
    this.buildMesh();
  }

  private buildMesh() {
    const { head, wool, leg } = getSheepTextures();
    const woolMat = new THREE.MeshLambertMaterial({ map: wool });
    const headFaceMat = new THREE.MeshLambertMaterial({ map: head });
    const legMat = new THREE.MeshLambertMaterial({ map: leg });

    // 1. Wool Torso (Large fluffy box)
    const bodyGeom = new THREE.BoxGeometry(0.8, 0.7, 1.1);
    this.bodyMesh = new THREE.Mesh(bodyGeom, woolMat);
    this.bodyMesh.position.set(0, 0.7, 0);
    this.group.add(this.bodyMesh);
    this.registerMesh(this.bodyMesh);

    // 2. Head with face (+Z front face at index 4, -Z back of head at index 5)
    const headMaterials = [
      woolMat, woolMat, woolMat, woolMat,
      headFaceMat, // Index 4: Front Face (+Z)
      woolMat,     // Index 5: Back of Head (-Z)
    ];
    const headGeom = new THREE.BoxGeometry(0.48, 0.48, 0.52);
    this.headMesh = new THREE.Mesh(headGeom, headMaterials);
    this.headMesh.position.set(0, 0.95, 0.65);
    this.group.add(this.headMesh);
    this.registerMesh(this.headMesh);

    // 3. 4 Legs (Front-Left, Front-Right, Back-Left, Back-Right)
    const legPositions = [
      [-0.26, 0.28, 0.36],
      [0.26, 0.28, 0.36],
      [-0.26, 0.28, -0.36],
      [0.26, 0.28, -0.36],
    ];
    const legGeom = new THREE.BoxGeometry(0.2, 0.56, 0.2);
    for (const [lx, ly, lz] of legPositions) {
      const legMesh = new THREE.Mesh(legGeom, legMat);
      legMesh.position.set(lx, ly, lz);
      this.group.add(legMesh);
      this.legMeshes.push(legMesh);
      this.registerMesh(legMesh);
    }
  }

  takeDamage(amount: number, knockbackDir: THREE.Vector3) {
    super.takeDamage(amount, knockbackDir);
    sounds.playSheepBaa();
    sounds.playMobHit();
    this.fleeTimer = 3.5; // Runs away from player when hit
    this.isGrazing = false;
  }

  updateAI(
    dt: number,
    world: VoxelWorld,
    playerPos: THREE.Vector3,
    _isDay: boolean,
    _difficulty: GameDifficulty,
    _onPlayerDamage: (damage: number) => void
  ) {
    if (this.isDead) return;

    // Ambient bleat
    this.ambientSoundTimer -= dt;
    if (this.ambientSoundTimer <= 0) {
      const distToPlayer = this.position.distanceTo(playerPos);
      if (distToPlayer < 24) {
        sounds.playSheepBaa();
      }
      this.ambientSoundTimer = 12 + Math.random() * 20;
    }

    // Fleeing from player if recently attacked
    if (this.fleeTimer > 0) {
      this.fleeTimer -= dt;
      const away = new THREE.Vector3().subVectors(this.position, playerPos).normalize();
      this.rotationY = Math.atan2(away.x, away.z);
      const speed = 4.2;
      this.velocity.x = away.x * speed;
      this.velocity.z = away.z * speed;
      this.isMoving = true;
    } else {
      // Peaceful wander & graze behavior
      this.wanderTimer -= dt;
      if (this.wanderTimer <= 0) {
        if (Math.random() < 0.4) {
          // Graze grass for a moment
          this.isGrazing = true;
          this.grazeTimer = 2.2;
          this.isMoving = false;
          this.velocity.x = 0;
          this.velocity.z = 0;
        } else if (Math.random() < 0.6) {
          // Pick new random wander heading
          this.isGrazing = false;
          this.rotationY += (Math.random() - 0.5) * 2.2;
          this.isMoving = true;
        } else {
          // Idle rest
          this.isGrazing = false;
          this.isMoving = false;
          this.velocity.x = 0;
          this.velocity.z = 0;
        }
        this.wanderTimer = 2.5 + Math.random() * 4.0;
      }

      if (this.isGrazing) {
        this.grazeTimer -= dt;
        if (this.grazeTimer <= 0) {
          this.isGrazing = false;
        }
        // Head dips down to grass
        this.headMesh.position.set(0, 0.6, 0.72);
        this.headMesh.rotation.x = 0.55;
      } else {
        this.headMesh.position.set(0, 0.95, 0.65);
        this.headMesh.rotation.x = 0;

        if (this.isMoving && this.onGround) {
          const moveSpeed = 1.8;
          this.velocity.x = Math.sin(this.rotationY) * moveSpeed;
          this.velocity.z = Math.cos(this.rotationY) * moveSpeed;
        }
      }
    }

    // Animate legs when moving
    if (this.isMoving) {
      this.walkCycle += dt * 8.0;
      const swing = Math.sin(this.walkCycle) * 0.45;
      this.legMeshes[0].rotation.x = swing;
      this.legMeshes[1].rotation.x = -swing;
      this.legMeshes[2].rotation.x = -swing;
      this.legMeshes[3].rotation.x = swing;
    } else {
      for (const leg of this.legMeshes) leg.rotation.x = 0;
    }

    this.updatePhysics(dt, world);
  }
}

// -------------------------------------------------------------
// 2. ZOMBIE MOB (Iconic Hostile Undead)
// -------------------------------------------------------------
export class ZombieMob extends BaseMob {
  private headMesh!: THREE.Mesh;
  private bodyMesh!: THREE.Mesh;
  private leftArmMesh!: THREE.Mesh;
  private rightArmMesh!: THREE.Mesh;
  private leftLegMesh!: THREE.Mesh;
  private rightLegMesh!: THREE.Mesh;

  private attackCooldown: number = 0;
  private ambientGroanTimer: number = 4 + Math.random() * 8;
  public isBurning: boolean = false;
  private burnTickTimer: number = 0;

  constructor(id: string, pos: THREE.Vector3) {
    super(id, 'zombie', pos, 30);
    this.width = 0.6;
    this.height = 1.85;
    this.buildMesh();
  }

  private buildMesh() {
    const { head, skin, shirt, pants } = getZombieTextures();
    const skinMat = new THREE.MeshLambertMaterial({ map: skin });
    const shirtMat = new THREE.MeshLambertMaterial({ map: shirt });
    const pantsMat = new THREE.MeshLambertMaterial({ map: pants });
    const headFaceMat = new THREE.MeshLambertMaterial({ map: head });

    // 1. Head (+Z front face at index 4, -Z back of head at index 5)
    const headMaterials = [
      skinMat, skinMat, skinMat, skinMat,
      headFaceMat, // Index 4: Front Face (+Z)
      skinMat,     // Index 5: Back of Head (-Z)
    ];
    const headGeom = new THREE.BoxGeometry(0.5, 0.5, 0.5);
    this.headMesh = new THREE.Mesh(headGeom, headMaterials);
    this.headMesh.position.set(0, 1.55, 0);
    this.group.add(this.headMesh);
    this.registerMesh(this.headMesh);

    // 2. Torso (Cyan Shirt)
    const bodyGeom = new THREE.BoxGeometry(0.5, 0.68, 0.28);
    this.bodyMesh = new THREE.Mesh(bodyGeom, shirtMat);
    this.bodyMesh.position.set(0, 0.96, 0);
    this.group.add(this.bodyMesh);
    this.registerMesh(this.bodyMesh);

    // 3. Arms (Outstretched forward like classic Minecraft zombies)
    const armGeom = new THREE.BoxGeometry(0.2, 0.65, 0.2);
    // Pivot at shoulder, pointing forward
    this.leftArmMesh = new THREE.Mesh(armGeom, skinMat);
    this.leftArmMesh.position.set(-0.35, 1.15, 0.32);
    this.leftArmMesh.rotation.x = -Math.PI / 2 + 0.1; // Forward
    this.group.add(this.leftArmMesh);
    this.registerMesh(this.leftArmMesh);

    this.rightArmMesh = new THREE.Mesh(armGeom, skinMat);
    this.rightArmMesh.position.set(0.35, 1.15, 0.32);
    this.rightArmMesh.rotation.x = -Math.PI / 2 + 0.1; // Forward
    this.group.add(this.rightArmMesh);
    this.registerMesh(this.rightArmMesh);

    // 4. Legs (Purple Trousers)
    const legGeom = new THREE.BoxGeometry(0.22, 0.66, 0.22);
    this.leftLegMesh = new THREE.Mesh(legGeom, pantsMat);
    this.leftLegMesh.position.set(-0.14, 0.33, 0);
    this.group.add(this.leftLegMesh);
    this.registerMesh(this.leftLegMesh);

    this.rightLegMesh = new THREE.Mesh(legGeom, pantsMat);
    this.rightLegMesh.position.set(0.14, 0.33, 0);
    this.group.add(this.rightLegMesh);
    this.registerMesh(this.rightLegMesh);
  }

  takeDamage(amount: number, knockbackDir: THREE.Vector3) {
    super.takeDamage(amount, knockbackDir);
    sounds.playZombieHurt();
    sounds.playMobHit();
  }

  updateAI(
    dt: number,
    world: VoxelWorld,
    playerPos: THREE.Vector3,
    isDay: boolean,
    difficulty: GameDifficulty,
    onPlayerDamage: (damage: number) => void
  ) {
    if (this.isDead) return;

    // Peaceful difficulty removes all zombies immediately
    if (difficulty === 'peaceful') {
      this.isDead = true;
      return;
    }

    // 1. Daylight Burning Check (Minecraft mechanics)
    // If daylight and exposed to sky (no solid roof) and not submerged in water -> burns!
    const bx = Math.floor(this.position.x);
    const bz = Math.floor(this.position.z);
    const highestBlock = world.getHighestSolidBlock(bx, bz);
    const exposedToSky = this.position.y >= highestBlock - 0.5;

    if (isDay && exposedToSky && !this.inWater) {
      this.isBurning = true;
      this.burnTickTimer += dt;
      if (this.burnTickTimer >= 1.0) {
        this.burnTickTimer = 0;
        this.health = Math.max(0, this.health - 4.0);
        if (this.health <= 0) this.isDead = true;
      }
    } else {
      this.isBurning = false;
    }

    // 2. Ambient Groan
    this.ambientGroanTimer -= dt;
    if (this.ambientGroanTimer <= 0) {
      const dist = this.position.distanceTo(playerPos);
      if (dist < 26) {
        sounds.playZombieGroan();
      }
      this.ambientGroanTimer = 9 + Math.random() * 15;
    }

    // 3. Aggro & Pathfinding towards Player
    const distToPlayer = this.position.distanceTo(playerPos);
    const aggroRadius = difficulty === 'hard' ? 30 : difficulty === 'normal' ? 22 : 16;

    if (distToPlayer <= aggroRadius) {
      // Rotate to face player
      const dirX = playerPos.x - this.position.x;
      const dirZ = playerPos.z - this.position.z;
      this.rotationY = Math.atan2(dirX, dirZ);

      // Move toward player
      const speed = difficulty === 'hard' ? 3.0 : 2.3;
      const norm = Math.sqrt(dirX * dirX + dirZ * dirZ) || 1;
      this.velocity.x = (dirX / norm) * speed;
      this.velocity.z = (dirZ / norm) * speed;
      this.isMoving = true;

      // Attack player if within reach
      if (distToPlayer <= 1.6) {
        this.attackCooldown -= dt;
        if (this.attackCooldown <= 0) {
          const damage = difficulty === 'hard' ? 32 : difficulty === 'normal' ? 20 : 12;
          onPlayerDamage(damage);
          sounds.playZombieGroan();
          this.attackCooldown = 1.25;
        }
      }
    } else {
      this.velocity.x *= 0.8;
      this.velocity.z *= 0.8;
      this.isMoving = false;
    }

    // 4. Animate limbs
    if (this.isMoving) {
      this.walkCycle += dt * 7.5;
      const legSwing = Math.sin(this.walkCycle) * 0.55;
      this.leftLegMesh.rotation.x = legSwing;
      this.rightLegMesh.rotation.x = -legSwing;

      // Outstretched arms sway slightly
      const armSway = Math.sin(this.walkCycle) * 0.12;
      this.leftArmMesh.rotation.z = armSway;
      this.rightArmMesh.rotation.z = -armSway;
    } else {
      this.leftLegMesh.rotation.x = 0;
      this.rightLegMesh.rotation.x = 0;
      this.leftArmMesh.rotation.z = 0;
      this.rightArmMesh.rotation.z = 0;
    }

    this.updatePhysics(dt, world);
  }
}

// -------------------------------------------------------------
// 3. COW MOB (Passive animal, drops Raw Beef and Leather)
// -------------------------------------------------------------
export class CowMob extends BaseMob {
  private bodyMesh!: THREE.Mesh;
  private headMesh!: THREE.Mesh;
  private legMeshes: THREE.Mesh[] = [];

  private wanderTimer: number = 0;
  private fleeTimer: number = 0;
  private ambientSoundTimer: number = 6 + Math.random() * 14;

  constructor(id: string, pos: THREE.Vector3) {
    super(id, 'cow', pos, 20);
    this.width = 0.9;
    this.height = 1.35;
    this.buildMesh();
  }

  private buildMesh() {
    const { head, body, leg } = getCowTextures();
    const bodyMat = new THREE.MeshLambertMaterial({ map: body });
    const headFaceMat = new THREE.MeshLambertMaterial({ map: head });
    const legMat = new THREE.MeshLambertMaterial({ map: leg });

    // Torso
    const bodyGeom = new THREE.BoxGeometry(0.85, 0.75, 1.2);
    this.bodyMesh = new THREE.Mesh(bodyGeom, bodyMat);
    this.bodyMesh.position.set(0, 0.75, 0);
    this.group.add(this.bodyMesh);
    this.registerMesh(this.bodyMesh);

    // Head (+Z front face at index 4, -Z back of head at index 5)
    const headMaterials = [
      bodyMat, bodyMat, bodyMat, bodyMat,
      headFaceMat, // Index 4: Front Face (+Z)
      bodyMat,     // Index 5: Back of Head (-Z)
    ];
    const headGeom = new THREE.BoxGeometry(0.52, 0.52, 0.55);
    this.headMesh = new THREE.Mesh(headGeom, headMaterials);
    this.headMesh.position.set(0, 1.05, 0.72);
    this.group.add(this.headMesh);
    this.registerMesh(this.headMesh);

    // 4 Legs
    const legPositions = [
      [-0.28, 0.32, 0.42],
      [0.28, 0.32, 0.42],
      [-0.28, 0.32, -0.42],
      [0.28, 0.32, -0.42],
    ];
    const legGeom = new THREE.BoxGeometry(0.22, 0.64, 0.22);
    for (const [lx, ly, lz] of legPositions) {
      const legMesh = new THREE.Mesh(legGeom, legMat);
      legMesh.position.set(lx, ly, lz);
      this.group.add(legMesh);
      this.legMeshes.push(legMesh);
      this.registerMesh(legMesh);
    }
  }

  takeDamage(amount: number, knockbackDir: THREE.Vector3) {
    super.takeDamage(amount, knockbackDir);
    sounds.playCowMoo();
    sounds.playMobHit();
    this.fleeTimer = 3.5;
  }

  updateAI(
    dt: number,
    world: VoxelWorld,
    playerPos: THREE.Vector3,
    _isDay: boolean,
    _difficulty: GameDifficulty,
    _onPlayerDamage: (damage: number) => void
  ) {
    if (this.isDead) return;

    // Ambient moo
    this.ambientSoundTimer -= dt;
    if (this.ambientSoundTimer <= 0) {
      const distToPlayer = this.position.distanceTo(playerPos);
      if (distToPlayer < 24) {
        sounds.playCowMoo();
      }
      this.ambientSoundTimer = 14 + Math.random() * 22;
    }

    if (this.fleeTimer > 0) {
      this.fleeTimer -= dt;
      const away = new THREE.Vector3().subVectors(this.position, playerPos).normalize();
      this.rotationY = Math.atan2(away.x, away.z);
      const speed = 4.2;
      this.velocity.x = away.x * speed;
      this.velocity.z = away.z * speed;
      this.isMoving = true;
    } else {
      this.wanderTimer -= dt;
      if (this.wanderTimer <= 0) {
        this.wanderTimer = 3 + Math.random() * 6;
        if (Math.random() < 0.6) {
          this.rotationY += (Math.random() - 0.5) * 2.2;
          this.isMoving = true;
        } else {
          this.isMoving = false;
        }
      }

      if (this.isMoving) {
        const speed = 1.3;
        this.velocity.x = -Math.sin(this.rotationY) * speed;
        this.velocity.z = Math.cos(this.rotationY) * speed;
      }
    }

    if (this.isMoving) {
      this.walkCycle += dt * 5.0;
      const swing = Math.sin(this.walkCycle) * 0.45;
      this.legMeshes[0].rotation.x = swing;
      this.legMeshes[1].rotation.x = -swing;
      this.legMeshes[2].rotation.x = -swing;
      this.legMeshes[3].rotation.x = swing;
    } else {
      this.legMeshes.forEach((l) => (l.rotation.x = 0));
    }

    this.updatePhysics(dt, world);
  }
}

// -------------------------------------------------------------
// 4. PIG MOB (Passive animal, drops Raw Porkchop)
// -------------------------------------------------------------
export class PigMob extends BaseMob {
  private bodyMesh!: THREE.Mesh;
  private headMesh!: THREE.Mesh;
  private legMeshes: THREE.Mesh[] = [];

  private wanderTimer: number = 0;
  private fleeTimer: number = 0;
  private ambientSoundTimer: number = 5 + Math.random() * 12;

  constructor(id: string, pos: THREE.Vector3) {
    super(id, 'pig', pos, 16);
    this.width = 0.8;
    this.height = 1.1;
    this.buildMesh();
  }

  private buildMesh() {
    const { head, body, leg } = getPigTextures();
    const bodyMat = new THREE.MeshLambertMaterial({ map: body });
    const headFaceMat = new THREE.MeshLambertMaterial({ map: head });
    const legMat = new THREE.MeshLambertMaterial({ map: leg });

    // Torso
    const bodyGeom = new THREE.BoxGeometry(0.75, 0.65, 1.0);
    this.bodyMesh = new THREE.Mesh(bodyGeom, bodyMat);
    this.bodyMesh.position.set(0, 0.62, 0);
    this.group.add(this.bodyMesh);
    this.registerMesh(this.bodyMesh);

    // Head (+Z front face at index 4, -Z back of head at index 5)
    const headMaterials = [
      bodyMat, bodyMat, bodyMat, bodyMat,
      headFaceMat, // Index 4: Front Face (+Z)
      bodyMat,     // Index 5: Back of Head (-Z)
    ];
    const headGeom = new THREE.BoxGeometry(0.48, 0.48, 0.48);
    this.headMesh = new THREE.Mesh(headGeom, headMaterials);
    this.headMesh.position.set(0, 0.86, 0.6);

    // 3D Snout protrusion
    const snoutGeom = new THREE.BoxGeometry(0.24, 0.16, 0.12);
    const snoutMat = new THREE.MeshLambertMaterial({ color: 0xec407a });
    const snoutMesh = new THREE.Mesh(snoutGeom, snoutMat);
    snoutMesh.position.set(0, -0.06, 0.28);
    this.headMesh.add(snoutMesh);

    this.group.add(this.headMesh);
    this.registerMesh(this.headMesh);

    // 4 Legs
    const legPositions = [
      [-0.24, 0.25, 0.35],
      [0.24, 0.25, 0.35],
      [-0.24, 0.25, -0.35],
      [0.24, 0.25, -0.35],
    ];
    const legGeom = new THREE.BoxGeometry(0.2, 0.5, 0.2);
    for (const [lx, ly, lz] of legPositions) {
      const legMesh = new THREE.Mesh(legGeom, legMat);
      legMesh.position.set(lx, ly, lz);
      this.group.add(legMesh);
      this.legMeshes.push(legMesh);
      this.registerMesh(legMesh);
    }
  }

  takeDamage(amount: number, knockbackDir: THREE.Vector3) {
    super.takeDamage(amount, knockbackDir);
    sounds.playPigOink();
    sounds.playMobHit();
    this.fleeTimer = 3.5;
  }

  updateAI(
    dt: number,
    world: VoxelWorld,
    playerPos: THREE.Vector3,
    _isDay: boolean,
    _difficulty: GameDifficulty,
    _onPlayerDamage: (damage: number) => void
  ) {
    if (this.isDead) return;

    // Ambient oink
    this.ambientSoundTimer -= dt;
    if (this.ambientSoundTimer <= 0) {
      const distToPlayer = this.position.distanceTo(playerPos);
      if (distToPlayer < 24) {
        sounds.playPigOink();
      }
      this.ambientSoundTimer = 10 + Math.random() * 18;
    }

    if (this.fleeTimer > 0) {
      this.fleeTimer -= dt;
      const away = new THREE.Vector3().subVectors(this.position, playerPos).normalize();
      this.rotationY = Math.atan2(away.x, away.z);
      const speed = 4.4;
      this.velocity.x = away.x * speed;
      this.velocity.z = away.z * speed;
      this.isMoving = true;
    } else {
      this.wanderTimer -= dt;
      if (this.wanderTimer <= 0) {
        this.wanderTimer = 3 + Math.random() * 5;
        if (Math.random() < 0.65) {
          this.rotationY += (Math.random() - 0.5) * 2.0;
          this.isMoving = true;
        } else {
          this.isMoving = false;
        }
      }

      if (this.isMoving) {
        const speed = 1.4;
        this.velocity.x = -Math.sin(this.rotationY) * speed;
        this.velocity.z = Math.cos(this.rotationY) * speed;
      }
    }

    if (this.isMoving) {
      this.walkCycle += dt * 6.0;
      const swing = Math.sin(this.walkCycle) * 0.45;
      this.legMeshes[0].rotation.x = swing;
      this.legMeshes[1].rotation.x = -swing;
      this.legMeshes[2].rotation.x = -swing;
      this.legMeshes[3].rotation.x = swing;
    } else {
      this.legMeshes.forEach((l) => (l.rotation.x = 0));
    }

    this.updatePhysics(dt, world);
  }
}

// -------------------------------------------------------------
// 5. CHICKEN MOB (Passive animal, drops Raw Chicken & Feathers)
// -------------------------------------------------------------
export class ChickenMob extends BaseMob {
  private bodyMesh!: THREE.Mesh;
  private headMesh!: THREE.Mesh;
  private leftWingMesh!: THREE.Mesh;
  private rightWingMesh!: THREE.Mesh;
  private legMeshes: THREE.Mesh[] = [];

  private wanderTimer: number = 0;
  private fleeTimer: number = 0;
  private ambientSoundTimer: number = 4 + Math.random() * 10;
  private flapCycle: number = 0;

  constructor(id: string, pos: THREE.Vector3) {
    super(id, 'chicken', pos, 8);
    this.width = 0.5;
    this.height = 0.75;
    this.buildMesh();
  }

  private buildMesh() {
    const { head, body, wing, leg } = getChickenTextures();
    const bodyMat = new THREE.MeshLambertMaterial({ map: body });
    const headFaceMat = new THREE.MeshLambertMaterial({ map: head });
    const wingMat = new THREE.MeshLambertMaterial({ map: wing });
    const legMat = new THREE.MeshLambertMaterial({ map: leg });

    // Torso
    const bodyGeom = new THREE.BoxGeometry(0.42, 0.4, 0.52);
    this.bodyMesh = new THREE.Mesh(bodyGeom, bodyMat);
    this.bodyMesh.position.set(0, 0.42, 0);
    this.group.add(this.bodyMesh);
    this.registerMesh(this.bodyMesh);

    // Head (+Z front face at index 4, -Z back of head at index 5)
    const headMaterials = [
      bodyMat, bodyMat, bodyMat, bodyMat,
      headFaceMat, // Index 4: Front Face (+Z)
      bodyMat,     // Index 5: Back of Head (-Z)
    ];
    const headGeom = new THREE.BoxGeometry(0.28, 0.36, 0.28);
    this.headMesh = new THREE.Mesh(headGeom, headMaterials);
    this.headMesh.position.set(0, 0.72, 0.3);

    // Beak
    const beakGeom = new THREE.BoxGeometry(0.14, 0.1, 0.14);
    const beakMat = new THREE.MeshLambertMaterial({ color: 0xffb300 });
    const beakMesh = new THREE.Mesh(beakGeom, beakMat);
    beakMesh.position.set(0, -0.04, 0.18);
    this.headMesh.add(beakMesh);

    // Red Wattle
    const wattleGeom = new THREE.BoxGeometry(0.1, 0.14, 0.08);
    const wattleMat = new THREE.MeshLambertMaterial({ color: 0xd32f2f });
    const wattleMesh = new THREE.Mesh(wattleGeom, wattleMat);
    wattleMesh.position.set(0, -0.14, 0.12);
    this.headMesh.add(wattleMesh);

    this.group.add(this.headMesh);
    this.registerMesh(this.headMesh);

    // Wings
    const wingGeom = new THREE.BoxGeometry(0.06, 0.28, 0.38);
    this.leftWingMesh = new THREE.Mesh(wingGeom, wingMat);
    this.leftWingMesh.position.set(-0.24, 0.45, 0);
    this.group.add(this.leftWingMesh);
    this.registerMesh(this.leftWingMesh);

    this.rightWingMesh = new THREE.Mesh(wingGeom, wingMat);
    this.rightWingMesh.position.set(0.24, 0.45, 0);
    this.group.add(this.rightWingMesh);
    this.registerMesh(this.rightWingMesh);

    // 2 Legs
    const legGeom = new THREE.BoxGeometry(0.08, 0.26, 0.08);
    const legPositions = [
      [-0.1, 0.13, 0],
      [0.1, 0.13, 0],
    ];
    for (const [lx, ly, lz] of legPositions) {
      const legMesh = new THREE.Mesh(legGeom, legMat);
      legMesh.position.set(lx, ly, lz);
      this.group.add(legMesh);
      this.legMeshes.push(legMesh);
      this.registerMesh(legMesh);
    }
  }

  takeDamage(amount: number, knockbackDir: THREE.Vector3) {
    super.takeDamage(amount, knockbackDir);
    sounds.playChickenCluck();
    sounds.playMobHit();
    this.fleeTimer = 3.5;
  }

  updateAI(
    dt: number,
    world: VoxelWorld,
    playerPos: THREE.Vector3,
    _isDay: boolean,
    _difficulty: GameDifficulty,
    _onPlayerDamage: (damage: number) => void
  ) {
    if (this.isDead) return;

    // Slow-falling chicken glide
    if (this.velocity.y < -1.8) {
      this.velocity.y = -1.8;
      this.flapCycle += dt * 18;
      const flap = Math.sin(this.flapCycle) * 0.8;
      this.leftWingMesh.rotation.z = flap;
      this.rightWingMesh.rotation.z = -flap;
    }

    // Ambient cluck
    this.ambientSoundTimer -= dt;
    if (this.ambientSoundTimer <= 0) {
      const distToPlayer = this.position.distanceTo(playerPos);
      if (distToPlayer < 24) {
        sounds.playChickenCluck();
      }
      this.ambientSoundTimer = 8 + Math.random() * 15;
    }

    if (this.fleeTimer > 0) {
      this.fleeTimer -= dt;
      const away = new THREE.Vector3().subVectors(this.position, playerPos).normalize();
      this.rotationY = Math.atan2(away.x, away.z);
      const speed = 4.2;
      this.velocity.x = away.x * speed;
      this.velocity.z = away.z * speed;
      this.isMoving = true;
    } else {
      this.wanderTimer -= dt;
      if (this.wanderTimer <= 0) {
        this.wanderTimer = 2.5 + Math.random() * 4;
        if (Math.random() < 0.6) {
          this.rotationY += (Math.random() - 0.5) * 2.5;
          this.isMoving = true;
        } else {
          this.isMoving = false;
        }
      }

      if (this.isMoving) {
        const speed = 1.6;
        this.velocity.x = -Math.sin(this.rotationY) * speed;
        this.velocity.z = Math.cos(this.rotationY) * speed;
      }
    }

    if (this.isMoving) {
      this.walkCycle += dt * 8.0;
      const swing = Math.sin(this.walkCycle) * 0.5;
      this.legMeshes[0].rotation.x = swing;
      this.legMeshes[1].rotation.x = -swing;
      const flap = Math.sin(this.walkCycle * 2) * 0.25;
      this.leftWingMesh.rotation.z = flap;
      this.rightWingMesh.rotation.z = -flap;
    } else {
      this.legMeshes.forEach((l) => (l.rotation.x = 0));
      this.leftWingMesh.rotation.z = 0;
      this.rightWingMesh.rotation.z = 0;
    }

    this.updatePhysics(dt, world);
  }
}

// -------------------------------------------------------------
// 6. POLAR BEAR MOB (Snow Biome animal)
// -------------------------------------------------------------
export class PolarBearMob extends BaseMob {
  private bodyMesh!: THREE.Mesh;
  private headMesh!: THREE.Mesh;
  private legMeshes: THREE.Mesh[] = [];

  private wanderTimer: number = 0;
  private fleeTimer: number = 0;

  constructor(id: string, pos: THREE.Vector3) {
    super(id, 'polar_bear', pos, 30);
    this.width = 1.1;
    this.height = 1.45;
    this.buildMesh();
  }

  private buildMesh() {
    const { head, body, leg } = getPolarBearTextures();
    const bodyMat = new THREE.MeshLambertMaterial({ map: body });
    const headFaceMat = new THREE.MeshLambertMaterial({ map: head });
    const legMat = new THREE.MeshLambertMaterial({ map: leg });

    // Torso
    const bodyGeom = new THREE.BoxGeometry(0.95, 0.85, 1.4);
    this.bodyMesh = new THREE.Mesh(bodyGeom, bodyMat);
    this.bodyMesh.position.set(0, 0.85, 0);
    this.group.add(this.bodyMesh);
    this.registerMesh(this.bodyMesh);

    // Head (+Z front face at index 4, -Z back of head at index 5)
    const headMaterials = [
      bodyMat, bodyMat, bodyMat, bodyMat,
      headFaceMat, // Index 4: Front Face (+Z)
      bodyMat,     // Index 5: Back of Head (-Z)
    ];
    const headGeom = new THREE.BoxGeometry(0.58, 0.58, 0.65);
    this.headMesh = new THREE.Mesh(headGeom, headMaterials);
    this.headMesh.position.set(0, 1.15, 0.82);
    this.group.add(this.headMesh);
    this.registerMesh(this.headMesh);

    // 4 Strong Legs
    const legPositions = [
      [-0.32, 0.35, 0.48],
      [0.32, 0.35, 0.48],
      [-0.32, 0.35, -0.48],
      [0.32, 0.35, -0.48],
    ];
    const legGeom = new THREE.BoxGeometry(0.28, 0.7, 0.28);
    for (const [lx, ly, lz] of legPositions) {
      const legMesh = new THREE.Mesh(legGeom, legMat);
      legMesh.position.set(lx, ly, lz);
      this.group.add(legMesh);
      this.legMeshes.push(legMesh);
      this.registerMesh(legMesh);
    }
  }

  takeDamage(amount: number, knockbackDir: THREE.Vector3) {
    super.takeDamage(amount, knockbackDir);
    sounds.playMobHit();
    this.fleeTimer = 2.5;
  }

  updateAI(
    dt: number,
    world: VoxelWorld,
    playerPos: THREE.Vector3,
    _isDay: boolean,
    _difficulty: GameDifficulty,
    _onPlayerDamage: (damage: number) => void
  ) {
    if (this.isDead) return;

    if (this.fleeTimer > 0) {
      this.fleeTimer -= dt;
      const away = new THREE.Vector3().subVectors(this.position, playerPos).normalize();
      this.rotationY = Math.atan2(away.x, away.z);
      const speed = 3.6;
      this.velocity.x = away.x * speed;
      this.velocity.z = away.z * speed;
      this.isMoving = true;
    } else {
      this.wanderTimer -= dt;
      if (this.wanderTimer <= 0) {
        this.wanderTimer = 3.5 + Math.random() * 5.0;
        if (Math.random() < 0.6) {
          this.rotationY += (Math.random() - 0.5) * 1.8;
          this.isMoving = true;
        } else {
          this.isMoving = false;
        }
      }

      if (this.isMoving) {
        const speed = 1.2;
        this.velocity.x = -Math.sin(this.rotationY) * speed;
        this.velocity.z = Math.cos(this.rotationY) * speed;
      }
    }

    if (this.isMoving) {
      this.walkCycle += dt * 4.5;
      const swing = Math.sin(this.walkCycle) * 0.4;
      this.legMeshes[0].rotation.x = swing;
      this.legMeshes[1].rotation.x = -swing;
      this.legMeshes[2].rotation.x = -swing;
      this.legMeshes[3].rotation.x = swing;
    } else {
      this.legMeshes.forEach((l) => (l.rotation.x = 0));
    }

    this.updatePhysics(dt, world);
  }
}

// -------------------------------------------------------------
// 7. CREEPER (Iconic green hissing explosive mob)
// -------------------------------------------------------------
export class CreeperMob extends BaseMob {
  private headMesh!: THREE.Mesh;
  private bodyMesh!: THREE.Mesh;
  private legMeshes: THREE.Mesh[] = [];

  private fuseTimer: number = 0;
  private isHissing: boolean = false;
  public hasExploded: boolean = false;
  private whiteMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });

  constructor(id: string, pos: THREE.Vector3) {
    super(id, 'creeper', pos, 20);
    this.width = 0.6;
    this.height = 1.7;
    this.buildMesh();
  }

  private buildMesh() {
    const { head, headSide, body, leg } = getCreeperTextures();
    const headFaceMat = new THREE.MeshLambertMaterial({ map: head });
    const headSideMat = new THREE.MeshLambertMaterial({ map: headSide });
    const bodyMat = new THREE.MeshLambertMaterial({ map: body });
    const legMat = new THREE.MeshLambertMaterial({ map: leg });

    // 1. Head (+Z index 4 is Front Face; -Z index 5 is Back)
    const headMaterials = [
      headSideMat, headSideMat, headSideMat, headSideMat,
      headFaceMat, // Index 4: Front Face (+Z)
      headSideMat, // Index 5: Back of Head (-Z)
    ];
    const headGeom = new THREE.BoxGeometry(0.5, 0.5, 0.5);
    this.headMesh = new THREE.Mesh(headGeom, headMaterials);
    this.headMesh.position.set(0, 1.45, 0);
    this.group.add(this.headMesh);
    this.registerMesh(this.headMesh);

    // 2. Torso
    const bodyGeom = new THREE.BoxGeometry(0.48, 0.68, 0.28);
    this.bodyMesh = new THREE.Mesh(bodyGeom, bodyMat);
    this.bodyMesh.position.set(0, 0.86, 0);
    this.group.add(this.bodyMesh);
    this.registerMesh(this.bodyMesh);

    // 3. 4 Stubby Legs
    const legPositions = [
      [-0.14, 0.26, 0.16],
      [0.14, 0.26, 0.16],
      [-0.14, 0.26, -0.16],
      [0.14, 0.26, -0.16],
    ];
    const legGeom = new THREE.BoxGeometry(0.2, 0.52, 0.2);
    for (const [lx, ly, lz] of legPositions) {
      const legMesh = new THREE.Mesh(legGeom, legMat);
      legMesh.position.set(lx, ly, lz);
      this.group.add(legMesh);
      this.legMeshes.push(legMesh);
      this.registerMesh(legMesh);
    }
  }

  takeDamage(amount: number, knockbackDir: THREE.Vector3) {
    super.takeDamage(amount, knockbackDir);
    sounds.playMobHit();
  }

  updateAI(
    dt: number,
    world: VoxelWorld,
    playerPos: THREE.Vector3,
    _isDay: boolean,
    difficulty: GameDifficulty,
    onPlayerDamage: (damage: number) => void
  ) {
    if (this.isDead) return;

    if (difficulty === 'peaceful') {
      this.isDead = true;
      return;
    }

    const distToPlayer = this.position.distanceTo(playerPos);
    const aggroRadius = difficulty === 'hard' ? 24 : 16;

    // A. Player within explosion prime radius (3.2 blocks)
    if (distToPlayer <= 3.2) {
      if (!this.isHissing) {
        this.isHissing = true;
        sounds.playCreeperHiss();
      }

      this.fuseTimer += dt;
      // White flashing and swelling effect
      const swell = 1.0 + (this.fuseTimer / 1.4) * 0.28;
      this.group.scale.set(swell, swell, swell);

      const isWhiteFlash = Math.floor(this.fuseTimer * 9) % 2 === 1;
      if (isWhiteFlash) {
        this.headMesh.material = this.whiteMaterial;
        this.bodyMesh.material = this.whiteMaterial;
      } else {
        this.headMesh.material = this.meshMaterials.get(this.headMesh)!;
        this.bodyMesh.material = this.meshMaterials.get(this.bodyMesh)!;
      }

      // Stand still while hissing
      this.velocity.x *= 0.5;
      this.velocity.z *= 0.5;
      this.isMoving = false;

      // DETONATION!
      if (this.fuseTimer >= 1.4) {
        this.hasExploded = true;
        this.isDead = true;
        this.group.scale.set(1, 1, 1);
        sounds.playExplosion();
        const dmg = difficulty === 'hard' ? 55 : difficulty === 'normal' ? 36 : 22;
        onPlayerDamage(dmg);
        return;
      }
    } else if (distToPlayer > 5.5 && this.isHissing) {
      // Player fled in time -> abort fuse
      this.isHissing = false;
      this.fuseTimer = Math.max(0, this.fuseTimer - dt * 2.0);
      this.group.scale.set(1, 1, 1);
      this.headMesh.material = this.meshMaterials.get(this.headMesh)!;
      this.bodyMesh.material = this.meshMaterials.get(this.bodyMesh)!;
    }

    // B. Approach player if aggroed and not primed
    if (distToPlayer <= aggroRadius && !this.isHissing) {
      const dirX = playerPos.x - this.position.x;
      const dirZ = playerPos.z - this.position.z;
      this.rotationY = Math.atan2(dirX, dirZ);

      const speed = difficulty === 'hard' ? 2.8 : 2.2;
      const norm = Math.sqrt(dirX * dirX + dirZ * dirZ) || 1;
      this.velocity.x = (dirX / norm) * speed;
      this.velocity.z = (dirZ / norm) * speed;
      this.isMoving = true;
    } else if (!this.isHissing) {
      this.velocity.x *= 0.8;
      this.velocity.z *= 0.8;
      this.isMoving = false;
    }

    // Limbs animation
    if (this.isMoving) {
      this.walkCycle += dt * 6.5;
      const legSwing = Math.sin(this.walkCycle) * 0.45;
      this.legMeshes[0].rotation.x = legSwing;
      this.legMeshes[1].rotation.x = -legSwing;
      this.legMeshes[2].rotation.x = -legSwing;
      this.legMeshes[3].rotation.x = legSwing;
    } else {
      this.legMeshes.forEach((l) => (l.rotation.x = 0));
    }

    this.updatePhysics(dt, world);
  }

  destroy() {
    this.whiteMaterial.dispose();
    super.destroy();
  }
}

// -------------------------------------------------------------
// MOB MANAGER: Spawning, Despawning, Targeting, Drops
// -------------------------------------------------------------
export class MobManager {
  scene: THREE.Scene;
  world: VoxelWorld;
  mobs: BaseMob[] = [];
  particles: MobParticleSystem;

  private spawnTimer: number = 3.0;
  private nextMobId: number = 1;

  constructor(scene: THREE.Scene, world: VoxelWorld) {
    this.scene = scene;
    this.world = world;
    this.particles = new MobParticleSystem(scene);
  }

  spawnMob(type: MobType, pos: THREE.Vector3): BaseMob {
    let mob: BaseMob;
    const id = `mob_${type}_${this.nextMobId++}`;
    if (type === 'sheep') {
      mob = new SheepMob(id, pos);
    } else if (type === 'cow') {
      mob = new CowMob(id, pos);
    } else if (type === 'pig') {
      mob = new PigMob(id, pos);
    } else if (type === 'chicken') {
      mob = new ChickenMob(id, pos);
    } else if (type === 'polar_bear') {
      mob = new PolarBearMob(id, pos);
    } else if (type === 'creeper') {
      mob = new CreeperMob(id, pos);
    } else {
      mob = new ZombieMob(id, pos);
    }

    this.mobs.push(mob);
    this.scene.add(mob.group);
    return mob;
  }

  update(
    dt: number,
    playerPos: THREE.Vector3,
    isDay: boolean,
    difficulty: GameDifficulty,
    gameMode: GameMode,
    onPlayerDamage: (damage: number) => void,
    inventory: InventorySystem
  ) {
    this.particles.update(dt);

    // 1. Spawning cycle (every ~4 seconds)
    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0) {
      this.spawnTimer = 3.6 + Math.random() * 1.8;
      this.trySpawnMobs(playerPos, isDay, difficulty);
    }

    // 2. Update and handle each mob
    for (let i = this.mobs.length - 1; i >= 0; i--) {
      const mob = this.mobs[i];

      // Burning particle emitter for zombies in daylight
      if (mob instanceof ZombieMob && mob.isBurning && Math.random() < 0.4) {
        this.particles.spawnFireParticle(mob.position);
      }

      mob.updateAI(
        dt,
        this.world,
        playerPos,
        isDay,
        difficulty,
        (damage) => {
          if (gameMode !== 'creative') {
            onPlayerDamage(damage);
          }
        }
      );

      // Despawn if fallen out of world or wandered too far (> 60 blocks)
      const dist = mob.position.distanceTo(playerPos);
      if (mob.position.y < -10 || dist > 68) {
        this.removeMob(i);
        continue;
      }

      // Handle Death
      if (mob.isDead) {
        if (mob instanceof CreeperMob && mob.hasExploded) {
          this.particles.spawnExplosionEffect(mob.position);
        } else {
          this.particles.spawnDeathPuff(mob.position);
        }

        // Grant item drops
        if (mob.type === 'sheep') {
          inventory.addItem(ITEM_TYPES.RAW_MUTTON, 1 + Math.floor(Math.random() * 2));
          inventory.addItem(BLOCK_TYPES.WHITE_TERRACOTTA, 1); // Wool
        } else if (mob.type === 'cow') {
          inventory.addItem(ITEM_TYPES.RAW_BEEF, 1 + Math.floor(Math.random() * 3));
          if (Math.random() < 0.65) inventory.addItem(ITEM_TYPES.LEATHER, 1);
        } else if (mob.type === 'pig') {
          inventory.addItem(ITEM_TYPES.RAW_PORKCHOP, 1 + Math.floor(Math.random() * 3));
        } else if (mob.type === 'chicken') {
          inventory.addItem(ITEM_TYPES.RAW_CHICKEN, 1);
          inventory.addItem(ITEM_TYPES.FEATHER, 1 + Math.floor(Math.random() * 2));
        } else if (mob.type === 'polar_bear') {
          inventory.addItem(ITEM_TYPES.RAW_BEEF, 2 + Math.floor(Math.random() * 2));
        } else if (mob.type === 'zombie') {
          // Drop coal or rare iron ingot!
          if (Math.random() < 0.35) {
            inventory.addItem(ITEM_TYPES.IRON_INGOT, 1);
          } else {
            inventory.addItem(ITEM_TYPES.COAL, 2);
          }
        } else if (mob.type === 'creeper') {
          // Drop gunpowder (coal fuel) if defeated before detonating
          if (!((mob as CreeperMob).hasExploded)) {
            inventory.addItem(ITEM_TYPES.COAL, 2 + Math.floor(Math.random() * 3));
          }
        }

        this.removeMob(i);
      }
    }
  }

  private trySpawnMobs(playerPos: THREE.Vector3, isDay: boolean, difficulty: GameDifficulty) {
    const passiveCount = this.mobs.filter((m) => m.type !== 'zombie' && m.type !== 'creeper').length;
    const hostileCount = this.mobs.filter((m) => m.type === 'zombie' || m.type === 'creeper').length;

    const maxPassive = 10;
    const maxHostiles = difficulty === 'peaceful' ? 0 : difficulty === 'hard' ? 8 : difficulty === 'normal' ? 6 : 4;

    // Spawn Passive Animals
    if (passiveCount < maxPassive && Math.random() < 0.75) {
      const pos = this.findValidSpawnPos(playerPos, 14, 38);
      if (pos) {
        const surfBlock = this.world.getBlock(Math.floor(pos.x), Math.floor(pos.y - 1), Math.floor(pos.z));
        if (surfBlock === BLOCK_TYPES.SNOW || surfBlock === BLOCK_TYPES.ICE) {
          const snowTypes: MobType[] = ['polar_bear', 'sheep', 'chicken'];
          const chosen = snowTypes[Math.floor(Math.random() * snowTypes.length)];
          this.spawnMob(chosen, pos);
        } else {
          const farmTypes: MobType[] = ['cow', 'pig', 'sheep', 'chicken'];
          const chosen = farmTypes[Math.floor(Math.random() * farmTypes.length)];
          this.spawnMob(chosen, pos);
        }
      }
    }

    // Spawn Hostile Mobs (Zombies and Creepers at night or in darkness)
    if (difficulty !== 'peaceful' && hostileCount < maxHostiles) {
      const chance = !isDay ? 0.85 : 0.25;
      if (Math.random() < chance) {
        const pos = this.findValidSpawnPos(playerPos, 18, 42);
        if (pos) {
          const hostileType: MobType = Math.random() < 0.4 ? 'creeper' : 'zombie';
          this.spawnMob(hostileType, pos);
        }
      }
    }
  }

  private findValidSpawnPos(origin: THREE.Vector3, minRadius: number, maxRadius: number): THREE.Vector3 | null {
    for (let attempts = 0; attempts < 8; attempts++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = minRadius + Math.random() * (maxRadius - minRadius);
      const x = Math.floor(origin.x + Math.cos(angle) * dist);
      const z = Math.floor(origin.z + Math.sin(angle) * dist);

      const y = this.world.getHighestSolidBlock(x, z);
      if (y > 2 && y < 50) {
        const block = this.world.getBlock(x, y - 1, z);
        // Valid surface (grass, dirt, sand, stone) and air above
        if (block !== BLOCK_TYPES.AIR && block !== BLOCK_TYPES.WATER) {
          return new THREE.Vector3(x + 0.5, y + 0.1, z + 0.5);
        }
      }
    }
    return null;
  }

  // Raycast attack against mobs
  hitMobWithRay(
    rayOrigin: THREE.Vector3,
    rayDirection: THREE.Vector3,
    maxDistance: number,
    damage: number
  ): boolean {
    let closestMob: BaseMob | null = null;
    let closestDist = maxDistance;

    const mobRay = new THREE.Ray(rayOrigin, rayDirection);

    for (const mob of this.mobs) {
      if (mob.isDead) continue;
      const box = new THREE.Box3(
        new THREE.Vector3(mob.position.x - mob.width * 0.5, mob.position.y, mob.position.z - mob.width * 0.5),
        new THREE.Vector3(mob.position.x + mob.width * 0.5, mob.position.y + mob.height, mob.position.z + mob.width * 0.5)
      );

      const hitPoint = new THREE.Vector3();
      if (mobRay.intersectBox(box, hitPoint)) {
        const dist = rayOrigin.distanceTo(hitPoint);
        if (dist < closestDist) {
          closestDist = dist;
          closestMob = mob;
        }
      }
    }

    if (closestMob) {
      closestMob.takeDamage(damage, rayDirection);
      this.particles.spawnHitSparks(closestMob.position);
      return true;
    }
    return false;
  }

  private removeMob(index: number) {
    const mob = this.mobs[index];
    mob.destroy();
    this.mobs.splice(index, 1);
  }

  destroy() {
    for (const mob of this.mobs) {
      mob.destroy();
    }
    this.mobs = [];
    this.particles.destroy();
  }
}
