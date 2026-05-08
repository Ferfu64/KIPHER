import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Play, RotateCcw, FastForward, Shield, Zap, Target, Cpu, AlertTriangle } from 'lucide-react';
import { audioService } from '../services/audioService';

interface Particle {
  x: number; y: number; vx: number; vy: number; color: string; life: number;
}

interface Hazard {
  x: number; y: number; width: number; height: number; vx: number; vy: number; color: string; 
  type: 'LASER' | 'ORB' | 'WALL';
}

export default function TimeGame({ onBack, onCreditsEarned }: { onBack: () => void, onCreditsEarned: (cr: number) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<'START' | 'PLAYING' | 'GAMEOVER' | 'VICTORY'>('START');
  const [timeScale, setTimeScale] = useState(1); // 1 = normal, 0.2 = slow, -1 = reverse (for energy)
  const [energy, setEnergy] = useState(100);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const frameId = useRef<number>(0);

  const player = useRef({ x: 400, y: 500, radius: 15, targetX: 400, targetY: 500 });
  const hazards = useRef<Hazard[]>([]);
  const particles = useRef<Particle[]>([]);
  const lastTime = useRef(performance.now());
  const history = useRef<{px: number, py: number, hazards: any[]}[]>([]);

  const initLevel = (lvl: number) => {
    hazards.current = [];
    for (let i = 0; i < 5 + lvl * 2; i++) {
       spawnHazard();
    }
    setEnergy(100);
    setGameState('PLAYING');
    audioService.playSuccess();
  };

  const spawnHazard = () => {
    const types: Hazard['type'][] = ['LASER', 'ORB', 'WALL'];
    const type = types[Math.floor(Math.random() * types.length)];
    const canvas = canvasRef.current;
    if (!canvas) return;

    hazards.current.push({
       x: Math.random() * canvas.width,
       y: -100 - Math.random() * 500,
       width: type === 'WALL' ? 100 : 30,
       height: type === 'LASER' ? 5 : 30,
       vx: (Math.random() - 0.5) * 2,
       vy: 2 + Math.random() * 3 + level,
       color: type === 'LASER' ? '#ef4444' : type === 'ORB' ? '#f59e0b' : '#3b82f6',
       type
    });
  };

  const gameLoop = (now: number) => {
    const canvas = canvasRef.current;
    if (!canvas || gameState !== 'PLAYING') return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dt = (now - lastTime.current) / 16.67;
    lastTime.current = now;

    // Time manipulation logic
    let effectiveDt = dt * timeScale;
    
    // Background
    ctx.fillStyle = timeScale < 0 ? '#0f172a' : '#020617';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Energy consumption
    if (timeScale !== 1) {
       setEnergy(prev => {
         const next = prev - Math.abs(1 - timeScale) * 0.5;
         if (next <= 0) setTimeScale(1);
         return Math.max(0, next);
       });
    } else {
       setEnergy(prev => Math.min(100, prev + 0.1));
    }

    // Player Follow Mouse
    const p = player.current;
    p.x += (p.targetX - p.x) * 0.1;
    p.y += (p.targetY - p.y) * 0.1;

    // Movement & Collision
    if (timeScale >= 0) {
        // Record history for reverse
        history.current.push({ 
           px: p.x, py: p.y, 
           hazards: hazards.current.map(h => ({ x: h.x, y: h.y, vx: h.vx, vy: h.vy })) 
        });
        if (history.current.length > 300) history.current.shift();

        hazards.current.forEach(h => {
           h.x += h.vx * effectiveDt;
           h.y += h.vy * effectiveDt;

           // Respawn if out of bounds
           if (h.y > canvas.height + 100) {
              h.y = -50;
              h.x = Math.random() * canvas.width;
              setScore(s => s + 10);
           }

           // Collision
           const dx = p.x - h.x;
           const dy = p.y - h.y;
           const dist = Math.hypot(dx, dy);
           if (dist < p.radius + 15) {
              setGameState('GAMEOVER');
              audioService.playError();
           }
        });
    } else {
       // Reverse Time
       const past = history.current.pop();
       if (past) {
          hazards.current.forEach((h, i) => {
             if (past.hazards[i]) {
                h.x = past.hazards[i].x;
                h.y = past.hazards[i].y;
             }
          });
       } else {
          setTimeScale(1);
       }
    }

    // Draw Hazards
    hazards.current.forEach(h => {
       ctx.fillStyle = h.color;
       ctx.shadowBlur = 10;
       ctx.shadowColor = h.color;
       if (h.type === 'ORB') {
          ctx.beginPath(); ctx.arc(h.x, h.y, 15, 0, Math.PI * 2); ctx.fill();
       } else {
          ctx.fillRect(h.x - h.width/2, h.y - h.height/2, h.width, h.height);
       }
       ctx.shadowBlur = 0;
    });

    // Draw Player
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.strokeStyle = '#22d3ee';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(0, 0, p.radius, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = 'rgba(34, 211, 238, 0.2)';
    ctx.fill();
    
    // Inner pulse
    const pulse = Math.sin(now / 200) * 5 + 10;
    ctx.fillStyle = '#22d3ee';
    ctx.beginPath(); ctx.arc(0, 0, pulse / 2, 0, Math.PI * 2); ctx.fill();
    ctx.restore();

    // Victory condition
    if (score > level * 1000) {
       setLevel(l => l + 1);
       onCreditsEarned(level * 50);
       triggerVictory();
    }

    frameId.current = requestAnimationFrame(gameLoop);
  };

  const triggerVictory = () => {
    setGameState('VICTORY');
    audioService.playSuccess();
  };

  useEffect(() => {
    if (gameState === 'PLAYING') {
       frameId.current = requestAnimationFrame(gameLoop);
    }
    return () => cancelAnimationFrame(frameId.current);
  }, [gameState]);

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    player.current.targetX = clientX - rect.left;
    player.current.targetY = clientY - rect.top;
  };

  useEffect(() => {
    const handleDown = (e: KeyboardEvent) => {
       if (e.code === 'KeyQ') setTimeScale(0.2);
       if (e.code === 'KeyE') setTimeScale(-1);
       if (e.code === 'KeyF') setTimeScale(2);
    };
    const handleUp = (e: KeyboardEvent) => {
       if (['KeyQ', 'KeyE', 'KeyF'].includes(e.code)) setTimeScale(1);
    };
    window.addEventListener('keydown', handleDown);
    window.addEventListener('keyup', handleUp);
    return () => {
       window.removeEventListener('keydown', handleDown);
       window.removeEventListener('keyup', handleUp);
    };
  }, []);

  return (
    <div className="h-full w-full bg-slate-950 flex flex-col font-mono text-white overflow-hidden select-none">
       {/* HUD */}
       <div className="p-4 border-b border-white/10 flex justify-between items-center bg-slate-900/50">
          <button onClick={onBack} className="text-slate-500 hover:text-white transition-colors flex items-center gap-2">
            <AlertTriangle size={16}/> ABORT_CHRONOS
          </button>
          <div className="flex gap-8">
             <div className="text-center">
                <div className="text-[8px] text-slate-500 mb-1">STABILITY_ENERGY</div>
                <div className="w-32 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                   <motion.div animate={{ width: `${energy}%` }} className="h-full bg-tactical-cyan" />
                </div>
             </div>
             <div className="text-center">
                <div className="text-[8px] text-slate-500 mb-1">SCORE_INTEL</div>
                <div className="text-sm font-black text-white">{score.toString().padStart(6, '0')}</div>
             </div>
          </div>
          <div className="flex gap-2">
             <div className={`p-2 border ${timeScale === 0.2 ? 'bg-tactical-cyan text-black border-tactical-cyan' : 'border-slate-800 text-slate-500'}`} title="Slow Time [Q]">
                <Clock size={16}/>
             </div>
             <div className={`p-2 border ${timeScale === -1 ? 'bg-orange-500 text-black border-orange-500' : 'border-slate-800 text-slate-500'}`} title="Reverse [E]">
                <RotateCcw size={16}/>
             </div>
             <div className={`p-2 border ${timeScale === 2 ? 'bg-yellow-400 text-black border-yellow-400' : 'border-slate-800 text-slate-500'}`} title="Burst [F]">
                <FastForward size={16}/>
             </div>
          </div>
       </div>

       <div className="flex-1 relative">
          <canvas 
            ref={canvasRef}
            width={800} height={600}
            onMouseMove={handleMouseMove}
            onTouchMove={handleMouseMove}
            onPointerDown={() => {}} // Time manipulation could go here too
            className="w-full h-full object-contain cursor-none"
          />

          <AnimatePresence>
             {gameState === 'START' && (
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-10">
                  <div className="text-center p-12 bg-slate-900 border border-tactical-cyan/30 max-w-lg">
                     <Clock size={80} className="text-tactical-cyan mx-auto mb-6" />
                     <h2 className="text-4xl font-black mb-2 uppercase tracking-tighter italic">CHRONOS_DRIFT</h2>
                     <p className="text-slate-500 text-[10px] mb-8 uppercase tracking-widest leading-relaxed">
                        Navigate the corrupted chronos-stream. Use time-manipulation to survive hazard spikes.
                        <br/><br/>
                        [Q] SLOW // [E] REVERSE // [F] BURST
                     </p>
                     <button 
                       onClick={() => initLevel(1)} 
                       className="w-full py-4 bg-tactical-cyan text-black font-black uppercase tracking-widest hover:scale-105 transition-transform"
                     >
                       INITIALIZE_SYNC
                     </button>
                  </div>
               </motion.div>
             )}

             {gameState === 'GAMEOVER' && (
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 flex items-center justify-center bg-red-950/90 z-20">
                  <div className="text-center">
                     <h2 className="text-6xl font-black text-white mb-4 uppercase italic">KILLED_IN_TIME</h2>
                     <div className="text-2xl font-black text-red-500 mb-8 italic">TIMELINE_CRITICAL_FAILURE</div>
                     <button 
                       onClick={() => { setScore(0); initLevel(1); }}
                       className="px-12 py-4 border-2 border-white text-white font-black uppercase hover:bg-white hover:text-black transition-all"
                     >
                       RESTORE_STATE
                     </button>
                  </div>
               </motion.div>
             )}
          </AnimatePresence>
       </div>
    </div>
  );
}
