import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, Safehouse as SafehouseType, VaultItem, ChatMessage, VaultFile } from '../types';
import { db, auth } from '../lib/firebase';
import { collection, query, addDoc, onSnapshot, serverTimestamp, orderBy, limit, doc, getDocs, updateDoc, arrayUnion } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Mic, MicOff, Paperclip, Share2, Terminal, Users, Search, Download, Trash2, Plus, Zap, AlertTriangle } from 'lucide-react';
import { handleFirestoreError, OperationType, ensureDate } from '../lib/utils';
import { signInAnonymously } from 'firebase/auth';
import { audioService } from '../services/audioService';

export default function MeetingHub({ currentUser }: { currentUser: UserProfile }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isMuted, setIsMuted] = useState(true);
  const [activeMembers, setActiveMembers] = useState<string[]>([currentUser.displayName]);
  const [nodes, setNodes] = useState<SafehouseType[]>([]);
  const [vaults, setVaults] = useState<VaultItem[]>([]);
  const [showNodePicker, setShowNodePicker] = useState(false);
  const [showVaultPicker, setShowVaultPicker] = useState(false);
  const [meetingFiles, setMeetingFiles] = useState<VaultFile[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const prevMessagesCount = useRef(0);

  useEffect(() => {
    if (messages.length > prevMessagesCount.current) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg && lastMsg.senderId !== currentUser.uid) {
        audioService.playBlip();
      }
      prevMessagesCount.current = messages.length;
    }
  }, [messages, currentUser.uid]);

  useEffect(() => {
    // 1. Unified Meeting Chat
    const q = query(
      collection(db, 'meeting_room_chat'),
      orderBy('timestamp', 'asc'),
      limit(100)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: ChatMessage[] = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as ChatMessage);
      });
      setMessages(list);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'meeting_room_chat');
    });

    // 2. Fetch Nodes & Vaults for pulling info
    const nodesQ = query(collection(db, 'safehouses'), orderBy('createdAt', 'desc'));
    const nodesUnsub = onSnapshot(nodesQ, (snap) => {
      const list: SafehouseType[] = [];
      snap.forEach(d => list.push({ id: d.id, ...d.data() } as SafehouseType));
      setNodes(list);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'safehouses');
    });

    const vaultsQ = query(collection(db, 'vaults'), orderBy('createdAt', 'desc'));
    const vaultsUnsub = onSnapshot(vaultsQ, (snap) => {
      const list: VaultItem[] = [];
      snap.forEach(d => list.push({ id: d.id, ...d.data() } as VaultItem));
      setVaults(list);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'vaults');
    });

    return () => {
      unsubscribe();
      nodesUnsub();
      vaultsUnsub();
    };
  }, []);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const sendMessage = async (text: string, type: ChatMessage['type'] = 'TEXT') => {
    if (!text.trim()) return;
    audioService.playSuccess();
    try {
      if (!auth.currentUser) await signInAnonymously(auth);
      await addDoc(collection(db, 'meeting_room_chat'), {
        senderId: currentUser.uid,
        senderAuthId: auth.currentUser?.uid,
        senderName: currentUser.displayName,
        text,
        timestamp: serverTimestamp(),
        type
      });
      setNewMessage('');
    } catch (e) {
      audioService.playError();
      console.error(e);
    }
  };

  const pullNodeIntel = (node: SafehouseType) => {
    const intel = `[INTEL_PULLED] NODE: ${node.name} // HOST: ${node.hostId.slice(0, 6)} // STATUS: ACTIVE`;
    sendMessage(intel, 'SYSTEM');
    setShowNodePicker(false);
  };

  const shareVault = (vault: VaultItem) => {
    const msg = `[VAULT_SHARED] ${vault.title} // CLEARANCE: LVL_${vault.clearanceRequired}`;
    sendMessage(msg, 'ALERT');
    setShowVaultPicker(false);
  };

  const simulateFileUpload = () => {
    const fileName = `INTEL_${Math.floor(Math.random()*1000)}.DAT`;
    const newFile: VaultFile = {
      id: Math.random().toString(36).substring(7),
      name: fileName,
      url: '#',
      type: 'DATA',
      size: 1024 * Math.random() * 100,
      uploadedBy: currentUser.displayName,
      timestamp: new Date().toISOString()
    };
    setMeetingFiles([newFile, ...meetingFiles]);
    sendMessage(`UPLOADED_FILE: ${fileName}`, 'SYSTEM');
  };

  return (
    <div className="flex-1 flex min-h-0 min-w-0 overflow-hidden bg-slate-950/20">
      {/* Left Column: Chat & Voice Controls */}
      <div className="flex-1 flex flex-col min-w-0 border-r border-slate-900 border-dashed overflow-hidden">
        <div className="h-16 border-b border-slate-900 bg-black/40 flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-tactical-cyan/10 border border-tactical-cyan/20 flex items-center justify-center text-tactical-cyan">
              <MessageSquare size={16} />
            </div>
            <div>
              <h2 className="text-sm font-black text-white tracking-widest uppercase">Meeting_Hub_Comm</h2>
              <div className="text-[9px] text-slate-500 font-bold uppercase trekking-widest">Active Link: Encrypted // Level 4 Guard</div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
             <button 
               onClick={() => setIsMuted(!isMuted)}
               className={`w-10 h-10 border flex items-center justify-center transition-all ${isMuted ? 'border-slate-800 text-slate-600' : 'border-tactical-cyan text-tactical-cyan bg-tactical-cyan/5 animate-pulse'}`}
             >
               {isMuted ? <MicOff size={16} /> : <Mic size={16} />}
             </button>
             <div className="h-6 w-px bg-slate-800"></div>
             <div className="flex -space-x-2">
               {activeMembers.map((m, i) => (
                 <div key={`member-${i}`} className="w-8 h-8 rounded-full border border-slate-800 bg-slate-900 flex items-center justify-center text-[10px] font-black text-tactical-cyan">{m[0]}</div>
               ))}
             </div>
          </div>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar min-h-0">
          {messages.map((msg, i) => (
            <div key={msg.id || `msg-${i}`} className={`group ${msg.type === 'SYSTEM' ? 'text-center' : ''}`}>
              {msg.type === 'SYSTEM' ? (
                <div className="text-[9px] text-slate-600 font-bold uppercase tracking-[0.3em] bg-slate-900/40 py-1 rounded inline-block px-4">
                  {msg.text}
                </div>
              ) : msg.type === 'ALERT' ? (
                <div className="text-[10px] text-yellow-500 font-black border border-yellow-500/20 bg-yellow-500/5 p-3 flex items-center gap-3 uppercase">
                   <AlertTriangle size={14} /> {msg.text}
                </div>
              ) : (
                <div className={msg.senderId === currentUser.uid ? 'text-right' : 'text-left'}>
                   <div className="text-[9px] text-slate-600 font-bold mb-1 uppercase tracking-widest">{msg.senderName}</div>
                   <div className={`inline-block max-w-[80%] p-3 text-xs border ${msg.senderId === currentUser.uid ? 'border-tactical-cyan bg-tactical-cyan/5 text-tactical-cyan' : 'border-slate-800 bg-slate-900/40 text-slate-300'}`}>
                     {msg.text}
                   </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <form onSubmit={(e) => { e.preventDefault(); sendMessage(newMessage); }} className="p-4 bg-black/60 border-t border-slate-900 flex gap-2 shrink-0">
           <div className="relative group">
              <button 
                type="button"
                onClick={() => setShowNodePicker(!showNodePicker)}
                className="w-12 h-12 bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 hover:text-tactical-cyan transition-colors"
              >
                <Zap size={20} />
              </button>
              {showNodePicker && (
                <div className="absolute bottom-full left-0 mb-2 w-64 bg-slate-950 border border-slate-800 p-2 shadow-2xl z-50">
                   <div className="text-[9px] font-black text-slate-500 mb-2 p-1 border-b border-white/5 uppercase">Pull_Node_Intel</div>
                   <div className="max-h-48 overflow-y-auto custom-scrollbar space-y-1">
                     {nodes.map(n => (
                       <button onClick={() => pullNodeIntel(n)} key={n.id} className="w-full text-left p-2 text-[10px] hover:bg-tactical-cyan hover:text-black transition-colors uppercase font-bold truncate">
                         {n.name} // {n.id.slice(0,6)}
                       </button>
                     ))}
                   </div>
                </div>
              )}
           </div>
           
           <input 
             value={newMessage}
             onChange={(e) => setNewMessage(e.target.value)}
             className="flex-1 kipher-input bg-slate-950 border-slate-800"
             placeholder="Relay communications..."
           />
           
           <button type="submit" className="px-8 bg-tactical-cyan text-black font-black uppercase tracking-widest hover:bg-white transition-all shadow-[0_0_20px_rgba(34,211,238,0.2)]">
             Relay
           </button>
        </form>
      </div>

      {/* Right Column: Shared Assets & Files */}
      <div className="w-80 flex flex-col shrink-0 bg-black/20 overflow-hidden">
         <div className="h-16 border-b border-slate-900 flex items-center px-6 shrink-0 bg-slate-950/40">
           <Paperclip size={14} className="text-slate-500 mr-3" />
           <h3 className="text-[10px] font-black text-slate-400 tracking-[.2em] uppercase">Shared_Resources</h3>
         </div>
         
         <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar min-h-0">
           <button 
             onClick={simulateFileUpload}
             className="w-full py-3 border-2 border-dashed border-slate-800 text-slate-600 hover:text-tactical-cyan hover:border-tactical-cyan/50 hover:bg-tactical-cyan/5 transition-all text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 group"
           >
             <Plus size={14} /> Upload_Intel_Packet
           </button>

           <div className="space-y-2">
             {meetingFiles.map(file => (
               <div key={file.id} className="kipher-panel p-3 border-slate-900 bg-slate-950/40 hover:border-tactical-cyan group transition-all">
                  <div className="flex justify-between items-start mb-2">
                    <div className="text-[10px] font-black text-white uppercase truncate pr-4">{file.name}</div>
                    <Download size={12} className="text-slate-700 group-hover:text-tactical-cyan cursor-pointer" />
                  </div>
                  <div className="flex justify-between text-[8px] font-bold text-slate-600 uppercase">
                    <span>{file.uploadedBy}</span>
                    <span>{(file.size / 1024).toFixed(1)} KB</span>
                  </div>
               </div>
             ))}
           </div>

           <div className="h-px bg-slate-900 border-b border-black"></div>

           <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-[9px] font-black text-slate-500 uppercase tracking-widest underline decoration-tactical-cyan/30 underline-offset-4">Shared Vaults</h4>
                <Share2 size={12} className="text-slate-700 cursor-pointer hover:text-tactical-cyan" onClick={() => setShowVaultPicker(!showVaultPicker)} />
              </div>
              <div className="space-y-2 relative">
                {showVaultPicker && (
                  <div className="absolute top-0 right-0 w-full bg-slate-950 border border-slate-800 p-2 shadow-2xl z-50">
                    {vaults.map(v => (
                       <button onClick={() => shareVault(v)} key={v.id} className="w-full text-left p-2 text-[9px] hover:bg-tactical-cyan hover:text-black font-bold uppercase border-b border-white/5 last:border-0">
                         {v.title}
                       </button>
                    ))}
                  </div>
                )}
                {messages.filter(m => m.type === 'ALERT').slice(-3).map((m, i) => (
                  <div key={m.id || `alert-tab-${i}`} className="p-2 border border-slate-900 bg-slate-900/20 text-[9px] text-slate-400 font-bold uppercase truncate">
                    {m.text.replace('[VAULT_SHARED] ', '')}
                  </div>
                ))}
              </div>
           </div>
         </div>
         
         <div className="p-4 border-t border-slate-900 font-mono text-[9px] text-slate-700 uppercase flex items-center justify-between">
           <span>Signal Integrity</span>
           <div className="flex gap-0.5">
             {Array.from({ length: 5 }).map((_, i) => (
               <div key={i} className={`w-1.5 h-3 ${i < 4 ? 'bg-tactical-cyan/40' : 'bg-slate-800'}`}></div>
             ))}
           </div>
         </div>
      </div>
    </div>
  );
}
