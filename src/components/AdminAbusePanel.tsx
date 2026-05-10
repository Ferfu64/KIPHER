import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp, query, where, getDocs, updateDoc, doc, onSnapshot } from 'firebase/firestore';
import { ShieldAlert, Zap, DollarSign, Palette, Ghost, Send, AlertTriangle, Monitor } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { handleFirestoreError, OperationType } from '../lib/utils';

export default function AdminAbusePanel() {
  const [activeEvents, setActiveEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [systemMsg, setSystemMsg] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'system_events'), where('active', '==', true));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setActiveEvents(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsubscribe();
  }, []);

  const triggerEvent = async (type: string, multiplier: number = 1, duration: number = 60, message: string = '') => {
    setLoading(true);
    try {
      await addDoc(collection(db, 'system_events'), {
        type,
        multiplier,
        duration,
        message,
        active: true,
        createdAt: serverTimestamp(),
        expiresAt: new Date(Date.now() + duration * 60000).toISOString()
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'system_events');
    } finally {
      setLoading(false);
    }
  };

  const deactivateEvent = async (eventId: string) => {
    try {
      await updateDoc(doc(db, 'system_events', eventId), { active: false });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'system_events');
    }
  };

  return (
    <div className="bg-slate-950 border-2 border-red-900/30 rounded-xl overflow-hidden font-mono shadow-[0_0_100px_rgba(127,29,29,0.1)]">
      <div className="bg-red-950/20 border-b border-red-900/30 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-red-600 p-1 rounded animate-pulse">
            <ShieldAlert size={18} className="text-black" />
          </div>
          <h2 className="text-sm font-black text-white italic tracking-widest uppercase">Admin_Abuse_Nexus // K7_OWNER</h2>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
          <span className="text-[10px] text-red-500 font-black">OVERRIDE_ACTIVE</span>
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Event Triggers */}
        <div className="space-y-4">
          <h3 className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-2 border-b border-white/5 pb-1">Global_Multipliers</h3>
          <div className="grid grid-cols-2 gap-3">
             <button 
              onClick={() => triggerEvent('LUCK_BOOST', 2, 30, 'X2_LUCK_EVENT_ACTIVE')}
              className="flex flex-col items-center gap-2 p-4 bg-indigo-950/20 border border-indigo-900/30 hover:bg-indigo-900/40 transition-all group"
            >
              <Zap className="text-indigo-400 group-hover:scale-125 transition-transform" />
              <span className="text-[10px] font-black uppercase tracking-tighter">X2_LUCK (30m)</span>
            </button>
            <button 
              onClick={() => triggerEvent('CREDIT_BOOST', 2, 30, 'X2_CREDITS_EVENT_ACTIVE')}
              className="flex flex-col items-center gap-2 p-4 bg-emerald-950/20 border border-emerald-900/30 hover:bg-emerald-900/40 transition-all group"
            >
              <DollarSign className="text-emerald-400 group-hover:scale-125 transition-transform" />
              <span className="text-[10px] font-black uppercase tracking-tighter">X2_EARNINGS (30m)</span>
            </button>
            <button 
              onClick={() => triggerEvent('RAINBOW_MODE', 1, 10, 'RAINBOW_TAKEOVER')}
              className="flex flex-col items-center gap-2 p-4 bg-pink-950/20 border border-pink-900/30 hover:bg-pink-900/40 transition-all group"
            >
              <Palette className="text-pink-400 animate-bounce" />
              <span className="text-[10px] font-black uppercase tracking-tighter">RAINBOW_MODE</span>
            </button>
          </div>

          <div className="mt-8 space-y-2">
            <h3 className="text-[10px] text-slate-500 font-bold uppercase tracking-widest border-b border-white/5 pb-1">Network_Broadcast</h3>
            <div className="flex gap-2">
              <input 
                value={systemMsg}
                onChange={(e) => setSystemMsg(e.target.value)}
                placeholder="TYPE_MESSAGE..."
                className="flex-1 bg-black border border-red-900/30 p-2 text-xs text-red-500 placeholder:text-red-900/50 outline-none"
              />
              <button 
                onClick={() => { triggerEvent('SYSTEM_MSG', 1, 5, systemMsg); setSystemMsg(''); }}
                className="bg-red-600 text-black px-4 font-black text-xs hover:bg-red-500 transition-colors uppercase"
              >
                <Send size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Right: Active Events Monitor */}
        <div className="bg-black/40 border border-white/5 p-4 rounded-lg">
          <h3 className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
            <Monitor size={12} /> Active_Hooks
          </h3>
          <div className="space-y-3">
             <AnimatePresence>
                {activeEvents.map(event => (
                  <motion.div 
                    key={event.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="bg-red-950/10 border border-red-900/30 p-3 flex items-center justify-between group"
                  >
                    <div>
                      <div className="text-[10px] font-black text-red-500 uppercase">{event.type}</div>
                      <div className="text-[9px] text-slate-500 mt-1 italic">{event.message || 'NO_PAYLOAD'}</div>
                    </div>
                    <button 
                      onClick={() => deactivateEvent(event.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity bg-red-600 text-black px-2 py-1 text-[8px] font-black uppercase rounded"
                    >
                      Kill
                    </button>
                  </motion.div>
                ))}
                {activeEvents.length === 0 && (
                  <div className="text-center py-8">
                    <AlertTriangle className="mx-auto text-slate-800 mb-2" size={32} />
                    <div className="text-[10px] text-slate-700 font-bold uppercase tracking-tighter">NO_ACTIVE_OVERRIDE_HOOKS</div>
                  </div>
                )}
             </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="bg-red-950/10 p-2 text-[8px] text-red-900/50 flex justify-between uppercase">
        <span>Kernel_Version: 7.0.1</span>
        <span>Neural_Sync: LOCKED</span>
      </div>
    </div>
  );
}
