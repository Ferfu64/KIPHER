import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Shield, AlertTriangle, Cpu, FastForward } from 'lucide-react';
import { audioService } from '../services/audioService';

export default function CyberRunner({ onBack }: { onBack: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<'START' | 'PLAYING' | 'GAMEOVER'>('START');
  const [score, setScore] = useState(0);
  const [speed, setSpeed] = useState(3);
  const [cutscene, setCutscene] = useState<string | null>(null);

  const playerPos = useRef(1); // 0, 1, 2 for lanes
  const obstacles = useRef<{x: number, y: number, type: 'WALL' | 'POINT'}[]>([]);
  const frameId = useRef(0);

  const triggerCutscene = (text: string) => {
    setCutscene(text);
    audioService.playSuccess();
    setTimeout(() => setCutscene(null), 1500);
  };

  const spawnObstacle = (canvas: HTMLCanvasElement) => {
    const lane = Math.floor(Math.random() * 3);
    const type = Math.random() > 0.8 ? 'POINT' : 'WALL';
    obstacles.current.push({
      x: lane,
      y: -100,
      type
    });
  };

  const resetGame = () => {
    setScore(0);
    setSpeed(3);
    obstacles.current = [];
    playerPos.current = 1;
    setGameState('PLAYING');
    triggerCutscene("LINK_ESTABLISHED");
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') playerPos.current = Math.max(0, playerPos.current - 1);
      if (e.code === 'ArrowRight' || e.code === 'KeyD') playerPos.current = Math.min(2, playerPos.current + 1);
    };
    window.addEventListener('keydown', handleKey);
    return () => {
      window.removeEventListener('keydown', handleKey);
      cancelAnimationFrame(frameId.current);
    };
  }, []);

  const loop = () => {
    const canvas = canvasRef.current;
    if (!canvas || gameState !== 'PLAYING') return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#020617';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Lanes
    ctx.lineWidth = 2;
    for (let i = 0; i < 3; i++) {
      const laneX = i * (canvas.width / 3);
      const laneWidth = canvas.width / 3;
      
      // Highlight active lane
      if (i === playerPos.current) {
        ctx.fillStyle = 'rgba(34, 211, 238, 0.05)';
        ctx.fillRect(laneX, 0, laneWidth, canvas.height);
        ctx.strokeStyle = 'rgba(34, 211, 238, 0.3)';
      } else {
        ctx.strokeStyle = 'rgba(34, 211, 238, 0.1)';
      }
      
      ctx.beginPath();
      ctx.moveTo(laneX, 0);
      ctx.lineTo(laneX, canvas.height);
      ctx.stroke();
    }

    // Update Obstacles
    if (Math.random() < 0.015 + (score / 200000)) spawnObstacle(canvas);

    obstacles.current = obstacles.current.filter(o => {
      o.y += speed;
      const laneWidth = canvas.width / 3;
      const xPos = o.x * laneWidth + laneWidth / 2;

      ctx.fillStyle = o.type === 'WALL' ? '#ef4444' : '#22d3ee';
      ctx.shadowBlur = 15;
      ctx.shadowColor = ctx.fillStyle;
      
      if (o.type === 'WALL') {
        ctx.fillRect(o.x * laneWidth + 10, o.y, laneWidth - 20, 40);
      } else {
        ctx.beginPath();
        ctx.arc(xPos, o.y + 20, 10, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.shadowBlur = 0;

      // Collision
      if (o.y > canvas.height - 120 && o.y < canvas.height - 40 && o.x === playerPos.current) {
        if (o.type === 'WALL') {
          setGameState('GAMEOVER');
          audioService.playError();
        } else {
          setScore(s => s + 500);
          audioService.playBlip();
          if (score % 8000 === 0 && score > 0) {
            setSpeed(prev => prev + 0.5);
            triggerCutscene("SPEED_INCREASED");
          }
          return false;
        }
      }

      return o.y < canvas.height;
    });

    // Draw Player
    const laneWidth = canvas.width / 3;
    const targetX = playerPos.current * laneWidth + laneWidth / 2;
    ctx.fillStyle = '#22d3ee';
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#22d3ee';
    ctx.beginPath();
    ctx.moveTo(targetX, canvas.height - 100);
    ctx.lineTo(targetX - 20, canvas.height - 60);
    ctx.lineTo(targetX + 20, canvas.height - 60);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;

    setScore(s => s + 1);
    frameId.current = requestAnimationFrame(loop);
  };

  useEffect(() => {
    if (gameState === 'PLAYING') frameId.current = requestAnimationFrame(loop);
  }, [gameState]);

  return (
    <div className="h-full w-full bg-slate-950 flex flex-col font-mono text-white overflow-hidden relative">
      <div className="p-4 border-b border-tactical-cyan/20 flex justify-between items-center bg-slate-900/50">
        <button onClick={onBack} className="text-slate-500 hover:text-white transition-colors"><Shield size={20}/></button>
        <div className="text-xl font-black text-tactical-cyan uppercase tracking-widest italic">Cyber_Runner_V1</div>
        <div className="text-xl font-black tabular-nums">{score.toString().padStart(6, '0')}</div>
      </div>

      <div className="flex-1 relative flex items-center justify-center">
        <canvas ref={canvasRef} width={400} height={700} className="max-h-full aspect-[4/7] bg-slate-900 border-x border-tactical-cyan/10" />
        
        <AnimatePresence>
          {cutscene && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 2 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none z-50 p-20"
            >
               <div className="bg-tactical-cyan/10 backdrop-blur-xl border-y-4 border-tactical-cyan/50 w-full py-10 flex flex-col items-center shadow-[0_0_50px_rgba(34,211,238,0.2)]">
                  <div className="text-4xl font-black italic tracking-widest animate-pulse">{cutscene}</div>
               </div>
            </motion.div>
          )}

          {gameState === 'START' && (
            <motion.div className="absolute inset-0 bg-slate-950/90 z-20 flex flex-col items-center justify-center p-12 text-center">
               <Cpu size={60} className="text-tactical-cyan mb-6 animate-pulse" />
               <h2 className="text-4xl font-black tracking-tighter mb-4 uppercase">Data_Stream_Engage</h2>
               <p className="text-slate-500 text-xs mb-10 uppercase tracking-widest font-bold">Avoid Firewall_Walls // Collect Optimizers</p>
               <div className="bg-slate-900 p-4 border border-white/5 mb-10 text-[10px] font-black tracking-widest uppercase">
                  A/D OR ARROWS TO SHIFT LANES
               </div>
               <button onClick={resetGame} className="w-full max-w-xs py-4 bg-tactical-cyan text-black font-black uppercase tracking-[0.3em] hover:scale-105 transition-all shadow-[0_0_30px_rgba(34,211,238,0.3)]">
                 INIT_LINK
               </button>
            </motion.div>
          )}

          {gameState === 'GAMEOVER' && (
            <motion.div className="absolute inset-0 bg-red-950/90 z-30 flex flex-col items-center justify-center p-12 text-center">
               <AlertTriangle size={80} className="text-red-500 mb-6" />
               <h2 className="text-5xl font-black mb-2 uppercase tracking-tighter">THREAD_TERMINATED</h2>
               <div className="text-2xl font-black text-tactical-cyan mb-12">FINAL_STRENGTH: {score}</div>
               <div className="flex gap-4 w-full max-w-xs">
                  <button onClick={resetGame} className="flex-1 py-4 bg-white text-black font-black uppercase tracking-widest">REBOOT</button>
                  <button onClick={onBack} className="flex-1 py-4 border border-white/10 text-slate-400 font-black uppercase tracking-widest">ABORT</button>
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
