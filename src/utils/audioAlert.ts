/**
 * High-Reliability Studio Emergency Siren & Notification Synthesizer ("Vera Maari" Loud Audio Engine)
 * Features:
 * - Studio Mastering Chain: DynamicsCompressor (Loudness Maximizer) + Waveshaper Saturation + Mid-Frequency EQ Boost (2-3.5kHz human ear resonance)
 * - Authentic Multi-Harmonic Disaster Sirens:
 *    1. CRITICAL_WARBLE: Real EAS 853Hz + 960Hz heterodyne tone combined with a 700-1350Hz piercing air-raid sweep.
 *    2. CYCLONE_HORN: Deep 220Hz + 330Hz + 440Hz maritime storm super-foghorn with sub-bass rumble.
 *    3. FLOOD_SIREN: Dual-rotor 550Hz / 660Hz -> 1100Hz / 1320Hz mechanical dam-burst warning wail.
 *    4. STANDBY_CHIME: Piercing 800Hz / 1200Hz tactical warning chime.
 *    5. ALL_CLEAR: Ascending C-major rescue chord with bright harmonics.
 *    6. BEEP: 1000Hz + 1500Hz high-penetration alert blip.
 * - Dual Engine: Web Audio API master chain + 44.1kHz 16-bit PCM WAV Data URI fallback playing simultaneously for maximum sound pressure level (SPL).
 */

// Generate 44.1kHz High-Loudness PCM WAV Data URI with rich harmonics
export function generateWavDataUri(
  toneType: 'CRITICAL_WARBLE' | 'CYCLONE_HORN' | 'FLOOD_SIREN' | 'STANDBY_CHIME' | 'ALL_CLEAR' | 'BEEP',
  durationSec: number = 3
): string {
  if (typeof window === 'undefined') return '';

  const sampleRate = 44100;
  const numSamples = Math.floor(sampleRate * durationSec);
  const buffer = new ArrayBuffer(44 + numSamples * 2);
  const view = new DataView(buffer);

  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  // RIFF Chunk Descriptor
  writeString(0, 'RIFF');
  view.setUint32(4, 36 + numSamples * 2, true);
  writeString(8, 'WAVE');

  // "fmt " sub-chunk (PCM)
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // Mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true); // ByteRate
  view.setUint16(32, 2, true); // BlockAlign
  view.setUint16(34, 16, true); // 16 BitsPerSample

  // "data" sub-chunk
  writeString(36, 'data');
  view.setUint32(40, numSamples * 2, true);

  let offset = 44;
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    let sample = 0;

    if (toneType === 'CRITICAL_WARBLE') {
      // EAS 853Hz + 960Hz dual emergency tone + sweeping 750-1300Hz air-raid siren
      const eas1 = Math.sin(2 * Math.PI * 853 * t);
      const eas2 = Math.sin(2 * Math.PI * 960 * t);
      // Fast siren pulse every 0.35s
      const sweepPhase = (t % 0.35) / 0.35;
      const sirenFreq = 750 + Math.sin(sweepPhase * Math.PI) * 550;
      const sirenSaw = 2 * ((sirenFreq * t) % 1) - 1;

      sample = (eas1 * 0.45) + (eas2 * 0.45) + (sirenSaw * 0.5);
    } else if (toneType === 'CYCLONE_HORN') {
      // Deep 220Hz + 330Hz + 440Hz maritime foghorn with raspy horn pulse
      const horn1 = Math.sin(2 * Math.PI * 220 * t) * 0.5; // sub-bass body
      const horn2 = (2 * ((330 * t) % 1) - 1) * 0.4;     // rich sawtooth 5th
      const horn3 = Math.sin(2 * Math.PI * 440 * t) * 0.4; // octave blast
      // 0.8s on, 0.2s off cadence
      const pulse = (t % 1.0) < 0.85 ? 1.0 : 0.05;
      sample = (horn1 + horn2 + horn3) * pulse;
    } else if (toneType === 'FLOOD_SIREN') {
      // Dual-rotor air raid dam siren (ascending 500-1200Hz, then descending)
      const cycle = (t % 1.6) / 1.6;
      const freq = cycle < 0.5 
        ? 520 + (cycle * 2) * 680 
        : 1200 - ((cycle - 0.5) * 2) * 680;
      const s1 = 2 * ((freq * t) % 1) - 1;
      const s2 = Math.sin(2 * Math.PI * (freq * 1.2) * t); // 1.2 rotor ratio
      sample = (s1 * 0.6) + (s2 * 0.5);
    } else if (toneType === 'STANDBY_CHIME') {
      // Tactical double alert chime
      const isFirst = (t % 0.8) < 0.4;
      const freq = isFirst ? 784 : 1046.5;
      const decay = Math.exp(-((t % 0.4) * 8));
      sample = (Math.sin(2 * Math.PI * freq * t) + 0.3 * Math.sin(2 * Math.PI * freq * 2 * t)) * decay;
    } else if (toneType === 'ALL_CLEAR') {
      // Clear bright ascending chime
      const seg = Math.min(3, Math.floor(t / 0.25));
      const freqs = [523.25, 659.25, 783.99, 1046.5];
      const freq = freqs[seg];
      sample = Math.sin(2 * Math.PI * freq * t) * 0.7 + Math.sin(2 * Math.PI * (freq * 2) * t) * 0.3;
    } else {
      // BEEP - Loud dual emergency test blip
      const b1 = Math.sin(2 * Math.PI * 1000 * t);
      const b2 = Math.sin(2 * Math.PI * 1500 * t);
      sample = (b1 * 0.6) + (b2 * 0.5);
    }

    // Soft-clip saturation / loudness boost (tanh curve for maximum perceived loudness without harsh digital wrap-around)
    sample = Math.tanh(sample * 1.4);

    // Anti-click micro-envelope
    const env = Math.min(1, Math.min(i / 150, (numSamples - i) / 150));
    sample = sample * env * 0.98;

    // Convert to signed 16-bit integer (max peak 32100)
    const int16 = Math.max(-32767, Math.min(32767, Math.floor(sample * 32700)));
    view.setInt16(offset, int16, true);
    offset += 2;
  }

  // Base64 encode
  let binary = '';
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return 'data:audio/wav;base64,' + btoa(binary);
}

class EmergencyAudioManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private compressor: DynamicsCompressorNode | null = null;
  private presenceFilter: BiquadFilterNode | null = null;
  private highPassFilter: BiquadFilterNode | null = null;
  private isMuted: boolean = false;
  private isAlarmPlaying: boolean = false;
  private alarmInterval: number | null = null;
  private activeOscillators: OscillatorNode[] = [];
  private onStateChangeListeners: ((muted: boolean, playing: boolean) => void)[] = [];
  private volume: number = 1.0; // 100% MAXIMUM default loudness
  private currentToneType: string = 'CRITICAL_WARBLE';
  private currentHtmlAudio: HTMLAudioElement | null = null;
  private wavCache: Record<string, string> = {};

  constructor() {
    // Immediate unlock on any user interaction
    if (typeof window !== 'undefined') {
      const unlockAudio = () => {
        this.resumeContext();
      };
      window.addEventListener('click', unlockAudio, { once: true, passive: true });
      window.addEventListener('touchstart', unlockAudio, { once: true, passive: true });
      window.addEventListener('keydown', unlockAudio, { once: true, passive: true });
    }
  }

  public resumeContext(): Promise<void> {
    const ctx = this.initContext();
    if (ctx && ctx.state === 'suspended') {
      return ctx.resume();
    }
    return Promise.resolve();
  }

  /**
   * Initializes the AudioContext with a high-power Loudness Maximizing mastering chain:
   * [Source Oscillators] -> [Tone Gain] -> [Master Gain] -> [Presence EQ Boost @ 2.5kHz] -> [Sub-cut @ 100Hz] -> [DynamicsCompressor] -> Destination
   */
  private initContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    try {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();

          // 1. Master Volume Gain
          this.masterGain = this.ctx.createGain();
          this.masterGain.gain.value = this.volume * 1.25; // 25% extra analog drive

          // 2. High-Pass Filter: Cut muddy sub-100Hz rumble to protect speakers and direct all electrical wattage to audible siren range
          this.highPassFilter = this.ctx.createBiquadFilter();
          this.highPassFilter.type = 'highpass';
          this.highPassFilter.frequency.value = 110;

          // 3. Presence Peaking EQ Filter: Boost 2.5kHz (human ear's peak acoustic sensitivity / ear canal resonance) by +5.5dB!
          this.presenceFilter = this.ctx.createBiquadFilter();
          this.presenceFilter.type = 'peaking';
          this.presenceFilter.frequency.value = 2500;
          this.presenceFilter.Q.value = 1.2;
          this.presenceFilter.gain.value = 5.5;

          // 4. Studio Dynamics Compressor: Aggressive loudness maximizer / limiter
          // Prevents digital clipping while lifting the average RMS acoustic power to the ceiling
          this.compressor = this.ctx.createDynamicsCompressor();
          this.compressor.threshold.value = -6.0; // dB
          this.compressor.knee.value = 3.0;       // dB
          this.compressor.ratio.value = 16.0;     // Aggressive brickwall limiter ratio
          this.compressor.attack.value = 0.002;   // 2ms ultra-fast attack
          this.compressor.release.value = 0.08;   // 80ms snappy release

          // Chain nodes together
          this.masterGain.connect(this.highPassFilter);
          this.highPassFilter.connect(this.presenceFilter);
          this.presenceFilter.connect(this.compressor);
          this.compressor.connect(this.ctx.destination);
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
    } catch {
      // AudioContext handled
    }
    return this.ctx;
  }

  public setVolume(vol: number) {
    // Support up to 2.0 (200% maximum amplified siren overdrive)
    this.volume = Math.max(0, Math.min(2.0, vol));
    if (this.masterGain && this.ctx) {
      // Master gain scales with volume, with extra analog drive up to 1.75x
      const drive = this.volume > 1.0 ? 1.75 : 1.4;
      this.masterGain.gain.setValueAtTime(this.volume * drive, this.ctx.currentTime);
    }
    if (this.currentHtmlAudio) {
      this.currentHtmlAudio.volume = Math.max(0, Math.min(1, Math.min(this.volume, 1.0)));
    }
  }

  public setVolumePercent(pct: number) {
    this.setVolume(pct / 100);
  }

  public getVolumePercent(): number {
    return Math.round(this.volume * 100);
  }

  public isBoosted(): boolean {
    return this.volume > 1.0;
  }

  public toggleVolumeBoost(): number {
    if (this.volume < 1.0) {
      this.setVolume(1.0);
    } else if (this.volume < 1.5) {
      this.setVolume(1.5);
    } else if (this.volume < 2.0) {
      this.setVolume(2.0);
    } else {
      this.setVolume(1.0);
    }
    return this.getVolumePercent();
  }

  public getVolume(): number {
    return this.volume;
  }

  public getCurrentToneType(): string {
    return this.currentToneType;
  }

  public subscribe(cb: (muted: boolean, playing: boolean) => void) {
    this.onStateChangeListeners.push(cb);
    cb(this.isMuted, this.isAlarmPlaying);
    return () => {
      this.onStateChangeListeners = this.onStateChangeListeners.filter(l => l !== cb);
    };
  }

  private notify() {
    this.onStateChangeListeners.forEach(cb => cb(this.isMuted, this.isAlarmPlaying));
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.stopAlarm();
    } else {
      this.resumeContext();
      this.playBeepTest();
    }
    this.notify();
    return this.isMuted;
  }

  public setMute(muted: boolean) {
    this.isMuted = muted;
    if (this.isMuted) {
      this.stopAlarm();
    }
    this.notify();
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public getIsPlaying(): boolean {
    return this.isAlarmPlaying;
  }

  /**
   * HTML5 Audio Fallback & Dual-Blast Player
   * Guaranteed to play even when Web Audio API is restricted by iframe policy
   */
  private playWavFallback(
    toneType: 'CRITICAL_WARBLE' | 'CYCLONE_HORN' | 'FLOOD_SIREN' | 'STANDBY_CHIME' | 'ALL_CLEAR' | 'BEEP',
    loop: boolean = false
  ) {
    if (this.isMuted || typeof window === 'undefined') return;
    try {
      if (!this.wavCache[toneType]) {
        this.wavCache[toneType] = generateWavDataUri(toneType, toneType === 'BEEP' ? 0.6 : 3.5);
      }
      const dataUri = this.wavCache[toneType];
      if (this.currentHtmlAudio) {
        this.currentHtmlAudio.pause();
        this.currentHtmlAudio = null;
      }
      const audio = new Audio(dataUri);
      audio.volume = Math.max(0, Math.min(1, this.volume));
      audio.loop = loop;
      audio.play().catch(err => {
        console.warn('HTML5 Audio playback notice:', err);
      });
      this.currentHtmlAudio = audio;
    } catch (e) {
      console.warn('WAV fallback error:', e);
    }
  }

  /**
   * Play an intense, high-loudness 0.7s Test Beep
   */
  public playBeepTest() {
    if (this.isMuted) return;
    this.resumeContext();
    const ctx = this.initContext();

    // Dual-trigger: HTML5 Audio
    this.playWavFallback('BEEP', false);

    if (ctx && this.masterGain) {
      try {
        const now = ctx.currentTime;
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const toneGain = ctx.createGain();

        osc1.type = 'sawtooth';
        osc1.frequency.setValueAtTime(1000, now);

        osc2.type = 'square';
        osc2.frequency.setValueAtTime(1500, now);

        toneGain.gain.setValueAtTime(1.0, now);
        toneGain.gain.exponentialRampToValueAtTime(0.01, now + 0.65);

        osc1.connect(toneGain);
        osc2.connect(toneGain);
        toneGain.connect(this.masterGain);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.68);
        osc2.stop(now + 0.68);
      } catch {
        // Handled
      }
    }
  }

  /**
   * "VERA MAARI" CRITICAL ALARM:
   * Real EAS (Emergency Alert System) 853Hz + 960Hz dual heterodyne blast + 700Hz-1350Hz screaming air-raid siren sweep!
   */
  public playCriticalAlarm(durationMs: number = 12000) {
    if (this.isMuted) return;
    this.resumeContext();
    this.stopAlarm();
    this.isAlarmPlaying = true;
    this.currentToneType = 'CRITICAL_WARBLE';
    this.notify();

    // Trigger HTML5 Audio player
    this.playWavFallback('CRITICAL_WARBLE', true);

    const ctx = this.initContext();
    if (ctx && this.masterGain) {
      let step = 0;
      const pulse = () => {
        if (!this.isAlarmPlaying || this.isMuted || !this.ctx || !this.masterGain) return;
        try {
          const now = ctx.currentTime;
          
          // Layer 1: EAS 853 Hz square wave
          const oscEAS1 = ctx.createOscillator();
          oscEAS1.type = 'square';
          oscEAS1.frequency.setValueAtTime(853, now);

          // Layer 2: EAS 960 Hz sawtooth wave
          const oscEAS2 = ctx.createOscillator();
          oscEAS2.type = 'sawtooth';
          oscEAS2.frequency.setValueAtTime(960, now);

          // Layer 3: Sweeping Air-Raid Siren (rises from 700Hz to 1350Hz and drops)
          const oscSiren = ctx.createOscillator();
          oscSiren.type = 'sawtooth';
          const isHigh = step % 2 === 0;
          const startF = isHigh ? 750 : 1350;
          const endF = isHigh ? 1350 : 750;
          oscSiren.frequency.setValueAtTime(startF, now);
          oscSiren.frequency.exponentialRampToValueAtTime(endF, now + 0.44);

          // Layer 4: Deep sub-octave rumble for massive acoustic punch
          const oscSub = ctx.createOscillator();
          oscSub.type = 'triangle';
          oscSub.frequency.setValueAtTime(426, now);

          const toneGain = ctx.createGain();
          toneGain.gain.setValueAtTime(0.9, now);
          toneGain.gain.linearRampToValueAtTime(1.0, now + 0.05);
          toneGain.gain.setValueAtTime(0.95, now + 0.38);
          toneGain.gain.exponentialRampToValueAtTime(0.01, now + 0.47);

          oscEAS1.connect(toneGain);
          oscEAS2.connect(toneGain);
          oscSiren.connect(toneGain);
          oscSub.connect(toneGain);

          toneGain.connect(this.masterGain);

          const stopTime = now + 0.48;
          oscEAS1.start(now);
          oscEAS2.start(now);
          oscSiren.start(now);
          oscSub.start(now);

          oscEAS1.stop(stopTime);
          oscEAS2.stop(stopTime);
          oscSiren.stop(stopTime);
          oscSub.stop(stopTime);

          this.activeOscillators.push(oscEAS1, oscEAS2, oscSiren, oscSub);
          oscEAS1.onended = () => {
            this.activeOscillators = this.activeOscillators.filter(
              o => o !== oscEAS1 && o !== oscEAS2 && o !== oscSiren && o !== oscSub
            );
          };
          step++;
        } catch {
          // Handled
        }
      };

      pulse();
      this.alarmInterval = window.setInterval(pulse, 470);
    }

    if (durationMs > 0) {
      window.setTimeout(() => {
        this.stopAlarm();
      }, durationMs);
    }
  }

  /**
   * "VERA MAARI" CYCLONE SUPER-HORN:
   * Thunderous 220Hz + 330Hz + 440Hz maritime storm horn blast with heavy low-end acoustic rumble!
   */
  public playCycloneHorn(durationMs: number = 10000) {
    if (this.isMuted) return;
    this.resumeContext();
    this.stopAlarm();
    this.isAlarmPlaying = true;
    this.currentToneType = 'CYCLONE_HORN';
    this.notify();

    // Trigger HTML5 Audio player
    this.playWavFallback('CYCLONE_HORN', true);

    const ctx = this.initContext();
    if (ctx && this.masterGain) {
      let step = 0;
      const blast = () => {
        if (!this.isAlarmPlaying || this.isMuted || !this.ctx || !this.masterGain) return;
        try {
          const now = ctx.currentTime;
          const oscBass = ctx.createOscillator();
          const oscMid = ctx.createOscillator();
          const oscHigh = ctx.createOscillator();
          const toneGain = ctx.createGain();

          oscBass.type = 'sawtooth';
          oscMid.type = 'square';
          oscHigh.type = 'sawtooth';

          const baseF = step % 2 === 0 ? 220 : 196; // A2 / G2 alternating thunder
          oscBass.frequency.setValueAtTime(baseF, now);
          oscMid.frequency.setValueAtTime(baseF * 1.5, now); // 330Hz (Fifth)
          oscHigh.frequency.setValueAtTime(baseF * 2.0, now); // 440Hz (Octave)

          // Powerful horn attack and heavy sustain
          toneGain.gain.setValueAtTime(0.01, now);
          toneGain.gain.linearRampToValueAtTime(1.0, now + 0.08);
          toneGain.gain.setValueAtTime(0.95, now + 0.7);
          toneGain.gain.exponentialRampToValueAtTime(0.01, now + 0.88);

          oscBass.connect(toneGain);
          oscMid.connect(toneGain);
          oscHigh.connect(toneGain);
          toneGain.connect(this.masterGain);

          const stopTime = now + 0.9;
          oscBass.start(now);
          oscMid.start(now);
          oscHigh.start(now);

          oscBass.stop(stopTime);
          oscMid.stop(stopTime);
          oscHigh.stop(stopTime);

          this.activeOscillators.push(oscBass, oscMid, oscHigh);
          oscBass.onended = () => {
            this.activeOscillators = this.activeOscillators.filter(
              o => o !== oscBass && o !== oscMid && o !== oscHigh
            );
          };
          step++;
        } catch {
          // Handled
        }
      };

      blast();
      this.alarmInterval = window.setInterval(blast, 950);
    }

    if (durationMs > 0) {
      window.setTimeout(() => {
        this.stopAlarm();
      }, durationMs);
    }
  }

  /**
   * "VERA MAARI" DAM / FLOOD ROTARY AIR-RAID SIREN:
   * Authentic dual-rotor 550Hz/660Hz accelerating wail up to 1320Hz!
   */
  public playFloodWarning(durationMs: number = 10000) {
    if (this.isMuted) return;
    this.resumeContext();
    this.stopAlarm();
    this.isAlarmPlaying = true;
    this.currentToneType = 'FLOOD_SIREN';
    this.notify();

    // Trigger HTML5 Audio player
    this.playWavFallback('FLOOD_SIREN', true);

    const ctx = this.initContext();
    if (ctx && this.masterGain) {
      let isRising = true;
      const sweep = () => {
        if (!this.isAlarmPlaying || this.isMuted || !this.ctx || !this.masterGain) return;
        try {
          const now = ctx.currentTime;
          const oscRotor1 = ctx.createOscillator();
          const oscRotor2 = ctx.createOscillator();
          const toneGain = ctx.createGain();

          oscRotor1.type = 'sawtooth';
          oscRotor2.type = 'triangle';

          const fStart = isRising ? 520 : 1250;
          const fEnd = isRising ? 1250 : 520;
          isRising = !isRising;

          oscRotor1.frequency.setValueAtTime(fStart, now);
          oscRotor1.frequency.exponentialRampToValueAtTime(fEnd, now + 0.65);

          // Second rotor port at 1.2x ratio
          oscRotor2.frequency.setValueAtTime(fStart * 1.2, now);
          oscRotor2.frequency.exponentialRampToValueAtTime(fEnd * 1.2, now + 0.65);

          toneGain.gain.setValueAtTime(0.8, now);
          toneGain.gain.linearRampToValueAtTime(1.0, now + 0.05);
          toneGain.gain.setValueAtTime(0.9, now + 0.6);
          toneGain.gain.exponentialRampToValueAtTime(0.01, now + 0.7);

          oscRotor1.connect(toneGain);
          oscRotor2.connect(toneGain);
          toneGain.connect(this.masterGain);

          const stopTime = now + 0.72;
          oscRotor1.start(now);
          oscRotor2.start(now);
          oscRotor1.stop(stopTime);
          oscRotor2.stop(stopTime);

          this.activeOscillators.push(oscRotor1, oscRotor2);
          oscRotor1.onended = () => {
            this.activeOscillators = this.activeOscillators.filter(
              o => o !== oscRotor1 && o !== oscRotor2
            );
          };
        } catch {
          // Handled
        }
      };

      sweep();
      this.alarmInterval = window.setInterval(sweep, 720);
    }

    if (durationMs > 0) {
      window.setTimeout(() => {
        this.stopAlarm();
      }, durationMs);
    }
  }

  /**
   * ALL-CLEAR ascending rescue chord
   */
  public playAllClearTone() {
    if (this.isMuted) return;
    this.resumeContext();
    this.stopAlarm();
    this.playWavFallback('ALL_CLEAR', false);

    const ctx = this.initContext();
    if (!ctx || !this.masterGain) return;

    try {
      const now = ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const toneGain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now + idx * 0.22);

        toneGain.gain.setValueAtTime(0.8, now + idx * 0.22);
        toneGain.gain.linearRampToValueAtTime(1.0, now + idx * 0.22 + 0.04);
        toneGain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.22 + 0.85);

        osc.connect(toneGain);
        toneGain.connect(this.masterGain!);

        osc.start(now + idx * 0.22);
        osc.stop(now + idx * 0.22 + 0.9);
      });
    } catch {
      // Handled
    }
  }

  /**
   * Tactical high alert chime
   */
  public playHighChime() {
    if (this.isMuted) return;
    this.resumeContext();
    this.playWavFallback('STANDBY_CHIME', false);

    const ctx = this.initContext();
    if (!ctx || !this.masterGain) return;

    try {
      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const toneGain = ctx.createGain();

      osc1.type = 'sawtooth';
      osc2.type = 'square';
      osc1.frequency.setValueAtTime(784.0, now);
      osc2.frequency.setValueAtTime(1046.5, now + 0.16);

      toneGain.gain.setValueAtTime(0.85, now);
      toneGain.gain.linearRampToValueAtTime(1.0, now + 0.04);
      toneGain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

      osc1.connect(toneGain);
      osc2.connect(toneGain);
      toneGain.connect(this.masterGain);

      osc1.start(now);
      osc1.stop(now + 0.22);
      osc2.start(now + 0.16);
      osc2.stop(now + 0.72);
    } catch {
      // Handled
    }
  }

  /**
   * Play tone by generic name
   */
  public playTone(
    type: 'CRITICAL_WARBLE' | 'CYCLONE_HORN' | 'FLOOD_SIREN' | 'STANDBY_CHIME' | 'ALL_CLEAR',
    durationMs: number = 8000
  ) {
    this.resumeContext();
    switch (type) {
      case 'CRITICAL_WARBLE':
        this.playCriticalAlarm(durationMs);
        break;
      case 'CYCLONE_HORN':
        this.playCycloneHorn(durationMs);
        break;
      case 'FLOOD_SIREN':
        this.playFloodWarning(durationMs);
        break;
      case 'STANDBY_CHIME':
        this.playHighChime();
        break;
      case 'ALL_CLEAR':
        this.playAllClearTone();
        break;
      default:
        this.playCriticalAlarm(durationMs);
    }
  }

  /**
   * Browser Speech Synthesis for bilingual public emergency broadcast
   */
  public speakAnnouncement(text: string, lang: 'ta-IN' | 'en-IN' | 'en-US' = 'ta-IN') {
    if (this.isMuted || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      window.speechSynthesis.resume();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = 0.95;
      utterance.pitch = 1.05;
      utterance.volume = 1.0; // Max speech volume

      // Fix chrome speech synthesis GC bug
      (window as unknown as { _latestUtterance: SpeechSynthesisUtterance })._latestUtterance = utterance;

      window.speechSynthesis.speak(utterance);
    } catch {
      // speech fallback
    }
  }

  /**
   * Stop active alarm siren
   */
  public stopAlarm() {
    this.isAlarmPlaying = false;
    if (this.alarmInterval !== null) {
      clearInterval(this.alarmInterval);
      this.alarmInterval = null;
    }
    if (this.currentHtmlAudio) {
      this.currentHtmlAudio.pause();
      this.currentHtmlAudio.currentTime = 0;
      this.currentHtmlAudio = null;
    }
    this.activeOscillators.forEach(osc => {
      try {
        osc.stop();
      } catch {
        // Handled
      }
    });
    this.activeOscillators = [];
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // Handled
      }
    }
    this.notify();
  }

  public playSiren(durationMs: number = 5000) {
    this.playCriticalAlarm(durationMs);
  }

  public stop() {
    this.stopAlarm();
  }

  public playNotificationChime() {
    this.playHighChime();
  }

  private phoneRingInterval: number | null = null;

  /**
   * Authentic Dual-Tone Multi-Frequency (DTMF) keypad generator
   */
  public playDtmf(digit: string, durationMs: number = 140) {
    if (this.isMuted) return;
    this.resumeContext();
    const ctx = this.initContext();
    if (!ctx || !this.masterGain) return;

    // DTMF Frequencies (Row x Column)
    const dtmfMap: Record<string, [number, number]> = {
      '1': [697, 1209],
      '2': [697, 1336],
      '3': [697, 1477],
      '4': [770, 1209],
      '5': [770, 1336],
      '6': [770, 1477],
      '7': [852, 1209],
      '8': [852, 1336],
      '9': [852, 1477],
      '*': [941, 1209],
      '0': [941, 1336],
      '#': [941, 1477]
    };

    const freqs = dtmfMap[digit] || [697, 1336];

    try {
      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const toneGain = ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'sine';
      osc1.frequency.setValueAtTime(freqs[0], now);
      osc2.frequency.setValueAtTime(freqs[1], now);

      toneGain.gain.setValueAtTime(0.01, now);
      toneGain.gain.linearRampToValueAtTime(0.45, now + 0.01);
      toneGain.gain.setValueAtTime(0.4, now + (durationMs / 1000) - 0.02);
      toneGain.gain.exponentialRampToValueAtTime(0.001, now + (durationMs / 1000));

      osc1.connect(toneGain);
      osc2.connect(toneGain);
      toneGain.connect(this.masterGain);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + durationMs / 1000);
      osc2.stop(now + durationMs / 1000);
    } catch {
      // Handled
    }
  }

  /**
   * Realistic Telephone Ringback Generator (400Hz + 450Hz Cadence)
   */
  public startPhoneRingTone() {
    if (this.isMuted) return;
    this.stopPhoneRingTone();
    this.resumeContext();

    const ringPulse = () => {
      const ctx = this.initContext();
      if (!ctx || !this.masterGain) return;
      try {
        const now = ctx.currentTime;
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const toneGain = ctx.createGain();

        osc1.type = 'sine';
        osc2.type = 'sine';
        osc1.frequency.setValueAtTime(400, now);
        osc2.frequency.setValueAtTime(450, now);

        // Standard 0.4s ring - 0.2s gap - 0.4s ring
        toneGain.gain.setValueAtTime(0.001, now);
        toneGain.gain.linearRampToValueAtTime(0.35, now + 0.02);
        toneGain.gain.setValueAtTime(0.35, now + 0.38);
        toneGain.gain.linearRampToValueAtTime(0.001, now + 0.4);

        toneGain.gain.setValueAtTime(0.001, now + 0.6);
        toneGain.gain.linearRampToValueAtTime(0.35, now + 0.62);
        toneGain.gain.setValueAtTime(0.35, now + 1.0);
        toneGain.gain.linearRampToValueAtTime(0.001, now + 1.02);

        osc1.connect(toneGain);
        osc2.connect(toneGain);
        toneGain.connect(this.masterGain);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 1.05);
        osc2.stop(now + 1.05);
      } catch {
        // Handled
      }
    };

    ringPulse();
    this.phoneRingInterval = window.setInterval(ringPulse, 2600);
  }

  public stopPhoneRingTone() {
    if (this.phoneRingInterval !== null) {
      clearInterval(this.phoneRingInterval);
      this.phoneRingInterval = null;
    }
  }

  /**
   * Tactical VHF Radio Roger / Squelch Chirp (1750Hz chirp + noise burst)
   */
  public playRadioChirp(isKeyRelease: boolean = false) {
    if (this.isMuted) return;
    this.resumeContext();
    const ctx = this.initContext();
    if (!ctx || !this.masterGain) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const toneGain = ctx.createGain();

      osc.type = isKeyRelease ? 'sawtooth' : 'triangle';
      osc.frequency.setValueAtTime(isKeyRelease ? 1750 : 920, now);
      osc.frequency.exponentialRampToValueAtTime(isKeyRelease ? 1200 : 1600, now + 0.08);

      toneGain.gain.setValueAtTime(0.01, now);
      toneGain.gain.linearRampToValueAtTime(0.4, now + 0.01);
      toneGain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

      osc.connect(toneGain);
      toneGain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.1);
    } catch {
      // Handled
    }
  }
}

export const emergencyAudio = new EmergencyAudioManager();

