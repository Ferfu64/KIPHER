import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Coins, ChevronLeft, Zap, TrendingUp, AlertTriangle } from 'lucide-react';
import { audioService } from '../services/audioService';

export default function CrashGame({ 
  credits, 
  onBack, 
  onUpdateCredits 
}: { 
  credits: number, 
  onBack: () => void, 
  onUpdateCredits: (cr: number) => void 
}) {
  const [multiplier, setMultiplier] = useState(1.0);
  const [state, setState] = useState<'IDLE' | 'RUNNING' | 'CRASHED'>('IDLE');
  const [bet, setBet] = useState(500);
  const [crashPoint, setCrashPoint] = useState(0);
  const requestRef = useRef<number>(0);

  const startRun = () => {
    if (credits < bet || state === 'RUNNING') return;
    onUpdateCredits(-bet);
    setState('RUNNING');
    setMultiplier(1.0);
    
    // Algorithm: exponential curve bias
    const extra = Math.random();
    const result = extra === 0 ? 1 : 1 / (1 - extra);
    setCrashPoint(result);
    
    audioService.playBlip();
  };

  useEffect(() => {
    if (state === 'RUNNING') {
      const update = () => {
        setMultiplier(prev => {
          const next = prev + 0.01 * (prev / 2);
          if (next >= crashPoint) {
            return crashPoint;
          }
          return next;
        });
        requestRef.current = requestAnimationFrame(update);
      };
      requestRef.current = requestAnimationFrame(update);
    }
    return () => cancelAnimationFrame(requestRef.current);
  }, [state, crashPoint]);

  useEffect(() => {
    if (state === 'RUNNING' && multiplier >= crashPoint && crashPoint > 0) {
      setState('CRASHED');
      audioService.playError();
      cancelAnimationFrame(requestRef.current);
    }
  }, [multiplier, state, crashPoint]);

  const cashOut = () => {
    if (state !== 'RUNNING') return;
    const payout = Math.floor(bet * multiplier);
    onUpdateCredits(payout);
    setState('IDLE');
    audioService.playSuccess();
    cancelAnimationFrame(requestRef.current);
  };

  return (
    <div className="h-full w-full bg-slate-950 flex flex-col font-mono text-white select-none">
       <div className="p-4 border-b border-white/10 flex justify-between items-center bg-slate-900/50">
          <button onClick={onBack} className="text-slate-500 hover:text-white transition-colors flex items-center gap-2">
            <ChevronLeft size={16}/> EXIT_NODE
          </button>
          <div className="text-xl font-black text-purple-500 italic tracking-widest">SYNAPTIC_CRASH_V4</div>
          <div className="flex items-center gap-2 bg-slate-900 px-3 py-1 rounded border border-white/5">
             <Coins size={14} className="text-yellow-500" />
             <span className="text-sm font-bold tabular-nums">{credits.toLocaleString()} CR</span>
          </div>
       </div>

       <div className="flex-1 flex flex-col items-center justify-center p-8 relative overflow-hidden">
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-purple-500/10 to-transparent pointer-events-none" />
          
          <div className="text-center relative z-10">
             <div className="text-[10px] text-slate-500 uppercase tracking-[0.5em] mb-4">ENTROPY_MULTIPLIER</div>
             <motion.div 
               key={state}
               animate={state === 'CRASHED' ? { scale: [1, 1.2, 1], color: '#ef4444' } : { scale: 1 }}
               className={`text-8xl font-black italic tracking-tighter ${state === 'CRASHED' ? 'text-red-500' : 'text-purple-400'}`}
             >
                {multiplier.toFixed(2)}x
             </motion.div>
             {state === 'CRASHED' && (
                <div className="mt-4 text-red-500 font-black animate-pulse uppercase tracking-widest">CRITICAL_SYSTEM_FAILURE</div>
             )}
          </div>

          <div className="w-full max-w-sm mt-16 space-y-6 relative z-10">
             <div className="flex gap-2">
                {[500, 1000, 5000].map(v => (
                   <button 
                     key={v}
                     disabled={state === 'RUNNING'}
                     onClick={() => setBet(v)}
                     className={`flex-1 py-2 border transition-all ${bet === v ? 'bg-purple-600 text-white border-purple-600' : 'border-white/10 text-slate-500'} disabled:opacity-20`}
                   >
                      {v}
                   </button>
                ))}
             </div>

             {state === 'RUNNING' ? (
                <button 
                  onClick={cashOut}
                   className="w-full py-6 bg-tactical-cyan text-black font-black uppercase tracking-[0.4em] hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-tactical-cyan/40"
                >
                   CASH_OUT (+{Math.floor(bet * multiplier)} CR)
                </button>
             ) : (
                <button 
                  onClick={startRun}
                  disabled={credits < bet}
                  className="w-full py-6 bg-white text-black font-black uppercase tracking-[0.4em] hover:bg-purple-500 hover:text-white transition-all disabled:opacity-30"
                >
                   INIT_ENTROPY_RUN
                </button>
             )}
             
             {state === 'CRASHED' && (
                <button 
                   onClick={() => setState('IDLE')}
                   className="w-full text-[10px] text-slate-500 uppercase hover:text-white transition-colors"
                >
                   RETRY_SEQUENCE
                </button>
             )}
          </div>
       </div>
    </div>
  );
}
