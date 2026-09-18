// Procedural Web Audio Sound Management Utility for Voxel Sandbox
// Zero external sound files needed; pure synthesized ambient and interaction audio

export interface AudioSettings {
  masterVolume: number; // 0.0 to 1.0
  sfxVolume: number; // 0.0 to 1.0
  ambienceVolume: number; // 0.0 to 1.0
  isMuted: boolean;
}

const STORAGE_KEY = 'voxel_sandbox_audio_settings';

export class SoundManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private ambienceGain: GainNode | null = null;

  // Ambient nodes
  private windGain: GainNode | null = null;
  private windFilter: BiquadFilterNode | null = null;
  private oceanGain: GainNode | null = null;
  private oceanFilter: BiquadFilterNode | null = null;
  private rainGain: GainNode | null = null;
  private rainFilter: BiquadFilterNode | null = null;
  private underwaterFilter: BiquadFilterNode | null = null;

  // Ambience loop state
  private isAmbienceRunning = false;
  private lastFootstepTime = 0;
  private waveCycleTime = 0;

  // Settings
  private settings: AudioSettings = {
    masterVolume: 0.7,
    sfxVolume: 0.8,
    ambienceVolume: 0.6,
    isMuted: false,
  };

  private listeners: Array<(settings: AudioSettings) => void> = [];

  constructor() {
    this.loadSettings();
  }

  private loadSettings() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const saved = window.localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          this.settings = { ...this.settings, ...parsed };
        }
      }
    } catch {
      // Ignore storage errors
    }
  }

  private saveSettings() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.settings));
      }
    } catch {
      // Ignore storage errors
    }
    this.notifyListeners();
  }

  public subscribe(listener: (settings: AudioSettings) => void) {
    this.listeners.push(listener);
    listener(this.getSettings());
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notifyListeners() {
    const s = this.getSettings();
    this.listeners.forEach((l) => l(s));
  }

  public getSettings(): AudioSettings {
    return { ...this.settings };
  }

  public setMasterVolume(val: number) {
    this.settings.masterVolume = Math.max(0, Math.min(1, val));
    this.updateGainNodes();
    this.saveSettings();
  }

  public setSfxVolume(val: number) {
    this.settings.sfxVolume = Math.max(0, Math.min(1, val));
    this.updateGainNodes();
    this.saveSettings();
  }

  public setAmbienceVolume(val: number) {
    this.settings.ambienceVolume = Math.max(0, Math.min(1, val));
    this.updateGainNodes();
    this.saveSettings();
  }

  public toggleMute(): boolean {
    this.settings.isMuted = !this.settings.isMuted;
    this.updateGainNodes();
    this.saveSettings();
    return this.settings.isMuted;
  }

  public setMuted(muted: boolean) {
    this.settings.isMuted = muted;
    this.updateGainNodes();
    this.saveSettings();
  }

  // Ensure Web Audio Context is initialized & unlocked
  public initContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;

    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return null;
      this.ctx = new AudioCtx();

      // Master gain node chain
      this.masterGain = this.ctx.createGain();
      this.sfxGain = this.ctx.createGain();
      this.ambienceGain = this.ctx.createGain();

      this.sfxGain.connect(this.masterGain);
      this.ambienceGain.connect(this.masterGain);
      this.masterGain.connect(this.ctx.destination);

      this.updateGainNodes();
      this.startAmbienceSynthesis();
    }

    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    return this.ctx;
  }

  private updateGainNodes() {
    if (!this.ctx || !this.masterGain || !this.sfxGain || !this.ambienceGain) return;
    const now = this.ctx.currentTime;
    const targetMaster = this.settings.isMuted ? 0 : this.settings.masterVolume;
    const targetSfx = this.settings.sfxVolume;
    const targetAmbience = this.settings.ambienceVolume;

    this.masterGain.gain.setTargetAtTime(targetMaster, now, 0.05);
    this.sfxGain.gain.setTargetAtTime(targetSfx, now, 0.05);
    this.ambienceGain.gain.setTargetAtTime(targetAmbience, now, 0.05);
  }

  // --- AMBIENT NATURE SOUNDS (Wind, Ocean, Underwater) ---
  private startAmbienceSynthesis() {
    if (!this.ctx || !this.ambienceGain || this.isAmbienceRunning) return;
    this.isAmbienceRunning = true;

    try {
      // 1. Generate procedural noise buffer (5 seconds looping pink/brown noise)
      const sampleRate = this.ctx.sampleRate;
      const bufferLength = sampleRate * 5;
      const noiseBuffer = this.ctx.createBuffer(2, bufferLength, sampleRate);

      for (let ch = 0; ch < 2; ch++) {
        const data = noiseBuffer.getChannelData(ch);
        let b0 = 0,
          b1 = 0,
          b2 = 0;
        for (let i = 0; i < bufferLength; i++) {
          const white = Math.random() * 2 - 1;
          // Pink noise filter algorithm
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.969 * b2 + white * 0.153852;
          data[i] = (b0 + b1 + b2) * 0.12;
        }
      }

      // 2. Wind Synthesizer Channel
      const windSource = this.ctx.createBufferSource();
      windSource.buffer = noiseBuffer;
      windSource.loop = true;

      this.windFilter = this.ctx.createBiquadFilter();
      this.windFilter.type = 'bandpass';
      this.windFilter.frequency.setValueAtTime(320, this.ctx.currentTime);
      this.windFilter.Q.setValueAtTime(1.8, this.ctx.currentTime);

      this.windGain = this.ctx.createGain();
      this.windGain.gain.setValueAtTime(0.18, this.ctx.currentTime);

      windSource.connect(this.windFilter);
      this.windFilter.connect(this.windGain);
      this.windGain.connect(this.ambienceGain);
      windSource.start(0);

      // 3. Ocean Waves Synthesizer Channel
      const oceanSource = this.ctx.createBufferSource();
      oceanSource.buffer = noiseBuffer;
      oceanSource.loop = true;

      this.oceanFilter = this.ctx.createBiquadFilter();
      this.oceanFilter.type = 'lowpass';
      this.oceanFilter.frequency.setValueAtTime(450, this.ctx.currentTime);
      this.oceanFilter.Q.setValueAtTime(1.2, this.ctx.currentTime);

      this.oceanGain = this.ctx.createGain();
      this.oceanGain.gain.setValueAtTime(0.12, this.ctx.currentTime);

      oceanSource.connect(this.oceanFilter);
      this.oceanFilter.connect(this.oceanGain);
      this.oceanGain.connect(this.ambienceGain);
      oceanSource.start(0);

      // 4. Rainfall Synthesizer Channel
      const rainSource = this.ctx.createBufferSource();
      rainSource.buffer = noiseBuffer;
      rainSource.loop = true;

      this.rainFilter = this.ctx.createBiquadFilter();
      this.rainFilter.type = 'bandpass';
      this.rainFilter.frequency.setValueAtTime(1400, this.ctx.currentTime);
      this.rainFilter.Q.setValueAtTime(1.1, this.ctx.currentTime);

      this.rainGain = this.ctx.createGain();
      this.rainGain.gain.setValueAtTime(0.0, this.ctx.currentTime);

      rainSource.connect(this.rainFilter);
      this.rainFilter.connect(this.rainGain);
      this.rainGain.connect(this.ambienceGain);
      rainSource.start(0);
    } catch {
      // Audio fallback
    }
  }

  // Continuous frame update for dynamic nature ambiance modulation
  public updateAmbience(dt: number, state: {
    y: number;
    isSubmerged: boolean;
    inWater: boolean;
    isOceanBiome: boolean;
    isNight: boolean;
    rainGainMod?: number;
    windGainMod?: number;
  }) {
    if (!this.ctx || !this.windFilter || !this.windGain || !this.oceanFilter || !this.oceanGain) {
      return;
    }

    const now = this.ctx.currentTime;
    this.waveCycleTime += dt;

    // Altitude wind calculation:
    // Lowlands (y ~ 15-25): mild breeze (freq ~ 240Hz, gain ~ 0.12)
    // Mountain tops (y ~ 45-70): howling wind (freq ~ 580Hz-850Hz, gain ~ 0.38)
    // Underground (y < 12): faint hollow draft (freq ~ 140Hz, gain ~ 0.08)
    const altitudeFactor = Math.max(0, Math.min(2.5, (state.y - 14) / 20));
    const windGust = Math.sin(this.waveCycleTime * 0.4) * 0.3 + Math.cos(this.waveCycleTime * 0.9) * 0.15;
    const weatherWindFactor = state.windGainMod || 0;

    let targetWindFreq = 220 + altitudeFactor * 260 + windGust * 80 + weatherWindFactor * 220;
    let targetWindGain = (0.1 + altitudeFactor * 0.12) * (1 + windGust * 0.25) * (1 + weatherWindFactor * 0.7);

    // Ocean Waves calculation:
    // Wave cycle swells every ~4.5 seconds
    const wavePhase = (this.waveCycleTime % 4.5) / 4.5;
    const waveSwell = Math.pow(Math.sin(wavePhase * Math.PI), 2); // 0 to 1 smooth swell

    let targetOceanFreq = 220 + waveSwell * 360;
    let targetOceanGain = state.isOceanBiome || state.inWater ? 0.18 + waveSwell * 0.22 : 0.04;

    // Rain Audio Gain (0 to 0.45)
    const targetRainGain = Math.min(0.45, (state.rainGainMod || 0) * 0.38);

    // Submerged Underwater Low-Pass Muffler
    if (state.isSubmerged) {
      targetWindGain *= 0.05;
      targetWindFreq = 110;
      targetOceanFreq = 160 + Math.sin(this.waveCycleTime * 1.5) * 30;
      targetOceanGain = 0.32; // Deep resonant underwater hum
    }

    this.windFilter.frequency.setTargetAtTime(targetWindFreq, now, 0.2);
    this.windGain.gain.setTargetAtTime(targetWindGain, now, 0.2);
    this.oceanFilter.frequency.setTargetAtTime(targetOceanFreq, now, 0.2);
    this.oceanGain.gain.setTargetAtTime(targetOceanGain, now, 0.2);

    if (this.rainGain) {
      this.rainGain.gain.setTargetAtTime(targetRainGain, now, 0.25);
    }
  }

  // --- THUNDERSTORM SFX ---
  public playThunder() {
    try {
      this.initContext();
      if (!this.ctx || !this.sfxGain || this.settings.isMuted) return;

      const now = this.ctx.currentTime;

      // 1. Initial sharp crack
      const crackOsc = this.ctx.createOscillator();
      const crackGain = this.ctx.createGain();
      crackOsc.type = 'sawtooth';
      crackOsc.frequency.setValueAtTime(320, now);
      crackOsc.frequency.exponentialRampToValueAtTime(45, now + 0.18);

      crackGain.gain.setValueAtTime(0.45, now);
      crackGain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);

      crackOsc.connect(crackGain);
      crackGain.connect(this.sfxGain);
      crackOsc.start(now);
      crackOsc.stop(now + 0.25);

      // 2. Low-frequency rumbling bass reverberation (3.5s decay)
      const rumbleOsc = this.ctx.createOscillator();
      const rumbleGain = this.ctx.createGain();
      const rumbleFilter = this.ctx.createBiquadFilter();

      rumbleOsc.type = 'sine';
      rumbleOsc.frequency.setValueAtTime(65, now);
      rumbleOsc.frequency.linearRampToValueAtTime(38, now + 1.2);
      rumbleOsc.frequency.linearRampToValueAtTime(28, now + 3.0);

      rumbleFilter.type = 'lowpass';
      rumbleFilter.frequency.setValueAtTime(140, now);

      rumbleGain.gain.setValueAtTime(0.0, now);
      rumbleGain.gain.linearRampToValueAtTime(0.55, now + 0.08);
      rumbleGain.gain.exponentialRampToValueAtTime(0.001, now + 3.2);

      rumbleOsc.connect(rumbleFilter);
      rumbleFilter.connect(rumbleGain);
      rumbleGain.connect(this.sfxGain);
      rumbleOsc.start(now);
      rumbleOsc.stop(now + 3.3);
    } catch {
      // Audio fallback
    }
  }

  // --- ARMOR EQUIP SFX ---
  public playArmorEquip(tier: string = 'iron') {
    try {
      this.initContext();
      if (!this.ctx || !this.sfxGain || this.settings.isMuted) return;

      const now = this.ctx.currentTime;
      const isLeather = tier === 'leather';

      // Authentic Minecraft armor clink / leather buckle sound
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = isLeather ? 'triangle' : 'square';
      osc.frequency.setValueAtTime(isLeather ? 180 : 880, now);
      osc.frequency.exponentialRampToValueAtTime(isLeather ? 110 : 340, now + 0.12);

      gain.gain.setValueAtTime(0.32, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.14);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now);
      osc.stop(now + 0.15);

      // Secondary resonant metal chime for iron/diamond
      if (!isLeather) {
        const chime = this.ctx.createOscillator();
        const chimeGain = this.ctx.createGain();
        chime.type = 'sine';
        chime.frequency.setValueAtTime(1240, now + 0.03);
        chime.frequency.exponentialRampToValueAtTime(620, now + 0.16);

        chimeGain.gain.setValueAtTime(0.24, now + 0.03);
        chimeGain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);

        chime.connect(chimeGain);
        chimeGain.connect(this.sfxGain);
        chime.start(now + 0.03);
        chime.stop(now + 0.2);
      }
    } catch {
      // Audio fallback
    }
  }

  // --- INTERACTION SOUNDS: MINING & BREAKING ---

  // Block hit chip sound (played while breaking progressively)
  public playHit(blockType?: number, pitchVariance: number = 1.0) {
    try {
      this.initContext();
      if (!this.ctx || !this.sfxGain || this.settings.isMuted) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      let baseFreq = (150 + Math.random() * 40) * pitchVariance;
      if (blockType === 3) baseFreq *= 1.4; // Stone / mineral crisper

      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.4, now + 0.07);

      gain.gain.setValueAtTime(0.24, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.07);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.07);
    } catch {
      // AudioContext policy fallback
    }
  }

  // Material-aware block shattered / broken pop sound
  public playBlockBreak(blockType: number = 1) {
    try {
      this.initContext();
      if (!this.ctx || !this.sfxGain || this.settings.isMuted) return;

      const now = this.ctx.currentTime;

      // 1. Noise pop customized by material
      const duration = blockType === 12 ? 0.25 : 0.14; // Glass shatters longer
      const bufferSize = Math.floor(this.ctx.sampleRate * duration);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);

      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      if (blockType === 12) {
        // Glass / Ice: High crystalline bandpass
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(3200, now);
        filter.frequency.exponentialRampToValueAtTime(1200, now + duration);
        gain.gain.setValueAtTime(0.5, now);
      } else if (blockType === 3 || blockType >= 14 && blockType <= 17) {
        // Stone & Ores: Gritty crunchy lowpass
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1600, now);
        filter.frequency.exponentialRampToValueAtTime(250, now + duration);
        gain.gain.setValueAtTime(0.45, now);
      } else if (blockType === 4 || blockType === 11 || blockType === 13) {
        // Wood & Planks: Warm resonant thud
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(750, now);
        filter.frequency.exponentialRampToValueAtTime(180, now + duration);
        gain.gain.setValueAtTime(0.42, now);
      } else {
        // Grass / Dirt / Leaves / Sand
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1100, now);
        filter.frequency.exponentialRampToValueAtTime(220, now + duration);
        gain.gain.setValueAtTime(0.38, now);
      }

      gain.gain.exponentialRampToValueAtTime(0.01, now + duration);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain);
      noise.start(now);

      // 2. Low-frequency snap thud
      const osc = this.ctx.createOscillator();
      const toneGain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(blockType === 12 ? 680 : 220, now);
      osc.frequency.exponentialRampToValueAtTime(70, now + 0.1);
      toneGain.gain.setValueAtTime(0.3, now);
      toneGain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

      osc.connect(toneGain);
      toneGain.connect(this.sfxGain);
      osc.start(now);
      osc.stop(now + 0.1);
    } catch {
      // Fallback
    }
  }

  // Block placed thud
  public playBlockPlace(blockType: number = 1) {
    try {
      this.initContext();
      if (!this.ctx || !this.sfxGain || this.settings.isMuted) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      let freq = 170 + Math.random() * 30;
      if (blockType === 3 || blockType >= 14 && blockType <= 17) freq = 210; // Stone
      if (blockType === 4 || blockType === 11) freq = 140; // Wood

      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(55, now + 0.08);

      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.08);
    } catch {
      // Fallback
    }
  }

  // --- INTERACTION SOUNDS: UI & INVENTORY ---

  // Classic tactile UI button click
  public playUIClick() {
    try {
      this.initContext();
      if (!this.ctx || !this.sfxGain || this.settings.isMuted) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(560, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.045);

      gain.gain.setValueAtTime(0.28, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.045);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.045);
    } catch {
      // Fallback
    }
  }

  // Subtle button hover tick
  public playUIHover() {
    try {
      this.initContext();
      if (!this.ctx || !this.sfxGain || this.settings.isMuted) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(920, now);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.02);
    } catch {
      // Fallback
    }
  }

  // Hotbar slot change mechanical tick
  public playSlotSwitch() {
    try {
      this.initContext();
      if (!this.ctx || !this.sfxGain || this.settings.isMuted) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(740, now);
      osc.frequency.exponentialRampToValueAtTime(320, now + 0.035);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.035);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.035);
    } catch {
      // Fallback
    }
  }

  // Inventory Open / Close bag latch
  public playInventoryToggle(isOpen: boolean) {
    try {
      this.initContext();
      if (!this.ctx || !this.sfxGain || this.settings.isMuted) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      if (isOpen) {
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(480, now + 0.07);
      } else {
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(180, now + 0.07);
      }

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1400, now);

      gain.gain.setValueAtTime(0.22, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.07);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.07);
    } catch {
      // Fallback
    }
  }

  // Item pickup iconic rising pop ding
  public playItemPickup() {
    try {
      this.initContext();
      if (!this.ctx || !this.sfxGain || this.settings.isMuted) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.exponentialRampToValueAtTime(940, now + 0.09);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.09);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.09);
    } catch {
      // Fallback
    }
  }

  // Rewarding crafting success double-chime
  public playCraftSuccess() {
    try {
      this.initContext();
      if (!this.ctx || !this.sfxGain || this.settings.isMuted) return;

      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99]; // C5, E5, G5 chord

      notes.forEach((freq, idx) => {
        if (!this.ctx || !this.sfxGain) return;
        const noteTime = now + idx * 0.06;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, noteTime);

        gain.gain.setValueAtTime(0.22, noteTime);
        gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.22);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(noteTime);
        osc.stop(noteTime + 0.22);
      });
    } catch {
      // Fallback
    }
  }

  // Dramatic Tool Destruction Shatter Sound
  public playToolBreak() {
    try {
      this.initContext();
      if (!this.ctx || !this.sfxGain || this.settings.isMuted) return;

      const now = this.ctx.currentTime;

      // 1. High frequency snap
      const osc = this.ctx.createOscillator();
      const snapGain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(850, now);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.28);

      snapGain.gain.setValueAtTime(0.48, now);
      snapGain.gain.exponentialRampToValueAtTime(0.01, now + 0.28);

      osc.connect(snapGain);
      snapGain.connect(this.sfxGain);
      osc.start(now);
      osc.stop(now + 0.28);

      // 2. Debris shatter noise
      const bufferSize = this.ctx.sampleRate * 0.35;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(2400, now);
      filter.frequency.exponentialRampToValueAtTime(600, now + 0.35);
      filter.Q.setValueAtTime(2.0, now);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.55, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(this.sfxGain);

      noise.start(now);
    } catch {
      // Fallback
    }
  }

  // Footstep sound when walking on ground
  public playFootstep(isSprinting: boolean = false) {
    try {
      const nowMs = Date.now();
      const interval = isSprinting ? 280 : 400;
      if (nowMs - this.lastFootstepTime < interval) return;
      this.lastFootstepTime = nowMs;

      this.initContext();
      if (!this.ctx || !this.sfxGain || this.settings.isMuted) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      const baseFreq = 120 + Math.random() * 30;
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(45, now + 0.06);

      gain.gain.setValueAtTime(0.16, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.06);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.06);
    } catch {
      // Fallback
    }
  }

  // --- MOB SOUND EFFECTS ---

  // Sheep bleat ("Baaah!")
  public playSheepBaa() {
    try {
      this.initContext();
      if (!this.ctx || !this.sfxGain || this.settings.isMuted) return;

      const now = this.ctx.currentTime;
      const duration = 0.55;

      // Primary voice oscillator
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      // Vibrato LFO for realistic animal bleat
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.frequency.setValueAtTime(6.5, now); // 6.5 Hz waver
      lfoGain.gain.setValueAtTime(9.0, now);
      lfo.connect(osc.frequency);
      lfo.start(now);
      lfo.stop(now + duration);

      osc.type = 'triangle';
      const basePitch = 185 + Math.random() * 30;
      osc.frequency.setValueAtTime(basePitch, now);
      osc.frequency.linearRampToValueAtTime(basePitch * 1.08, now + 0.15);
      osc.frequency.linearRampToValueAtTime(basePitch * 0.92, now + duration);

      // Formant filter to sound like an animal mouth
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(750, now);
      filter.Q.setValueAtTime(3.0, now);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.28, now + 0.08);
      gain.gain.setValueAtTime(0.25, now + duration - 0.12);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + duration);
    } catch {
      // Fallback
    }
  }

  // Zombie low guttural undead groan
  public playZombieGroan() {
    try {
      this.initContext();
      if (!this.ctx || !this.sfxGain || this.settings.isMuted) return;

      const now = this.ctx.currentTime;
      const duration = 0.9;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      // Raspiness / pitch tremolo
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.frequency.setValueAtTime(14.0, now);
      lfoGain.gain.setValueAtTime(6.0, now);
      lfo.connect(osc.frequency);
      lfo.start(now);
      lfo.stop(now + duration);

      osc.type = 'sawtooth';
      const pitch = 82 + Math.random() * 14;
      osc.frequency.setValueAtTime(pitch, now);
      osc.frequency.linearRampToValueAtTime(pitch * 0.95, now + 0.4);
      osc.frequency.linearRampToValueAtTime(pitch * 0.82, now + duration);

      // Vocal formant vocal tract
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(420, now);
      filter.Q.setValueAtTime(4.0, now);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.26, now + 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + duration);
    } catch {
      // Fallback
    }
  }

  // Zombie hurt / hit groan
  public playZombieHurt() {
    try {
      this.initContext();
      if (!this.ctx || !this.sfxGain || this.settings.isMuted) return;

      const now = this.ctx.currentTime;
      const duration = 0.32;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(130, now);
      osc.frequency.exponentialRampToValueAtTime(70, now + duration);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(650, now);

      gain.gain.setValueAtTime(0.38, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + duration);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + duration);
    } catch {
      // Fallback
    }
  }

  // Physical punch / weapon hit sound on mob
  public playMobHit() {
    try {
      this.initContext();
      if (!this.ctx || !this.sfxGain || this.settings.isMuted) return;

      const now = this.ctx.currentTime;

      // Heavy transient punch
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.12);

      gain.gain.setValueAtTime(0.45, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now);
      osc.stop(now + 0.14);
    } catch {
      // Fallback
    }
  }
}

export const sounds = new SoundManager();
