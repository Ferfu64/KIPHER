import React, { useState, useEffect, useRef } from 'react';
import { db, auth } from '../lib/firebase';
import { collection, query, addDoc, onSnapshot, serverTimestamp, orderBy, limit, doc, deleteDoc } from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';
import { UserProfile, Safehouse as SafehouseType, ChatMessage } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Send, LogOut, Plus, Lock, MessageCircle, Terminal, Trash2, Info } from 'lucide-react';
import { handleFirestoreError, OperationType, ensureDate } from '../lib/utils';
import { audioService } from '../services/audioService';

export default function Safehouse({ currentUser }: { currentUser: UserProfile }) {
  const [safehouses, setSafehouses] = useState<SafehouseType[]>([]);
  const [activeRoom, setActiveRoom] = useState<SafehouseType | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState<SafehouseType | null>(null);
  const [joinCode, setJoinCode] = useState('');
  const [minClearance, setMinClearance] = useState(1);
  const [nodeName, setNodeName] = useState('');
  const [nodeCode, setNodeCode] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'safehouses'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: SafehouseType[] = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as SafehouseType);
      });
      setSafehouses(list);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'safehouses', true));

    return () => unsubscribe();
  }, []);

  const createSafehouse = async () => {
    // 0. Enforce 1-node limit
    const existingNode = safehouses.find(s => s.hostId === currentUser.uid);
    if (existingNode) {
      audioService.playError();
      return alert('PROTOCOL_RESTRICTION: YOU ALREADY HAVE AN ACTIVE NODE. DECOMMISSION IT TO CREATE A NEW ONE.');
    }

    const name = nodeName || 'SECURE_NODE';
    const code = nodeCode;

    if (!/^[0-9]{4}$/.test(code)) {
      audioService.playError();
      return alert('CODE MUST BE 4 DIGITS');
    }
    try {
      // 1. Ensure Auth
      if (!auth.currentUser) {
        try {
          await signInAnonymously(auth);
        } catch (authErr: any) {
          if (authErr && authErr.code === 'auth/admin-restricted-operation') {
            audioService.playError();
            throw new Error('AUTH_RESTRICTED: PLEASE ENABLE ANONYMOUS SIGN-IN IN FIREBASE CONSOLE.');
          }
          throw authErr;
        }
      }

      const authUid = auth.currentUser?.uid;
      if (!authUid) throw new Error('IDENTITY_LOCK_FAILURE');

      // 2. Perform write
      const docRef = await addDoc(collection(db, 'safehouses'), {
        hostId: currentUser.uid,
        hostAuthId: authUid, // CRITICAL: For Firestore Rules
        name: name,
        passcode: code,
        minClearance: minClearance,
        createdAt: serverTimestamp()
      });

      setNodeName('');
      setNodeCode('');
      setShowCreate(false);
      audioService.playSuccess();
      
      setActiveRoom({ 
        id: docRef.id, 
        hostId: currentUser.uid, 
        hostAuthId: authUid,
        name: name, 
        passcode: code, 
        minClearance: minClearance, 
        createdAt: new Date().toISOString() 
      });
    } catch (error: any) {
      audioService.playError();
      console.error('Failed to create safehouse:', error);
      let msg = 'OPERATION_DENIED: INSUFFICIENT_CLEARANCE';
      if (error && error.message && error.message.includes('AUTH_RESTRICTED')) {
        msg = error.message;
      } else if (error && error.message) {
        msg = `ERROR: ${error.message.toUpperCase()}`;
      }
      alert(msg);
    }
  };

  const handleJoin = () => {
    if (showJoin && joinCode === showJoin.passcode) {
      setActiveRoom(showJoin);
      setShowJoin(null);
      setJoinCode('');
      audioService.playSuccess();
    } else {
      audioService.playError();
      alert('INVALID ACCESS CODE');
    }
  };

  const deleteRoom = async (id: string) => {
    if (confirm('DECOMMISSION_SAFEHOUSE?')) {
      try {
        if (!auth.currentUser) await signInAnonymously(auth);
        await deleteDoc(doc(db, 'safehouses', id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `safehouses/${id}`);
      }
    }
  };

  if (activeRoom) {
    return <SafehouseChat room={activeRoom} user={currentUser} onExit={() => setActiveRoom(null)} />;
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black tracking-tighter">SECURE_SAFEHOUSES</h2>
          <p className="text-xs text-slate-500 tracking-widest uppercase">ENCRYPTED_AD_HOC_MEETINGS</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="kipher-button bg-tactical-cyan text-absolute-black font-black">
          <Plus size={14} className="mr-2 inline" /> ESTABLISH_NODE
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {safehouses.map((room) => (
          <div key={room.id} className="kipher-panel hover:border-tactical-cyan transition-all group flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-4">
                <div className="text-[10px] font-bold text-slate-600 tracking-widest">NODE_ID: {room.id.slice(0, 8)}</div>
                <Lock size={12} className="text-slate-700" />
              </div>
              <h3 className="text-lg font-black group-hover:text-tactical-cyan mb-2">{room.name}</h3>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center gap-1 group relative">
                  <span className={`text-[9px] font-black px-2 py-0.5 border rounded-sm ${currentUser.clearanceLevel >= (room.minClearance || 1) ? 'text-tactical-cyan border-tactical-cyan/40 bg-tactical-cyan/5' : 'text-red-500 border-red-500/40 bg-red-500/5'}`}>
                    LVL_{(room.minClearance || 1)}
                  </span>
                  <Info size={10} className="text-white/20 hover:text-tactical-cyan cursor-help transition-colors" />
                  <div className="absolute bottom-full left-0 mb-2 w-48 p-2 bg-absolute-black border border-white/10 rounded text-[9px] leading-tight text-white/80 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-20 shadow-2xl font-mono">
                    Cryptographic complexity level. You need clearance equal or higher to establish a link.
                  </div>
                </div>
              </div>
              <p className="text-[10px] text-slate-500 flex items-center gap-1">
                <Terminal size={10} /> CREATED_BY_HOST: {room.hostId.slice(0, 6)}
              </p>
            </div>
            
            <div className="flex gap-2 mt-6">
              <button 
                onClick={() => room.hostId === currentUser.uid ? setActiveRoom(room) : setShowJoin(room)}
                className="flex-1 kipher-button bg-slate-900 border-slate-800"
              >
                ENTER_SAFEHOUSE
              </button>
              {room.hostId === currentUser.uid && (
                <button onClick={() => deleteRoom(room.id)} className="kipher-button border-red-900/30 text-red-900/50 hover:text-red-500 hover:border-red-500">
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Create Modal */}
      <AnimatePresence>
        {showCreate && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-absolute-black/90 p-4">
            <div className="max-w-md w-full kipher-panel">
              <h3 className="text-lg font-black mb-6">ESTABLISH_NEW_NODE</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500">NODE_IDENTIFIER</label>
                    <input 
                      value={nodeName}
                      onChange={(e) => setNodeName(e.target.value)}
                      className="w-full kipher-input text-xs" 
                      placeholder="e.g. ALPHA_SIX" 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 flex items-center gap-1 group">
                      MIN_CLEARANCE
                      <div className="relative">
                        <Info size={10} className="text-white/20 cursor-help" />
                        <div className="absolute bottom-full left-0 mb-1 w-40 p-2 bg-absolute-black border border-white/10 rounded text-[8px] leading-tight text-white/80 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-20">
                          Set the minimum security level required for other agents to join.
                        </div>
                      </div>
                    </label>
                    <select 
                      value={minClearance} 
                      onChange={(e) => setMinClearance(Number(e.target.value))}
                      className="w-full kipher-input text-xs appearance-none py-2"
                    >
                      {[1,2,3,4,5].map(v => <option key={v} value={v} className="bg-absolute-black">LEVEL_{v}</option>)}
                    </select>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500">4-DIGIT_ACCESS_CODE</label>
                  <input 
                    value={nodeCode}
                    onChange={(e) => setNodeCode(e.target.value)}
                    className="w-full kipher-input h-10 tracking-[0.5em]" 
                    type="password" 
                    maxLength={4} 
                    placeholder="XXXX" 
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <button onClick={() => setShowCreate(false)} className="flex-1 kipher-button">ABORT</button>
                  <button 
                    onClick={createSafehouse}
                    className="flex-1 kipher-button bg-tactical-cyan text-absolute-black font-black"
                  >
                    DEPLOY
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {showJoin && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-absolute-black/90 p-4">
            <div className="max-w-xs w-full kipher-panel text-center">
              <Shield size={32} className="mx-auto mb-4 text-tactical-cyan" />
              <h3 className="text-lg font-black mb-2 uppercase">{showJoin.name}</h3>
              <p className="text-[10px] text-slate-500 mb-6">SECURITY_CLEARANCE_REQUIRED</p>
              <input 
                type="password" 
                maxLength={4} 
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                autoFocus
                placeholder="XXXX"
                className="w-full text-center text-2xl tracking-[0.5em] kipher-input mb-8"
              />
              <div className="flex gap-2">
                <button 
                  onClick={() => { setShowJoin(null); setJoinCode(''); }} 
                  className="flex-1 kipher-button"
                >
                  CANCEL
                </button>
                <button 
                  disabled={!currentUser.isOwner && currentUser.clearanceLevel < (showJoin.minClearance || 1)}
                  onClick={handleJoin} 
                  className="flex-1 kipher-button bg-tactical-cyan text-absolute-black font-black disabled:opacity-30 disabled:bg-slate-800 disabled:text-white/40"
                >
                  {!currentUser.isOwner && currentUser.clearanceLevel < (showJoin.minClearance || 1) ? 'INSUFFICIENT_LVL' : 'VALIDATE'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SafehouseChat({ room, user, onExit }: { room: SafehouseType, user: UserProfile, onExit: () => void }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const q = query(
      collection(db, 'safehouses', room.id, 'messages'),
      orderBy('timestamp', 'asc'),
      limit(100)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: ChatMessage[] = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as ChatMessage);
      });
      setMessages(list);
    }, (error) => handleFirestoreError(error, OperationType.LIST, `safehouses/${room.id}/messages`));

    return () => unsubscribe();
  }, [room.id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      if (!auth.currentUser) await signInAnonymously(auth);
      const authUid = auth.currentUser?.uid;
      
      await addDoc(collection(db, 'safehouses', room.id, 'messages'), {
        senderId: user.uid,
        senderAuthId: authUid, // For Rules
        senderName: user.displayName,
        text: newMessage,
        timestamp: serverTimestamp(),
        type: 'TEXT'
      });
      setNewMessage('');
    } catch (error) {
      console.error('Send failed:', error);
    }
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col kipher-border bg-slate-950/20">
      <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-absolute-black/50">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-slate-900 flex items-center justify-center text-tactical-cyan border border-slate-800">
            <MessageCircle size={20} />
          </div>
          <div>
            <div className="text-xs font-black uppercase tracking-widest">{room.name}</div>
            <div className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">NODE_STATUS: SECURE // LINK: ACTIVE</div>
          </div>
        </div>
        <button onClick={onExit} className="kipher-button text-red-500/70 border-red-900/30">
          <LogOut size={14} className="mr-2 inline" /> DISCONNECT
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 font-mono scrollbar-hide">
        {messages.map((msg, i) => {
          const isMe = msg.senderId === user.uid;
          return (
            <div key={msg.id || `safe-msg-${i}`} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
              <div className="flex items-center gap-2 mb-1 px-1">
                <span className={`text-[10px] font-black ${isMe ? 'text-tactical-cyan' : 'text-slate-500'}`}>
                  {isMe ? 'YOU' : msg.senderName}
                </span>
                <span className="text-[8px] text-slate-700">
                  {ensureDate(msg.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <div className={`max-w-[80%] px-3 py-2 text-xs border ${
                isMe 
                  ? 'border-tactical-cyan bg-tactical-cyan/5 text-tactical-cyan' 
                  : 'border-slate-800 bg-slate-900/50 text-slate-300'
              }`}>
                {msg.text}
              </div>
            </div>
          );
        })}
      </div>

      <form onSubmit={sendMessage} className="p-4 bg-absolute-black border-t border-slate-800 flex gap-2">
        <input 
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="SEND_ENCRYPTED_MESSAGE..."
          className="flex-1 kipher-input border-slate-800 bg-slate-950/50 px-4 h-12"
        />
        <button type="submit" className="px-8 bg-tactical-cyan text-absolute-black h-12 font-black tracking-widest hover:bg-white transition-colors">
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}
