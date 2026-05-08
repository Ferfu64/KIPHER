import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Shield, Key, AlertTriangle, CheckCircle, Cpu } from 'lucide-react';

interface NeuralCipherProps {
  onComplete: (score: number) => void;
  onFail: () => void;
}

export default function NeuralCipher({ onComplete, onFail }: NeuralCipherProps) {
  const [sequence, setSequence] = useState<number[]>([]);
  const [userInput, setUserInput] = useState<number[]>([]);
  const [gameState, setGameState] = useState<'IDLE' | 'MEMORIZE' | 'INPUT' | 'SUCCESS' | 'FAIL'>('IDLE');
  const [level, setLevel] = useState(1);
  const [flashIndex, setFlashIndex] = useState<number | null>(null);

  const startLevel = (currentLevel: number) => {
    const newSequence = Array.from({ length: 3 + Math.floor(currentLevel / 2) }, () => Math.floor(Math.random() * 9));
    setSequence(newSequence);
    setUserInput([]);
    setGameState('MEMORIZE');
    
    let i = 0;
    const interval = setInterval(() => {
      if (i >= newSequence.length) {
        setFlashIndex(null);
        setGameState('INPUT');
        clearInterval(interval);
        return;
      }
      setFlashIndex(newSequence[i]);
      i++;
      setTimeout(() => setFlashIndex(null), 400);
    }, 800);
  };

  useEffect(() => {
    startLevel(level);
  }, []);

  const handleInput = (num: number) => {
    if (gameState !== 'INPUT') return;
    
    const newInput = [...userInput, num];
    setUserInput(newInput);

    if (num !== sequence[userInput.length]) {
      setGameState('FAIL');
      setTimeout(onFail, 1500);
      return;
    }

    if (newInput.length === sequence.length) {
      if (level >= 5) {
        setGameState('SUCCESS');
        setTimeout(() => onComplete(level * 200), 1000);
      } else {
        setLevel(prev => prev + 1);
        setTimeout(() => startLevel(level + 1), 500);
      }
    }
  };

  return (
    <div className="w-full h-full bg-slate-950 flex flex-col items-center justify-center p-8 relative overflow-hidden">
      {/* Decorative Grid */}
      <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'linear-gradient(#00f3ff 1px, transparent 1px), linear-gradient(90deg, #00f3ff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      <div className="max-w-md w-full relative z-10">
        <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-4">
          <div className="flex items-center gap-2 text-tactical-cyan">
            <Cpu size={20} className="animate-pulse" />
            <span className="text-[10px] font-black tracking-widest uppercase">Encryption_Node_{level}</span>
          </div>
          <div className="flex gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className={`w-1 h-3 ${i < level ? 'bg-tactical-cyan' : 'bg-slate-800'}`} />
            ))}
          </div>
        </div>

        <div className="text-center mb-12">
          <h2 className="text-2xl font-black text-white italic tracking-[0.3em] uppercase mb-2">Neural_Cipher</h2>
          <div className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">
            {gameState === 'MEMORIZE' ? 'Decoding_Neural_Pulse...' : 'Replicate_Input_Sequence'}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          {Array.from({ length: 9 }).map((_, i) => (
            <motion.button
              key={i}
              whileHover={gameState === 'INPUT' ? { scale: 1.05 } : {}}
              whileTap={gameState === 'INPUT' ? { scale: 0.95 } : {}}
              onClick={() => handleInput(i)}
              className={`aspect-square rounded-xl border-2 transition-all flex items-center justify-center relative overflow-hidden
                ${flashIndex === i ? 'bg-tactical-cyan border-tactical-cyan shadow-[0_0_30px_#00f3ff] scale-110 z-20' : 
                  gameState === 'INPUT' ? 'border-white/10 hover:border-tactical-cyan/50 bg-black/40' : 
                  'border-white/5 bg-slate-900/20 opacity-50 cursor-not-allowed'}
              `}
            >
              <span className={`text-xl font-black ${flashIndex === i ? 'text-black' : 'text-slate-600'}`}>{i + 1}</span>
              {flashIndex === i && (
                 <motion.div 
                   layoutId="flash"
                   className="absolute inset-0 bg-white/40"
                 />
              )}
            </motion.button>
          ))}
        </div>

        <div className="flex justify-center gap-4 h-12">
           <AnimatePresence mode="wait">
             {gameState === 'FAIL' && (
               <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 text-red-500 font-black uppercase italic text-xs">
                 <AlertTriangle size={16} /> Encryption_Severed
               </motion.div>
             )}
             {gameState === 'SUCCESS' && (
               <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 text-emerald-500 font-black uppercase italic text-xs">
                 <CheckCircle size={16} /> Access_Granted
               </motion.div>
             )}
             {gameState === 'INPUT' && (
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2">
                  {userInput.map((_, i) => (
                    <div key={i} className="w-2 h-2 rounded-full bg-tactical-cyan animate-pulse" />
                  ))}
                  {Array.from({ length: sequence.length - userInput.length }).map((_, i) => (
                    <div key={i} className="w-2 h-2 rounded-full border border-white/20" />
                  ))}
               </motion.div>
             )}
           </AnimatePresence>
        </div>
      </div>

      {/* Decorative HUD Details */}
      <div className="absolute top-4 left-4 text-[8px] text-slate-800 font-mono">NODE_HASH: {Math.random().toString(16).slice(2,10)}</div>
      <div className="absolute bottom-4 right-4 text-[8px] text-slate-800 font-mono">LATENCY_SYNC: STABLE</div>
    </div>
  );
}
