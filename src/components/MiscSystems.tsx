import React, { useState } from 'react';
import { UserProfile } from '../types';
import { Settings, ShieldCheck, Activity, Terminal, Key, User, FileText, Zap, ShieldAlert, Sparkles, Binary } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { audioService } from '../services/audioService';

export default function MiscSystems({ currentUser, onOpenSecret }: { currentUser: UserProfile, onOpenSecret: () => void }) {
  const [activeTab, setActiveTab] = useState<'PROFILE' | 'CLEARANCE' | 'LOGS'>('PROFILE');
  const [requesting, setRequesting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-950/20 p-6 space-y-6">
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 shadow-[0_0_20px_rgba(255,255,255,0.05)]">
            <Settings size={24} />
          </div>
          <div>
            <h2 className="text-xl font-black text-white tracking-tighter uppercase">Subsurface_Protocols</h2>
            <p className="text-[10px] text-slate-500 tracking-[0.3em] font-bold uppercase">System config // User preferences // Logs</p>
          </div>
        </div>

        <div className="flex gap-2">
          {['PROFILE', 'CLEARANCE', 'LOGS'].map((t) => (
            <button 
              key={t}
              onClick={() => setActiveTab(t as any)}
              className={`px-6 py-2 text-[10px] font-black tracking-widest border transition-all ${activeTab === t ? 'bg-white text-black border-white' : 'border-slate-800 text-slate-500 hover:border-white/50'}`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 min-h-0">
        <motion.div
           key={activeTab}
           initial={{ opacity: 0, scale: 0.98 }}
           animate={{ opacity: 1, scale: 1 }}
           className="max-w-3xl mx-auto py-8 min-h-full flex flex-col"
        >
          {activeTab === 'PROFILE' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="kipher-panel bg-slate-950/50">
                  <div className="flex flex-col items-center p-8 border-b border-slate-900 pb-12 relative overflow-hidden">
                     <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-tactical-cyan to-transparent opacity-20"></div>
                     <div className="w-24 h-24 bg-slate-900 border-2 border-slate-800 flex items-center justify-center text-tactical-cyan mb-6 relative">
                       <User size={48} />
                       <div className="absolute -bottom-2 -right-2 bg-tactical-cyan text-black p-1">
                         <ShieldCheck size={16} />
                       </div>
                     </div>
                     <h3 className="text-2xl font-black tracking-tighter mb-1 text-white">{currentUser.displayName}</h3>
                     <span className="text-[10px] text-slate-500 font-bold tracking-widest uppercase mb-4">{currentUser.role} // LVL_{currentUser.clearanceLevel + (currentUser.promotionCount || 0)}</span>
                     <div className="px-4 py-1 border border-tactical-cyan/40 bg-tactical-cyan/5 text-tactical-cyan text-[10px] font-black tracking-widest uppercase">Identity_Verified</div>
                  </div>
                  <div className="p-6 space-y-4">
                     <div className="flex justify-between items-center text-[11px] uppercase tracking-widest">
                       <span className="text-slate-600 font-bold">Encrypted_UID</span>
                       <span className="text-slate-400">{currentUser.uid.slice(0, 16)}...</span>
                     </div>
                     <div className="flex justify-between items-center text-[11px] uppercase tracking-widest">
                       <span className="text-slate-600 font-bold">Intel_Units</span>
                       <span className="text-tactical-cyan font-black">{currentUser.credits || 0} CR</span>
                     </div>
                  </div>
               </div>

               <div className="space-y-6">
                  {/* The "Secret" Button */}
                  <button 
                    onClick={() => { audioService.playSuccess(); onOpenSecret(); }}
                    className="w-full relative overflow-hidden group kipher-panel p-0 border-tactical-cyan/30"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-tactical-cyan/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="p-6 flex items-center gap-4 relative z-10">
                       <div className="w-12 h-12 bg-tactical-cyan flex items-center justify-center text-black shadow-[0_0_20px_rgba(34,211,238,0.4)] group-hover:rotate-12 transition-transform">
                          <Binary size={24} />
                       </div>
                       <div className="text-left">
                          <h4 className="text-sm font-black text-white uppercase tracking-widest">Secret_Operations_Hub</h4>
                          <p className="text-[10px] text-tactical-cyan/60 font-bold uppercase italic mt-1 tracking-widest">Titles // Shop // Tactical_Sims</p>
                       </div>
                    </div>
                    <div className="h-1 w-full bg-slate-900 relative">
                       <motion.div 
                         className="h-full bg-tactical-cyan"
                         animate={{ width: ['0%', '100%'] }}
                         transition={{ duration: 3, repeat: Infinity }}
                       />
                    </div>
                  </button>

                  <div className="kipher-panel p-6 bg-red-950/10 border-red-900/20">
                     <h4 className="text-xs font-black text-red-500 mb-4 flex items-center gap-2">
                        <ShieldAlert size={14} /> SECURITY_OVERRIDE
                     </h4>
                     <p className="text-[10px] text-slate-500 leading-relaxed uppercase mb-6">Unauthorized access to system kernels will lead to immediate asset termination.</p>
                     <button className="w-full py-3 border border-red-500/30 text-red-500 font-black tracking-widest hover:bg-red-500 hover:text-black transition-all uppercase text-[10px]">REVOKE_EXISTING_KEYS</button>
                  </div>
                  
                  <div className="kipher-panel p-6 bg-slate-900/10">
                     <h4 className="text-xs font-black text-white mb-4 select-none uppercase">
                       PROTOCOL_FLAGS
                     </h4>
                     <div className="space-y-4">
                        {['STEALTH_MODE', 'NOTIF_ALERTS', '2FA_ENFORCE'].map(s => (
                          <div key={s} className="flex justify-between items-center group cursor-pointer border-b border-white/5 pb-2">
                             <span className="text-[10px] text-slate-500 font-bold group-hover:text-white transition-colors">{s}</span>
                             <div className="w-8 h-4 bg-slate-800 p-0.5 border border-slate-700">
                               <div className="w-3 h-full bg-tactical-cyan ml-auto"></div>
                             </div>
                          </div>
                        ))}
                     </div>
                  </div>
               </div>
            </div>
          )}

          {activeTab === 'CLEARANCE' && (
            <div className="space-y-6">
              <div className="kipher-panel p-12 text-center bg-black/40 border-dashed border-slate-800">
                 <Activity size={48} className="mx-auto text-slate-700 mb-6" />
                 <h3 className="text-xl font-black text-white mb-2 uppercase tracking-tight">Request_Elevated_Clearance</h3>
                 <p className="text-xs text-slate-500 max-w-sm mx-auto uppercase tracking-widest leading-relaxed mb-8">
                   Operational clearance is granted based on mission requirements and asset performance. Current level: {currentUser.clearanceLevel}.
                 </p>
                 
                 {feedback && (
                   <div className="mb-8 p-3 bg-tactical-cyan/10 border border-tactical-cyan/30 text-tactical-cyan text-[10px] font-black uppercase">
                     {feedback}
                   </div>
                 )}

                 <div className="max-w-xs mx-auto grid grid-cols-5 gap-2 mb-8">
                   {[1,2,3,4,5].map(v => (
                     <div 
                       key={v} 
                       className={`h-10 border transition-all flex items-center justify-center text-xs font-black ${currentUser.clearanceLevel >= v ? 'bg-tactical-cyan text-black border-tactical-cyan shadow-[0_0_15px_rgba(34,211,238,0.3)]' : 'border-slate-800 text-slate-600'}`}
                     >
                       {v}
                     </div>
                   ))}
                 </div>
                 <button 
                   onClick={async () => {
                     setRequesting(true);
                     audioService.playBlip();
                     setTimeout(() => {
                       setRequesting(false);
                       setFeedback("CLEARANCE_AUTO_DENIED: PROMOTION_REQUIRED_IN_OPERATIONS_HUB");
                       audioService.playError();
                     }, 2000);
                   }}
                   className="px-12 py-4 bg-white text-black font-black uppercase tracking-[0.3em] hover:bg-tactical-cyan transition-colors"
                 >
                   {requesting ? 'CONNECTING...' : 'SUBMIT_FORM_KIPHER'}
                 </button>
              </div>
            </div>
          )}

          {activeTab === 'LOGS' && (
            <div className="kipher-panel p-0 overflow-hidden bg-black/40">
               <div className="p-4 border-b border-slate-900 flex justify-between items-center">
                  <h3 className="text-xs font-black text-slate-400 flex items-center gap-2 uppercase">
                    <Terminal size={14} /> SYSTEM_KERNEL_LOGS
                  </h3>
                  <div className="flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                    <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  </div>
               </div>
               <div className="p-6 font-mono text-[10px] space-y-3 leading-tight uppercase">
                  {[
                    { t: '12:04:22', m: 'AUTH_SUCCESS // UID: 0x42E', s: 'text-green-500' },
                    { t: '12:05:41', m: 'UPLINK_ESTABLISHED // NODE: ALPHA-6', s: 'text-tactical-cyan' },
                    { t: '12:10:02', m: 'DECRYPTION_RETRY // WARNING: LATENCY_HIGH', s: 'text-yellow-500' },
                    { t: '12:15:19', m: 'GHOST_MASK_ENGAGED // ASSET: REDACTED', s: 'text-red-500' },
                    { t: '12:20:44', m: 'KERNEL_IDLE', s: 'text-slate-600' },
                  ].map((l, i) => (
                    <div key={i} className="flex gap-4 border-b border-white/5 pb-2 last:border-0 hover:bg-white/5 p-2 transition-colors">
                       <span className="text-slate-700 font-bold shrink-0">{l.t}</span>
                       <span className="text-slate-500 shrink-0 select-none">»</span>
                       <span className={`${l.s} font-black`}>{l.m}</span>
                    </div>
                  ))}
               </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
