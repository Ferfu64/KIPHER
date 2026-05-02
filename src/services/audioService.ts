import { UserProfile } from '../types';

/**
 * Tactical Audio Service
 * Uses Web Audio API to synthesize sci-fi UI sounds dynamically.
 * Zero external assets required.
 */

class TacticalAudioService {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isMuted: boolean = false;
  private ambientDrone: OscillatorNode | null = null;

  init() {
    if (this.ctx) return;
    this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    this.masterGain = this.ctx.createGain();
    this.masterGain.connect(this.ctx.destination);
    this.masterGain.gain.value = 0.2; // Default low volume
  }

  setMute(mute: boolean) {
    this.isMuted = mute;
    if (this.masterGain) {
      this.masterGain.gain.setValueAtTime(mute ? 0 : 0.2, this.ctx!.currentTime);
    }
  }

  toggleMute() {
    this.setMute(!this.isMuted);
    return this.isMuted;
  }

  getMuteStatus() {
    return this.isMuted;
  }

  // UI Sound: Short high-pitched "blip"
  playBlip() {
    if (!this.ctx || this.isMuted) return;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    
    osc.type = 'square';
    osc.frequency.setValueAtTime(880, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(440, this.ctx.currentTime + 0.1);
    
    g.gain.setValueAtTime(0.1, this.ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);
    
    osc.connect(g);
    g.connect(this.masterGain!);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.1);
  }

  // UI Sound: Deeper success "ping"
  playSuccess() {
    if (!this.ctx || this.isMuted) return;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(440, this.ctx.currentTime + 0.2);
    
    g.gain.setValueAtTime(0.2, this.ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.3);
    
    osc.connect(g);
    g.connect(this.masterGain!);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.3);
  }

  // UI Sound: Access denied "buzz"
  playError() {
    if (!this.ctx || this.isMuted) return;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(110, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(55, this.ctx.currentTime + 0.2);
    
    g.gain.setValueAtTime(0.1, this.ctx.currentTime);
    g.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.2);
    
    osc.connect(g);
    g.connect(this.masterGain!);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.2);
  }

  playNotification() {
    if (!this.ctx || this.isMuted) return;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const g = this.ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(660, this.ctx.currentTime);
    osc1.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.1);

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(440, this.ctx.currentTime + 0.1);
    osc2.frequency.exponentialRampToValueAtTime(660, this.ctx.currentTime + 0.2);

    g.gain.setValueAtTime(0.1, this.ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.4);

    osc1.connect(g);
    osc2.connect(g);
    g.connect(this.masterGain!);

    osc1.start();
    osc1.stop(this.ctx.currentTime + 0.1);
    osc2.start(this.ctx.currentTime + 0.1);
    osc2.stop(this.ctx.currentTime + 0.3);
  }

  // Ambient: Low background "ghost" drone
  startAmbient() {
    if (!this.ctx || this.isMuted || this.ambientDrone) return;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(40, this.ctx.currentTime);
    
    g.gain.setValueAtTime(0, this.ctx.currentTime);
    g.gain.linearRampToValueAtTime(0.05, this.ctx.currentTime + 2);
    
    osc.connect(g);
    g.connect(this.masterGain!);
    
    osc.start();
    this.ambientDrone = osc;
  }

  stopAmbient() {
    if (this.ambientDrone && this.ctx) {
      this.ambientDrone.stop();
      this.ambientDrone = null;
    }
  }

  playCelestialSymphony() {
     if (!this.ctx || this.isMuted) return;
     const now = this.ctx.currentTime;
     
     // Series of ethereal rising tones
     [261.63, 329.63, 392.00, 523.25, 659.25, 783.99].forEach((freq, i) => {
        const osc = this.ctx!.createOscillator();
        const g = this.ctx!.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.4);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.5, now + i * 0.4 + 1);
        
        g.gain.setValueAtTime(0, now + i * 0.4);
        g.gain.linearRampToValueAtTime(0.05, now + i * 0.4 + 0.2);
        g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.4 + 2);
        
        osc.connect(g);
        g.connect(this.masterGain!);
        
        osc.start(now + i * 0.4);
        osc.stop(now + i * 0.4 + 2.5);
     });
  }

  setVolume(value: number) {
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(value, this.ctx.currentTime, 0.1);
    }
  }

  getVolume() {
    return this.masterGain ? this.masterGain.gain.value : 0;
  }

  ensureMinVolume(min: number) {
    if (this.masterGain && this.ctx && !this.isMuted) {
      const current = this.masterGain.gain.value;
      if (current < min) {
        this.masterGain.gain.setTargetAtTime(min, this.ctx.currentTime, 0.1);
      }
    }
  }
}

export const audioService = new TacticalAudioService();
