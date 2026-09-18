// Exported standalone single-file HTML code for 100% self-contained execution
export const STANDALONE_HTML_CODE = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>3D Voxel Sandbox</title>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; user-select: none; -webkit-user-select: none; }
    body, html { width: 100%; height: 100%; overflow: hidden; background: #0a0e1a; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    #canvas-container { width: 100vw; height: 100vh; display: block; cursor: crosshair; }
    #crosshair { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 18px; height: 18px; pointer-events: none; z-index: 10; }
    #crosshair::before, #crosshair::after { content: ''; position: absolute; background: rgba(255, 255, 255, 0.85); box-shadow: 0 0 2px rgba(0, 0, 0, 0.8); }
    #crosshair::before { top: 8px; left: 0; width: 18px; height: 2px; }
    #crosshair::after { top: 0; left: 8px; width: 2px; height: 18px; }
    #hotbar-container { position: absolute; bottom: 24px; left: 50%; transform: translateX(-50%); display: flex; gap: 6px; background: rgba(18, 22, 34, 0.75); backdrop-filter: blur(8px); padding: 6px; border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.12); box-shadow: 0 8px 32px rgba(0, 0, 0, 0.45); z-index: 10; }
    .hotbar-slot { position: relative; width: 52px; height: 52px; border-radius: 8px; background: rgba(255, 255, 255, 0.05); border: 2px solid transparent; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.15s ease; }
    .hotbar-slot.active { border-color: #ffffff; background: rgba(255, 255, 255, 0.18); transform: translateY(-4px); box-shadow: 0 4px 12px rgba(0, 0, 0, 0.35); }
    .hotbar-slot canvas { width: 32px; height: 32px; image-rendering: pixelated; }
    .hotbar-slot .slot-key { position: absolute; top: 2px; left: 4px; font-size: 11px; font-weight: 700; color: rgba(255, 255, 255, 0.75); text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8); }
    .hotbar-slot .slot-name { display: none; position: absolute; bottom: 60px; left: 50%; transform: translateX(-50%); background: rgba(0, 0, 0, 0.85); color: #fff; padding: 4px 8px; border-radius: 4px; font-size: 12px; white-space: nowrap; pointer-events: none; border: 1px solid rgba(255, 255, 255, 0.15); }
    .hotbar-slot:hover .slot-name { display: block; }
    #hud-info { position: absolute; top: 16px; left: 16px; background: rgba(14, 18, 28, 0.7); backdrop-filter: blur(6px); color: #e2e8f0; padding: 10px 14px; border-radius: 8px; font-size: 13px; font-family: monospace; border: 1px solid rgba(255, 255, 255, 0.08); pointer-events: none; line-height: 1.45; z-index: 10; }
    #hud-info .time-tag { font-weight: bold; color: #f6ad55; }
    #lock-hint { position: absolute; top: 16px; right: 16px; background: rgba(14, 18, 28, 0.7); backdrop-filter: blur(6px); color: #cbd5e1; padding: 8px 12px; border-radius: 8px; font-size: 12px; border: 1px solid rgba(255, 255, 255, 0.08); pointer-events: none; z-index: 10; transition: opacity 0.3s ease; }
  </style>
</head>
<body>
  <div id="canvas-container"></div>
  <div id="crosshair"></div>
  <div id="hud-info">
    <div>FPS: <span id="fps-val">60</span></div>
    <div>POS: <span id="pos-val">0, 16, 0</span></div>
    <div>TIME: <span id="time-val" class="time-tag">Day</span></div>
  </div>
  <div id="lock-hint">Click screen to lock cursor &bull; ESC to unlock</div>
  <div id="hotbar-container"></div>

  <script>
    (function() {
      const BLOCK_TYPES = { AIR: 0, GRASS: 1, DIRT: 2, STONE: 3, WOOD: 4, LEAVES: 5, BRICK: 6, BEDROCK: 7 };
      const HOTBAR_BLOCKS = [
        { id: BLOCK_TYPES.GRASS, name: 'Grass Block', key: '1' },
        { id: BLOCK_TYPES.DIRT, name: 'Dirt', key: '2' },
        { id: BLOCK_TYPES.STONE, name: 'Stone', key: '3' },
        { id: BLOCK_TYPES.WOOD, name: 'Wood Log', key: '4' },
        { id: BLOCK_TYPES.LEAVES, name: 'Leaves', key: '5' },
        { id: BLOCK_TYPES.BRICK, name: 'Bricks', key: '6' }
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

      const brickCanvas = createProceduralCanvas((ctx, s) => {
        ctx.fillStyle = '#a04030'; ctx.fillRect(0, 0, s, s);
        ctx.fillStyle = '#cfc3b8';
        for (let y = 0; y < s; y += 4) { ctx.fillRect(0, y, s, 1); }
        for (let y = 0; y < s; y += 4) {
          const off = (y / 4) % 2 === 0 ? 0 : 4;
          for (let x = off; x < s; x += 8) { ctx.fillRect(x, y, 1, 4); }
        }
        for (let x = 0; x < s; x++) for (let y = 0; y < s; y++) {
          if (y % 4 !== 0) {
            const v = pseudoNoise(x, y, 109);
            if (v > 0.8) { ctx.fillStyle = '#b54b39'; ctx.fillRect(x, y, 1, 1); }
            else if (v < 0.2) { ctx.fillStyle = '#883325'; ctx.fillRect(x, y, 1, 1); }
          }
        }
      });

      const bedrockCanvas = createProceduralCanvas((ctx, s) => {
        ctx.fillStyle = '#2c2c2c'; ctx.fillRect(0, 0, s, s);
        for (let x = 0; x < s; x++) for (let y = 0; y < s; y++) {
          const v = pseudoNoise(x, y, 110);
          if (v > 0.85) { ctx.fillStyle = '#444444'; ctx.fillRect(x, y, 1, 1); }
          else if (v < 0.25) { ctx.fillStyle = '#111111'; ctx.fillRect(x, y, 1, 1); }
        }
      });

      function makeThreeTex(c) {
        const t = new THREE.CanvasTexture(c);
        t.magFilter = THREE.NearestFilter; t.minFilter = THREE.NearestFilter; t.generateMipmaps = false;
        return t;
      }

      const materials = [
        new THREE.MeshLambertMaterial({ map: makeThreeTex(dirtCanvas) }),
        new THREE.MeshLambertMaterial({ map: makeThreeTex(grassTopCanvas) }),
        new THREE.MeshLambertMaterial({ map: makeThreeTex(grassSideCanvas) }),
        new THREE.MeshLambertMaterial({ map: makeThreeTex(stoneCanvas) }),
        new THREE.MeshLambertMaterial({ map: makeThreeTex(woodSideCanvas) }),
        new THREE.MeshLambertMaterial({ map: makeThreeTex(woodTopCanvas) }),
        new THREE.MeshLambertMaterial({ map: makeThreeTex(leavesCanvas), transparent: true, opacity: 0.96 }),
        new THREE.MeshLambertMaterial({ map: makeThreeTex(brickCanvas) }),
        new THREE.MeshLambertMaterial({ map: makeThreeTex(bedrockCanvas) })
      ];

      const hotbarContainer = document.getElementById('hotbar-container');
      const hotbarCanvases = {
        [BLOCK_TYPES.GRASS]: grassSideCanvas,
        [BLOCK_TYPES.DIRT]: dirtCanvas,
        [BLOCK_TYPES.STONE]: stoneCanvas,
        [BLOCK_TYPES.WOOD]: woodSideCanvas,
        [BLOCK_TYPES.LEAVES]: leavesCanvas,
        [BLOCK_TYPES.BRICK]: brickCanvas
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

      const container = document.getElementById('canvas-container');
      const scene = new THREE.Scene();
      const skyDay = new THREE.Color(0x78a7ff);
      scene.background = skyDay;
      scene.fog = new THREE.FogExp2(skyDay, 0.016);

      const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 180);
      const renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(window.innerWidth, window.innerHeight);
      container.appendChild(renderer.domElement);

      const ambientLight = new THREE.AmbientLight(0xffffff, 0.45); scene.add(ambientLight);
      const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.35); scene.add(hemiLight);
      const sunLight = new THREE.DirectionalLight(0xfffaed, 1.2); sunLight.position.set(30, 50, 20); scene.add(sunLight);

      const sunMesh = new THREE.Mesh(new THREE.PlaneGeometry(12, 12), new THREE.MeshBasicMaterial({ color: 0xfff3a8, side: THREE.DoubleSide })); scene.add(sunMesh);
      const moonMesh = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), new THREE.MeshBasicMaterial({ color: 0xe6edf8, side: THREE.DoubleSide })); scene.add(moonMesh);

      const CHUNK_SIZE = 16, WORLD_HEIGHT = 36, CHUNKS_X = 3, CHUNKS_Z = 3, MIN_X = -24, MAX_X = 24, MIN_Z = -24, MAX_Z = 24;
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

      const isSolid = (wx, wy, wz) => getBlock(wx, wy, wz) !== BLOCK_TYPES.AIR;
      function getHighestBlock(wx, wz) {
        for (let y = WORLD_HEIGHT - 1; y >= 0; y--) if (isSolid(wx, y, wz)) return y;
        return 12;
      }

      function getTerrainHeight(wx, wz) {
        const h1 = Math.sin(wx * 0.07 + 1.2) * Math.cos(wz * 0.08) * 4.5;
        const h2 = Math.sin((wx + wz) * 0.035) * 3.5;
        const h3 = Math.cos(wx * 0.16 - wz * 0.14) * 1.8;
        return Math.max(5, Math.min(Math.floor(15 + h1 + h2 + h3), WORLD_HEIGHT - 8));
      }

      function isCave(wx, wy, wz, surfH) {
        if (wy <= 1 || wy >= surfH - 2) return false;
        const c1 = Math.sin(wx * 0.18 + wy * 0.24) * Math.cos(wz * 0.18 + wy * 0.16);
        const c2 = Math.cos(wx * 0.13 - wy * 0.19) * Math.sin(wz * 0.15 + wx * 0.09);
        const chamber = Math.sin(wx * 0.09 + wz * 0.08) * Math.cos(wy * 0.15);
        return (c1 * c1 + c2 * c2 < 0.055) || (chamber > 0.85 && wy < surfH - 4 && wy > 4);
      }

      function getFaceMaterialIndex(b, normY) {
        switch (b) {
          case BLOCK_TYPES.GRASS: return normY > 0 ? 1 : normY < 0 ? 0 : 2;
          case BLOCK_TYPES.DIRT: return 0;
          case BLOCK_TYPES.STONE: return 3;
          case BLOCK_TYPES.WOOD: return Math.abs(normY) > 0 ? 5 : 4;
          case BLOCK_TYPES.LEAVES: return 6;
          case BLOCK_TYPES.BRICK: return 7;
          case BLOCK_TYPES.BEDROCK: return 8;
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
                if (neighbor === BLOCK_TYPES.AIR || (neighbor === BLOCK_TYPES.LEAVES && b !== BLOCK_TYPES.LEAVES)) {
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
            chunk.setBlock(lx, 0, lz, BLOCK_TYPES.BEDROCK);

            for (let wy = 1; wy <= surfH; wy++) {
              if (isCave(wx, wy, wz, surfH)) { chunk.setBlock(lx, wy, lz, BLOCK_TYPES.AIR); continue; }
              if (wy === surfH) chunk.setBlock(lx, wy, lz, BLOCK_TYPES.GRASS);
              else if (wy >= surfH - 3) chunk.setBlock(lx, wy, lz, BLOCK_TYPES.DIRT);
              else chunk.setBlock(lx, wy, lz, BLOCK_TYPES.STONE);
            }
          }
        }

        // Procedural trees
        for (let tx = sx - 2; tx <= sx + CHUNK_SIZE + 1; tx++) {
          for (let tz = sz - 2; tz <= sz + CHUNK_SIZE + 1; tz++) {
            if (Math.abs(tx) % 3 === 0 && Math.abs(tz) % 3 === 0 && pseudoNoise(tx, tz, 42) > 0.72) {
              const sy = getTerrainHeight(tx, tz);
              if (sy > 14 && sy < WORLD_HEIGHT - 9) {
                const trunkH = 4 + Math.floor(pseudoNoise(tx, tz, 99) * 2);
                for (let y = 1; y <= trunkH; y++) {
                  if (tx >= sx && tx < sx + CHUNK_SIZE && tz >= sz && tz < sz + CHUNK_SIZE) {
                    chunk.setBlock(tx - sx, sy + y, tz - sz, BLOCK_TYPES.WOOD);
                  }
                }
                if (tx >= sx && tx < sx + CHUNK_SIZE && tz >= sz && tz < sz + CHUNK_SIZE) {
                  chunk.setBlock(tx - sx, sy, tz - sz, BLOCK_TYPES.DIRT);
                }
                const leafStart = sy + trunkH - 1;
                for (let ly = leafStart; ly <= sy + trunkH + 2; ly++) {
                  const rad = ly >= sy + trunkH + 1 ? 1 : 2;
                  for (let ox = -rad; ox <= rad; ox++) {
                    for (let oz = -rad; oz <= rad; oz++) {
                      if (ox === 0 && oz === 0 && ly <= sy + trunkH) continue;
                      if (Math.abs(ox) === rad && Math.abs(oz) === rad && pseudoNoise(tx + ox, tz + oz, ly) > 0.4) continue;
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

      const RENDER_RADIUS = 3, UNLOAD_RADIUS = 5;
      let lastPlrCx = 999999, lastPlrCz = 999999;
      function updateChunks(px, pz, forceAll) {
        const pcx = Math.floor(px / CHUNK_SIZE), pcz = Math.floor(pz / CHUNK_SIZE);
        const moved = pcx !== lastPlrCx || pcz !== lastPlrCz;
        if (moved) { lastPlrCx = pcx; lastPlrCz = pcz; }

        for (let cx = pcx - RENDER_RADIUS - 1; cx <= pcx + RENDER_RADIUS + 1; cx++) {
          for (let cz = pcz - RENDER_RADIUS - 1; cz <= pcz + RENDER_RADIUS + 1; cz++) {
            getOrCreateChunk(cx, cz);
          }
        }

        let mCnt = 0;
        const maxM = forceAll ? 999 : 3;
        const cands = [];
        for (let cx = pcx - RENDER_RADIUS; cx <= pcx + RENDER_RADIUS; cx++) {
          for (let cz = pcz - RENDER_RADIUS; cz <= pcz + RENDER_RADIUS; cz++) {
            const c = chunks.get(chunkKey(cx, cz));
            if (c && c.isDirty) cands.push(c);
          }
        }
        cands.sort((a, b) => Math.hypot(a.cx - pcx, a.cz - pcz) - Math.hypot(b.cx - pcx, b.cz - pcz));
        for (const c of cands) {
          buildChunkMesh(c);
          mCnt++;
          if (mCnt >= maxM) break;
        }

        if (moved || forceAll) {
          const toRem = [];
          chunks.forEach((c, k) => {
            if (Math.max(Math.abs(c.cx - pcx), Math.abs(c.cz - pcz)) > UNLOAD_RADIUS) {
              if (c.mesh) { scene.remove(c.mesh); c.mesh.geometry.dispose(); c.mesh = null; }
              toRem.push(k);
            }
          });
          toRem.forEach(k => chunks.delete(k));
        }

        if (mCnt > 0 || moved || forceAll) {
          chunkMeshes = [];
          chunks.forEach(c => { if (c.mesh) chunkMeshes.push(c.mesh); });
        }
      }

      updateChunks(0, 0, true);

      const raycaster = new THREE.Raycaster();
      raycaster.far = 5.5;
      const wireframeBox = new THREE.LineSegments(
        new THREE.EdgesGeometry(new THREE.BoxGeometry(1.004, 1.004, 1.004)),
        new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 2 })
      );
      wireframeBox.visible = false; scene.add(wireframeBox);

      let targetBlock = null;
      const particles = [];

      function spawnParticles(bx, by, bz, bType) {
        let col = 0x866043;
        if (bType === BLOCK_TYPES.GRASS) col = 0x5c8e32;
        else if (bType === BLOCK_TYPES.STONE) col = 0x777777;
        else if (bType === BLOCK_TYPES.WOOD) col = 0x6b5030;
        else if (bType === BLOCK_TYPES.LEAVES) col = 0x3a7a28;
        else if (bType === BLOCK_TYPES.BRICK) col = 0xa04030;

        const geom = new THREE.BoxGeometry(0.16, 0.16, 0.16);
        const mat = new THREE.MeshBasicMaterial({ color: col });
        for (let i = 0; i < 8; i++) {
          const m = new THREE.Mesh(geom, mat);
          m.position.set(bx + 0.3 + Math.random() * 0.4, by + 0.3 + Math.random() * 0.4, bz + 0.3 + Math.random() * 0.4);
          scene.add(m);
          particles.push({ mesh: m, vel: new THREE.Vector3((Math.random() - 0.5) * 4, Math.random() * 3 + 1, (Math.random() - 0.5) * 4), life: 0.6, maxLife: 0.6 });
        }
      }

      const player = {
        pos: new THREE.Vector3(0.5, getHighestBlock(0, 0) + 1.2, 0.5),
        vel: new THREE.Vector3(0, 0, 0),
        radius: 0.3, height: 1.8, eyeHeight: 1.62,
        onGround: false, yaw: 0, pitch: 0
      };

      const keys = {};
      let isLocked = false, isMouseDown = false, lastMouse = { x: 0, y: 0 }, pointerLockBlocked = false;

      renderer.domElement.addEventListener('click', () => {
        if (!isLocked) {
          try {
            const p = renderer.domElement.requestPointerLock();
            if (p && p.catch) p.catch(() => { pointerLockBlocked = true; });
          } catch(e) { pointerLockBlocked = true; }
        }
      });

      document.addEventListener('pointerlockchange', () => {
        isLocked = document.pointerLockElement === renderer.domElement;
        document.getElementById('lock-hint').style.opacity = isLocked ? '0' : '1';
      });

      window.addEventListener('mousemove', e => {
        const sens = 0.0024;
        if (isLocked) {
          player.yaw -= e.movementX * sens;
          player.pitch = Math.max(-Math.PI / 2 + 0.05, Math.min(Math.PI / 2 - 0.05, player.pitch - e.movementY * sens));
        } else if (isMouseDown && pointerLockBlocked) {
          player.yaw -= (e.clientX - lastMouse.x) * sens;
          player.pitch = Math.max(-Math.PI / 2 + 0.05, Math.min(Math.PI / 2 - 0.05, player.pitch - (e.clientY - lastMouse.y) * sens));
          lastMouse = { x: e.clientX, y: e.clientY };
        }
      });

      renderer.domElement.addEventListener('mousedown', e => {
        isMouseDown = true; lastMouse = { x: e.clientX, y: e.clientY };
        if (e.button === 0) {
          if (targetBlock && targetBlock.y > 0) {
            const b = getBlock(targetBlock.x, targetBlock.y, targetBlock.z);
            if (b !== BLOCK_TYPES.AIR) {
              spawnParticles(targetBlock.x, targetBlock.y, targetBlock.z, b);
              setBlock(targetBlock.x, targetBlock.y, targetBlock.z, BLOCK_TYPES.AIR);
              updateTargetRaycast();
            }
          }
        } else if (e.button === 2) {
          e.preventDefault();
          if (targetBlock) {
            const px = targetBlock.x + Math.round(targetBlock.norm.x);
            const py = targetBlock.y + Math.round(targetBlock.norm.y);
            const pz = targetBlock.z + Math.round(targetBlock.norm.z);
            const r = player.radius + 0.05;
            const collides = (player.pos.x - r < px + 1 && player.pos.x + r > px && player.pos.y < py + 1 && player.pos.y + player.height > py && player.pos.z - r < pz + 1 && player.pos.z + r > pz);
            if (!collides && py >= 0 && py < WORLD_HEIGHT) {
              setBlock(px, py, pz, selectedBlockId);
              updateTargetRaycast();
            }
          }
        }
      });

      window.addEventListener('mouseup', () => { isMouseDown = false; });
      renderer.domElement.addEventListener('contextmenu', e => e.preventDefault());

      window.addEventListener('keydown', e => {
        keys[e.code] = true;
        if (e.code >= 'Digit1' && e.code <= 'Digit6') selectHotbarIndex(parseInt(e.code.replace('Digit', '')) - 1);
      });
      window.addEventListener('keyup', e => { keys[e.code] = false; });
      window.addEventListener('wheel', e => {
        let idx = HOTBAR_BLOCKS.findIndex(b => b.id === selectedBlockId);
        idx = e.deltaY > 0 ? (idx + 1) % HOTBAR_BLOCKS.length : (idx - 1 + HOTBAR_BLOCKS.length) % HOTBAR_BLOCKS.length;
        selectHotbarIndex(idx);
      });

      function updateTargetRaycast() {
        raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
        const hits = raycaster.intersectObjects(chunkMeshes);
        if (hits.length > 0) {
          const h = hits[0], norm = h.face ? h.face.normal : new THREE.Vector3(0, 1, 0);
          const p = h.point.clone().sub(norm.clone().multiplyScalar(0.01));
          const bx = Math.floor(p.x), by = Math.floor(p.y), bz = Math.floor(p.z);
          if (isSolid(bx, by, bz)) {
            targetBlock = { x: bx, y: by, z: bz, norm: norm.clone() };
            wireframeBox.position.set(bx + 0.5, by + 0.5, bz + 0.5);
            wireframeBox.visible = true;
            return;
          }
        }
        targetBlock = null; wireframeBox.visible = false;
      }

      function collidesAt(px, py, pz) {
        const r = player.radius, h = player.height, eps = 0.005;
        const x0 = Math.floor(px - r + eps), x1 = Math.floor(px + r - eps);
        const y0 = Math.floor(py + eps), y1 = Math.floor(py + h - eps);
        const z0 = Math.floor(pz - r + eps), z1 = Math.floor(pz + r - eps);
        for (let x = x0; x <= x1; x++) for (let y = y0; y <= y1; y++) for (let z = z0; z <= z1; z++) {
          if (isSolid(x, y, z)) return true;
        }
        return false;
      }

      function moveHorizontal(startX, startY, startZ, dx, dz) {
        let cx = startX, cz = startZ, stoppedX = false, stoppedZ = false;
        const r = player.radius, h = player.height, eps = 0.005;

        if (Math.abs(dx) > 0.00001) {
          const tx = cx + dx;
          const y0 = Math.floor(startY + eps), y1 = Math.floor(startY + h - eps);
          const z0 = Math.floor(cz - r + eps), z1 = Math.floor(cz + r - eps);

          if (dx > 0) {
            let minW = Infinity;
            for (let x = Math.floor(cx + r); x <= Math.floor(tx + r); x++) {
              for (let y = y0; y <= y1; y++) for (let z = z0; z <= z1; z++) {
                if (isSolid(x, y, z) && x < minW) minW = x;
              }
            }
            if (minW !== Infinity && tx + r >= minW) { cx = minW - r - 0.0001; stoppedX = true; }
            else cx = tx;
          } else {
            let maxW = -Infinity;
            for (let x = Math.floor(cx - r); x >= Math.floor(tx - r); x--) {
              for (let y = y0; y <= y1; y++) for (let z = z0; z <= z1; z++) {
                if (isSolid(x, y, z) && (x + 1) > maxW) maxW = x + 1;
              }
            }
            if (maxW !== -Infinity && tx - r <= maxW) { cx = maxW + r + 0.0001; stoppedX = true; }
            else cx = tx;
          }
        }

        if (Math.abs(dz) > 0.00001) {
          const tz = cz + dz;
          const y0 = Math.floor(startY + eps), y1 = Math.floor(startY + h - eps);
          const x0 = Math.floor(cx - r + eps), x1 = Math.floor(cx + r - eps);

          if (dz > 0) {
            let minW = Infinity;
            for (let z = Math.floor(cz + r); z <= Math.floor(tz + r); z++) {
              for (let y = y0; y <= y1; y++) for (let z = z0; z <= z1; z++) {
                if (isSolid(x, y, z) && z < minW) minW = z;
              }
            }
            if (minW !== Infinity && tz + r >= minW) { cz = minW - r - 0.0001; stoppedZ = true; }
            else cz = tz;
          } else {
            let maxW = -Infinity;
            for (let z = Math.floor(cz - r); z >= Math.floor(tz - r); z--) {
              for (let y = y0; y <= y1; y++) for (let z = z0; z <= z1; z++) {
                if (isSolid(x, y, z) && (z + 1) > maxW) maxW = z + 1;
              }
            }
            if (maxW !== -Infinity && tz - r <= maxW) { cz = maxW + r + 0.0001; stoppedZ = true; }
            else cz = tz;
          }
        }

        return { x: cx, z: cz, stoppedX, stoppedZ };
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

        const spd = (keys['ShiftLeft'] || keys['ShiftRight']) ? 8.2 : 5.0;
        if (player.onGround) {
          if (move.lengthSq() > 0) { player.vel.x = move.x * spd; player.vel.z = move.z * spd; }
          else { player.vel.x *= Math.pow(0.55, delta * 30); player.vel.z *= Math.pow(0.55, delta * 30); }
          if (keys['Space']) { player.vel.y = 8.4; player.onGround = false; }
        } else {
          if (move.lengthSq() > 0) { player.vel.x += move.x * spd * delta * 4.5; player.vel.z += move.z * spd * delta * 4.5; }
          player.vel.x *= Math.pow(0.96, delta * 20); player.vel.z *= Math.pow(0.96, delta * 20);
          player.vel.y -= 24 * delta;
          if (player.vel.y < -32) player.vel.y = -32;
        }

        // 1. Resolve Y
        const dy = player.vel.y * delta;
        const r = player.radius, h = player.height, eps = 0.005;
        if (Math.abs(dy) > 0.00001) {
          if (dy < 0) {
            const targetY = player.pos.y + dy;
            const x0 = Math.floor(player.pos.x - r + eps), x1 = Math.floor(player.pos.x + r - eps);
            const z0 = Math.floor(player.pos.z - r + eps), z1 = Math.floor(player.pos.z + r - eps);
            let highestF = -Infinity;
            for (let y = Math.floor(player.pos.y); y >= Math.floor(targetY); y--) {
              for (let x = x0; x <= x1; x++) for (let z = z0; z <= z1; z++) {
                if (isSolid(x, y, z) && (y + 1) <= player.pos.y + 0.05 && (y + 1) > highestF) highestF = y + 1;
              }
            }
            if (highestF !== -Infinity && targetY <= highestF) {
              player.pos.y = highestF; player.vel.y = 0; player.onGround = true;
            } else {
              player.pos.y = targetY; player.onGround = false;
            }
          } else {
            const targetY = player.pos.y + dy;
            const x0 = Math.floor(player.pos.x - r + eps), x1 = Math.floor(player.pos.x + r - eps);
            const z0 = Math.floor(player.pos.z - r + eps), z1 = Math.floor(player.pos.z + r - eps);
            let lowestC = Infinity;
            for (let y = Math.floor(player.pos.y + h); y <= Math.floor(targetY + h); y++) {
              for (let x = x0; x <= x1; x++) for (let z = z0; z <= z1; z++) {
                if (isSolid(x, y, z) && y >= player.pos.y + h - 0.05 && y < lowestC) lowestC = y;
              }
            }
            if (lowestC !== Infinity && targetY + h >= lowestC) {
              player.pos.y = lowestC - h - 0.0001; player.vel.y = 0;
            } else {
              player.pos.y = targetY;
            }
            player.onGround = false;
          }
        } else {
          const gY = player.pos.y - 0.05;
          const x0 = Math.floor(player.pos.x - r + eps), x1 = Math.floor(player.pos.x + r - eps);
          const z0 = Math.floor(player.pos.z - r + eps), z1 = Math.floor(player.pos.z + r - eps);
          let foundG = false;
          for (let x = x0; x <= x1; x++) {
            for (let z = z0; z <= z1; z++) {
              if (isSolid(x, Math.floor(gY), z)) { foundG = true; break; }
            }
            if (foundG) break;
          }
          player.onGround = foundG;
        }

        // 2. Resolve Horizontal + Step-up
        const intendedDx = player.vel.x * delta, intendedDz = player.vel.z * delta;
        if (Math.abs(intendedDx) > 0.00001 || Math.abs(intendedDz) > 0.00001) {
          const flatRes = moveHorizontal(player.pos.x, player.pos.y, player.pos.z, intendedDx, intendedDz);
          const distFlatSq = (flatRes.x - player.pos.x)**2 + (flatRes.z - player.pos.z)**2;
          const distIntendedSq = intendedDx * intendedDx + intendedDz * intendedDz;

          if (player.onGround && distFlatSq < distIntendedSq - 0.0001) {
            const raisedY = player.pos.y + 1.05;
            if (!collidesAt(player.pos.x, raisedY, player.pos.z)) {
              const stepMove = moveHorizontal(player.pos.x, raisedY, player.pos.z, intendedDx, intendedDz);
              let maxStepF = -Infinity;
              const x0 = Math.floor(stepMove.x - r + eps), x1 = Math.floor(stepMove.x + r - eps);
              const z0 = Math.floor(stepMove.z - r + eps), z1 = Math.floor(stepMove.z + r - eps);

              for (let y = Math.floor(raisedY); y >= Math.floor(player.pos.y); y--) {
                for (let x = x0; x <= x1; x++) for (let z = z0; z <= z1; z++) {
                  if (isSolid(x, y, z) && (y + 1) <= raisedY && (y + 1) > maxStepF) maxStepF = y + 1;
                }
              }

              if (maxStepF !== -Infinity && maxStepF >= player.pos.y - 0.01 && !collidesAt(stepMove.x, maxStepF, stepMove.z)) {
                const distStepSq = (stepMove.x - player.pos.x)**2 + (stepMove.z - player.pos.z)**2;
                if (distStepSq > distFlatSq + 0.0001) {
                  player.pos.x = stepMove.x; player.pos.y = maxStepF; player.pos.z = stepMove.z;
                  player.onGround = true;
                  return;
                }
              }
            }
          }

          player.pos.x = flatRes.x; player.pos.z = flatRes.z;
          if (flatRes.stoppedX) player.vel.x = 0;
          if (flatRes.stoppedZ) player.vel.z = 0;
        }

        if (player.pos.y < -6) {
          const cx = Math.floor(player.pos.x), cz = Math.floor(player.pos.z);
          player.pos.set(cx + 0.5, getHighestBlock(cx, cz) + 1.2, cz + 0.5);
          player.vel.set(0, 0, 0); player.onGround = true;
        }
      }

      let timeOfDay = 0.2;
      const noonSky = new THREE.Color(0x78a7ff), sunsetSky = new THREE.Color(0xe07a5f), nightSky = new THREE.Color(0x0a0f1d);

      function updateDayNight(dt) {
        timeOfDay = (timeOfDay + dt * 0.015) % 1.0;
        const sunAngle = timeOfDay * Math.PI * 2, orbitDist = 70;
        const sunX = Math.cos(sunAngle) * orbitDist, sunY = Math.sin(sunAngle) * orbitDist, sunZ = Math.sin(sunAngle * 0.4) * 25;

        sunLight.position.set(sunX, sunY, sunZ); sunMesh.position.set(sunX, sunY, sunZ); sunMesh.lookAt(0, 0, 0);
        moonMesh.position.set(-sunX, -sunY, -sunZ); moonMesh.lookAt(0, 0, 0);

        const isSunUp = sunY > 0, factor = Math.max(0, Math.sin(sunAngle));
        let sky;
        if (isSunUp) {
          sky = factor > 0.3 ? noonSky.clone().lerp(sunsetSky, (1 - factor) * 0.7) : sunsetSky.clone().lerp(nightSky, 1 - factor / 0.3);
          sunLight.intensity = 0.2 + factor * 1.1; ambientLight.intensity = 0.2 + factor * 0.4; hemiLight.intensity = 0.15 + factor * 0.3;
          document.getElementById('time-val').textContent = factor > 0.4 ? 'Day' : 'Golden Hour';
        } else {
          sky = nightSky; sunLight.intensity = 0.08; ambientLight.intensity = 0.15; hemiLight.intensity = 0.1;
          document.getElementById('time-val').textContent = 'Night';
        }
        scene.background = sky; scene.fog.color = sky;
      }

      function updateParticles(dt) {
        for (let i = particles.length - 1; i >= 0; i--) {
          const p = particles[i];
          p.life -= dt; p.vel.y -= 18 * dt; p.mesh.position.addScaledVector(p.vel, dt);
          const s = Math.max(0.01, p.life / p.maxLife); p.mesh.scale.set(s, s, s);
          if (p.life <= 0) { scene.remove(p.mesh); p.mesh.geometry.dispose(); particles.splice(i, 1); }
        }
      }

      let lastTime = performance.now(), frameCount = 0, fpsTimer = 0;
      function loop() {
        requestAnimationFrame(loop);
        const now = performance.now();
        const dt = Math.min((now - lastTime) / 1000, 0.1);
        lastTime = now;

        frameCount++; fpsTimer += dt;
        if (fpsTimer >= 0.5) {
          document.getElementById('fps-val').textContent = Math.round(frameCount / fpsTimer);
          frameCount = 0; fpsTimer = 0;
          document.getElementById('pos-val').textContent = Math.round(player.pos.x) + ', ' + Math.round(player.pos.y) + ', ' + Math.round(player.pos.z);
        }

        updatePhysics(dt);
        updateChunks(player.pos.x, player.pos.z, false);
        camera.position.set(player.pos.x, player.pos.y + player.eyeHeight, player.pos.z);
        const euler = new THREE.Euler(0, 0, 0, 'YXZ');
        euler.x = player.pitch; euler.y = player.yaw;
        camera.quaternion.setFromEuler(euler);

        updateDayNight(dt);
        updateTargetRaycast();
        updateParticles(dt);
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
