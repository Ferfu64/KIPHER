import React, { useState, useEffect } from 'react';
import { db, auth } from '../lib/firebase';
import { collection, addDoc, serverTimestamp, query, orderBy, limit, onSnapshot, getDocs, doc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';
import { UserProfile } from '../types';
import { 
  ShieldAlert, 
  Send, 
  Radio, 
  Terminal, 
  Users, 
  List, 
  MessageSquare, 
  AlertTriangle, 
  UserPlus, 
  Zap, 
  Skull, 
  Activity, 
  Info,
  ExternalLink,
  ShieldHalf,
  RefreshCw,
  X,
  Trash2
} from 'lucide-react';
import CreateAgentForm from './CreateAgentForm';
import { handleFirestoreError, OperationType, ensureDate } from '../lib/utils';
import { audioService } from '../services/audioService';

export default function CommandCenter({ currentUser }: { currentUser: UserProfile }) {
  const [activeTab, setActiveTab] = useState<'BROADCAST' | 'USERS' | 'CREATE' | 'LOGS'>('BROADCAST');
  const [broadcast, setBroadcast] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [systemUsers, setSystemUsers] = useState<UserProfile[]>([]);

  useEffect(() => {
    // Only fetch users if we are an owner or superuser
    const isPowerful = currentUser.isOwner || currentUser.role === 'SUPERUSER';
    if (!isPowerful) return;

    const q = query(collection(db, 'users'), orderBy('lastSeen', 'desc'), limit(100));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: UserProfile[] = [];
      snapshot.forEach(doc => list.push(doc.data() as UserProfile));
      setSystemUsers(list);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'users'));
    return unsubscribe;
  }, [currentUser]);

  const sendBroadcast = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!broadcast) return;
    await sendDirectCommand('', 'ALERT', broadcast);
    setBroadcast('');
  };

  const injectMedia = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!mediaUrl) return;
    await sendDirectCommand('', 'MEDIA', mediaUrl);
    setMediaUrl('');
  };

  const updateUserLevel = async (uid: string, level: number) => {
    try {
      if (!auth.currentUser) await signInAnonymously(auth);
      await updateDoc(doc(db, 'users', uid), { clearanceLevel: level });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${uid}`);
    }
  };

  const deleteUser = async (uid: string) => {
    if (confirm(`PERMANENTLY_DELETE_USER_${uid}? THIS_ACTION_IS_IRREVERSIBLE.`)) {
      try {
        if (!auth.currentUser) await signInAnonymously(auth);
        await deleteDoc(doc(db, 'users', uid));
        audioService.playError();
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `users/${uid}`);
      }
    }
  };

  const banUser = async (uid: string) => {
    if (confirm(`BAN_USER_${uid}?`)) {
      try {
        if (!auth.currentUser) await signInAnonymously(auth);
        await updateDoc(doc(db, 'users', uid), { isBanned: true });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `users/${uid}`);
      }
    }
  };

  const sendDirectCommand = async (uid: string, type: 'REDIRECT' | 'SAFETY' | 'RESTORE' | 'ALERT' | 'MEDIA', payload: string = '') => {
    try {
      if (!auth.currentUser) await signInAnonymously(auth);
      // Use 'GLOBAL' instead of null for better querying reliability
      await addDoc(collection(db, 'system_commands'), {
        type,
        payload,
        targetUserId: uid || 'GLOBAL',
        timestamp: serverTimestamp(),
        active: true,
        author: currentUser.displayName
      });
      audioService.playBlip();
    } catch (err) {
      console.error(err);
      handleFirestoreError(err, OperationType.WRITE, 'system_commands');
    }
  };

  const purgeMeetingHub = async () => {
    if (confirm('ENGAGE_PROTOCOL_VOID: PURGE_ALL_MEETING_HUB_COMMUNICATIONS?')) {
      try {
        const snap = await getDocs(collection(db, 'meeting_room_chat'));
        const deletes = snap.docs.map(d => deleteDoc(doc(db, 'meeting_room_chat', d.id)));
        await Promise.all(deletes);
        audioService.playSuccess();
        alert('COMMUNICATION_WIPE_COMPLETE');
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, 'meeting_room_chat');
      }
    }
  };

  const purgeAllNodes = async () => {
    if (confirm('ENGAGE_PROTOCOL_VOID: PURGE_ALL_SAFEHOUSE_NODES_AND_MESSAGES?')) {
      try {
        const snap = await getDocs(collection(db, 'safehouses'));
        const deletes = snap.docs.map(async (sDoc) => {
          // Clear sub-messages first
          const mSnap = await getDocs(collection(db, 'safehouses', sDoc.id, 'messages'));
          await Promise.all(mSnap.docs.map(m => deleteDoc(doc(db, 'safehouses', sDoc.id, 'messages', m.id))));
          // Delete safehouse
          return deleteDoc(doc(db, 'safehouses', sDoc.id));
        });
        await Promise.all(deletes);
        audioService.playSuccess();
        alert('GLOBAL_NODE_PURGE_COMPLETE');
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, 'safehouses');
      }
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="bento-header bg-slate-900 shrink-0">
        <div className="flex items-center gap-2">
          <Terminal className="text-tactical-cyan" size={16} />
          <h2 className="bento-label italic">KIPHER_COMMAND_CENTER</h2>
        </div>
        <div className="flex-1 flex justify-end min-w-0">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 mask-fade-right max-w-full">
            <CommandTab active={activeTab === 'BROADCAST'} onClick={() => setActiveTab('BROADCAST')} icon={<Radio size={12} />} label="TX" />
            <CommandTab active={activeTab === 'USERS'} onClick={() => setActiveTab('USERS')} icon={<Users size={12} />} label="USERS" />
            <CommandTab active={activeTab === 'CREATE'} onClick={() => setActiveTab('CREATE')} icon={<UserPlus size={12} />} label="GEN" />
            <CommandTab active={activeTab === 'LOGS'} onClick={() => setActiveTab('LOGS')} icon={<List size={12} />} label="LOGS" />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-slate-950/20">
        {activeTab === 'BROADCAST' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="kipher-panel">
              <div className="flex items-center gap-2 text-tactical-cyan mb-4 text-[10px] font-black uppercase tracking-widest">
                <Zap size={14} /> TACTICAL_INTERVENTION_VECTORS
              </div>
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="space-y-2">
                  <div className="text-[8px] text-slate-500 font-bold uppercase italic">Global_Override</div>
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => {
                        if (confirm('ENGAGE_NETWORK_WIDE_SAFETY_PROTOCOLS?')) {
                          sendDirectCommand('', 'SAFETY'); 
                        }
                      }}
                      className="w-full py-3 border border-red-500/50 text-red-500 text-[10px] font-black uppercase hover:bg-red-500 hover:text-black transition-all flex flex-col items-center gap-1 shadow-lg shadow-red-950/20"
                    >
                      <ShieldHalf size={18} />
                      PANIC
                    </button>
                    <button 
                      onClick={() => {
                        const url = prompt('ENTER_GLOBAL_REDIRECT_URL:');
                        if (url) sendDirectCommand('', 'REDIRECT', url);
                      }}
                      className="w-full py-3 border border-yellow-500/50 text-yellow-500 text-[10px] font-black uppercase hover:bg-yellow-500 hover:text-black transition-all flex flex-col items-center gap-1"
                    >
                      <ExternalLink size={18} />
                      REDIRECT
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-[8px] text-slate-500 font-bold uppercase italic">Session_Reset</div>
                  <button 
                    onClick={() => {
                      if (confirm('FORCE_GLOBAL_RESPAWN?')) {
                        sendDirectCommand('', 'RESTORE');
                      }
                    }}
                    className="w-full py-3 border border-tactical-cyan/50 text-tactical-cyan text-[10px] font-black uppercase hover:bg-tactical-cyan hover:text-black transition-all flex flex-col items-center gap-1"
                  >
                    <RefreshCw size={18} />
                    FORCE_RESPAWN
                  </button>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="text-[8px] text-slate-500 font-bold uppercase italic">Data_Sanitization</div>
                  <div className="flex gap-2">
                    <button 
                      onClick={purgeMeetingHub}
                      className="flex-1 py-3 border border-white/10 text-white/40 text-[9px] font-black uppercase hover:border-red-500 hover:text-red-500 transition-all flex flex-col items-center gap-1"
                    >
                      <Trash2 size={16} />
                      PURGE_HUB
                    </button>
                    <button 
                      onClick={purgeAllNodes}
                      className="flex-1 py-3 border border-white/10 text-white/40 text-[9px] font-black uppercase hover:border-red-500 hover:text-red-500 transition-all flex flex-col items-center gap-1"
                    >
                      <Trash2 size={16} />
                      PURGE_NODES
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-[8px] text-slate-500 font-bold uppercase italic">Media_Inject (Remote_Static)</div>
                  <form onSubmit={(e) => { e.preventDefault(); injectMedia(); }} className="flex gap-2">
                    <input 
                      value={mediaUrl}
                      onChange={(e) => setMediaUrl(e.target.value)}
                      className="flex-1 kipher-input" 
                      placeholder="IMAGE_URL..."
                    />
                    <button 
                      onClick={() => sendDirectCommand('', 'MEDIA', mediaUrl)}
                      className="kipher-button px-6"
                    >
                      INJECT
                    </button>
                  </form>
                </div>

                <div className="space-y-2">
                  <div className="text-[8px] text-slate-500 font-bold uppercase italic">Priority_Alert (HUD_Override)</div>
                  <form onSubmit={(e) => { e.preventDefault(); sendBroadcast(); }} className="flex gap-2">
                    <input 
                      value={broadcast}
                      onChange={(e) => setBroadcast(e.target.value)}
                      className="flex-1 kipher-input border-red-900/30 focus:border-red-500 text-red-500" 
                      placeholder="BROADCAST_MESSAGE..."
                    />
                    <button 
                      onClick={() => sendDirectCommand('', 'ALERT', broadcast)}
                      className="kipher-button border-red-900/30 hover:border-red-500 text-red-500 px-6"
                    >
                      ALERT
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'USERS' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="kipher-panel">
              <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-2">
                <h3 className="text-[10px] font-black text-tactical-cyan tracking-widest uppercase flex items-center gap-2">
                  <Users size={12} /> SECURE_ASSET_REGISTER
                </h3>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setActiveTab('CREATE')}
                    className="text-[9px] font-black text-tactical-cyan border border-tactical-cyan/40 px-2 py-0.5 rounded-sm hover:bg-tactical-cyan hover:text-black transition-all flex items-center gap-1"
                  >
                    <UserPlus size={10} /> DEPLOY_NEW
                  </button>
                  <span className="text-[8px] text-white/30 font-mono">STATUS: {systemUsers.length}_LINKED</span>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                {systemUsers.map(u => (
                  <div key={u.uid} className={`p-3 border rounded transition-all flex flex-col gap-2 ${u.isBanned ? 'bg-blood-red/5 border-blood-red/20 opacity-50' : 'bg-slate-900/40 border-white/5 hover:border-tactical-cyan/30'}`}>
                    <div className="flex justify-between items-start">
                      <div className="flex flex-col">
                        <span className={`text-[11px] font-black tracking-widest ${u.isBanned ? 'text-blood-red' : 'text-white'}`}>
                          {u.displayName}
                        </span>
                        <div className="flex items-center gap-1 mt-0.5">
                          <span className={`text-[8px] px-1 rounded ${u.role === 'SUPERUSER' ? 'bg-tactical-cyan/20 text-tactical-cyan' : 'bg-white/10 text-white/40'}`}>
                            {u.role}
                          </span>
                          <span className="text-[8px] text-white/20 font-mono">UID: {u.uid.slice(-6)}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <div className="relative group">
                          <Info size={10} className="text-white/20 cursor-help hover:text-tactical-cyan transition-colors" />
                          <div className="absolute bottom-full right-0 mb-2 w-48 p-2 bg-absolute-black border border-white/10 rounded text-[9px] leading-tight text-white/80 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-20">
                             Modifies security clearance and privilege level. LvL 5+ grants terminal access.
                          </div>
                        </div>
                        <select 
                          value={u.clearanceLevel} 
                          onChange={(e) => updateUserLevel(u.uid, Number(e.target.value))}
                          className="bg-absolute-black border border-white/10 rounded text-[9px] text-tactical-cyan font-mono px-1 h-5 outline-none"
                          disabled={u.isOwner}
                        >
                          {[1,2,3,4,5].map(v => <option key={v} value={v}>L_{v}</option>)}
                        </select>
                        {!u.isBanned && !u.isOwner && (
                          <div className="flex gap-1">
                            <button 
                              onClick={() => {
                                const url = prompt('ENTER_REDIRECT_URL (e.g. google.com):');
                                if (url) sendDirectCommand(u.uid, 'REDIRECT', url);
                              }}
                              className="p-1 border border-white/5 hover:border-tactical-cyan text-white/20 hover:text-tactical-cyan transition-all relative group/cmd"
                            >
                              <ExternalLink size={10} />
                              <div className="absolute bottom-full right-0 mb-1 px-2 py-1 bg-tactical-cyan text-black text-[7px] font-black rounded opacity-0 group-hover/cmd:opacity-100 pointer-events-none">REDIRECT</div>
                            </button>
                            <button 
                              onClick={() => sendDirectCommand(u.uid, 'SAFETY')}
                              className="p-1 border border-white/5 hover:border-red-500 text-white/20 hover:text-red-500 transition-all relative group/cmd"
                            >
                              <ShieldHalf size={10} />
                              <div className="absolute bottom-full right-0 mb-1 px-2 py-1 bg-red-500 text-black text-[7px] font-black rounded opacity-0 group-hover/cmd:opacity-100 pointer-events-none">PANIC</div>
                            </button>
                            <button 
                              onClick={() => deleteUser(u.uid)} 
                              className="p-1 border border-white/5 hover:border-red-600 text-white/20 hover:text-red-600 transition-all relative group/btn"
                            >
                              <X size={10} />
                              <div className="absolute bottom-full right-0 mb-1 px-2 py-1 bg-red-600 text-white text-[7px] font-black rounded opacity-0 group-hover/btn:opacity-100 pointer-events-none whitespace-nowrap">
                                DELETE
                              </div>
                            </button>
                            <button 
                              onClick={() => banUser(u.uid)} 
                              className="p-1 border border-white/5 hover:border-blood-red text-white/20 hover:text-blood-red transition-all relative group/btn"
                            >
                              <Skull size={10} />
                              <div className="absolute bottom-full right-0 mb-1 px-2 py-1 bg-blood-red text-white text-[7px] font-black rounded opacity-0 group-hover/btn:opacity-100 pointer-events-none whitespace-nowrap">
                                REVOKE
                              </div>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'CREATE' && (
          <div className="max-w-md mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <CreateAgentForm />
          </div>
        )}

        {activeTab === 'LOGS' && (
          <div className="space-y-2 animate-in fade-in duration-300">
            <div className="flex items-center gap-2 text-slate-500 mb-4 text-[10px] font-black uppercase tracking-widest">
              <List size={14} /> SYSTEM_ACCESS_LOGS
            </div>
            <div className="font-mono text-[10px] space-y-1">
              <LogEntry time={ensureDate(new Date()).toLocaleTimeString()} msg="SYSTEM_TAB_SWITCHED: COMMAND_LOGS" color="text-slate-500" />
              <LogEntry time="14:50:01" msg="USER_PROVISIONED: ECHO_V2" color="text-tactical-cyan" />
              <LogEntry time="14:48:33" msg="UNAUTHORIZED_ACCESS_BLOCKED: IP_192.168.0.1" color="text-red-500" />
              <LogEntry time="14:45:10" msg="SYSTEM_WIPE_PROTOCOLS_READY" color="text-slate-500" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function CommandTab({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`px-3 py-1 border transition-all flex items-center gap-2 rounded-sm group relative shrink-0 ${active ? 'border-tactical-cyan text-tactical-cyan bg-tactical-cyan/5' : 'border-slate-800 text-slate-600 hover:border-slate-700 hover:text-slate-400'}`}
    >
      {icon}
      <span className="text-[8px] font-black tracking-widest">{label}</span>
      {active && <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-tactical-cyan rounded-full shadow-[0_0_8px_rgba(4,217,217,1)]" />}
    </button>
  );
}

function LogEntry({ time, msg, color = 'text-slate-500' }: { time: string, msg: string, color?: string }) {
  return (
    <div className="flex gap-3 border-l border-slate-900 pl-2 py-1">
      <span className="text-slate-700">[{time}]</span>
      <span className={color}>{msg}</span>
    </div>
  );
}
