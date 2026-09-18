import * as THREE from 'three';
import { sounds } from './audio';

export type WeatherType = 'clear' | 'rain' | 'snow' | 'thunder';

export interface WeatherEnvironmentMod {
  skyColorMod: THREE.Color | null;
  fogColorMod: THREE.Color | null;
  fogDensity: number;
  sunIntensityMultiplier: number;
  ambientIntensityMultiplier: number;
  isLightningActive: boolean;
  rainAudioGain: number;
  windAudioGainMod: number;
}

export class WeatherSystem {
  scene: THREE.Scene;
  currentWeather: WeatherType = 'clear';
  targetWeather: WeatherType = 'clear';
  transitionProgress: number = 1.0; // 0 to 1 (1 = fully transitioned)
  transitionDuration: number = 4.0; // seconds for smooth transition

  // Weather state intensities (0.0 to 1.0)
  rainIntensity: number = 0.0;
  snowIntensity: number = 0.0;
  thunderIntensity: number = 0.0;

  // Auto-weather event timer
  weatherTimer: number = 180; // seconds until next random weather roll
  autoWeatherEnabled: boolean = true;

  // Lightning system for Thunderstorms
  lightningTimer: number = 0;
  isLightning: boolean = false;
  lightningDuration: number = 0;

  // Particle systems
  rainPoints: THREE.Points | null = null;
  rainGeometry: THREE.BufferGeometry | null = null;
  rainPositions: Float32Array | null = null;
  rainVelocities: Float32Array | null = null;

  snowPoints: THREE.Points | null = null;
  snowGeometry: THREE.BufferGeometry | null = null;
  snowPositions: Float32Array | null = null;
  snowSeeds: Float32Array | null = null;

  private totalRainDrops = 1400;
  private totalSnowFlakes = 1000;
  private weatherBoxRadius = 26;
  private weatherBoxHeight = 22;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.initRainSystem();
    this.initSnowSystem();
  }

  // Set weather immediately or with smooth transition
  public setWeather(type: WeatherType, immediate: boolean = false) {
    this.targetWeather = type;
    if (immediate) {
      this.currentWeather = type;
      this.transitionProgress = 1.0;
      this.updateIntensities();
    } else {
      this.transitionProgress = 0.0;
    }
  }

  private updateIntensities() {
    const targetRain = (this.targetWeather === 'rain' || this.targetWeather === 'thunder') ? 1.0 : 0.0;
    const targetSnow = this.targetWeather === 'snow' ? 1.0 : 0.0;
    const targetThunder = this.targetWeather === 'thunder' ? 1.0 : 0.0;

    const curRain = (this.currentWeather === 'rain' || this.currentWeather === 'thunder') ? 1.0 : 0.0;
    const curSnow = this.currentWeather === 'snow' ? 1.0 : 0.0;
    const curThunder = this.currentWeather === 'thunder' ? 1.0 : 0.0;

    const t = this.transitionProgress;
    this.rainIntensity = THREE.MathUtils.lerp(curRain, targetRain, t);
    this.snowIntensity = THREE.MathUtils.lerp(curSnow, targetSnow, t);
    this.thunderIntensity = THREE.MathUtils.lerp(curThunder, targetThunder, t);

    if (this.transitionProgress >= 1.0) {
      this.currentWeather = this.targetWeather;
    }
  }

  // 1. Rain Particle System
  private initRainSystem() {
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(this.totalRainDrops * 3);
    const vel = new Float32Array(this.totalRainDrops);

    for (let i = 0; i < this.totalRainDrops; i++) {
      pos[i * 3 + 0] = (Math.random() - 0.5) * this.weatherBoxRadius * 2;
      pos[i * 3 + 1] = Math.random() * this.weatherBoxHeight;
      pos[i * 3 + 2] = (Math.random() - 0.5) * this.weatherBoxRadius * 2;
      vel[i] = 26 + Math.random() * 8; // fast downward speed 26-34 m/s
    }

    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    this.rainPositions = pos;
    this.rainVelocities = vel;
    this.rainGeometry = geo;

    // Pixel streak texture for rain
    const canvas = document.createElement('canvas');
    canvas.width = 4;
    canvas.height = 32;
    const ctx = canvas.getContext('2d')!;
    const grad = ctx.createLinearGradient(0, 0, 0, 32);
    grad.addColorStop(0, 'rgba(180, 220, 255, 0.0)');
    grad.addColorStop(0.3, 'rgba(190, 230, 255, 0.5)');
    grad.addColorStop(1, 'rgba(230, 245, 255, 0.9)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 4, 32);

    const rainTex = new THREE.CanvasTexture(canvas);

    const mat = new THREE.PointsMaterial({
      size: 0.45,
      map: rainTex,
      transparent: true,
      opacity: 0.0,
      depthWrite: false,
      blending: THREE.NormalBlending,
    });

    this.rainPoints = new THREE.Points(geo, mat);
    this.rainPoints.frustumCulled = false;
    this.scene.add(this.rainPoints);
  }

  // 2. Snow Particle System
  private initSnowSystem() {
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(this.totalSnowFlakes * 3);
    const seeds = new Float32Array(this.totalSnowFlakes * 2); // [speed, seed]

    for (let i = 0; i < this.totalSnowFlakes; i++) {
      pos[i * 3 + 0] = (Math.random() - 0.5) * this.weatherBoxRadius * 2;
      pos[i * 3 + 1] = Math.random() * this.weatherBoxHeight;
      pos[i * 3 + 2] = (Math.random() - 0.5) * this.weatherBoxRadius * 2;
      seeds[i * 2 + 0] = 2.2 + Math.random() * 1.6; // gentle fall speed 2.2 - 3.8 m/s
      seeds[i * 2 + 1] = Math.random() * Math.PI * 2; // phase
    }

    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    this.snowPositions = pos;
    this.snowSeeds = seeds;
    this.snowGeometry = geo;

    // Snowflake round texture
    const canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 16;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(8, 8, 7, 0, Math.PI * 2);
    ctx.fill();

    const snowTex = new THREE.CanvasTexture(canvas);

    const mat = new THREE.PointsMaterial({
      size: 0.22,
      map: snowTex,
      transparent: true,
      opacity: 0.0,
      depthWrite: false,
    });

    this.snowPoints = new THREE.Points(geo, mat);
    this.snowPoints.frustumCulled = false;
    this.scene.add(this.snowPoints);
  }

  // Frame update
  public update(dt: number, playerX: number, playerY: number, playerZ: number): WeatherEnvironmentMod {
    // 1. Weather transition progress
    if (this.transitionProgress < 1.0) {
      this.transitionProgress = Math.min(1.0, this.transitionProgress + dt / this.transitionDuration);
      this.updateIntensities();
    }

    // 2. Auto weather event timer
    if (this.autoWeatherEnabled) {
      this.weatherTimer -= dt;
      if (this.weatherTimer <= 0) {
        // Roll next weather event
        // 60% Clear, 22% Rain, 12% Snow, 6% Thunder
        const roll = Math.random();
        let next: WeatherType = 'clear';
        if (roll < 0.60) next = 'clear';
        else if (roll < 0.82) next = 'rain';
        else if (roll < 0.94) next = 'snow';
        else next = 'thunder';

        this.setWeather(next);
        this.weatherTimer = 180 + Math.random() * 120; // 3-5 minutes
      }
    }

    // 3. Lightning simulation during Thunderstorm
    this.isLightning = false;
    if (this.thunderIntensity > 0.4) {
      this.lightningTimer -= dt;
      if (this.lightningTimer <= 0) {
        // Trigger lightning flash!
        this.isLightning = true;
        this.lightningDuration = 0.12; // 120ms flash
        sounds.playThunder();
        // Schedule next lightning strike
        this.lightningTimer = 8 + Math.random() * 14;
      }
    }

    if (this.lightningDuration > 0) {
      this.lightningDuration -= dt;
      this.isLightning = true;
    }

    // 4. Update Rain Particles
    if (this.rainPoints && this.rainPositions && this.rainVelocities && this.rainGeometry) {
      const mat = this.rainPoints.material as THREE.PointsMaterial;
      mat.opacity = this.rainIntensity * 0.75;
      this.rainPoints.visible = mat.opacity > 0.01;

      if (this.rainPoints.visible) {
        this.rainPoints.position.set(playerX, playerY, playerZ);
        const pos = this.rainPositions;
        const vel = this.rainVelocities;
        const boxR = this.weatherBoxRadius;
        const boxH = this.weatherBoxHeight;

        for (let i = 0; i < this.totalRainDrops; i++) {
          const idx = i * 3;
          pos[idx + 1] -= vel[i] * dt;
          // Slight wind tilt
          pos[idx + 0] += dt * 2.5;

          // Recycle drop when it falls below player's feet
          if (pos[idx + 1] < -4) {
            pos[idx + 1] = boxH - 2 + Math.random() * 4;
            pos[idx + 0] = (Math.random() - 0.5) * boxR * 2;
            pos[idx + 2] = (Math.random() - 0.5) * boxR * 2;
          }
        }
        this.rainGeometry.attributes.position.needsUpdate = true;
      }
    }

    // 5. Update Snow Particles
    if (this.snowPoints && this.snowPositions && this.snowSeeds && this.snowGeometry) {
      const mat = this.snowPoints.material as THREE.PointsMaterial;
      mat.opacity = this.snowIntensity * 0.85;
      this.snowPoints.visible = mat.opacity > 0.01;

      if (this.snowPoints.visible) {
        this.snowPoints.position.set(playerX, playerY, playerZ);
        const pos = this.snowPositions;
        const seeds = this.snowSeeds;
        const boxR = this.weatherBoxRadius;
        const boxH = this.weatherBoxHeight;
        const timeNow = performance.now() * 0.0015;

        for (let i = 0; i < this.totalSnowFlakes; i++) {
          const idx = i * 3;
          const sIdx = i * 2;
          const fallSpd = seeds[sIdx + 0];
          const phase = seeds[sIdx + 1];

          pos[idx + 1] -= fallSpd * dt;
          // Natural fluttering sine wave wind drift
          pos[idx + 0] += Math.sin(timeNow + phase) * 1.8 * dt;
          pos[idx + 2] += Math.cos(timeNow * 0.8 + phase) * 1.4 * dt;

          if (pos[idx + 1] < -3) {
            pos[idx + 1] = boxH - 2 + Math.random() * 3;
            pos[idx + 0] = (Math.random() - 0.5) * boxR * 2;
            pos[idx + 2] = (Math.random() - 0.5) * boxR * 2;
          }
        }
        this.snowGeometry.attributes.position.needsUpdate = true;
      }
    }

    // 6. Compute Environmental Light, Sky, and Fog Modifiers
    let skyColorMod: THREE.Color | null = null;
    let fogColorMod: THREE.Color | null = null;

    // Overcast rainy sky (#4c535e), Thunder ominous navy (#252830), Cold Snow white-gray (#bfc9d6)
    if (this.thunderIntensity > 0) {
      const thunderSky = new THREE.Color(0x222630);
      skyColorMod = thunderSky.clone().multiplyScalar(this.thunderIntensity);
      fogColorMod = thunderSky.clone();
    } else if (this.rainIntensity > 0) {
      const rainSky = new THREE.Color(0x484f5c);
      skyColorMod = rainSky.clone().multiplyScalar(this.rainIntensity);
      fogColorMod = rainSky.clone();
    } else if (this.snowIntensity > 0) {
      const snowSky = new THREE.Color(0xafbccb);
      skyColorMod = snowSky.clone().multiplyScalar(this.snowIntensity);
      fogColorMod = snowSky.clone();
    }

    // Fog density: 0.016 baseline clear -> 0.038 heavy rain/thunder, 0.032 snow
    const targetFogDensity = 0.016 + this.rainIntensity * 0.022 + this.snowIntensity * 0.016;

    // Sunlight dimming: Clear = 1.0, Rain = 0.5, Thunder = 0.25, Snow = 0.7
    const sunMultiplier = Math.max(0.2, 1.0 - this.rainIntensity * 0.5 - this.thunderIntensity * 0.3 - this.snowIntensity * 0.25);
    const ambientMultiplier = Math.max(0.35, 1.0 - this.rainIntensity * 0.35 - this.thunderIntensity * 0.25);

    return {
      skyColorMod,
      fogColorMod,
      fogDensity: targetFogDensity,
      sunIntensityMultiplier: sunMultiplier,
      ambientIntensityMultiplier: ambientMultiplier,
      isLightningActive: this.isLightning,
      rainAudioGain: Math.max(this.rainIntensity, this.thunderIntensity * 1.2),
      windAudioGainMod: this.snowIntensity * 1.5 + this.thunderIntensity * 0.8,
    };
  }

  public destroy() {
    if (this.rainPoints) this.scene.remove(this.rainPoints);
    if (this.snowPoints) this.scene.remove(this.snowPoints);
  }
}
