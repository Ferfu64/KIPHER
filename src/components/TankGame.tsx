import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crosshair, Shield, Zap, Target, AlertTriangle, Trophy, RotateCcw } from 'lucide-react';
import { audioService } from '../services/audioService';

interface TankGameProps {
  onBack: () => void;
  onCreditsEarned: (cr: number, wave: number) => void;
}

interface GameObject {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
}

interface Tank extends GameObject {
  hp: number;
  maxHp: number;
  speed: number;
  turnSpeed: number;
  lastShot: number;
  fireRate: number;
  color: string;
  name: string;
  isBoss?: boolean;
  weaponType?: 'NORMAL' | 'TRIPLE' | 'BEAM';
  mode?: 'RANGED' | 'MELEE';
}

interface Bullet extends GameObject {
  vx: number;
  vy: number;
  damage: number;
  owner: 'PLAYER' | 'ENEMY';
  type?: 'NORMAL' | 'BEAM';
}

interface PowerUp extends GameObject {
  type: 'HEALTH' | 'TRIPLE_SHOT' | 'SHIELD' | 'SPEED';
  life: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

export default function TankGame({ onBack, onCreditsEarned }: TankGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<'START' | 'PLAYING' | 'GAMEOVER' | 'CUTSCENE' | 'BOSS_DODGE'>('START');
  const [score, setScore] = useState(0);
  const [wave, setWave] = useState(1);
  const [highScore, setHighScore] = useState(0); 
  const [cutsceneText, setCutsceneText] = useState('');
  const [activePowerUp, setActivePowerUp] = useState<string | null>(null);
  const [ultCharge, setUltCharge] = useState(0);

  // Keys state
  const keys = useRef<Record<string, boolean>>({});

  // Level tracking
  const enemiesToSpawn = useRef(0);
  const totalEnemiesInLevel = useRef(0);
  const enemiesKilledInLevel = useRef(0);

  // Game references
  const player = useRef<Tank>({
    x: 400, y: 300, width: 40, height: 40, rotation: 0,
    hp: 100, maxHp: 100, speed: 3, turnSpeed: 0.05,
    lastShot: 0, fireRate: 300, color: '#22d3ee', name: 'PLAYER',
    weaponType: 'NORMAL'
  });

  const enemies = useRef<Tank[]>([]);
  const bullets = useRef<Bullet[]>([]);
  const particles = useRef<Particle[]>([]);
  const powerUps = useRef<PowerUp[]>([]);
  const frameId = useRef<number>(0);
  const bossActive = useRef<boolean>(false);

  const hitEnemy = (e: Tank, eIdx: number, damage: number, x: number, y: number) => {
    if (Math.hypot(x - e.x, y - e.y) < e.width / 2 + 10) {
        e.hp -= damage;
        createParticles(x, y, e.color, 10);
        if (e.hp <= 0) {
          enemiesKilledInLevel.current++;
          if (e.isBoss) {
            bossActive.current = false;
            triggerCutscene("BOSS_UNIT_DECOMMISSIONED");
          }
          enemies.current.splice(eIdx, 1);
          
          if (enemies.current.length === 0 && enemiesToSpawn.current === 0) {
            triggerCutscene("SECTOR_STABILIZED");
          }

          setScore(s => {
            const newScore = s + (e.isBoss ? 5000 : 100);
            if (newScore > highScore) {
              setHighScore(newScore);
            }
            return newScore;
          });
          audioService.playSuccess();
          createParticles(e.x, e.y, e.color, e.isBoss ? 100 : 30, 5);
          return true;
        }
    }
    return false;
  };

  const triggerCutscene = (text: string, duration: number = 2000) => {
    setGameState('CUTSCENE');
    setCutsceneText(text);
    audioService.playSuccess();
    setTimeout(() => {
      setGameState('PLAYING');
    }, duration);
  };

  const spawnPowerUp = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const types: PowerUp['type'][] = ['HEALTH', 'TRIPLE_SHOT', 'SHIELD', 'SPEED'];
    powerUps.current.push({
      x: Math.random() * (canvas.width - 100) + 50,
      y: Math.random() * (canvas.height - 100) + 50,
      width: 25, height: 25, rotation: 0,
      type: types[Math.floor(Math.random() * types.length)],
      life: 500
    });
  };

  const startLevel = (levelNumber: number) => {
    setWave(levelNumber);
    enemiesKilledInLevel.current = 0;
    bossActive.current = false;
    enemies.current = [];
    bullets.current = [];
    powerUps.current = [];

    if (levelNumber % 5 === 0) {
      // Boss level
      enemiesToSpawn.current = 1; 
      totalEnemiesInLevel.current = 1;
      setUltCharge(0);
      spawnBoss();
    } else {
      // Normal level
      const count = 5 + (levelNumber * 2);
      enemiesToSpawn.current = count;
      totalEnemiesInLevel.current = count;
      triggerCutscene(`WAVE ${levelNumber}: ENGAGE`);
    }
    onCreditsEarned(levelNumber * 10, levelNumber);
  };

  const spawnBoss = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    bossActive.current = true;
    triggerCutscene("GIGANT_CLASS_HOSTILE_DETECTED");
    
    enemies.current.push({
      x: canvas.width / 2, y: -100, width: 120, height: 120, rotation: Math.PI / 2,
      hp: 500 + wave * 250, maxHp: 500 + wave * 250, speed: 0.6,
      turnSpeed: 0.012, lastShot: 0, fireRate: 900, color: '#facc15', name: 'BOSS',
      isBoss: true
    });
    enemiesToSpawn.current = 0;
  };

  const spawnEnemy = () => {
    if (bossActive.current || enemiesToSpawn.current <= 0) return;
    const side = Math.floor(Math.random() * 4);
    let x = 0, y = 0;
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (side === 0) { x = Math.random() * canvas.width; y = -50; }
    else if (side === 1) { x = canvas.width + 50; y = Math.random() * canvas.height; }
    else if (side === 2) { x = Math.random() * canvas.width; y = canvas.height + 50; }
    else { x = -50; y = Math.random() * canvas.height; }

    const enemyType = Math.floor(wave / 5);
    let hp = 15 + wave * 5;
    let speed = 0.8 + Math.random() * 1;
    let color = '#ef4444';
    let name = 'ENEMY';
    let fireRate = 2500 - (wave * 50);

    if (enemyType === 1) { // Scout
       hp *= 0.6; speed *= 2.5; color = '#facc15'; fireRate *= 1.5;
    } else if (enemyType === 2) { // Armored
       hp *= 3; speed *= 0.5; color = '#4b5563'; fireRate *= 0.8;
    } else if (enemyType >= 3) { // Elite
       hp *= 2; speed *= 1.5; color = '#7c3aed'; fireRate *= 0.5;
    }

    enemies.current.push({
      x, y, width: 35, height: 35, rotation: 0,
      hp, maxHp: hp, speed,
      turnSpeed: 0.02 + (wave * 0.001), lastShot: 0, fireRate, color, name
    });
    enemiesToSpawn.current--;
  };

  const createParticles = (x: number, y: number, color: string, count: number, speed: number = 3) => {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const s = Math.random() * speed;
      particles.current.push({
        x, y,
        vx: Math.cos(angle) * s,
        vy: Math.sin(angle) * s,
        life: 1, maxLife: 1,
        color,
        size: Math.random() * 3 + 1
      });
    }
  };

  const resetGame = () => {
    player.current = {
      x: 400, y: 300, width: 40, height: 40, rotation: 0,
      hp: 300, maxHp: 300, speed: 4, turnSpeed: 0.08,
      lastShot: 0, fireRate: 200, color: '#22d3ee', name: 'PLAYER',
      weaponType: 'NORMAL', mode: 'RANGED'
    };
    enemies.current = [];
    bullets.current = [];
    particles.current = [];
    powerUps.current = [];
    bossActive.current = false;
    setScore(0);
    setGameState('PLAYING');
    startLevel(1);
    audioService.playSuccess();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => keys.current[e.code] = true;
    const handleKeyUp = (e: KeyboardEvent) => delete keys.current[e.code];
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      cancelAnimationFrame(frameId.current);
    };
  }, []);

  const gameLoop = () => {
    const canvas = canvasRef.current;
    if (!canvas || (gameState !== 'PLAYING' && gameState !== 'CUTSCENE' && gameState !== 'BOSS_DODGE')) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = gameState === 'BOSS_DODGE' ? '#0f172a' : '#020617';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grid effect
    ctx.strokeStyle = gameState === 'BOSS_DODGE' ? 'rgba(239, 68, 68, 0.05)' : 'rgba(34, 211, 238, 0.03)';
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 50) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 50) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
    }

    if (gameState === 'BOSS_DODGE') {
       // Draw the "Bar" the player is stuck behind
       ctx.strokeStyle = '#334155';
       ctx.lineWidth = 4;
       ctx.beginPath();
       ctx.moveTo(0, canvas.height - 100);
       ctx.lineTo(canvas.width, canvas.height - 100);
       ctx.stroke();
       
       ctx.fillStyle = 'rgba(239, 68, 68, 0.1)';
       ctx.fillRect(0, 0, canvas.width, canvas.height - 100);
    }

    if (gameState === 'CUTSCENE') {
      // Draw static/paused elements in sepia or dimmed
    }

    // Player Movement
    const p = player.current;
    
    // Mode Switch (Disabled in dodge phase)
    if (gameState !== 'BOSS_DODGE' && (keys.current['ShiftLeft'] || keys.current['ShiftRight'])) {
      const now = Date.now();
      if (!p.lastShot || now - p.lastShot > 500) {
        p.mode = p.mode === 'RANGED' ? 'MELEE' : 'RANGED';
        p.speed = p.mode === 'MELEE' ? 7 : 4;
        p.lastShot = now;
        audioService.playSuccess();
        triggerCutscene(p.mode === 'MELEE' ? "BERSERKER_MODE_ACTIVE" : "RANGED_SYSTEMS_ONLINE", 1000);
      }
    }

    if (gameState === 'PLAYING') {
      if (keys.current['KeyW'] || keys.current['ArrowUp']) {
        p.x += Math.cos(p.rotation) * p.speed;
        p.y += Math.sin(p.rotation) * p.speed;
      }
      if (keys.current['KeyS'] || keys.current['ArrowDown']) {
        p.x -= Math.cos(p.rotation) * p.speed;
        p.y -= Math.sin(p.rotation) * p.speed;
      }
      if (keys.current['KeyA'] || keys.current['ArrowLeft']) {
        p.rotation -= p.turnSpeed;
      }
      if (keys.current['KeyD'] || keys.current['ArrowRight']) {
        p.rotation += p.turnSpeed;
      }

      // Special Action / Shooting
      const now = Date.now();
      if (keys.current['Space'] && now - p.lastShot > p.fireRate) {
        if (p.mode === 'RANGED') {
          if (p.weaponType === 'TRIPLE') {
            for (let i = -1; i <= 1; i++) {
              const angle = p.rotation + i * 0.2;
              bullets.current.push({
                x: p.x + Math.cos(angle) * 25,
                y: p.y + Math.sin(angle) * 25,
                width: 6, height: 6, rotation: angle,
                vx: Math.cos(angle) * 8,
                vy: Math.sin(angle) * 8,
                damage: 15 + (wave * 2), owner: 'PLAYER'
              });
            }
          } else {
            bullets.current.push({
              x: p.x + Math.cos(p.rotation) * 25,
              y: p.y + Math.sin(p.rotation) * 25,
              width: 6, height: 6, rotation: p.rotation,
              vx: Math.cos(p.rotation) * 7,
              vy: Math.sin(p.rotation) * 7,
              damage: 20 + (wave * 3), owner: 'PLAYER'
            });
          }
          p.lastShot = now;
          audioService.playBlip();
          createParticles(p.x + Math.cos(p.rotation) * 25, p.y + Math.sin(p.rotation) * 25, '#22d3ee', 5, 1);
        } else if (p.mode === 'MELEE') {
          // Shockwave Burst
          triggerCutscene("SHOCKWAVE_DISCHARGED", 800);
          audioService.playSuccess();
          createParticles(p.x, p.y, '#ef4444', 40, 8);
          enemies.current.forEach((e, eIdx) => {
            const dist = Math.hypot(p.x - e.x, p.y - e.y);
            if (dist < 150) {
              hitEnemy(e, eIdx, 100 + (wave * 10), e.x, e.y);
              // Blast back
              const angle = Math.atan2(e.y - p.y, e.x - p.x);
              e.x += Math.cos(angle) * 60;
              e.y += Math.sin(angle) * 60;
            }
          });
          p.lastShot = now + 600; // Ability cooldown
        }
      }
    } else if (gameState === 'BOSS_DODGE') {
       // Restricted movement
       p.y = canvas.height - 50;
       p.rotation = -Math.PI / 2;
       if (keys.current['KeyA'] || keys.current['ArrowLeft']) p.x -= p.speed * 2;
       if (keys.current['KeyD'] || keys.current['ArrowRight']) p.x += p.speed * 2;
       
       // Passively fill Ult
       setUltCharge(prev => {
         const next = Math.min(100, prev + 0.1);
         if (next >= 100 && prev < 100) {
            triggerCutscene("ULTIMATE_CHARGE_MAXIMIZED", 1500);
         }
         return next;
       });

       if (ultCharge >= 100 && keys.current['Space']) {
          performUltimate();
       }
    }

    // Keep player in bounds
    p.x = Math.max(20, Math.min(canvas.width - 20, p.x));
    p.y = Math.max(20, Math.min(canvas.height - 20, p.y));

    // Update Bullets
    bullets.current = bullets.current.filter(b => {
      b.x += b.vx;
      b.y += b.vy;

      // Draw bullet
      ctx.fillStyle = b.owner === 'PLAYER' ? '#22d3ee' : '#ef4444';
      ctx.shadowBlur = 15;
      ctx.shadowColor = ctx.fillStyle;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.type === 'BEAM' ? 8 : 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      return b.x > -100 && b.x < canvas.width + 100 && b.y > -100 && b.y < canvas.height + 100;
    });

    // Spawn Logic
    if (gameState === 'PLAYING') {
      if (enemies.current.length === 0 && enemiesToSpawn.current === 0) {
        // Level logic handled here instead of spawnEnemy returning boolean
        const nextWave = wave + 1;
        startLevel(nextWave);
      }
      
      if (enemies.current.length < 3 && enemiesToSpawn.current > 0 && !bossActive.current) {
        spawnEnemy();
      }

      if (Math.random() < 0.002) {
        spawnPowerUp();
      }
    }

    // Power Ups
    powerUps.current = powerUps.current.filter(pw => {
      pw.life--;
      ctx.save();
      ctx.translate(pw.x, pw.y);
      ctx.rotate(Date.now() / 500);
      ctx.strokeStyle = '#22d3ee';
      ctx.lineWidth = 2;
      ctx.strokeRect(-12, -12, 24, 24);
      
      ctx.fillStyle = '#22d3ee';
      ctx.font = '10px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(pw.type[0], 0, 4);
      ctx.restore();

      const dist = Math.hypot(p.x - pw.x, p.y - pw.y);
      if (dist < 30) {
        audioService.playSuccess();
        triggerCutscene(`${pw.type}_ACQUIRED`, 1000);
        if (pw.type === 'HEALTH') p.hp = Math.min(p.hp + 50, p.maxHp);
        if (pw.type === 'TRIPLE_SHOT') {
          p.weaponType = 'TRIPLE';
          setTimeout(() => p.weaponType = 'NORMAL', 10000);
        }
        if (pw.type === 'SPEED') {
          p.speed = 6;
          setTimeout(() => p.speed = 3, 10000);
        }
        if (pw.type === 'SHIELD') {
           // Shield logic could be added to hp check
        }
        return false;
      }
      return pw.life > 0;
    });

    enemies.current.forEach((e, index) => {
      if (gameState === 'BOSS_DODGE' && e.isBoss) {
         e.x = canvas.width / 2;
         e.y = 100;
         e.rotation = Math.PI / 2;
         
         const now = Date.now();
         if (now - e.lastShot > 150) { // Hyper fire
            const spread = Math.sin(now / 500) * Math.PI;
            bullets.current.push({
              x: e.x + Math.cos(spread) * 100,
              y: e.y + Math.sin(spread) * 100,
              width: 12, height: 12, rotation: spread,
              vx: Math.cos(spread) * 6,
              vy: Math.sin(spread) * 6,
              damage: 20, owner: 'ENEMY'
            });
            e.lastShot = now;
         }
      } else {
        // AI behavior
        const angle = Math.atan2(p.y - e.y, p.x - e.x);
        let diff = angle - e.rotation;
        while (diff < -Math.PI) diff += Math.PI * 2;
        while (diff > Math.PI) diff -= Math.PI * 2;
        e.rotation += diff * e.turnSpeed;

        const dist = Math.hypot(p.x - e.x, p.y - e.y);
        if (e.isBoss) {
          if (dist > 300) {
            e.x += Math.cos(e.rotation) * e.speed;
            e.y += Math.sin(e.rotation) * e.speed;
          }
          // Boss specialized shooting
          const now = Date.now();
          if (now - e.lastShot > e.fireRate) {
            for (let i = -2; i <= 2; i++) {
              const spread = e.rotation + i * 0.3;
              bullets.current.push({
                x: e.x + Math.cos(spread) * 60,
                y: e.y + Math.sin(spread) * 60,
                width: 10, height: 10, rotation: spread,
                vx: Math.cos(spread) * 4,
                vy: Math.sin(spread) * 4,
                damage: 15 + wave * 5, owner: 'ENEMY'
              });
            }
            e.lastShot = now;
          }

          // Trigger Dodge Phase
          if (e.hp < e.maxHp / 2 && gameState !== 'BOSS_DODGE') {
             setGameState('BOSS_DODGE');
             triggerCutscene("BOSS_ENTERING_OVERDRIVE_PHASE", 2000);
          }
        } else {
          if (dist > 150) {
            e.x += Math.cos(e.rotation) * e.speed;
            e.y += Math.sin(e.rotation) * e.speed;
          }
          const now = Date.now();
          if (dist < 400 && now - e.lastShot > e.fireRate) {
            bullets.current.push({
              x: e.x + Math.cos(e.rotation) * 20,
              y: e.y + Math.sin(e.rotation) * 20,
              width: 6, height: 6, rotation: e.rotation,
              vx: Math.cos(e.rotation) * 5,
              vy: Math.sin(e.rotation) * 5,
              damage: 10 + wave * 2, owner: 'ENEMY'
            });
            e.lastShot = now;
          }
        }
      }

      // Draw Enemy
      ctx.save();
      ctx.translate(e.x, e.y);
      ctx.rotate(e.rotation);
      ctx.fillStyle = e.color;
      if (e.isBoss) {
        ctx.fillRect(-60, -60, 120, 120);
        ctx.fillStyle = '#991b1b';
        ctx.fillRect(0, -15, 80, 30);
      } else {
        ctx.fillRect(-17, -17, 34, 34);
        ctx.fillStyle = '#991b1b';
        ctx.fillRect(0, -4, 25, 8);
      }
      ctx.restore();

      // HP Bar
      ctx.fillStyle = '#450a0a';
      ctx.fillRect(e.x - e.width/2, e.y - e.height/2 - 15, e.width, 6);
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(e.x - e.width/2, e.y - e.height/2 - 15, (e.hp / e.maxHp) * e.width, 6);
    });

    // Collision Detection
    bullets.current.forEach((b, bIdx) => {
      if (b.owner === 'PLAYER') {
        enemies.current.forEach((e, eIdx) => {
          if (hitEnemy(e, eIdx, b.damage, b.x, b.y)) {
             bullets.current.splice(bIdx, 1);
          }
        });
      } else {
        if (Math.hypot(b.x - p.x, b.y - p.y) < 25) {
          p.hp -= b.damage;
          bullets.current.splice(bIdx, 1);
          audioService.playError();
          createParticles(b.x, b.y, '#f97316', 15);
          if (p.hp <= 0) {
             setGameState('GAMEOVER');
             createParticles(p.x, p.y, p.color, 50, 10);
          }
        }
      }
    });

    // Melee Ramming Collision
    if (p.mode === 'MELEE') {
      enemies.current.forEach((e, eIdx) => {
        if (Math.hypot(p.x - e.x, p.y - e.y) < 40) {
          hitEnemy(e, eIdx, 100, e.x, e.y);
          p.hp = Math.min(p.hp + 2, p.maxHp); // Lifesteal in melee
        }
      });
    }

    // Draw Player
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation);
    ctx.shadowBlur = 20;
    ctx.shadowColor = p.mode === 'MELEE' ? '#ef4444' : p.color;
    ctx.fillStyle = p.mode === 'MELEE' ? '#ef4444' : p.color;
    
    if (p.mode === 'MELEE') {
      // Melee Tank Look (Spiky)
      ctx.fillRect(-22, -22, 44, 44);
      ctx.fillStyle = '#7f1d1d';
      ctx.beginPath();
      ctx.moveTo(20, -20); ctx.lineTo(40, 0); ctx.lineTo(20, 20);
      ctx.fill();
    } else {
      ctx.fillRect(-20, -20, 40, 40);
      ctx.fillStyle = '#155e75';
      ctx.fillRect(0, -6, 30, 12);
    }
    ctx.restore();

    // Update Particles
    particles.current = particles.current.filter(part => {
      part.x += part.vx;
      part.y += part.vy;
      part.life -= 0.02;
      ctx.fillStyle = part.color;
      ctx.globalAlpha = part.life;
      ctx.fillRect(part.x, part.y, part.size, part.size);
      ctx.globalAlpha = 1.0;
      return part.life > 0;
    });

    frameId.current = requestAnimationFrame(gameLoop);
  };

  const performUltimate = () => {
    setGameState('CUTSCENE');
    setCutsceneText("ULTIMATE_SMASH_INITIATED");
    audioService.playSuccess();
    
    setTimeout(() => {
      const b = enemies.current.find(e => e.isBoss);
      if (b) {
        createParticles(b.x, b.y, '#ffffff', 200, 15);
        createParticles(b.x, b.y, '#facc15', 100, 10);
        hitEnemy(b, enemies.current.indexOf(b), 9999, b.x, b.y);
      }
      setUltCharge(0);
      setGameState('PLAYING');
    }, 2000);
  };

  useEffect(() => {
    if (gameState === 'PLAYING' || gameState === 'BOSS_DODGE') {
      frameId.current = requestAnimationFrame(gameLoop);
    }
    return () => cancelAnimationFrame(frameId.current);
  }, [gameState]);

  return (
    <div className="fixed inset-0 z-[200] bg-slate-950 flex flex-col font-mono overflow-hidden">
      {/* Header HUD */}
      <div className="bg-slate-900/50 border-b border-tactical-cyan/20 p-4 flex justify-between items-center backdrop-blur-md">
        <div className="flex items-center gap-6">
          <button onClick={onBack} className="text-slate-500 hover:text-white transition-colors">
            <Shield size={20} />
          </button>
          <div className="flex flex-col">
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none">System_Link</span>
            <span className="text-sm font-black text-white uppercase tracking-tighter">Armored_Core:Grid</span>
          </div>
        </div>

        <div className="flex items-center gap-12">
          <div className="flex flex-col items-center">
             <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">SCORE</span>
             <span className="text-xl font-black text-tactical-cyan tabular-nums leading-none tracking-tighter">
                {score.toString().padStart(6, '0')}
             </span>
          </div>
          <div className="flex flex-col items-center">
             <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">LEVEL</span>
             <span className="text-xl font-black text-white leading-none">
                {wave}
             </span>
          </div>
          <div className="flex flex-col items-center">
             <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">INTEL_CLEARED</span>
             <span className="text-sm font-black text-tactical-cyan tabular-nums leading-none">
                {enemiesKilledInLevel.current} / {totalEnemiesInLevel.current}
             </span>
          </div>
          <div className="flex flex-col items-center">
             <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">HIGHSCORE</span>
             <span className="text-sm font-black text-slate-400 tabular-nums leading-none">
                {highScore.toString().padStart(6, '0')}
             </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end">
              <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">ULTIMATE_CHARGE</span>
              <div className="w-48 h-2 bg-slate-800 border border-slate-700 p-0.5">
                 <motion.div 
                    initial={false}
                    animate={{ width: `${ultCharge}%` }}
                    className={`h-full ${ultCharge >= 100 ? 'bg-yellow-400 animate-pulse' : 'bg-tactical-cyan/40'}`}
                 />
              </div>
           </div>
           <div className="flex flex-col items-end">
              <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">HULL_INTEGRITY</span>
              <div className="w-48 h-2 bg-slate-800 border border-slate-700 p-0.5">
                 <motion.div 
                    initial={false}
                    animate={{ width: `${player.current.hp}%` }}
                    className={`h-full ${player.current.hp > 30 ? 'bg-tactical-cyan' : 'bg-red-500'} shadow-[0_0_10px_rgba(34,211,238,0.5)]`}
                 />
              </div>
           </div>
        </div>
      </div>

      {/* Game Stage */}
      <div className="flex-1 relative bg-slate-950 flex items-center justify-center overflow-hidden">
        <canvas 
          ref={canvasRef} 
          width={1200} 
          height={800} 
          className="max-w-full max-h-full object-contain"
        />

        <AnimatePresence>
          {gameState === 'CUTSCENE' && (
            <motion.div 
              initial={{ opacity: 0, scale: 2 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none z-30"
            >
              <div className="bg-tactical-cyan/10 backdrop-blur-md border-y-4 border-tactical-cyan/40 w-full py-20 flex flex-col items-center justify-center shadow-[0_0_100px_rgba(34,211,238,0.2)]">
                <motion.div
                  animate={{ x: [-20, 20, -20] }}
                  transition={{ duration: 0.1, repeat: Infinity }}
                  className="text-6xl font-black text-white italic tracking-[0.2em] relative"
                >
                  {cutsceneText}
                  <div className="absolute -inset-2 bg-tactical-cyan/20 blur-xl -z-10"></div>
                </motion.div>
                <div className="mt-8 h-1 w-96 bg-slate-800 relative overflow-hidden">
                   <motion.div 
                     initial={{ x: '-100%' }}
                     animate={{ x: '100%' }}
                     transition={{ duration: 2, ease: "linear" }}
                     className="absolute inset-0 bg-tactical-cyan"
                   />
                </div>
              </div>
            </motion.div>
          )}

          {gameState === 'START' && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm flex items-center justify-center z-10"
            >
              <div className="max-w-md w-full bg-slate-900 border border-tactical-cyan/40 p-8 text-center space-y-8">
                <div className="inline-block p-4 bg-tactical-cyan/10 border border-tactical-cyan/30 mb-4">
                   <Target size={48} className="text-tactical-cyan" />
                </div>
                <h2 className="text-3xl font-black text-white tracking-[0.2em] uppercase">Tactical_Grid_Engage</h2>
                <div className="space-y-4 text-left">
                   <div className="flex items-center gap-3 text-xs text-slate-300 uppercase font-black tracking-widest bg-slate-950 p-3 border border-slate-800">
                      <Zap size={16} className="text-tactical-cyan" /> W/A/S/D TO MANEUVER
                   </div>
                   <div className="flex items-center gap-3 text-xs text-slate-300 uppercase font-black tracking-widest bg-slate-950 p-3 border border-slate-800">
                      <Crosshair size={16} className="text-tactical-cyan" /> SPACEBAR TO DISCHARGE
                   </div>
                   <div className="flex items-center gap-3 text-xs text-slate-300 uppercase font-black tracking-widest bg-slate-950 p-3 border border-slate-800">
                      <Zap size={16} className="text-red-500" /> SHIFT TO SWAP MODE (MELEE/RANGED)
                   </div>
                </div>
                <button 
                  onClick={resetGame}
                  className="w-full py-4 bg-tactical-cyan text-black font-black uppercase tracking-[0.4em] hover:bg-white transition-all shadow-[0_0_30px_rgba(34,211,238,0.3)]"
                >
                  INITIALIZE_LINK
                </button>
              </div>
            </motion.div>
          )}

          {gameState === 'GAMEOVER' && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="absolute inset-0 bg-red-950/60 backdrop-blur-xl flex items-center justify-center z-20"
            >
              <div className="max-w-md w-full bg-slate-900 border border-red-500/40 p-12 text-center">
                <AlertTriangle size={80} className="text-red-500 mx-auto mb-6" />
                <h3 className="text-5xl font-black text-white uppercase tracking-tighter mb-2">HULL_BREACHED</h3>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-8">CONNECTION_TERMINATED // TOTAL_LOSS</p>
                
                <div className="grid grid-cols-2 gap-4 mb-8">
                   <div className="bg-slate-950 p-4 border border-slate-800">
                      <div className="text-[8px] font-black text-slate-600 uppercase tracking-widest">FINAL_SCORE</div>
                      <div className="text-xl font-black text-tactical-cyan">{score}</div>
                   </div>
                   <div className="bg-slate-950 p-4 border border-slate-800">
                      <div className="text-[8px] font-black text-slate-600 uppercase tracking-widest">WAVES_CLEARED</div>
                      <div className="text-xl font-black text-white">{wave}</div>
                   </div>
                </div>

                <div className="flex gap-4">
                  <button 
                    onClick={resetGame}
                    className="flex-1 py-4 bg-white text-black font-black uppercase tracking-[0.2em] hover:bg-tactical-cyan transition-all flex items-center justify-center gap-2"
                  >
                    <RotateCcw size={16} /> REBOOT
                  </button>
                  <button 
                    onClick={onBack}
                    className="flex-1 py-4 bg-slate-950 text-slate-400 border border-slate-800 font-black uppercase tracking-[0.2em] hover:text-white transition-all"
                  >
                    DISCONNECT
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Ambient VFX Overlay */}
        <div className="absolute inset-0 pointer-events-none border-[40px] border-black/20 mix-blend-overlay"></div>
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]"></div>
      </div>

      {/* Footer Info */}
      <div className="bg-slate-950 border-t border-white/5 p-2 flex justify-between items-center shrink-0">
         <div className="flex items-center gap-2">
            <div className="h-1 w-1 rounded-full bg-tactical-cyan animate-pulse"></div>
            <span className="text-[7px] font-black text-slate-600 uppercase tracking-widest">LinkState: Stabilized</span>
         </div>
         <div className="text-[7px] font-black text-slate-800 uppercase tracking-[0.5em]">SYSTEM_VERSION_4.2.0_TANK</div>
      </div>
    </div>
  );
}
