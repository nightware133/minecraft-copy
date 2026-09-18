import React, { useEffect, useState } from 'react';
import { sounds, AudioSettings } from '../game/audio';
import { Volume2, VolumeX, Wind, Waves, Sparkles, X, Check } from 'lucide-react';

interface SoundSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SoundSettingsModal: React.FC<SoundSettingsModalProps> = ({ isOpen, onClose }) => {
  const [settings, setSettings] = useState<AudioSettings>(() => sounds.getSettings());

  useEffect(() => {
    return sounds.subscribe((newSettings) => {
      setSettings(newSettings);
    });
  }, []);

  if (!isOpen) return null;

  const handleMasterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    sounds.setMasterVolume(parseFloat(e.target.value));
  };

  const handleAmbienceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    sounds.setAmbienceVolume(parseFloat(e.target.value));
  };

  const handleSfxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    sounds.setSfxVolume(parseFloat(e.target.value));
  };

  const handleToggleMute = () => {
    sounds.toggleMute();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm p-4 font-mono select-none">
      <div className="w-full max-w-md bg-[#252830] border-t-2 border-l-2 border-t-[#555a68] border-l-[#555a68] border-b-2 border-r-2 border-b-[#111318] border-r-[#111318] p-5 shadow-2xl rounded-sm">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Volume2 className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-white tracking-wider uppercase drop-shadow-[1px_1px_0px_#000]">
              Audio & Nature Settings
            </h2>
          </div>
          <button
            id="btn-close-audio-modal"
            onClick={() => {
              sounds.playUIClick();
              onClose();
            }}
            className="p-1 text-white/60 hover:text-white hover:bg-white/10 rounded transition cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Master Mute Banner */}
        <div className="mb-4">
          <button
            id="btn-toggle-mute"
            onClick={() => {
              sounds.playUIClick();
              handleToggleMute();
            }}
            className={`w-full py-2.5 px-3 rounded border text-xs font-bold tracking-wider uppercase flex items-center justify-center gap-2 cursor-pointer transition ${
              settings.isMuted
                ? 'bg-red-950/80 border-red-500 text-red-200 hover:bg-red-900/80'
                : 'bg-[#3b4150] hover:bg-[#4a5266] border-white/20 text-white shadow'
            }`}
          >
            {settings.isMuted ? (
              <>
                <VolumeX className="w-4 h-4 text-red-400" />
                <span>Audio Muted (Click to Unmute)</span>
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4 text-emerald-400" />
                <span>Sound Enabled (Click to Mute All)</span>
              </>
            )}
          </button>
        </div>

        {/* Sliders */}
        <div className="space-y-4">
          {/* Master Volume */}
          <div className="space-y-1.5 bg-black/20 p-3 rounded border border-white/5">
            <div className="flex justify-between items-center text-xs font-medium">
              <span className="text-white/90">Master Volume</span>
              <span className="text-amber-400 font-bold">
                {settings.isMuted ? 'Muted' : `${Math.round(settings.masterVolume * 100)}%`}
              </span>
            </div>
            <input
              id="slider-master-volume"
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={settings.masterVolume}
              onChange={handleMasterChange}
              disabled={settings.isMuted}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-amber-400 disabled:opacity-40"
            />
          </div>

          {/* Ambient Nature Sounds (Wind & Ocean) */}
          <div className="space-y-1.5 bg-black/20 p-3 rounded border border-white/5">
            <div className="flex justify-between items-center text-xs font-medium">
              <span className="text-white/90 flex items-center gap-1.5">
                <Wind className="w-3.5 h-3.5 text-cyan-300" />
                <Waves className="w-3.5 h-3.5 text-blue-300" />
                <span>Nature Ambience (Wind & Ocean)</span>
              </span>
              <span className="text-cyan-400 font-bold">
                {Math.round(settings.ambienceVolume * 100)}%
              </span>
            </div>
            <input
              id="slider-ambience-volume"
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={settings.ambienceVolume}
              onChange={handleAmbienceChange}
              disabled={settings.isMuted}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-400 disabled:opacity-40"
            />
            <p className="text-[10px] text-white/50 pt-0.5">
              Procedural wind howling at mountain heights, gentle plains breeze, and dynamic ocean surf.
            </p>
          </div>

          {/* Interaction SFX */}
          <div className="space-y-1.5 bg-black/20 p-3 rounded border border-white/5">
            <div className="flex justify-between items-center text-xs font-medium">
              <span className="text-white/90 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
                <span>Interaction SFX (Blocks & UI)</span>
              </span>
              <span className="text-emerald-400 font-bold">
                {Math.round(settings.sfxVolume * 100)}%
              </span>
            </div>
            <input
              id="slider-sfx-volume"
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={settings.sfxVolume}
              onChange={handleSfxChange}
              disabled={settings.isMuted}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-emerald-400 disabled:opacity-40"
            />
            <p className="text-[10px] text-white/50 pt-0.5">
              Material-aware block breaking, placing, footsteps, tool durability breakage, and UI clicks.
            </p>
          </div>
        </div>

        {/* Sound Test Panel */}
        <div className="mt-4 pt-3 border-t border-white/10">
          <div className="text-[11px] text-white/70 font-semibold mb-2">Test Interaction Sounds:</div>
          <div className="grid grid-cols-4 gap-2">
            <button
              id="btn-test-break"
              onClick={() => sounds.playBlockBreak(3)}
              className="py-1.5 px-2 bg-[#333845] hover:bg-[#434a5c] active:bg-[#252830] text-[10px] text-white/90 rounded border border-white/10 cursor-pointer transition text-center"
            >
              Break
            </button>
            <button
              id="btn-test-place"
              onClick={() => sounds.playBlockPlace(3)}
              className="py-1.5 px-2 bg-[#333845] hover:bg-[#434a5c] active:bg-[#252830] text-[10px] text-white/90 rounded border border-white/10 cursor-pointer transition text-center"
            >
              Place
            </button>
            <button
              id="btn-test-pop"
              onClick={() => sounds.playItemPickup()}
              className="py-1.5 px-2 bg-[#333845] hover:bg-[#434a5c] active:bg-[#252830] text-[10px] text-white/90 rounded border border-white/10 cursor-pointer transition text-center"
            >
              Pop Ding
            </button>
            <button
              id="btn-test-click"
              onClick={() => sounds.playUIClick()}
              className="py-1.5 px-2 bg-[#333845] hover:bg-[#434a5c] active:bg-[#252830] text-[10px] text-white/90 rounded border border-white/10 cursor-pointer transition text-center"
            >
              UI Click
            </button>
          </div>
        </div>

        {/* Done Button */}
        <div className="mt-5">
          <button
            id="btn-done-audio"
            onClick={() => {
              sounds.playUIClick();
              onClose();
            }}
            className="w-full py-2.5 px-4 bg-[#4a4a4a] hover:bg-[#666666] active:bg-[#333333] border-t-2 border-l-2 border-t-[#858585] border-l-[#858585] border-b-2 border-r-2 border-b-[#1e1e1e] border-r-[#1e1e1e] text-white font-bold text-sm tracking-wider uppercase drop-shadow-[2px_2px_0px_rgba(0,0,0,0.8)] flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <Check className="w-4 h-4 text-emerald-400" />
            <span>Done</span>
          </button>
        </div>
      </div>
    </div>
  );
};
