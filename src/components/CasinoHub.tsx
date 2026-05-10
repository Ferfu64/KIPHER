import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, 
  MapPin, 
  ChevronRight, 
  Zap, 
  Shield, 
  TrendingUp, 
  Sparkles, 
  Dices,
  Lock,
  Coins,
  ArrowLeft
} from 'lucide-react';
import { audioService } from '../services/audioService';
import Blackjack from './Blackjack';
import Roulette from './Roulette';
import SlotsGame from './SlotsGame';
import CrashGame from './CrashGame';
import SyncRollTerminal from './SyncRollTerminal';
import CasinoLobby from './CasinoLobby';

interface CasinoLocation {
  id: string;
  name: string;
  desc: string;
  cost: number;
  luckMult: number; 
  image: string;
  color: string;
}

const LOCATIONS: CasinoLocation[] = [
  {
    id: 'base_station',
    name: "Terminal_7_Pulls",
    desc: "Standard localized gacha node. Industrial-grade neural sync.",
    cost: 0,
    luckMult: 1.0,
    image: "https://images.unsplash.com/photo-1510511459019-5dee592da13e?auto=format&fit=crop&q=80&w=1200",
    color: "#22d3ee"
  },
  {
    id: 'neon_noir',
    name: "Noir_District_Lounge",
    desc: "Premium sector with optimized pull frequency and Blackjack access.",
    cost: 15000,
    luckMult: 1.25,
    image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=1200",
    color: "#a855f7"
  },
  {
    id: 'emerald_vault',
    name: "Emerald_Nexus_High",
    desc: "Elite gathering point. Increased critical pulls and Roulette access.",
    cost: 50000,
    luckMult: 1.6,
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1200",
    color: "#10b981"
  },
  {
    id: 'gold_standard',
    name: "Sovereign_Gold_Reserve",
    desc: "The ultimate peak of luxury. Near-impossible luck stats and no-limit gaming.",
    cost: 250000,
    luckMult: 2.2,
    image: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&q=80&w=1200",
    color: "#fbbf24"
  }
];

export default function CasinoHub({ 
  user, 
  onClose, 
  onPull, 
  rollSpeedMultiplier,
  onUpdateCredits,
  onUnlockCasino
}: { 
  user: any, 
  onClose: () => void, 
  onPull: (luck: number) => void,
  rollSpeedMultiplier: number,
  onUpdateCredits: (cr: number) => void,
  onUnlockCasino: (id: string, cost: number) => void
}) {
  const [selectedLoc, setSelectedLoc] = useState<CasinoLocation | null>(null);
  const [activeGame, setActiveGame] = useState<'NONE' | 'BLACKJACK' | 'ROULETTE' | 'PULL' | 'SLOTS' | 'CRASH'>('NONE');
  const [viewState, setViewState] = useState<'MAP' | 'LOBBY'>('MAP');

  const unlocked = user.unlockedCasinos || ['base_station'];

  const renderGame = () => {
    switch(activeGame) {
      case 'BLACKJACK': return <Blackjack credits={user.credits || 0} onBack={() => setActiveGame('NONE')} onUpdateCredits={onUpdateCredits} />;
      case 'ROULETTE': return <Roulette credits={user.credits || 0} onBack={() => setActiveGame('NONE')} onUpdateCredits={onUpdateCredits} />;
      case 'SLOTS': return <SlotsGame credits={user.credits || 0} onBack={() => setActiveGame('NONE')} onUpdateCredits={onUpdateCredits} />;
      case 'CRASH': return <CrashGame credits={user.credits || 0} onBack={() => setActiveGame('NONE')} onUpdateCredits={onUpdateCredits} />;
      case 'PULL': return (
        <SyncRollTerminal 
          luck={selectedLoc?.luckMult || 1}
          credits={user.credits || 0}
          locationName={selectedLoc?.name || 'UNKNOWN_NODE'}
          rollSpeedMultiplier={rollSpeedMultiplier}
          onClose={() => setActiveGame('NONE')}
          onExecute={() => {
             onPull(selectedLoc?.luckMult || 1);
             // Removed setActiveGame('NONE') to stay in terminal context
          }}
        />
      );
      default: return null;
    }
  };

  if (viewState === 'LOBBY' && selectedLoc) {
     return (
        <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col">
           <CasinoLobby 
             casino={selectedLoc}
             user={user}
             onBack={() => setViewState('MAP')}
             onEnterGame={setActiveGame}
           />
           <AnimatePresence>
             {activeGame !== 'NONE' && (
                <motion.div initial={{ opacity: 0, scale: 1.1 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.1 }} className="absolute inset-0 z-[110]">
                   {renderGame()}
                </motion.div>
             )}
           </AnimatePresence>
        </div>
     );
  }

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col font-mono text-white overflow-hidden pointer-events-auto">
       {/* Background Ambience */}
       <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,_#1e293b_0%,_transparent_60%)] opacity-50" />
       
       <AnimatePresence>
          {activeGame !== 'NONE' ? (
             <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25 }} className="absolute inset-0 z-50 pt-1">
                {renderGame()}
             </motion.div>
          ) : null}
       </AnimatePresence>

       {/* Header */}
       <div className="relative p-6 flex justify-between items-center border-b border-white/5 z-10 bg-slate-950/80 backdrop-blur-md">
          <div className="flex items-center gap-4">
             <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                <ArrowLeft size={24} />
             </button>
             <div>
                <h1 className="text-2xl font-black italic tracking-tighter uppercase">District_Sector</h1>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest">Select orbital casino coordinates</p>
             </div>
          </div>
          <div className="flex items-center gap-6">
             <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">COMMAND_EQUITY</div>
                <div className="text-xl font-black text-tactical-cyan">{(user.credits || 0).toLocaleString()} <span className="text-[10px] opacity-50">CR</span></div>
             </div>
          </div>
       </div>

       {/* District Map / Selector */}
       <div className="flex-1 p-8 relative z-10 overflow-y-auto">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
             {LOCATIONS.map((loc) => {
                const isUnlocked = unlocked.includes(loc.id);
                const isSelected = selectedLoc?.id === loc.id;
                
                return (
                   <motion.div 
                     key={loc.id}
                     whileHover={{ y: -10 }}
                     onClick={() => isUnlocked ? setSelectedLoc(loc) : null}
                     className={`group relative aspect-[3/4] overflow-hidden border-2 transition-all cursor-pointer ${isUnlocked ? (isSelected ? 'border-tactical-cyan shadow-lg shadow-tactical-cyan/20' : 'border-slate-800 hover:border-slate-600') : 'border-slate-900 opacity-60'}`}
                   >
                      <img src={loc.image} className="absolute inset-0 w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" alt={loc.name} />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                      
                      <div className="absolute inset-0 p-6 flex flex-col justify-end">
                         {!isUnlocked && (
                            <div className="mb-auto">
                               <Lock className="text-white/20 mb-2" size={24} />
                               <div className="p-3 bg-black/60 backdrop-blur-md border border-white/10">
                                   <div className="text-[8px] text-slate-400 mb-1">REQUISITION_COST</div>
                                   <div className="text-sm font-black text-yellow-500 mb-3">{loc.cost.toLocaleString()} CR</div>
                                   <button 
                                     onClick={(e) => { e.stopPropagation(); onUnlockCasino(loc.id, loc.cost); }}
                                     className="w-full py-2 bg-yellow-500 text-black text-[9px] font-black uppercase"
                                   >
                                      UNLOCK_ACCESS
                                   </button>
                               </div>
                            </div>
                         )}
                         
                         <div className="relative">
                            <div className="text-[8px] text-tactical-cyan font-black mb-1 flex items-center gap-1 uppercase">
                               <MapPin size={8} /> Sector_{loc.luckMult === 1 ? '7A' : loc.luckMult === 1.2 ? '9C' : loc.luckMult === 1.5 ? '2B' : 'X1'}
                            </div>
                            <h3 className="text-lg font-black leading-tight mb-2 uppercase break-words">{loc.name}</h3>
                            <p className="text-[10px] text-slate-400 line-clamp-2 uppercase italic mb-4">{loc.desc}</p>
                            
                            {isUnlocked && (
                               <div className="flex gap-2">
                                  <div className="flex-1 h-1 bg-tactical-cyan/20 rounded-full overflow-hidden">
                                     <div className="h-full bg-tactical-cyan" style={{ width: `${(loc.luckMult-0.5)/1.5 * 100}%` }} />
                                  </div>
                                  <span className="text-[8px] font-black text-tactical-cyan uppercase">LUCK_X{loc.luckMult.toFixed(1)}</span>
                               </div>
                            )}
                         </div>
                      </div>
                   </motion.div>
                );
             })}
          </div>

          <AnimatePresence>
             {selectedLoc && (
                <motion.div 
                  initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }}
                  className="mt-12 max-w-4xl mx-auto p-12 bg-slate-900 border-2 border-tactical-cyan/30 relative"
                >
                   <div className="absolute top-0 right-0 p-4">
                      <Sparkles className="text-tactical-cyan animate-pulse" />
                   </div>
                   
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
                      <div className="md:col-span-1 space-y-4 pl-4">
                         <h2 className="text-4xl font-black uppercase tracking-tight">{selectedLoc.name}</h2>
                         <p className="text-xs text-slate-400 font-bold uppercase leading-relaxed">{selectedLoc.desc}</p>
                      </div>
                      
                      <div className="md:col-span-2 grid grid-cols-2 gap-4">
                         <GameOption 
                           icon={Zap} title="NEURAL_ROLL" desc="Standard credit pull" 
                           onClick={() => setActiveGame('PULL')} 
                         />
                         {(selectedLoc.id === 'neon_noir' || selectedLoc.id === 'emerald_vault' || selectedLoc.id === 'gold_standard') && (
                           <GameOption 
                             icon={Dices} title="BLACKJACK" desc="Tactical sequence sync" 
                             onClick={() => setActiveGame('BLACKJACK')} 
                           />
                         )}
                         {(selectedLoc.id === 'emerald_vault' || selectedLoc.id === 'gold_standard') && (
                           <GameOption 
                             icon={TrendingUp} title="SYNAPTIC_CRASH" desc="High-risk entropy loop" 
                             onClick={() => setActiveGame('CRASH')} 
                           />
                         )}
                         {selectedLoc.id === 'gold_standard' && (
                           <GameOption 
                             icon={Shield} title="ROULETTE" desc="High stake entropy" 
                             onClick={() => setActiveGame('ROULETTE')} 
                           />
                         )}
                         {selectedLoc.id === 'base_station' && (
                           <GameOption 
                             icon={Sparkles} title="NEURAL_SLOTS" desc="Classic sequence match" 
                             onClick={() => setActiveGame('SLOTS')} 
                           />
                         )}
                         <GameOption 
                           icon={Building2} title="ENTER_SUITE" desc="Visual hub immersion" 
                           onClick={() => setViewState('LOBBY')} 
                         />
                      </div>
                   </div>
                </motion.div>
             )}
          </AnimatePresence>
       </div>
    </div>
  );
}

function GameOption({ icon: Icon, title, desc, onClick, disabled }: { icon: any, title: string, desc: string, onClick: () => void, disabled?: boolean }) {
  if (disabled) return (
    <div className="p-4 bg-slate-950 border border-slate-900 opacity-40 cursor-not-allowed">
       <Lock className="mb-2" size={20} />
       <div className="text-[10px] font-black uppercase text-slate-700">{title}</div>
       <div className="text-[8px] text-slate-800 uppercase italic">LOCKED_IN_THIS_SECTOR</div>
    </div>
  );

  return (
    <button 
      onClick={onClick}
      className="p-4 bg-slate-950 border border-white/5 hover:border-tactical-cyan text-left group transition-all"
    >
       <Icon size={20} className="text-slate-500 group-hover:text-tactical-cyan mb-2 transition-colors" />
       <div className="text-[10px] font-black uppercase text-white group-hover:text-tactical-cyan">{title}</div>
       <div className="text-[8px] text-slate-500 uppercase italic whitespace-nowrap">{desc}</div>
    </button>
  );
}
