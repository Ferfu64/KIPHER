import React, { useState } from 'react';
import { UserProfile } from '../types';
import CommandCenter from './CommandCenter';
import AdminUserForm from './AdminUserForm';
import { ShieldAlert, Users, Radio, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

export default function GhostTerminal({ currentUser }: { currentUser: UserProfile }) {
  const [activeTab, setActiveTab] = useState<'COMMAND' | 'USERS'>('COMMAND');

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-950/20 p-6 space-y-6">
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.1)]">
            <ShieldAlert size={24} />
          </div>
          <div>
            <h2 className="text-xl font-black text-red-500 tracking-tighter">GHOST_OVERRIDE_TERMINAL</h2>
            <p className="text-[10px] text-slate-500 tracking-[0.3em] font-bold uppercase">Root Access: Confirmed // Identity: Redacted</p>
          </div>
        </div>

        <div className="flex gap-2">
          <button 
            onClick={() => setActiveTab('COMMAND')}
            className={`px-4 py-2 text-[10px] font-black tracking-widest border transition-all ${activeTab === 'COMMAND' ? 'bg-red-500 text-black border-red-500' : 'border-slate-800 text-slate-500 hover:border-red-500/50'}`}
          >
            <Radio size={12} className="inline mr-2" /> COMMAND_CONTROL
          </button>
          <button 
            onClick={() => setActiveTab('USERS')}
            className={`px-4 py-2 text-[10px] font-black tracking-widest border transition-all ${activeTab === 'USERS' ? 'bg-red-500 text-black border-red-500' : 'border-slate-800 text-slate-500 hover:border-red-500/50'}`}
          >
            <Users size={12} className="inline mr-2" /> ASSET_FABRICATION
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 min-h-0">
        <motion.div
           key={activeTab}
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           className="min-h-full"
        >
          {activeTab === 'COMMAND' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
              <div className="kipher-panel bg-slate-950/40 border-red-900/20">
                <CommandCenter currentUser={currentUser} />
              </div>
              <div className="space-y-6">
                <div className="kipher-panel bg-slate-950/40 border-slate-900 group">
                   <h3 className="text-xs font-black text-slate-400 mb-4 flex items-center gap-2">
                     <Activity size={12} className="text-red-500" /> SYSTEM_VECTORS
                   </h3>
                   <div className="space-y-4">
                     {[
                       { label: 'KERNEL_INTEGRITY', val: '99.98%', status: 'STABLE' },
                       { label: 'ENCRYPTION_SHELL', val: 'AES-4096', status: 'ACTIVE' },
                       { label: 'GHOST_MASKING', val: 'ENABLED', status: 'TOTAL' },
                       { label: 'UPLINK_STRENGTH', val: '542 GB/S', status: 'OPTIMAL' },
                     ].map(v => (
                       <div key={v.label} className="flex justify-between items-end border-b border-slate-900 pb-2">
                         <span className="text-[10px] text-slate-600 font-bold">{v.label}</span>
                         <span className="text-[10px] text-red-500 font-black">{v.val} // {v.status}</span>
                       </div>
                     ))}
                   </div>
                </div>
                <div className="kipher-panel bg-black/40 border-slate-900 p-8 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 rounded-full border-4 border-red-500/20 border-t-red-500 animate-spin mb-4"></div>
                  <p className="text-[10px] font-black text-red-500 tracking-widest uppercase">Global Surveillance Synced</p>
                </div>
              </div>
            </div>
          )}
          {activeTab === 'USERS' && (
                <div className="max-w-4xl mx-auto">
                  <AdminUserForm onComplete={() => setActiveTab('COMMAND')} />
                </div>
              )}
        </motion.div>
      </div>
    </div>
  );
}
