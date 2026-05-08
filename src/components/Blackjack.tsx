import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Coins, ChevronLeft, Shield, Zap, TrendingUp, AlertTriangle } from 'lucide-react';
import { audioService } from '../services/audioService';

interface Card {
  suit: string;
  value: string;
  score: number;
}

const SUITS = ['♠', '♥', '♦', '♣'];
const VALUES = [
  { v: '2', s: 2 }, { v: '3', s: 3 }, { v: '4', s: 4 }, { v: '5', s: 5 },
  { v: '6', s: 6 }, { v: '7', s: 7 }, { v: '8', s: 8 }, { v: '9', s: 9 },
  { v: '10', s: 10 }, { v: 'J', s: 10 }, { v: 'Q', s: 10 }, { v: 'K', s: 10 },
  { v: 'A', s: 11 }
];

export default function Blackjack({ 
  credits, 
  onBack, 
  onUpdateCredits 
}: { 
  credits: number, 
  onBack: () => void, 
  onUpdateCredits: (cr: number) => void 
}) {
  const [deck, setDeck] = useState<Card[]>([]);
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [dealerHand, setDealerHand] = useState<Card[]>([]);
  const [gameState, setGameState] = useState<'BETTING' | 'PLAYING' | 'DEALER_TURN' | 'RESULTS'>('BETTING');
  const [bet, setBet] = useState(100);
  const [message, setMessage] = useState('');

  const createDeck = () => {
    const newDeck: Card[] = [];
    for (const suit of SUITS) {
      for (const val of VALUES) {
        newDeck.push({ suit, value: val.v, score: val.s });
      }
    }
    return newDeck.sort(() => Math.random() - 0.5);
  };

  const calculateScore = (hand: Card[]) => {
    let score = hand.reduce((acc, card) => acc + card.score, 0);
    let aces = hand.filter(c => c.value === 'A').length;
    while (score > 21 && aces > 0) {
      score -= 10;
      aces--;
    }
    return score;
  };

  const startGame = () => {
    if (credits < bet) return;
    onUpdateCredits(-bet);
    const newDeck = createDeck();
    const pHand = [newDeck.pop()!, newDeck.pop()!];
    const dHand = [newDeck.pop()!, newDeck.pop()!];
    
    setDeck(newDeck);
    setPlayerHand(pHand);
    setDealerHand(dHand);
    setGameState('PLAYING');
    setMessage('Tactical Decision Required.');
    audioService.playBlip();

    if (calculateScore(pHand) === 21) {
       resolveGame('BLACKJACK');
    }
  };

  const hit = () => {
    if (gameState !== 'PLAYING') return;
    const newDeck = [...deck];
    const card = newDeck.pop()!;
    const newHand = [...playerHand, card];
    
    setDeck(newDeck);
    setPlayerHand(newHand);
    audioService.playBlip();

    if (calculateScore(newHand) > 21) {
      resolveGame('BUST');
    }
  };

  const stand = () => {
    if (gameState !== 'PLAYING') return;
    setGameState('DEALER_TURN');
  };

  useEffect(() => {
    if (gameState === 'DEALER_TURN') {
      const currentScore = calculateScore(dealerHand);
      if (currentScore < 17) {
        const timer = setTimeout(() => {
          const newDeck = [...deck];
          const card = newDeck.pop()!;
          setDeck(newDeck);
          setDealerHand(prev => [...prev, card]);
          audioService.playBlip();
        }, 600);
        return () => clearTimeout(timer);
      } else {
        const timer = setTimeout(() => {
          compareHands(dealerHand);
        }, 300);
        return () => clearTimeout(timer);
      }
    }
  }, [gameState, dealerHand]);

  const compareHands = (finalDealerHand: Card[]) => {
    const pScore = calculateScore(playerHand);
    const dScore = calculateScore(finalDealerHand);

    if (dScore > 21) resolveGame('DEALER_BUST');
    else if (pScore > dScore) resolveGame('WIN');
    else if (pScore < dScore) resolveGame('LOSE');
    else resolveGame('PUSH');
  };

  const resolveGame = (result: 'WIN' | 'LOSE' | 'PUSH' | 'BLACKJACK' | 'BUST' | 'DEALER_BUST') => {
    setGameState('RESULTS');
    let payout = 0;
    
    switch(result) {
      case 'WIN': 
        payout = bet * 2; 
        setMessage('SUCCESS: Combat Efficiency Proven.');
        break;
      case 'BLACKJACK': 
        payout = Math.floor(bet * 2.5); 
        setMessage('CRITICAL_HIT: Neural Superiority Synchronized.');
        break;
      case 'DEALER_BUST': 
        payout = bet * 2; 
        setMessage('TARGET_OVERHEAT: Dealer Link Severed.');
        break;
      case 'PUSH': 
        payout = bet; 
        setMessage('STALEMATE: Network Load Balanced.');
        break;
      case 'BUST': 
        setMessage('FAILURE: Cognitive Load Exceeded.');
        break;
      case 'LOSE': 
        setMessage('DEFEAT: Security Protocol Overwhelmed.');
        break;
    }

    if (payout > 0) {
      onUpdateCredits(payout);
      audioService.playSuccess();
    } else {
      audioService.playError();
    }
  };

  return (
    <div className="h-full w-full bg-slate-950 flex flex-col font-mono text-white select-none">
       <div className="p-4 border-b border-white/10 flex justify-between items-center bg-slate-900/50">
          <button onClick={onBack} className="text-slate-500 hover:text-white transition-colors flex items-center gap-2">
            <ChevronLeft size={16}/> EXIT_CASINO
          </button>
          <div className="text-xl font-black text-tactical-cyan italic tracking-widest">BLACKJACK_PROTOCOL_V4</div>
          <div className="flex items-center gap-2 bg-slate-900 px-3 py-1 rounded border border-white/5">
             <Coins size={14} className="text-yellow-500" />
             <span className="text-sm font-bold tabular-nums">{credits.toLocaleString()} CR</span>
          </div>
       </div>

       <div className="flex-1 flex flex-col items-center justify-center p-8 relative">
          {/* Dealer Area */}
          <div className="mb-12 text-center">
             <div className="text-[10px] text-slate-500 mb-4 uppercase tracking-[0.3em]">DEALER_COMMAND</div>
             <div className="flex gap-4 justify-center h-40">
                {dealerHand.map((card, i) => (
                   <CardUI key={i} card={card} hidden={gameState === 'PLAYING' && i === 1} />
                ))}
             </div>
             {gameState !== 'BETTING' && gameState !== 'PLAYING' && (
                <div className="mt-4 text-sm font-black text-white uppercase italic">SCORE: {calculateScore(dealerHand)}</div>
             )}
          </div>

          {/* Message Area */}
          <div className="h-12 flex items-center justify-center mb-4">
             <AnimatePresence mode="wait">
                <motion.div 
                  key={message}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                  className="text-tactical-cyan font-black uppercase text-xs tracking-widest italic"
                >
                   {message}
                </motion.div>
             </AnimatePresence>
          </div>

          {/* Player Area */}
          <div className="mb-12 text-center">
             <div className="flex gap-4 justify-center h-40">
                {playerHand.map((card, i) => (
                   <CardUI key={i} card={card} />
                ))}
             </div>
             {playerHand.length > 0 && (
                <div className="mt-4 text-sm font-black text-white uppercase italic">NEURAL_SCORE: {calculateScore(playerHand)}</div>
             )}
             <div className="text-[10px] text-slate-500 mt-4 uppercase tracking-[0.3em]">USER_INTERFACE</div>
          </div>

          {/* Actions */}
          <div className="w-full max-w-md">
             {gameState === 'BETTING' ? (
                <div className="space-y-6">
                   <div className="flex items-center justify-between text-[10px] uppercase font-black text-slate-500 mb-2">
                      <span>STAKE_ALLOCATION</span>
                      <span>MAX_OP_RISK</span>
                   </div>
                   <div className="flex gap-4">
                      {[100, 500, 1000, 5000].map(val => (
                        <button 
                          key={val}
                          onClick={() => setBet(val)}
                          className={`flex-1 py-3 border transition-all ${bet === val ? 'bg-tactical-cyan text-black border-tactical-cyan' : 'border-white/10 text-white/40 hover:border-white/20'}`}
                        >
                           {val}
                        </button>
                      ))}
                   </div>
                   <button 
                      onClick={startGame}
                      className="w-full py-4 bg-white text-black font-black uppercase tracking-[0.2em] hover:bg-tactical-cyan transition-all"
                   >
                      INITIALIZE_HAND
                   </button>
                </div>
             ) : gameState === 'PLAYING' ? (
                <div className="flex gap-4">
                   <button onClick={hit} className="flex-1 py-6 bg-slate-900 border border-white/20 font-black uppercase tracking-widest hover:border-tactical-cyan transition-all">HIT</button>
                   <button onClick={stand} className="flex-1 py-6 bg-slate-900 border border-white/20 font-black uppercase tracking-widest hover:border-tactical-cyan transition-all">STAND</button>
                </div>
             ) : gameState === 'RESULTS' ? (
                <button 
                  onClick={() => {
                    setGameState('BETTING');
                    setPlayerHand([]);
                    setDealerHand([]);
                    setMessage('');
                  }}
                  className="w-full py-4 bg-tactical-cyan text-black font-black uppercase tracking-[0.2em]"
                >
                   RECUT_DEAL
                </button>
             ) : (
                <div className="text-center py-6 animate-pulse text-slate-500 font-black uppercase">DEALER_EXECUTING_LOGIC...</div>
             )}
          </div>
       </div>
    </div>
  );
}

function CardUI({ card, hidden }: { card: Card; hidden?: boolean }) {
  if (hidden) return (
     <motion.div initial={{ scale: 0.8, rotateY: 90 }} animate={{ scale: 1, rotateY: 0 }} className="w-24 h-36 bg-slate-900 border-2 border-slate-800 rounded-lg flex items-center justify-center p-2">
        <div className="w-full h-full border border-slate-800 flex items-center justify-center relative overflow-hidden">
           <Zap className="text-slate-800" size={40} />
           <div className="absolute top-0 left-0 w-full h-1 bg-tactical-cyan/10" />
        </div>
     </motion.div>
  );

  const isRed = card.suit === '♥' || card.suit === '♦';

  return (
    <motion.div initial={{ scale: 0.8, rotateY: 90 }} animate={{ scale: 1, rotateY: 0 }} className="w-24 h-36 bg-white rounded-lg p-2 text-black flex flex-col justify-between shadow-lg shadow-black/50">
       <div className={`text-lg font-black leading-none ${isRed ? 'text-red-600' : 'text-black'}`}>
          {card.value}<br/>
          <span className="text-sm">{card.suit}</span>
       </div>
       <div className={`text-4xl self-center ${isRed ? 'text-red-600' : 'text-black'}`}>{card.suit}</div>
       <div className={`text-lg font-black leading-none self-end scale-x-[-1] scale-y-[-1] ${isRed ? 'text-red-600' : 'text-black'}`}>
          {card.value}<br/>
          <span className="text-sm">{card.suit}</span>
       </div>
    </motion.div>
  );
}
