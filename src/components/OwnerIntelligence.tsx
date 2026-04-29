import React from 'react';
import { UserProfile } from '../types';
import TheGrid from './TheGrid';
import { ShieldCheck, Activity, Zap, Cpu, Globe } from 'lucide-react';

export default function OwnerIntelligence({ currentUser }: { currentUser: UserProfile }) {
  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-950/20 p-6 space-y-6">
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-tactical-cyan/10 border border-tactical-cyan/30 flex items-center justify-center text-tactical-cyan shadow-[0_0_20px_rgba(34,211,238,0.1)]">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h2 className="text-xl font-black text-white tracking-tighter">MASTER_INTELLIGENCE_CORE</h2>
            <p className="text-[10px] text-slate-500 tracking-[0.3em] font-bold uppercase">Auth: Owner // Clearance: LVL_5</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6 flex-1 min-h-0 overflow-hidden">
        {/* Left: Asset directory but full info */}
        <div className="col-span-8 flex flex-col min-h-0 overflow-hidden kipher-panel bg-black/20 border-slate-900">
           <div className="p-4 border-b border-slate-900 flex justify-between items-center bg-slate-900/10 shrink-0">
             <h3 className="text-xs font-black text-tactical-cyan flex items-center gap-2">
               <Globe size={12} /> GLOBAL_ASSET_STATUS
             </h3>
             <span className="text-[9px] text-slate-600 font-bold uppercase">Tracking 50+ Nodes</span>
           </div>
           <div className="flex-1 overflow-y-auto custom-scrollbar min-h-0">
             <TheGrid currentUser={currentUser} />
           </div>
        </div>

        {/* Right: Metrics & Intel */}
        <div className="col-span-4 space-y-6 overflow-y-auto custom-scrollbar pr-2 min-h-0">
           <div className="kipher-panel bg-slate-900/20 border-slate-800">
             <h3 className="text-xs font-black text-white mb-4 flex items-center gap-2">
               <Activity size={12} className="text-tactical-cyan" /> OPERATIONAL_HEALTH
             </h3>
             <div className="space-y-4">
               <div className="flex justify-between items-end">
                 <span className="text-[10px] text-slate-500">NETWORK_LOAD</span>
                 <div className="w-24 h-1 bg-slate-800 rounded-full overflow-hidden">
                   <div className="w-2/3 h-full bg-tactical-cyan"></div>
                 </div>
               </div>
               <div className="flex justify-between items-end">
                 <span className="text-[10px] text-slate-500">THREAT_LEVEL</span>
                 <span className="text-[10px] text-yellow-500 font-black uppercase">Elevated</span>
               </div>
             </div>
           </div>

           <div className="kipher-panel bg-tactical-cyan/5 border-tactical-cyan/20">
             <h3 className="text-xs font-black text-tactical-cyan mb-4 flex items-center gap-2 uppercase">
               <Zap size={12} /> Strategic_Directives
             </h3>
             <ul className="text-[11px] space-y-3 text-slate-300 italic leading-relaxed">
               <li>• MONITOR ALPHA_CORE FOR UNUSUAL TRAFFIC PATTERNS.</li>
               <li>• ENSURE ALL AGENTS MAINTAIN LVL_2 CLEARANCE FOR UPCOMING OP.</li>
               <li>• VAULT REPLICATION IN PROGRESS.</li>
             </ul>
           </div>

           <div className="kipher-panel border-slate-900">
             <h3 className="text-xs font-black text-white mb-4 flex items-center gap-2 uppercase">
                <Cpu size={12} className="text-slate-500" /> Computing_Efficiency
             </h3>
             <div className="h-32 flex items-end gap-1 px-2">
               {[40, 60, 30, 80, 50, 90, 70, 45, 65, 85].map((h, i) => (
                 <div key={i} className="flex-1 bg-slate-800 hover:bg-tactical-cyan transition-colors" style={{ height: `${h}%` }}></div>
               ))}
             </div>
           </div>
        </div>
      </div>
    </div>
  );
}
