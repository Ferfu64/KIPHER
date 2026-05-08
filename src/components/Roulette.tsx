import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Coins, ChevronLeft, Shield, Zap, TrendingUp, AlertTriangle } from 'lucide-react';
import { audioService } from '../services/audioService';

type BetType = 'RED' | 'BLACK' | 'GREEN';

export default function Roulette({ 
  credits, 
  onBack, 
  onUpdateCredits 
}: { 
  credits: number, 
  onBack: () => void, 
  onUpdateCredits: (cr: number) => void 
}) {
  const [betAmount, setBetAmount] = useState(1000);
  const [betType, setBetType] = useState<BetType | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<{ number: number, color: string } | null>(null);
  const [rotation, setRotation] = useState(0);

  const minBet = 1000;
  const minPercentage = 0.5;
  const requiredBet = Math.max(minBet, Math.floor(credits * minPercentage));

  const colors = [
    'green', 'red', 'black', 'red', 'black', 'red', 'black', 'red', 'black', 'red', 'black', 'red', 'black',
    'red', 'black', 'red', 'black', 'red', 'black', 'red', 'black', 'red', 'black', 'red', 'black', 'red',
    'black', 'red', 'black', 'red', 'black', 'red', 'black', 'red', 'black', 'red', 'black'
  ];

  const spin = () => {
    if (credits < requiredBet || !betType || isSpinning) {
       audioService.playError();
       return;
    }

    onUpdateCredits(-requiredBet);
    setIsSpinning(true);
    setResult(null);
    audioService.playBlip();

    const newResult = Math.floor(Math.random() * 37);
    const resultColor = colors[newResult].toUpperCase();
    
    // Each pocket is 360/37 degrees
    const pocketDegrees = 360 / 37;
    const extraSpins = 5 + Math.random() * 5;
    const finalRotation = rotation - (extraSpins * 360) - (newResult * pocketDegrees);
    
    setRotation(finalRotation);

    setTimeout(() => {
      setIsSpinning(false);
      setResult({ number: newResult, color: resultColor });
      
      let multiplier = 0;
      if (resultColor === betType) {
        if (betType === 'GREEN') multiplier = 15;
        else multiplier = 2;
      } else if (resultColor === 'GREEN') {
        multiplier = 1; // get money back on green if you bet red/black (per requested rules)
      }

      if (multiplier > 0) {
        onUpdateCredits(requiredBet * multiplier);
        audioService.playSuccess();
      } else {
        audioService.playError();
      }
    }, 5000);
  };

  return (
    <div className="h-full w-full bg-slate-950 flex flex-col font-mono text-white select-none">
       <div className="p-4 border-b border-white/10 flex justify-between items-center bg-slate-900/50">
          <button onClick={onBack} className="text-slate-500 hover:text-white transition-colors flex items-center gap-2">
            <ChevronLeft size={16}/> EXIT_CASINO
          </button>
          <div className="text-xl font-black text-red-500 italic tracking-widest">HIGH_STAKES_ROULETTE</div>
          <div className="flex items-center gap-2 bg-slate-900 px-3 py-1 rounded border border-white/5">
             <Coins size={14} className="text-yellow-500" />
             <span className="text-sm font-bold tabular-nums">{credits.toLocaleString()} CR</span>
          </div>
       </div>

       <div className="flex-1 flex flex-col items-center justify-center p-8 overflow-hidden">
          <div className="relative mb-12">
             {/* The Wheel */}
             <motion.div 
               animate={{ rotate: rotation }}
               transition={{ duration: 5, ease: [0.1, 0, 0.1, 1] }}
               className="w-80 h-80 rounded-full border-8 border-slate-900 relative shadow-2xl shadow-black"
               style={{ 
                 background: 'conic-gradient(#10b981 0deg 9.7deg, #ef4444 9.7deg 19.4deg, #000000 19.4deg 29.1deg, #ef4444 29.1deg 38.8deg, #000000 38.8deg 48.5deg, #ef4444 48.5deg 58.2deg, #000000 58.2deg 67.9deg, #ef4444 67.9deg 77.6deg, #000000 77.6deg 87.3deg, #ef4444 87.3deg 97deg, #000000 97deg 106.7deg, #ef4444 106.7deg 116.4deg, #000000 116.4deg 126.1deg, #ef4444 126.1deg 135.8deg, #000000 135.8deg 145.5deg, #ef4444 145.5deg 155.2deg, #000000 155.2deg 164.9deg, #ef4444 164.9deg 174.6deg, #000000 174.6deg 184.3deg, #ef4444 184.3deg 194.1deg, #000000 194.1deg 203.7deg, #ef4444 203.7deg 213.4deg, #000000 213.4deg 223.1deg, #ef4444 223.1deg 232.8deg, #000000 232.8deg 242.5deg, #ef4444 242.5deg 252.2deg, #000000 252.2deg 261.9deg, #ef4444 261.9deg 271.6deg, #000000 271.6deg 281.3deg, #ef4444 281.3deg 291deg, #000000 291deg 300.7deg, #ef4444 300.7deg 310.4deg, #000000 310.4deg 320.1deg, #ef4444 320.1deg 329.8deg, #000000 329.8deg 339.5deg, #ef4444 339.5deg 349.2deg, #000000 349.2deg 360deg)' 
               }}
             >
                <div className="absolute inset-4 rounded-full border border-white/5" />
                <div className="absolute inset-16 rounded-full bg-slate-950 border-4 border-slate-900 flex items-center justify-center shadow-inner">
                   <div className="text-center">
                      <div className="text-[10px] text-slate-500 mb-1">BALL_VECTOR</div>
                      <div className={`text-4xl font-black ${result?.color === 'RED' ? 'text-red-500' : result?.color === 'GREEN' ? 'text-green-500' : 'text-white'}`}>
                        {result ? result.number : '--'}
                      </div>
                   </div>
                </div>
             </motion.div>
             {/* Indicator */}
             <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 w-4 h-8 bg-white clip-path-poly-down z-10" />
          </div>

          <div className="w-full max-w-xl space-y-8">
             <div className="p-6 bg-slate-900 border-2 border-red-950/30 text-center relative overflow-hidden group">
                <div className="absolute inset-y-0 left-0 w-1 bg-red-600 group-hover:w-2 transition-all" />
                <div className="text-[10px] text-red-500/50 mb-2 uppercase tracking-[0.4em]">MANDATORY_STAKE_CALCULATION</div>
                <div className="text-3xl font-black italic tracking-tighter mb-2">{requiredBet.toLocaleString()} <span className="text-xs text-slate-500">CR</span></div>
                <div className="text-[8px] text-slate-500 uppercase tracking-widest">MIN: 1,000 CR // THRESHOLD: 50% OF TOTAL EQUITY</div>
             </div>

             <div className="grid grid-cols-3 gap-6">
                <button 
                  onClick={() => setBetType('RED')}
                  className={`py-8 border-4 transition-all flex flex-col items-center gap-2 ${betType === 'RED' ? 'border-red-500 bg-red-500/20 text-red-500' : 'border-slate-900 bg-slate-900/50 text-slate-600 hover:border-red-900'}`}
                >
                   <span className="text-2xl font-black tracking-widest">RED</span>
                   <span className="text-[8px] opacity-50">PAYOUT: 2X</span>
                </button>
                <button 
                  onClick={() => setBetType('GREEN')}
                  className={`py-8 border-4 transition-all flex flex-col items-center gap-2 ${betType === 'GREEN' ? 'border-green-500 bg-green-500/20 text-green-500' : 'border-slate-900 bg-slate-900/50 text-slate-600 hover:border-green-900'}`}
                >
                   <span className="text-2xl font-black tracking-widest">0</span>
                   <span className="text-[8px] opacity-50">PAYOUT: 15X</span>
                </button>
                <button 
                  onClick={() => setBetType('BLACK')}
                  className={`py-8 border-4 transition-all flex flex-col items-center gap-2 ${betType === 'BLACK' ? 'border-black bg-white/5 text-slate-300' : 'border-slate-900 bg-slate-900/50 text-slate-600 hover:border-white/20'}`}
                >
                   <span className="text-2xl font-black tracking-widest">BLACK</span>
                   <span className="text-[8px] opacity-50">PAYOUT: 2X</span>
                </button>
             </div>

             <button 
                onClick={spin}
                disabled={isSpinning || !betType}
                className={`w-full py-6 font-black uppercase tracking-[0.4em] transition-all relative overflow-hidden ${isSpinning || !betType ? 'bg-slate-900 text-slate-700 cursor-not-allowed' : 'bg-red-600 text-white hover:bg-white hover:text-black hover:scale-[1.02]'}`}
             >
                {isSpinning ? 'SPINNING_TIMELINE...' : 'EXECUTE_WAGER'}
             </button>
          </div>
       </div>

       <style>{`
          .clip-path-poly-down { clip-path: polygon(50% 100%, 0 0, 100% 0); }
       `}</style>
    </div>
  );
}
