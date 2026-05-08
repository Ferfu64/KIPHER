import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, Sparkles, Coins, Clock, ChevronRight, CheckCircle2 } from 'lucide-react';
import { db } from '../lib/firebase';
import { doc, updateDoc, serverTimestamp, increment } from 'firebase/firestore';
import { UserProfile } from '../types';
import { handleFirestoreError, OperationType } from '../lib/utils';

interface DailyRewardProps {
  user: UserProfile;
  onClaim: () => void;
  onClose: () => void;
}

export default function DailyReward({ user, onClaim, onClose }: DailyRewardProps) {
  const [claimed, setClaimed] = useState(false);
  const rewardAmount = 500; // Standard 10-hour reward

  const handleClaim = async () => {
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        credits: increment(rewardAmount),
        lastRewardTime: serverTimestamp()
      });
      setClaimed(true);
      setTimeout(() => {
        onClaim();
      }, 2000);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'users');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="relative w-full max-w-md bg-[#0a0a0c] border-[1px] border-white/10 rounded-2xl overflow-hidden shadow-[0_0_100px_rgba(255,255,255,0.05)]"
      >
        {/* Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[200px] bg-tactical-cyan/10 blur-[80px] pointer-events-none" />
        
        <div className="p-8 flex flex-col items-center text-center relative z-10">
          <motion.div 
            animate={{ 
              rotate: [0, 10, -10, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ duration: 4, repeat: Infinity }}
            className="w-24 h-24 bg-tactical-cyan/10 rounded-3xl flex items-center justify-center mb-6 border border-tactical-cyan/20 shadow-[0_0_30px_rgba(0,243,255,0.1)]"
          >
            <Gift className="text-tactical-cyan" size={48} />
          </motion.div>

          <h2 className="text-2xl font-black text-white italic tracking-widest uppercase mb-2">Neural_Packet_Drop</h2>
          <p className="text-slate-500 text-xs font-mono mb-8 uppercase tracking-tighter">Your network loyalty bonus is ready for requisitioning.</p>

          <div className="w-full bg-white/5 border border-white/10 rounded-xl p-6 mb-8 flex flex-col items-center group hover:bg-white/[0.08] transition-colors">
            <div className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mb-2 font-mono">REWARD_PAYLOAD</div>
            <div className="flex items-center gap-3">
              <Coins className="text-amber-500" size={24} />
              <span className="text-4xl font-black text-white italic tracking-tighter">{rewardAmount}</span>
              <span className="text-xs font-black text-amber-500/50 uppercase mt-4">CREDITS</span>
            </div>
            <div className="mt-4 flex items-center gap-2 text-[9px] text-slate-600 font-bold uppercase tracking-widest">
              <Clock size={10} /> Valid Every 10 Hours
            </div>
          </div>

          <AnimatePresence mode="wait">
            {!claimed ? (
              <motion.button 
                key="claim-btn"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleClaim}
                className="w-full py-4 bg-tactical-cyan text-black font-black uppercase italic flex items-center justify-center gap-3 rounded-xl hover:shadow-[0_0_30px_rgba(0,243,255,0.3)] transition-all"
              >
                Claim Intelligence Packet <ChevronRight size={18} />
              </motion.button>
            ) : (
              <motion.div 
                key="claimed-status"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full py-4 bg-emerald-500/20 border border-emerald-500/50 text-emerald-500 font-black uppercase flex items-center justify-center gap-3 rounded-xl"
              >
                <CheckCircle2 size={18} /> Requisition_Acknowledged
              </motion.div>
            )}
          </AnimatePresence>

          <button 
            onClick={onClose}
            className="mt-6 text-[9px] text-slate-700 hover:text-slate-500 font-black uppercase tracking-[0.3em] transition-colors"
          >
            Dismiss_Link_Gateway
          </button>
        </div>

        {/* Decorative corner accents */}
        <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/20" />
        <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-white/20" />
        <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-white/20" />
        <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/20" />
      </motion.div>
    </div>
  );
}
