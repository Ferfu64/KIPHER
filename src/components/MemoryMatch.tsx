import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Zap, Target, Brain, Award, AlertCircle, Cpu } from 'lucide-react';
import { audioService } from '../services/audioService';

const SYMBOLS = ['⚡', '🛡️', '🎯', '🧠', '💾', '🔌', '📡', '🔥', '💎', '🔑', '🔓', '🚀'];

interface Card {
  id: number;
  symbol: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export default function MemoryMatch({ onBack, onCreditsEarned }: { onBack: () => void, onCreditsEarned: (cr: number) => void }) {
  const [cards, setCards] = useState<Card[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [gameState, setGameState] = useState<'START' | 'PLAYING' | 'GAMEOVER'>('START');
  const [difficulty, setDifficulty] = useState<'EASY' | 'HARD'>('EASY');
  const hasEarnedRef = React.useRef(false);

  useEffect(() => {
    if (cards.length > 0 && matches === cards.length / 2 && gameState === 'PLAYING') {
      setGameState('GAMEOVER');
      audioService.playSuccess();
      if (!hasEarnedRef.current) {
         const cr = difficulty === 'EASY' ? 50 : 200;
         onCreditsEarned(cr);
         hasEarnedRef.current = true;
      }
    }
  }, [matches, cards.length, gameState, difficulty, onCreditsEarned]);

  const initializeGame = (diff: 'EASY' | 'HARD') => {
    hasEarnedRef.current = false;
    const symbolCount = diff === 'EASY' ? 6 : 12;
    const selectedSymbols = SYMBOLS.slice(0, symbolCount);
    const gameSymbols = [...selectedSymbols, ...selectedSymbols];
    
    // Shuffle
    const shuffled = gameSymbols
      .sort(() => Math.random() - 0.5)
      .map((symbol, index) => ({
        id: index,
        symbol,
        isFlipped: false,
        isMatched: false
      }));

    setCards(shuffled);
    setFlipped([]);
    setMoves(0);
    setMatches(0);
    setGameState('PLAYING');
    setDifficulty(diff);
    audioService.playSuccess();
  };

  const handleCardClick = (id: number) => {
    if (flipped.length === 2 || cards[id].isFlipped || cards[id].isMatched || gameState !== 'PLAYING') return;

    const newFlipped = [...flipped, id];
    setFlipped(newFlipped);
    
    // Update card state for animation
    const newCards = [...cards];
    newCards[id].isFlipped = true;
    setCards(newCards);
    audioService.playBlip();

    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      const [first, second] = newFlipped;
      
      if (cards[first].symbol === cards[second].symbol) {
        // Match found
        setTimeout(() => {
          setCards(prev => prev.map(c => 
            c.id === first || c.id === second ? { ...c, isMatched: true } : c
          ));
          setFlipped([]);
          setMatches(m => m + 1);
          audioService.playSuccess();
        }, 500);
      } else {
        // No match
        setTimeout(() => {
          setCards(prev => prev.map(c => 
            c.id === first || c.id === second ? { ...c, isFlipped: false } : c
          ));
          setFlipped([]);
          audioService.playError();
        }, 800);
      }
    }
  };

  return (
    <div className="h-full w-full bg-slate-950 flex flex-col font-mono text-white overflow-hidden relative">
      <div className="p-4 border-b border-tactical-cyan/20 flex justify-between items-center bg-slate-900/50">
        <button onClick={onBack} className="text-slate-500 hover:text-white transition-colors flex items-center gap-2">
          <Shield size={16}/> ABORT_LINK
        </button>
        <div className="text-xl font-black text-tactical-cyan uppercase tracking-widest italic">Cortex_Decrypt_V1</div>
        <div className="flex gap-6">
           <div className="text-sm font-bold text-slate-500 uppercase tracking-tighter">MOVES: {moves}</div>
           <div className="text-sm font-bold text-tactical-cyan uppercase tracking-tighter">MATCHES: {matches}/{cards.length / 2}</div>
        </div>
      </div>

      <div className="flex-1 p-6 flex items-center justify-center relative bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.05)_0%,transparent_100%)]">
        <AnimatePresence mode="wait">
          {gameState === 'START' && (
            <motion.div 
               key="start"
               initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.1 }}
               className="max-w-xl w-full bg-slate-900 border border-white/10 p-12 text-center"
            >
               <Brain size={80} className="text-tactical-cyan mx-auto mb-8 animate-pulse" />
               <h2 className="text-4xl font-black mb-4 uppercase tracking-[0.2em]">Cortex_Memory_Sync</h2>
               <p className="text-slate-500 text-xs mb-10 uppercase tracking-widest font-bold">Synchronize neural patterns to decrypt corrupted datablocks</p>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button 
                    onClick={() => initializeGame('EASY')}
                    className="p-6 border border-white/5 bg-white/5 hover:bg-tactical-cyan hover:text-black transition-all group"
                  >
                     <div className="text-xl font-black uppercase mb-1">EASY_MODE</div>
                     <div className="text-[10px] uppercase opacity-60">12 Datablocks // Rapid Decrypt</div>
                  </button>
                  <button 
                    onClick={() => initializeGame('HARD')}
                    className="p-6 border border-white/5 bg-white/5 hover:bg-red-500 hover:text-white transition-all group"
                  >
                     <div className="text-xl font-black uppercase mb-1">HARD_MODE</div>
                     <div className="text-[10px] uppercase opacity-60">24 Datablocks // Neural Stress Test</div>
                  </button>
               </div>
            </motion.div>
          )}

          {gameState === 'PLAYING' && (
            <motion.div 
              key="playing"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className={`grid gap-4 ${difficulty === 'EASY' ? 'grid-cols-4' : 'grid-cols-4 md:grid-cols-6'} max-w-4xl w-full`}
            >
               {cards.map(card => (
                 <motion.div
                   key={card.id}
                   whileHover={{ scale: card.isMatched ? 1 : 1.05 }}
                   whileTap={{ scale: card.isMatched ? 1 : 0.95 }}
                   onClick={() => handleCardClick(card.id)}
                   className={`aspect-square relative cursor-pointer group ${card.isMatched ? 'opacity-20 pointer-events-none' : ''}`}
                 >
                    <div className={`absolute inset-0 transition-all duration-500 [transform-style:preserve-3d] ${card.isFlipped ? '[transform:rotateY(180deg)]' : ''}`}>
                       {/* Front of card (Hidden) */}
                       <div className="absolute inset-0 bg-slate-900 border border-white/10 flex items-center justify-center [backface-visibility:hidden]">
                          <Cpu size={24} className="text-slate-800 group-hover:text-tactical-cyan transition-colors" />
                       </div>
                       {/* Back of card (Symbol) */}
                       <div className="absolute inset-0 bg-tactical-cyan/10 border-2 border-tactical-cyan flex items-center justify-center [backface-visibility:hidden] [transform:rotateY(180deg)]">
                          <span className="text-4xl">{card.symbol}</span>
                       </div>
                    </div>
                 </motion.div>
               ))}
            </motion.div>
          )}

          {gameState === 'GAMEOVER' && (
             <motion.div 
               key="gameover"
               initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
               className="text-center p-12 bg-slate-900 border-t-4 border-tactical-cyan max-w-xl w-full"
             >
                <Award size={100} className="text-tactical-cyan mx-auto mb-8" />
                <h2 className="text-5xl font-black mb-4 uppercase italic">DECRYPTION_COMPLETE</h2>
                <div className="text-2xl font-black text-slate-500 mb-12 uppercase tracking-widest">
                   EFFICIENCY: {Math.round((cards.length / (moves * 2)) * 100)}% // MOVES: {moves}
                </div>
                <div className="flex gap-4">
                   <button onClick={() => setGameState('START')} className="flex-1 py-4 bg-white text-black font-black uppercase tracking-widest hover:bg-tactical-cyan transition-all">RE-SYNC</button>
                   <button onClick={onBack} className="flex-1 py-4 border border-white/20 uppercase tracking-widest hover:bg-white/5">TERMINATE</button>
                </div>
             </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Decorative Matrix Background Elements */}
      <div className="absolute inset-0 pointer-events-none opacity-5">
         <div className="absolute top-10 left-10 text-[8px] space-y-1">
            {Array.from({ length: 20 }).map((_, i) => <div key={`bg-left-${i}`}>0x{Math.random().toString(16).slice(2, 10).toUpperCase()}</div>)}
         </div>
         <div className="absolute bottom-10 right-10 text-[8px] space-y-1 text-right">
            {Array.from({ length: 20 }).map((_, i) => <div key={`bg-right-${i}`}>SY_N{Math.random().toString().slice(2, 6)}_NC</div>)}
         </div>
      </div>
    </div>
  );
}
