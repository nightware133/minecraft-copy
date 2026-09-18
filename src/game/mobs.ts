import * as THREE from 'three';
import { VoxelWorld, BLOCK_TYPES } from './world';
import { ITEM_TYPES, InventorySystem } from './inventory';
import { sounds } from './audio';

export type MobType = 'sheep' | 'zombie';

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

// Cached textures for sheep and zombie to optimize performance
let sheepHeadTex: THREE.CanvasTexture | null = null;
let sheepWoolTex: THREE.CanvasTexture | null = null;
let sheepLegTex: THREE.CanvasTexture | null = null;

let zombieHeadTex: THREE.CanvasTexture | null = null;
let zombieSkinTex: THREE.CanvasTexture | null = null;
let zombieShirtTex: THREE.CanvasTexture | null = null;
let zombiePantsTex: THREE.CanvasTexture | null = null;

function getSheepTextures() {
  if (!sheepHeadTex) {
    // Sheep face
    sheepHeadTex = createPixelTexture(8, 8, (ctx) => {
      ctx.fillStyle = '#e8e5dc'; // Wool top
      ctx.fillRect(0, 0, 8, 2);
      ctx.fillStyle = '#dcd4c5'; // Face base
      ctx.fillRect(0, 2, 8, 6);
      // Eyes
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 3, 2, 1);
      ctx.fillRect(6, 3, 2, 1);
      ctx.fillStyle = '#1c1b18';
      ctx.fillRect(1, 3, 1, 1);
      ctx.fillRect(6, 3, 1, 1);
      // Pink muzzle
      ctx.fillStyle = '#f0b0b8';
      ctx.fillRect(3, 5, 2, 2);
      ctx.fillStyle = '#cf8692';
      ctx.fillRect(3, 6, 2, 1);
    });

    // Fluffy wool body texture
    sheepWoolTex = createPixelTexture(8, 8, (ctx) => {
      ctx.fillStyle = '#f2f0e8';
      ctx.fillRect(0, 0, 8, 8);
      // Subtle pixel wool shading
      ctx.fillStyle = '#dedbd0';
      ctx.fillRect(1, 1, 2, 2);
      ctx.fillRect(5, 2, 2, 2);
      ctx.fillRect(2, 5, 2, 2);
      ctx.fillStyle = '#c7c2b5';
      ctx.fillRect(2, 2, 1, 1);
      ctx.fillRect(6, 3, 1, 1);
      ctx.fillRect(3, 6, 1, 1);
    });

    // Legs
    sheepLegTex = createPixelTexture(4, 4, (ctx) => {
      ctx.fillStyle = '#cfc7b4';
      ctx.fillRect(0, 0, 4, 3);
      ctx.fillStyle = '#6b6354'; // Hooves
      ctx.fillRect(0, 3, 4, 1);
    });
  }
  return { head: sheepHeadTex, wool: sheepWoolTex, leg: sheepLegTex };
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

// Particle emitter for mob hit and death puffs
export class MobParticleSystem {
  group: THREE.Group;
  particles: { mesh: THREE.Mesh; vel: THREE.Vector3; life: number; maxLife: number }[] = [];

  constructor(scene: THREE.Scene) {
    this.group = new THREE.Group();
    scene.add(this.group);
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
    this.group.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
        if (Array.isArray(child.material)) {
          child.material.forEach((m) => m.dispose());
        } else {
          child.material.dispose();
        }
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

    // 2. Head with face
    const headMaterials = [
      woolMat, woolMat, woolMat, woolMat,
      woolMat, // Back
      headFaceMat, // Front Face
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

    // 1. Head
    const headMaterials = [
      skinMat, skinMat, skinMat, skinMat,
      skinMat, // Back
      headFaceMat, // Front Face
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
      this.spawnTimer = 3.8 + Math.random() * 2.0;
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
        this.particles.spawnDeathPuff(mob.position);

        // Grant item drops
        if (mob.type === 'sheep') {
          inventory.addItem(BLOCK_TYPES.CORAL_PINK, 1); // Wool block proxy / starter supply
        } else if (mob.type === 'zombie') {
          // Drop rotten flesh or rare iron ingot!
          if (Math.random() < 0.35) {
            inventory.addItem(ITEM_TYPES.IRON_INGOT, 1);
          } else {
            inventory.addItem(ITEM_TYPES.COAL, 2);
          }
        }

        this.removeMob(i);
      }
    }
  }

  private trySpawnMobs(playerPos: THREE.Vector3, isDay: boolean, difficulty: GameDifficulty) {
    const sheepCount = this.mobs.filter((m) => m.type === 'sheep').length;
    const zombieCount = this.mobs.filter((m) => m.type === 'zombie').length;

    const maxSheep = 5;
    const maxZombies = difficulty === 'peaceful' ? 0 : difficulty === 'hard' ? 7 : difficulty === 'normal' ? 5 : 3;

    // Spawn Sheep on sunny grassland
    if (sheepCount < maxSheep && Math.random() < 0.7) {
      const pos = this.findValidSpawnPos(playerPos, 16, 40);
      if (pos) {
        this.spawnMob('sheep', pos);
      }
    }

    // Spawn Zombies (at night or in caves/shade, none in peaceful)
    if (difficulty !== 'peaceful' && zombieCount < maxZombies) {
      // Higher spawn rate at night
      const chance = !isDay ? 0.85 : 0.25;
      if (Math.random() < chance) {
        const pos = this.findValidSpawnPos(playerPos, 18, 42);
        if (pos) {
          this.spawnMob('zombie', pos);
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
