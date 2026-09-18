import * as THREE from 'three';
import { BLOCK_TYPES } from './world';
import { ITEM_TYPES, ARMOR_DATA, ItemStack } from './inventory';
import { BlockTextureAtlas } from './textures';

// Helper to create pixel-perfect procedural canvas textures
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

// Generate canonical Steve textures for all body parts
export function generateSteveMaterials() {
  // 1. Head textures
  // Front Face: Eyes, Hair, Nose, Mouth, Goatee
  const headFrontTex = createPixelTexture(8, 8, (ctx) => {
    // Skin base
    ctx.fillStyle = '#c99b79';
    ctx.fillRect(0, 0, 8, 8);
    // Hair (top 2 rows + sides)
    ctx.fillStyle = '#4a3219';
    ctx.fillRect(0, 0, 8, 2);
    ctx.fillRect(0, 2, 1, 1);
    ctx.fillRect(7, 2, 1, 1);
    // Eyes: white + blue/purple pupil
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(1, 3, 2, 1);
    ctx.fillRect(5, 3, 2, 1);
    ctx.fillStyle = '#3a3d82';
    ctx.fillRect(2, 3, 1, 1);
    ctx.fillRect(5, 3, 1, 1);
    // Nose
    ctx.fillStyle = '#b78765';
    ctx.fillRect(3, 4, 2, 1);
    // Mouth / Goatee
    ctx.fillStyle = '#5c3a21';
    ctx.fillRect(2, 5, 4, 1);
    ctx.fillStyle = '#874f38';
    ctx.fillRect(3, 5, 2, 1);
  });

  // Top Face: Full hair
  const headTopTex = createPixelTexture(8, 8, (ctx) => {
    ctx.fillStyle = '#4a3219';
    ctx.fillRect(0, 0, 8, 8);
    ctx.fillStyle = '#3a2412';
    ctx.fillRect(1, 1, 3, 3);
    ctx.fillRect(4, 3, 3, 3);
  });

  // Sides & Back: Hair and skin
  const headSideTex = createPixelTexture(8, 8, (ctx) => {
    ctx.fillStyle = '#c99b79';
    ctx.fillRect(0, 0, 8, 8);
    ctx.fillStyle = '#4a3219';
    ctx.fillRect(0, 0, 8, 3);
    ctx.fillRect(0, 3, 3, 2);
    ctx.fillRect(6, 3, 2, 2);
  });

  const headBackTex = createPixelTexture(8, 8, (ctx) => {
    ctx.fillStyle = '#4a3219';
    ctx.fillRect(0, 0, 8, 6);
    ctx.fillStyle = '#c99b79';
    ctx.fillRect(0, 6, 8, 2);
  });

  const headBottomTex = createPixelTexture(8, 8, (ctx) => {
    ctx.fillStyle = '#b78765';
    ctx.fillRect(0, 0, 8, 8);
  });

  // Materials for Head box: [+X, -X, +Y, -Y, +Z, -Z] -> [right, left, top, bottom, front, back]
  const headMaterials = [
    new THREE.MeshLambertMaterial({ map: headSideTex }),
    new THREE.MeshLambertMaterial({ map: headSideTex }),
    new THREE.MeshLambertMaterial({ map: headTopTex }),
    new THREE.MeshLambertMaterial({ map: headBottomTex }),
    new THREE.MeshLambertMaterial({ map: headFrontTex }),
    new THREE.MeshLambertMaterial({ map: headBackTex }),
  ];

  // 2. Torso textures (Cyan shirt)
  const torsoFrontTex = createPixelTexture(8, 12, (ctx) => {
    // Shirt base
    ctx.fillStyle = '#009494';
    ctx.fillRect(0, 0, 8, 10);
    // Neck collar skin
    ctx.fillStyle = '#c99b79';
    ctx.fillRect(2, 0, 4, 2);
    ctx.fillRect(3, 2, 2, 1);
    // Belt / pants top
    ctx.fillStyle = '#2b347e';
    ctx.fillRect(0, 10, 8, 2);
    ctx.fillStyle = '#1c2254';
    ctx.fillRect(3, 10, 2, 2);
  });

  const torsoBackTex = createPixelTexture(8, 12, (ctx) => {
    ctx.fillStyle = '#009494';
    ctx.fillRect(0, 0, 8, 10);
    ctx.fillStyle = '#2b347e';
    ctx.fillRect(0, 10, 8, 2);
  });

  const torsoSideTex = createPixelTexture(4, 12, (ctx) => {
    ctx.fillStyle = '#008282';
    ctx.fillRect(0, 0, 4, 10);
    ctx.fillStyle = '#222b6c';
    ctx.fillRect(0, 10, 4, 2);
  });

  const torsoTopTex = createPixelTexture(8, 4, (ctx) => {
    ctx.fillStyle = '#009494';
    ctx.fillRect(0, 0, 8, 4);
    ctx.fillStyle = '#c99b79';
    ctx.fillRect(2, 1, 4, 2);
  });

  const torsoMaterials = [
    new THREE.MeshLambertMaterial({ map: torsoSideTex }),
    new THREE.MeshLambertMaterial({ map: torsoSideTex }),
    new THREE.MeshLambertMaterial({ map: torsoTopTex }),
    new THREE.MeshLambertMaterial({ map: torsoTopTex }),
    new THREE.MeshLambertMaterial({ map: torsoFrontTex }),
    new THREE.MeshLambertMaterial({ map: torsoBackTex }),
  ];

  // 3. Arm textures (Cyan short sleeve on top 40%, skin on bottom 60%)
  const armFrontTex = createPixelTexture(4, 12, (ctx) => {
    ctx.fillStyle = '#009494';
    ctx.fillRect(0, 0, 4, 4);
    ctx.fillStyle = '#c99b79';
    ctx.fillRect(0, 4, 4, 8);
    // subtle skin shading on knuckles
    ctx.fillStyle = '#b78765';
    ctx.fillRect(0, 11, 4, 1);
  });

  const armSideTex = createPixelTexture(4, 12, (ctx) => {
    ctx.fillStyle = '#008282';
    ctx.fillRect(0, 0, 4, 4);
    ctx.fillStyle = '#c99b79';
    ctx.fillRect(0, 4, 4, 8);
  });

  const armTopTex = createPixelTexture(4, 4, (ctx) => {
    ctx.fillStyle = '#009494';
    ctx.fillRect(0, 0, 4, 4);
  });

  const armBottomTex = createPixelTexture(4, 4, (ctx) => {
    ctx.fillStyle = '#c99b79';
    ctx.fillRect(0, 0, 4, 4);
  });

  const armMaterials = [
    new THREE.MeshLambertMaterial({ map: armSideTex }),
    new THREE.MeshLambertMaterial({ map: armSideTex }),
    new THREE.MeshLambertMaterial({ map: armTopTex }),
    new THREE.MeshLambertMaterial({ map: armBottomTex }),
    new THREE.MeshLambertMaterial({ map: armFrontTex }),
    new THREE.MeshLambertMaterial({ map: armSideTex }),
  ];

  // 4. Leg textures (Jeans + Dark Shoes)
  const legFrontTex = createPixelTexture(4, 12, (ctx) => {
    ctx.fillStyle = '#2b347e';
    ctx.fillRect(0, 0, 4, 10);
    // Shoes
    ctx.fillStyle = '#4e4e4e';
    ctx.fillRect(0, 10, 4, 2);
  });

  const legSideTex = createPixelTexture(4, 12, (ctx) => {
    ctx.fillStyle = '#222b6c';
    ctx.fillRect(0, 0, 4, 10);
    ctx.fillStyle = '#3a3a3a';
    ctx.fillRect(0, 10, 4, 2);
  });

  const legBottomTex = createPixelTexture(4, 4, (ctx) => {
    ctx.fillStyle = '#3a3a3a';
    ctx.fillRect(0, 0, 4, 4);
  });

  const legMaterials = [
    new THREE.MeshLambertMaterial({ map: legSideTex }),
    new THREE.MeshLambertMaterial({ map: legSideTex }),
    new THREE.MeshLambertMaterial({ map: legSideTex }),
    new THREE.MeshLambertMaterial({ map: legBottomTex }),
    new THREE.MeshLambertMaterial({ map: legFrontTex }),
    new THREE.MeshLambertMaterial({ map: legSideTex }),
  ];

  return { headMaterials, torsoMaterials, armMaterials, legMaterials };
}

// 3D Player Character (Steve) for 3rd person and shadows
export class SteveCharacter {
  group: THREE.Group;
  head: THREE.Group;
  torso: THREE.Mesh;
  rightArmPivot: THREE.Group;
  rightArm: THREE.Mesh;
  leftArmPivot: THREE.Group;
  leftArm: THREE.Mesh;
  rightLegPivot: THREE.Group;
  rightLeg: THREE.Mesh;
  leftLegPivot: THREE.Group;
  leftLeg: THREE.Mesh;
  rightHandSocket: THREE.Group;
  currentHeldMesh: THREE.Object3D | null = null;

  // 3D Armor Overlays
  helmetMesh: THREE.Mesh | null = null;
  chestplateMesh: THREE.Mesh | null = null;
  rightShoulderMesh: THREE.Mesh | null = null;
  leftShoulderMesh: THREE.Mesh | null = null;
  rightLegMesh: THREE.Mesh | null = null;
  leftLegMesh: THREE.Mesh | null = null;
  rightBootMesh: THREE.Mesh | null = null;
  leftBootMesh: THREE.Mesh | null = null;

  walkTime: number = 0;
  swingTime: number = 0;
  isSwinging: boolean = false;

  constructor() {
    this.group = new THREE.Group();
    const mats = generateSteveMaterials();

    // Head (0.5 x 0.5 x 0.5)
    this.head = new THREE.Group();
    const headGeo = new THREE.BoxGeometry(0.5, 0.5, 0.5);
    const headMesh = new THREE.Mesh(headGeo, mats.headMaterials);
    headMesh.position.y = 0.25; // center on pivot
    this.head.add(headMesh);
    this.head.position.y = 1.4;
    this.group.add(this.head);

    // Torso (0.5 x 0.72 x 0.25)
    const torsoGeo = new THREE.BoxGeometry(0.5, 0.72, 0.25);
    this.torso = new THREE.Mesh(torsoGeo, mats.torsoMaterials);
    this.torso.position.y = 1.04;
    this.group.add(this.torso);

    // Right Arm with Shoulder Pivot
    this.rightArmPivot = new THREE.Group();
    this.rightArmPivot.position.set(0.38, 1.36, 0);
    const armGeo = new THREE.BoxGeometry(0.24, 0.72, 0.24);
    this.rightArm = new THREE.Mesh(armGeo, mats.armMaterials);
    this.rightArm.position.y = -0.36; // Hang down from shoulder
    this.rightArmPivot.add(this.rightArm);

    // Right Hand Socket for held tools/blocks
    this.rightHandSocket = new THREE.Group();
    this.rightHandSocket.position.set(0, -0.68, 0.1);
    this.rightArmPivot.add(this.rightHandSocket);
    this.group.add(this.rightArmPivot);

    // Left Arm with Shoulder Pivot
    this.leftArmPivot = new THREE.Group();
    this.leftArmPivot.position.set(-0.38, 1.36, 0);
    this.leftArm = new THREE.Mesh(armGeo, mats.armMaterials);
    this.leftArm.position.y = -0.36;
    this.leftArmPivot.add(this.leftArm);
    this.group.add(this.leftArmPivot);

    // Right Leg with Hip Pivot
    const legGeo = new THREE.BoxGeometry(0.24, 0.72, 0.24);
    this.rightLegPivot = new THREE.Group();
    this.rightLegPivot.position.set(0.13, 0.72, 0);
    this.rightLeg = new THREE.Mesh(legGeo, mats.legMaterials);
    this.rightLeg.position.y = -0.36;
    this.rightLegPivot.add(this.rightLeg);
    this.group.add(this.rightLegPivot);

    // Left Leg with Hip Pivot
    this.leftLegPivot = new THREE.Group();
    this.leftLegPivot.position.set(-0.13, 0.72, 0);
    this.leftLeg = new THREE.Mesh(legGeo, mats.legMaterials);
    this.leftLeg.position.y = -0.36;
    this.leftLegPivot.add(this.leftLeg);
    this.group.add(this.leftLegPivot);
  }

  // Update 3D visual armor equipped on Steve
  setEquippedArmor(armorSlots: (ItemStack | null)[]) {
    const getArmorColor = (item: ItemStack | null): number | null => {
      if (!item) return null;
      const info = ARMOR_DATA[item.id];
      if (!info) return null;
      switch (info.tier) {
        case 'leather':
          return 0x8d5524;
        case 'iron':
          return 0xd0d8dc;
        case 'gold':
          return 0xffd700;
        case 'diamond':
          return 0x00d2d3;
        default:
          return 0xd0d8dc;
      }
    };

    // 1. Helmet (Slot 0)
    if (this.helmetMesh) {
      this.head.remove(this.helmetMesh);
      this.helmetMesh = null;
    }
    const helmetCol = getArmorColor(armorSlots[0]);
    if (helmetCol !== null) {
      const geo = new THREE.BoxGeometry(0.56, 0.56, 0.56);
      const mat = new THREE.MeshStandardMaterial({
        color: helmetCol,
        roughness: 0.35,
        metalness: helmetCol === 0x8d5524 ? 0.05 : 0.45,
      });
      this.helmetMesh = new THREE.Mesh(geo, mat);
      this.helmetMesh.position.y = 0.25;
      this.head.add(this.helmetMesh);
    }

    // 2. Chestplate (Slot 1)
    if (this.chestplateMesh) {
      this.torso.remove(this.chestplateMesh);
      this.chestplateMesh = null;
    }
    if (this.rightShoulderMesh) {
      this.rightArmPivot.remove(this.rightShoulderMesh);
      this.rightShoulderMesh = null;
    }
    if (this.leftShoulderMesh) {
      this.leftArmPivot.remove(this.leftShoulderMesh);
      this.leftShoulderMesh = null;
    }
    const chestCol = getArmorColor(armorSlots[1]);
    if (chestCol !== null) {
      const mat = new THREE.MeshStandardMaterial({
        color: chestCol,
        roughness: 0.35,
        metalness: chestCol === 0x8d5524 ? 0.05 : 0.45,
      });
      const chestGeo = new THREE.BoxGeometry(0.55, 0.74, 0.28);
      this.chestplateMesh = new THREE.Mesh(chestGeo, mat);
      this.torso.add(this.chestplateMesh);

      const shoulderGeo = new THREE.BoxGeometry(0.28, 0.32, 0.28);
      this.rightShoulderMesh = new THREE.Mesh(shoulderGeo, mat);
      this.rightShoulderMesh.position.y = -0.16;
      this.rightArmPivot.add(this.rightShoulderMesh);

      this.leftShoulderMesh = new THREE.Mesh(shoulderGeo, mat);
      this.leftShoulderMesh.position.y = -0.16;
      this.leftArmPivot.add(this.leftShoulderMesh);
    }

    // 3. Leggings (Slot 2)
    if (this.rightLegMesh) {
      this.rightLegPivot.remove(this.rightLegMesh);
      this.rightLegMesh = null;
    }
    if (this.leftLegMesh) {
      this.leftLegPivot.remove(this.leftLegMesh);
      this.leftLegMesh = null;
    }
    const legCol = getArmorColor(armorSlots[2]);
    if (legCol !== null) {
      const mat = new THREE.MeshStandardMaterial({
        color: legCol,
        roughness: 0.4,
        metalness: legCol === 0x8d5524 ? 0.05 : 0.4,
      });
      const legArmorGeo = new THREE.BoxGeometry(0.27, 0.5, 0.27);

      this.rightLegMesh = new THREE.Mesh(legArmorGeo, mat);
      this.rightLegMesh.position.y = -0.24;
      this.rightLegPivot.add(this.rightLegMesh);

      this.leftLegMesh = new THREE.Mesh(legArmorGeo, mat);
      this.leftLegMesh.position.y = -0.24;
      this.leftLegPivot.add(this.leftLegMesh);
    }

    // 4. Boots (Slot 3)
    if (this.rightBootMesh) {
      this.rightLegPivot.remove(this.rightBootMesh);
      this.rightBootMesh = null;
    }
    if (this.leftBootMesh) {
      this.leftLegPivot.remove(this.leftBootMesh);
      this.leftBootMesh = null;
    }
    const bootCol = getArmorColor(armorSlots[3]);
    if (bootCol !== null) {
      const mat = new THREE.MeshStandardMaterial({
        color: bootCol,
        roughness: 0.45,
        metalness: bootCol === 0x8d5524 ? 0.05 : 0.4,
      });
      const bootGeo = new THREE.BoxGeometry(0.28, 0.26, 0.28);

      this.rightBootMesh = new THREE.Mesh(bootGeo, mat);
      this.rightBootMesh.position.y = -0.52;
      this.rightLegPivot.add(this.rightBootMesh);

      this.leftBootMesh = new THREE.Mesh(bootGeo, mat);
      this.leftBootMesh.position.y = -0.52;
      this.leftLegPivot.add(this.leftBootMesh);
    }
  }

  triggerSwing() {
    this.isSwinging = true;
    this.swingTime = 0;
  }

  update(
    dt: number,
    isMoving: boolean,
    moveSpeed: number,
    pitch: number,
    yaw: number,
    inWater: boolean
  ) {
    // 1. Walking Animation
    if (isMoving) {
      this.walkTime += dt * Math.max(4.0, moveSpeed * 1.5);
      const legAngle = Math.sin(this.walkTime) * 0.6;
      this.rightLegPivot.rotation.x = legAngle;
      this.leftLegPivot.rotation.x = -legAngle;

      if (!this.isSwinging) {
        this.rightArmPivot.rotation.x = -legAngle * 0.7;
        this.leftArmPivot.rotation.x = legAngle * 0.7;
      }
    } else {
      // Return to neutral
      this.rightLegPivot.rotation.x *= 0.8;
      this.leftLegPivot.rotation.x *= 0.8;
      if (!this.isSwinging) {
        this.rightArmPivot.rotation.x *= 0.8;
        this.leftArmPivot.rotation.x *= 0.8;
      }
    }

    // 2. Swimming Pose
    if (inWater) {
      this.rightLegPivot.rotation.x = Math.sin(this.walkTime * 2) * 0.3;
      this.leftLegPivot.rotation.x = -Math.sin(this.walkTime * 2) * 0.3;
    }

    // 3. Head follows pitch & yaw (facing forward)
    this.head.rotation.x = pitch;
    this.head.rotation.y = 0;

    // Body rotates with player yaw facing forward (away from 3rd-person behind camera)
    this.group.rotation.y = yaw + Math.PI;

    // 4. Mining / Placing Swing Animation
    if (this.isSwinging) {
      this.swingTime += dt * 6.5; // ~150ms swing
      const swingProgress = Math.sin(this.swingTime * Math.PI);
      this.rightArmPivot.rotation.x = -swingProgress * 1.2;
      this.rightArmPivot.rotation.z = -swingProgress * 0.3;

      if (this.swingTime >= 1.0) {
        this.isSwinging = false;
        this.swingTime = 0;
        this.rightArmPivot.rotation.x = 0;
        this.rightArmPivot.rotation.z = 0;
      }
    }
  }

  setHeldItem(mesh: THREE.Object3D | null) {
    if (this.currentHeldMesh) {
      this.rightHandSocket.remove(this.currentHeldMesh);
      this.currentHeldMesh = null;
    }
    if (mesh) {
      this.currentHeldMesh = mesh;
      this.rightHandSocket.add(mesh);
    }
  }
}

// Helper to create materials for First-Person Arm
function generateFirstPersonArmMaterials(sleeveColor: string = '#009494', sleeveDark: string = '#008282') {
  // Top Face (+Y): Shoulder at +Z (high V/Y in texture), hand reaching forward to -Z
  const topTex = createPixelTexture(4, 16, (ctx) => {
    // Knuckles / forearm at top
    ctx.fillStyle = '#c99b79';
    ctx.fillRect(0, 0, 4, 11);
    ctx.fillStyle = '#b78765';
    ctx.fillRect(0, 0, 4, 2); // knuckle crease
    // Sleeve at shoulder
    ctx.fillStyle = sleeveColor;
    ctx.fillRect(0, 11, 4, 5);
  });

  // Bottom Face (-Y)
  const bottomTex = createPixelTexture(4, 16, (ctx) => {
    ctx.fillStyle = '#b88665';
    ctx.fillRect(0, 0, 4, 11);
    ctx.fillStyle = sleeveDark;
    ctx.fillRect(0, 11, 4, 5);
  });

  // Sides (+X and -X)
  const sideTex = createPixelTexture(4, 16, (ctx) => {
    ctx.fillStyle = '#c99b79';
    ctx.fillRect(0, 0, 4, 11);
    ctx.fillStyle = sleeveColor;
    ctx.fillRect(0, 11, 4, 5);
  });

  // Knuckles tip (-Z, facing forward into world)
  const fistTex = createPixelTexture(4, 4, (ctx) => {
    ctx.fillStyle = '#c99b79';
    ctx.fillRect(0, 0, 4, 4);
    ctx.fillStyle = '#b78765';
    ctx.fillRect(1, 1, 2, 2);
  });

  // Shoulder cut (+Z)
  const shoulderTex = createPixelTexture(4, 4, (ctx) => {
    ctx.fillStyle = sleeveDark;
    ctx.fillRect(0, 0, 4, 4);
  });

  return [
    new THREE.MeshLambertMaterial({ map: sideTex }),     // +X (Right side)
    new THREE.MeshLambertMaterial({ map: sideTex }),     // -X (Left side)
    new THREE.MeshLambertMaterial({ map: topTex }),      // +Y (Top surface)
    new THREE.MeshLambertMaterial({ map: bottomTex }),   // -Y (Bottom surface)
    new THREE.MeshLambertMaterial({ map: shoulderTex }), // +Z (Shoulder cut)
    new THREE.MeshLambertMaterial({ map: fistTex }),     // -Z (Knuckles forward)
  ];
}

// First-Person View Model: Attached directly to the camera!
// Shows Steve's right arm on the lower right reaching forward holding tools/blocks
export class FirstPersonViewModel {
  root: THREE.Group;
  armGroup: THREE.Group;
  armMesh: THREE.Mesh;
  itemSocket: THREE.Group;
  currentHeldMesh: THREE.Object3D | null = null;

  swingProgress: number = 0;
  isSwinging: boolean = false;
  bobTime: number = 0;

  // Tool destruction effect: recoil & violent shake when durability reaches 0
  destructionTime: number = 0;
  isDestructing: boolean = false;

  // Base resting transform in camera space
  // Enters from bottom-right (x: 0.32, y: -0.28), reaches forward into screen (z: -0.38)
  basePos = new THREE.Vector3(0.32, -0.26, -0.36);
  baseRot = new THREE.Euler(0.18, -0.22, 0.14);

  currentSleeveColor: string = '#009494';

  constructor() {
    this.root = new THREE.Group();
    this.armGroup = new THREE.Group();
    this.armGroup.position.copy(this.basePos);
    this.armGroup.rotation.copy(this.baseRot);
    this.root.add(this.armGroup);

    // First person arm: (width 0.12, height 0.12, length 0.48)
    // Translated so shoulder is at (0, 0, 0) and hand reaches forward to (0, 0, -0.48)
    const armGeo = new THREE.BoxGeometry(0.12, 0.12, 0.48);
    armGeo.translate(0, 0, -0.24);

    const mats = generateFirstPersonArmMaterials(this.currentSleeveColor);
    this.armMesh = new THREE.Mesh(armGeo, mats);
    this.armGroup.add(this.armMesh);

    // Socket at Steve's hand (at z = -0.46) to hold tools and blocks
    this.itemSocket = new THREE.Group();
    this.itemSocket.position.set(0.01, 0.02, -0.46);
    // Orient tool naturally forward in Steve's grip
    this.itemSocket.rotation.set(-0.35, 0.20, -0.35);
    this.armGroup.add(this.itemSocket);
  }

  // Update sleeve color when chestplate armor is equipped
  setSleeveColor(colorHex: string) {
    if (this.currentSleeveColor === colorHex) return;
    this.currentSleeveColor = colorHex;
    const mats = generateFirstPersonArmMaterials(colorHex);
    this.armMesh.material = mats;
  }

  triggerSwing() {
    this.isSwinging = true;
    this.swingProgress = 0;
  }

  // Triggered when tool durability reaches 0
  triggerToolBreak() {
    this.isDestructing = true;
    this.destructionTime = 0.35; // 350ms destruction recoil
    if (this.currentHeldMesh) {
      this.itemSocket.remove(this.currentHeldMesh);
      this.currentHeldMesh = null;
    }
  }

  update(dt: number, isMoving: boolean, moveSpeed: number) {
    // 1. Natural Walk Bobbing
    if (isMoving) {
      this.bobTime += dt * Math.max(5.0, moveSpeed * 1.6);
      const bobX = Math.sin(this.bobTime * 0.5) * 0.018;
      const bobY = Math.abs(Math.cos(this.bobTime)) * 0.022;
      this.armGroup.position.x = this.basePos.x + bobX;
      this.armGroup.position.y = this.basePos.y + bobY;
    } else {
      this.armGroup.position.lerp(this.basePos, 0.12);
    }

    // 2. Tool Destruction Recoil & Shake
    if (this.destructionTime > 0) {
      this.destructionTime -= dt;
      const shakeAmp = (this.destructionTime / 0.35) * 0.035;
      const shakeRot = (this.destructionTime / 0.35) * 0.25;

      this.armGroup.position.x = this.basePos.x + (Math.random() - 0.5) * shakeAmp;
      this.armGroup.position.y = this.basePos.y - (this.destructionTime / 0.35) * 0.08;
      this.armGroup.position.z = this.basePos.z + (this.destructionTime / 0.35) * 0.12;

      this.armGroup.rotation.x = this.baseRot.x + (Math.random() - 0.5) * shakeRot;
      this.armGroup.rotation.y = this.baseRot.y + (Math.random() - 0.5) * shakeRot;
      this.armGroup.rotation.z = this.baseRot.z + (Math.random() - 0.5) * shakeRot;

      if (this.destructionTime <= 0) {
        this.isDestructing = false;
        this.armGroup.position.copy(this.basePos);
        this.armGroup.rotation.copy(this.baseRot);
      }
      return;
    }

    // 3. Minecraft First-Person Swing Arc
    if (this.isSwinging) {
      this.swingProgress += dt * 6.5;
      const t = Math.min(this.swingProgress, 1.0);
      const curve = Math.sin(t * Math.PI);

      // Rotate down and swing inward across screen towards targeted block
      this.armGroup.rotation.x = this.baseRot.x + curve * 0.45;
      this.armGroup.rotation.y = this.baseRot.y - curve * 0.35;
      this.armGroup.rotation.z = this.baseRot.z + curve * 0.28;
      this.armGroup.position.z = this.basePos.z - curve * 0.07;
      this.armGroup.position.x = this.basePos.x - curve * 0.04;

      if (this.swingProgress >= 1.0) {
        this.isSwinging = false;
        this.swingProgress = 0;
        this.armGroup.rotation.copy(this.baseRot);
        this.armGroup.position.copy(this.basePos);
      }
    } else {
      this.armGroup.rotation.x = THREE.MathUtils.lerp(this.armGroup.rotation.x, this.baseRot.x, 0.18);
      this.armGroup.rotation.y = THREE.MathUtils.lerp(this.armGroup.rotation.y, this.baseRot.y, 0.18);
      this.armGroup.rotation.z = THREE.MathUtils.lerp(this.armGroup.rotation.z, this.baseRot.z, 0.18);
    }
  }

  setHeldItem(mesh: THREE.Object3D | null) {
    if (this.currentHeldMesh) {
      this.itemSocket.remove(this.currentHeldMesh);
      this.currentHeldMesh = null;
    }
    if (mesh) {
      this.currentHeldMesh = mesh;
      this.itemSocket.add(mesh);
    }
  }
}

// 3D Item & Tool Mesh Generator for First-Person & Third-Person Hand
export function createHeldItemMesh(
  itemId: number,
  atlas: BlockTextureAtlas,
  isFirstPerson: boolean = true
): THREE.Object3D | null {
  if (itemId === 0) return null;

  const scale = isFirstPerson ? 1.0 : 0.85;
  const group = new THREE.Group();

  // 1. Is it a Tool? (Pickaxes, Swords)
  const isTool =
    itemId === ITEM_TYPES.WOOD_PICKAXE ||
    itemId === ITEM_TYPES.STONE_PICKAXE ||
    itemId === ITEM_TYPES.IRON_PICKAXE ||
    itemId === ITEM_TYPES.DIAMOND_PICKAXE ||
    itemId === ITEM_TYPES.WOOD_SWORD ||
    itemId === ITEM_TYPES.DIAMOND_SWORD;

  if (isTool) {
    let headColor = 0x866043;
    let isPick = true;

    if (itemId === ITEM_TYPES.WOOD_PICKAXE) headColor = 0x866043;
    else if (itemId === ITEM_TYPES.STONE_PICKAXE) headColor = 0x888888;
    else if (itemId === ITEM_TYPES.IRON_PICKAXE) headColor = 0xd8d8d8;
    else if (itemId === ITEM_TYPES.DIAMOND_PICKAXE) headColor = 0x4dedf4;
    else if (itemId === ITEM_TYPES.WOOD_SWORD) {
      headColor = 0x866043;
      isPick = false;
    } else if (itemId === ITEM_TYPES.DIAMOND_SWORD) {
      headColor = 0x4dedf4;
      isPick = false;
    }

    const stickMat = new THREE.MeshLambertMaterial({ color: 0x6e4e36 });
    const headMat = new THREE.MeshLambertMaterial({ color: headColor });

    if (isPick) {
      // Pickaxe Handle
      const handle = new THREE.Mesh(new THREE.BoxGeometry(0.035 * scale, 0.44 * scale, 0.035 * scale), stickMat);
      handle.position.set(0, 0.12 * scale, 0);
      group.add(handle);

      // Pickaxe Head curved top
      const pickHead = new THREE.Mesh(new THREE.BoxGeometry(0.28 * scale, 0.06 * scale, 0.05 * scale), headMat);
      pickHead.position.set(0, 0.32 * scale, 0);
      group.add(pickHead);
    } else {
      // Sword Handle & Crossguard
      const handle = new THREE.Mesh(new THREE.BoxGeometry(0.04 * scale, 0.12 * scale, 0.04 * scale), stickMat);
      handle.position.set(0, 0.02 * scale, 0);
      group.add(handle);

      const guard = new THREE.Mesh(new THREE.BoxGeometry(0.16 * scale, 0.04 * scale, 0.06 * scale), stickMat);
      guard.position.set(0, 0.1 * scale, 0);
      group.add(guard);

      // Sword Blade
      const blade = new THREE.Mesh(new THREE.BoxGeometry(0.07 * scale, 0.44 * scale, 0.025 * scale), headMat);
      blade.position.set(0, 0.34 * scale, 0);
      group.add(blade);
    }

    // Orient tool naturally forward and upright in hand
    group.rotation.set(-0.25, 0.15, -0.1);
    group.position.set(0, 0.04, -0.06);
    return group;
  }

  // 2. Is it Armor? (Helmet, Chestplate, Leggings, Boots)
  const armorInfo = ARMOR_DATA[itemId];
  if (armorInfo) {
    let col = 0xd0d8dc;
    if (armorInfo.tier === 'leather') col = 0x8d5524;
    else if (armorInfo.tier === 'gold') col = 0xffd700;
    else if (armorInfo.tier === 'diamond') col = 0x00d2d3;

    const armorMat = new THREE.MeshStandardMaterial({
      color: col,
      roughness: 0.35,
      metalness: armorInfo.tier === 'leather' ? 0.05 : 0.45,
    });

    const armorMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.18 * scale, 0.18 * scale, 0.18 * scale),
      armorMat
    );
    armorMesh.position.set(0, 0.06, 0);
    armorMesh.rotation.set(0.3, 0.4, 0.1);
    group.add(armorMesh);
    return group;
  }

  // 3. Is it Food? (Apple, Bread)
  if (itemId === ITEM_TYPES.APPLE) {
    const appleMat = new THREE.MeshLambertMaterial({ color: 0xdd2222 });
    const apple = new THREE.Mesh(
      new THREE.BoxGeometry(0.14 * scale, 0.14 * scale, 0.14 * scale),
      appleMat
    );
    apple.position.set(0, 0.07, 0);
    group.add(apple);

    // Green leaf stem
    const leaf = new THREE.Mesh(
      new THREE.BoxGeometry(0.04 * scale, 0.05 * scale, 0.03 * scale),
      new THREE.MeshLambertMaterial({ color: 0x22aa22 })
    );
    leaf.position.set(0.02, 0.16, 0);
    group.add(leaf);
    return group;
  }

  if (itemId === ITEM_TYPES.BREAD) {
    const bread = new THREE.Mesh(
      new THREE.BoxGeometry(0.22 * scale, 0.11 * scale, 0.13 * scale),
      new THREE.MeshLambertMaterial({ color: 0xc49a45 })
    );
    bread.position.set(0, 0.06, 0);
    bread.rotation.set(0.2, 0.4, 0.1);
    group.add(bread);
    return group;
  }

  // 4. Is it a Torch?
  if (itemId === BLOCK_TYPES.TORCH) {
    const torchWood = new THREE.Mesh(
      new THREE.BoxGeometry(0.05 * scale, 0.28 * scale, 0.05 * scale),
      new THREE.MeshLambertMaterial({ color: 0x6e4e36 })
    );
    torchWood.position.set(0, 0.08, 0);
    group.add(torchWood);

    const flame = new THREE.Mesh(
      new THREE.BoxGeometry(0.06 * scale, 0.06 * scale, 0.06 * scale),
      new THREE.MeshBasicMaterial({ color: 0xffaa00 })
    );
    flame.position.set(0, 0.24, 0);
    group.add(flame);

    group.rotation.set(-0.2, 0.1, 0);
    return group;
  }

  // 5. Is it a Flower / Seaweed?
  if (
    itemId === BLOCK_TYPES.RED_FLOWER ||
    itemId === BLOCK_TYPES.YELLOW_FLOWER ||
    itemId === BLOCK_TYPES.SEAWEED
  ) {
    let flowerColor = 0xff2222;
    if (itemId === BLOCK_TYPES.YELLOW_FLOWER) flowerColor = 0xffe600;
    else if (itemId === BLOCK_TYPES.SEAWEED) flowerColor = 0x228b22;

    const stem = new THREE.Mesh(
      new THREE.BoxGeometry(0.03 * scale, 0.22 * scale, 0.03 * scale),
      new THREE.MeshLambertMaterial({ color: 0x3d7020 })
    );
    stem.position.set(0, 0.08, 0);
    group.add(stem);

    const petal = new THREE.Mesh(
      new THREE.BoxGeometry(0.12 * scale, 0.12 * scale, 0.12 * scale),
      new THREE.MeshBasicMaterial({ color: flowerColor })
    );
    petal.position.set(0, 0.2, 0);
    group.add(petal);

    return group;
  }

  // 6. Is it a Mineral Gem or Ingot?
  if (
    itemId === ITEM_TYPES.COAL ||
    itemId === ITEM_TYPES.IRON_INGOT ||
    itemId === ITEM_TYPES.GOLD_INGOT ||
    itemId === ITEM_TYPES.DIAMOND
  ) {
    let col = 0x222222;
    if (itemId === ITEM_TYPES.IRON_INGOT) col = 0xd8d8d8;
    else if (itemId === ITEM_TYPES.GOLD_INGOT) col = 0xffd700;
    else if (itemId === ITEM_TYPES.DIAMOND) col = 0x5df5e4;

    const mineral = new THREE.Mesh(
      new THREE.BoxGeometry(0.14 * scale, 0.08 * scale, 0.14 * scale),
      new THREE.MeshLambertMaterial({ color: col })
    );
    mineral.position.set(0, 0.08, 0);
    group.add(mineral);
    return group;
  }

  // 7. Default: It's a standard Voxel Block! Render miniature 3D block
  let matIndex = atlas.matIndices.dirt;
  if (itemId === BLOCK_TYPES.GRASS) matIndex = atlas.matIndices.grassTop;
  else if (itemId === BLOCK_TYPES.STONE) matIndex = atlas.matIndices.stone;
  else if (itemId === BLOCK_TYPES.WOOD) matIndex = atlas.matIndices.woodSide;
  else if (itemId === BLOCK_TYPES.LEAVES) matIndex = atlas.matIndices.leaves;
  else if (itemId === BLOCK_TYPES.BRICK) matIndex = atlas.matIndices.brick;
  else if (itemId === BLOCK_TYPES.SAND) matIndex = atlas.matIndices.sand;
  else if (itemId === BLOCK_TYPES.WOOD_PLANKS) matIndex = atlas.matIndices.woodPlanks;
  else if (itemId === BLOCK_TYPES.GLASS) matIndex = atlas.matIndices.glass;
  else if (itemId === BLOCK_TYPES.CRAFTING_TABLE) matIndex = atlas.matIndices.craftingTableSide;
  else if (itemId === BLOCK_TYPES.COAL_ORE) matIndex = atlas.matIndices.coalOre;
  else if (itemId === BLOCK_TYPES.IRON_ORE) matIndex = atlas.matIndices.ironOre;
  else if (itemId === BLOCK_TYPES.GOLD_ORE) matIndex = atlas.matIndices.goldOre;
  else if (itemId === BLOCK_TYPES.DIAMOND_ORE) matIndex = atlas.matIndices.diamondOre;
  else if (itemId === BLOCK_TYPES.BIRCH_WOOD) matIndex = atlas.matIndices.birchWood;
  else if (itemId === BLOCK_TYPES.CORAL_PINK) matIndex = atlas.matIndices.coralPink;
  else if (itemId === BLOCK_TYPES.CORAL_CYAN) matIndex = atlas.matIndices.coralCyan;
  else if (itemId === BLOCK_TYPES.CORAL_YELLOW) matIndex = atlas.matIndices.coralYellow;

  const mat = atlas.materials[matIndex] || atlas.materials[atlas.matIndices.dirt];
  const blockGeo = new THREE.BoxGeometry(0.18 * scale, 0.18 * scale, 0.18 * scale);
  const blockMesh = new THREE.Mesh(blockGeo, mat);
  blockMesh.position.set(0, 0.08, 0);
  blockMesh.rotation.set(0.3, 0.4, 0.1);
  group.add(blockMesh);

  return group;
}
