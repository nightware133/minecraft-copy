import * as THREE from 'three';
import { generateProceduralBlockTextures, BlockTextureAtlas } from './textures';
import { VoxelWorld, BLOCK_TYPES, WORLD_HEIGHT, SEA_LEVEL } from './world';
import { PlayerPhysics } from './physics';
import { InventorySystem, ITEM_TYPES, ARMOR_DATA } from './inventory';
import { SteveCharacter, FirstPersonViewModel, createHeldItemMesh } from './playerModel';
import { BlockBreakOverlay } from './breakOverlay';
import { sounds } from './audio';
import { WeatherSystem, WeatherType, WeatherEnvironmentMod } from './weather';
import { MobManager, MobType, GameDifficulty, GameMode } from './mobs';

export interface EngineStats {
  fps: number;
  x: number;
  y: number;
  z: number;
  timeOfDay: string;
  isNight: boolean;
  selectedBlockId: number | null;
  isLocked: boolean;
  health: number;
  oxygen: number;
  isSubmerged: boolean;
  inWater: boolean;
  perspectiveMode: number;
  miningProgress: number;
  weather: WeatherType;
  armorDefense: number;
  gameMode: GameMode;
  difficulty: GameDifficulty;
  isFlying: boolean;
}

interface Particle {
  mesh: THREE.Mesh;
  velocity: THREE.Vector3;
  life: number;
  maxLife: number;
}

export class VoxelGameEngine {
  container: HTMLElement;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;

  atlas: BlockTextureAtlas;
  world: VoxelWorld;
  physics: PlayerPhysics;
  inventory: InventorySystem;
  weather: WeatherSystem;
  mobs: MobManager;

  steve: SteveCharacter;
  viewModel: FirstPersonViewModel;
  perspectiveMode: number = 0; // 0: 1st person, 1: 3rd person back, 2: 3rd person front
  inPanoramaMode: boolean = false;
  lastHeldItemId: number = -1;

  ambientLight: THREE.AmbientLight;
  hemiLight: THREE.HemisphereLight;
  sunLight: THREE.DirectionalLight;
  sunMesh: THREE.Mesh;
  moonMesh: THREE.Mesh;

  raycaster: THREE.Raycaster;
  wireframeBox: THREE.LineSegments;
  breakOverlay: BlockBreakOverlay;
  targetBlock: { x: number; y: number; z: number; norm: THREE.Vector3 } | null = null;

  // Progressive Mining & Durability
  isMining: boolean = false;
  miningProgress: number = 0; // 0.0 to 1.0
  miningBlock: { x: number; y: number; z: number } | null = null;
  miningSwingTimer: number = 0;

  particles: Particle[] = [];
  keys: Record<string, boolean> = {};

  timeOfDay: number = 0.25; // 0 to 1
  isLocked: boolean = false;
  isMouseDown: boolean = false;
  lastMouseX: number = 0;
  lastMouseY: number = 0;
  pointerLockBlocked: boolean = false;

  onStatsUpdate?: (stats: EngineStats) => void;
  isRunning: boolean = true;
  lastTime: number = 0;
  frameCount: number = 0;
  fpsTimer: number = 0;
  currentFps: number = 60;

  boundOnMouseMove: (e: MouseEvent) => void;
  boundOnMouseDown: (e: MouseEvent) => void;
  boundOnMouseUp: (e: MouseEvent) => void;
  boundOnKeyDown: (e: KeyboardEvent) => void;
  boundOnKeyUp: (e: KeyboardEvent) => void;
  boundOnWheel: (e: WheelEvent) => void;
  boundOnResize: () => void;
  boundOnPointerLockChange: () => void;

  constructor(container: HTMLElement, onStatsUpdate?: (stats: EngineStats) => void) {
    this.container = container;
    this.onStatsUpdate = onStatsUpdate;

    // 1. Scene & Camera
    this.scene = new THREE.Scene();
    const skyDay = new THREE.Color(0x78a7ff);
    this.scene.background = skyDay;
    this.scene.fog = new THREE.FogExp2(skyDay, 0.016);

    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      300
    );
    this.scene.add(this.camera);

    // 2. WebGL Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = false;
    this.container.appendChild(this.renderer.domElement);

    // 3. Atlas, World & Inventory
    this.atlas = generateProceduralBlockTextures();
    this.world = new VoxelWorld(this.scene, this.atlas);
    this.inventory = new InventorySystem();
    this.weather = new WeatherSystem(this.scene);

    // 4. Initial Player spawn on terrain & Character Models
    const spawnY = this.world.getHighestSolidBlock(0, 0) + 1.2;
    this.physics = new PlayerPhysics(this.world, new THREE.Vector3(0.5, spawnY, 0.5));

    // Steve 3D Character Model (for 3rd person)
    this.steve = new SteveCharacter();
    this.steve.group.visible = false;
    this.scene.add(this.steve.group);

    // First-Person View Model (Arm + Held Tools/Blocks on bottom right)
    this.viewModel = new FirstPersonViewModel();
    this.camera.add(this.viewModel.root);

    // 5. Lighting & Celestial Orbs
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.45);
    this.scene.add(this.ambientLight);

    this.hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.35);
    this.scene.add(this.hemiLight);

    this.sunLight = new THREE.DirectionalLight(0xfffaed, 1.2);
    this.sunLight.position.set(30, 50, 20);
    this.scene.add(this.sunLight);
    this.scene.add(this.sunLight.target);

    const sunGeo = new THREE.PlaneGeometry(24, 24);
    const sunMat = new THREE.MeshBasicMaterial({ color: 0xfff3a8, side: THREE.DoubleSide });
    this.sunMesh = new THREE.Mesh(sunGeo, sunMat);
    this.scene.add(this.sunMesh);

    const moonGeo = new THREE.PlaneGeometry(20, 20);
    const moonMat = new THREE.MeshBasicMaterial({ color: 0xe6edf8, side: THREE.DoubleSide });
    this.moonMesh = new THREE.Mesh(moonGeo, moonMat);
    this.scene.add(this.moonMesh);

    // 6. Targeting Raycaster & Wireframe highlight
    this.raycaster = new THREE.Raycaster();
    this.raycaster.far = 5.5;

    const boxGeo = new THREE.EdgesGeometry(new THREE.BoxGeometry(1.004, 1.004, 1.004));
    const boxMat = new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 2 });
    this.wireframeBox = new THREE.LineSegments(boxGeo, boxMat);
    this.wireframeBox.visible = false;
    this.scene.add(this.wireframeBox);

    this.breakOverlay = new BlockBreakOverlay(this.scene);
    this.mobs = new MobManager(this.scene, this.world);

    // 7. Event listeners
    this.boundOnMouseMove = this.onMouseMove.bind(this);
    this.boundOnMouseDown = this.onMouseDown.bind(this);
    this.boundOnMouseUp = this.onMouseUp.bind(this);
    this.boundOnKeyDown = this.onKeyDown.bind(this);
    this.boundOnKeyUp = this.onKeyUp.bind(this);
    this.boundOnWheel = this.onWheel.bind(this);
    this.boundOnResize = this.onResize.bind(this);
    this.boundOnPointerLockChange = this.onPointerLockChange.bind(this);

    this.attachEvents();

    // 8. Start Loop immediately
    this.lastTime = performance.now();
    this.animate();
  }

  private attachEvents() {
    this.renderer.domElement.addEventListener('click', () => {
      if (!this.isLocked) {
        try {
          const promise = this.renderer.domElement.requestPointerLock();
          if (promise && promise.catch) {
            promise.catch(() => {
              this.pointerLockBlocked = true;
            });
          }
        } catch {
          this.pointerLockBlocked = true;
        }
      }
    });

    document.addEventListener('pointerlockchange', this.boundOnPointerLockChange);
    window.addEventListener('mousemove', this.boundOnMouseMove);
    this.renderer.domElement.addEventListener('mousedown', this.boundOnMouseDown);
    window.addEventListener('mouseup', this.boundOnMouseUp);
    this.renderer.domElement.addEventListener('contextmenu', (e) => e.preventDefault());
    window.addEventListener('keydown', this.boundOnKeyDown);
    window.addEventListener('keyup', this.boundOnKeyUp);
    window.addEventListener('wheel', this.boundOnWheel, { passive: false });
    window.addEventListener('resize', this.boundOnResize);
  }

  private onPointerLockChange() {
    this.isLocked = document.pointerLockElement === this.renderer.domElement;
  }

  private onMouseMove(e: MouseEvent) {
    const sensitivity = 0.0024;
    if (this.isLocked) {
      this.physics.yaw -= e.movementX * sensitivity;
      this.physics.pitch -= e.movementY * sensitivity;
      this.physics.pitch = Math.max(-Math.PI / 2 + 0.05, Math.min(Math.PI / 2 - 0.05, this.physics.pitch));
    } else if (this.isMouseDown && this.pointerLockBlocked) {
      const dx = e.clientX - this.lastMouseX;
      const dy = e.clientY - this.lastMouseY;
      this.physics.yaw -= dx * sensitivity;
      this.physics.pitch -= dy * sensitivity;
      this.physics.pitch = Math.max(-Math.PI / 2 + 0.05, Math.min(Math.PI / 2 - 0.05, this.physics.pitch));
      this.lastMouseX = e.clientX;
      this.lastMouseY = e.clientY;
    }
  }

  private onMouseDown(e: MouseEvent) {
    this.isMouseDown = true;
    this.lastMouseX = e.clientX;
    this.lastMouseY = e.clientY;

    if (e.button === 0) {
      // 1. Raycast combat attack against Mobs
      const rayOrigin = this.camera.position.clone();
      const rayDir = new THREE.Vector3();
      this.camera.getWorldDirection(rayDir);

      const activeSlot = this.inventory.slots[this.inventory.selectedHotbarIndex];
      const activeId = activeSlot ? activeSlot.id : 0;
      let damage = 6;
      if (this.physics.gameMode === 'creative') {
        damage = 999; // 1-hit kill in Creative
      } else if (activeId === ITEM_TYPES.DIAMOND_SWORD) {
        damage = 40;
      } else if (activeId === ITEM_TYPES.IRON_SWORD) {
        damage = 26;
      } else if (activeId === ITEM_TYPES.WOODEN_SWORD) {
        damage = 15;
      } else if (
        activeId === ITEM_TYPES.DIAMOND_PICKAXE ||
        activeId === ITEM_TYPES.IRON_PICKAXE ||
        activeId === ITEM_TYPES.WOODEN_PICKAXE
      ) {
        damage = 12;
      }

      const hitMob = this.mobs.hitMobWithRay(rayOrigin, rayDir, 4.0, damage);
      if (hitMob) {
        this.viewModel.triggerSwing();
        this.steve.triggerSwing();
        return;
      }

      // 2. Creative Mode Instant Block Breaking
      if (this.physics.gameMode === 'creative' && this.targetBlock && this.targetBlock.y > 0) {
        const { x, y, z } = this.targetBlock;
        const blockType = this.world.getBlock(x, y, z);
        if (blockType !== BLOCK_TYPES.BEDROCK && blockType !== BLOCK_TYPES.AIR) {
          this.viewModel.triggerSwing();
          this.steve.triggerSwing();
          this.world.setBlock(x, y, z, BLOCK_TYPES.AIR);
          this.spawnDebris(x, y, z, blockType);
          sounds.playBlockBreak(blockType);
          this.updateTargeting();
          return;
        }
      }

      // Left Click: Begin progressive mining with breaking decal
      this.isMining = true;
      this.viewModel.triggerSwing();
      this.steve.triggerSwing();
      if (this.targetBlock && this.targetBlock.y > 0) {
        sounds.playHit();
      }
    } else if (e.button === 2) {
      // Right Click: Place block from inventory
      e.preventDefault();
      this.viewModel.triggerSwing();
      this.steve.triggerSwing();
      if (this.targetBlock) {
        const selectedBlock = this.inventory.getSelectedBlockId();
        if (selectedBlock) {
          const placeX = this.targetBlock.x + Math.round(this.targetBlock.norm.x);
          const placeY = this.targetBlock.y + Math.round(this.targetBlock.norm.y);
          const placeZ = this.targetBlock.z + Math.round(this.targetBlock.norm.z);

          // Prevent placing inside player bounding box
          const r = this.physics.radius + 0.05;
          const p = this.physics.position;
          const collidesWithPlayer =
            p.x - r < placeX + 1 &&
            p.x + r > placeX &&
            p.y < placeY + 1 &&
            p.y + this.physics.height > placeY &&
            p.z - r < placeZ + 1 &&
            p.z + r > placeZ;

          if (!collidesWithPlayer && placeY >= 0 && placeY < WORLD_HEIGHT) {
            this.world.setBlock(placeX, placeY, placeZ, selectedBlock);
            if (this.physics.gameMode !== 'creative') {
              this.inventory.consumeActiveBlock();
            }
            sounds.playBlockPlace(selectedBlock);
            this.updateTargeting();
          }
        }
      }
    }
  }

  private onMouseUp(e: MouseEvent) {
    this.isMouseDown = false;
    if (e.button === 0) {
      this.isMining = false;
      this.miningProgress = 0;
      this.miningBlock = null;
      this.breakOverlay.hide();
    }
  }

  private onKeyDown(e: KeyboardEvent) {
    this.keys[e.code] = true;
    // 1-6 Hotbar selection
    if (e.code >= 'Digit1' && e.code <= 'Digit6') {
      const slotIndex = parseInt(e.code.replace('Digit', '')) - 1;
      if (this.inventory.selectedHotbarIndex !== slotIndex) {
        this.inventory.selectedHotbarIndex = slotIndex;
        sounds.playSlotSwitch();
      }
    } else if (e.code === 'F5') {
      e.preventDefault();
      this.togglePerspective();
    }
  }

  private onKeyUp(e: KeyboardEvent) {
    this.keys[e.code] = false;
  }

  private onWheel(e: WheelEvent) {
    const prev = this.inventory.selectedHotbarIndex;
    if (e.deltaY > 0) {
      this.inventory.selectedHotbarIndex = (this.inventory.selectedHotbarIndex + 1) % 6;
    } else {
      this.inventory.selectedHotbarIndex = (this.inventory.selectedHotbarIndex - 1 + 6) % 6;
    }
    if (this.inventory.selectedHotbarIndex !== prev) {
      sounds.playSlotSwitch();
    }
  }

  private onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  private updateTargeting() {
    this.raycaster.setFromCamera(new THREE.Vector2(0, 0), this.camera);
    // Only intersect valid, attached chunk meshes with active geometries
    const validMeshes = this.world.chunkMeshes.filter(
      (m) => m && m.parent && m.geometry && m.geometry.attributes && m.geometry.attributes.position
    );
    const intersects = this.raycaster.intersectObjects(validMeshes, false);

    if (intersects.length > 0) {
      const hit = intersects[0];
      const norm = hit.face ? hit.face.normal : new THREE.Vector3(0, 1, 0);

      // Probe slightly inward to get target block
      const probePoint = hit.point.clone().sub(norm.clone().multiplyScalar(0.01));
      const bx = Math.floor(probePoint.x);
      const by = Math.floor(probePoint.y);
      const bz = Math.floor(probePoint.z);

      if (this.world.isSolid(bx, by, bz)) {
        this.targetBlock = { x: bx, y: by, z: bz, norm: norm.clone() };
        this.wireframeBox.position.set(bx + 0.5, by + 0.5, bz + 0.5);
        this.wireframeBox.visible = true;
        return;
      }
    }

    this.targetBlock = null;
    this.wireframeBox.visible = false;
  }

  private spawnDebris(bx: number, by: number, bz: number, blockType: number) {
    let color = 0x866043;
    if (blockType === BLOCK_TYPES.GRASS) color = 0x5c8e32;
    else if (blockType === BLOCK_TYPES.STONE) color = 0x777777;
    else if (blockType === BLOCK_TYPES.WOOD) color = 0x6b5030;
    else if (blockType === BLOCK_TYPES.LEAVES) color = 0x3a7a28;
    else if (blockType === BLOCK_TYPES.BRICK) color = 0xa04030;
    else if (blockType === BLOCK_TYPES.SAND) color = 0xd8c287;
    else if (blockType === BLOCK_TYPES.CORAL_PINK) color = 0xe05688;
    else if (blockType === BLOCK_TYPES.CORAL_CYAN) color = 0x17c0eb;
    else if (blockType === BLOCK_TYPES.CORAL_YELLOW) color = 0xf5cd79;
    else if (blockType === BLOCK_TYPES.WOOD_PLANKS) color = 0xb8860b;
    else if (blockType === BLOCK_TYPES.GLASS) color = 0xd7ebfc;
    else if (blockType === BLOCK_TYPES.COAL_ORE) color = 0x333333;
    else if (blockType === BLOCK_TYPES.IRON_ORE) color = 0xd8af93;
    else if (blockType === BLOCK_TYPES.GOLD_ORE) color = 0xfcee4b;
    else if (blockType === BLOCK_TYPES.DIAMOND_ORE) color = 0x5df5e4;
    else if (blockType === BLOCK_TYPES.BIRCH_WOOD) color = 0xd5d4cb;
    else if (blockType === BLOCK_TYPES.RED_FLOWER) color = 0xdd2222;
    else if (blockType === BLOCK_TYPES.YELLOW_FLOWER) color = 0xffe033;
    else if (blockType === BLOCK_TYPES.SEAWEED) color = 0x228b22;
    else if (blockType === BLOCK_TYPES.TORCH) color = 0xffa500;

    const geo = new THREE.BoxGeometry(0.16, 0.16, 0.16);
    const mat = new THREE.MeshBasicMaterial({ color });

    for (let i = 0; i < 8; i++) {
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(
        bx + 0.3 + Math.random() * 0.4,
        by + 0.3 + Math.random() * 0.4,
        bz + 0.3 + Math.random() * 0.4
      );
      this.scene.add(mesh);

      this.particles.push({
        mesh,
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 4,
          Math.random() * 3 + 1,
          (Math.random() - 0.5) * 4
        ),
        life: 0.6,
        maxLife: 0.6,
      });
    }
  }

  private getBlockHardnessTime(blockType: number): number {
    switch (blockType) {
      case BLOCK_TYPES.LEAVES:
      case BLOCK_TYPES.RED_FLOWER:
      case BLOCK_TYPES.YELLOW_FLOWER:
      case BLOCK_TYPES.SEAWEED:
      case BLOCK_TYPES.TORCH:
        return 0.2;
      case BLOCK_TYPES.GLASS:
        return 0.35;
      case BLOCK_TYPES.DIRT:
      case BLOCK_TYPES.GRASS:
      case BLOCK_TYPES.SAND:
        return 0.65;
      case BLOCK_TYPES.CORAL_PINK:
      case BLOCK_TYPES.CORAL_CYAN:
      case BLOCK_TYPES.CORAL_YELLOW:
        return 0.9;
      case BLOCK_TYPES.WOOD:
      case BLOCK_TYPES.BIRCH_WOOD:
      case BLOCK_TYPES.WOOD_PLANKS:
      case BLOCK_TYPES.CRAFTING_TABLE:
        return 1.6;
      case BLOCK_TYPES.STONE:
      case BLOCK_TYPES.BRICK:
        return 2.6;
      case BLOCK_TYPES.COAL_ORE:
      case BLOCK_TYPES.IRON_ORE:
        return 3.4;
      case BLOCK_TYPES.GOLD_ORE:
      case BLOCK_TYPES.DIAMOND_ORE:
        return 4.8;
      default:
        return 1.0;
    }
  }

  private spawnChipParticle(bx: number, by: number, bz: number, blockType: number) {
    let color = 0x888888;
    if (blockType === BLOCK_TYPES.GRASS) color = 0x5b8c32;
    else if (blockType === BLOCK_TYPES.DIRT) color = 0x866043;
    else if (blockType === BLOCK_TYPES.WOOD || blockType === BLOCK_TYPES.WOOD_PLANKS) color = 0x6e4e36;
    else if (blockType === BLOCK_TYPES.SAND) color = 0xd8c89b;
    else if (blockType === BLOCK_TYPES.LEAVES) color = 0x3d702d;

    const geo = new THREE.BoxGeometry(0.08, 0.08, 0.08);
    const mat = new THREE.MeshBasicMaterial({ color });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(
      bx + 0.5 + (Math.random() - 0.5) * 0.4,
      by + 0.5 + (Math.random() - 0.5) * 0.4,
      bz + 0.5 + (Math.random() - 0.5) * 0.4
    );
    this.scene.add(mesh);
    this.particles.push({
      mesh,
      velocity: new THREE.Vector3((Math.random() - 0.5) * 2, Math.random() * 2, (Math.random() - 0.5) * 2),
      life: 0.35,
      maxLife: 0.35,
    });
  }

  private spawnToolBreakParticles(toolId?: number) {
    let color = 0x866043;
    if (toolId === ITEM_TYPES.STONE_PICKAXE) color = 0x888888;
    else if (toolId === ITEM_TYPES.IRON_PICKAXE) color = 0xd8d8d8;
    else if (toolId === ITEM_TYPES.DIAMOND_PICKAXE || toolId === ITEM_TYPES.DIAMOND_SWORD) color = 0x4dedf4;

    const geo = new THREE.BoxGeometry(0.07, 0.07, 0.07);
    const mat = new THREE.MeshBasicMaterial({ color });

    const p = this.camera.position;
    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(this.camera.quaternion);
    const origin = p.clone().add(forward.clone().multiplyScalar(0.55)).add(new THREE.Vector3(0, -0.15, 0));

    for (let i = 0; i < 22; i++) {
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.copy(origin);
      this.scene.add(mesh);

      this.particles.push({
        mesh,
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 5 + forward.x * 2.5,
          Math.random() * 4 + 1.2,
          (Math.random() - 0.5) * 5 + forward.z * 2.5
        ),
        life: 0.8,
        maxLife: 0.8,
      });
    }
  }

  private updateParticles(dt: number) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;
      p.velocity.y -= 18 * dt;
      p.mesh.position.addScaledVector(p.velocity, dt);

      const scale = Math.max(0.01, p.life / p.maxLife);
      p.mesh.scale.set(scale, scale, scale);

      if (p.life <= 0) {
        this.scene.remove(p.mesh);
        p.mesh.geometry.dispose();
        this.particles.splice(i, 1);
      }
    }
  }

  private updateDayNightCycle(dt: number, weatherMod?: WeatherEnvironmentMod) {
    this.timeOfDay = (this.timeOfDay + dt * 0.015) % 1.0;
    const sunAngle = this.timeOfDay * Math.PI * 2;
    
    // Celestial dome centered around the player's position at a far distance
    const px = this.camera.position.x;
    const py = this.camera.position.y;
    const pz = this.camera.position.z;
    const orbitDist = 170;

    const sunX = Math.cos(sunAngle) * orbitDist;
    const sunY = Math.sin(sunAngle) * orbitDist;
    const sunZ = Math.sin(sunAngle * 0.35) * (orbitDist * 0.3);

    const sunPos = new THREE.Vector3(px + sunX, py + sunY, pz + sunZ);
    const moonPos = new THREE.Vector3(px - sunX, py - sunY, pz - sunZ);
    const playerTarget = new THREE.Vector3(px, py, pz);

    this.sunLight.position.copy(sunPos);
    this.sunLight.target.position.copy(playerTarget);

    this.sunMesh.position.copy(sunPos);
    this.sunMesh.lookAt(playerTarget);
    // Sun is only rendered when near or above the horizon
    this.sunMesh.visible = sunY > -6;

    this.moonMesh.position.copy(moonPos);
    this.moonMesh.lookAt(playerTarget);
    // Moon is only rendered when near or above the horizon
    this.moonMesh.visible = -sunY > -6;

    const isSunUp = sunY > 0;
    const factor = Math.max(0, Math.sin(sunAngle));

    const noonSky = new THREE.Color(0x78a7ff);
    const sunsetSky = new THREE.Color(0xe07a5f);
    const nightSky = new THREE.Color(0x0a0f1d);
    const underwaterSky = new THREE.Color(0x0f4c81);

    if (this.physics.isSubmerged) {
      // Underwater atmospheric fog & tint
      this.scene.background = underwaterSky;
      if (this.scene.fog) {
        (this.scene.fog as THREE.FogExp2).color = underwaterSky;
        (this.scene.fog as THREE.FogExp2).density = 0.065;
      }
      this.sunLight.intensity = 0.4;
      this.ambientLight.intensity = 0.5;
      return;
    }

    let skyColor: THREE.Color;
    if (isSunUp) {
      if (factor > 0.3) {
        skyColor = noonSky.clone().lerp(sunsetSky, (1 - factor) * 0.7);
      } else {
        skyColor = sunsetSky.clone().lerp(nightSky, 1 - factor / 0.3);
      }
      this.sunLight.intensity = 0.2 + factor * 1.1;
      this.ambientLight.intensity = 0.2 + factor * 0.4;
      this.hemiLight.intensity = 0.15 + factor * 0.3;
    } else {
      skyColor = nightSky;
      this.sunLight.intensity = 0.08;
      this.ambientLight.intensity = 0.15;
      this.hemiLight.intensity = 0.1;
    }

    // Apply Weather Modifiers
    let fogDensity = 0.016;
    let fogColor = skyColor;

    if (weatherMod) {
      if (weatherMod.skyColorMod) {
        skyColor.lerp(weatherMod.skyColorMod, 0.75);
      }
      if (weatherMod.fogColorMod) {
        fogColor = weatherMod.fogColorMod;
      }
      this.sunLight.intensity *= weatherMod.sunIntensityMultiplier;
      this.ambientLight.intensity *= weatherMod.ambientIntensityMultiplier;
      fogDensity = weatherMod.fogDensity;

      // Sudden Lightning flash during thunderstorm
      if (weatherMod.isLightningActive) {
        skyColor = new THREE.Color(0xffffff);
        fogColor = new THREE.Color(0xffffff);
        this.ambientLight.intensity = 2.4;
        this.sunLight.intensity = 2.0;
      }
    }

    this.scene.background = skyColor;
    if (this.scene.fog) {
      (this.scene.fog as THREE.FogExp2).color = fogColor;
      (this.scene.fog as THREE.FogExp2).density = fogDensity;
    }
  }

  setWeather(type: WeatherType) {
    this.weather.setWeather(type);
  }

  updateArmorVisuals() {
    // 1. Sync 3D player armor meshes for 3rd person and shadow
    this.steve.setEquippedArmor(this.inventory.armorSlots);

    // 2. Sync First-Person view model sleeve color based on equipped chestplate
    const chest = this.inventory.armorSlots[1];
    if (chest) {
      const info = ARMOR_DATA[chest.id];
      if (info) {
        let col = '#d0d8dc';
        if (info.tier === 'leather') col = '#8d5524';
        else if (info.tier === 'gold') col = '#ffd700';
        else if (info.tier === 'diamond') col = '#00d2d3';
        this.viewModel.setSleeveColor(col);
      }
    } else {
      this.viewModel.setSleeveColor('#009494'); // Default Steve Cyan sleeve
    }

    // 3. Keep physics damage reduction updated
    this.physics.damageReduction = this.inventory.getDamageReduction();
  }

  setSelectedBlock(blockId: number) {
    // Find or set slot
    this.inventory.slots[this.inventory.selectedHotbarIndex] = { id: blockId, count: 64 };
    this.updateHeldItem();
  }

  togglePerspective() {
    this.perspectiveMode = (this.perspectiveMode + 1) % 3;
    this.applyPerspective();
  }

  setPerspective(mode: number) {
    this.perspectiveMode = mode % 3;
    this.applyPerspective();
  }

  private applyPerspective() {
    if (this.perspectiveMode === 0) {
      this.steve.group.visible = false;
      this.viewModel.root.visible = true;
    } else {
      this.steve.group.visible = true;
      this.viewModel.root.visible = false;
    }
  }

  setPanoramaMode(active: boolean) {
    this.inPanoramaMode = active;
    if (active) {
      this.steve.group.visible = true;
      this.viewModel.root.visible = false;
    } else {
      this.applyPerspective();
    }
  }

  private updateHeldItem() {
    const activeItem = this.inventory.slots[this.inventory.selectedHotbarIndex];
    const itemId = activeItem ? activeItem.id : 0;
    if (itemId !== this.lastHeldItemId) {
      this.lastHeldItemId = itemId;
      this.viewModel.setHeldItem(createHeldItemMesh(itemId, this.atlas, true));
      this.steve.setHeldItem(createHeldItemMesh(itemId, this.atlas, false));
    }
  }

  private animate = () => {
    if (!this.isRunning) return;
    requestAnimationFrame(this.animate);

    const now = performance.now();
    const dt = Math.min((now - this.lastTime) / 1000, 0.1);
    this.lastTime = now;

    // Keep held item and equipped armor visuals synchronized
    this.updateHeldItem();
    this.updateArmorVisuals();

    // Weather Simulation & Environmental Modifiers
    const weatherMod = this.weather.update(
      dt,
      this.physics.position.x,
      this.physics.position.y,
      this.physics.position.z
    );

    // FPS calculation
    this.frameCount++;
    this.fpsTimer += dt;
    if (this.fpsTimer >= 0.5) {
      this.currentFps = Math.round(this.frameCount / this.fpsTimer);
      this.frameCount = 0;
      this.fpsTimer = 0;

      if (this.onStatsUpdate) {
        const sunAngle = this.timeOfDay * Math.PI * 2;
        const isSunUp = Math.sin(sunAngle) > 0;
        const factor = Math.max(0, Math.sin(sunAngle));

        let timeStr = 'Day';
        if (!isSunUp) timeStr = 'Night';
        else if (factor < 0.4) timeStr = 'Golden Hour';

        this.onStatsUpdate({
          fps: this.currentFps,
          x: Math.round(this.physics.position.x),
          y: Math.round(this.physics.position.y),
          z: Math.round(this.physics.position.z),
          timeOfDay: timeStr,
          isNight: !isSunUp,
          selectedBlockId: this.inventory.getSelectedBlockId(),
          isLocked: this.isLocked,
          health: Math.round(this.physics.health),
          oxygen: Math.round(this.physics.oxygen),
          isSubmerged: this.physics.isSubmerged,
          inWater: this.physics.inWater,
          perspectiveMode: this.perspectiveMode,
          miningProgress: this.miningProgress,
          weather: this.weather.currentWeather,
          armorDefense: this.inventory.getTotalDefense(),
          gameMode: this.physics.gameMode,
          difficulty: this.physics.difficulty,
          isFlying: this.physics.isFlying,
        });
      }
    }

    if (this.inPanoramaMode) {
      // 1. Cinematic Rotating Orbit for Minecraft Title Screen
      const panSpeed = now * 0.00015;
      const panRadius = 26;
      const centerX = 0;
      const centerZ = 0;
      const centerY = this.world.getHighestSolidBlock(0, 0) + 7;

      this.camera.position.set(
        centerX + Math.sin(panSpeed) * panRadius,
        centerY + 4,
        centerZ + Math.cos(panSpeed) * panRadius
      );
      this.camera.lookAt(centerX, centerY, centerZ);

      this.steve.group.visible = true;
      this.steve.group.position.set(centerX, centerY - 1.5, centerZ);
      this.steve.update(dt, true, 2.5, 0, panSpeed + Math.PI, false);
      this.viewModel.root.visible = false;

      // Stream chunks around center
      this.world.update(centerX, centerZ);
    } else {
      // 1. Physics & Collision
      this.physics.update(dt, this.keys);

      // 2. Dynamic Infinite World Chunks Generation & Streaming
      this.world.update(this.physics.position.x, this.physics.position.z);

      const px = this.physics.position.x;
      const py = this.physics.position.y;
      const pz = this.physics.position.z;
      const eyeY = py + this.physics.eyeHeight;

      // Calculate motion for animations
      const horizVelocitySq = this.physics.velocity.x * this.physics.velocity.x + this.physics.velocity.z * this.physics.velocity.z;
      const isMoving = horizVelocitySq > 0.1;
      const moveSpeed = Math.sqrt(horizVelocitySq);

      // Update Steve Character Model
      this.steve.group.position.set(px, py, pz);
      this.steve.update(
        dt,
        isMoving,
        moveSpeed,
        this.physics.pitch,
        this.physics.yaw,
        this.physics.inWater
      );

      // Update First-Person View Model (Right Arm + Held Items)
      this.viewModel.update(dt, isMoving, moveSpeed);

      // Play footsteps while walking or sprinting on ground or wading through water
      if (isMoving && (this.physics.onGround || this.physics.inWater)) {
        sounds.playFootstep(this.physics.isSprinting);
      }

      // Update nature ambience (wind, ocean, underwater, weather)
      sounds.updateAmbience(dt, {
        y: this.physics.position.y,
        isSubmerged: this.physics.isSubmerged,
        inWater: this.physics.inWater,
        isOceanBiome: this.physics.position.y <= SEA_LEVEL + 2,
        isNight: Math.sin(this.timeOfDay * Math.PI * 2) <= 0,
        rainGainMod: weatherMod.rainAudioGain,
        windGainMod: weatherMod.windAudioGainMod,
      });

      // 3. Camera positioning according to Perspective
      if (this.perspectiveMode === 0) {
        // First Person: Camera at player eyes
        this.camera.position.set(px, eyeY, pz);
        const euler = new THREE.Euler(0, 0, 0, 'YXZ');
        euler.x = this.physics.pitch;
        euler.y = this.physics.yaw;
        this.camera.quaternion.setFromEuler(euler);

        this.steve.group.visible = false;
        this.viewModel.root.visible = true;
      } else if (this.perspectiveMode === 1) {
        // Third Person Behind: 3.2m behind player looking forward
        this.steve.group.visible = true;
        this.viewModel.root.visible = false;

        const offset = new THREE.Vector3(0, 0.3, 3.2);
        offset.applyEuler(new THREE.Euler(this.physics.pitch, this.physics.yaw, 0, 'YXZ'));
        this.camera.position.set(px + offset.x, eyeY + offset.y, pz + offset.z);
        this.camera.lookAt(px, eyeY, pz);
      } else {
        // Third Person Front: 3.2m in front looking back at Steve
        this.steve.group.visible = true;
        this.viewModel.root.visible = false;

        const offset = new THREE.Vector3(0, 0.2, -3.2);
        offset.applyEuler(new THREE.Euler(-this.physics.pitch, this.physics.yaw, 0, 'YXZ'));
        this.camera.position.set(px + offset.x, eyeY + offset.y, pz + offset.z);
        this.camera.lookAt(px, eyeY, pz);
      }
    }

    // 4. Day / Night & Atmospheric cycle
    this.updateDayNightCycle(dt, weatherMod);

    // 5. Raycasting for block targeting & mining progression
    if (!this.inPanoramaMode) {
      this.updateTargeting();
      this.updateMining(dt);
    } else {
      this.wireframeBox.visible = false;
      this.breakOverlay.hide();
    }

    // 6. Update AI Mobs (Sheep & Zombies)
    if (!this.inPanoramaMode) {
      const isDay = Math.sin(this.timeOfDay * Math.PI * 2) > 0;
      this.mobs.update(
        dt,
        this.physics.position,
        isDay,
        this.physics.difficulty,
        this.physics.gameMode,
        (damage) => {
          this.physics.takeDamage(damage);
          sounds.playMobHit();
        },
        this.inventory
      );
    }

    // 7. Update debris particles
    this.updateParticles(dt);

    // 8. Render
    this.renderer.render(this.scene, this.camera);
  };

  private updateMining(dt: number) {
    if (this.isMining && this.targetBlock && this.targetBlock.y > 0) {
      const { x, y, z } = this.targetBlock;
      const blockType = this.world.getBlock(x, y, z);

      if (
        blockType === BLOCK_TYPES.AIR ||
        blockType === BLOCK_TYPES.BEDROCK ||
        blockType === BLOCK_TYPES.WATER
      ) {
        this.miningProgress = 0;
        this.miningBlock = null;
        this.breakOverlay.hide();
        return;
      }

      // Check if target changed
      if (
        !this.miningBlock ||
        this.miningBlock.x !== x ||
        this.miningBlock.y !== y ||
        this.miningBlock.z !== z
      ) {
        this.miningBlock = { x, y, z };
        this.miningProgress = 0;
        this.miningSwingTimer = 0;
      }

      // Continuous arm swing & chip audio
      this.miningSwingTimer += dt;
      if (this.miningSwingTimer >= 0.18) {
        this.miningSwingTimer = 0;
        this.viewModel.triggerSwing();
        this.steve.triggerSwing();
        sounds.playHit(blockType);
        this.spawnChipParticle(x, y, z, blockType);
      }

      const baseTime = this.getBlockHardnessTime(blockType);
      const toolMultiplier = this.inventory.getActiveToolSpeedMultiplier(blockType);
      const finalTime = Math.max(0.12, baseTime / toolMultiplier);

      this.miningProgress += dt / finalTime;
      this.breakOverlay.setProgress(x, y, z, this.miningProgress);

      if (this.miningProgress >= 1.0) {
        // Block completely broken!
        this.world.setBlock(x, y, z, BLOCK_TYPES.AIR);
        this.spawnDebris(x, y, z, blockType);
        sounds.playBlockBreak(blockType);

        const dropItem = this.inventory.getDropForBlock(blockType);
        this.inventory.addItem(dropItem, 1);
        sounds.playItemPickup();

        // Deduct tool durability
        const damageRes = this.inventory.damageActiveTool(1);
        if (damageRes.destroyed) {
          // Tool reached zero durability: trigger destruction animation, sound, and particle explosion!
          this.viewModel.triggerToolBreak();
          sounds.playToolBreak();
          this.spawnToolBreakParticles(damageRes.toolId);
          this.updateHeldItem();
        }

        this.miningProgress = 0;
        this.miningBlock = null;
        this.breakOverlay.hide();
        this.updateTargeting();
      }
    } else {
      if (this.miningBlock || this.miningProgress > 0) {
        this.miningProgress = 0;
        this.miningBlock = null;
        this.breakOverlay.hide();
      }
    }
  }

  destroy() {
    this.isRunning = false;
    this.weather.destroy();
    this.breakOverlay.dispose();
    document.removeEventListener('pointerlockchange', this.boundOnPointerLockChange);
    window.removeEventListener('mousemove', this.boundOnMouseMove);
    this.renderer.domElement.removeEventListener('mousedown', this.boundOnMouseDown);
    window.removeEventListener('mouseup', this.boundOnMouseUp);
    window.removeEventListener('keydown', this.boundOnKeyDown);
    window.removeEventListener('keyup', this.boundOnKeyUp);
    window.removeEventListener('wheel', this.boundOnWheel);
    window.removeEventListener('resize', this.boundOnResize);

    if (this.renderer.domElement.parentElement) {
      this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
    }
    this.renderer.dispose();
  }
}
