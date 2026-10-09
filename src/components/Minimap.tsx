import React, { useEffect, useRef, useState } from 'react';
import type { VoxelGameEngine } from '../game/engine';
import { BLOCK_TYPES } from '../game/world';
import { Compass, ZoomIn, ZoomOut, Eye, EyeOff } from 'lucide-react';

interface MinimapProps {
  engine: VoxelGameEngine | null;
  visible?: boolean;
}

const BLOCK_COLORS: Record<number, string> = {
  [BLOCK_TYPES.GRASS]: '#5c8e32',
  [BLOCK_TYPES.DIRT]: '#866043',
  [BLOCK_TYPES.STONE]: '#787878',
  [BLOCK_TYPES.WOOD]: '#6f5238',
  [BLOCK_TYPES.BIRCH_WOOD]: '#d6d3c9',
  [BLOCK_TYPES.LEAVES]: '#2e7d32',
  [BLOCK_TYPES.CHERRY_LEAVES]: '#f48fb1',
  [BLOCK_TYPES.WATER]: '#2980b9',
  [BLOCK_TYPES.ICE]: '#b3e5fc',
  [BLOCK_TYPES.SAND]: '#e0d297',
  [BLOCK_TYPES.RED_SAND]: '#b7532a',
  [BLOCK_TYPES.SNOW]: '#f5f6fa',
  [BLOCK_TYPES.CACTUS]: '#27ae60',
  [BLOCK_TYPES.BRICK]: '#9c4236',
  [BLOCK_TYPES.BEDROCK]: '#2c3e50',
  [BLOCK_TYPES.WOOD_PLANKS]: '#b38243',
  [BLOCK_TYPES.GLASS]: '#b0bec5',
  [BLOCK_TYPES.CRAFTING_TABLE]: '#8b5a2b',
  [BLOCK_TYPES.COAL_ORE]: '#424242',
  [BLOCK_TYPES.IRON_ORE]: '#d7ccc8',
  [BLOCK_TYPES.GOLD_ORE]: '#fbc02d',
  [BLOCK_TYPES.DIAMOND_ORE]: '#4dd0e1',
  [BLOCK_TYPES.RED_FLOWER]: '#e74c3c',
  [BLOCK_TYPES.YELLOW_FLOWER]: '#f1c40f',
  [BLOCK_TYPES.SEAWEED]: '#1b5e20',
  [BLOCK_TYPES.CORAL_PINK]: '#ec407a',
  [BLOCK_TYPES.CORAL_CYAN]: '#00bcd4',
  [BLOCK_TYPES.CORAL_YELLOW]: '#ffb300',
  [BLOCK_TYPES.TORCH]: '#ff9800',
  [BLOCK_TYPES.TERRACOTTA]: '#d17d5a',
  [BLOCK_TYPES.RED_TERRACOTTA]: '#8f3d2e',
  [BLOCK_TYPES.ORANGE_TERRACOTTA]: '#a05325',
  [BLOCK_TYPES.YELLOW_TERRACOTTA]: '#ba8523',
  [BLOCK_TYPES.WHITE_TERRACOTTA]: '#d1b1a1',
  [BLOCK_TYPES.BROWN_TERRACOTTA]: '#4d3224',
  [BLOCK_TYPES.DARK_OAK_WOOD]: '#3b2713',
  [BLOCK_TYPES.DARK_OAK_LEAVES]: '#1e3c12',
  [BLOCK_TYPES.RED_MUSHROOM_BLOCK]: '#e74c3c',
  [BLOCK_TYPES.BROWN_MUSHROOM_BLOCK]: '#8c6747',
  [BLOCK_TYPES.MUSHROOM_STEM]: '#dcd0bc',
  [BLOCK_TYPES.JUNGLE_WOOD]: '#564426',
  [BLOCK_TYPES.JUNGLE_LEAVES]: '#2c6e14',
  [BLOCK_TYPES.MELON]: '#708a28',
  [BLOCK_TYPES.PUMPKIN]: '#d07416',
  [BLOCK_TYPES.LILY_PAD]: '#24581f',
  [BLOCK_TYPES.MUD]: '#3c2e26',
  [BLOCK_TYPES.MOSS]: '#596e2a',
  [BLOCK_TYPES.AMETHYST]: '#834eb8',
  [BLOCK_TYPES.MAGMA]: '#d94b0d',
  [BLOCK_TYPES.GLOWSTONE]: '#d69e38',
  [BLOCK_TYPES.OBSIDIAN]: '#161124',
  [BLOCK_TYPES.DEEPSLATE]: '#33333d',
};

export const Minimap: React.FC<MinimapProps> = ({ engine, visible = true }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [zoom, setZoom] = useState<number>(1.2); // blocks per pixel multiplier
  const [biomeName, setBiomeName] = useState<string>('Lush Plains');
  const [playerCoords, setPlayerCoords] = useState<{ x: number; y: number; z: number }>({ x: 0, y: 0, z: 0 });
  const [collapsed, setCollapsed] = useState<boolean>(false);

  useEffect(() => {
    let animId: number;
    let lastRenderTime = 0;

    const renderMinimap = (time: number) => {
      animId = requestAnimationFrame(renderMinimap);

      // Throttle minimap to ~30 FPS for optimal performance while maintaining smooth player rotation
      if (time - lastRenderTime < 30) return;
      lastRenderTime = time;

      if (!engine || !canvasRef.current || collapsed) return;

      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d', { alpha: true });
      if (!ctx) return;

      const width = canvas.width;
      const height = canvas.height;
      const radius = width / 2 - 4; // leave margin for circular border
      const centerX = width / 2;
      const centerY = height / 2;

      const playerPos = engine.physics.position;
      const px = playerPos.x;
      const py = playerPos.y;
      const pz = playerPos.z;

      // Update state for coordinate readout
      setPlayerCoords({
        x: Math.floor(px),
        y: Math.floor(py),
        z: Math.floor(pz),
      });

      // Update current biome
      const curBiome = engine.world.getBiome(Math.floor(px), Math.floor(pz));
      if (curBiome) {
        setBiomeName(curBiome.name);
      }

      // Clear canvas
      ctx.clearRect(0, 0, width, height);

      // Save context for circular clipping
      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.clip();

      // Background fill for deep void/water
      ctx.fillStyle = '#1e272e';
      ctx.fillRect(0, 0, width, height);

      // Block scanning range
      // e.g. radius is 66px, with zoom 1.2, scanRadius is ~24 blocks
      const scanRadiusBlocks = Math.ceil(radius / (4 * zoom));
      const blockSize = 4 * zoom;

      const minX = Math.floor(px - scanRadiusBlocks);
      const maxX = Math.floor(px + scanRadiusBlocks);
      const minZ = Math.floor(pz - scanRadiusBlocks);
      const maxZ = Math.floor(pz + scanRadiusBlocks);

      for (let wx = minX; wx <= maxX; wx++) {
        for (let wz = minZ; wz <= maxZ; wz++) {
          const screenX = centerX + (wx - px) * blockSize;
          const screenZ = centerY + (wz - pz) * blockSize;

          // Check if within circular radius + safety margin
          const dx = screenX - centerX;
          const dz = screenZ - centerY;
          if (dx * dx + dz * dz > (radius + blockSize) * (radius + blockSize)) {
            continue;
          }

          const topBlock = engine.world.getHighestVisibleBlock(wx, wz);
          const color = BLOCK_COLORS[topBlock.blockId] || '#555555';

          ctx.fillStyle = color;
          ctx.fillRect(Math.floor(screenX - blockSize / 2), Math.floor(screenZ - blockSize / 2), Math.ceil(blockSize) + 0.5, Math.ceil(blockSize) + 0.5);

          // Subtle elevation shading
          const heightDiff = topBlock.y - py;
          if (heightDiff > 1) {
            // Higher elevation -> slight highlight
            ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
            ctx.fillRect(Math.floor(screenX - blockSize / 2), Math.floor(screenZ - blockSize / 2), Math.ceil(blockSize), Math.ceil(blockSize));
          } else if (heightDiff < -2) {
            // Lower elevation -> slight shadow
            ctx.fillStyle = 'rgba(0, 0, 0, 0.18)';
            ctx.fillRect(Math.floor(screenX - blockSize / 2), Math.floor(screenZ - blockSize / 2), Math.ceil(blockSize), Math.ceil(blockSize));
          }
        }
      }

      // Render Mob markers (Sheep: Green/White, Zombies: Red)
      if (engine.mobs && engine.mobs.mobs) {
        for (const mob of engine.mobs.mobs) {
          const mx = mob.position.x;
          const mz = mob.position.z;
          const mobScreenX = centerX + (mx - px) * blockSize;
          const mobScreenZ = centerY + (mz - pz) * blockSize;

          const distSq = (mobScreenX - centerX) * (mobScreenX - centerX) + (mobScreenZ - centerY) * (mobScreenZ - centerY);
          if (distSq <= radius * radius) {
            ctx.beginPath();
            ctx.arc(mobScreenX, mobScreenZ, 2.5, 0, Math.PI * 2);
            ctx.fillStyle = mob.type === 'zombie' ? '#e74c3c' : '#2ecc71';
            ctx.fill();
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      // Restore circular clip
      ctx.restore();

      // Render Compass Crosshair & Outer Ring
      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.strokeStyle = '#2d3436';
      ctx.lineWidth = 4;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(centerX, centerY, radius + 2, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Compass Cardinal Points (North is -Z in world coords, South is +Z, East is +X, West is -X)
      ctx.font = 'bold 9px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // N (North at top)
      ctx.fillStyle = '#ff4757';
      ctx.fillText('N', centerX, centerY - radius + 8);

      // S (South)
      ctx.fillStyle = '#ced6e0';
      ctx.fillText('S', centerX, centerY + radius - 8);

      // E (East)
      ctx.fillStyle = '#ced6e0';
      ctx.fillText('E', centerX + radius - 8, centerY);

      // W (West)
      ctx.fillStyle = '#ced6e0';
      ctx.fillText('W', centerX - radius + 8, centerY);

      // Center Player Indicator (Arrow rotating with Player's Yaw)
      const yaw = engine.physics.yaw;
      ctx.save();
      ctx.translate(centerX, centerY);
      // In Three.js, yaw 0 faces along -Z (North), positive yaw turns left
      ctx.rotate(-yaw);

      // Draw sharp directional player arrow
      ctx.beginPath();
      ctx.moveTo(0, -7); // Tip pointing forward
      ctx.lineTo(4.5, 5);
      ctx.lineTo(0, 2.5);
      ctx.lineTo(-4.5, 5);
      ctx.closePath();

      ctx.fillStyle = '#00d2d3';
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.restore();
      ctx.restore();
    };

    animId = requestAnimationFrame(renderMinimap);
    return () => cancelAnimationFrame(animId);
  }, [engine, zoom, collapsed]);

  if (!visible) return null;

  return (
    <div
      id="minimap-container"
      className="fixed top-3 right-3 z-30 select-none flex flex-col items-end pointer-events-auto"
    >
      {/* Header bar / controls */}
      <div className="flex items-center gap-1.5 mb-1 bg-black/65 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/15 text-white/90 text-xs shadow-lg">
        <span className="font-mono text-[10px] text-cyan-300 font-bold tracking-wider">
          X:{playerCoords.x} Y:{playerCoords.y} Z:{playerCoords.z}
        </span>
        <button
          id="minimap-zoom-in-btn"
          onClick={() => setZoom((z) => Math.min(2.5, +(z + 0.3).toFixed(1)))}
          className="p-1 hover:text-cyan-400 active:scale-95 transition-transform"
          title="Zoom In"
        >
          <ZoomIn className="w-3 h-3" />
        </button>
        <button
          id="minimap-zoom-out-btn"
          onClick={() => setZoom((z) => Math.max(0.6, +(z - 0.3).toFixed(1)))}
          className="p-1 hover:text-cyan-400 active:scale-95 transition-transform"
          title="Zoom Out"
        >
          <ZoomOut className="w-3 h-3" />
        </button>
        <button
          id="minimap-collapse-btn"
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 hover:text-cyan-400 active:scale-95 transition-transform"
          title={collapsed ? 'Show Minimap' : 'Hide Minimap'}
        >
          {collapsed ? <Eye className="w-3 h-3 text-white/50" /> : <EyeOff className="w-3 h-3" />}
        </button>
      </div>

      {/* Circular Minimap Canvas */}
      {!collapsed && (
        <div className="relative group">
          <div className="w-[140px] h-[140px] rounded-full p-1 bg-stone-900/80 backdrop-blur-md shadow-[0_8px_25px_rgba(0,0,0,0.6)] border-2 border-stone-700/80 flex items-center justify-center overflow-hidden">
            <canvas
              ref={canvasRef}
              id="minimap-canvas"
              width={132}
              height={132}
              className="rounded-full w-[132px] h-[132px]"
            />
          </div>

          {/* Biome Badge */}
          <div className="mt-1 text-center bg-black/70 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-white/10 text-[10px] text-white/95 font-medium shadow max-w-[140px] truncate">
            {biomeName}
          </div>
        </div>
      )}
    </div>
  );
};
