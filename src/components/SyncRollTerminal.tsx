import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Shield, Cpu, Activity, Binary, AlertCircle, ChevronRight, X } from 'lucide-react';
import { audioService } from '../services/audioService';

interface SyncRollTerminalProps {
  luck: number;
  credits: number;
  onClose: () => void;
  onExecute: () => void;
  locationName: string;
}

export default function SyncRollTerminal({ luck, credits, onClose, onExecute, locationName }: SyncRollTerminalProps) {
  const [syncStatus, setSyncStatus] = useState(0);
  const [glitch, setGlitch] = useState(false);
  const [isRolling, setIsRolling] = useState(false);
  const rollingRef = React.useRef(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setSyncStatus(prev => (prev < 100 ? prev + 1 : 100));
    }, 30);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const glitchInterval = setInterval(() => {
      setGlitch(true);
      setTimeout(() => setGlitch(false), 100);
    }, 3000);
    return () => clearInterval(glitchInterval);
  }, []);

  const handleExecute = () => {
    if (isRolling || rollingRef.current) return;
    rollingRef.current = true;
    setIsRolling(true);
    setSyncStatus(50);
    audioService.playSuccess();
    onExecute();
    // Reset status after a brief delay to allow next roll
    setTimeout(() => {
      setSyncStatus(0);
      setIsRolling(false);
      rollingRef.current = false;
    }, 1000);
  };

  return (
    <div className="absolute inset-0 z-[150] bg-slate-950 flex items-center justify-center font-mono text-white p-6 overflow-hidden">
      {/* Background Matrix/Grid */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="w-full h-full" style={{ 
          backgroundImage: 'linear-gradient(#22d3ee 1px, transparent 1px), linear-gradient(90deg, #22d3ee 1px, transparent 1px)',
          backgroundSize: '30px 30px'
        }} />
      </div>

      {/* Cyber Frame */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-4xl bg-slate-900/80 border-2 border-tactical-cyan/30 backdrop-blur-2xl relative shadow-[0_0_100px_rgba(34,211,238,0.1)] flex flex-col md:flex-row overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-tactical-cyan to-transparent animate-pulse" />
        
        {/* Left Side: Stats & Diagnostics */}
        <div className="w-full md:w-1/3 border-r border-white/5 p-8 flex flex-col gap-8 bg-black/20">
           <div>
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-4">Neural_Uplink_Node</div>
              <div className="flex items-center gap-3 mb-2">
                 <div className="w-2 h-2 rounded-full bg-tactical-cyan animate-ping" />
                 <span className="text-sm font-black text-white">{locationName}</span>
              </div>
              <div className="text-[8px] text-tactical-cyan/60 uppercase">Status: Connected_High_Bandwidth</div>
           </div>

           <div className="space-y-4">
              <div className="p-4 bg-slate-950 border border-white/5 relative overflow-hidden">
                 <div className="text-[8px] text-slate-500 uppercase mb-2">Luck_Differential</div>
                 <div className="text-3xl font-black text-tactical-cyan italic tracking-tighter">X{luck.toFixed(2)}</div>
                 <div className="h-1 bg-slate-800 mt-3 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${(luck/2.2)*100}%` }} className="h-full bg-tactical-cyan shadow-[0_0_10px_#22d3ee]" />
                 </div>
              </div>
              
              <div className="p-4 bg-slate-950 border border-white/5 relative overflow-hidden">
                 <div className="text-[8px] text-slate-500 uppercase mb-2">Credit_Liquidity</div>
                 <div className="text-3xl font-black text-yellow-500 italic tracking-tighter">{credits.toLocaleString()} <span className="text-[10px]">CR</span></div>
                 <Activity size={40} className="absolute -right-2 -bottom-2 text-yellow-500/10" />
              </div>
           </div>

           <div className="mt-auto">
              <div className="flex items-center justify-between text-[8px] text-slate-600 font-black mb-2 uppercase">
                 <span>Sync_Stabilization</span>
                 <span>{syncStatus}%</span>
              </div>
              <div className="w-full h-0.5 bg-slate-800">
                 <motion.div animate={{ width: `${syncStatus}%` }} className="h-full bg-slate-400" />
              </div>
           </div>
        </div>

        {/* Right Side: Action Console */}
        <div className="flex-1 p-8 flex flex-col relative">
           <button 
             onClick={onClose} 
             className="absolute top-4 right-4 p-2 text-slate-500 hover:text-white transition-colors"
           >
              <X size={20} />
           </button>

           <div className="flex-1 flex flex-col items-center justify-center text-center">
              <div className="relative mb-12">
                 <motion.div 
                   animate={{ 
                     rotate: [0, 360],
                     scale: [1, 1.05, 1]
                   }}
                   transition={{ 
                     rotate: { duration: 20, repeat: Infinity, ease: 'linear' },
                     scale: { duration: 2, repeat: Infinity, ease: 'easeInOut' }
                   }}
                   className="w-48 h-48 rounded-full border-4 border-tactical-cyan/20 flex items-center justify-center relative"
                 >
                    <div className="absolute inset-2 rounded-full border border-tactical-cyan/40 border-dashed" />
                    <div className="absolute inset-4 rounded-full bg-tactical-cyan/5 flex items-center justify-center">
                       <Zap size={64} className="text-tactical-cyan animate-pulse" />
                    </div>
                    
                    {/* Floating Bits */}
                    {[0, 60, 120, 180, 240, 300].map((deg, i) => (
                       <div 
                          key={i}
                          className="absolute w-2 h-2 bg-tactical-cyan shadow-[0_0_10px_#22d3ee]"
                          style={{ 
                            transform: `rotate(${deg}deg) translateY(-100px)` 
                          }}
                       />
                    ))}
                 </motion.div>
              </div>

              <h2 className={`text-4xl font-black italic tracking-tighter uppercase mb-2 ${glitch ? 'skew-x-12 opacity-50' : ''}`}>
                 Neural_Roll_V9
              </h2>
              <p className="text-[10px] text-slate-500 uppercase tracking-[0.4em] mb-12">Confirming cognitive link to orbital gacha relay...</p>

              <div className="w-full max-w-sm flex flex-col gap-4">
                 <motion.button 
                   whileHover={!isRolling ? { scale: 1.02 } : {}}
                   whileTap={!isRolling ? { scale: 0.98 } : {}}
                   onClick={handleExecute}
                   disabled={isRolling}
                   className={`w-full py-6 font-black uppercase tracking-[0.4em] transition-all shadow-2xl relative group overflow-hidden ${isRolling ? 'bg-slate-800 text-slate-500 cursor-wait' : 'bg-tactical-cyan text-black hover:bg-white'}`}
                 >
                    <div className="absolute inset-0 bg-white/40 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />
                    <span className="relative z-10">{isRolling ? 'UPLINK_IN_PROGRESS' : 'EXECUTE_SYNC'}</span>
                 </motion.button>
                 
                 <div className="flex justify-between items-center px-2">
                    <div className="flex items-center gap-2 text-[8px] text-slate-500 font-black tracking-widest uppercase">
                       <Shield size={10} /> Secure_Stream
                    </div>
                    <div className="flex items-center gap-2 text-[8px] text-slate-500 font-black tracking-widest uppercase">
                       <Binary size={10} /> Entropy_Glow_Active
                    </div>
                 </div>
              </div>
           </div>

           {/* Console Log */}
           <div className="mt-8 border-t border-white/5 pt-4">
              <div className="text-[10px] text-slate-600 flex gap-4 overflow-hidden mask-fade-right whitespace-nowrap">
                 <span>[SYS]: LINK_STABLE</span>
                 <span className="text-tactical-cyan">[AUTH]: OK</span>
                 <span>[LUCK]: {luck.toFixed(2)}</span>
                 <span className="animate-pulse">_WAITING_FOR_USER_INPUT</span>
              </div>
           </div>
        </div>
      </motion.div>
    </div>
  );
}
