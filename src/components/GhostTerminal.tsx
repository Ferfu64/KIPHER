import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { UserProfile, ChatMessage, Connection } from '../types';
import CommandCenter from './CommandCenter';
import AdminUserForm from './AdminUserForm';
import { ShieldAlert, Users, Radio, Activity, MessageSquare, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { handleFirestoreError, OperationType, ensureDate } from '../lib/utils';

export default function GhostTerminal({ currentUser }: { currentUser: UserProfile }) {
  const [activeTab, setActiveTab] = useState<'COMMAND' | 'USERS' | 'COMM'>('COMMAND');

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-950/20 p-6 space-y-6">
      <div className="flex items-center justify-between border-b border-white/5 pb-4 shrink-0">
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
            onClick={() => setActiveTab('COMM')}
            className={`px-4 py-2 text-[10px] font-black tracking-widest border transition-all ${activeTab === 'COMM' ? 'bg-red-500 text-black border-red-500' : 'border-slate-800 text-slate-500 hover:border-red-500/50'}`}
          >
            <MessageSquare size={12} className="inline mr-2" /> COMM_OVERRIDE
          </button>
          <button 
            onClick={() => setActiveTab('USERS')}
            className={`px-4 py-2 text-[10px] font-black tracking-widest border transition-all ${activeTab === 'USERS' ? 'bg-red-500 text-black border-red-500' : 'border-slate-800 text-slate-500 hover:border-red-500/50'}`}
          >
            <Users size={12} className="inline mr-2" /> ASSET_FABRICATION
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
             key={activeTab}
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 1, y: 0 }}
             exit={{ opacity: 0, y: -10 }}
             transition={{ duration: 0.2 }}
             className="h-full"
          >
            {activeTab === 'COMMAND' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full overflow-y-auto custom-scrollbar pr-2">
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

            {activeTab === 'COMM' && <CommOverride /> }

            {activeTab === 'USERS' && (
              <div className="max-w-4xl mx-auto h-full overflow-y-auto custom-scrollbar">
                <AdminUserForm onComplete={() => setActiveTab('COMMAND')} />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function CommOverride() {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [selectedConn, setSelectedConn] = useState<Connection | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'connections'), orderBy('updatedAt', 'desc'), limit(20));
    const unsub = onSnapshot(q, (snap) => {
      const list: Connection[] = [];
      snap.forEach(doc => list.push({ id: doc.id, ...doc.data() } as Connection));
      setConnections(list);
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'connections'));
    return unsub;
  }, []);

  return (
    <div className="flex gap-6 h-full">
      <div className="w-80 flex flex-col border border-white/5 bg-black/20 overflow-hidden">
        <div className="p-4 border-b border-white/5 bg-slate-900/50">
          <h3 className="text-[10px] font-black text-red-500 uppercase tracking-widest">Active_Sessions</h3>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {connections.map(c => (
            <div 
              key={c.id} 
              onClick={() => setSelectedConn(c)}
              className={`p-4 border-b border-white/5 cursor-pointer transition-all hover:bg-white/5 ${selectedConn?.id === c.id ? 'bg-red-500/10 border-l-2 border-l-red-500' : ''}`}
            >
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] font-black text-white uppercase tracking-tight">{c.usernames?.join(' <-> ') || 'UNKNOWN_LINK'}</span>
                <span className="text-[8px] text-slate-600 font-mono italic">{c.status}</span>
              </div>
              <div className="text-[9px] text-slate-500 truncate italic">
                {c.lastMessage || 'NO_DATA_TRAFFIC'}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col border border-white/5 bg-black/20 overflow-hidden">
        {selectedConn ? (
          <div className="flex flex-col h-full">
            <div className="p-4 border-b border-white/5 bg-slate-900/50 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Eye size={14} className="text-red-500" />
                <h3 className="text-[10px] font-black text-white uppercase">SIGNAL_INTERCEPT: {selectedConn.id}</h3>
              </div>
              <span className="text-[8px] text-red-500 font-black animate-pulse">OVERRIDE_ACTIVE</span>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
               <ConnectionMessages connectionId={selectedConn.id} />
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-800 p-12 text-center">
             <div className="w-16 h-16 border border-slate-900 flex items-center justify-center opacity-20 mb-4">
                <Activity size={32} />
             </div>
             <div>
               <h3 className="text-[10px] font-black uppercase tracking-[0.5em] mb-2">Select_Session</h3>
               <p className="text-[8px] font-bold uppercase tracking-widest max-w-xs">Tap into a point-to-point encrypted tunnel to monitor real-time data exfiltration.</p>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ConnectionMessages({ connectionId }: { connectionId: string }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    const q = query(
      collection(db, 'connections', connectionId, 'messages'),
      orderBy('timestamp', 'asc'),
      limit(100)
    );
    const unsub = onSnapshot(q, (snap) => {
      const list: ChatMessage[] = [];
      snap.forEach(doc => list.push({ id: doc.id, ...doc.data() } as ChatMessage));
      setMessages(list);
    }, (err) => handleFirestoreError(err, OperationType.LIST, `connections/${connectionId}/messages`));
    return unsub;
  }, [connectionId]);

  return (
    <div className="space-y-4">
      {messages.map(m => (
        <div key={m.id} className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-[8px] font-black text-red-500 uppercase">{m.senderName}</span>
            <span className="text-[8px] text-slate-700 font-mono">[{ensureDate(m.timestamp).toLocaleTimeString()}]</span>
          </div>
          <div className="text-[10px] text-slate-300 bg-white/5 p-2 border-l border-red-500/30 font-mono break-words">
            {m.type === 'MEDIA' ? (
              <img src={m.text} alt="INTERCEPTED_MEDIA" className="max-w-xs rounded border border-white/5" />
            ) : (
              m.text
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

