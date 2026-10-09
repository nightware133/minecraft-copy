import React, { useState, useEffect, useRef } from 'react';
import {
  InventorySystem,
  ItemStack,
  ITEM_DEFINITIONS,
  SMELTING_RECIPES,
  FUEL_VALUES,
  ITEM_TYPES,
} from '../game/inventory';
import { BLOCK_TYPES } from '../game/world';
import { sounds } from '../game/audio';
import { X, Flame, ArrowRight, Sparkles, ChefHat } from 'lucide-react';

interface FurnaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  inventory: InventorySystem | null;
  onInventoryChange: () => void;
  getItemIcon: (id: number) => string | undefined;
}

export const FurnaceModal: React.FC<FurnaceModalProps> = ({
  isOpen,
  onClose,
  inventory,
  onInventoryChange,
  getItemIcon,
}) => {
  // Furnace internal slots
  const [inputSlot, setInputSlot] = useState<ItemStack | null>(null);
  const [fuelSlot, setFuelSlot] = useState<ItemStack | null>(null);
  const [outputSlot, setOutputSlot] = useState<ItemStack | null>(null);

  // Smelting state
  const [cookProgress, setCookProgress] = useState<number>(0); // 0 to 100%
  const [burnRemaining, setBurnRemaining] = useState<number>(0); // seconds remaining
  const [maxBurnDuration, setMaxBurnDuration] = useState<number>(1); // original fuel duration

  const lastCrackleRef = useRef<number>(0);
  const soundTickRef = useRef<number>(0);

  // Close on Escape or E
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Escape' || e.code === 'KeyE') {
        e.preventDefault();
        sounds.playUIClick();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Smelting loop simulation
  useEffect(() => {
    if (!isOpen && burnRemaining <= 0) return;

    let animId: number;
    let lastTime = performance.now();

    const tick = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      // Handle burning fuel and cooking
      setBurnRemaining((prevBurn) => {
        let curBurn = prevBurn;

        // Decrease active burn
        if (curBurn > 0) {
          curBurn = Math.max(0, curBurn - dt);
          // Play crackle periodically
          if (now - lastCrackleRef.current > 1200) {
            lastCrackleRef.current = now;
            sounds.playFurnaceCrackle();
          }
        }

        // Check if we can/need to start burning new fuel
        const hasSmeltableInput =
          inputSlot &&
          SMELTING_RECIPES[inputSlot.id] !== undefined &&
          (!outputSlot ||
            (outputSlot.id === SMELTING_RECIPES[inputSlot.id] && outputSlot.count < 64));

        if (curBurn <= 0 && hasSmeltableInput && fuelSlot && FUEL_VALUES[fuelSlot.id]) {
          const fuelTime = FUEL_VALUES[fuelSlot.id];
          setMaxBurnDuration(fuelTime);
          curBurn = fuelTime;

          // Consume 1 fuel
          setFuelSlot((f) => {
            if (!f) return null;
            if (f.id === ITEM_TYPES.LAVA_BUCKET) {
              return { id: ITEM_TYPES.BUCKET, count: 1 };
            }
            if (f.count > 1) {
              return { ...f, count: f.count - 1 };
            }
            return null;
          });

          sounds.playFurnaceCrackle();
        }

        return curBurn;
      });

      // Handle cooking progress
      setInputSlot((curInput) => {
        const canCook =
          curInput &&
          SMELTING_RECIPES[curInput.id] !== undefined &&
          burnRemaining > 0 &&
          (!outputSlot ||
            (outputSlot.id === SMELTING_RECIPES[curInput.id] && outputSlot.count < 64));

        if (canCook) {
          setCookProgress((prevProgress) => {
            const nextProgress = prevProgress + (dt / 3.5) * 100; // ~3.5 seconds per item
            if (nextProgress >= 100) {
              // Complete item smelt!
              const targetResultId = SMELTING_RECIPES[curInput.id];
              setOutputSlot((prevOut) => {
                if (!prevOut) {
                  return { id: targetResultId, count: 1 };
                }
                if (prevOut.id === targetResultId && prevOut.count < 64) {
                  return { ...prevOut, count: prevOut.count + 1 };
                }
                return prevOut;
              });

              sounds.playCraftSuccess();

              // Consume 1 from input
              if (curInput.count > 1) {
                setInputSlot({ ...curInput, count: curInput.count - 1 });
              } else {
                setInputSlot(null);
              }

              return 0;
            }
            return nextProgress;
          });
        } else {
          // If no active cooking, slowly cool down
          setCookProgress((p) => Math.max(0, p - dt * 25));
        }

        return curInput;
      });

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [isOpen, burnRemaining, inputSlot, fuelSlot, outputSlot]);

  if (!isOpen || !inventory) return null;

  // Insert item from player inventory into furnace
  const handleTransferToFurnace = (slotIndex: number) => {
    const item = inventory.slots[slotIndex];
    if (!item) return;

    sounds.playUIClick();

    const isSmeltable = SMELTING_RECIPES[item.id] !== undefined;
    const isFuel = FUEL_VALUES[item.id] !== undefined;

    if (isSmeltable) {
      if (!inputSlot) {
        setInputSlot({ ...item });
        inventory.slots[slotIndex] = null;
      } else if (inputSlot.id === item.id) {
        const space = 64 - inputSlot.count;
        const transfer = Math.min(space, item.count);
        if (transfer > 0) {
          setInputSlot({ ...inputSlot, count: inputSlot.count + transfer });
          if (item.count - transfer > 0) {
            inventory.slots[slotIndex] = { ...item, count: item.count - transfer };
          } else {
            inventory.slots[slotIndex] = null;
          }
        }
      } else if (isFuel && !fuelSlot) {
        setFuelSlot({ ...item });
        inventory.slots[slotIndex] = null;
      }
    } else if (isFuel) {
      if (!fuelSlot) {
        setFuelSlot({ ...item });
        inventory.slots[slotIndex] = null;
      } else if (fuelSlot.id === item.id) {
        const space = 64 - fuelSlot.count;
        const transfer = Math.min(space, item.count);
        if (transfer > 0) {
          setFuelSlot({ ...fuelSlot, count: fuelSlot.count + transfer });
          if (item.count - transfer > 0) {
            inventory.slots[slotIndex] = { ...item, count: item.count - transfer };
          } else {
            inventory.slots[slotIndex] = null;
          }
        }
      }
    }

    onInventoryChange();
  };

  // Take item out of furnace slot into inventory
  const handleTakeFromFurnace = (
    type: 'input' | 'fuel' | 'output'
  ) => {
    sounds.playUIClick();

    let target: ItemStack | null = null;
    if (type === 'input') target = inputSlot;
    if (type === 'fuel') target = fuelSlot;
    if (type === 'output') target = outputSlot;

    if (!target) return;

    const added = inventory.addItem(target.id, target.count);
    if (added) {
      if (type === 'input') {
        setInputSlot(null);
        setCookProgress(0);
      }
      if (type === 'fuel') setFuelSlot(null);
      if (type === 'output') setOutputSlot(null);
    }

    onInventoryChange();
  };

  // Quick Action: Auto-load all raw meats & fuels and cook
  const handleQuickLoadMeats = () => {
    sounds.playUIClick();
    let loadedMeat = false;
    let loadedFuel = false;

    // Find first raw meat or smeltable in inventory
    inventory.slots.forEach((slot, idx) => {
      if (!slot) return;
      if (!loadedMeat && SMELTING_RECIPES[slot.id] !== undefined && (!inputSlot || inputSlot.id === slot.id)) {
        if (!inputSlot) {
          setInputSlot({ ...slot });
          inventory.slots[idx] = null;
          loadedMeat = true;
        }
      }
      if (!loadedFuel && FUEL_VALUES[slot.id] !== undefined && (!fuelSlot || fuelSlot.id === slot.id)) {
        if (!fuelSlot) {
          setFuelSlot({ ...slot });
          inventory.slots[idx] = null;
          loadedFuel = true;
        }
      }
    });

    onInventoryChange();
  };

  const isLit = burnRemaining > 0;
  const flamePercent = isLit ? Math.min(100, (burnRemaining / maxBurnDuration) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-[#2b2b2b] border-4 border-[#3c3c3c] rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden font-sans text-stone-200">
        
        {/* Stone Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-[#1e1e1e] border-b-2 border-[#151515] shadow-inner">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-[#333] border border-stone-600 flex items-center justify-center shadow-md">
              <ChefHat className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-wide text-white flex items-center gap-2">
                Furnace
                {isLit && (
                  <span className="text-[11px] font-normal px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                    <Flame className="w-3 h-3 text-amber-400 animate-pulse" />
                    Burning ({burnRemaining.toFixed(1)}s)
                  </span>
                )}
              </h2>
              <p className="text-xs text-stone-400">Smelt ores & cook delicious food</p>
            </div>
          </div>

          <button
            onClick={() => {
              sounds.playUIClick();
              onClose();
            }}
            className="w-8 h-8 rounded-lg bg-[#333] hover:bg-[#444] border border-stone-600 flex items-center justify-center text-stone-300 hover:text-white transition cursor-pointer"
            title="Close (Esc / E)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 flex flex-col gap-6">
          
          {/* Main Smelting Station */}
          <div className="bg-[#1f1f1f] rounded-lg p-6 border-2 border-[#161616] flex items-center justify-around shadow-inner relative">
            
            {/* Input & Fuel Column */}
            <div className="flex flex-col items-center gap-4">
              
              {/* Input Slot (Top) */}
              <div className="flex flex-col items-center gap-1">
                <span className="text-[11px] font-bold tracking-wide uppercase text-stone-400">Ingredient</span>
                <div
                  onClick={() => handleTakeFromFurnace('input')}
                  className={`group relative w-16 h-16 rounded-md bg-[#121212] border-2 flex items-center justify-center transition cursor-pointer shadow-inner ${
                    inputSlot
                      ? 'border-amber-500/60 bg-amber-950/20'
                      : 'border-stone-700 hover:border-stone-500'
                  }`}
                  title={inputSlot ? `Click to take ${ITEM_DEFINITIONS[inputSlot.id]?.name}` : 'Click inventory item to place ingredients'}
                >
                  {inputSlot ? (
                    <>
                      <img
                        src={getItemIcon(inputSlot.id)}
                        alt={ITEM_DEFINITIONS[inputSlot.id]?.name}
                        className="w-9 h-9"
                        style={{ imageRendering: 'pixelated' }}
                      />
                      <span className="absolute bottom-1 right-1.5 text-xs font-mono font-bold text-white bg-black/80 px-1 rounded">
                        {inputSlot.count}
                      </span>
                    </>
                  ) : (
                    <span className="text-[10px] text-stone-500 text-center px-1 font-mono">
                      Raw Food / Ore
                    </span>
                  )}
                </div>
              </div>

              {/* Fire Flame Indicator */}
              <div className="relative w-8 h-8 flex items-center justify-center">
                <Flame
                  className={`w-7 h-7 transition-all duration-300 ${
                    isLit
                      ? 'text-amber-500 fill-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.8)] scale-110'
                      : 'text-stone-700 fill-stone-900/60 opacity-40'
                  }`}
                />
                {isLit && (
                  <div
                    className="absolute inset-x-0 bottom-0 overflow-hidden"
                    style={{ height: `${flamePercent}%` }}
                  >
                    <Flame className="w-7 h-7 text-yellow-300 fill-yellow-300 animate-pulse" />
                  </div>
                )}
              </div>

              {/* Fuel Slot (Bottom) */}
              <div className="flex flex-col items-center gap-1">
                <div
                  onClick={() => handleTakeFromFurnace('fuel')}
                  className={`group relative w-16 h-16 rounded-md bg-[#121212] border-2 flex items-center justify-center transition cursor-pointer shadow-inner ${
                    fuelSlot
                      ? 'border-orange-500/60 bg-orange-950/20'
                      : 'border-stone-700 hover:border-stone-500'
                  }`}
                  title={fuelSlot ? `Click to take ${ITEM_DEFINITIONS[fuelSlot.id]?.name}` : 'Click inventory item to place Coal/Wood'}
                >
                  {fuelSlot ? (
                    <>
                      <img
                        src={getItemIcon(fuelSlot.id)}
                        alt={ITEM_DEFINITIONS[fuelSlot.id]?.name}
                        className="w-9 h-9"
                        style={{ imageRendering: 'pixelated' }}
                      />
                      <span className="absolute bottom-1 right-1.5 text-xs font-mono font-bold text-white bg-black/80 px-1 rounded">
                        {fuelSlot.count}
                      </span>
                    </>
                  ) : (
                    <span className="text-[10px] text-stone-500 text-center px-1 font-mono">
                      Coal / Wood
                    </span>
                  )}
                </div>
                <span className="text-[11px] font-bold tracking-wide uppercase text-stone-400">Fuel</span>
              </div>
            </div>

            {/* Smelting Arrow Progress */}
            <div className="flex flex-col items-center gap-2 px-6">
              <div className="relative w-24 h-6 bg-[#121212] border border-stone-700 rounded overflow-hidden shadow-inner flex items-center">
                <div
                  className="h-full bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-400 transition-all duration-150"
                  style={{ width: `${cookProgress}%` }}
                />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <ArrowRight
                    className={`w-4 h-4 ${
                      cookProgress > 0 ? 'text-black drop-shadow' : 'text-stone-600'
                    }`}
                  />
                </div>
              </div>
              <span className="text-[11px] font-mono font-semibold text-stone-400">
                {cookProgress > 0 ? `${Math.round(cookProgress)}%` : isLit ? 'Cooking...' : 'Idle'}
              </span>
            </div>

            {/* Output Slot (Right) */}
            <div className="flex flex-col items-center gap-1">
              <span className="text-[11px] font-bold tracking-wide uppercase text-amber-400">Cooked Result</span>
              <div
                onClick={() => handleTakeFromFurnace('output')}
                className={`group relative w-20 h-20 rounded-lg bg-[#121212] border-2 flex items-center justify-center transition cursor-pointer shadow-inner ${
                  outputSlot
                    ? 'border-yellow-400 bg-yellow-950/30 shadow-[0_0_15px_rgba(234,179,8,0.3)] animate-pulse'
                    : 'border-stone-700'
                }`}
                title={outputSlot ? `Click to take ${outputSlot.count}x ${ITEM_DEFINITIONS[outputSlot.id]?.name}!` : 'Cooked items will appear here'}
              >
                {outputSlot ? (
                  <>
                    <img
                      src={getItemIcon(outputSlot.id)}
                      alt={ITEM_DEFINITIONS[outputSlot.id]?.name}
                      className="w-12 h-12"
                      style={{ imageRendering: 'pixelated' }}
                    />
                    <span className="absolute bottom-1.5 right-2 text-sm font-mono font-bold text-yellow-300 bg-black/85 px-1.5 py-0.5 rounded shadow">
                      {outputSlot.count}
                    </span>
                  </>
                ) : (
                  <Sparkles className="w-6 h-6 text-stone-700" />
                )}
              </div>
            </div>
          </div>

          {/* Quick Action Button & Cooking Guides */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-[#242424] p-3 rounded-lg border border-stone-700">
            <div className="flex items-center gap-2">
              <button
                onClick={handleQuickLoadMeats}
                className="px-3 py-1.5 rounded bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow"
              >
                <ChefHat className="w-3.5 h-3.5" />
                Auto-Load Raw Meats & Fuel
              </button>
            </div>
            <div className="text-[11px] text-stone-400 flex items-center gap-3">
              <span>🥩 Beef ➔ Steak (+8)</span>
              <span>🥓 Pork ➔ Porkchop (+8)</span>
              <span>🍗 Chicken ➔ Cooked (+6)</span>
            </div>
          </div>

          {/* Player Inventory (Click item to load into furnace) */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold tracking-wide uppercase text-stone-300">
                Your Inventory (Click to load into Furnace)
              </span>
              <span className="text-[11px] text-stone-500">
                Click raw food to cook or coal/wood for fuel
              </span>
            </div>

            <div className="grid grid-cols-9 gap-1.5 bg-[#1a1a1a] p-3 rounded-lg border border-stone-800">
              {inventory.slots.map((slot, idx) => {
                const icon = slot ? getItemIcon(slot.id) : null;
                const def = slot ? ITEM_DEFINITIONS[slot.id] : null;
                const isSmeltable = slot && SMELTING_RECIPES[slot.id] !== undefined;
                const isFuel = slot && FUEL_VALUES[slot.id] !== undefined;

                return (
                  <button
                    key={idx}
                    onClick={() => handleTransferToFurnace(idx)}
                    className={`relative w-12 h-12 rounded bg-[#121212] border flex items-center justify-center transition cursor-pointer group ${
                      isSmeltable
                        ? 'border-amber-500/60 hover:bg-amber-950/30'
                        : isFuel
                        ? 'border-orange-500/60 hover:bg-orange-950/30'
                        : slot
                        ? 'border-stone-700 hover:border-stone-500'
                        : 'border-stone-800/80 hover:border-stone-700'
                    }`}
                    title={def ? `${def.name} ${isSmeltable ? '(Cookable)' : isFuel ? '(Fuel)' : ''}` : ''}
                  >
                    {icon && (
                      <img
                        src={icon}
                        alt={def?.name || ''}
                        className="w-7 h-7"
                        style={{ imageRendering: 'pixelated' }}
                      />
                    )}
                    {slot && slot.count > 1 && (
                      <span className="absolute bottom-0.5 right-1 text-[10px] font-mono font-bold text-white bg-black/80 px-1 rounded">
                        {slot.count}
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
  );
};
