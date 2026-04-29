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
}

export const audioService = new TacticalAudioService();
