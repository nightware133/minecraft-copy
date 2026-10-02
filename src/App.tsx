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
  TOOL_DURABILITIES,
} from './game/inventory';
import { WeatherType } from './game/weather';
import { GameDifficulty, GameMode, MobType } from './game/mobs';
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
  Swords,
  Skull,
  Feather,
  Zap,
  X,
  Search,
  Trash2,
} from 'lucide-react';
import { sounds } from './game/audio';
import { SoundSettingsModal } from './components/SoundSettingsModal';
import { Minimap } from './components/Minimap';
import { LoadingScreen } from './components/LoadingScreen';

interface CreativeCategory {
  id: string;
  name: string;
  itemIds: number[];
}

const CREATIVE_ITEM_CATEGORIES: CreativeCategory[] = [
  {
    id: 'blocks',
    name: 'Blocks',
    itemIds: [
      BLOCK_TYPES.GRASS,
      BLOCK_TYPES.DIRT,
      BLOCK_TYPES.STONE,
      BLOCK_TYPES.WOOD,
      BLOCK_TYPES.WOOD_PLANKS,
      BLOCK_TYPES.BRICK,
      BLOCK_TYPES.GLASS,
      BLOCK_TYPES.SAND,
      BLOCK_TYPES.RED_SAND,
      BLOCK_TYPES.SNOW,
      BLOCK_TYPES.ICE,
      BLOCK_TYPES.CACTUS,
      BLOCK_TYPES.LEAVES,
      BLOCK_TYPES.CHERRY_LEAVES,
      BLOCK_TYPES.BIRCH_WOOD,
      BLOCK_TYPES.TORCH,
      BLOCK_TYPES.CRAFTING_TABLE,
      BLOCK_TYPES.CORAL_PINK,
      BLOCK_TYPES.CORAL_CYAN,
      BLOCK_TYPES.CORAL_YELLOW,
      BLOCK_TYPES.RED_FLOWER,
      BLOCK_TYPES.YELLOW_FLOWER,
      BLOCK_TYPES.SEAWEED,
    ],
  },
  {
    id: 'ores',
    name: 'Ores & Items',
    itemIds: [
      BLOCK_TYPES.COAL_ORE,
      BLOCK_TYPES.IRON_ORE,
      BLOCK_TYPES.GOLD_ORE,
      BLOCK_TYPES.DIAMOND_ORE,
      ITEM_TYPES.DIAMOND,
      ITEM_TYPES.GOLD_INGOT,
      ITEM_TYPES.IRON_INGOT,
      ITEM_TYPES.COAL,
      ITEM_TYPES.STICK,
      ITEM_TYPES.BREAD,
      ITEM_TYPES.APPLE,
    ],
  },
  {
    id: 'tools',
    name: 'Tools & Weapons',
    itemIds: [
      ITEM_TYPES.DIAMOND_SWORD,
      ITEM_TYPES.DIAMOND_PICKAXE,
      ITEM_TYPES.IRON_SWORD,
      ITEM_TYPES.IRON_PICKAXE,
      ITEM_TYPES.WOOD_SWORD,
      ITEM_TYPES.WOOD_PICKAXE,
      ITEM_TYPES.STONE_PICKAXE,
    ],
  },
  {
    id: 'armor',
    name: 'Armor Sets',
    itemIds: [
      ITEM_TYPES.DIAMOND_HELMET,
      ITEM_TYPES.DIAMOND_CHESTPLATE,
      ITEM_TYPES.DIAMOND_LEGGINGS,
      ITEM_TYPES.DIAMOND_BOOTS,
      ITEM_TYPES.IRON_HELMET,
      ITEM_TYPES.IRON_CHESTPLATE,
      ITEM_TYPES.IRON_LEGGINGS,
      ITEM_TYPES.IRON_BOOTS,
      ITEM_TYPES.GOLD_HELMET,
      ITEM_TYPES.GOLD_CHESTPLATE,
      ITEM_TYPES.GOLD_LEGGINGS,
      ITEM_TYPES.GOLD_BOOTS,
      ITEM_TYPES.LEATHER_HELMET,
      ITEM_TYPES.LEATHER_CHESTPLATE,
      ITEM_TYPES.LEATHER_LEGGINGS,
      ITEM_TYPES.LEATHER_BOOTS,
    ],
  },
];

const ALL_CREATIVE_ITEM_IDS: number[] = [
  ...CREATIVE_ITEM_CATEGORIES[0].itemIds,
  ...CREATIVE_ITEM_CATEGORIES[1].itemIds,
  ...CREATIVE_ITEM_CATEGORIES[2].itemIds,
  ...CREATIVE_ITEM_CATEGORIES[3].itemIds,
];

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

function safeRequestPointerLock(element?: HTMLElement | null) {
  if (!element) return;
  try {
    const p = element.requestPointerLock() as any;
    if (p && typeof p.catch === 'function') {
      p.catch(() => {
        // Silently catch pointer lock rejection (e.g. gesture requirement)
      });
    }
  } catch {
    // Silently catch synchronous errors
  }
}

export default function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<VoxelGameEngine | null>(null);

  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);
  const [inTitleScreen, setInTitleScreen] = useState<boolean>(false);
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
    gameMode: 'survival',
    difficulty: 'normal',
    isFlying: false,
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

  const [creativeCategory, setCreativeCategory] = useState<string>('all');
  const [creativeSearchQuery, setCreativeSearchQuery] = useState<string>('');

  const [gridSlots, setGridSlots] = useState<(ItemStack | null)[]>([null, null, null, null]);

  // Synchronized refs to eliminate stale closures in keyboard events
  const showInventoryRef = useRef<boolean>(false);
  showInventoryRef.current = showInventory;

  const showHelpRef = useRef<boolean>(false);
  showHelpRef.current = showHelp;

  const showAudioSettingsRef = useRef<boolean>(false);
  showAudioSettingsRef.current = showAudioSettings;

  const isInitialLoadingRef = useRef<boolean>(true);
  isInitialLoadingRef.current = isInitialLoading;

  const inTitleScreenRef = useRef<boolean>(false);
  inTitleScreenRef.current = inTitleScreen;

  const isPausedRef = useRef<boolean>(false);
  isPausedRef.current = isPaused;

  const closeInventory = () => {
    setShowInventory(false);
    sounds.playInventoryToggle(false);
    if (!inTitleScreenRef.current && !isPausedRef.current) {
      safeRequestPointerLock(engineRef.current?.container.querySelector('canvas'));
    }
  };

  const openInventory = () => {
    if (document.pointerLockElement) {
      document.exitPointerLock();
    }
    sounds.playInventoryToggle(true);
    setShowInventory(true);
  };

  // Sync audio settings
  useEffect(() => {
    return sounds.subscribe((s) => setAudioSettings(s));
  }, []);

  // Sync pause state to game engine
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.setPaused(isPaused);
    }
  }, [isPaused]);

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
      if (isInitialLoadingRef.current) return;

      if (e.code === 'F5') {
        e.preventDefault();
        sounds.playUIClick();
        engine.togglePerspective();
        return;
      }

      if (e.code === 'KeyE') {
        e.preventDefault();
        if (showInventoryRef.current) {
          closeInventory();
        } else if (!inTitleScreenRef.current && !isPausedRef.current) {
          openInventory();
        }
        return;
      }

      if (e.code === 'KeyH') {
        setShowHelp((prev) => {
          sounds.playUIClick();
          return !prev;
        });
        return;
      }

      if (e.code === 'Escape') {
        if (showInventoryRef.current) {
          e.preventDefault();
          e.stopPropagation();
          closeInventory();
          return;
        }
        if (showAudioSettingsRef.current) {
          e.preventDefault();
          setShowAudioSettings(false);
          sounds.playUIClick();
          return;
        }
        if (showHelpRef.current) {
          e.preventDefault();
          setShowHelp(false);
          sounds.playUIClick();
          return;
        }
        if (!inTitleScreenRef.current) {
          e.preventDefault();
          sounds.playUIClick();
          setIsPaused((prev) => {
            const next = !prev;
            if (!next) {
              safeRequestPointerLock(engine.container.querySelector('canvas'));
            }
            return next;
          });
          return;
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
  }, []);

  const handleInitialLoadingComplete = () => {
    setIsInitialLoading(false);
    setInTitleScreen(true);
  };

  const startGame = () => {
    sounds.playUIClick();
    sounds.initContext();
    setInTitleScreen(false);
    setIsPaused(false);
    if (engineRef.current) {
      engineRef.current.setPanoramaMode(false);
      safeRequestPointerLock(engineRef.current?.container.querySelector('canvas'));
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

  const handleTogglePause = () => {
    sounds.playUIClick();
    if (!isPaused) {
      if (document.pointerLockElement) document.exitPointerLock();
      setIsPaused(true);
    } else {
      setIsPaused(false);
      safeRequestPointerLock(engineRef.current?.container.querySelector('canvas'));
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
      case BLOCK_TYPES.SNOW: return atlas.snow;
      case BLOCK_TYPES.ICE: return atlas.ice;
      case BLOCK_TYPES.CACTUS: return atlas.cactus;
      case BLOCK_TYPES.CHERRY_LEAVES: return atlas.cherryLeaves;
      case BLOCK_TYPES.RED_SAND: return atlas.redSand;
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

  const handleCycleGameMode = () => {
    if (!engineRef.current) return;
    sounds.playUIClick();
    const nextMode: GameMode = stats.gameMode === 'creative' ? 'survival' : 'creative';
    engineRef.current.setGameMode(nextMode);
    setCraftingFeedback(
      nextMode === 'creative'
        ? 'Creative Mode Activated: Flight (F), Instant Mining & Immortality'
        : 'Survival Mode Activated'
    );
    setTimeout(() => setCraftingFeedback(null), 2500);
  };

  const handleCycleDifficulty = () => {
    if (!engineRef.current) return;
    sounds.playUIClick();
    const cycle: GameDifficulty[] = ['peaceful', 'easy', 'normal', 'hard'];
    const curIdx = cycle.indexOf(stats.difficulty);
    const nextDiff = cycle[(curIdx + 1) % cycle.length];
    engineRef.current.setDifficulty(nextDiff);
    setCraftingFeedback(
      `Difficulty: ${nextDiff.toUpperCase()}${nextDiff === 'peaceful' ? ' (No Hostile Mobs)' : ''}`
    );
    setTimeout(() => setCraftingFeedback(null), 2500);
  };

  const handleToggleFlight = () => {
    if (!engineRef.current) return;
    sounds.playUIClick();
    engineRef.current.toggleFlight();
  };

  const handleSpawnMob = (type: MobType) => {
    if (!engineRef.current) return;
    sounds.playUIClick();
    const mob = engineRef.current.spawnMob(type);
    if (mob) {
      setCraftingFeedback(type === 'sheep' ? 'Spawned Passive Sheep 🐑' : 'Spawned Zombie 🧟');
    } else {
      setCraftingFeedback('Hostile mobs cannot spawn in Peaceful mode!');
    }
    setTimeout(() => setCraftingFeedback(null), 2000);
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
    if (stats.gameMode === 'creative') {
      // In Creative mode: obtain whatever you want without requirements!
      engineRef.current.inventory.giveItemDirect(recipe.result.id, recipe.result.count);
      sounds.playCraftSuccess();
      refreshInventory();
      setCraftingFeedback(`Crafted ${recipe.name} (Free in Creative)! ✨`);
      setTimeout(() => setCraftingFeedback(null), 2000);
      return;
    }

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

  const handleGetCreativeItem = (id: number, count?: number) => {
    if (!engineRef.current) return;
    const def = ITEM_DEFINITIONS[id];
    const maxStack = def?.maxStack || 64;
    const giveCount = count ?? (maxStack > 1 ? 64 : 1);
    engineRef.current.inventory.giveItemDirect(id, giveCount);
    sounds.playItemPickup();
    refreshInventory();
    setCraftingFeedback(`Received ${giveCount > 1 ? `${giveCount}x ` : ''}${def?.name || 'Item'}!`);
    setTimeout(() => setCraftingFeedback(null), 1800);
  };

  const handleEquipFullDiamondKit = () => {
    if (!engineRef.current) return;
    sounds.playArmorEquip('diamond');
    const inv = engineRef.current.inventory;
    inv.armorSlots[0] = { id: ITEM_TYPES.DIAMOND_HELMET, count: 1, durability: 363, maxDurability: 363 };
    inv.armorSlots[1] = { id: ITEM_TYPES.DIAMOND_CHESTPLATE, count: 1, durability: 528, maxDurability: 528 };
    inv.armorSlots[2] = { id: ITEM_TYPES.DIAMOND_LEGGINGS, count: 1, durability: 495, maxDurability: 495 };
    inv.armorSlots[3] = { id: ITEM_TYPES.DIAMOND_BOOTS, count: 1, durability: 429, maxDurability: 429 };
    inv.slots[0] = { id: ITEM_TYPES.DIAMOND_SWORD, count: 1, durability: 1562, maxDurability: 1562 };
    inv.slots[1] = { id: ITEM_TYPES.DIAMOND_PICKAXE, count: 1, durability: 1562, maxDurability: 1562 };
    engineRef.current.updateArmorVisuals();
    refreshInventory();
    setCraftingFeedback('Equipped Full Diamond Armor & Tools! 💎');
    setTimeout(() => setCraftingFeedback(null), 2500);
  };

  const handleGiveBuilderPack = () => {
    if (!engineRef.current) return;
    sounds.playCraftSuccess();
    const inv = engineRef.current.inventory;
    inv.giveItemDirect(BLOCK_TYPES.WOOD, 64);
    inv.giveItemDirect(BLOCK_TYPES.WOOD_PLANKS, 64);
    inv.giveItemDirect(BLOCK_TYPES.BRICK, 64);
    inv.giveItemDirect(BLOCK_TYPES.STONE, 64);
    inv.giveItemDirect(BLOCK_TYPES.GLASS, 64);
    inv.giveItemDirect(BLOCK_TYPES.TORCH, 64);
    refreshInventory();
    setCraftingFeedback("Added Builder's Material Pack (Wood, Planks, Bricks, Stone, Glass, Torches)!");
    setTimeout(() => setCraftingFeedback(null), 2500);
  };

  const handleClearBackpack = () => {
    if (!engineRef.current) return;
    sounds.playUIClick();
    engineRef.current.inventory.clearBackpack();
    refreshInventory();
    setCraftingFeedback('Cleared extra backpack storage!');
    setTimeout(() => setCraftingFeedback(null), 2000);
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
      {!isInitialLoading && !inTitleScreen && stats.isSubmerged && (
        <div className="pointer-events-none fixed inset-0 z-10 bg-cyan-900/30 mix-blend-multiply backdrop-blur-[0.5px]">
          <div className="absolute inset-0 shadow-[inset_0_0_120px_rgba(6,78,119,0.85)]" />
        </div>
      )}

      {/* Drowning Damage Flash */}
      {!isInitialLoading && !inTitleScreen && stats.isSubmerged && stats.oxygen <= 0 && (
        <div className="pointer-events-none fixed inset-0 z-15 bg-red-600/25 animate-pulse" />
      )}

      {/* Centered Crosshair with Progressive Breaking Arc (only in 1st person gameplay) */}
      {!isInitialLoading && !inTitleScreen && stats.perspectiveMode === 0 && (
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
      {!isInitialLoading && !inTitleScreen && (
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

      {/* Top Right Controls (aligned with Minimap) */}
      {!isInitialLoading && !inTitleScreen && (
        <div className="absolute top-3 right-[160px] z-20 flex items-center gap-1.5 flex-wrap justify-end max-w-[calc(100vw-170px)]">
          {!stats.isLocked && !showInventory && !isPaused && (
            <div className="bg-[#0e121c]/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-xs text-white/80 pointer-events-none flex items-center gap-1.5 animate-pulse">
              <Eye className="w-3.5 h-3.5 text-emerald-400" />
              <span>Click to lock cursor (ESC to pause)</span>
            </div>
          )}

          {/* Game Mode & Difficulty Controls */}
          <button
            id="btn-hud-gamemode"
            onClick={handleCycleGameMode}
            className={`backdrop-blur-md px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition shadow flex items-center gap-1.5 cursor-pointer capitalize ${
              stats.gameMode === 'creative'
                ? 'bg-amber-500/25 border-amber-400 text-amber-300 hover:bg-amber-500/35'
                : 'bg-[#0e121c]/80 hover:bg-[#1a2236]/90 border-white/10 text-white/90'
            }`}
            title="Switch Game Mode (Survival or Creative with flight and infinite blocks)"
          >
            {stats.gameMode === 'creative' ? (
              <Feather className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <Swords className="w-3.5 h-3.5 text-emerald-400" />
            )}
            <span>{stats.gameMode}</span>
          </button>

          {stats.gameMode === 'creative' && (
            <button
              id="btn-hud-flight"
              onClick={handleToggleFlight}
              className={`backdrop-blur-md px-2 py-1.5 rounded-lg border text-xs font-mono transition shadow flex items-center gap-1 cursor-pointer ${
                stats.isFlying
                  ? 'bg-cyan-500/30 border-cyan-400 text-cyan-200'
                  : 'bg-[#0e121c]/80 hover:bg-[#1a2236]/90 border-white/10 text-white/70'
              }`}
              title="Toggle Flying (Key: F, Space=Up, Shift=Down)"
            >
              <Zap className={`w-3.5 h-3.5 ${stats.isFlying ? 'text-cyan-300 animate-pulse' : 'text-white/50'}`} />
              <span>{stats.isFlying ? 'Flying [F]' : 'Fly [F]'}</span>
            </button>
          )}

          <button
            id="btn-hud-difficulty"
            onClick={handleCycleDifficulty}
            className="bg-[#0e121c]/80 hover:bg-[#1a2236]/90 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-white/10 text-xs text-white/90 hover:text-white transition shadow flex items-center gap-1.5 cursor-pointer capitalize"
            title="Cycle Difficulty (Peaceful, Easy, Normal, Hard)"
          >
            {stats.difficulty === 'peaceful' && <Shield className="w-3.5 h-3.5 text-emerald-400" />}
            {stats.difficulty === 'easy' && <Shield className="w-3.5 h-3.5 text-blue-400" />}
            {stats.difficulty === 'normal' && <Swords className="w-3.5 h-3.5 text-amber-400" />}
            {stats.difficulty === 'hard' && <Skull className="w-3.5 h-3.5 text-red-400" />}
            <span>{stats.difficulty}</span>
          </button>

          {/* Quick Mob Spawn Controls */}
          <div className="flex items-center gap-1 bg-[#0e121c]/80 backdrop-blur-md p-1 rounded-lg border border-white/10">
            <button
              id="btn-spawn-sheep"
              onClick={() => handleSpawnMob('sheep')}
              className="px-2 py-1 hover:bg-white/15 rounded text-xs text-white/90 hover:text-white transition cursor-pointer flex items-center gap-1"
              title="Spawn Passive Sheep Mob"
            >
              <span>🐑</span>
              <span className="hidden lg:inline text-[11px]">Sheep</span>
            </button>
            <button
              id="btn-spawn-zombie"
              onClick={() => handleSpawnMob('zombie')}
              className="px-2 py-1 hover:bg-white/15 rounded text-xs text-white/90 hover:text-white transition cursor-pointer flex items-center gap-1"
              title="Spawn Hostile Zombie Mob (disabled in Peaceful)"
            >
              <span>🧟</span>
              <span className="hidden lg:inline text-[11px]">Zombie</span>
            </button>
          </div>

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
            onClick={handleTogglePause}
            className={`backdrop-blur-md p-2 rounded-lg border transition-all duration-200 shadow cursor-pointer flex items-center justify-center ${
              isPaused
                ? 'bg-amber-600 hover:bg-amber-500 border-amber-400 text-white shadow-[0_0_15px_rgba(245,158,11,0.5)] scale-105'
                : 'bg-[#0e121c]/80 hover:bg-[#1a2236]/90 border-white/10 text-white/80 hover:text-white hover:border-amber-400/50 hover:shadow-[0_0_10px_rgba(245,158,11,0.25)]'
            }`}
            title={isPaused ? 'Resume Game (Key: ESC)' : 'Pause Game (Key: ESC)'}
          >
            {isPaused ? (
              <Play className="w-4 h-4 text-white fill-white" />
            ) : (
              <Pause className="w-4 h-4 text-white/80" />
            )}
          </button>
        </div>
      )}

      {/* Real-time Circular Minimap in Top-Right Corner */}
      {!isInitialLoading && !inTitleScreen && (
        <Minimap engine={engineRef.current} />
      )}

      {/* Loading Screen Before Main Menu */}
      {isInitialLoading && (
        <LoadingScreen onLoaded={handleInitialLoadingComplete} minDuration={1600} />
      )}

      {/* Minecraft Title Screen Overlay (Pops up once loading completes) */}
      {!isInitialLoading && inTitleScreen && (
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

              {/* Title Screen Mode & Difficulty Selectors */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  id="btn-title-gamemode"
                  onClick={handleCycleGameMode}
                  className="py-2.5 px-2 bg-[#4a4a4a] hover:bg-[#666666] active:bg-[#333333] border-t-2 border-l-2 border-t-[#858585] border-l-[#858585] border-b-2 border-r-2 border-b-[#1e1e1e] border-r-[#1e1e1e] text-white font-bold text-xs tracking-wider uppercase drop-shadow-[2px_2px_0px_rgba(0,0,0,0.8)] flex items-center justify-center gap-1.5 cursor-pointer transition-colors capitalize"
                  title="Switch between Survival and Creative modes"
                >
                  {stats.gameMode === 'creative' ? (
                    <Feather className="w-4 h-4 text-amber-300" />
                  ) : (
                    <Swords className="w-4 h-4 text-emerald-300" />
                  )}
                  <span>Mode: {stats.gameMode}</span>
                </button>

                <button
                  id="btn-title-difficulty"
                  onClick={handleCycleDifficulty}
                  className="py-2.5 px-2 bg-[#4a4a4a] hover:bg-[#666666] active:bg-[#333333] border-t-2 border-l-2 border-t-[#858585] border-l-[#858585] border-b-2 border-r-2 border-b-[#1e1e1e] border-r-[#1e1e1e] text-white font-bold text-xs tracking-wider uppercase drop-shadow-[2px_2px_0px_rgba(0,0,0,0.8)] flex items-center justify-center gap-1.5 cursor-pointer transition-colors capitalize"
                  title="Cycle Difficulty: Peaceful, Easy, Normal, Hard"
                >
                  {stats.difficulty === 'peaceful' && <Shield className="w-4 h-4 text-emerald-300" />}
                  {stats.difficulty === 'easy' && <Shield className="w-4 h-4 text-blue-300" />}
                  {stats.difficulty === 'normal' && <Swords className="w-4 h-4 text-amber-300" />}
                  {stats.difficulty === 'hard' && <Skull className="w-4 h-4 text-red-400" />}
                  <span>Diff: {stats.difficulty}</span>
                </button>
              </div>

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
        <div
          id="pause-menu-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              sounds.playUIClick();
              setIsPaused(false);
              safeRequestPointerLock(engineRef.current?.container.querySelector('canvas'));
            }
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 font-mono select-none"
        >
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
                  safeRequestPointerLock(engineRef.current?.container.querySelector('canvas'));
                }}
                className="w-full py-2.5 px-4 bg-[#4a4a4a] hover:bg-[#666666] active:bg-[#333333] border-t-2 border-l-2 border-t-[#858585] border-l-[#858585] border-b-2 border-r-2 border-b-[#1e1e1e] border-r-[#1e1e1e] text-white font-bold text-sm tracking-wider uppercase drop-shadow-[2px_2px_0px_rgba(0,0,0,0.8)] flex items-center justify-center gap-2 cursor-pointer"
              >
                <Play className="w-4 h-4 text-emerald-400 fill-emerald-400" />
                <span>Back to Game</span>
              </button>

              {/* Game Mode & Difficulty in Pause Menu */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  id="btn-pause-gamemode"
                  onClick={handleCycleGameMode}
                  className="py-2.5 px-3 bg-[#4a4a4a] hover:bg-[#666666] active:bg-[#333333] border-t-2 border-l-2 border-t-[#858585] border-l-[#858585] border-b-2 border-r-2 border-b-[#1e1e1e] border-r-[#1e1e1e] text-white font-bold text-xs tracking-wider uppercase drop-shadow-[2px_2px_0px_rgba(0,0,0,0.8)] flex items-center justify-center gap-1.5 cursor-pointer capitalize"
                >
                  {stats.gameMode === 'creative' ? (
                    <Feather className="w-3.5 h-3.5 text-amber-300" />
                  ) : (
                    <Swords className="w-3.5 h-3.5 text-emerald-300" />
                  )}
                  <span>Mode: {stats.gameMode}</span>
                </button>

                <button
                  id="btn-pause-difficulty"
                  onClick={handleCycleDifficulty}
                  className="py-2.5 px-3 bg-[#4a4a4a] hover:bg-[#666666] active:bg-[#333333] border-t-2 border-l-2 border-t-[#858585] border-l-[#858585] border-b-2 border-r-2 border-b-[#1e1e1e] border-r-[#1e1e1e] text-white font-bold text-xs tracking-wider uppercase drop-shadow-[2px_2px_0px_rgba(0,0,0,0.8)] flex items-center justify-center gap-1.5 cursor-pointer capitalize"
                >
                  {stats.difficulty === 'peaceful' && <Shield className="w-3.5 h-3.5 text-emerald-300" />}
                  {stats.difficulty === 'easy' && <Shield className="w-3.5 h-3.5 text-blue-300" />}
                  {stats.difficulty === 'normal' && <Swords className="w-3.5 h-3.5 text-amber-300" />}
                  {stats.difficulty === 'hard' && <Skull className="w-3.5 h-3.5 text-red-400" />}
                  <span>Diff: {stats.difficulty}</span>
                </button>
              </div>

              {/* Mob Spawner row */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  id="btn-pause-spawn-sheep"
                  onClick={() => handleSpawnMob('sheep')}
                  className="py-2 px-3 bg-[#334233] hover:bg-[#435743] active:bg-[#253225] border-t border-l border-[#628162] border-b-2 border-r-2 border-[#182318] text-white font-bold text-xs tracking-wider uppercase flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                >
                  <span>🐑</span>
                  <span>Spawn Sheep</span>
                </button>

                <button
                  id="btn-pause-spawn-zombie"
                  onClick={() => handleSpawnMob('zombie')}
                  className="py-2 px-3 bg-[#443333] hover:bg-[#574343] active:bg-[#322525] border-t border-l border-[#816262] border-b-2 border-r-2 border-[#231818] text-white font-bold text-xs tracking-wider uppercase flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                >
                  <span>🧟</span>
                  <span>Spawn Zombie</span>
                </button>
              </div>

              {stats.gameMode === 'creative' && (
                <button
                  id="btn-pause-flight"
                  onClick={handleToggleFlight}
                  className="w-full py-2 px-3 bg-[#2d3a4a] hover:bg-[#3d4d62] border-t border-l border-[#597495] border-b-2 border-r-2 border-[#171f28] text-white font-bold text-xs tracking-wider uppercase flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Zap className={`w-3.5 h-3.5 ${stats.isFlying ? 'text-cyan-300 animate-pulse' : 'text-white/50'}`} />
                  <span>Flight: {stats.isFlying ? 'Enabled (Flying)' : 'Disabled (Walking)'} [F]</span>
                </button>
              )}

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
            <div className="flex justify-between"><span className="text-white/60">Space</span><span>Jump / Fly Up</span></div>
            <div className="flex justify-between"><span className="text-white/60">Left Shift</span><span>Sprint / Fly Down</span></div>
            <div className="flex justify-between"><span className="text-white/60">Left Click</span><span>Attack Mob / Mine Block</span></div>
            <div className="flex justify-between"><span className="text-white/60">Right Click</span><span>Place Selected Block</span></div>
            <div className="flex justify-between"><span className="text-white/60">Key F</span><span>Toggle Flight (Creative)</span></div>
            <div className="flex justify-between"><span className="text-white/60">Key F5</span><span>Toggle 3rd Person View</span></div>
            <div className="flex justify-between"><span className="text-white/60">Key E</span><span>Inventory / Crafting</span></div>
            <div className="flex justify-between"><span className="text-white/60">Keys 1 - 6</span><span>Hotbar Slots</span></div>
            <div className="flex justify-between"><span className="text-white/60">Scroll Wheel</span><span>Cycle Hotbar</span></div>
            <div className="flex justify-between"><span className="text-white/60">ESC</span><span>Pause / Unlock Pointer</span></div>
          </div>
          <div className="pt-2 border-t border-white/10 text-[11px] text-white/60 space-y-1">
            <p>🐑 <strong>Passive Mobs:</strong> Sheep graze and wander peacefully. Attack with sword or fist.</p>
            <p>🧟 <strong>Hostile Mobs:</strong> Zombies spawn at night and in darkness, burning in direct sunlight. Attack them to defend yourself!</p>
            <p>🛡️ <strong>Game Modes & Difficulty:</strong> Peaceful mode removes all hostile mobs. Creative mode grants flight [F], instant block destruction, and infinite inventory placement.</p>
          </div>
        </div>
      )}

      {/* Inventory & Crafting Screen Modal */}
      {showInventory && (
        <div
          id="inventory-modal-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeInventory();
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-3 sm:p-5 select-none"
        >
          {/* Top-Right High Visibility Quick Exit Button */}
          <button
            id="btn-inventory-exit-top"
            onClick={closeInventory}
            className="fixed top-4 right-4 z-60 flex items-center gap-2 bg-red-600 hover:bg-red-500 active:bg-red-700 text-white font-bold text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl shadow-[0_4px_25px_rgba(220,38,38,0.7)] border border-red-400/80 cursor-pointer backdrop-blur-md transition-all hover:scale-105"
            title="Close Inventory (ESC or E)"
          >
            <span className="text-sm font-black leading-none">✕</span>
            <span>Close Inventory</span>
            <span className="bg-black/40 px-1.5 py-0.5 rounded text-[10px] font-mono text-red-100">ESC / E</span>
          </button>

          {/* Floating Side Exit Tab */}
          <button
            id="btn-inventory-exit-side"
            onClick={closeInventory}
            className="fixed right-0 top-1/2 -translate-y-1/2 z-60 flex flex-col items-center gap-1.5 bg-red-600/90 hover:bg-red-500 text-white px-2 py-5 rounded-l-xl border-l-2 border-y border-red-400/80 shadow-[0_4px_25px_rgba(220,38,38,0.6)] cursor-pointer transition-all hover:translate-x-[-3px]"
            title="Close Inventory (ESC or E)"
          >
            <span className="text-base font-black leading-none">✕</span>
            <span className="text-[10px] font-mono font-bold tracking-widest [writing-mode:vertical-lr] uppercase">EXIT [E]</span>
          </button>

          <div className="relative w-full max-w-3xl max-h-[88vh] bg-[#141926]/98 border border-white/20 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-fade-in">
            {/* Sticky Modal Header */}
            <div className="sticky top-0 bg-[#141926] z-20 px-5 py-3.5 border-b border-white/10 flex justify-between items-center">
              <div className="flex items-center gap-2.5 flex-wrap">
                <Hammer className="w-5 h-5 text-amber-400" />
                <h2 className="text-base font-bold text-white">
                  {stats.gameMode === 'creative' ? 'Creative Inventory & Unlimited Items' : 'Player Inventory & Crafting'}
                </h2>
                {craftingFeedback && (
                  <span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-mono animate-fade-in">
                    {craftingFeedback}
                  </span>
                )}
              </div>
              <button
                id="btn-inventory-exit-header"
                onClick={closeInventory}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-lg border border-red-400/80 transition cursor-pointer shadow-md"
              >
                <span>✕ Close</span>
                <span className="bg-black/30 px-1.5 py-0.5 rounded text-[10px] font-mono">ESC / E</span>
              </button>
            </div>

            {/* Scrollable Modal Content */}
            <div className="overflow-y-auto px-5 py-4 space-y-5 flex-1 custom-scrollbar">
              {/* Creative Mode Unlimited Items & Quick Kits */}
              {stats.gameMode === 'creative' && (
                <div className="bg-amber-500/10 border border-amber-400/30 rounded-xl p-3.5 space-y-3 shadow-inner">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-400/20 pb-3">
                    <div className="flex items-center gap-2.5">
                      <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
                      <div>
                        <div className="text-xs font-bold text-amber-300">
                          Creative Mode: Unlimited Items Without Requirements
                        </div>
                        <div className="text-[11px] text-amber-200/80">
                          Click any block, tool, armor, or material below to add it directly to your inventory!
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 flex-wrap">
                      <button
                        onClick={handleEquipFullDiamondKit}
                        className="px-2.5 py-1 bg-cyan-600 hover:bg-cyan-500 active:bg-cyan-700 text-white text-[11px] font-bold rounded-lg border border-cyan-400/60 shadow cursor-pointer transition flex items-center gap-1"
                        title="Instantly equip Diamond Helmet, Chestplate, Leggings, Boots and receive Diamond Sword + Pickaxe"
                      >
                        <span>💎 Full Diamond Kit</span>
                      </button>
                      <button
                        onClick={handleGiveBuilderPack}
                        className="px-2.5 py-1 bg-amber-600 hover:bg-amber-500 active:bg-amber-700 text-black text-[11px] font-bold rounded-lg border border-amber-300 shadow cursor-pointer transition flex items-center gap-1"
                        title="Instantly receive 64x of Wood, Planks, Bricks, Stone, Glass, and Torches"
                      >
                        <span>🧱 Builder's Pack</span>
                      </button>
                      <button
                        onClick={handleClearBackpack}
                        className="px-2.5 py-1 bg-white/10 hover:bg-red-600/60 text-white/80 hover:text-white text-[11px] font-medium rounded-lg border border-white/15 cursor-pointer transition flex items-center gap-1"
                        title="Wipe slots 7-24 to clean up inventory"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Clear Backpack</span>
                      </button>
                    </div>
                  </div>

                  {/* Creative Category Filter and Search */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <button
                        onClick={() => setCreativeCategory('all')}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition cursor-pointer ${
                          creativeCategory === 'all'
                            ? 'bg-amber-500 text-black'
                            : 'bg-white/10 text-white/70 hover:text-white hover:bg-white/15'
                        }`}
                      >
                        All Items ({ALL_CREATIVE_ITEM_IDS.length})
                      </button>
                      {CREATIVE_ITEM_CATEGORIES.map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => setCreativeCategory(cat.id)}
                          className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition cursor-pointer ${
                            creativeCategory === cat.id
                              ? 'bg-amber-500 text-black'
                              : 'bg-white/10 text-white/70 hover:text-white hover:bg-white/15'
                          }`}
                        >
                          {cat.name} ({cat.itemIds.length})
                        </button>
                      ))}
                    </div>

                    {/* Search Input */}
                    <div className="relative w-full sm:w-44">
                      <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-white/40" />
                      <input
                        type="text"
                        placeholder="Search items..."
                        value={creativeSearchQuery}
                        onChange={(e) => setCreativeSearchQuery(e.target.value)}
                        className="w-full pl-8 pr-2.5 py-1 bg-black/40 border border-white/15 rounded-md text-xs text-white placeholder-white/40 focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>

                  {/* Creative Item Catalog Grid */}
                  <div className="grid grid-cols-3 sm:grid-cols-6 md:grid-cols-8 gap-2 max-h-56 overflow-y-auto p-1.5 bg-[#0b0f17]/60 rounded-lg border border-white/10 custom-scrollbar">
                    {(creativeCategory === 'all'
                      ? ALL_CREATIVE_ITEM_IDS
                      : CREATIVE_ITEM_CATEGORIES.find((c) => c.id === creativeCategory)?.itemIds || []
                    )
                      .filter((id) => {
                        if (!creativeSearchQuery.trim()) return true;
                        const def = ITEM_DEFINITIONS[id];
                        return def?.name.toLowerCase().includes(creativeSearchQuery.toLowerCase().trim());
                      })
                      .map((id) => {
                        const def = ITEM_DEFINITIONS[id];
                        const icon = getItemIcon(id);
                        const isStackable = !TOOL_DURABILITIES[id] && !ARMOR_DATA[id];

                        return (
                          <button
                            key={id}
                            id={`creative-item-${id}`}
                            onClick={() => handleGetCreativeItem(id)}
                            className="group relative h-14 bg-white/5 hover:bg-amber-500/20 border border-white/10 hover:border-amber-400/80 rounded-lg flex flex-col items-center justify-center transition cursor-pointer p-1"
                            title={`Click to get ${isStackable ? '64x ' : '1x '}${def?.name || 'Item'}`}
                          >
                            {icon && (
                              <img
                                src={icon}
                                alt={def?.name || ''}
                                className="w-7 h-7 transition-transform group-hover:scale-110"
                                style={{ imageRendering: 'pixelated' }}
                              />
                            )}
                            <span className="text-[9px] text-white/60 group-hover:text-amber-300 truncate w-full text-center mt-0.5 leading-tight">
                              {def?.name || ''}
                            </span>
                            <span className="absolute top-0.5 right-1 text-[8px] font-mono font-bold text-amber-300/80 bg-black/60 px-1 rounded">
                              {isStackable ? '+64' : '+1'}
                            </span>
                          </button>
                        );
                      })}
                  </div>
                </div>
              )}

              {/* Quick Crafting Catalog */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-white/70">
                  <span className="font-semibold uppercase tracking-wider text-amber-300">
                    {stats.gameMode === 'creative' ? '✨ Crafting Recipes (Free in Creative)' : 'Crafting Recipes'}
                  </span>
                  <span>
                    {stats.gameMode === 'creative'
                      ? 'In Creative mode, all recipes craft instantly without consuming materials!'
                      : 'Click "Craft" to combine basic materials'}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {CRAFTING_RECIPES.map((recipe) => {
                    const isCreative = stats.gameMode === 'creative';
                    const canCraft = isCreative || engineRef.current?.inventory.hasIngredients(recipe.ingredients);
                    const resultDef = ITEM_DEFINITIONS[recipe.result.id];
                    const resultIcon = getItemIcon(recipe.result.id);

                    return (
                      <div
                        key={recipe.id}
                        className={`p-2.5 rounded-xl border flex flex-col justify-between transition ${
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

                        <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between gap-1">
                          <div className="text-[10px] text-white/60 truncate flex-1">
                            {isCreative
                              ? '✨ Free (Creative)'
                              : recipe.ingredients
                                  .map((ing) => {
                                    const def = ITEM_DEFINITIONS[ing.id];
                                    return `${ing.count} ${def ? def.name : ''}`;
                                  })
                                  .join(' + ')}
                          </div>
                          <button
                            disabled={!canCraft}
                            onClick={() => handleCraftRecipe(recipe)}
                            className={`px-2.5 py-0.5 rounded text-[11px] font-bold transition shrink-0 ${
                              canCraft
                                ? isCreative
                                  ? 'bg-amber-400 hover:bg-amber-300 text-black cursor-pointer shadow'
                                  : 'bg-amber-500 hover:bg-amber-400 text-black cursor-pointer shadow'
                                : 'bg-white/10 text-white/30 cursor-not-allowed'
                            }`}
                          >
                            {isCreative ? 'Craft (Free)' : 'Craft'}
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
                <div className="flex items-center justify-between text-xs text-white/70">
                  <span className="font-semibold uppercase tracking-wider">
                    Backpack Storage (18 Slots) &bull; Click armor to equip, items to swap hotbar
                  </span>
                  {stats.gameMode === 'creative' && (
                    <button
                      onClick={handleClearBackpack}
                      className="text-[10px] text-red-300 hover:text-red-200 cursor-pointer flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Clear Backpack</span>
                    </button>
                  )}
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
        </div>
      )}

      {/* Bottom Center Player HUD: Armor, Health, Oxygen & Hotbar */}
      {!isInitialLoading && !inTitleScreen && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1.5 pointer-events-none">
        {/* Status Bars Container */}
        <div className="flex flex-col gap-1 w-full max-w-[340px] px-1">
          {stats.gameMode === 'creative' ? (
            <div className="flex items-center justify-between w-full bg-[#1a1710]/85 backdrop-blur-md px-3 py-1 rounded-md border border-amber-400/40 text-xs text-amber-300 font-mono shadow-md">
              <span className="flex items-center gap-1.5 font-bold">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Creative Mode</span>
              </span>
              <span className="text-[11px] text-amber-200/90 font-medium">
                {stats.isFlying ? '🕊️ Flying (Space / Shift)' : 'Press [F] to Fly'}
              </span>
            </div>
          ) : (
            <>
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
            </>
          )}
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
      )}

      {/* Audio & Nature Settings Modal */}
      <SoundSettingsModal
        isOpen={showAudioSettings}
        onClose={() => setShowAudioSettings(false)}
      />
    </div>
  );
}
