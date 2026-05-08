import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Wifi, WifiOff, Zap, ShieldAlert, Cpu } from 'lucide-react';

interface NetworkBreachProps {
  onComplete: (score: number) => void;
  onFail: () => void;
}

export default function NetworkBreach({ onComplete, onFail }: NetworkBreachProps) {
  const [active, setActive] = useState(false);
  const [startTime, setStartTime] = useState(0);
  const [result, setResult] = useState<number | null>(null);
  const [gameState, setGameState] = useState<'IDLE' | 'WAITING' | 'ACTIVE' | 'DONE'>('IDLE');
  const timeoutRef = useRef<NodeJS.Timeout|null>(null);

  const startTest = () => {
    setGameState('WAITING');
    const delay = 2000 + Math.random() * 4000;
    timeoutRef.current = setTimeout(() => {
      setGameState('ACTIVE');
      setStartTime(Date.now());
    }, delay);
  };

  const handleTrigger = () => {
    if (gameState === 'WAITING') {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setGameState('IDLE');
      alert('EARLY_TRIGGER_DETECTED: CONNECTION_FAILED');
      onFail();
      return;
    }

    if (gameState === 'ACTIVE') {
      const diff = Date.now() - startTime;
      setResult(diff);
      setGameState('DONE');
      setTimeout(() => onComplete(Math.max(10, 500 - diff)), 1500);
    }
  };

  useEffect(() => {
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  }, []);

  return (
    <div className="w-full h-full bg-slate-950 flex flex-col items-center justify-center p-8 relative overflow-hidden">
      <div className="text-center mb-12 relative z-10">
        <h2 className="text-2xl font-black text-white italic tracking-[0.3em] uppercase mb-4">Neural_Stability_Test</h2>
        <div className="text-[10px] text-slate-500 font-mono uppercase tracking-widest max-w-xs mx-auto">
          Tap the sensor as soon as the network synchronizes to maximize data extraction.
        </div>
      </div>

      <motion.button 
        onMouseDown={handleTrigger}
        className={`w-48 h-48 rounded-full border-4 transition-all duration-75 flex items-center justify-center relative
          ${gameState === 'ACTIVE' ? 'bg-tactical-cyan border-white shadow-[0_0_60px_#00f3ff]' : 
            gameState === 'WAITING' ? 'bg-red-500/10 border-red-500/30' : 
            gameState === 'DONE' ? 'bg-emerald-500/20 border-emerald-500' :
            'bg-slate-900 border-slate-800'}
        `}
      >
        {gameState === 'IDLE' && <div onClick={startTest} className="text-slate-500 font-black uppercase text-xs">INIT_LINK</div>}
        {gameState === 'WAITING' && <WifiOff className="text-red-500/40 animate-pulse" size={48} />}
        {gameState === 'ACTIVE' && <Zap className="text-black animate-bounce" size={64} />}
        {gameState === 'DONE' && <div className="text-emerald-500 font-black text-2xl">{result}ms</div>}

        {/* HUD Elements */}
        <div className="absolute -inset-8 pointer-events-none">
           <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-1 h-8 ${gameState === 'ACTIVE' ? 'bg-tactical-cyan' : 'bg-slate-800'}`} />
           <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-8 ${gameState === 'ACTIVE' ? 'bg-tactical-cyan' : 'bg-slate-800'}`} />
           <div className={`absolute left-0 top-1/2 -translate-y-1/2 h-1 w-8 ${gameState === 'ACTIVE' ? 'bg-tactical-cyan' : 'bg-slate-800'}`} />
           <div className={`absolute right-0 top-1/2 -translate-y-1/2 h-1 w-8 ${gameState === 'ACTIVE' ? 'bg-tactical-cyan' : 'bg-slate-800'}`} />
        </div>
      </motion.button>

      <div className="mt-12 flex items-center gap-12 opacity-30 relative z-10">
        <div className="flex flex-col items-center">
           <ShieldAlert size={16} />
           <span className="text-[8px] font-bold mt-1">ANTI_TAMPER</span>
        </div>
        <div className="flex flex-col items-center">
           <Cpu size={16} />
           <span className="text-[8px] font-bold mt-1">Neural_Interface_7.0</span>
        </div>
      </div>
    </div>
  );
}
