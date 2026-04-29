import React, { useState } from 'react';
import { UserProfile } from '../types';
import Safehouse from './Safehouse';
import TheVault from './TheVault';
import { Box, Archive, HelpCircle, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function NodeGateway({ currentUser }: { currentUser: UserProfile }) {
  const [mode, setMode] = useState<'NODES' | 'VAULTS'>('NODES');

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-950/20 p-6 space-y-6">
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/5 border border-white/10 flex items-center justify-center text-tactical-cyan shadow-[0_0_20px_rgba(255,255,255,0.05)]">
            <Box size={24} />
          </div>
          <div>
            <h2 className="text-xl font-black text-white tracking-tighter uppercase">Infrastructure_Gateway</h2>
            <p className="text-[10px] text-slate-500 tracking-[0.3em] font-bold uppercase">Establish or Link with secure assets</p>
          </div>
        </div>

        <div className="flex gap-2">
          <button 
            onClick={() => setMode('NODES')}
            className={`px-6 py-2 text-[10px] font-black tracking-widest border transition-all ${mode === 'NODES' ? 'bg-tactical-cyan text-black border-tactical-cyan' : 'border-slate-800 text-slate-500 hover:border-tactical-cyan/50'}`}
          >
            <Box size={12} className="inline mr-2" /> SECURE_NODES
          </button>
          <button 
            onClick={() => setMode('VAULTS')}
            className={`px-6 py-2 text-[10px] font-black tracking-widest border transition-all ${mode === 'VAULTS' ? 'bg-tactical-cyan text-black border-tactical-cyan' : 'border-slate-800 text-slate-500 hover:border-tactical-cyan/50'}`}
          >
            <Archive size={12} className="inline mr-2" /> DATA_VAULTS
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 min-h-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            initial={{ opacity: 0, x: mode === 'NODES' ? -10 : 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: mode === 'NODES' ? 10 : -10 }}
            transition={{ duration: 0.2 }}
            className="min-h-full"
          >
            {mode === 'NODES' ? (
              <Safehouse currentUser={currentUser} />
            ) : (
              <TheVault currentUser={currentUser} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-auto pt-4 border-t border-slate-900 grid grid-cols-3 gap-4">
        <div className="p-3 bg-white/5 border border-slate-900 rounded flex items-center gap-3">
          <ShieldAlert size={14} className="text-yellow-500" />
          <div className="text-[9px] text-slate-500 uppercase font-black uppercase">Note: 1 active Node/Vault limit per agent.</div>
        </div>
        <div className="p-3 bg-white/5 border border-slate-900 rounded flex items-center gap-3">
          <HelpCircle size={14} className="text-tactical-cyan" />
          <div className="text-[9px] text-slate-500 uppercase font-black uppercase">Need more capacity? Submit a clearance request.</div>
        </div>
      </div>
    </div>
  );
}
