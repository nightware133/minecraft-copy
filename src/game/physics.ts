import * as THREE from 'three';
import { VoxelWorld, BLOCK_TYPES } from './world';
import { GameDifficulty, GameMode } from './mobs';

export class PlayerPhysics {
  world: VoxelWorld;
  position: THREE.Vector3;
  velocity: THREE.Vector3 = new THREE.Vector3();

  // Bounding box size (Standard Minecraft player dimensions)
  radius: number = 0.3;
  height: number = 1.8;
  eyeHeight: number = 1.62;

  onGround: boolean = false;
  inWater: boolean = false;
  isSubmerged: boolean = false; // Eyes underwater (affects breathing/fog)
  isSprinting: boolean = false;

  // Game Mode & Difficulty
  gameMode: GameMode = 'survival';
  difficulty: GameDifficulty = 'normal';
  isFlying: boolean = false;
  private prevKeyF: boolean = false;

  // Vital stats
  health: number = 100;
  maxHealth: number = 100;
  oxygen: number = 100;
  maxOxygen: number = 100;

  // View angles
  yaw: number = 0;
  pitch: number = 0;

  // Take damage with armor damage reduction & difficulty applied
  takeDamage(amount: number) {
    if (this.gameMode === 'creative') return;
    if (this.difficulty === 'peaceful') return;

    let difficultyMultiplier = 1.0;
    if (this.difficulty === 'easy') difficultyMultiplier = 0.65;
    else if (this.difficulty === 'hard') difficultyMultiplier = 1.45;

    const scaledAmount = amount * difficultyMultiplier;
    const finalDamage = Math.max(1, scaledAmount * (1 - this.damageReduction));
    this.health = Math.max(0, this.health - finalDamage);
  }

  // Toggle creative flight
  toggleFlight() {
    if (this.gameMode === 'creative') {
      this.isFlying = !this.isFlying;
      if (this.isFlying) {
        this.onGround = false;
        this.velocity.y = 5.0;
      }
    }
  }

  // Movement & physics constants
  gravity: number = 24.0;
  waterGravity: number = 4.0;
  jumpVelocity: number = 8.4;
  swimVelocity: number = 4.8;
  walkSpeed: number = 5.0;
  sprintSpeed: number = 8.2;
  flySpeed: number = 14.0;
  waterSpeed: number = 3.6;

  // Armor protection: reduces incoming environmental & combat damage (up to 80%)
  damageReduction: number = 0;

  constructor(world: VoxelWorld, initialPosition: THREE.Vector3) {
    this.world = world;
    this.position = initialPosition.clone();
  }

  update(dt: number, keys: Record<string, boolean>) {
    // Prevent physics instability on frame drops or tab unfocus
    const delta = Math.min(dt, 0.04);

    // Toggle Creative flight with 'F' key
    const keyF = !!keys['KeyF'];
    if (keyF && !this.prevKeyF && this.gameMode === 'creative') {
      this.toggleFlight();
    }
    this.prevKeyF = keyF;

    // 1. Water state check
    const feetX = Math.floor(this.position.x);
    const feetY = Math.floor(this.position.y);
    const waistY = Math.floor(this.position.y + 0.85);
    const eyeY = Math.floor(this.position.y + this.eyeHeight);
    const feetZ = Math.floor(this.position.z);

    const feetInWater = this.world.getBlock(feetX, feetY, feetZ) === BLOCK_TYPES.WATER;
    const waistInWater = this.world.getBlock(feetX, waistY, feetZ) === BLOCK_TYPES.WATER;
    const headInWater = this.world.getBlock(feetX, eyeY, feetZ) === BLOCK_TYPES.WATER;

    this.inWater = feetInWater || waistInWater || headInWater;
    this.isSubmerged = headInWater;

    // 2. Breathing & Health mechanics
    if (this.gameMode === 'creative') {
      this.health = 100;
      this.oxygen = 100;
    } else if (this.isSubmerged) {
      this.oxygen = Math.max(0, this.oxygen - 12.0 * delta);
      if (this.oxygen <= 0) {
        // Drowning damage
        this.health = Math.max(0, this.health - 16.0 * delta);
      }
    } else {
      // Oxygen rapidly replenishes above water
      this.oxygen = Math.min(this.maxOxygen, this.oxygen + 35.0 * delta);
      // Health regenerates (much faster in Peaceful mode)
      const regenRate = this.difficulty === 'peaceful' ? 25.0 : 4.0;
      if (this.health < this.maxHealth) {
        this.health = Math.min(this.maxHealth, this.health + regenRate * delta);
      }
    }

    // 3. Movement direction vectors based on camera yaw
    const forward = new THREE.Vector3(
      -Math.sin(this.yaw),
      0,
      -Math.cos(this.yaw)
    ).normalize();
    const right = new THREE.Vector3(
      Math.cos(this.yaw),
      0,
      -Math.sin(this.yaw)
    ).normalize();

    const moveDir = new THREE.Vector3();
    if (keys['KeyW'] || keys['ArrowUp']) moveDir.add(forward);
    if (keys['KeyS'] || keys['ArrowDown']) moveDir.sub(forward);
    if (keys['KeyD'] || keys['ArrowRight']) moveDir.add(right);
    if (keys['KeyA'] || keys['ArrowLeft']) moveDir.sub(right);

    if (moveDir.lengthSq() > 0.0001) {
      moveDir.normalize();
    }

    // 4. Physics handling (Creative Flight vs Water Swimming vs Ground Walking/Jumping)
    if (this.gameMode === 'creative' && this.isFlying) {
      const speed = this.flySpeed;
      if (moveDir.lengthSq() > 0) {
        this.velocity.x = moveDir.x * speed;
        this.velocity.z = moveDir.z * speed;
      } else {
        this.velocity.x *= Math.pow(0.3, delta * 20);
        this.velocity.z *= Math.pow(0.3, delta * 20);
      }

      if (keys['Space']) {
        this.velocity.y = 10.0;
      } else if (keys['ShiftLeft'] || keys['ShiftRight']) {
        this.velocity.y = -10.0;
      } else {
        this.velocity.y *= Math.pow(0.2, delta * 20);
      }
    } else if (this.inWater) {
      const swimSpd = this.waterSpeed;
      if (moveDir.lengthSq() > 0) {
        this.velocity.x = moveDir.x * swimSpd;
        this.velocity.z = moveDir.z * swimSpd;
      } else {
        this.velocity.x *= Math.pow(0.4, delta * 20);
        this.velocity.z *= Math.pow(0.4, delta * 20);
      }

      // Swim upwards or dive downwards
      if (keys['Space']) {
        // If feet are touching solid ground or near surface, allow leaping out onto land
        if (this.onGround) {
          this.velocity.y = this.jumpVelocity;
          this.onGround = false;
        } else {
          this.velocity.y = this.swimVelocity;
        }
      } else if (keys['ShiftLeft'] || keys['ShiftRight']) {
        this.velocity.y = -this.swimVelocity;
      } else {
        // Gentle sinking in water
        this.velocity.y -= this.waterGravity * delta;
        if (this.velocity.y < -3.0) this.velocity.y = -3.0;
        this.velocity.y *= Math.pow(0.5, delta * 15);
      }
    } else {
      // Land / Air physics
      this.isSprinting = !!(keys['ShiftLeft'] || keys['ShiftRight']);
      const isSprinting = this.isSprinting;
      const speed = isSprinting ? this.sprintSpeed : this.walkSpeed;

      if (this.onGround) {
        if (moveDir.lengthSq() > 0) {
          this.velocity.x = moveDir.x * speed;
          this.velocity.z = moveDir.z * speed;
        } else {
          this.velocity.x *= Math.pow(0.55, delta * 30);
          this.velocity.z *= Math.pow(0.55, delta * 30);
        }

        if (keys['Space']) {
          this.velocity.y = this.jumpVelocity;
          this.onGround = false;
        }
      } else {
        // Air control
        if (moveDir.lengthSq() > 0) {
          this.velocity.x += moveDir.x * speed * delta * 4.5;
          this.velocity.z += moveDir.z * speed * delta * 4.5;
        }
        this.velocity.x *= Math.pow(0.96, delta * 20);
        this.velocity.z *= Math.pow(0.96, delta * 20);

        this.velocity.y -= this.gravity * delta;
        if (this.velocity.y < -32) this.velocity.y = -32;
      }
    }

    // 5. High-Precision AABB Collision Resolution (Swept Vertical & Sliding Horizontal + Step-Up)
    this.resolveCollision(delta);

    // Fall below world safeguard / respawn on top of solid terrain
    if (this.position.y < -6) {
      const curX = Math.floor(this.position.x);
      const curZ = Math.floor(this.position.z);
      const topY = this.world.getHighestSolidBlock(curX, curZ);
      this.position.set(curX + 0.5, topY + 1.5, curZ + 0.5);
      this.velocity.set(0, 0, 0);
      this.onGround = true;
      this.health = 100;
      this.oxygen = 100;
    }
  }

  // Tests if an AABB at (px, py, pz) collides with any solid block
  private collidesAt(px: number, py: number, pz: number): boolean {
    const r = this.radius;
    const h = this.height;
    const eps = 0.005;

    const minX = Math.floor(px - r + eps);
    const maxX = Math.floor(px + r - eps);
    const minY = Math.floor(py + eps);
    const maxY = Math.floor(py + h - eps);
    const minZ = Math.floor(pz - r + eps);
    const maxZ = Math.floor(pz + r - eps);

    for (let x = minX; x <= maxX; x++) {
      for (let y = minY; y <= maxY; y++) {
        for (let z = minZ; z <= maxZ; z++) {
          if (this.world.isSolid(x, y, z)) {
            return true;
          }
        }
      }
    }
    return false;
  }

  private resolveCollision(delta: number) {
    const r = this.radius;
    const h = this.height;
    const eps = 0.005;

    // ==========================================
    // STEP 1: RESOLVE Y AXIS (Vertical Sweeping)
    // ==========================================
    const dy = this.velocity.y * delta;
    if (Math.abs(dy) > 0.00001) {
      if (dy < 0) {
        // Moving Downwards (Falling)
        const targetY = this.position.y + dy;
        const x0 = Math.floor(this.position.x - r + eps);
        const x1 = Math.floor(this.position.x + r - eps);
        const z0 = Math.floor(this.position.z - r + eps);
        const z1 = Math.floor(this.position.z + r - eps);

        const checkYStart = Math.floor(this.position.y);
        const checkYEnd = Math.floor(targetY);

        let highestFloor = -Infinity;
        for (let y = checkYStart; y >= checkYEnd; y--) {
          for (let x = x0; x <= x1; x++) {
            for (let z = z0; z <= z1; z++) {
              if (this.world.isSolid(x, y, z)) {
                const blockTop = y + 1.0;
                if (blockTop <= this.position.y + 0.05 && blockTop > highestFloor) {
                  highestFloor = blockTop;
                }
              }
            }
          }
        }

        if (highestFloor !== -Infinity && targetY <= highestFloor) {
          const fallSpeed = -this.velocity.y;
          if (fallSpeed > 16) {
            const rawDmg = (fallSpeed - 16) * 3.2;
            this.takeDamage(rawDmg);
          }
          this.position.y = highestFloor;
          this.velocity.y = 0;
          this.onGround = true;
        } else {
          this.position.y = targetY;
          this.onGround = false;
        }
      } else {
        // Moving Upwards (Jumping) - ONLY check blocks directly above head!
        const targetY = this.position.y + dy;
        const x0 = Math.floor(this.position.x - r + eps);
        const x1 = Math.floor(this.position.x + r - eps);
        const z0 = Math.floor(this.position.z - r + eps);
        const z1 = Math.floor(this.position.z + r - eps);

        const checkYStart = Math.floor(this.position.y + h);
        const checkYEnd = Math.floor(targetY + h);

        let lowestCeiling = Infinity;
        for (let y = checkYStart; y <= checkYEnd; y++) {
          for (let x = x0; x <= x1; x++) {
            for (let z = z0; z <= z1; z++) {
              if (this.world.isSolid(x, y, z)) {
                const blockBottom = y;
                if (blockBottom >= this.position.y + h - 0.05 && blockBottom < lowestCeiling) {
                  lowestCeiling = blockBottom;
                }
              }
            }
          }
        }

        if (lowestCeiling !== Infinity && targetY + h >= lowestCeiling) {
          this.position.y = lowestCeiling - h - 0.0001;
          this.velocity.y = 0;
        } else {
          this.position.y = targetY;
        }
        this.onGround = false;
      }
    } else {
      // Check if still standing on ground
      const groundCheckY = this.position.y - 0.05;
      const x0 = Math.floor(this.position.x - r + eps);
      const x1 = Math.floor(this.position.x + r - eps);
      const z0 = Math.floor(this.position.z - r + eps);
      const z1 = Math.floor(this.position.z + r - eps);
      let foundGround = false;
      for (let x = x0; x <= x1; x++) {
        for (let z = z0; z <= z1; z++) {
          if (this.world.isSolid(x, Math.floor(groundCheckY), z)) {
            foundGround = true;
            break;
          }
        }
        if (foundGround) break;
      }
      this.onGround = foundGround;
    }

    // ==========================================================
    // STEP 2: RESOLVE HORIZONTAL MOVEMENT WITH AUTO STEP-UP
    // ==========================================================
    const intendedDx = this.velocity.x * delta;
    const intendedDz = this.velocity.z * delta;

    if (Math.abs(intendedDx) < 0.00001 && Math.abs(intendedDz) < 0.00001) {
      return;
    }

    // Attempt 1: Normal flat movement
    const flatResult = this.moveHorizontal(this.position.x, this.position.y, this.position.z, intendedDx, intendedDz);

    // If on ground and horizontal progress was blocked by an obstacle, test smooth step-up (max 0.55 block)
    const distFlatSq = (flatResult.x - this.position.x) ** 2 + (flatResult.z - this.position.z) ** 2;
    const distIntendedSq = intendedDx * intendedDx + intendedDz * intendedDz;

    if (this.onGround && distFlatSq < distIntendedSq - 0.0001) {
      // Step-up test: Check if gentle incline (up to 0.55 block) allows moving forward smoothly
      const stepHeight = 0.55;
      const raisedY = this.position.y + stepHeight;

      if (!this.collidesAt(this.position.x, raisedY, this.position.z)) {
        // Move horizontally at the raised height
        const stepMove = this.moveHorizontal(this.position.x, raisedY, this.position.z, intendedDx, intendedDz);

        // Now cast downward to find where the feet land on the stepped block
        let stepLandingY = raisedY;
        const x0 = Math.floor(stepMove.x - r + eps);
        const x1 = Math.floor(stepMove.x + r - eps);
        const z0 = Math.floor(stepMove.z - r + eps);
        const z1 = Math.floor(stepMove.z + r - eps);

        let maxStepFloor = -Infinity;
        const startYScan = Math.floor(raisedY);
        const endYScan = Math.floor(this.position.y);

        for (let y = startYScan; y >= endYScan; y--) {
          for (let x = x0; x <= x1; x++) {
            for (let z = z0; z <= z1; z++) {
              if (this.world.isSolid(x, y, z)) {
                const blockTop = y + 1.0;
                if (blockTop <= raisedY && blockTop > maxStepFloor) {
                  maxStepFloor = blockTop;
                }
              }
            }
          }
        }

        if (maxStepFloor !== -Infinity && maxStepFloor >= this.position.y - 0.01 && maxStepFloor - this.position.y <= stepHeight) {
          stepLandingY = maxStepFloor;

          // Verify player fits at (stepMove.x, stepLandingY, stepMove.z)
          if (!this.collidesAt(stepMove.x, stepLandingY, stepMove.z)) {
            const distStepSq = (stepMove.x - this.position.x) ** 2 + (stepMove.z - this.position.z) ** 2;
            if (distStepSq > distFlatSq + 0.0001) {
              // Smooth step-up succeeded cleanly without flinging
              this.position.x = stepMove.x;
              this.position.y = stepLandingY;
              this.position.z = stepMove.z;
              this.onGround = true;
              return;
            }
          }
        }
      }
    }

    // Apply flat movement result
    this.position.x = flatResult.x;
    this.position.z = flatResult.z;
    if (flatResult.stoppedX) this.velocity.x = 0;
    if (flatResult.stoppedZ) this.velocity.z = 0;
  }

  // Moves horizontally along X and Z axes, sliding along walls
  private moveHorizontal(startX: number, startY: number, startZ: number, dx: number, dz: number) {
    let curX = startX;
    let curZ = startZ;
    let stoppedX = false;
    let stoppedZ = false;
    const r = this.radius;
    const h = this.height;
    const eps = 0.005;

    // --- Move X Axis ---
    if (Math.abs(dx) > 0.00001) {
      const targetX = curX + dx;
      const y0 = Math.floor(startY + eps);
      const y1 = Math.floor(startY + h - eps);
      const z0 = Math.floor(curZ - r + eps);
      const z1 = Math.floor(curZ + r - eps);

      if (dx > 0) {
        // Moving +X
        const xStart = Math.floor(curX + r);
        const xEnd = Math.floor(targetX + r);
        let minWallX = Infinity;

        for (let x = xStart; x <= xEnd; x++) {
          for (let y = y0; y <= y1; y++) {
            for (let z = z0; z <= z1; z++) {
              if (this.world.isSolid(x, y, z)) {
                if (x < minWallX) minWallX = x;
              }
            }
          }
        }

        if (minWallX !== Infinity && targetX + r >= minWallX) {
          curX = minWallX - r - 0.0001;
          stoppedX = true;
        } else {
          curX = targetX;
        }
      } else {
        // Moving -X
        const xStart = Math.floor(curX - r);
        const xEnd = Math.floor(targetX - r);
        let maxWallX = -Infinity;

        for (let x = xStart; x >= xEnd; x--) {
          for (let y = y0; y <= y1; y++) {
            for (let z = z0; z <= z1; z++) {
              if (this.world.isSolid(x, y, z)) {
                const wallRight = x + 1.0;
                if (wallRight > maxWallX) maxWallX = wallRight;
              }
            }
          }
        }

        if (maxWallX !== -Infinity && targetX - r <= maxWallX) {
          curX = maxWallX + r + 0.0001;
          stoppedX = true;
        } else {
          curX = targetX;
        }
      }
    }

    // --- Move Z Axis ---
    if (Math.abs(dz) > 0.00001) {
      const targetZ = curZ + dz;
      const y0 = Math.floor(startY + eps);
      const y1 = Math.floor(startY + h - eps);
      const x0 = Math.floor(curX - r + eps);
      const x1 = Math.floor(curX + r - eps);

      if (dz > 0) {
        // Moving +Z
        const zStart = Math.floor(curZ + r);
        const zEnd = Math.floor(targetZ + r);
        let minWallZ = Infinity;

        for (let z = zStart; z <= zEnd; z++) {
          for (let y = y0; y <= y1; y++) {
            for (let x = x0; x <= x1; x++) {
              if (this.world.isSolid(x, y, z)) {
                if (z < minWallZ) minWallZ = z;
              }
            }
          }
        }

        if (minWallZ !== Infinity && targetZ + r >= minWallZ) {
          curZ = minWallZ - r - 0.0001;
          stoppedZ = true;
        } else {
          curZ = targetZ;
        }
      } else {
        // Moving -Z
        const zStart = Math.floor(curZ - r);
        const zEnd = Math.floor(targetZ - r);
        let maxWallZ = -Infinity;

        for (let z = zStart; z >= zEnd; z--) {
          for (let y = y0; y <= y1; y++) {
            for (let x = x0; x <= x1; x++) {
              if (this.world.isSolid(x, y, z)) {
                const wallBack = z + 1.0;
                if (wallBack > maxWallZ) maxWallZ = wallBack;
              }
            }
          }
        }

        if (maxWallZ !== -Infinity && targetZ - r <= maxWallZ) {
          curZ = maxWallZ + r + 0.0001;
          stoppedZ = true;
        } else {
          curZ = targetZ;
        }
      }
    }

    return { x: curX, z: curZ, stoppedX, stoppedZ };
  }
}
