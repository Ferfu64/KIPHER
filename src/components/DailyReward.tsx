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
      }, 1500);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'users');
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-[1000] p-4 pointer-events-none">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, x: 50 }}
        animate={{ scale: 1, opacity: 1, x: 0 }}
        className="relative w-80 bg-[#0a0a0c]/95 border-2 border-tactical-cyan/40 rounded-xl overflow-hidden shadow-[0_0_50px_rgba(34,211,238,0.15)] pointer-events-auto backdrop-blur-md"
      >
        <div className="p-5 flex flex-col items-center text-center">
          <div className="w-full flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <Gift className="text-tactical-cyan" size={14} />
              <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Neural_Reward</span>
            </div>
            <button onClick={onClose} className="text-slate-600 hover:text-white transition-colors">
              <ChevronRight size={14} className="rotate-90" />
            </button>
          </div>

          <div className="w-full bg-tactical-cyan/5 border border-tactical-cyan/20 rounded-lg p-4 mb-4 flex justify-between items-center group transition-all">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-tactical-cyan/10 rounded-lg">
                <Coins className="text-amber-500" size={20} />
              </div>
              <div className="text-left">
                <div className="text-2xl font-black text-white italic tracking-tighter">{rewardAmount}</div>
                <div className="text-[8px] font-bold text-slate-500 uppercase">Credits // Packet</div>
              </div>
            </div>
            <div className="text-[10px] text-tactical-cyan/40 font-black italic">24H</div>
          </div>

          <AnimatePresence mode="wait">
            {!claimed ? (
              <motion.button 
                key="claim-btn"
                whileHover={{ scale: 1.02, backgroundColor: '#00f3ff' }}
                whileTap={{ scale: 0.98 }}
                onClick={handleClaim}
                className="w-full py-3 bg-tactical-cyan/90 text-black font-black uppercase text-[10px] flex items-center justify-center gap-2 rounded-lg transition-all"
              >
                Claim_Reward <ChevronRight size={14} />
              </motion.button>
            ) : (
              <motion.div 
                key="claimed-status"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full py-3 bg-emerald-500/20 border border-emerald-500/50 text-emerald-500 font-black uppercase text-[10px] flex items-center justify-center gap-2 rounded-lg"
              >
                <CheckCircle2 size={14} /> Requisitioned
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
