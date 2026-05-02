import React, { useState } from 'react';
import { UserProfile } from '../types';
import { Settings, ShieldCheck, Activity, Terminal, Key, User, FileText, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { audioService } from '../services/audioService';

export default function MiscSystems({ currentUser, onOpenTitles }: { currentUser: UserProfile, onOpenTitles: () => void }) {
  const [activeTab, setActiveTab] = useState<'PROFILE' | 'CLEARANCE' | 'LOGS'>('PROFILE');
  const [secretClicks, setSecretClicks] = useState(0);

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
                     <span className="text-[10px] text-slate-500 font-bold tracking-widest uppercase mb-4">{currentUser.role} // LVL_{currentUser.clearanceLevel}</span>
                     <div className="px-4 py-1 border border-tactical-cyan/40 bg-tactical-cyan/5 text-tactical-cyan text-[10px] font-black tracking-widest uppercase">Identity_Verified</div>
                  </div>
                  <div className="p-6 space-y-4">
                     <div className="flex justify-between items-center text-[11px] uppercase tracking-widest">
                       <span className="text-slate-600 font-bold">Encrypted_UID</span>
                       <span className="text-slate-400">{currentUser.uid.slice(0, 16)}...</span>
                     </div>
                     <div className="flex justify-between items-center text-[11px] uppercase tracking-widest">
                       <span className="text-slate-600 font-bold">Session_Time</span>
                       <span className="text-slate-400">14:02:54</span>
                     </div>
                  </div>
               </div>

               <div className="space-y-6">
                  <div className="kipher-panel p-6 bg-red-950/10 border-red-900/20">
                     <h4 className="text-xs font-black text-red-500 mb-4 flex items-center gap-2">
                        <Key size={14} /> SECURITY_OVERRIDE
                     </h4>
                     <p className="text-[10px] text-slate-500 leading-relaxed uppercase mb-6">Unauthorized access to system kernels will lead to immediate asset termination. Use caution.</p>
                     <button className="w-full kipher-button border-red-500/30 text-red-500 font-black tracking-widest hover:bg-red-500 hover:text-black">REVOKE_EXISTING_KEYS</button>
                  </div>
                  <div className="kipher-panel p-6 bg-slate-900/10">
                     <h4 
                       className="text-xs font-black text-white mb-4 cursor-pointer hover:text-tactical-cyan transition-colors select-none"
                       onClick={() => {
                         setSecretClicks(prev => {
                           const next = prev + 1;
                           if (next >= 3) {
                             audioService.playSuccess();
                             return 0;
                           }
                           return next;
                         });
                         setTimeout(() => setSecretClicks(0), 5000);
                       }}
                     >
                       PROTOCOL_SETTINGS
                     </h4>
                     <div className="space-y-4">
                        {['STEALTH_MODE', 'NOTIF_ALERTS', '2FA_ENFORCE'].map(s => (
                          <div key={s} className="flex justify-between items-center group cursor-pointer">
                             <span className="text-[10px] text-slate-500 font-bold group-hover:text-white transition-colors">{s}</span>
                             <div className="w-8 h-4 bg-slate-800 p-0.5 border border-slate-700">
                               <div className="w-3 h-full bg-tactical-cyan ml-auto"></div>
                             </div>
                          </div>
                        ))}
                        {/* Title management button - Now highly prominent */}
                        <div className="pt-6 border-t border-white/5 space-y-4">
                           <div className="text-[9px] text-slate-500 font-black uppercase tracking-[0.3em] italic mb-2">Authenticated_Achievements</div>
                           <button 
                             onClick={onOpenTitles}
                             className="w-full relative overflow-hidden group"
                           >
                              <div className="absolute inset-0 bg-tactical-cyan/20 group-hover:bg-tactical-cyan/30 transition-colors"></div>
                              <div className="absolute top-0 left-0 w-full h-0.5 bg-tactical-cyan animate-pulse"></div>
                              <div className="relative p-6 border border-tactical-cyan/50 flex items-center justify-between">
                                 <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-tactical-cyan flex items-center justify-center text-black shadow-[0_0_20px_rgba(14,165,233,0.5)] group-hover:scale-110 transition-transform">
                                       <Zap size={24} />
                                    </div>
                                    <div className="text-left">
                                       <div className="text-sm text-white font-black tracking-widest uppercase mb-1 flex items-center gap-2">
                                         HONOR_MANAGEMENT <span className="text-[8px] bg-white/10 px-1 py-0.5 text-tactical-cyan">LIVE</span>
                                       </div>
                                       <div className="text-[9px] text-tactical-cyan/80 font-bold uppercase italic tracking-tighter">
                                          Access and manage your active titles, accolades, and social recognition.
                                       </div>
                                    </div>
                                 </div>
                                 <ShieldCheck size={20} className="text-tactical-cyan opacity-40 group-hover:opacity-100 transition-opacity" />
                              </div>
                           </button>
                        </div>
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
                 <div className="max-w-xs mx-auto grid grid-cols-5 gap-2 mb-8">
                   {[1,2,3,4,5].map(v => (
                     <button 
                       key={v} 
                       className={`h-10 border transition-all flex items-center justify-center text-xs font-black ${currentUser.clearanceLevel >= v ? 'bg-tactical-cyan text-black border-tactical-cyan' : 'border-slate-800 text-slate-600 hover:border-white/20'}`}
                     >
                       {v}
                     </button>
                   ))}
                 </div>
                 <button className="kipher-button bg-white text-black px-12 font-black uppercase tracking-[0.3em] hover:bg-tactical-cyan transition-colors">
                   SUBMIT_FORM_KIPHER
                 </button>
              </div>
            </div>
          )}

          {activeTab === 'LOGS' && (
            <div className="kipher-panel p-0 overflow-hidden bg-black/40">
               <div className="p-4 border-b border-slate-900 flex justify-between items-center">
                  <h3 className="text-xs font-black text-slate-400 flex items-center gap-2">
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
