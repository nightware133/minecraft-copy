import * as THREE from 'three';
import { generateProceduralBlockTextures, BlockTextureAtlas } from './textures';
import { VoxelWorld, BLOCK_TYPES, WORLD_HEIGHT, SEA_LEVEL } from './world';
import { PlayerPhysics } from './physics';
import { InventorySystem, ITEM_TYPES, ARMOR_DATA, ITEM_DEFINITIONS, FOOD_NUTRITION } from './inventory';
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
  hunger: number;
  maxHunger: number;
  isSubmerged: boolean;
  inWater: boolean;
  perspectiveMode: number;
  miningProgress: number;
  weather: WeatherType;
  armorDefense: number;
  gameMode: GameMode;
  difficulty: GameDifficulty;
  isFlying: boolean;
  biomeName: string;
}

interface Particle {
  mesh: THREE.Mesh;
  velocity: THREE.Vector3;
  life: number;
  maxLife: number;
}

interface ItemDropEntity {
  mesh: THREE.Mesh;
  itemId: number;
  velocity: THREE.Vector3;
  bobTimer: number;
  life: number;
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
  heldTorchLight!: THREE.PointLight;
  torchLightPool: THREE.PointLight[] = [];
  snowballs: { mesh: THREE.Mesh; vel: THREE.Vector3; life: number }[] = [];
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
  itemDrops: ItemDropEntity[] = [];
  bubbleTimer: number = 0;
  keys: Record<string, boolean> = {};

  timeOfDay: number = 0.25; // 0 to 1
  isLocked: boolean = false;
  isPaused: boolean = false;
  isMouseDown: boolean = false;
  lastMouseX: number = 0;
  lastMouseY: number = 0;
  pointerLockBlocked: boolean = false;

  public setPaused(paused: boolean) {
    this.isPaused = paused;
    this.lastTime = performance.now();
    if (paused) {
      this.keys = {};
      this.isMouseDown = false;
      this.isMining = false;
      this.miningProgress = 0;
      this.miningBlock = null;
      if (this.wireframeBox) this.wireframeBox.visible = false;
      if (this.breakOverlay) this.breakOverlay.hide();
      sounds.pauseAmbience();
    }
  }

  onStatsUpdate?: (stats: EngineStats) => void;
  onOpenFurnace?: () => void;
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
    const spawnX = 0.5;
    const spawnZ = 0.5;
    const spawnY = this.world.getHighestSolidBlock(0, 0) + 1.2;
    this.physics = new PlayerPhysics(this.world, new THREE.Vector3(spawnX, spawnY, spawnZ));

    this.steve = new SteveCharacter(this.scene);
    this.viewModel = new FirstPersonViewModel(this.camera);
    this.mobs = new MobManager(this.scene, this.world);

    // 5. Environmental Lighting
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.45);
    this.scene.add(this.ambientLight);

    this.hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.35);
    this.scene.add(this.hemiLight);

    this.sunLight = new THREE.DirectionalLight(0xfffaed, 1.2);
    this.sunLight.position.set(30, 50, 20);
    this.scene.add(this.sunLight);
    this.scene.add(this.sunLight.target);

    // 5b. Dynamic Handheld Torch Light (OptiFine-style real-time illumination)
    this.heldTorchLight = new THREE.PointLight(0xffa53a, 0, 20, 1.25);
    this.heldTorchLight.visible = false;
    this.scene.add(this.heldTorchLight);

    // 5c. Placed Torch Dynamic Point Light Pool
    this.torchLightPool = [];
    for (let i = 0; i < 8; i++) {
      const pl = new THREE.PointLight(0xff962e, 0, 16, 1.35);
      pl.visible = false;
      this.scene.add(pl);
      this.torchLightPool.push(pl);
    }

    // 6. Minecraft Celestial Bodies (Square Sun & Moon)
    const sunGeom = new THREE.PlaneGeometry(16, 16);
    const sunMat = new THREE.MeshBasicMaterial({
      color: 0xfff3a8,
      side: THREE.DoubleSide,
      fog: false,
    });
    this.sunMesh = new THREE.Mesh(sunGeom, sunMat);
    this.scene.add(this.sunMesh);

    const moonGeom = new THREE.PlaneGeometry(14, 14);
    const moonMat = new THREE.MeshBasicMaterial({
      color: 0xe6edf8,
      side: THREE.DoubleSide,
      fog: false,
    });
    this.moonMesh = new THREE.Mesh(moonGeom, moonMat);
    this.scene.add(this.moonMesh);

    // 7. Raycaster & Block Outlines
    this.raycaster = new THREE.Raycaster();
    this.raycaster.far = 5.5;

    const boxGeom = new THREE.BoxGeometry(1.004, 1.004, 1.004);
    const edges = new THREE.EdgesGeometry(boxGeom);
    this.wireframeBox = new THREE.LineSegments(
      edges,
      new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 2 })
    );
    this.wireframeBox.visible = false;
    this.scene.add(this.wireframeBox);

    this.breakOverlay = new BlockBreakOverlay(this.scene);

    // 8. Event Listeners
    this.boundOnMouseMove = this.onMouseMove.bind(this);
    this.boundOnMouseDown = this.onMouseDown.bind(this);
    this.boundOnMouseUp = this.onMouseUp.bind(this);
    this.boundOnKeyDown = this.onKeyDown.bind(this);
    this.boundOnKeyUp = this.onKeyUp.bind(this);
    this.boundOnWheel = this.onWheel.bind(this);
    this.boundOnResize = this.onResize.bind(this);
    this.boundOnPointerLockChange = this.onPointerLockChange.bind(this);

    this.attachEvents();
    this.lastTime = performance.now();
    this.animate();
  }

  private attachEvents() {
    this.renderer.domElement.addEventListener('click', () => {
      if (this.isPaused || this.inPanoramaMode) return;
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
    window.addEventListener('keydown', this.boundOnKeyDown);
    window.addEventListener('keyup', this.boundOnKeyUp);
    window.addEventListener('wheel', this.boundOnWheel, { passive: true });
    window.addEventListener('resize', this.boundOnResize);
    this.renderer.domElement.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  private onPointerLockChange() {
    this.isLocked = document.pointerLockElement === this.renderer.domElement;
  }

  private onMouseMove(e: MouseEvent) {
    if (this.isPaused || this.inPanoramaMode) return;
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
    if (this.isPaused || this.inPanoramaMode) return;
    this.isMouseDown = true;
    this.lastMouseX = e.clientX;
    this.lastMouseY = e.clientY;

    const activeSlot = this.inventory.slots[this.inventory.selectedHotbarIndex];
    const activeId = activeSlot ? activeSlot.id : 0;

    if (e.button === 0) {
      // 1. Raycast combat attack against Mobs
      const rayOrigin = this.camera.position.clone();
      const rayDir = new THREE.Vector3();
      this.camera.getWorldDirection(rayDir);

      let damage = 6;
      if (this.physics.gameMode === 'creative') {
        damage = 999; // 1-hit kill in Creative
      } else if (activeId === ITEM_TYPES.DIAMOND_SWORD) {
        damage = 40;
      } else if (activeId === ITEM_TYPES.IRON_SWORD) {
        damage = 26;
      } else if (activeId === ITEM_TYPES.WOOD_SWORD) {
        damage = 15;
      } else if (
        activeId === ITEM_TYPES.DIAMOND_PICKAXE ||
        activeId === ITEM_TYPES.IRON_PICKAXE ||
        activeId === ITEM_TYPES.WOOD_PICKAXE
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
          this.spawnItemDrop(x, y, z, blockType);
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
      // Right Click
      e.preventDefault();
      this.viewModel.triggerSwing();
      this.steve.triggerSwing();

      // 0. Furnace Interaction (Right clicking on placed furnace opens the cooking UI)
      if (this.targetBlock) {
        const { x, y, z } = this.targetBlock;
        const targetType = this.world.getBlock(x, y, z);
        if (targetType === BLOCK_TYPES.FURNACE || targetType === BLOCK_TYPES.FURNACE_LIT) {
          if (this.onOpenFurnace) {
            this.onOpenFurnace();
            return;
          }
        }
      }

      // A. Food Consumption (Restores hunger & health)
      if (activeId && FOOD_NUTRITION[activeId]) {
        const nut = FOOD_NUTRITION[activeId];
        const canEat =
          this.physics.hunger < this.physics.maxHunger ||
          this.physics.health < this.physics.maxHealth ||
          activeId === ITEM_TYPES.GOLDEN_APPLE;

        if (canEat) {
          this.physics.feed(nut.hunger, nut.saturation);
          if (activeId === ITEM_TYPES.GOLDEN_APPLE) {
            this.physics.health = Math.min(this.physics.maxHealth, this.physics.health + 80);
          }
          this.inventory.consumeSelected();
          sounds.playEat();
          if (this.physics.hunger >= 20) {
            sounds.playBurp();
          }
          this.updateHeldItem();
          return;
        }
      }

      // B. Throwable Snowballs (Authentic projectile flight, mob knockback & crisp snow crunch)
      if (activeId === ITEM_TYPES.SNOWBALL) {
        this.throwSnowball();
        if (this.physics.gameMode !== 'creative') {
          this.inventory.consumeSelected();
        }
        sounds.playSnowballThrow();
        this.viewModel.triggerSwing();
        this.steve.triggerSwing();
        this.updateHeldItem();
        return;
      }

      // C. Water Bucket Mechanics
      if (activeId === ITEM_TYPES.WATER_BUCKET && this.targetBlock) {
        const px = this.targetBlock.x + Math.round(this.targetBlock.norm.x);
        const py = this.targetBlock.y + Math.round(this.targetBlock.norm.y);
        const pz = this.targetBlock.z + Math.round(this.targetBlock.norm.z);
        if (py >= 0 && py < WORLD_HEIGHT) {
          this.world.setBlock(px, py, pz, BLOCK_TYPES.WATER);
          sounds.playBucketUse();
          sounds.playWaterSplash();
          if (this.physics.gameMode !== 'creative') {
            this.inventory.slots[this.inventory.selectedHotbarIndex] = { id: ITEM_TYPES.BUCKET, count: 1 };
          }
          this.updateTargeting();
        }
        return;
      }

      // C. Empty Bucket Scoop Mechanics
      if (activeId === ITEM_TYPES.BUCKET && this.targetBlock) {
        const { x, y, z } = this.targetBlock;
        if (this.world.getBlock(x, y, z) === BLOCK_TYPES.WATER) {
          this.world.setBlock(x, y, z, BLOCK_TYPES.AIR);
          sounds.playBucketUse();
          if (this.physics.gameMode !== 'creative') {
            this.inventory.slots[this.inventory.selectedHotbarIndex] = { id: ITEM_TYPES.WATER_BUCKET, count: 1 };
          }
          this.updateTargeting();
          return;
        }
      }

      // D. Block Placement from Inventory
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
              this.inventory.consumeSelected();
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
    if (this.isPaused || this.inPanoramaMode) return;
    this.keys[e.code] = true;
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
    if (this.isPaused || this.inPanoramaMode) return;
    this.keys[e.code] = false;
  }

  private onWheel(e: WheelEvent) {
    if (this.isPaused || this.inPanoramaMode) return;
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
    const validMeshes = this.world.chunkMeshes.filter(
      (m) => m && m.parent && m.geometry && m.geometry.attributes && m.geometry.attributes.position
    );
    const intersects = this.raycaster.intersectObjects(validMeshes, false);

    if (intersects.length > 0) {
      const hit = intersects[0];
      const norm = hit.face ? hit.face.normal : new THREE.Vector3(0, 1, 0);

      const probePoint = hit.point.clone().sub(norm.clone().multiplyScalar(0.01));
      const bx = Math.floor(probePoint.x);
      const by = Math.floor(probePoint.y);
      const bz = Math.floor(probePoint.z);

      if (this.world.isSolid(bx, by, bz) || this.world.getBlock(bx, by, bz) === BLOCK_TYPES.WATER) {
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
    else if (blockType === BLOCK_TYPES.STONE || blockType === BLOCK_TYPES.DEEPSLATE) color = 0x777777;
    else if (blockType === BLOCK_TYPES.WOOD || blockType === BLOCK_TYPES.DARK_OAK_WOOD || blockType === BLOCK_TYPES.JUNGLE_WOOD) color = 0x6b5030;
    else if (blockType === BLOCK_TYPES.LEAVES || blockType === BLOCK_TYPES.DARK_OAK_LEAVES || blockType === BLOCK_TYPES.JUNGLE_LEAVES) color = 0x3a7a28;
    else if (blockType === BLOCK_TYPES.BRICK) color = 0xa04030;
    else if (blockType === BLOCK_TYPES.SAND) color = 0xd8c287;
    else if (blockType === BLOCK_TYPES.RED_SAND || blockType === BLOCK_TYPES.TERRACOTTA || blockType === BLOCK_TYPES.RED_TERRACOTTA) color = 0xb7532a;
    else if (blockType === BLOCK_TYPES.AMETHYST) color = 0x9b59b6;
    else if (blockType === BLOCK_TYPES.MAGMA) color = 0xd94b0d;
    else if (blockType === BLOCK_TYPES.GLOWSTONE) color = 0xfbc531;
    else if (blockType === BLOCK_TYPES.OBSIDIAN) color = 0x1f1933;
    else if (blockType === BLOCK_TYPES.MELON) color = 0x44bd32;
    else if (blockType === BLOCK_TYPES.PUMPKIN) color = 0xe67e22;
    else if (blockType === BLOCK_TYPES.RED_MUSHROOM_BLOCK) color = 0xe74c3c;
    else if (blockType === BLOCK_TYPES.BROWN_MUSHROOM_BLOCK) color = 0x8c6747;

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

  // 3D Floating & Spinning Item Drops
  private spawnItemDrop(bx: number, by: number, bz: number, itemId: number) {
    const geo = new THREE.BoxGeometry(0.25, 0.25, 0.25);
    let color = 0x866043;
    if (itemId === BLOCK_TYPES.GRASS) color = 0x5c8e32;
    else if (itemId === BLOCK_TYPES.STONE) color = 0x777777;
    else if (itemId === BLOCK_TYPES.AMETHYST || itemId === ITEM_TYPES.AMETHYST_SHARD) color = 0x9b59b6;
    else if (itemId === BLOCK_TYPES.MELON || itemId === ITEM_TYPES.MELON_SLICE) color = 0x2ed573;
    else if (itemId === BLOCK_TYPES.GOLD_ORE || itemId === ITEM_TYPES.GOLD_INGOT) color = 0xfdcb6e;
    else if (itemId === BLOCK_TYPES.DIAMOND_ORE || itemId === ITEM_TYPES.DIAMOND) color = 0x00d2d3;
    else if (itemId === BLOCK_TYPES.TORCH) color = 0xff9f43;

    const mat = new THREE.MeshLambertMaterial({ color });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(bx + 0.5, by + 0.5, bz + 0.5);
    this.scene.add(mesh);

    this.itemDrops.push({
      mesh,
      itemId,
      velocity: new THREE.Vector3((Math.random() - 0.5) * 2, 2.5, (Math.random() - 0.5) * 2),
      bobTimer: Math.random() * Math.PI,
      life: 60.0,
    });
  }

  private updateItemDrops(dt: number) {
    const playerPos = this.physics.position;

    for (let i = this.itemDrops.length - 1; i >= 0; i--) {
      const drop = this.itemDrops[i];
      drop.life -= dt;
      drop.bobTimer += dt * 3.0;

      // Gravity & float on ground / water
      drop.velocity.y -= 14.0 * dt;
      drop.mesh.position.addScaledVector(drop.velocity, dt);
      drop.mesh.rotation.y += 2.0 * dt;

      const curX = Math.floor(drop.mesh.position.x);
      const curY = Math.floor(drop.mesh.position.y);
      const curZ = Math.floor(drop.mesh.position.z);

      const blockBelow = this.world.getBlock(curX, curY - 1, curZ);
      if (this.world.isSolid(curX, curY - 1, curZ) || blockBelow === BLOCK_TYPES.WATER) {
        drop.velocity.y = 0;
        drop.mesh.position.y = Math.floor(drop.mesh.position.y) + 0.25 + Math.sin(drop.bobTimer) * 0.08;
      }

      // Magnetize towards player within 2.8m
      const dist = drop.mesh.position.distanceTo(playerPos);
      if (dist < 2.8) {
        const pullDir = playerPos.clone().sub(drop.mesh.position).normalize();
        drop.mesh.position.addScaledVector(pullDir, dt * 6.5);

        // Pick up within 0.75m
        if (dist < 0.75) {
          this.inventory.addItem(drop.itemId, 1);
          sounds.playItemPickup();
          this.scene.remove(drop.mesh);
          drop.mesh.geometry.dispose();
          this.itemDrops.splice(i, 1);
          continue;
        }
      }

      if (drop.life <= 0) {
        this.scene.remove(drop.mesh);
        drop.mesh.geometry.dispose();
        this.itemDrops.splice(i, 1);
      }
    }
  }

  private spawnWaterSplashParticles(px: number, py: number, pz: number) {
    const geo = new THREE.BoxGeometry(0.08, 0.08, 0.08);
    const mat = new THREE.MeshBasicMaterial({ color: 0x81d4fa, transparent: true, opacity: 0.85 });

    for (let i = 0; i < 16; i++) {
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(px + (Math.random() - 0.5) * 0.6, py + 0.1, pz + (Math.random() - 0.5) * 0.6);
      this.scene.add(mesh);
      this.particles.push({
        mesh,
        velocity: new THREE.Vector3((Math.random() - 0.5) * 3, Math.random() * 3 + 2, (Math.random() - 0.5) * 3),
        life: 0.45,
        maxLife: 0.45,
      });
    }
  }

  private spawnBubbleParticle(px: number, py: number, pz: number) {
    const geo = new THREE.BoxGeometry(0.05, 0.05, 0.05);
    const mat = new THREE.MeshBasicMaterial({ color: 0xb3e5fc, transparent: true, opacity: 0.75 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(px + (Math.random() - 0.5) * 0.4, py, pz + (Math.random() - 0.5) * 0.4);
    this.scene.add(mesh);
    this.particles.push({
      mesh,
      velocity: new THREE.Vector3((Math.random() - 0.5) * 0.3, Math.random() * 1.5 + 1.0, (Math.random() - 0.5) * 0.3),
      life: 0.8,
      maxLife: 0.8,
    });
  }

  private getBlockHardnessTime(blockType: number): number {
    switch (blockType) {
      case BLOCK_TYPES.LEAVES:
      case BLOCK_TYPES.DARK_OAK_LEAVES:
      case BLOCK_TYPES.JUNGLE_LEAVES:
      case BLOCK_TYPES.CHERRY_LEAVES:
      case BLOCK_TYPES.RED_FLOWER:
      case BLOCK_TYPES.YELLOW_FLOWER:
      case BLOCK_TYPES.SEAWEED:
      case BLOCK_TYPES.TORCH:
      case BLOCK_TYPES.LILY_PAD:
        return 0.18;
      case BLOCK_TYPES.SNOW:
        return 0.25;
      case BLOCK_TYPES.GLASS:
        return 0.35;
      case BLOCK_TYPES.CACTUS:
      case BLOCK_TYPES.MUSHROOM_STEM:
      case BLOCK_TYPES.RED_MUSHROOM_BLOCK:
      case BLOCK_TYPES.BROWN_MUSHROOM_BLOCK:
        return 0.4;
      case BLOCK_TYPES.DIRT:
      case BLOCK_TYPES.GRASS:
      case BLOCK_TYPES.SAND:
      case BLOCK_TYPES.RED_SAND:
      case BLOCK_TYPES.MUD:
      case BLOCK_TYPES.MOSS:
        return 0.65;
      case BLOCK_TYPES.MELON:
      case BLOCK_TYPES.PUMPKIN:
        return 0.8;
      case BLOCK_TYPES.ICE:
        return 0.75;
      case BLOCK_TYPES.CORAL_PINK:
      case BLOCK_TYPES.CORAL_CYAN:
      case BLOCK_TYPES.CORAL_YELLOW:
        return 0.9;
      case BLOCK_TYPES.WOOD:
      case BLOCK_TYPES.BIRCH_WOOD:
      case BLOCK_TYPES.DARK_OAK_WOOD:
      case BLOCK_TYPES.JUNGLE_WOOD:
      case BLOCK_TYPES.WOOD_PLANKS:
      case BLOCK_TYPES.CRAFTING_TABLE:
        return 1.6;
      case BLOCK_TYPES.STONE:
      case BLOCK_TYPES.BRICK:
      case BLOCK_TYPES.TERRACOTTA:
      case BLOCK_TYPES.RED_TERRACOTTA:
      case BLOCK_TYPES.ORANGE_TERRACOTTA:
      case BLOCK_TYPES.YELLOW_TERRACOTTA:
      case BLOCK_TYPES.WHITE_TERRACOTTA:
      case BLOCK_TYPES.BROWN_TERRACOTTA:
        return 2.4;
      case BLOCK_TYPES.COAL_ORE:
      case BLOCK_TYPES.IRON_ORE:
      case BLOCK_TYPES.AMETHYST:
      case BLOCK_TYPES.MAGMA:
      case BLOCK_TYPES.GLOWSTONE:
        return 3.2;
      case BLOCK_TYPES.GOLD_ORE:
      case BLOCK_TYPES.DIAMOND_ORE:
      case BLOCK_TYPES.DEEPSLATE:
        return 4.5;
      case BLOCK_TYPES.OBSIDIAN:
        return 8.0;
      default:
        return 1.0;
    }
  }

  private spawnChipParticle(bx: number, by: number, bz: number, blockType: number) {
    let color = 0x888888;
    if (blockType === BLOCK_TYPES.GRASS) color = 0x5b8c32;
    else if (blockType === BLOCK_TYPES.DIRT || blockType === BLOCK_TYPES.MUD) color = 0x866043;
    else if (blockType === BLOCK_TYPES.WOOD || blockType === BLOCK_TYPES.WOOD_PLANKS) color = 0x6e4e36;
    else if (blockType === BLOCK_TYPES.SAND) color = 0xd8c89b;
    else if (blockType === BLOCK_TYPES.LEAVES) color = 0x3d702d;
    else if (blockType === BLOCK_TYPES.AMETHYST) color = 0x9b59b6;

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
    this.sunMesh.visible = sunY > -6;

    this.moonMesh.position.copy(moonPos);
    this.moonMesh.lookAt(playerTarget);
    this.moonMesh.visible = -sunY > -6;

    const isSunUp = sunY > 0;
    const factor = Math.max(0, Math.sin(sunAngle));

    const noonSky = new THREE.Color(0x78a7ff);
    const sunsetSky = new THREE.Color(0xe07a5f);
    const nightSky = new THREE.Color(0x0a0f1d);
    const underwaterSky = new THREE.Color(0x0f4c81);

    if (this.physics.isSubmerged) {
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
    this.steve.setEquippedArmor(this.inventory.armorSlots);

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
      this.viewModel.setSleeveColor('#009494');
    }

    this.physics.damageReduction = this.inventory.getDamageReduction();
  }

  setSelectedBlock(blockId: number) {
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

    this.updateHeldItem();
    this.updateArmorVisuals();

    const weatherMod = this.weather.update(
      dt,
      this.physics.position.x,
      this.physics.position.y,
      this.physics.position.z
    );

    // FPS & Stats calculation
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

        const biome = this.world.getBiome(this.physics.position.x, this.physics.position.z);

        this.onStatsUpdate({
          fps: this.currentFps,
          x: Math.round(this.physics.position.x),
          y: Math.round(this.physics.position.y),
          z: Math.round(this.physics.position.z),
          timeOfDay: timeStr,
          isNight: !isSunUp,
          selectedBlockId: this.inventory.slots[this.inventory.selectedHotbarIndex]?.id || null,
          isLocked: this.isLocked,
          health: Math.round(this.physics.health),
          oxygen: Math.round(this.physics.oxygen),
          hunger: Math.round(this.physics.hunger),
          maxHunger: Math.round(this.physics.maxHunger),
          isSubmerged: this.physics.isSubmerged,
          inWater: this.physics.inWater,
          perspectiveMode: this.perspectiveMode,
          miningProgress: this.miningProgress,
          weather: this.weather.currentWeather,
          armorDefense: this.inventory.getTotalDefense(),
          gameMode: this.physics.gameMode,
          difficulty: this.physics.difficulty,
          isFlying: this.physics.isFlying,
          biomeName: biome.name,
        });
      }
    }

    if (this.isPaused) {
      this.renderer.render(this.scene, this.camera);
      return;
    }

    if (this.inPanoramaMode) {
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

      this.world.update(centerX, centerZ);
    } else {
      // 1. Physics & Water Transition Events
      this.physics.update(dt, this.keys);

      if (this.physics.justEnteredWater) {
        sounds.playWaterSplash();
        this.spawnWaterSplashParticles(this.physics.position.x, this.physics.position.y, this.physics.position.z);
      } else if (this.physics.justExitedWater) {
        sounds.playWaterExit();
      }

      if (this.physics.isSubmerged) {
        this.bubbleTimer += dt;
        if (this.bubbleTimer > 0.25) {
          this.bubbleTimer = 0;
          this.spawnBubbleParticle(this.physics.position.x, this.physics.position.y + 1.4, this.physics.position.z);
        }
      }

      // 2. Real-time Water Flow Cellular Automata
      this.world.updateWaterPhysics(dt);

      // 3. Dynamic Infinite World Chunks Generation & Streaming
      this.world.update(this.physics.position.x, this.physics.position.z);

      const px = this.physics.position.x;
      const py = this.physics.position.y;
      const pz = this.physics.position.z;
      const eyeY = py + this.physics.eyeHeight;

      const horizVelocitySq = this.physics.velocity.x * this.physics.velocity.x + this.physics.velocity.z * this.physics.velocity.z;
      const isMoving = horizVelocitySq > 0.1;
      const moveSpeed = Math.sqrt(horizVelocitySq);

      this.steve.group.position.set(px, py, pz);
      this.steve.update(
        dt,
        isMoving,
        moveSpeed,
        this.physics.pitch,
        this.physics.yaw,
        this.physics.inWater
      );

      this.viewModel.update(dt, isMoving, moveSpeed);

      if (isMoving && (this.physics.onGround || this.physics.inWater)) {
        sounds.playFootstep(this.physics.isSprinting);
      }

      sounds.updateAmbience(dt, {
        y: this.physics.position.y,
        isSubmerged: this.physics.isSubmerged,
        inWater: this.physics.inWater,
        isOceanBiome: this.physics.position.y <= SEA_LEVEL + 2,
        isNight: Math.sin(this.timeOfDay * Math.PI * 2) <= 0,
        rainGainMod: weatherMod.rainAudioGain,
        windGainMod: weatherMod.windAudioGainMod,
      });

      // 4. Camera Positioning
      if (this.perspectiveMode === 0) {
        this.camera.position.set(px, eyeY, pz);
        const euler = new THREE.Euler(0, 0, 0, 'YXZ');
        euler.x = this.physics.pitch;
        euler.y = this.physics.yaw;
        this.camera.quaternion.setFromEuler(euler);

        this.steve.group.visible = false;
        this.viewModel.root.visible = true;
      } else if (this.perspectiveMode === 1) {
        this.steve.group.visible = true;
        this.viewModel.root.visible = false;

        const offset = new THREE.Vector3(0, 0.3, 3.2);
        offset.applyEuler(new THREE.Euler(this.physics.pitch, this.physics.yaw, 0, 'YXZ'));
        this.camera.position.set(px + offset.x, eyeY + offset.y, pz + offset.z);
        this.camera.lookAt(px, eyeY, pz);
      } else {
        this.steve.group.visible = true;
        this.viewModel.root.visible = false;

        const offset = new THREE.Vector3(0, 0.2, -3.2);
        offset.applyEuler(new THREE.Euler(-this.physics.pitch, this.physics.yaw, 0, 'YXZ'));
        this.camera.position.set(px + offset.x, eyeY + offset.y, pz + offset.z);
        this.camera.lookAt(px, eyeY, pz);
      }
    }

    // 5. Day / Night cycle
    this.updateDayNightCycle(dt, weatherMod);

    // 6. Targeting & Mining
    if (!this.inPanoramaMode) {
      this.updateTargeting();
      this.updateMining(dt);
      this.updateItemDrops(dt);
    } else {
      this.wireframeBox.visible = false;
      this.breakOverlay.hide();
    }

    // 7. Update AI Mobs
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

    // 8. Update Particles
    this.updateParticles(dt);

    // 9. Dynamic Torch Lighting (OptiFine handheld + placed world torches)
    this.updateTorchLighting(now);

    // 10. Throwable Snowball Projectiles
    this.updateSnowballs(dt);

    // 11. Render Scene
    this.renderer.render(this.scene, this.camera);
  };

  private updateTorchLighting(now: number) {
    if (this.inPanoramaMode) {
      this.heldTorchLight.visible = false;
      this.torchLightPool.forEach((l) => (l.visible = false));
      return;
    }

    // 1. Handheld Torch Dynamic Light (OptiFine Real-Time Lighting)
    const activeItem = this.inventory.slots[this.inventory.selectedHotbarIndex];
    const isHoldingTorch = activeItem?.id === BLOCK_TYPES.TORCH;

    if (isHoldingTorch) {
      this.heldTorchLight.visible = true;
      const eyeY = this.physics.position.y + this.physics.eyeHeight;
      this.heldTorchLight.position.set(
        this.physics.position.x,
        eyeY - 0.15,
        this.physics.position.z
      );
      // Realistic golden torch flicker
      const flicker = Math.sin(now * 0.016) * 0.22 + Math.cos(now * 0.038) * 0.14;
      this.heldTorchLight.intensity = 2.85 + flicker;
      this.heldTorchLight.color.setHex(0xffaa3e);
    } else {
      this.heldTorchLight.visible = false;
    }

    // 2. Placed World Torches Dynamic Lighting
    const nearbyTorches = this.world.getNearbyTorches(
      this.physics.position.x,
      this.physics.position.y,
      this.physics.position.z,
      24
    );

    for (let i = 0; i < this.torchLightPool.length; i++) {
      const light = this.torchLightPool[i];
      if (i < nearbyTorches.length) {
        const torch = nearbyTorches[i];
        light.visible = true;
        light.position.set(torch.x + 0.5, torch.y + 0.72, torch.z + 0.5);
        const flicker = Math.sin(now * 0.014 + i * 1.5) * 0.2 + Math.cos(now * 0.027 + i) * 0.12;
        light.intensity = 2.5 + flicker;
      } else {
        light.visible = false;
      }
    }
  }

  private throwSnowball() {
    const geom = new THREE.SphereGeometry(0.13, 8, 8);
    const mat = new THREE.MeshLambertMaterial({ color: 0xffffff });
    const mesh = new THREE.Mesh(geom, mat);

    const eyePos = new THREE.Vector3(
      this.physics.position.x,
      this.physics.position.y + this.physics.eyeHeight - 0.1,
      this.physics.position.z
    );
    mesh.position.copy(eyePos);

    const dir = new THREE.Vector3();
    this.camera.getWorldDirection(dir);
    mesh.position.addScaledVector(dir, 0.45);

    const vel = dir.clone().multiplyScalar(22);
    vel.y += 1.6; // upward arc

    this.scene.add(mesh);
    this.snowballs.push({ mesh, vel, life: 0 });
  }

  private updateSnowballs(dt: number) {
    for (let i = this.snowballs.length - 1; i >= 0; i--) {
      const sb = this.snowballs[i];
      sb.life += dt;
      sb.vel.y -= 14 * dt; // gravity
      sb.mesh.position.addScaledVector(sb.vel, dt);

      // Check mob hit
      const rayDir = sb.vel.clone().normalize();
      const hitMob = this.mobs.hitMobWithRay(sb.mesh.position, rayDir, 0.85, 4);
      if (hitMob) {
        sounds.playSnowballHit();
        this.spawnSnowPuff(sb.mesh.position);
        this.scene.remove(sb.mesh);
        sb.mesh.geometry.dispose();
        (sb.mesh.material as THREE.Material).dispose();
        this.snowballs.splice(i, 1);
        continue;
      }

      // Check block collision
      const bx = Math.floor(sb.mesh.position.x);
      const by = Math.floor(sb.mesh.position.y);
      const bz = Math.floor(sb.mesh.position.z);
      if (this.world.isSolid(bx, by, bz) || sb.mesh.position.y <= 0) {
        sounds.playSnowballHit();
        this.spawnSnowPuff(sb.mesh.position);
        this.scene.remove(sb.mesh);
        sb.mesh.geometry.dispose();
        (sb.mesh.material as THREE.Material).dispose();
        this.snowballs.splice(i, 1);
        continue;
      }

      if (sb.life > 5.0) {
        this.scene.remove(sb.mesh);
        sb.mesh.geometry.dispose();
        (sb.mesh.material as THREE.Material).dispose();
        this.snowballs.splice(i, 1);
      }
    }
  }

  private spawnSnowPuff(pos: THREE.Vector3) {
    for (let i = 0; i < 8; i++) {
      const geom = new THREE.BoxGeometry(0.08, 0.08, 0.08);
      const mat = new THREE.MeshBasicMaterial({ color: 0xf5f9fc, transparent: true, opacity: 0.9 });
      const mesh = new THREE.Mesh(geom, mat);
      mesh.position.copy(pos).add(new THREE.Vector3(
        (Math.random() - 0.5) * 0.35,
        (Math.random() - 0.5) * 0.35,
        (Math.random() - 0.5) * 0.35
      ));
      const vel = new THREE.Vector3(
        (Math.random() - 0.5) * 3.2,
        Math.random() * 2.5 + 0.8,
        (Math.random() - 0.5) * 3.2
      );
      this.scene.add(mesh);
      this.particles.push({ mesh, velocity: vel, life: 0, maxLife: 0.38 });
    }
  }

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

      this.miningSwingTimer += dt;
      if (this.miningSwingTimer >= 0.18) {
        this.miningSwingTimer = 0;
        this.viewModel.triggerSwing();
        this.steve.triggerSwing();
        sounds.playHit(blockType);
        this.spawnChipParticle(x, y, z, blockType);
      }

      const baseTime = this.getBlockHardnessTime(blockType);
      const activeItem = this.inventory.slots[this.inventory.selectedHotbarIndex];
      let toolMultiplier = 1.0;
      if (activeItem) {
        if (activeItem.id === ITEM_TYPES.DIAMOND_PICKAXE) toolMultiplier = 4.5;
        else if (activeItem.id === ITEM_TYPES.IRON_PICKAXE) toolMultiplier = 3.0;
        else if (activeItem.id === ITEM_TYPES.STONE_PICKAXE) toolMultiplier = 2.0;
        else if (activeItem.id === ITEM_TYPES.WOOD_PICKAXE) toolMultiplier = 1.5;
      }
      const finalTime = Math.max(0.12, baseTime / toolMultiplier);

      this.miningProgress += dt / finalTime;
      this.breakOverlay.setProgress(x, y, z, this.miningProgress);

      if (this.miningProgress >= 1.0) {
        this.world.setBlock(x, y, z, BLOCK_TYPES.AIR);
        this.spawnDebris(x, y, z, blockType);
        sounds.playBlockBreak(blockType);

        // Spawn satisfying 3D floating Item Drop!
        this.spawnItemDrop(x, y, z, blockType);

        // Deduct tool durability
        if (this.physics.gameMode !== 'creative') {
          const broke = this.inventory.reduceToolDurability(this.inventory.selectedHotbarIndex, 1);
          if (broke) {
            this.viewModel.triggerToolBreak();
            sounds.playToolBreak();
            this.spawnToolBreakParticles(activeItem?.id);
            this.updateHeldItem();
          }
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

  setDifficulty(difficulty: GameDifficulty) {
    this.physics.difficulty = difficulty;
    if (difficulty === 'peaceful') {
      for (let i = this.mobs.mobs.length - 1; i >= 0; i--) {
        if (this.mobs.mobs[i].type === 'zombie' || this.mobs.mobs[i].type === 'creeper') {
          this.mobs.mobs[i].destroy();
          this.mobs.mobs.splice(i, 1);
        }
      }
    }
  }

  setGameMode(mode: GameMode) {
    this.physics.gameMode = mode;
    if (mode === 'survival') {
      this.physics.isFlying = false;
    }
  }

  toggleFlight() {
    this.physics.toggleFlight();
  }

  spawnMob(type: MobType) {
    const dir = new THREE.Vector3();
    this.camera.getWorldDirection(dir);
    dir.y = 0;
    dir.normalize();
    const spawnPos = this.physics.position.clone().addScaledVector(dir, 4.0);
    spawnPos.y = this.world.getHighestSolidBlock(Math.floor(spawnPos.x), Math.floor(spawnPos.z)) + 0.1;
    return this.mobs.spawnMob(type, spawnPos);
  }

  destroy() {
    this.isRunning = false;
    this.weather.destroy();
    this.mobs.destroy();
    this.breakOverlay.dispose();

    // Clean up snowballs & torch lights
    this.snowballs.forEach((sb) => {
      this.scene.remove(sb.mesh);
      sb.mesh.geometry.dispose();
      (sb.mesh.material as THREE.Material).dispose();
    });
    this.snowballs = [];
    this.torchLightPool.forEach((l) => this.scene.remove(l));
    this.torchLightPool = [];
    if (this.heldTorchLight) {
      this.scene.remove(this.heldTorchLight);
    }

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
