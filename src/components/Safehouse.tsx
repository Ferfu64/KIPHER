import React, { useState, useEffect, useRef } from 'react';
import { db, auth } from '../lib/firebase';
import { collection, query, addDoc, onSnapshot, serverTimestamp, orderBy, limit, doc, deleteDoc, where, getDocs, updateDoc, setDoc } from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';
import { UserProfile, Safehouse as SafehouseType, ChatMessage, VaultItem, VaultFile } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Send, LogOut, Plus, Lock, MessageCircle, Terminal, Trash2, Info, Archive, FileText, X, Mic, MicOff, Radio, Volume2 } from 'lucide-react';
import { handleFirestoreError, OperationType, ensureDate } from '../lib/utils';
import { audioService } from '../services/audioService';

function SafehouseVoiceManager({ roomId, currentUser }: { roomId: string, currentUser: UserProfile }) {
  const [remoteStreams, setRemoteStreams] = useState<Record<string, { stream: MediaStream, name: string }>>({});
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const peersRef = useRef<Record<string, RTCPeerConnection>>({});
  
  const iceConfig = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
    ]
  };

  useEffect(() => {
    let active = true;
    const authId = auth.currentUser?.uid;
    if (!authId) return;

    let unsubMembers: () => void;
    let unsubSignals: () => void;

    const startVoice = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (!active) return;
        setLocalStream(stream);

        // Sign in as active member
        const memberRef = doc(db, 'safehouses', roomId, 'voice_members', authId);
        await setDoc(memberRef, {
          uid: currentUser.uid,
          displayName: currentUser.displayName,
          joinedAt: serverTimestamp()
        });

        // Listen for other members
        const membersQ = query(collection(db, 'safehouses', roomId, 'voice_members'));
        unsubMembers = onSnapshot(membersQ, (snap) => {
          snap.docChanges().forEach(async (change) => {
            const memberData = change.doc.data();
            const memberId = change.doc.id;
            
            if (memberId === authId) return;

            if (change.type === 'added') {
              if (authId < memberId) {
                await initiatePeerConnection(memberId, stream, memberData.displayName);
              }
            } else if (change.type === 'removed') {
              removePeer(memberId);
            }
          });
        });

        // Listen for incoming signals
        const signalsQ = query(
          collection(db, 'safehouses', roomId, 'voice_signals'), 
          where('to', '==', authId)
        );
        unsubSignals = onSnapshot(signalsQ, (snap) => {
          snap.docChanges().forEach(async (change) => {
            if (change.type === 'added') {
              const signal = change.doc.data();
              await handleSignal(change.doc.id, signal, stream);
            }
          });
        });

      } catch (err) {
        console.error('VOICE_INIT_FAILED:', err);
        alert('VOICE_HARDWARE_ACCESS_DENIED or NOT_FOUND');
      }
    };

    startVoice();

    return () => {
      active = false;
      if (unsubMembers) unsubMembers();
      if (unsubSignals) unsubSignals();
      
      const memberRef = doc(db, 'safehouses', roomId, 'voice_members', authId);
      deleteDoc(memberRef).catch(console.error);

      localStream?.getTracks().forEach(t => t.stop());
      Object.keys(peersRef.current).forEach(key => {
        peersRef.current[key].close();
        delete peersRef.current[key];
      });
    };
  }, [roomId, auth.currentUser?.uid]);

  const initiatePeerConnection = async (targetAuthId: string, stream: MediaStream, name: string) => {
    const pc = createPeerConnection(targetAuthId, stream, name);
    peersRef.current[targetAuthId] = pc;

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    await addDoc(collection(db, 'safehouses', roomId, 'voice_signals'), {
      from: auth.currentUser?.uid,
      to: targetAuthId,
      type: 'offer',
      sdp: pc.localDescription?.sdp,
      timestamp: serverTimestamp()
    });
  };

  const handleSignal = async (signalId: string, signal: any, stream: MediaStream) => {
    const fromAuthId = signal.from;
    
    // Auto-cleanup processed signals
    await deleteDoc(doc(db, 'safehouses', roomId, 'voice_signals', signalId));

    if (signal.type === 'offer') {
      const pc = createPeerConnection(fromAuthId, stream, 'REMOTE_AGENT');
      peersRef.current[fromAuthId] = pc;

      await pc.setRemoteDescription(new RTCSessionDescription({ type: 'offer', sdp: signal.sdp }));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      await addDoc(collection(db, 'safehouses', roomId, 'voice_signals'), {
        from: auth.currentUser?.uid,
        to: fromAuthId,
        type: 'answer',
        sdp: pc.localDescription?.sdp,
        timestamp: serverTimestamp()
      });
    } else if (signal.type === 'answer') {
      const pc = peersRef.current[fromAuthId];
      if (pc) {
        await pc.setRemoteDescription(new RTCSessionDescription({ type: 'answer', sdp: signal.sdp }));
      }
    } else if (signal.type === 'candidate') {
      const pc = peersRef.current[fromAuthId];
      if (pc) {
        await pc.addIceCandidate(new RTCIceCandidate(signal.candidate));
      }
    }
  };

  const createPeerConnection = (targetAuthId: string, stream: MediaStream, name: string) => {
    const pc = new RTCPeerConnection(iceConfig);

    stream.getTracks().forEach(track => pc.addTrack(track, stream));

    pc.onicecandidate = async (event) => {
      if (event.candidate) {
        await addDoc(collection(db, 'safehouses', roomId, 'voice_signals'), {
          from: auth.currentUser?.uid,
          to: targetAuthId,
          type: 'candidate',
          candidate: event.candidate.toJSON(),
          timestamp: serverTimestamp()
        });
      }
    };

    pc.ontrack = (event) => {
      console.log('VOICE_STREAM_RECEIVED from:', targetAuthId);
      setRemoteStreams(prev => ({
        ...prev,
        [targetAuthId]: { stream: event.streams[0], name }
      }));
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed' || pc.connectionState === 'closed') {
        removePeer(targetAuthId);
      }
    };

    return pc;
  };

  const removePeer = (authId: string) => {
    const pc = peersRef.current[authId];
    if (pc) {
      pc.close();
      delete peersRef.current[authId];
    }
    setRemoteStreams(prev => {
      const next = { ...prev };
      delete next[authId];
      return next;
    });
  };

  return (
    <div className="absolute top-16 right-4 z-50 flex flex-col gap-2">
      {Object.keys(remoteStreams).map((id) => {
        const data = remoteStreams[id] as { stream: MediaStream, name: string };
        return <RemoteVoice key={id} stream={data.stream} name={data.name} />;
      })}
      {localStream && (
        <div className="kipher-panel py-1 px-3 bg-red-500/10 border-red-500/30 flex items-center gap-2 animate-pulse">
           <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
           <span className="text-[10px] font-black text-red-500 uppercase tracking-tighter">VOICE_LINK_ESTABLISHED</span>
        </div>
      )}
    </div>
  );
}

const RemoteVoice: React.FC<{ stream: MediaStream, name: string }> = ({ stream, name }) => {
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.srcObject = stream;
    }
  }, [stream]);

  const MotionVolume = motion(Volume2);

  return (
    <div className="kipher-panel py-2 px-4 bg-slate-900 border-tactical-cyan/30 flex items-center gap-3">
       <MotionVolume 
         size={14} 
         className="text-tactical-cyan" 
         animate={{ y: [0, -4, 0] }}
         transition={{ duration: 0.6, repeat: 999999, ease: "easeInOut" }}
       />
       <div className="flex flex-col">
         <span className="text-[8px] font-black text-white uppercase tracking-widest">{name}</span>
         <span className="text-[7px] text-tactical-cyan font-bold uppercase">AUDIO_RECEPTION_LIVE</span>
       </div>
       <audio ref={audioRef} autoPlay />
    </div>
  );
};

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
  const [spamWarning, setSpamWarning] = useState<string | null>(null);
  const [voiceActive, setVoiceActive] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastMessageTimes = useRef<number[]>([]);

  useEffect(() => {
    const q = query(
      collection(db, 'safehouses', room.id, 'messages'),
      orderBy('timestamp', 'asc'),
      limit(30)
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
      const scroll = () => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
      };
      scroll();
      const timer = setTimeout(scroll, 100);
      return () => clearTimeout(timer);
    }
  }, [messages]);

  const sendMessage = async (e?: React.FormEvent, textOverride?: string, typeOverride?: ChatMessage['type']) => {
    if (e) e.preventDefault();
    const textToSend = textOverride || newMessage;
    if (!textToSend.trim()) return;

    // Spam detection: max 3 messages in 3 seconds
    const now = Date.now();
    lastMessageTimes.current = lastMessageTimes.current.filter(t => now - t < 3000);
    if (lastMessageTimes.current.length >= 3 && !textOverride) {
      setSpamWarning('SPAM_DETECTED: COOLING_DOWN');
      audioService.playError();
      setTimeout(() => setSpamWarning(null), 3000);
      return;
    }
    if (!textOverride) lastMessageTimes.current.push(now);

    try {
      if (!auth.currentUser) await signInAnonymously(auth);
      const authUid = auth.currentUser?.uid;
      
      // Auto-prune if too many messages
      if (messages.length >= 30 && !textOverride) {
        const oldest = messages[0];
        if (oldest.id) {
          deleteDoc(doc(db, 'safehouses', room.id, 'messages', oldest.id)).catch(console.error);
        }
      }

      await addDoc(collection(db, 'safehouses', room.id, 'messages'), {
        senderId: user.uid,
        senderAuthId: authUid, // For Rules
        senderName: user.displayName,
        text: textToSend,
        timestamp: serverTimestamp(),
        type: typeOverride || 'TEXT'
      });

      // Update parent safehouse to trigger global listeners
      await updateDoc(doc(db, 'safehouses', room.id), {
        lastMessage: textToSend.startsWith('data:image') ? '[MEDIA]' : textToSend,
        lastSenderName: user.displayName,
        lastSenderAuthId: authUid,
        lastMessageAt: serverTimestamp()
      });

      if (!textOverride) setNewMessage('');
      audioService.playBlip();
    } catch (error) {
       handleFirestoreError(error, OperationType.WRITE, `safehouses/${room.id}/messages`);
    }
  };

  const handlePaste = async (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            const base64 = event.target?.result as string;
            sendMessage(undefined, base64, 'MEDIA');
          };
          reader.readAsDataURL(file);
        }
      }
    }
  };

  const [showVaultPicker, setShowVaultPicker] = useState(false);
  const [userVaults, setUserVaults] = useState<VaultItem[]>([]);

  useEffect(() => {
    if (showVaultPicker) {
      const q = query(collection(db, 'vaults'), where('ownerId', '==', user.uid));
      getDocs(q).then(snap => {
        const list: VaultItem[] = [];
        snap.forEach(doc => list.push({ id: doc.id, ...doc.data() } as VaultItem));
        setUserVaults(list);
      });
    }
  }, [showVaultPicker, user.uid]);

  const shareVaultFile = (file: VaultFile) => {
    const intelStr = `[VAULT_INTEL_EXTRACTED] FILE: ${file.name} // TYPE: ${file.type} // LINK: ${file.url}`;
    sendMessage(undefined, intelStr, 'SYSTEM');
    setShowVaultPicker(false);
  };

  const deleteMessage = async (msgId: string) => {
    try {
      if (!auth.currentUser) await signInAnonymously(auth);
      await deleteDoc(doc(db, 'safehouses', room.id, 'messages', msgId));
      audioService.playSuccess();
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `safehouses/${room.id}/messages/${msgId}`);
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
            <div className="text-[10px] text-slate-500 font-bold tracking-widest uppercase flex items-center gap-2">
               NODE_STATUS: SECURE // LINK: ACTIVE 
               {voiceActive && <span className="flex items-center gap-1 text-red-500 animate-pulse"><Radio size={10} /> VOICE_LIVE</span>}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => {
              setVoiceActive(!voiceActive);
              audioService.playBlip();
            }}
            className={`flex items-center gap-2 px-3 py-1.5 border text-[10px] font-black transition-all ${voiceActive ? 'bg-red-500/10 border-red-500 text-red-500' : 'bg-slate-900 border-slate-800 text-slate-500'}`}
          >
            {voiceActive ? <MicOff size={14} /> : <Mic size={14} />}
            {voiceActive ? 'VOICE_DISCONNECT' : 'VOICE_ESTABLISH'}
          </button>
          <button onClick={onExit} className="kipher-button text-red-500/70 border-red-900/30">
            <LogOut size={14} className="mr-2 inline" /> DISCONNECT
          </button>
        </div>
      </div>

      {voiceActive && (
        <SafehouseVoiceManager 
          roomId={room.id} 
          currentUser={user} 
        />
      )}

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 font-mono scrollbar-hide">
        {messages.map((msg, i) => {
          const isMe = msg.senderId === user.uid;
          const canDelete = isMe || user.uid === room.hostId || user.role === 'OWNER';
          
          return (
            <div key={msg.id || `safe-msg-${i}`} className={`flex flex-col group ${isMe ? 'items-end' : 'items-start'}`}>
              <div className="flex items-center gap-2 mb-1 px-1">
                {!isMe && <span className="text-[10px] font-black text-slate-500">{msg.senderName}</span>}
                {isMe && <span className="text-[10px] font-black text-tactical-cyan text-right">YOU</span>}
                <span className="text-[8px] text-slate-700">
                  {ensureDate(msg.timestamp).toLocaleTimeString()}
                </span>
                {canDelete && msg.id && (
                  <button 
                    onClick={() => deleteMessage(msg.id!)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-700 hover:text-red-500"
                    title="DESTRUCT_MESSAGE"
                  >
                    <Trash2 size={10} />
                  </button>
                )}
              </div>
              <div className={`max-w-[80%] px-3 py-2 text-xs border ${
                isMe 
                  ? 'border-tactical-cyan bg-tactical-cyan/5 text-tactical-cyan' 
                  : 'border-slate-800 bg-slate-900/50 text-slate-300'
              }`}>
                {msg.type === 'MEDIA' ? (
                   <img src={msg.text} alt="ENCRYPTED_MEDIA" className="max-w-full rounded border border-white/10" referrerPolicy="no-referrer" />
                ) : (
                  msg.text
                )}
              </div>
            </div>
          );
        })}
      </div>

      {spamWarning && (
        <div className="bg-red-600/20 border-y border-red-600/40 px-4 py-1 text-[10px] font-black text-red-500 uppercase tracking-widest text-center animate-pulse">
          {spamWarning}
        </div>
      )}

      <form onSubmit={sendMessage} className="p-4 bg-absolute-black border-t border-slate-800 flex gap-2">
        <button 
          type="button" 
          onClick={() => setShowVaultPicker(true)}
          className="w-12 h-12 bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-500 hover:text-tactical-cyan transition-colors"
        >
          <Archive size={18} />
        </button>
        <input 
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onPaste={handlePaste}
          placeholder={spamWarning ? 'TERMINAL_LOCKED...' : 'SEND_ENCRYPTED_MESSAGE...'}
          disabled={!!spamWarning}
          className="flex-1 kipher-input border-slate-800 bg-slate-950/50 px-4 h-12 text-sm"
        />
        <button 
          type="submit" 
          disabled={!!spamWarning}
          className="px-8 bg-tactical-cyan text-absolute-black h-12 font-black tracking-widest hover:bg-white transition-colors disabled:opacity-30"
        >
          <Send size={18} />
        </button>
      </form>

      {/* Vault Picker Modal */}
      <AnimatePresence>
        {showVaultPicker && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 p-4">
             <div className="max-w-md w-full kipher-panel max-h-[80vh] flex flex-col">
                <div className="flex items-center justify-between mb-4">
                   <h3 className="text-sm font-black text-tactical-cyan flex items-center gap-2">
                     <Archive size={16} /> SELECT_INTEL_FOR_EXTRACTION
                   </h3>
                   <button onClick={() => setShowVaultPicker(false)} className="text-slate-500 hover:text-white"><X size={20} /></button>
                </div>
                
                <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                   {userVaults.length === 0 ? (
                     <div className="text-center py-10 text-[10px] text-slate-600 font-bold uppercase italic">NO_VAULTS_FOUND_ON_ASSET</div>
                   ) : userVaults.map(vault => (
                     <div key={vault.id} className="space-y-2">
                        <div className="text-[10px] font-black text-slate-500 uppercase border-b border-white/5 pb-1">{vault.title}</div>
                        {vault.files && vault.files.length > 0 ? vault.files.map(file => (
                          <button 
                            key={file.id} 
                            onClick={() => shareVaultFile(file)}
                            className="w-full flex items-center justify-between p-3 bg-slate-900/50 border border-slate-800 hover:border-tactical-cyan group transition-all"
                          >
                             <div className="flex items-center gap-3">
                                <FileText size={14} className="text-slate-600 group-hover:text-tactical-cyan" />
                                <span className="text-[10px] font-black text-slate-300 group-hover:text-white uppercase truncate max-w-[150px]">{file.name}</span>
                             </div>
                             <span className="text-[8px] font-bold text-slate-600 group-hover:text-tactical-cyan uppercase">EXTRACT</span>
                          </button>
                        )) : (
                          <div className="text-[9px] text-slate-700 italic pl-2">EMPTY_STORAGE</div>
                        )}
                     </div>
                   ))}
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
