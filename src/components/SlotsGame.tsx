import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Coins, ChevronLeft, Zap, Sparkles, AlertTriangle } from 'lucide-react';
import { audioService } from '../services/audioService';

const SYMBOLS = ['💎', '⚡', '🔥', '🎰', '🧿', '👾', '🌀'];

export default function SlotsGame({ 
  credits, 
  onBack, 
  onUpdateCredits 
}: { 
  credits: number, 
  onBack: () => void, 
  onUpdateCredits: (cr: number) => void 
}) {
  const [reels, setReels] = useState([SYMBOLS[0], SYMBOLS[1], SYMBOLS[2]]);
  const [spinning, setSpinning] = useState(false);
  const [bet, setBet] = useState(100);
  const [resultMessage, setResultMessage] = useState('');

  const spin = () => {
    if (credits < bet || spinning) return;
    onUpdateCredits(-bet);
    setSpinning(true);
    setResultMessage('');
    audioService.playBlip();

    const spinIntervals = [1000, 1500, 2000];
    
    // We'll update reels state individually for each reel
    spinIntervals.forEach((duration, index) => {
      const intervalId = setInterval(() => {
        setReels(prev => {
          const next = [...prev];
          next[index] = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
          return next;
        });
      }, 50);

      setTimeout(() => {
        clearInterval(intervalId);
        if (index === 2) {
          setSpinning(false);
          
          // FORCED WIN LOGIC (BASED ON BET)
          // Higher bet = slightly better chance to force a match if natural fail
          setReels(currentReels => {
            const isNaturalWin = currentReels[0] === currentReels[1] && currentReels[1] === currentReels[2];
            if (!isNaturalWin) {
               // Chance to force win: 100 bet: 1%, 500 bet: 5%, 1000 bet: 10%
               const forceChance = bet >= 1000 ? 0.10 : (bet >= 500 ? 0.05 : 0.01);
               if (Math.random() < forceChance) {
                  const symbol = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
                  return [symbol, symbol, symbol];
               }
            }
            return currentReels;
          });
        }
      }, duration);
    });
  };

  useEffect(() => {
    if (!spinning && reels[0] !== undefined) {
      const isWin = reels[0] === reels[1] && reels[1] === reels[2];
      const isTwo = reels[0] === reels[1] || reels[1] === reels[2] || reels[0] === reels[2];

      if (isWin) {
        let payout = bet * 10;
        // Bonus 1k for high-value symbols
        const isBonusSymbol = reels[0] === '💎' || reels[0] === '🧿';
        if (isBonusSymbol) {
          payout += 1000;
        }
        
        onUpdateCredits(payout);
        setResultMessage(`JACKPOT! ${isBonusSymbol ? '+1K_BONUS ' : ''}+${payout} CR`);
        audioService.playSuccess();
      } else if (isTwo && (reels[0] !== reels[1] || reels[1] !== reels[2])) {
        // Technically double matched is already handled as isWin if all 3 match
        // and isTwo is true if any 2 match. We check if they aren't all the same to be precise.
        // Actually isWin is stricter.
        const payout = Math.floor(bet * 1.5);
        onUpdateCredits(payout);
        setResultMessage(`MIN_MATCH: +${payout} CR`);
        audioService.playSuccess();
      } else if (!isWin && !isTwo) {
        if (resultMessage === '') { // Prevent repeating if called multiple times
           setResultMessage('LINK_FAILED: NO_MATCH');
           audioService.playError();
        }
      }
    }
  }, [spinning]);

  return (
    <div className="h-full w-full bg-slate-950 flex flex-col font-mono text-white select-none">
       <div className="p-4 border-b border-white/10 flex justify-between items-center bg-slate-900/50">
          <button onClick={onBack} className="text-slate-500 hover:text-white transition-colors flex items-center gap-2">
            <ChevronLeft size={16}/> EXIT_NODE
          </button>
          <div className="text-xl font-black text-tactical-cyan italic tracking-widest">NEURAL_SLOTS_V1</div>
          <div className="flex items-center gap-2 bg-slate-900 px-3 py-1 rounded border border-white/5">
             <Coins size={14} className="text-yellow-500" />
             <span className="text-sm font-bold tabular-nums">{credits.toLocaleString()} CR</span>
          </div>
       </div>

       <div className="flex-1 flex flex-col items-center justify-center p-8">
          <div className="flex gap-4 mb-12">
             {reels.map((symbol, i) => (
                <motion.div 
                  key={i}
                  animate={spinning ? { y: [0, -20, 20, 0] } : {}}
                  transition={spinning ? { repeat: Infinity, duration: 0.1 } : {}}
                  className="w-32 h-40 bg-slate-900 border-4 border-slate-800 rounded-2xl flex items-center justify-center text-6xl shadow-[0_0_30px_rgba(34,211,238,0.1)]"
                >
                   {symbol}
                </motion.div>
             ))}
          </div>

          <div className="h-8 mb-8 text-tactical-cyan font-black uppercase italic tracking-widest">
             {resultMessage}
          </div>

          <div className="w-full max-w-sm space-y-6">
             <div className="flex gap-2">
                {[100, 500, 1000].map(v => (
                   <button 
                     key={v}
                     onClick={() => setBet(v)}
                     className={`flex-1 py-2 border ${bet === v ? 'bg-tactical-cyan text-black border-tactical-cyan' : 'border-white/10 text-slate-500 hover:border-white/20'}`}
                   >
                      {v}
                   </button>
                ))}
             </div>
             <button 
               onClick={spin}
               disabled={spinning || credits < bet}
               className="w-full py-6 bg-white text-black font-black uppercase tracking-[0.4em] hover:bg-tactical-cyan hover:scale-[1.02] transition-all disabled:opacity-30"
             >
                {spinning ? 'PROCESSING_REELS...' : 'ENGAGE_SYNC'}
             </button>
          </div>
       </div>
    </div>
  );
}
