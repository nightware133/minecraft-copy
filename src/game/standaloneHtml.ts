// Exported standalone single-file HTML code for 100% self-contained execution
export const STANDALONE_HTML_CODE = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>voxelcraft - 3D Minecraft Sandbox</title>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Silkscreen&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; user-select: none; -webkit-user-select: none; }
    body, html { width: 100%; height: 100%; overflow: hidden; background: #0a0e1a; font-family: 'Press Start 2P', monospace; }
    #canvas-container { width: 100vw; height: 100vh; display: block; cursor: crosshair; }
    #crosshair { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 16px; height: 16px; pointer-events: none; z-index: 10; }
    #crosshair::before, #crosshair::after { content: ''; position: absolute; background: rgba(255, 255, 255, 0.9); box-shadow: 0 0 2px rgba(0, 0, 0, 0.8); }
    #crosshair::before { top: 7px; left: 0; width: 16px; height: 2px; }
    #crosshair::after { top: 0; left: 7px; width: 2px; height: 16px; }
    
    #hotbar-container { position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%); display: flex; gap: 4px; background: rgba(0, 0, 0, 0.65); backdrop-filter: blur(8px); padding: 4px; border-radius: 6px; border: 2px solid #555; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6); z-index: 10; }
    .hotbar-slot { position: relative; width: 48px; height: 48px; background: rgba(255, 255, 255, 0.08); border: 2px solid #333; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.1s ease; }
    .hotbar-slot.active { border-color: #ffffff; background: rgba(255, 255, 255, 0.25); transform: translateY(-4px); box-shadow: 0 4px 12px rgba(255, 255, 255, 0.2); }
    .hotbar-slot canvas { width: 32px; height: 32px; image-rendering: pixelated; }
    .hotbar-slot .slot-key { position: absolute; top: 2px; left: 4px; font-size: 9px; color: rgba(255, 255, 255, 0.8); text-shadow: 1px 1px 0 #000; }
    .hotbar-slot .slot-name { display: none; position: absolute; bottom: 58px; left: 50%; transform: translateX(-50%); background: rgba(0, 0, 0, 0.9); color: #fff; padding: 4px 8px; border-radius: 4px; font-size: 9px; white-space: nowrap; pointer-events: none; border: 1px solid #777; }
    .hotbar-slot:hover .slot-name { display: block; }

    #hud-info { position: absolute; top: 16px; left: 16px; background: rgba(0, 0, 0, 0.65); backdrop-filter: blur(6px); color: #fff; padding: 10px 14px; border-radius: 6px; font-size: 9px; border: 2px solid #555; pointer-events: none; line-height: 1.6; z-index: 10; }
    #hud-info .highlight { color: #fbc531; }
    #hud-info .biome-tag { color: #4cd137; }
    #lock-hint { position: absolute; top: 16px; right: 16px; background: rgba(0, 0, 0, 0.65); backdrop-filter: blur(6px); color: #dcdde1; padding: 8px 12px; border-radius: 6px; font-size: 8px; border: 2px solid #555; pointer-events: none; z-index: 10; transition: opacity 0.3s ease; }
    
    #vitals { position: absolute; bottom: 80px; left: 50%; transform: translateX(-50%); display: flex; gap: 40px; z-index: 10; font-size: 9px; }
    .vital-bar { display: flex; align-items: center; gap: 6px; background: rgba(0, 0, 0, 0.6); padding: 4px 8px; border-radius: 4px; border: 1px solid #444; }
  </style>
</head>
<body>
  <div id="canvas-container"></div>
  <div id="crosshair"></div>
  <div id="hud-info">
    <div>FPS: <span id="fps-val" class="highlight">60</span></div>
    <div>POS: <span id="pos-val">0, 18, 0</span></div>
    <div>BIOME: <span id="biome-val" class="biome-tag">Plains</span></div>
    <div>TIME: <span id="time-val" class="highlight">Day</span></div>
  </div>
  <div id="lock-hint">Click screen to lock cursor &bull; ESC to pause &bull; F5 for 3rd person</div>
  <div id="vitals">
    <div class="vital-bar"><span style="color:#e84118;">❤ HEALTH</span> <span id="hp-val">100</span></div>
    <div class="vital-bar"><span style="color:#00a8ff;">🫧 OXYGEN</span> <span id="ox-val">100%</span></div>
  </div>
  <div id="hotbar-container"></div>

  <script>
    (function() {
      const BLOCK_TYPES = {
        AIR: 0, GRASS: 1, DIRT: 2, STONE: 3, WOOD: 4, LEAVES: 5, BRICK: 6, BEDROCK: 7,
        WATER: 8, SAND: 9, RED_SAND: 10, TERRACOTTA: 11, DARK_OAK: 12, JUNGLE: 13,
        AMETHYST: 14, MELON: 15, TORCH: 16, SNOW: 17, ICE: 18
      };

      const HOTBAR_BLOCKS = [
        { id: BLOCK_TYPES.GRASS, name: 'Grass Block', key: '1' },
        { id: BLOCK_TYPES.WOOD, name: 'Oak Wood', key: '2' },
        { id: BLOCK_TYPES.WATER, name: 'Water (Flowing)', key: '3' },
        { id: BLOCK_TYPES.TERRACOTTA, name: 'Terracotta', key: '4' },
        { id: BLOCK_TYPES.AMETHYST, name: 'Amethyst Cluster', key: '5' },
        { id: BLOCK_TYPES.MELON, name: 'Melon Block', key: '6' }
      ];
      let selectedBlockId = BLOCK_TYPES.GRASS;

      function pseudoNoise(x, y, seed) {
        const n = Math.sin(x * 12.9898 + y * 78.233 + (seed || 1) * 43.123) * 43758.5453;
        return n - Math.floor(n);
      }

      function createProceduralCanvas(drawFn, size) {
        size = size || 16;
        const canvas = document.createElement('canvas');
        canvas.width = size; canvas.height = size;
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = false;
        drawFn(ctx, size);
        return canvas;
      }

      const dirtCanvas = createProceduralCanvas((ctx, s) => {
        ctx.fillStyle = '#866043'; ctx.fillRect(0, 0, s, s);
        for (let x = 0; x < s; x++) for (let y = 0; y < s; y++) {
          const v = pseudoNoise(x, y, 101);
          if (v > 0.75) { ctx.fillStyle = '#9c724f'; ctx.fillRect(x, y, 1, 1); }
          else if (v < 0.25) { ctx.fillStyle = '#6e4e36'; ctx.fillRect(x, y, 1, 1); }
        }
      });

      const grassTopCanvas = createProceduralCanvas((ctx, s) => {
        ctx.fillStyle = '#5c8e32'; ctx.fillRect(0, 0, s, s);
        for (let x = 0; x < s; x++) for (let y = 0; y < s; y++) {
          const v = pseudoNoise(x, y, 102);
          if (v > 0.75) { ctx.fillStyle = '#6fa33c'; ctx.fillRect(x, y, 1, 1); }
          else if (v < 0.25) { ctx.fillStyle = '#497327'; ctx.fillRect(x, y, 1, 1); }
        }
      });

      const grassSideCanvas = createProceduralCanvas((ctx, s) => {
        ctx.fillStyle = '#866043'; ctx.fillRect(0, 0, s, s);
        for (let x = 0; x < s; x++) for (let y = 0; y < s; y++) {
          const v = pseudoNoise(x, y, 103);
          if (v > 0.75) { ctx.fillStyle = '#9c724f'; ctx.fillRect(x, y, 1, 1); }
          else if (v < 0.25) { ctx.fillStyle = '#6e4e36'; ctx.fillRect(x, y, 1, 1); }
        }
        ctx.fillStyle = '#5c8e32';
        for (let x = 0; x < s; x++) {
          const depth = 2 + Math.floor(pseudoNoise(x, 0, 104) * 3);
          for (let y = 0; y < depth; y++) {
            const v = pseudoNoise(x, y, 105);
            ctx.fillStyle = v > 0.5 ? '#6fa33c' : '#497327'; ctx.fillRect(x, y, 1, 1);
          }
        }
      });

      const stoneCanvas = createProceduralCanvas((ctx, s) => {
        ctx.fillStyle = '#777777'; ctx.fillRect(0, 0, s, s);
        for (let x = 0; x < s; x++) for (let y = 0; y < s; y++) {
          const v = pseudoNoise(x, y, 106);
          if (v > 0.8) { ctx.fillStyle = '#8f8f8f'; ctx.fillRect(x, y, 1, 1); }
          else if (v < 0.2) { ctx.fillStyle = '#5e5e5e'; ctx.fillRect(x, y, 1, 1); }
        }
      });

      const woodSideCanvas = createProceduralCanvas((ctx, s) => {
        ctx.fillStyle = '#6b5030'; ctx.fillRect(0, 0, s, s);
        for (let x = 0; x < s; x++) for (let y = 0; y < s; y++) {
          const v = pseudoNoise(x, Math.floor(y / 2), 107);
          if (v > 0.7) { ctx.fillStyle = '#7d5f3a'; ctx.fillRect(x, y, 1, 1); }
          else if (v < 0.3) { ctx.fillStyle = '#523c21'; ctx.fillRect(x, y, 1, 1); }
        }
      });

      const woodTopCanvas = createProceduralCanvas((ctx, s) => {
        ctx.fillStyle = '#9e7f53'; ctx.fillRect(0, 0, s, s);
        const c = s / 2;
        for (let x = 0; x < s; x++) for (let y = 0; y < s; y++) {
          const d = Math.hypot(x - c, y - c);
          if (d >= s / 2 - 1) { ctx.fillStyle = '#523c21'; ctx.fillRect(x, y, 1, 1); }
          else if (Math.sin(d * 2.2) > 0.4) { ctx.fillStyle = '#80643e'; ctx.fillRect(x, y, 1, 1); }
        }
      });

      const leavesCanvas = createProceduralCanvas((ctx, s) => {
        ctx.fillStyle = '#3a7a28'; ctx.fillRect(0, 0, s, s);
        for (let x = 0; x < s; x++) for (let y = 0; y < s; y++) {
          const v = pseudoNoise(x, y, 108);
          if (v > 0.75) { ctx.fillStyle = '#4ea035'; ctx.fillRect(x, y, 1, 1); }
          else if (v < 0.3) { ctx.fillStyle = '#29571c'; ctx.fillRect(x, y, 1, 1); }
        }
      });

      const waterCanvas = createProceduralCanvas((ctx, s) => {
        ctx.fillStyle = '#2979ff'; ctx.fillRect(0, 0, s, s);
        for (let x = 0; x < s; x++) for (let y = 0; y < s; y++) {
          const wave = Math.sin(x * 0.8 + y * 0.6) + Math.cos(x * 0.4 - y * 0.8);
          if (wave > 0.7) { ctx.fillStyle = '#5393ff'; ctx.fillRect(x, y, 1, 1); }
          else if (wave < -0.7) { ctx.fillStyle = '#1c54b2'; ctx.fillRect(x, y, 1, 1); }
        }
      });

      const terracottaCanvas = createProceduralCanvas((ctx, s) => {
        ctx.fillStyle = '#d17d5a'; ctx.fillRect(0, 0, s, s);
        for (let x = 0; x < s; x++) for (let y = 0; y < s; y++) {
          const v = pseudoNoise(x, y, 80);
          if (v > 0.75) { ctx.fillStyle = '#de8d6a'; ctx.fillRect(x, y, 1, 1); }
          else if (v < 0.25) { ctx.fillStyle = '#be6a46'; ctx.fillRect(x, y, 1, 1); }
        }
      });

      const amethystCanvas = createProceduralCanvas((ctx, s) => {
        ctx.fillStyle = '#834eb8'; ctx.fillRect(0, 0, s, s);
        for (let x = 0; x < s; x++) for (let y = 0; y < s; y++) {
          const v = pseudoNoise(x, y, 95);
          if (v > 0.75) { ctx.fillStyle = '#c58cf2'; ctx.fillRect(x, y, 1, 1); }
          else if (v < 0.25) { ctx.fillStyle = '#5c3186'; ctx.fillRect(x, y, 1, 1); }
        }
      });

      const melonCanvas = createProceduralCanvas((ctx, s) => {
        ctx.fillStyle = '#708a28'; ctx.fillRect(0, 0, s, s);
        ctx.fillStyle = '#4a6115';
        for (let x = 0; x < s; x += 4) for (let y = 0; y < s; y++) {
          if (pseudoNoise(x, y, 92) > 0.35) ctx.fillRect(x, y, 2, 1);
        }
      });

      function makeThreeTex(c) {
        const t = new THREE.CanvasTexture(c);
        t.magFilter = THREE.NearestFilter; t.minFilter = THREE.NearestFilter; t.generateMipmaps = false;
        return t;
      }

      const materials = [
        new THREE.MeshLambertMaterial({ map: makeThreeTex(dirtCanvas) }),        // 0
        new THREE.MeshLambertMaterial({ map: makeThreeTex(grassTopCanvas) }),    // 1
        new THREE.MeshLambertMaterial({ map: makeThreeTex(grassSideCanvas) }),   // 2
        new THREE.MeshLambertMaterial({ map: makeThreeTex(stoneCanvas) }),       // 3
        new THREE.MeshLambertMaterial({ map: makeThreeTex(woodSideCanvas) }),    // 4
        new THREE.MeshLambertMaterial({ map: makeThreeTex(woodTopCanvas) }),     // 5
        new THREE.MeshLambertMaterial({ map: makeThreeTex(leavesCanvas), transparent: true, opacity: 0.95 }), // 6
        new THREE.MeshLambertMaterial({ map: makeThreeTex(waterCanvas), transparent: true, opacity: 0.65 }),  // 7
        new THREE.MeshLambertMaterial({ map: makeThreeTex(terracottaCanvas) }),  // 8
        new THREE.MeshLambertMaterial({ map: makeThreeTex(amethystCanvas) }),    // 9
        new THREE.MeshLambertMaterial({ map: makeThreeTex(melonCanvas) }),       // 10
      ];

      const hotbarContainer = document.getElementById('hotbar-container');
      const hotbarCanvases = {
        [BLOCK_TYPES.GRASS]: grassSideCanvas,
        [BLOCK_TYPES.WOOD]: woodSideCanvas,
        [BLOCK_TYPES.WATER]: waterCanvas,
        [BLOCK_TYPES.TERRACOTTA]: terracottaCanvas,
        [BLOCK_TYPES.AMETHYST]: amethystCanvas,
        [BLOCK_TYPES.MELON]: melonCanvas,
      };

      HOTBAR_BLOCKS.forEach((item, idx) => {
        const slot = document.createElement('div');
        slot.className = 'hotbar-slot' + (item.id === selectedBlockId ? ' active' : '');
        slot.innerHTML = '<span class="slot-key">' + item.key + '</span><span class="slot-name">' + item.name + '</span>';
        const ic = document.createElement('canvas');
        ic.width = 16; ic.height = 16;
        ic.getContext('2d').drawImage(hotbarCanvases[item.id], 0, 0);
        slot.insertBefore(ic, slot.lastChild);
        slot.addEventListener('click', () => selectHotbarIndex(idx));
        hotbarContainer.appendChild(slot);
      });

      function selectHotbarIndex(index) {
        selectedBlockId = HOTBAR_BLOCKS[index].id;
        document.querySelectorAll('.hotbar-slot').forEach((s, i) => {
          if (i === index) s.classList.add('active'); else s.classList.remove('active');
        });
      }

      // Three.js Scene Setup
      const container = document.getElementById('canvas-container');
      const scene = new THREE.Scene();
      const skyDay = new THREE.Color(0x78a7ff);
      scene.background = skyDay;
      scene.fog = new THREE.FogExp2(skyDay, 0.016);

      const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 250);
      const renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(window.innerWidth, window.innerHeight);
      container.appendChild(renderer.domElement);

      const ambientLight = new THREE.AmbientLight(0xffffff, 0.45); scene.add(ambientLight);
      const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.35); scene.add(hemiLight);
      const sunLight = new THREE.DirectionalLight(0xfffaed, 1.2); sunLight.position.set(30, 50, 20); scene.add(sunLight);

      const sunMesh = new THREE.Mesh(new THREE.PlaneGeometry(16, 16), new THREE.MeshBasicMaterial({ color: 0xfff3a8, side: THREE.DoubleSide })); scene.add(sunMesh);
      const moonMesh = new THREE.Mesh(new THREE.PlaneGeometry(14, 14), new THREE.MeshBasicMaterial({ color: 0xe6edf8, side: THREE.DoubleSide })); scene.add(moonMesh);

      const CHUNK_SIZE = 16, WORLD_HEIGHT = 36, SEA_LEVEL = 13;
      const FACES = [
        { dir: [1, 0, 0], verts: [[1,0,0],[1,1,0],[1,1,1],[1,0,0],[1,1,1],[1,0,1]], norm: [1, 0, 0] },
        { dir: [-1, 0, 0], verts: [[0,0,1],[0,1,1],[0,1,0],[0,0,1],[0,1,0],[0,0,0]], norm: [-1, 0, 0] },
        { dir: [0, 1, 0], verts: [[0,1,1],[1,1,1],[1,1,0],[0,1,1],[1,1,0],[0,1,0]], norm: [0, 1, 0] },
        { dir: [0, -1, 0], verts: [[0,0,0],[1,0,0],[1,0,1],[0,0,0],[1,0,1],[0,0,1]], norm: [0, -1, 0] },
        { dir: [0, 0, 1], verts: [[1,0,1],[1,1,1],[0,1,1],[1,0,1],[0,1,1],[0,0,1]], norm: [0, 0, 1] },
        { dir: [0, 0, -1], verts: [[0,0,0],[0,1,0],[1,1,0],[0,0,0],[1,1,0],[1,0,0]], norm: [0, 0, -1] }
      ];
      const FACE_UVS = [0,0, 0,1, 1,1, 0,0, 1,1, 1,0];

      function Chunk(cx, cz) {
        this.cx = cx; this.cz = cz; this.startX = cx * CHUNK_SIZE; this.startZ = cz * CHUNK_SIZE;
        this.blocks = new Uint8Array(CHUNK_SIZE * WORLD_HEIGHT * CHUNK_SIZE);
        this.mesh = null; this.isDirty = true;
      }
      Chunk.prototype.getIndex = function(lx, y, lz) { return lx + lz * CHUNK_SIZE + y * CHUNK_SIZE * CHUNK_SIZE; };
      Chunk.prototype.getBlock = function(lx, y, lz) {
        if (lx < 0 || lx >= CHUNK_SIZE || y < 0 || y >= WORLD_HEIGHT || lz < 0 || lz >= CHUNK_SIZE) return 0;
        return this.blocks[this.getIndex(lx, y, lz)];
      };
      Chunk.prototype.setBlock = function(lx, y, lz, id) {
        if (lx < 0 || lx >= CHUNK_SIZE || y < 0 || y >= WORLD_HEIGHT || lz < 0 || lz >= CHUNK_SIZE) return;
        this.blocks[this.getIndex(lx, y, lz)] = id; this.isDirty = true;
      };

      const chunks = new Map();
      let chunkMeshes = [];
      const chunkKey = (cx, cz) => cx + ',' + cz;
      const getChunkAtWorldPos = (wx, wz) => chunks.get(chunkKey(Math.floor(wx / CHUNK_SIZE), Math.floor(wz / CHUNK_SIZE)));

      function getBlock(wx, wy, wz) {
        if (wy < 0 || wy >= WORLD_HEIGHT) return 0;
        const c = getChunkAtWorldPos(wx, wz);
        if (!c) return 0;
        return c.getBlock(((wx % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE, wy, ((wz % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE);
      }

      function setBlock(wx, wy, wz, id) {
        if (wy < 0 || wy >= WORLD_HEIGHT) return false;
        const c = getChunkAtWorldPos(wx, wz);
        if (!c) return false;
        const lx = ((wx % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE, lz = ((wz % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
        c.setBlock(lx, wy, lz, id);
        if (lx === 0) { const n = getChunkAtWorldPos(wx - 1, wz); if (n) n.isDirty = true; }
        if (lx === CHUNK_SIZE - 1) { const n = getChunkAtWorldPos(wx + 1, wz); if (n) n.isDirty = true; }
        if (lz === 0) { const n = getChunkAtWorldPos(wx, wz - 1); if (n) n.isDirty = true; }
        if (lz === CHUNK_SIZE - 1) { const n = getChunkAtWorldPos(wx, wz + 1); if (n) n.isDirty = true; }
        rebuildDirtyChunks();
        return true;
      }

      const isSolid = (wx, wy, wz) => {
        const b = getBlock(wx, wy, wz);
        return b !== BLOCK_TYPES.AIR && b !== BLOCK_TYPES.WATER;
      };

      function getHighestBlock(wx, wz) {
        for (let y = WORLD_HEIGHT - 1; y >= 0; y--) if (isSolid(wx, y, wz)) return y;
        return 14;
      }

      function getBiome(wx, wz) {
        const temp = Math.sin(wx * 0.01 + 1.2) * 0.5 + 0.5;
        const humid = Math.cos(wz * 0.01 + 0.8) * 0.5 + 0.5;
        if (temp > 0.75 && humid < 0.4) return 'Badlands';
        if (temp > 0.65 && humid > 0.6) return 'Jungle';
        if (temp < 0.3) return 'Snowy Tundra';
        return 'Plains';
      }

      function getTerrainHeight(wx, wz) {
        const h1 = Math.sin(wx * 0.05 + 1.2) * Math.cos(wz * 0.05) * 4.5;
        const h2 = Math.sin((wx + wz) * 0.025) * 3.5;
        const detail = Math.cos(wx * 0.12 - wz * 0.1) * 1.5;
        return Math.max(5, Math.min(Math.floor(15 + h1 + h2 + detail), WORLD_HEIGHT - 8));
      }

      function getFaceMaterialIndex(b, normY) {
        switch (b) {
          case BLOCK_TYPES.GRASS: return normY > 0 ? 1 : normY < 0 ? 0 : 2;
          case BLOCK_TYPES.DIRT: return 0;
          case BLOCK_TYPES.STONE: return 3;
          case BLOCK_TYPES.WOOD: return Math.abs(normY) > 0 ? 5 : 4;
          case BLOCK_TYPES.LEAVES: return 6;
          case BLOCK_TYPES.WATER: return 7;
          case BLOCK_TYPES.TERRACOTTA: return 8;
          case BLOCK_TYPES.AMETHYST: return 9;
          case BLOCK_TYPES.MELON: return 10;
          default: return 0;
        }
      }

      function buildChunkMesh(chunk) {
        if (chunk.mesh) { scene.remove(chunk.mesh); chunk.mesh.geometry.dispose(); chunk.mesh = null; }
        const pByMat = {}, nByMat = {}, uByMat = {};
        for (let i = 0; i < materials.length; i++) { pByMat[i] = []; nByMat[i] = []; uByMat[i] = []; }

        for (let lx = 0; lx < CHUNK_SIZE; lx++) {
          for (let y = 0; y < WORLD_HEIGHT; y++) {
            for (let lz = 0; lz < CHUNK_SIZE; lz++) {
              const b = chunk.getBlock(lx, y, lz);
              if (b === BLOCK_TYPES.AIR) continue;
              const wx = chunk.startX + lx, wz = chunk.startZ + lz;

              for (let f = 0; f < FACES.length; f++) {
                const face = FACES[f];
                const neighbor = getBlock(wx + face.dir[0], y + face.dir[1], wz + face.dir[2]);
                const renderFace = b === BLOCK_TYPES.WATER ? neighbor === BLOCK_TYPES.AIR : (neighbor === BLOCK_TYPES.AIR || neighbor === BLOCK_TYPES.WATER || (neighbor === BLOCK_TYPES.LEAVES && b !== BLOCK_TYPES.LEAVES));

                if (renderFace) {
                  const mIdx = getFaceMaterialIndex(b, face.norm[1]);
                  for (let v = 0; v < face.verts.length; v++) {
                    pByMat[mIdx].push(wx + face.verts[v][0], y + face.verts[v][1], wz + face.verts[v][2]);
                    nByMat[mIdx].push(face.norm[0], face.norm[1], face.norm[2]);
                  }
                  for (let u = 0; u < FACE_UVS.length; u++) uByMat[mIdx].push(FACE_UVS[u]);
                }
              }
            }
          }
        }

        const combPos = [], combNorm = [], combUv = [], groups = [];
        let vertOffset = 0;
        for (let m = 0; m < materials.length; m++) {
          const cnt = pByMat[m].length / 3;
          if (cnt > 0) {
            groups.push({ start: vertOffset, count: cnt, matIdx: m });
            vertOffset += cnt;
            for (let j = 0; j < pByMat[m].length; j++) { combPos.push(pByMat[m][j]); combNorm.push(nByMat[m][j]); }
            for (let j = 0; j < uByMat[m].length; j++) combUv.push(uByMat[m][j]);
          }
        }

        if (combPos.length === 0) { chunk.isDirty = false; return; }
        const geom = new THREE.BufferGeometry();
        geom.setAttribute('position', new THREE.Float32BufferAttribute(combPos, 3));
        geom.setAttribute('normal', new THREE.Float32BufferAttribute(combNorm, 3));
        geom.setAttribute('uv', new THREE.Float32BufferAttribute(combUv, 2));
        for (let g = 0; g < groups.length; g++) geom.addGroup(groups[g].start, groups[g].count, groups[g].matIdx);

        const mesh = new THREE.Mesh(geom, materials);
        scene.add(mesh); chunk.mesh = mesh; chunk.isDirty = false;
      }

      function rebuildDirtyChunks() {
        chunkMeshes = [];
        chunks.forEach(c => { if (c.isDirty) buildChunkMesh(c); if (c.mesh) chunkMeshes.push(c.mesh); });
      }

      function generateChunkTerrain(chunk) {
        if (chunk.isGenerated) return;
        chunk.isGenerated = true;
        const sx = chunk.startX, sz = chunk.startZ;

        for (let lx = 0; lx < CHUNK_SIZE; lx++) {
          for (let lz = 0; lz < CHUNK_SIZE; lz++) {
            const wx = sx + lx, wz = sz + lz;
            const surfH = getTerrainHeight(wx, wz);
            const biome = getBiome(wx, wz);
            chunk.setBlock(lx, 0, lz, BLOCK_TYPES.BEDROCK);

            for (let wy = 1; wy <= Math.max(surfH, SEA_LEVEL); wy++) {
              if (wy > surfH) {
                if (wy <= SEA_LEVEL) chunk.setBlock(lx, wy, lz, BLOCK_TYPES.WATER);
                continue;
              }
              if (wy === surfH) {
                if (biome === 'Badlands') chunk.setBlock(lx, wy, lz, BLOCK_TYPES.TERRACOTTA);
                else chunk.setBlock(lx, wy, lz, BLOCK_TYPES.GRASS);
              } else if (wy >= surfH - 3) {
                chunk.setBlock(lx, wy, lz, BLOCK_TYPES.DIRT);
              } else {
                chunk.setBlock(lx, wy, lz, BLOCK_TYPES.STONE);
              }
            }
          }
        }

        // Procedural trees
        for (let tx = sx - 2; tx <= sx + CHUNK_SIZE + 1; tx++) {
          for (let tz = sz - 2; tz <= sz + CHUNK_SIZE + 1; tz++) {
            if (Math.abs(tx) % 4 === 0 && Math.abs(tz) % 4 === 0 && pseudoNoise(tx, tz, 42) > 0.7) {
              const sy = getTerrainHeight(tx, tz);
              if (sy > SEA_LEVEL + 1 && sy < WORLD_HEIGHT - 9) {
                const trunkH = 4 + Math.floor(pseudoNoise(tx, tz, 99) * 2);
                for (let y = 1; y <= trunkH; y++) {
                  if (tx >= sx && tx < sx + CHUNK_SIZE && tz >= sz && tz < sz + CHUNK_SIZE) {
                    chunk.setBlock(tx - sx, sy + y, tz - sz, BLOCK_TYPES.WOOD);
                  }
                }
                const leafStart = sy + trunkH - 1;
                for (let ly = leafStart; ly <= sy + trunkH + 2; ly++) {
                  const rad = ly >= sy + trunkH + 1 ? 1 : 2;
                  for (let ox = -rad; ox <= rad; ox++) {
                    for (let oz = -rad; oz <= rad; oz++) {
                      if (ox === 0 && oz === 0 && ly <= sy + trunkH) continue;
                      const wx = tx + ox, wz = tz + oz;
                      if (wx >= sx && wx < sx + CHUNK_SIZE && wz >= sz && wz < sz + CHUNK_SIZE) {
                        if (chunk.getBlock(wx - sx, ly, wz - sz) === BLOCK_TYPES.AIR) {
                          chunk.setBlock(wx - sx, ly, wz - sz, BLOCK_TYPES.LEAVES);
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

      function getOrCreateChunk(cx, cz) {
        const k = chunkKey(cx, cz);
        let c = chunks.get(k);
        if (!c) {
          c = new Chunk(cx, cz);
          generateChunkTerrain(c);
          chunks.set(k, c);
        }
        return c;
      }

      const RENDER_RADIUS = 3;
      function updateChunks(px, pz) {
        const pcx = Math.floor(px / CHUNK_SIZE), pcz = Math.floor(pz / CHUNK_SIZE);
        for (let cx = pcx - RENDER_RADIUS; cx <= pcx + RENDER_RADIUS; cx++) {
          for (let cz = pcz - RENDER_RADIUS; cz <= pcz + RENDER_RADIUS; cz++) {
            getOrCreateChunk(cx, cz);
          }
        }
        rebuildDirtyChunks();
      }

      updateChunks(0, 0);

      const raycaster = new THREE.Raycaster();
      raycaster.far = 5.5;
      const wireframeBox = new THREE.LineSegments(
        new THREE.EdgesGeometry(new THREE.BoxGeometry(1.004, 1.004, 1.004)),
        new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 2 })
      );
      wireframeBox.visible = false; scene.add(wireframeBox);

      let targetBlock = null;
      const player = {
        pos: new THREE.Vector3(0.5, getHighestBlock(0, 0) + 1.5, 0.5),
        vel: new THREE.Vector3(0, 0, 0),
        radius: 0.3, height: 1.8, eyeHeight: 1.62,
        onGround: false, inWater: false, yaw: 0, pitch: 0,
        health: 100, oxygen: 100
      };

      const keys = {};
      let isLocked = false;

      renderer.domElement.addEventListener('click', () => {
        if (!isLocked) renderer.domElement.requestPointerLock();
      });

      document.addEventListener('pointerlockchange', () => {
        isLocked = document.pointerLockElement === renderer.domElement;
        document.getElementById('lock-hint').style.opacity = isLocked ? '0' : '1';
      });

      window.addEventListener('mousemove', e => {
        if (!isLocked) return;
        const sens = 0.0024;
        player.yaw -= e.movementX * sens;
        player.pitch = Math.max(-Math.PI / 2 + 0.05, Math.min(Math.PI / 2 - 0.05, player.pitch - e.movementY * sens));
      });

      renderer.domElement.addEventListener('mousedown', e => {
        if (e.button === 0) {
          if (targetBlock && targetBlock.y > 0) {
            setBlock(targetBlock.x, targetBlock.y, targetBlock.z, BLOCK_TYPES.AIR);
            updateTargetRaycast();
          }
        } else if (e.button === 2) {
          e.preventDefault();
          if (targetBlock) {
            const px = targetBlock.x + Math.round(targetBlock.norm.x);
            const py = targetBlock.y + Math.round(targetBlock.norm.y);
            const pz = targetBlock.z + Math.round(targetBlock.norm.z);
            setBlock(px, py, pz, selectedBlockId);
            updateTargetRaycast();
          }
        }
      });

      window.addEventListener('contextmenu', e => e.preventDefault());
      window.addEventListener('keydown', e => {
        keys[e.code] = true;
        if (e.code >= 'Digit1' && e.code <= 'Digit6') selectHotbarIndex(parseInt(e.code.replace('Digit', '')) - 1);
      });
      window.addEventListener('keyup', e => { keys[e.code] = false; });

      function updateTargetRaycast() {
        raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
        const hits = raycaster.intersectObjects(chunkMeshes);
        if (hits.length > 0) {
          const h = hits[0], norm = h.face ? h.face.normal : new THREE.Vector3(0, 1, 0);
          const p = h.point.clone().sub(norm.clone().multiplyScalar(0.01));
          const bx = Math.floor(p.x), by = Math.floor(p.y), bz = Math.floor(p.z);
          if (isSolid(bx, by, bz) || getBlock(bx, by, bz) === BLOCK_TYPES.WATER) {
            targetBlock = { x: bx, y: by, z: bz, norm: norm.clone() };
            wireframeBox.position.set(bx + 0.5, by + 0.5, bz + 0.5);
            wireframeBox.visible = true;
            return;
          }
        }
        targetBlock = null; wireframeBox.visible = false;
      }

      function updatePhysics(dt) {
        const delta = Math.min(dt, 0.04);
        const fwd = new THREE.Vector3(-Math.sin(player.yaw), 0, -Math.cos(player.yaw)).normalize();
        const rgt = new THREE.Vector3(Math.cos(player.yaw), 0, -Math.sin(player.yaw)).normalize();
        const move = new THREE.Vector3();
        if (keys['KeyW'] || keys['ArrowUp']) move.add(fwd);
        if (keys['KeyS'] || keys['ArrowDown']) move.sub(fwd);
        if (keys['KeyD'] || keys['ArrowRight']) move.add(rgt);
        if (keys['KeyA'] || keys['ArrowLeft']) move.sub(rgt);
        if (move.lengthSq() > 0.0001) move.normalize();

        const px = Math.floor(player.pos.x), py = Math.floor(player.pos.y), pz = Math.floor(player.pos.z);
        player.inWater = getBlock(px, py, pz) === BLOCK_TYPES.WATER || getBlock(px, Math.floor(player.pos.y + 1.2), pz) === BLOCK_TYPES.WATER;

        const spd = player.inWater ? 3.5 : (keys['ShiftLeft'] || keys['ShiftRight']) ? 8.2 : 5.0;
        if (player.inWater) {
          if (move.lengthSq() > 0) { player.vel.x = move.x * spd; player.vel.z = move.z * spd; }
          else { player.vel.x *= 0.8; player.vel.z *= 0.8; }
          if (keys['Space']) player.vel.y = 4.5;
          else player.vel.y = Math.max(-2.5, player.vel.y - 6 * delta);
        } else if (player.onGround) {
          if (move.lengthSq() > 0) { player.vel.x = move.x * spd; player.vel.z = move.z * spd; }
          else { player.vel.x *= 0.55; player.vel.z *= 0.55; }
          if (keys['Space']) { player.vel.y = 8.4; player.onGround = false; }
        } else {
          if (move.lengthSq() > 0) { player.vel.x += move.x * spd * delta * 4; player.vel.z += move.z * spd * delta * 4; }
          player.vel.x *= 0.96; player.vel.z *= 0.96;
          player.vel.y -= 24 * delta;
        }

        player.pos.x += player.vel.x * delta;
        player.pos.z += player.vel.z * delta;
        player.pos.y += player.vel.y * delta;

        const floorY = getHighestBlock(Math.floor(player.pos.x), Math.floor(player.pos.z)) + 1;
        if (player.pos.y <= floorY) {
          player.pos.y = floorY; player.vel.y = 0; player.onGround = true;
        } else {
          player.onGround = false;
        }
      }

      let lastTime = performance.now();
      function loop() {
        requestAnimationFrame(loop);
        const now = performance.now();
        const dt = Math.min((now - lastTime) / 1000, 0.1);
        lastTime = now;

        updatePhysics(dt);
        updateChunks(player.pos.x, player.pos.z);
        camera.position.set(player.pos.x, player.pos.y + player.eyeHeight, player.pos.z);
        const euler = new THREE.Euler(0, 0, 0, 'YXZ');
        euler.x = player.pitch; euler.y = player.yaw;
        camera.quaternion.setFromEuler(euler);

        updateTargetRaycast();
        document.getElementById('pos-val').textContent = Math.round(player.pos.x) + ', ' + Math.round(player.pos.y) + ', ' + Math.round(player.pos.z);
        document.getElementById('biome-val').textContent = getBiome(player.pos.x, player.pos.z);
        renderer.render(scene, camera);
      }

      window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      });

      loop();
    })();
  </script>
</body>
</html>`;
