import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Zap, Award } from 'lucide-react';

interface Props {
  uid: string;
  defaultName: string;
  isMe?: boolean;
}

export default function ChatUserDisplay({ uid, defaultName, isMe }: Props) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const snap = await getDoc(doc(db, 'users', uid));
        if (snap.exists()) {
          setProfile(snap.data() as UserProfile);
        }
      } catch (err) {
        console.warn('Failed to fetch user profile for chat display', err);
      }
    };
    fetchProfile();
  }, [uid]);

  const activeTitle = profile?.activeTitle || (profile?.titles && profile.titles.length > 0 ? profile.titles[0] : null);

  return (
    <div className="relative inline-block">
      <div 
        className="flex items-center gap-1.5 cursor-help group"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <span className={`text-[9px] font-bold uppercase tracking-widest transition-colors ${isMe ? 'text-tactical-cyan' : 'text-slate-500 group-hover:text-white'}`}>
          {profile?.displayName || defaultName}
        </span>
        
        {activeTitle && (
          <span className="flex items-center gap-1 px-1 py-0.5 bg-tactical-cyan/10 border border-tactical-cyan/30 rounded-sm">
            <Zap size={8} className="text-tactical-cyan animate-pulse" />
            <span className="text-[7px] font-black text-tactical-cyan uppercase italic tracking-tighter">
              {activeTitle}
            </span>
          </span>
        )}
      </div>

      <AnimatePresence>
        {showTooltip && profile && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="absolute bottom-full left-0 mb-2 z-[100] w-48 kipher-panel p-3 shadow-2xl pointer-events-none"
          >
             <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/5">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${profile.role === 'OWNER' ? 'bg-red-500/20 text-red-500 border border-red-500' : 'bg-tactical-cyan/20 text-tactical-cyan border border-tactical-cyan'}`}>
                  {profile.displayName[0].toUpperCase()}
                </div>
                <div>
                   <div className="text-[10px] font-black text-white uppercase">{profile.displayName}</div>
                   <div className={`text-[7px] font-bold uppercase ${profile.role === 'OWNER' ? 'text-red-500' : 'text-tactical-cyan'}`}>{profile.role}</div>
                </div>
             </div>

             {profile.titles && profile.titles.length > 0 && (
               <div className="space-y-1">
                 <div className="text-[7px] text-slate-500 font-black uppercase tracking-widest mb-1 flex items-center gap-1">
                    <Award size={8} /> SERVICE_RECORD:
                 </div>
                 <div className="flex flex-wrap gap-1">
                    {profile.titles.map(t => (
                      <span key={t} className={`text-[6px] px-1 py-0.5 border uppercase font-black italic ${t === activeTitle ? 'bg-tactical-cyan text-black border-tactical-cyan' : 'bg-slate-900 text-slate-400 border-white/10'}`}>
                        {t}
                      </span>
                    ))}
                 </div>
               </div>
             )}

             <div className="mt-2 pt-2 border-t border-white/5 flex justify-between items-center text-[6px] font-bold text-slate-600">
                <span>CLEARANCE_L{profile.clearanceLevel}</span>
                <span>SECURED</span>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
