import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Zap, Coins, ArrowLeft, Gamepad2, Info, ChevronRight, MessageSquare, Sparkles, TrendingUp } from 'lucide-react';
import { audioService } from '../services/audioService';

interface Station {
  id: string;
  x: number;
  y: number;
  label: string;
  type: 'BLACKJACK' | 'ROULETTE' | 'PULL' | 'SLOTS' | 'CRASH';
  icon: any;
  color: string;
}

interface NPC {
  id: string;
  x: number;
  y: number;
  name: string;
  dialogue: string;
}

export default function CasinoLobby({ 
  casino, 
  user,
  onBack, 
  onEnterGame 
}: { 
  casino: any, 
  user: any,
  onBack: () => void, 
  onEnterGame: (type: 'BLACKJACK' | 'ROULETTE' | 'PULL' | 'SLOTS' | 'CRASH') => void 
}) {
  const [pos, setPos] = useState({ x: 400, y: 300 });
  const [interacting, setInteracting] = useState<string | null>(null);
  const lobbyRef = useRef<HTMLDivElement>(null);
  const keys = useRef<Record<string, boolean>>({});

  const ALL_STATIONS: Station[] = [
    { id: 'bj', x: 200, y: 150, label: 'SYMMETRY_BJ', type: 'BLACKJACK', icon: Gamepad2, color: '#a855f7' },
    { id: 'roul', x: 600, y: 150, label: 'KINETIC_ROULETTE', type: 'ROULETTE', icon: Zap, color: '#ef4444' },
    { id: 'pull', x: 400, y: 450, label: 'SYNC_ROLL_GATE', type: 'PULL', icon: Zap, color: '#22d3ee' },
    { id: 'slots', x: 400, y: 100, label: 'NEURAL_SLOTS', type: 'SLOTS', icon: Sparkles, color: '#fbbf24' },
    { id: 'crash', x: 150, y: 350, label: 'SYNAPTIC_CRASH', type: 'CRASH', icon: TrendingUp, color: '#c084fc' },
  ];

  const STATIONS = ALL_STATIONS.filter(s => {
    if (s.type === 'PULL') return true;
    if (s.type === 'SLOTS') return casino.id === 'base_station';
    if (s.type === 'BLACKJACK') return casino.id === 'neon_noir' || casino.id === 'emerald_vault' || casino.id === 'gold_standard';
    if (s.type === 'CRASH') return casino.id === 'emerald_vault' || casino.id === 'gold_standard';
    if (s.type === 'ROULETTE') return casino.id === 'gold_standard';
    return false;
  });

  const NPCS: NPC[] = [
    { id: 'dealer', x: 100, y: 100, name: 'Unit_0x32', dialogue: "Keep your cards close, Operator. The house is always watching." },
    { id: 'hacker', x: 700, y: 500, name: 'Ghost_Link', dialogue: "I've seen nodes bleed credits. Don't push your luck past the threshold." },
  ];

  useEffect(() => {
    const handleDown = (e: KeyboardEvent) => {
       if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyW', 'KeyS', 'KeyA', 'KeyD'].includes(e.code)) {
          e.preventDefault();
       }
       keys.current[e.code] = true;
    };
    const handleUp = (e: KeyboardEvent) => keys.current[e.code] = false;
    window.addEventListener('keydown', handleDown);
    window.addEventListener('keyup', handleUp);

    const loop = setInterval(() => {
      setPos(prev => {
        let newX = prev.x;
        let newY = prev.y;
        const speed = 4;

        if (keys.current['KeyW'] || keys.current['ArrowUp']) newY -= speed;
        if (keys.current['KeyS'] || keys.current['ArrowDown']) newY += speed;
        if (keys.current['KeyA'] || keys.current['ArrowLeft']) newX -= speed;
        if (keys.current['KeyD'] || keys.current['ArrowRight']) newX += speed;

        // Bounds
        newX = Math.max(50, Math.min(750, newX));
        newY = Math.max(50, Math.min(550, newY));

        // Check interaction 
        let activeInt = null;
        STATIONS.forEach(s => {
           if (Math.hypot(newX - s.x, newY - s.y) < 60) activeInt = s.id;
        });
        NPCS.forEach(n => {
           if (Math.hypot(newX - n.x, newY - n.y) < 60) activeInt = n.id;
        });
        setInteracting(activeInt);

        return { x: newX, y: newY };
      });
    }, 16);

    return () => {
      window.removeEventListener('keydown', handleDown);
      window.removeEventListener('keyup', handleUp);
      clearInterval(loop);
    };
  }, []);

  const handleAction = () => {
    const station = STATIONS.find(s => s.id === interacting);
    if (station) {
       // Check if locked
       if (casino.id === 'base_station' && (station.type === 'BLACKJACK' || station.type === 'ROULETTE')) {
          audioService.playError();
          return;
       }
       if (casino.id === 'neon_noir' && station.type === 'ROULETTE') {
          audioService.playError();
          return;
       }
       audioService.playSuccess();
       onEnterGame(station.type);
    }
  };

  useEffect(() => {
    const handleE = (e: KeyboardEvent) => {
       if (e.code === 'KeyE' || e.code === 'Space') {
          e.preventDefault();
          handleAction();
       }
    };
    window.addEventListener('keydown', handleE);
    return () => window.removeEventListener('keydown', handleE);
  }, [interacting]);

  return (
    <div className="h-full w-full bg-slate-950 relative overflow-hidden font-mono select-none">
       {/* Cinematic Backdrop */}
       <div 
         className="absolute inset-0 opacity-40 bg-cover bg-center transition-all duration-1000"
         style={{ backgroundImage: `url(${casino.image})`, filter: 'brightness(0.3) saturate(2)' }}
       />
       <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950" />
       
       {/* HUD */}
       <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-50 pointer-events-none">
          <div className="pointer-events-auto">
             <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors bg-black/40 px-4 py-2 border border-white/5 backdrop-blur-md">
                <ArrowLeft size={16} /> LEAVE_AREA
             </button>
          </div>
          <div className="text-center">
             <div className="text-2xl font-black text-white italic tracking-tighter uppercase">{casino.name}</div>
             <div className="text-[8px] text-tactical-cyan tracking-[0.4em] font-black uppercase">Lobby_Phase_0{casino.luckMult === 1 ? '1' : '3'}</div>
          </div>
          <div className="flex items-center gap-4 bg-black/40 px-4 py-2 border border-white/5 backdrop-blur-md">
             <Coins size={14} className="text-yellow-500" />
             <span className="text-sm font-bold">{user.credits?.toLocaleString()} CR</span>
          </div>
       </div>

       {/* Ground Grid */}
       <div className="absolute inset-0 z-0 opacity-10">
          <div className="w-full h-full" style={{ 
            backgroundImage: 'linear-gradient(#22d3ee 1px, transparent 1px), linear-gradient(90deg, #22d3ee 1px, transparent 1px)',
            backgroundSize: '80px 80px',
            transform: 'perspective(500px) rotateX(60deg) translateY(200px)',
            transformOrigin: 'top'
          }} />
       </div>

       {/* Viewport Map */}
       <div ref={lobbyRef} className="relative w-full h-full max-w-4xl mx-auto border-x border-white/5 bg-slate-900/20 backdrop-blur-sm shadow-2xl overflow-hidden">
          
          {/* NPC Nodes */}
          {NPCS.map(npc => (
             <div key={npc.id} className="absolute" style={{ left: npc.x, top: npc.y }}>
                <div className="relative group">
                   <div className="w-3 h-3 bg-white rounded-full animate-pulse shadow-[0_0_15px_rgba(255,255,255,0.5)]" />
                   <div className="absolute -top-10 left-1/2 -translate-x-1/2 text-[10px] font-black text-white bg-black/80 px-2 py-1 whitespace-nowrap border border-white/10 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                      {npc.name}
                   </div>
                </div>
             </div>
          ))}

          {/* Game Stations */}
          {STATIONS.map(station => (
             <div key={station.id} className="absolute" style={{ left: station.x, top: station.y }}>
                <div className="flex flex-col items-center gap-4">
                   <div 
                      className="w-16 h-16 rounded-xl border-2 flex items-center justify-center transition-all border-white/10 bg-black/40 shadow-lg shadow-white/5 hover:scale-110 hover:border-tactical-cyan group"
                      style={{ boxShadow: `0 0 20px ${station.color}20` }}
                   >
                      <station.icon size={24} style={{ color: station.color }} className="group-hover:animate-pulse" />
                   </div>
                   <div className="text-[9px] font-black uppercase tracking-[0.2em] px-2 py-1 text-white">
                      {station.label}
                   </div>
                </div>
             </div>
          ))}

          {/* Player Projection */}
          <motion.div 
            animate={{ x: pos.x - 20, y: pos.y - 20 }}
            transition={{ type: 'tween', ease: 'linear', duration: 0 }}
            className="absolute z-40 pointer-events-none"
          >
             <div className="relative">
                {/* Visual Projection */}
                <div className="w-10 h-10 border-2 border-tactical-cyan rounded-full flex items-center justify-center bg-tactical-cyan/10">
                   <User size={20} className="text-tactical-cyan" />
                </div>
                {/* Glow ring */}
                <div className="absolute inset-0 rounded-full animate-ping border border-tactical-cyan/40 scale-150 opacity-20" />
                {/* Floor shadow */}
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-2 bg-tactical-cyan/20 blur-sm rounded-full" />
             </div>
          </motion.div>

          {/* Interaction Prompts */}
          <AnimatePresence>
             {interacting && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
                  className="absolute bottom-12 left-1/2 -translate-x-1/2 z-[60] w-full max-w-sm"
                >
                   <div className="p-6 bg-slate-900 border-2 border-tactical-cyan/30 shadow-2xl backdrop-blur-xl flex flex-col items-center gap-4">
                      {NPCS.find(n => n.id === interacting) ? (
                         <>
                            <div className="flex items-center gap-3 self-start border-b border-white/5 w-full pb-2 mb-2">
                               <MessageSquare size={16} className="text-tactical-cyan" />
                               <span className="text-tactical-cyan font-black uppercase tracking-widest text-xs">
                                  {NPCS.find(n => n.id === interacting)?.name}
                               </span>
                            </div>
                            <p className="text-sm font-black italic text-slate-300 leading-relaxed uppercase">
                               "{NPCS.find(n => n.id === interacting)?.dialogue}"
                            </p>
                         </>
                      ) : (
                         <>
                            <div className="text-sm font-black text-white uppercase tracking-[0.2em] mb-1 italic">
                               ESTABLISHING_LINK: {STATIONS.find(s => s.id === interacting)?.label}
                            </div>
                            <button 
                               onClick={handleAction}
                               className="w-full py-4 bg-tactical-cyan text-black font-black uppercase tracking-[0.2em] hover:scale-[1.02] transition-transform flex items-center justify-center gap-3"
                            >
                               <ChevronRight size={18} /> INITIALIZE_SYNC [SPACE/E]
                            </button>
                         </>
                      )}
                   </div>
                </motion.div>
             )}
          </AnimatePresence>
       </div>

       {/* Footer Overlay */}
       <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/5 bg-black/60 pointer-events-none">
          <div className="flex justify-center gap-12 text-[8px] font-black text-slate-600 uppercase tracking-widest">
             <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-slate-700" /> WASD_MOVE</span>
             <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-slate-700" /> SPACE_INTERACT</span>
             <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-slate-700" /> NODE_OVERRIDE_ACTIVE</span>
          </div>
       </div>
    </div>
  );
}
