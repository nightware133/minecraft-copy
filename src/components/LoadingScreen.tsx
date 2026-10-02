import React, { useEffect, useState } from 'react';

interface LoadingScreenProps {
  onLoaded?: () => void;
  minDuration?: number;
  autoFadeOnComplete?: boolean;
}

const TIPS = [
  'Tip: Look out for Cherry Blossom Groves with pink petals on high rolling hills.',
  'Tip: Ice freezes over high lakes in snowy tundra biomes.',
  'Tip: Cacti can be harvested in desert dunes for crafting and defense.',
  'Tip: Press F5 to switch between 1st person and 3rd person perspectives.',
  'Tip: Dig deep beneath level Y:10 to strike sparkling diamond veins.',
  'Tip: Coral reefs and seaweed thrive in warm coastal ocean shallows.',
  'Tip: Watch the real-time circular minimap in the top-right corner to navigate.',
  'Tip: Press E to open your 2x2 crafting grid & survival inventory.',
  'Tip: Press F in Creative mode to fly and glide above the clouds.',
];

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  onLoaded,
  minDuration = 1600,
  autoFadeOnComplete = true,
}) => {
  const [progress, setProgress] = useState<number>(10);
  const [stageText, setStageText] = useState<string>('Initializing WebGL voxel engine...');
  const [tipIndex, setTipIndex] = useState<number>(0);
  const [isFadingOut, setIsFadingOut] = useState<boolean>(false);

  const finish = () => {
    if (isFadingOut) return;
    setIsFadingOut(true);
    setTimeout(() => {
      if (onLoaded) onLoaded();
    }, 450);
  };

  useEffect(() => {
    setTipIndex(Math.floor(Math.random() * TIPS.length));

    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.floor((elapsed / minDuration) * 100));
      setProgress(pct);

      if (pct < 25) {
        setStageText('Initializing WebGL renderer & camera...');
      } else if (pct < 50) {
        setStageText('Compiling procedural block textures & shaders...');
      } else if (pct < 75) {
        setStageText('Generating biomes (Snow, Cherry, Desert, Reefs)...');
      } else if (pct < 95) {
        setStageText('Synthesizing sound effects & panorama...');
      } else {
        setStageText('Loading Complete!');
        clearInterval(interval);
        if (autoFadeOnComplete) {
          setTimeout(() => {
            finish();
          }, 250);
        }
      }
    }, 40);

    return () => clearInterval(interval);
  }, [minDuration, autoFadeOnComplete]);

  return (
    <div
      id="game-loading-screen"
      onClick={finish}
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center select-none transition-opacity duration-500 cursor-pointer ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      style={{
        backgroundColor: '#14171f',
        backgroundImage: `radial-gradient(circle at center, rgba(30,35,48,0.9) 0%, rgba(10,12,18,0.99) 100%), 
          repeating-linear-gradient(45deg, rgba(255,255,255,0.015) 0px, rgba(255,255,255,0.015) 2px, transparent 2px, transparent 8px)`,
      }}
      title="Click anywhere to skip loading"
    >
      {/* Center Voxel World Logo */}
      <div className="flex flex-col items-center mb-8 animate-[pulse_3s_ease-in-out_infinite]">
        <div className="relative mb-3 flex items-center justify-center">
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-emerald-500 via-green-600 to-amber-700 shadow-[0_0_35px_rgba(46,204,113,0.35)] border-2 border-white/20 flex items-center justify-center transform rotate-3">
            <span className="text-2xl font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] font-mono">
              ⛏
            </span>
          </div>
        </div>

        <h1 className="text-3xl sm:text-4xl font-black tracking-widest text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.9)] uppercase font-mono">
          Voxel Sandbox
        </h1>
        <p className="text-xs font-mono text-emerald-400 mt-1 uppercase tracking-widest">
          Procedural Multi-Biome Edition
        </p>
      </div>

      {/* Progress Bar Container */}
      <div className="w-80 sm:w-96 max-w-[90vw] flex flex-col gap-2">
        <div className="flex justify-between items-center text-xs font-mono text-white/80 px-1">
          <span className="truncate">{stageText}</span>
          <span className="text-emerald-400 font-bold ml-2">{progress}%</span>
        </div>

        {/* Outer bar */}
        <div className="w-full h-5 bg-stone-900/90 rounded-sm p-0.5 border-2 border-stone-600 shadow-inner overflow-hidden">
          {/* Inner fill with animated stripes */}
          <div
            className="h-full bg-gradient-to-r from-emerald-600 via-green-500 to-emerald-400 rounded-[1px] transition-all duration-100 relative overflow-hidden shadow-[0_0_12px_rgba(46,204,113,0.5)]"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.2)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0.2)_75%,transparent_75%,transparent)] bg-[length:16px_16px] animate-[move-bg_1s_linear_infinite]" />
          </div>
        </div>

        <div className="flex justify-between items-center text-[11px] font-mono text-white/40 px-1 mt-0.5">
          <span>Booting game assets...</span>
          <span className="hover:text-white/80 transition-colors">Click anywhere to skip</span>
        </div>
      </div>

      {/* Tip Banner */}
      <div className="mt-8 max-w-md mx-6 text-center bg-black/40 border border-white/10 px-4 py-2.5 rounded-lg backdrop-blur-sm shadow-lg">
        <p className="text-xs text-white/75 font-mono leading-relaxed">
          {TIPS[tipIndex]}
        </p>
      </div>
    </div>
  );
};
