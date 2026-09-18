/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { VoxelGameEngine, EngineStats } from './game/engine';
import { BLOCK_TYPES, SEA_LEVEL } from './game/world';
import {
  ITEM_TYPES,
  ITEM_DEFINITIONS,
  CRAFTING_RECIPES,
  CraftingRecipe,
  ItemStack,
  ARMOR_DATA,
} from './game/inventory';
import { WeatherType } from './game/weather';
import { STANDALONE_HTML_CODE } from './game/standaloneHtml';
import {
  Copy,
  Check,
  Download,
  Sun,
  Moon,
  HelpCircle,
  Eye,
  Package,
  Heart,
  Droplets,
  Hammer,
  ArrowRight,
  Sparkles,
  Camera,
  Play,
  RotateCcw,
  Pause,
  Volume2,
  VolumeX,
  Shield,
  CloudRain,
  CloudSnow,
  CloudLightning,
} from 'lucide-react';
import { sounds } from './game/audio';
import { SoundSettingsModal } from './components/SoundSettingsModal';

const SPLASH_TEXTS = [
  'Now with 3D Steve & First-Person Arm!',
  'Press F5 for Third-Person Perspective!',
  'Infinite Procedural Voxel Biomes!',
  'Underwater Coral Reefs & Kelp Forests!',
  'Dynamic Rain, Thunder & Snow Weather!',
  'Iron & Diamond Armor Sets with HUD!',
  'Diamond Pickaxes & Swords included!',
  '100% Vanilla WebGL & Three.js!',
  'Mining, Crafting & Exploring!',
  'Java Edition Inspired Voxel World!'
];

export default function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<VoxelGameEngine | null>(null);

  const [inTitleScreen, setInTitleScreen] = useState<boolean>(true);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [splashText] = useState(() => SPLASH_TEXTS[Math.floor(Math.random() * SPLASH_TEXTS.length)]);

  const [stats, setStats] = useState<EngineStats>({
    fps: 60,
    x: 0,
    y: 16,
    z: 0,
    timeOfDay: 'Day',
    isNight: false,
    selectedBlockId: BLOCK_TYPES.GRASS,
    isLocked: false,
    health: 100,
    oxygen: 100,
    isSubmerged: false,
    inWater: false,
    perspectiveMode: 0,
    miningProgress: 0,
    weather: 'clear',
    armorDefense: 0,
  });

  const [inventorySlots, setInventorySlots] = useState<(ItemStack | null)[]>([]);
  const [armorSlots, setArmorSlots] = useState<(ItemStack | null)[]>([null, null, null, null]);
  const [selectedHotbarIndex, setSelectedHotbarIndex] = useState<number>(0);
  const [showInventory, setShowInventory] = useState<boolean>(false);
  const [showHelp, setShowHelp] = useState<boolean>(false);
  const [showAudioSettings, setShowAudioSettings] = useState<boolean>(false);
  const [audioSettings, setAudioSettings] = useState(() => sounds.getSettings());
  const [copied, setCopied] = useState<boolean>(false);
  const [craftingFeedback, setCraftingFeedback] = useState<string | null>(null);

  const [gridSlots, setGridSlots] = useState<(ItemStack | null)[]>([null, null, null, null]);

  // Sync audio settings
  useEffect(() => {
    return sounds.subscribe((s) => setAudioSettings(s));
  }, []);

  // Sync inventory slots and equipped armor from engine
  const refreshInventory = () => {
    if (engineRef.current) {
      setInventorySlots([...engineRef.current.inventory.slots]);
      setSelectedHotbarIndex(engineRef.current.inventory.selectedHotbarIndex);
      setArmorSlots([...engineRef.current.inventory.armorSlots]);
    }
  };

  useEffect(() => {
    if (!containerRef.current) return;

    // Boot game engine with panorama mode for the title screen
    const engine = new VoxelGameEngine(containerRef.current, (newStats) => {
      setStats(newStats);
      setInventorySlots([...engine.inventory.slots]);
      setSelectedHotbarIndex(engine.inventory.selectedHotbarIndex);
      setArmorSlots([...engine.inventory.armorSlots]);
    });
    engine.setPanoramaMode(true);
    engineRef.current = engine;
    refreshInventory();

    const handleUnlockAudio = () => {
      sounds.initContext();
    };
    window.addEventListener('pointerdown', handleUnlockAudio, { once: true });
    window.addEventListener('keydown', handleUnlockAudio, { once: true });

    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'F5') {
        e.preventDefault();
        sounds.playUIClick();
        engine.togglePerspective();
        return;
      }

      if (e.code === 'KeyE') {
        setShowInventory((prev) => {
          const next = !prev;
          if (next && document.pointerLockElement) {
            document.exitPointerLock();
          }
          sounds.playInventoryToggle(next);
          return next;
        });
      } else if (e.code === 'KeyH') {
        setShowHelp((prev) => {
          sounds.playUIClick();
          return !prev;
        });
      } else if (e.code === 'Escape') {
        if (showAudioSettings) {
          setShowAudioSettings(false);
          sounds.playUIClick();
        } else if (showInventory) {
          setShowInventory(false);
          sounds.playInventoryToggle(false);
        } else if (showHelp) {
          setShowHelp(false);
          sounds.playUIClick();
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);

    return () => {
      window.removeEventListener('pointerdown', handleUnlockAudio);
      window.removeEventListener('keydown', handleUnlockAudio);
      window.removeEventListener('keydown', handleGlobalKeyDown);
      engine.destroy();
      engineRef.current = null;
    };
  }, [showAudioSettings, showInventory, showHelp]);

  const startGame = () => {
    sounds.playUIClick();
    sounds.initContext();
    setInTitleScreen(false);
    setIsPaused(false);
    if (engineRef.current) {
      engineRef.current.setPanoramaMode(false);
      setTimeout(() => {
        engineRef.current?.container.querySelector('canvas')?.requestPointerLock();
      }, 50);
    }
  };

  const returnToTitle = () => {
    sounds.playUIClick();
    if (document.pointerLockElement) document.exitPointerLock();
    setIsPaused(false);
    setShowInventory(false);
    setShowHelp(false);
    setShowAudioSettings(false);
    setInTitleScreen(true);
    if (engineRef.current) {
      engineRef.current.setPanoramaMode(true);
    }
  };

  const handleTogglePerspective = () => {
    sounds.playUIClick();
    if (engineRef.current) {
      engineRef.current.togglePerspective();
    }
  };

  const getPerspectiveName = (mode: number) => {
    if (mode === 0) return '1st Person';
    if (mode === 1) return '3rd Person (Back)';
    return '3rd Person (Front)';
  };

  const handleSelectSlot = (index: number) => {
    if (engineRef.current) {
      if (engineRef.current.inventory.selectedHotbarIndex !== index) {
        sounds.playSlotSwitch();
      }
      engineRef.current.inventory.selectedHotbarIndex = index;
      setSelectedHotbarIndex(index);
    }
  };

  const getItemIcon = (id: number): string | undefined => {
    if (!engineRef.current) return undefined;
    const def = ITEM_DEFINITIONS[id];
    if (def && def.icon) return def.icon;

    const atlas = engineRef.current.atlas.dataUrls;
    switch (id) {
      case BLOCK_TYPES.GRASS: return atlas.grass;
      case BLOCK_TYPES.DIRT: return atlas.dirt;
      case BLOCK_TYPES.STONE: return atlas.stone;
      case BLOCK_TYPES.WOOD: return atlas.wood;
      case BLOCK_TYPES.LEAVES: return atlas.leaves;
      case BLOCK_TYPES.BRICK: return atlas.brick;
      case BLOCK_TYPES.SAND: return atlas.sand;
      case BLOCK_TYPES.CORAL_PINK: return atlas.coralPink;
      case BLOCK_TYPES.CORAL_CYAN: return atlas.coralCyan;
      case BLOCK_TYPES.CORAL_YELLOW: return atlas.coralYellow;
      case BLOCK_TYPES.WOOD_PLANKS: return atlas.woodPlanks;
      case BLOCK_TYPES.GLASS: return atlas.glass;
      case BLOCK_TYPES.CRAFTING_TABLE: return atlas.craftingTable;
      case BLOCK_TYPES.COAL_ORE: return atlas.coalOre;
      case BLOCK_TYPES.IRON_ORE: return atlas.ironOre;
      case BLOCK_TYPES.GOLD_ORE: return atlas.goldOre;
      case BLOCK_TYPES.DIAMOND_ORE: return atlas.diamondOre;
      case BLOCK_TYPES.BIRCH_WOOD: return atlas.birchWood;
      case BLOCK_TYPES.RED_FLOWER: return atlas.redFlower;
      case BLOCK_TYPES.YELLOW_FLOWER: return atlas.yellowFlower;
      case BLOCK_TYPES.SEAWEED: return atlas.seaweed;
      case BLOCK_TYPES.TORCH: return atlas.torch;
      default: return atlas.dirt;
    }
  };

  const handleCycleWeather = () => {
    if (!engineRef.current) return;
    sounds.playUIClick();
    const cycle: WeatherType[] = ['clear', 'rain', 'thunder', 'snow'];
    const curIdx = cycle.indexOf(stats.weather);
    const nextWeather = cycle[(curIdx + 1) % cycle.length];
    engineRef.current.setWeather(nextWeather);
  };

  const handleEquipArmor = (fromSlotIndex: number) => {
    if (!engineRef.current) return;
    const item = inventorySlots[fromSlotIndex];
    if (!item) return;
    const armorInfo = ARMOR_DATA[item.id];
    if (!armorInfo) return;

    const res = engineRef.current.inventory.equipArmorItem(fromSlotIndex);
    if (res.success) {
      sounds.playArmorEquip(armorInfo.tier);
      engineRef.current.updateArmorVisuals();
      refreshInventory();
      setCraftingFeedback(`Equipped ${ITEM_DEFINITIONS[item.id]?.name || 'Armor'}!`);
      setTimeout(() => setCraftingFeedback(null), 2000);
    }
  };

  const handleUnequipArmor = (armorSlotIdx: number) => {
    if (!engineRef.current) return;
    const armorItem = armorSlots[armorSlotIdx];
    if (!armorItem) return;

    const ok = engineRef.current.inventory.unequipArmorSlot(armorSlotIdx);
    if (ok) {
      sounds.playItemPickup();
      engineRef.current.updateArmorVisuals();
      refreshInventory();
    }
  };

  const handleCraftRecipe = (recipe: CraftingRecipe) => {
    if (!engineRef.current) return;
    const success = engineRef.current.inventory.craftRecipe(recipe);
    if (success) {
      sounds.playCraftSuccess();
      refreshInventory();
      setCraftingFeedback(`Crafted ${recipe.name}!`);
      setTimeout(() => setCraftingFeedback(null), 2000);
    } else {
      sounds.playUIClick();
    }
  };

  const handleSlotClick = (index: number) => {
    if (!engineRef.current) return;
    sounds.playUIClick();
    if (index < 6) {
      handleSelectSlot(index);
    } else {
      const item = inventorySlots[index];
      if (item && ARMOR_DATA[item.id]) {
        // Quick equip armor piece into its dedicated slot
        handleEquipArmor(index);
      } else {
        // Quick swap main inventory item into currently active hotbar slot
        engineRef.current.inventory.swapSlots(index, selectedHotbarIndex);
        refreshInventory();
      }
    }
  };

  const handleGridSlotClick = (gridIdx: number) => {
    // If grid slot has item, return to player inventory
    const item = gridSlots[gridIdx];
    if (item && engineRef.current) {
      sounds.playItemPickup();
      engineRef.current.inventory.addItem(item.id, item.count);
      const newGrid = [...gridSlots];
      newGrid[gridIdx] = null;
      setGridSlots(newGrid);
      refreshInventory();
    }
  };

  const handlePlaceIntoGrid = (invIdx: number) => {
    const item = inventorySlots[invIdx];
    if (!item || !engineRef.current) return;

    // Find empty grid slot
    const emptyGridIdx = gridSlots.findIndex((s) => s === null);
    if (emptyGridIdx !== -1) {
      sounds.playUIClick();
      const newGrid = [...gridSlots];
      newGrid[emptyGridIdx] = { id: item.id, count: 1 };
      setGridSlots(newGrid);

      // Deduct 1 from inventory
      item.count--;
      if (item.count <= 0) {
        engineRef.current.inventory.slots[invIdx] = null;
      }
      refreshInventory();
    }
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(STANDALONE_HTML_CODE);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      const el = document.createElement('textarea');
      el.value = STANDALONE_HTML_CODE;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([STANDALONE_HTML_CODE], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'minecraft_underwater_crafting.html';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Hearts calculation (10 hearts total, 10 HP per heart)
  const fullHearts = Math.floor(stats.health / 10);
  const hasHalfHeart = stats.health % 10 >= 5;

  // Oxygen calculation (10 bubbles total, 10 O2 per bubble)
  const oxygenBubbles = Math.ceil(stats.oxygen / 10);

  const isOceanBiome = stats.y <= SEA_LEVEL + 2;

  // Tool durability dynamic health color
  const getDurabilityColor = (durability: number, maxDurability: number) => {
    const ratio = Math.max(0, Math.min(1, durability / maxDurability));
    if (ratio > 0.5) return '#4ade80'; // Healthy green
    if (ratio > 0.2) return '#fbbf24'; // Medium amber
    return '#f87171'; // Critical red
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden select-none bg-[#0a0e1a] text-white">
      {/* 3D WebGL Canvas */}
      <div
        id="canvas-container"
        ref={containerRef}
        className="w-full h-full block cursor-crosshair"
      />

      {/* Underwater Screen Tint & Vignette */}
      {!inTitleScreen && stats.isSubmerged && (
        <div className="pointer-events-none fixed inset-0 z-10 bg-cyan-900/30 mix-blend-multiply backdrop-blur-[0.5px]">
          <div className="absolute inset-0 shadow-[inset_0_0_120px_rgba(6,78,119,0.85)]" />
        </div>
      )}

      {/* Drowning Damage Flash */}
      {!inTitleScreen && stats.isSubmerged && stats.oxygen <= 0 && (
        <div className="pointer-events-none fixed inset-0 z-15 bg-red-600/25 animate-pulse" />
      )}

      {/* Centered Crosshair with Progressive Breaking Arc (only in 1st person gameplay) */}
      {!inTitleScreen && stats.perspectiveMode === 0 && (
        <div className="pointer-events-none fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex items-center justify-center">
          <div className="relative w-4 h-4 flex items-center justify-center">
            <div className="absolute top-[7px] left-0 w-4 h-[2px] bg-white/90 shadow-[0_0_2px_rgba(0,0,0,0.8)]" />
            <div className="absolute top-0 left-[7px] w-[2px] h-4 bg-white/90 shadow-[0_0_2px_rgba(0,0,0,0.8)]" />
          </div>
          {stats.miningProgress > 0 && (
            <div className="absolute w-8 h-8 flex items-center justify-center pointer-events-none">
              <svg className="w-8 h-8 -rotate-90">
                <circle
                  cx="16"
                  cy="16"
                  r="11"
                  fill="none"
                  stroke="rgba(0,0,0,0.4)"
                  strokeWidth="2.5"
                />
                <circle
                  cx="16"
                  cy="16"
                  r="11"
                  fill="none"
                  stroke="#fbbf24"
                  strokeWidth="2.5"
                  strokeDasharray={69.1}
                  strokeDashoffset={69.1 * (1 - Math.min(1, stats.miningProgress))}
                  strokeLinecap="round"
                />
              </svg>
            </div>
          )}
        </div>
      )}

      {/* Top Left HUD: Coordinates, FPS, Day/Night, Biome */}
      {!inTitleScreen && (
        <div className="absolute top-4 left-4 z-20 flex flex-col gap-1.5 pointer-events-none">
          <div className="bg-[#0e121c]/80 backdrop-blur-md px-3 py-2 rounded-lg border border-white/10 text-xs font-mono shadow-lg flex items-center gap-3">
            <span className="text-emerald-400 font-bold">{stats.fps} FPS</span>
            <span className="text-white/40">|</span>
            <span className="text-white/80">
              XYZ: <span className="text-white font-medium">{stats.x}, {stats.y}, {stats.z}</span>
            </span>
            <span className="text-white/40">|</span>
            <span className="text-cyan-300 font-medium">
              {isOceanBiome ? 'Coral Ocean' : 'Plains Biome'}
            </span>
            <span className="text-white/40">|</span>
            <span className="flex items-center gap-1.5 font-medium">
              {stats.isNight ? (
                <>
                  <Moon className="w-3.5 h-3.5 text-indigo-300" />
                  <span className="text-indigo-300">Night</span>
                </>
              ) : (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-amber-300">{stats.timeOfDay}</span>
                </>
              )}
            </span>
          </div>
        </div>
      )}

      {/* Top Right Controls */}
      {!inTitleScreen && (
        <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
          {!stats.isLocked && !showInventory && !isPaused && (
            <div className="bg-[#0e121c]/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-xs text-white/80 pointer-events-none flex items-center gap-1.5 animate-pulse">
              <Eye className="w-3.5 h-3.5 text-emerald-400" />
              <span>Click to lock cursor (ESC to pause)</span>
            </div>
          )}

          {/* Perspective Mode Toggle */}
          <button
            id="btn-hud-perspective"
            onClick={handleTogglePerspective}
            className="bg-[#0e121c]/80 hover:bg-[#1a2236]/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-xs text-white/90 hover:text-white transition shadow flex items-center gap-1.5 cursor-pointer"
            title="Toggle Perspective (Key: F5)"
          >
            <Camera className="w-3.5 h-3.5 text-cyan-400" />
            <span>{getPerspectiveName(stats.perspectiveMode)} [F5]</span>
          </button>

          {/* Dynamic Weather Toggle */}
          <button
            id="btn-hud-weather"
            onClick={handleCycleWeather}
            className="bg-[#0e121c]/80 hover:bg-[#1a2236]/90 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-white/10 text-xs text-white/90 hover:text-white transition shadow flex items-center gap-1.5 cursor-pointer capitalize"
            title="Cycle Weather (Sunny, Rain, Thunder, Snow)"
          >
            {stats.weather === 'clear' && <Sun className="w-3.5 h-3.5 text-amber-300" />}
            {stats.weather === 'rain' && <CloudRain className="w-3.5 h-3.5 text-blue-400" />}
            {stats.weather === 'thunder' && <CloudLightning className="w-3.5 h-3.5 text-purple-400" />}
            {stats.weather === 'snow' && <CloudSnow className="w-3.5 h-3.5 text-cyan-200" />}
            <span>{stats.weather}</span>
          </button>

          <button
            id="btn-inventory"
            onClick={() => {
              if (document.pointerLockElement) document.exitPointerLock();
              const next = !showInventory;
              sounds.playInventoryToggle(next);
              setShowInventory(next);
            }}
            className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition shadow flex items-center gap-1.5 cursor-pointer backdrop-blur-md ${
              showInventory
                ? 'bg-amber-600/90 border-amber-400 text-white'
                : 'bg-[#0e121c]/80 hover:bg-[#1a2236]/90 border-white/10 text-white/90 hover:text-white'
            }`}
            title="Toggle Inventory & Crafting (Key: E)"
          >
            <Package className="w-3.5 h-3.5 text-amber-300" />
            <span>Inventory [E]</span>
          </button>

          <button
            id="btn-hud-audio"
            onClick={() => {
              if (document.pointerLockElement) document.exitPointerLock();
              sounds.playUIClick();
              setShowAudioSettings(true);
            }}
            className="bg-[#0e121c]/80 hover:bg-[#1a2236]/90 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-white/10 text-xs text-white/80 hover:text-white transition shadow cursor-pointer flex items-center gap-1.5"
            title="Audio & Nature Settings"
          >
            {audioSettings.isMuted ? (
              <VolumeX className="w-3.5 h-3.5 text-red-400" />
            ) : (
              <Volume2 className="w-3.5 h-3.5 text-amber-400" />
            )}
            <span className="hidden sm:inline">Audio</span>
          </button>

          <button
            id="btn-help"
            onClick={() => {
              sounds.playUIClick();
              setShowHelp(!showHelp);
            }}
            className="bg-[#0e121c]/80 hover:bg-[#1a2236]/90 backdrop-blur-md p-2 rounded-lg border border-white/10 text-white/80 hover:text-white transition shadow cursor-pointer"
            title="Controls Guide (Key: H)"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          <button
            id="btn-hud-pause"
            onClick={() => {
              if (document.pointerLockElement) document.exitPointerLock();
              sounds.playUIClick();
              setIsPaused(true);
            }}
            className="bg-[#0e121c]/80 hover:bg-[#1a2236]/90 backdrop-blur-md p-2 rounded-lg border border-white/10 text-white/80 hover:text-white transition shadow cursor-pointer"
            title="Pause Menu (Key: ESC)"
          >
            <Pause className="w-4 h-4 text-white/70" />
          </button>
        </div>
      )}

      {/* Minecraft Title Screen Overlay */}
      {inTitleScreen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-between items-center bg-black/35 backdrop-blur-[2px] p-6 select-none font-mono">
          {/* Top Row / Header */}
          <div className="w-full flex justify-end items-center gap-3">
            <button
              onClick={handleCopyCode}
              className="px-3 py-1.5 bg-[#4a4a4a] hover:bg-[#606060] border-t border-l border-[#888] border-b-2 border-r-2 border-[#1e1e1e] text-xs text-white shadow cursor-pointer"
            >
              {copied ? 'Copied HTML!' : 'Standalone HTML'}
            </button>
            <button
              onClick={handleDownload}
              className="px-3 py-1.5 bg-[#4a4a4a] hover:bg-[#606060] border-t border-l border-[#888] border-b-2 border-r-2 border-[#1e1e1e] text-xs text-white shadow cursor-pointer"
            >
              Download .html
            </button>
          </div>

          {/* Center Banner and Menu */}
          <div className="flex flex-col items-center max-w-md w-full">
            {/* Minecraft 3D Blocky Logo */}
            <div className="relative mb-8 text-center">
              <h1 className="text-5xl md:text-7xl font-black tracking-widest text-[#cfd8dc] drop-shadow-[5px_5px_0px_#111111] uppercase font-mono">
                MINECRAFT
              </h1>
              <div className="text-xs md:text-sm font-bold tracking-[0.35em] text-[#64b5f6] drop-shadow-[2px_2px_0px_#000] uppercase mt-1">
                VOXEL SANDBOX EDITION
              </div>

              {/* Bouncing Yellow Splash Text */}
              <div className="absolute -bottom-4 right-0 md:-right-6 translate-x-3 rotate-[-15deg] text-[#fff176] font-bold text-xs md:text-sm drop-shadow-[2px_2px_0px_#000] animate-bounce pointer-events-none whitespace-nowrap">
                {splashText}
              </div>
            </div>

            {/* Minecraft Button Menu */}
            <div className="w-full space-y-3">
              <button
                id="btn-play-world"
                onClick={startGame}
                className="w-full py-3 px-4 bg-[#4a4a4a] hover:bg-[#666666] active:bg-[#333333] border-t-2 border-l-2 border-t-[#858585] border-l-[#858585] border-b-2 border-r-2 border-b-[#1e1e1e] border-r-[#1e1e1e] text-white font-bold text-base tracking-wider uppercase drop-shadow-[2px_2px_0px_rgba(0,0,0,0.8)] flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <Play className="w-5 h-5 text-emerald-400 fill-emerald-400" />
                <span>Singleplayer</span>
              </button>

              <button
                id="btn-title-perspective"
                onClick={handleTogglePerspective}
                className="w-full py-3 px-4 bg-[#4a4a4a] hover:bg-[#666666] active:bg-[#333333] border-t-2 border-l-2 border-t-[#858585] border-l-[#858585] border-b-2 border-r-2 border-b-[#1e1e1e] border-r-[#1e1e1e] text-white font-bold text-sm tracking-wider uppercase drop-shadow-[2px_2px_0px_rgba(0,0,0,0.8)] flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <Camera className="w-4 h-4 text-cyan-300" />
                <span>Perspective: {getPerspectiveName(stats.perspectiveMode)}</span>
              </button>

              <div className="grid grid-cols-3 gap-2.5">
                <button
                  id="btn-title-audio"
                  onClick={() => {
                    sounds.playUIClick();
                    setShowAudioSettings(true);
                  }}
                  className="py-2.5 px-2 bg-[#4a4a4a] hover:bg-[#666666] active:bg-[#333333] border-t-2 border-l-2 border-t-[#858585] border-l-[#858585] border-b-2 border-r-2 border-b-[#1e1e1e] border-r-[#1e1e1e] text-white font-bold text-xs tracking-wider uppercase drop-shadow-[2px_2px_0px_rgba(0,0,0,0.8)] flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                >
                  {audioSettings.isMuted ? (
                    <VolumeX className="w-4 h-4 text-red-400" />
                  ) : (
                    <Volume2 className="w-4 h-4 text-amber-300" />
                  )}
                  <span>Audio</span>
                </button>

                <button
                  id="btn-title-help"
                  onClick={() => {
                    sounds.playUIClick();
                    setShowHelp(true);
                  }}
                  className="py-2.5 px-2 bg-[#4a4a4a] hover:bg-[#666666] active:bg-[#333333] border-t-2 border-l-2 border-t-[#858585] border-l-[#858585] border-b-2 border-r-2 border-b-[#1e1e1e] border-r-[#1e1e1e] text-white font-bold text-xs tracking-wider uppercase drop-shadow-[2px_2px_0px_rgba(0,0,0,0.8)] flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                >
                  <HelpCircle className="w-4 h-4 text-amber-300" />
                  <span>Controls</span>
                </button>

                <button
                  id="btn-title-copy"
                  onClick={() => {
                    sounds.playUIClick();
                    handleCopyCode();
                  }}
                  className="py-2.5 px-2 bg-[#4a4a4a] hover:bg-[#666666] active:bg-[#333333] border-t-2 border-l-2 border-t-[#858585] border-l-[#858585] border-b-2 border-r-2 border-b-[#1e1e1e] border-r-[#1e1e1e] text-white font-bold text-xs tracking-wider uppercase drop-shadow-[2px_2px_0px_rgba(0,0,0,0.8)] flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Copy className="w-4 h-4 text-emerald-300" />
                  <span>HTML</span>
                </button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="w-full flex justify-between items-center text-[11px] text-white/60 tracking-wider">
            <span>Minecraft Web Edition 1.20</span>
            <span>Three.js Voxel Engine with Steve & Animated Arm</span>
          </div>
        </div>
      )}

      {/* In-Game Pause Menu Overlay */}
      {isPaused && !inTitleScreen && (
        <div className="fixed inset-0 z-45 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 font-mono select-none">
          <div className="w-full max-w-sm flex flex-col items-center space-y-4">
            <h2 className="text-2xl md:text-3xl font-black tracking-widest text-[#cfd8dc] drop-shadow-[3px_3px_0px_#111] uppercase">
              Game Paused
            </h2>

            <div className="w-full space-y-2.5">
              <button
                id="btn-resume-game"
                onClick={() => {
                  sounds.playUIClick();
                  setIsPaused(false);
                  engineRef.current?.container.querySelector('canvas')?.requestPointerLock();
                }}
                className="w-full py-2.5 px-4 bg-[#4a4a4a] hover:bg-[#666666] active:bg-[#333333] border-t-2 border-l-2 border-t-[#858585] border-l-[#858585] border-b-2 border-r-2 border-b-[#1e1e1e] border-r-[#1e1e1e] text-white font-bold text-sm tracking-wider uppercase drop-shadow-[2px_2px_0px_rgba(0,0,0,0.8)] flex items-center justify-center gap-2 cursor-pointer"
              >
                <Play className="w-4 h-4 text-emerald-400 fill-emerald-400" />
                <span>Back to Game</span>
              </button>

              <button
                id="btn-pause-audio"
                onClick={() => {
                  sounds.playUIClick();
                  setShowAudioSettings(true);
                }}
                className="w-full py-2.5 px-4 bg-[#4a4a4a] hover:bg-[#666666] active:bg-[#333333] border-t-2 border-l-2 border-t-[#858585] border-l-[#858585] border-b-2 border-r-2 border-b-[#1e1e1e] border-r-[#1e1e1e] text-white font-bold text-sm tracking-wider uppercase drop-shadow-[2px_2px_0px_rgba(0,0,0,0.8)] flex items-center justify-center gap-2 cursor-pointer"
              >
                {audioSettings.isMuted ? (
                  <VolumeX className="w-4 h-4 text-red-400" />
                ) : (
                  <Volume2 className="w-4 h-4 text-amber-300" />
                )}
                <span>Audio & Nature Settings</span>
              </button>

              <button
                id="btn-pause-perspective"
                onClick={handleTogglePerspective}
                className="w-full py-2.5 px-4 bg-[#4a4a4a] hover:bg-[#666666] active:bg-[#333333] border-t-2 border-l-2 border-t-[#858585] border-l-[#858585] border-b-2 border-r-2 border-b-[#1e1e1e] border-r-[#1e1e1e] text-white font-bold text-sm tracking-wider uppercase drop-shadow-[2px_2px_0px_rgba(0,0,0,0.8)] flex items-center justify-center gap-2 cursor-pointer"
              >
                <Camera className="w-4 h-4 text-cyan-300" />
                <span>Perspective: {getPerspectiveName(stats.perspectiveMode)} [F5]</span>
              </button>

              <button
                id="btn-pause-weather"
                onClick={handleCycleWeather}
                className="w-full py-2.5 px-4 bg-[#4a4a4a] hover:bg-[#666666] active:bg-[#333333] border-t-2 border-l-2 border-t-[#858585] border-l-[#858585] border-b-2 border-r-2 border-b-[#1e1e1e] border-r-[#1e1e1e] text-white font-bold text-sm tracking-wider uppercase drop-shadow-[2px_2px_0px_rgba(0,0,0,0.8)] flex items-center justify-center gap-2 cursor-pointer"
              >
                {stats.weather === 'clear' && <Sun className="w-4 h-4 text-amber-300" />}
                {stats.weather === 'rain' && <CloudRain className="w-4 h-4 text-blue-400" />}
                {stats.weather === 'thunder' && <CloudLightning className="w-4 h-4 text-purple-400" />}
                {stats.weather === 'snow' && <CloudSnow className="w-4 h-4 text-cyan-200" />}
                <span>Weather: {stats.weather}</span>
              </button>

              <button
                id="btn-pause-help"
                onClick={() => {
                  sounds.playUIClick();
                  setShowHelp(true);
                }}
                className="w-full py-2.5 px-4 bg-[#4a4a4a] hover:bg-[#666666] active:bg-[#333333] border-t-2 border-l-2 border-t-[#858585] border-l-[#858585] border-b-2 border-r-2 border-b-[#1e1e1e] border-r-[#1e1e1e] text-white font-bold text-sm tracking-wider uppercase drop-shadow-[2px_2px_0px_rgba(0,0,0,0.8)] flex items-center justify-center gap-2 cursor-pointer"
              >
                <HelpCircle className="w-4 h-4 text-amber-300" />
                <span>Help & Controls [H]</span>
              </button>

              <button
                id="btn-quit-title"
                onClick={returnToTitle}
                className="w-full py-2.5 px-4 bg-[#4a4a4a] hover:bg-[#666666] active:bg-[#333333] border-t-2 border-l-2 border-t-[#858585] border-l-[#858585] border-b-2 border-r-2 border-b-[#1e1e1e] border-r-[#1e1e1e] text-white font-bold text-sm tracking-wider uppercase drop-shadow-[2px_2px_0px_rgba(0,0,0,0.8)] flex items-center justify-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4 text-red-300" />
                <span>Save and Quit to Title</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Help Modal */}
      {showHelp && (
        <div className="absolute top-16 right-4 z-30 w-80 bg-[#0e1424]/95 backdrop-blur-lg p-4 rounded-xl border border-white/15 shadow-2xl text-xs text-white/90 space-y-2.5">
          <div className="flex justify-between items-center border-b border-white/10 pb-2">
            <h3 className="font-semibold text-white flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Voxel Sandbox Controls</span>
            </h3>
            <button
              onClick={() => setShowHelp(false)}
              className="text-white/60 hover:text-white cursor-pointer"
            >
              ✕
            </button>
          </div>
          <div className="space-y-1.5 font-mono">
            <div className="flex justify-between"><span className="text-white/60">WASD / Arrows</span><span>Move / Swim</span></div>
            <div className="flex justify-between"><span className="text-white/60">Space</span><span>Jump / Swim Up</span></div>
            <div className="flex justify-between"><span className="text-white/60">Left Shift</span><span>Sprint / Dive Down</span></div>
            <div className="flex justify-between"><span className="text-white/60">Left Click</span><span>Break / Mine Block</span></div>
            <div className="flex justify-between"><span className="text-white/60">Right Click</span><span>Place Selected Block</span></div>
            <div className="flex justify-between"><span className="text-white/60">Key E</span><span>Open Inventory / Crafting</span></div>
            <div className="flex justify-between"><span className="text-white/60">Keys 1 - 6</span><span>Hotbar Slots</span></div>
            <div className="flex justify-between"><span className="text-white/60">Scroll Wheel</span><span>Cycle Hotbar</span></div>
            <div className="flex justify-between"><span className="text-white/60">ESC</span><span>Unlock Pointer</span></div>
          </div>
          <div className="pt-2 border-t border-white/10 text-[11px] text-white/60 space-y-1">
            <p>🌊 <strong>Underwater:</strong> Swim using Space & Shift. Monitor oxygen bubbles to avoid drowning.</p>
            <p>🔨 <strong>Crafting:</strong> Open Inventory [E] to turn Wood into Planks, Sticks, and Pickaxes.</p>
          </div>
        </div>
      )}

      {/* Inventory & Crafting Screen Modal */}
      {showInventory && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-2xl bg-[#141926]/95 border border-white/20 rounded-2xl p-6 shadow-2xl space-y-6">
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Hammer className="w-5 h-5 text-amber-400" />
                <h2 className="text-base font-bold text-white">Player Inventory & Crafting</h2>
                {craftingFeedback && (
                  <span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono animate-fade-in">
                    {craftingFeedback}
                  </span>
                )}
              </div>
              <button
                onClick={() => setShowInventory(false)}
                className="text-white/60 hover:text-white text-sm cursor-pointer p-1 rounded-lg hover:bg-white/10 transition"
              >
                ✕ Close [E]
              </button>
            </div>

            {/* Quick Crafting Catalog */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-white/70">
                <span className="font-semibold uppercase tracking-wider text-amber-300">Crafting Recipes</span>
                <span>Click "Craft" to combine basic materials</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {CRAFTING_RECIPES.map((recipe) => {
                  const canCraft = engineRef.current?.inventory.hasIngredients(recipe.ingredients);
                  const resultDef = ITEM_DEFINITIONS[recipe.result.id];
                  const resultIcon = getItemIcon(recipe.result.id);

                  return (
                    <div
                      key={recipe.id}
                      className={`p-2 rounded-xl border flex flex-col justify-between transition ${
                        canCraft
                          ? 'bg-[#1e2638] border-amber-400/40 hover:border-amber-400 shadow-md'
                          : 'bg-[#10141f] border-white/5 opacity-55'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {resultIcon && (
                          <img
                            src={resultIcon}
                            alt={recipe.name}
                            className="w-7 h-7"
                            style={{ imageRendering: 'pixelated' }}
                          />
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-bold text-white truncate">
                            {recipe.name}
                          </div>
                          <div className="text-[10px] text-white/50">
                            x{recipe.result.count}
                          </div>
                        </div>
                      </div>

                      <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between">
                        <div className="text-[10px] text-white/60 truncate">
                          {recipe.ingredients.map((ing) => {
                            const def = ITEM_DEFINITIONS[ing.id];
                            return `${ing.count} ${def ? def.name : ''}`;
                          }).join(' + ')}
                        </div>
                        <button
                          disabled={!canCraft}
                          onClick={() => handleCraftRecipe(recipe)}
                          className={`px-2 py-0.5 rounded text-[11px] font-bold transition ${
                            canCraft
                              ? 'bg-amber-500 hover:bg-amber-400 text-black cursor-pointer shadow'
                              : 'bg-white/10 text-white/30 cursor-not-allowed'
                          }`}
                        >
                          Craft
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Armor Equipment & Defense Station */}
            <div className="bg-[#0d111a] p-3 rounded-xl border border-white/10 space-y-2">
              <div className="flex items-center justify-between text-xs text-white/70">
                <span className="font-semibold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400" />
                  <span>Armor Equipment & Defense</span>
                </span>
                <span className="font-mono text-cyan-200 font-bold text-[11px]">
                  {stats.armorDefense}/20 Defense ({Math.min(80, Math.round(stats.armorDefense * 4))}% Damage Reduction)
                </span>
              </div>

              <div className="grid grid-cols-4 gap-2.5">
                {[
                  { slotIdx: 0, label: 'Helmet', hint: 'Helmet' },
                  { slotIdx: 1, label: 'Chestplate', hint: 'Chestplate' },
                  { slotIdx: 2, label: 'Leggings', hint: 'Leggings' },
                  { slotIdx: 3, label: 'Boots', hint: 'Boots' },
                ].map(({ slotIdx, label, hint }) => {
                  const item = armorSlots[slotIdx];
                  const itemDef = item ? ITEM_DEFINITIONS[item.id] : null;
                  const icon = item ? getItemIcon(item.id) : null;
                  const info = item ? ARMOR_DATA[item.id] : null;

                  return (
                    <button
                      key={slotIdx}
                      id={`armor-slot-${slotIdx}`}
                      onClick={() => handleUnequipArmor(slotIdx)}
                      className={`group relative h-14 rounded-lg border flex flex-col items-center justify-center transition cursor-pointer p-1 ${
                        item
                          ? 'bg-cyan-950/40 border-cyan-400/50 hover:border-red-400/80 shadow-md'
                          : 'bg-white/5 border-white/10 hover:border-white/30'
                      }`}
                      title={item ? `Click to unequip ${itemDef?.name || label}` : `Empty ${label} slot`}
                    >
                      {item && icon ? (
                        <>
                          <img
                            src={icon}
                            alt={itemDef?.name || label}
                            className="w-7 h-7"
                            style={{ imageRendering: 'pixelated' }}
                          />
                          <span className="text-[9px] font-mono text-cyan-300 font-bold leading-none mt-0.5">
                            +{info?.defense || 0} Defense
                          </span>
                        </>
                      ) : (
                        <span className="text-[10px] text-white/30 uppercase font-semibold tracking-wider">
                          {hint}
                        </span>
                      )}

                      {/* Tooltip */}
                      {item && itemDef && (
                        <span className="absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-black/90 text-white text-[10px] rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition pointer-events-none z-50 border border-white/10">
                          {itemDef.name} (+{info?.defense || 0} Defense) &bull; Click to Unequip
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Main Inventory Grid (18 Slots) */}
            <div className="space-y-2">
              <div className="text-xs font-semibold uppercase tracking-wider text-white/70">
                Backpack Storage (18 Slots) &bull; Click armor to equip, items to swap hotbar
              </div>
              <div className="grid grid-cols-6 gap-2 bg-[#0d111a] p-3 rounded-xl border border-white/10">
                {inventorySlots.slice(6, 24).map((slot, i) => {
                  const globalIdx = 6 + i;
                  const itemDef = slot ? ITEM_DEFINITIONS[slot.id] : null;
                  const icon = slot ? getItemIcon(slot.id) : null;

                  return (
                    <button
                      key={globalIdx}
                      id={`inv-slot-${globalIdx}`}
                      onClick={() => handleSlotClick(globalIdx)}
                      className="group relative h-12 rounded-lg bg-white/5 border border-white/10 hover:border-white/40 flex items-center justify-center transition cursor-pointer"
                    >
                      {icon && (
                        <img
                          src={icon}
                          alt={itemDef?.name || ''}
                          className="w-7 h-7"
                          style={{ imageRendering: 'pixelated' }}
                        />
                      )}
                      {slot && slot.count > 1 && (
                        <span className="absolute bottom-1 right-1.5 text-[10px] font-mono font-bold text-white bg-black/70 px-1 rounded">
                          {slot.count}
                        </span>
                      )}
                      {slot && slot.durability !== undefined && slot.maxDurability !== undefined && (
                        <div className="absolute bottom-1 left-1.5 right-1.5 h-[2.5px] bg-black/80 rounded-full overflow-hidden p-[0.5px]">
                          <div
                            className="h-full rounded-full transition-all duration-150"
                            style={{
                              width: `${Math.max(5, Math.round((slot.durability / slot.maxDurability) * 100))}%`,
                              backgroundColor: getDurabilityColor(slot.durability, slot.maxDurability),
                            }}
                          />
                        </div>
                      )}
                      {itemDef && (
                        <span className="absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-black/90 text-white text-[10px] rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition pointer-events-none z-50 border border-white/10">
                          {itemDef.name} {slot?.durability !== undefined ? `(${slot.durability}/${slot.maxDurability})` : ''}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Hotbar Slots (6 Slots) */}
            <div className="space-y-2">
              <div className="text-xs font-semibold uppercase tracking-wider text-white/70">
                Active Hotbar (Keys 1 - 6)
              </div>
              <div className="grid grid-cols-6 gap-2 bg-[#0d111a] p-3 rounded-xl border border-white/10">
                {inventorySlots.slice(0, 6).map((slot, i) => {
                  const itemDef = slot ? ITEM_DEFINITIONS[slot.id] : null;
                  const icon = slot ? getItemIcon(slot.id) : null;
                  const isActive = i === selectedHotbarIndex;

                  return (
                    <button
                      key={i}
                      id={`hotbar-modal-slot-${i}`}
                      onClick={() => handleSelectSlot(i)}
                      className={`group relative h-12 rounded-lg flex items-center justify-center transition cursor-pointer ${
                        isActive
                          ? 'bg-amber-500/20 border-2 border-amber-400 shadow-md'
                          : 'bg-white/5 border border-white/10 hover:border-white/30'
                      }`}
                    >
                      <span className="absolute top-1 left-1.5 text-[10px] font-bold text-white/60">
                        {i + 1}
                      </span>
                      {icon && (
                        <img
                          src={icon}
                          alt={itemDef?.name || ''}
                          className="w-7 h-7"
                          style={{ imageRendering: 'pixelated' }}
                        />
                      )}
                      {slot && slot.count > 1 && (
                        <span className="absolute bottom-1 right-1.5 text-[10px] font-mono font-bold text-white bg-black/70 px-1 rounded">
                          {slot.count}
                        </span>
                      )}
                      {slot && slot.durability !== undefined && slot.maxDurability !== undefined && (
                        <div className="absolute bottom-1 left-1.5 right-1.5 h-[2.5px] bg-black/80 rounded-full overflow-hidden p-[0.5px]">
                          <div
                            className="h-full rounded-full transition-all duration-150"
                            style={{
                              width: `${Math.max(5, Math.round((slot.durability / slot.maxDurability) * 100))}%`,
                              backgroundColor: getDurabilityColor(slot.durability, slot.maxDurability),
                            }}
                          />
                        </div>
                      )}
                      {itemDef && (
                        <span className="absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-black/90 text-white text-[10px] rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition pointer-events-none z-50 border border-white/10">
                          {itemDef.name} {slot?.durability !== undefined ? `(${slot.durability}/${slot.maxDurability})` : ''}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Center Player HUD: Armor, Health, Oxygen & Hotbar */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1.5 pointer-events-none">
        {/* Status Bars Container */}
        <div className="flex flex-col gap-1 w-full max-w-[340px] px-1">
          {/* Top row of status bars: Armor Bar (Defense Rating) */}
          {stats.armorDefense > 0 && (
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-0.5 bg-[#0e121c]/70 backdrop-blur-sm px-2 py-0.5 rounded-md border border-cyan-400/30">
                {Array.from({ length: 10 }).map((_, idx) => {
                  const points = stats.armorDefense;
                  const isFull = (idx + 1) * 2 <= points;
                  const isHalf = idx * 2 + 1 === points;
                  return (
                    <Shield
                      key={idx}
                      className={`w-3.5 h-3.5 ${
                        isFull
                          ? 'text-cyan-400 fill-cyan-400'
                          : isHalf
                          ? 'text-cyan-400 fill-cyan-400/50'
                          : 'text-white/20'
                      }`}
                    />
                  );
                })}
                <span className="text-[10px] font-mono font-bold text-cyan-300 ml-1">
                  {stats.armorDefense}
                </span>
              </div>
            </div>
          )}

          {/* Health & Oxygen Status Bars */}
          <div className="flex items-center justify-between w-full">
            {/* Hearts (Health) */}
            <div className="flex items-center gap-0.5 bg-[#0e121c]/70 backdrop-blur-sm px-2 py-1 rounded-md border border-white/10">
              {Array.from({ length: 10 }).map((_, idx) => {
                const isFilled = idx < fullHearts;
                const isHalf = idx === fullHearts && hasHalfHeart;

                return (
                  <Heart
                    key={idx}
                    className={`w-3.5 h-3.5 ${
                      isFilled
                        ? 'text-red-500 fill-red-500'
                        : isHalf
                        ? 'text-red-400 fill-red-400/50'
                        : 'text-white/20'
                    }`}
                  />
                );
              })}
            </div>

            {/* Bubbles (Oxygen) - Only shown when in water or submerged or recovering */}
            {(stats.isSubmerged || stats.inWater || stats.oxygen < 100) && (
              <div className="flex items-center gap-0.5 bg-[#0e121c]/70 backdrop-blur-sm px-2 py-1 rounded-md border border-cyan-400/30 animate-pulse">
                {Array.from({ length: 10 }).map((_, idx) => {
                  const hasAir = idx < oxygenBubbles;
                  return (
                    <Droplets
                      key={idx}
                      className={`w-3.5 h-3.5 ${
                        hasAir ? 'text-cyan-400 fill-cyan-400' : 'text-white/15'
                      }`}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Hotbar Slots */}
        <div className="flex gap-1.5 bg-[#121622]/80 backdrop-blur-md p-1.5 rounded-xl border border-white/15 shadow-[0_8px_32px_rgba(0,0,0,0.5)] pointer-events-auto">
          {inventorySlots.slice(0, 6).map((slot, i) => {
            const isActive = i === selectedHotbarIndex;
            const itemDef = slot ? ITEM_DEFINITIONS[slot.id] : null;
            const icon = slot ? getItemIcon(slot.id) : null;

            return (
              <button
                key={i}
                id={`hotbar-hud-slot-${i}`}
                onClick={() => handleSelectSlot(i)}
                className={`group relative w-12 h-12 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                  isActive
                    ? 'bg-white/20 border-2 border-white -translate-y-1 shadow-lg'
                    : 'bg-white/5 border border-white/10 hover:bg-white/10'
                }`}
              >
                <span className="absolute top-1 left-1.5 text-[10px] font-bold text-white/70">
                  {i + 1}
                </span>

                {icon && (
                  <img
                    src={icon}
                    alt={itemDef?.name || ''}
                    className="w-7 h-7"
                    style={{ imageRendering: 'pixelated' }}
                  />
                )}

                {slot && slot.count > 1 && (
                  <span className="absolute bottom-1 right-1.5 text-[10px] font-mono font-bold text-white bg-black/70 px-1 rounded">
                    {slot.count}
                  </span>
                )}

                {/* Tool Durability Progress Bar */}
                {slot && slot.durability !== undefined && slot.maxDurability !== undefined && (
                  <div className="absolute bottom-1 left-2 right-2 h-[3px] bg-black/80 rounded-full overflow-hidden p-[0.5px]">
                    <div
                      className="h-full rounded-full transition-all duration-150"
                      style={{
                        width: `${Math.max(5, Math.round((slot.durability / slot.maxDurability) * 100))}%`,
                        backgroundColor: getDurabilityColor(slot.durability, slot.maxDurability),
                      }}
                    />
                  </div>
                )}

                {itemDef && (
                  <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-black/90 text-white text-[11px] rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition pointer-events-none border border-white/10 z-50">
                    {itemDef.name} {slot?.durability !== undefined ? `(${slot.durability}/${slot.maxDurability})` : slot?.count ? `(${slot.count})` : ''}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Audio & Nature Settings Modal */}
      <SoundSettingsModal
        isOpen={showAudioSettings}
        onClose={() => setShowAudioSettings(false)}
      />
    </div>
  );
}
