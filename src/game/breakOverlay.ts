import * as THREE from 'three';

// Procedural 10-stage Minecraft Destruction Decal Textures
// Stage 0: Subtle single hairline crack
// Stage 9: Fully fractured web across the entire block face
export class BlockBreakOverlay {
  mesh: THREE.Mesh;
  private textures: THREE.CanvasTexture[] = [];
  private materials: THREE.MeshBasicMaterial[] = [];
  private currentStage: number = -1;

  constructor(scene: THREE.Scene) {
    this.generateCrackTextures();

    const geo = new THREE.BoxGeometry(1.004, 1.004, 1.004);
    // Initial material with stage 0 texture, invisible until active
    this.mesh = new THREE.Mesh(geo, this.materials[0]);
    this.mesh.visible = false;
    scene.add(this.mesh);
  }

  private generateCrackTextures() {
    // Seeded random-like crack segment coordinates across 16x16 pixels
    const crackBranches = [
      // Stage 0 cracks
      [[7, 7], [8, 8], [9, 9], [9, 10]],
      // Stage 1 cracks
      [[7, 7], [6, 8], [5, 9], [8, 8], [9, 9], [10, 8]],
      // Stage 2 cracks
      [[7, 7], [8, 6], [9, 5], [10, 5], [6, 8], [5, 9], [4, 10]],
      // Stage 3 cracks
      [[4, 4], [5, 5], [6, 6], [7, 7], [8, 8], [9, 9], [10, 10], [11, 11], [7, 8], [8, 9]],
      // Stage 4 cracks
      [[2, 6], [3, 7], [4, 7], [5, 6], [6, 6], [7, 7], [8, 7], [9, 8], [10, 8], [11, 9], [12, 10]],
      // Stage 5 cracks
      [[2, 6], [3, 7], [4, 7], [6, 6], [7, 7], [8, 8], [9, 9], [10, 10], [11, 11], [6, 10], [7, 11], [8, 12], [6, 4], [7, 3]],
      // Stage 6 cracks
      [[1, 3], [2, 4], [3, 5], [4, 6], [5, 6], [6, 7], [7, 8], [8, 9], [9, 9], [10, 10], [11, 11], [12, 12], [8, 5], [9, 4], [10, 3], [5, 9], [4, 10]],
      // Stage 7 cracks
      [[1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8], [8, 9], [9, 10], [10, 11], [11, 12], [12, 13], [13, 14], [8, 4], [9, 3], [10, 2], [6, 10], [5, 11], [4, 12], [11, 7], [12, 6]],
      // Stage 8 cracks
      [[1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8], [8, 9], [9, 10], [10, 11], [11, 12], [12, 13], [13, 14], [8, 4], [9, 3], [10, 2], [11, 2], [6, 10], [5, 11], [4, 12], [3, 13], [11, 7], [12, 6], [13, 5], [3, 8], [2, 9], [8, 12], [8, 13]],
      // Stage 9 cracks (heavily fractured across entire 16x16 face)
      [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8], [8, 9], [9, 10], [10, 11], [11, 12], [12, 13], [13, 14], [14, 15], [8, 4], [9, 3], [10, 2], [11, 2], [12, 1], [6, 10], [5, 11], [4, 12], [3, 13], [2, 14], [11, 7], [12, 6], [13, 5], [14, 4], [3, 8], [2, 9], [1, 10], [8, 12], [8, 13], [8, 14], [4, 3], [3, 2], [12, 10], [13, 11]],
    ];

    for (let s = 0; s < 10; s++) {
      const canvas = document.createElement('canvas');
      canvas.width = 16;
      canvas.height = 16;
      const ctx = canvas.getContext('2d')!;
      ctx.imageSmoothingEnabled = false;

      // Fully transparent background
      ctx.clearRect(0, 0, 16, 16);

      // Draw all crack segments up to this stage
      const points = crackBranches[s];
      // Black fissure with semi-transparent depth
      ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
      for (const [px, py] of points) {
        ctx.fillRect(px, py, 1, 1);
      }

      // Subtle light edges for 3D crack depth
      ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
      for (const [px, py] of points) {
        if (px + 1 < 16 && !points.some(([x, y]) => x === px + 1 && y === py)) {
          ctx.fillRect(px + 1, py, 1, 1);
        }
      }

      const tex = new THREE.CanvasTexture(canvas);
      tex.magFilter = THREE.NearestFilter;
      tex.minFilter = THREE.NearestFilter;
      tex.generateMipmaps = false;
      this.textures.push(tex);

      const mat = new THREE.MeshBasicMaterial({
        map: tex,
        transparent: true,
        opacity: 0.92,
        depthWrite: false,
        polygonOffset: true,
        polygonOffsetFactor: -2,
        polygonOffsetUnits: -2,
      });
      this.materials.push(mat);
    }
  }

  // Set position and breaking progress (0.0 to 1.0)
  setProgress(bx: number, by: number, bz: number, progress: number) {
    if (progress <= 0 || progress >= 1.0) {
      this.mesh.visible = false;
      this.currentStage = -1;
      return;
    }

    const stage = Math.min(9, Math.max(0, Math.floor(progress * 10)));
    this.mesh.position.set(bx + 0.5, by + 0.5, bz + 0.5);

    if (stage !== this.currentStage) {
      this.currentStage = stage;
      this.mesh.material = this.materials[stage];
    }

    this.mesh.visible = true;
  }

  hide() {
    this.mesh.visible = false;
    this.currentStage = -1;
  }

  dispose() {
    this.mesh.geometry.dispose();
    for (const mat of this.materials) mat.dispose();
    for (const tex of this.textures) tex.dispose();
  }
}
