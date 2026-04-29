import React, { useState, useEffect } from 'react';
import { db, auth } from '../lib/firebase';
import { collection, query, onSnapshot, where, orderBy, getDocs, addDoc, serverTimestamp, deleteDoc, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { UserProfile, VaultItem, VaultFile } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Archive, Lock, FileText, Database, ShieldAlert, X, ChevronRight, Plus, Download, Trash2, Key, Info } from 'lucide-react';
import { handleFirestoreError, OperationType, ensureDate } from '../lib/utils';
import { audioService } from '../services/audioService';
import { signInAnonymously } from 'firebase/auth';

export default function TheVault({ currentUser, compact }: { currentUser: UserProfile, compact?: boolean }) {
  const [items, setItems] = useState<VaultItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<VaultItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState<VaultItem | null>(null);
  const [joinCode, setJoinCode] = useState('');

  const [newVaultName, setNewVaultName] = useState('');
  const [newVaultCode, setNewVaultCode] = useState('');
  const [newVaultLVL, setNewVaultLVL] = useState(1);

  useEffect(() => {
    const q = query(
      collection(db, 'vaults'),
      orderBy('clearanceRequired', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: VaultItem[] = [];
      snapshot.forEach(doc => list.push({ id: doc.id, ...doc.data() } as VaultItem));
      setItems(list);
      setLoading(false);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'vaults', true));

    return unsubscribe;
  }, []);

  const createVault = async () => {
    const existing = items.find(v => v.ownerId === currentUser.uid);
    if (existing) return alert('VAULT_LIMIT_EXCEEDED: ONE VAULT PER ASSET.');
    if (!/^[0-9]{4}$/.test(newVaultCode)) return alert('CODE_INVALID: MUST BE 4 DIGITS.');

    try {
      if (!auth.currentUser) await signInAnonymously(auth);
      await addDoc(collection(db, 'vaults'), {
        title: newVaultName || 'DATA_VAULT',
        description: 'SECURED_INTEL_STORAGE',
        passcode: newVaultCode,
        clearanceRequired: newVaultLVL,
        ownerId: currentUser.uid,
        files: [],
        createdAt: serverTimestamp()
      });
      setShowCreate(false);
      setNewVaultName('');
      setNewVaultCode('');
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, 'vaults');
    }
  };

  const handleJoin = () => {
    if (showJoin && joinCode === showJoin.passcode) {
      setSelectedItem(showJoin);
      setShowJoin(null);
      setJoinCode('');
    } else {
      alert('ACCESS_KEY_INVALID');
    }
  };

  const deleteVault = async (id: string) => {
    if (confirm('TERMINATE_VAULT? DATA WILL BE PURGED.')) {
      try {
        await deleteDoc(doc(db, 'vaults', id));
      } catch (e) {
        handleFirestoreError(e, OperationType.DELETE, `vaults/${id}`);
      }
    }
  };

  if (loading) return <div className="p-8 text-tactical-cyan animate-pulse">DECRYPTING_VAULTS...</div>;

  return (
    <div className={compact ? "" : "space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500"}>
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div className="flex items-center gap-3">
          <Archive className="text-tactical-cyan" size={24} />
          <div>
            <h2 className="text-xl font-black tracking-tighter uppercase italic">Secure_Repositories</h2>
          </div>
        </div>
        <button 
          onClick={() => setShowCreate(true)}
          className="kipher-button bg-tactical-cyan text-black font-black"
        >
          <Plus size={14} className="mr-2 inline" /> INITIALIZE_REPOS
        </button>
      </div>

      <div className={compact ? "grid grid-cols-1 gap-2" : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"}>
        {items.map((item) => (
          <VaultCard 
            key={item.id} 
            item={item} 
            user={currentUser} 
            onOpen={() => item.ownerId === currentUser.uid ? setSelectedItem(item) : setShowJoin(item)}
            onDelete={() => deleteVault(item.id)}
            compact={compact}
          />
        ))}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {selectedItem && (
          <VaultModal 
            item={selectedItem} 
            currentUser={currentUser}
            onClose={() => setSelectedItem(null)} 
          />
        )}
        
        {showJoin && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 p-4">
             <div className="max-w-xs w-full kipher-panel text-center">
                <Lock size={32} className="mx-auto mb-4 text-tactical-cyan" />
                <h3 className="text-lg font-black mb-1 uppercase tracking-tighter">{showJoin.title}</h3>
                <p className="text-[9px] text-slate-500 mb-6 font-bold uppercase">Uplink Secured // Enter Auth Code</p>
                <input 
                  type="password" 
                  maxLength={4}
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                  className="w-full text-center text-2xl tracking-[0.5em] kipher-input mb-8 h-12"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button onClick={() => setShowJoin(null)} className="flex-1 kipher-button">ABORT</button>
                  <button onClick={handleJoin} className="flex-1 kipher-button bg-tactical-cyan text-black font-black">ACCESS</button>
                </div>
             </div>
          </motion.div>
        )}

        {showCreate && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 p-4">
             <div className="max-w-md w-full kipher-panel">
                <h3 className="text-xl font-black mb-6 flex items-center gap-2">
                  <Plus size={20} className="text-tactical-cyan" /> FABRICATE_DATA_VAULT
                </h3>
                <div className="space-y-4">
                   <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Vault_Title</label>
                      <input 
                        value={newVaultName}
                        onChange={(e) => setNewVaultName(e.target.value)}
                        className="w-full kipher-input" 
                        placeholder="INTEL_NODE_X" 
                      />
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                         <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Clearance_Required</label>
                         <select 
                           value={newVaultLVL}
                           onChange={(e) => setNewVaultLVL(Number(e.target.value))}
                           className="w-full kipher-input"
                         >
                           {[1,2,3,4,5].map(v => <option key={v} value={v}>LEVEL_{v}</option>)}
                         </select>
                      </div>
                      <div className="space-y-1">
                         <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">4-Digit_Key</label>
                         <input 
                           value={newVaultCode}
                           onChange={(e) => setNewVaultCode(e.target.value)}
                           maxLength={4}
                           type="password"
                           className="w-full kipher-input tracking-[0.5em]" 
                           placeholder="XXXX" 
                         />
                      </div>
                   </div>
                   <div className="flex gap-3 pt-6">
                      <button onClick={() => setShowCreate(false)} className="flex-1 kipher-button font-black uppercase">Cancel</button>
                      <button onClick={createVault} className="flex-1 kipher-button bg-tactical-cyan text-black font-black uppercase">Deploy</button>
                   </div>
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function VaultCard({ item, user, onOpen, onDelete, compact }: { item: VaultItem, user: UserProfile, onOpen: () => void, onDelete: () => void | Promise<void>, compact?: boolean, key?: string | number }) {
  const isAccessible = user.isOwner || user.clearanceLevel >= item.clearanceRequired;

  return (
    <motion.div 
      whileHover={isAccessible ? { y: -2 } : {}}
      className={`kipher-panel relative group bg-black/40 ${isAccessible ? 'hover:border-tactical-cyan' : 'opacity-40 grayscale pointer-events-none'}`}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="w-10 h-10 bg-slate-900 border border-slate-800 flex items-center justify-center text-tactical-cyan">
          {item.clearanceRequired >= 4 ? <ShieldAlert size={20} className="text-red-500" /> : <Archive size={20} />}
        </div>
        <div className="text-right">
          <div className="text-[8px] text-slate-600 font-bold uppercase tracking-[0.2em]">REPO_V{item.id.slice(0, 4).toUpperCase()}</div>
          <div className={`text-[10px] font-black uppercase ${user.clearanceLevel >= item.clearanceRequired ? 'text-tactical-cyan' : 'text-slate-600'}`}>REQ_LVL_{item.clearanceRequired}</div>
        </div>
      </div>

      <h3 className="text-sm font-black text-white uppercase italic group-hover:text-tactical-cyan transition-colors mb-4">{item.title}</h3>
      
      <div className="flex gap-2">
        <button 
          onClick={onOpen}
          className="flex-1 kipher-button bg-slate-900 border-slate-800 py-2 text-[10px] font-black"
        >
          {item.ownerId === user.uid ? 'MANAGE_REPO' : 'ACCESS_LINK'}
        </button>
        {item.ownerId === user.uid && (
          <button onClick={onDelete} className="px-3 kipher-button border-red-900/40 text-red-900 group-hover:text-red-500 group-hover:border-red-500">
            <Trash2 size={14} />
          </button>
        )}
      </div>
    </motion.div>
  );
}

function VaultModal({ item, currentUser, onClose }: { item: VaultItem, currentUser: UserProfile, onClose: () => void }) {
  const [uploading, setUploading] = useState(false);

  const simulateUpload = async () => {
    setUploading(true);
    if (audioService.getMuteStatus() === false) audioService.playBlip();
    
    setTimeout(async () => {
      try {
        const id = Math.random().toString(36).substring(7);
        const newFile: VaultFile = {
           id,
           name: `INTEL_${id.toUpperCase()}.DAT`,
           url: '#',
           type: ['ENCRYPTED', 'RAW_SIGNAL', 'BIOMETRIC', 'GEOLOC'][Math.floor(Math.random() * 4)],
           size: Math.random() * 50000,
           uploadedBy: currentUser.displayName,
           timestamp: new Date().toISOString()
        };
        await updateDoc(doc(db, 'vaults', item.id), {
          files: arrayUnion(newFile)
        });
        setUploading(false);
        if (audioService.getMuteStatus() === false) audioService.playSuccess();
      } catch (e) {
        console.error(e);
        setUploading(false);
        if (audioService.getMuteStatus() === false) audioService.playError();
      }
    }, 1500);
  };

  const removeFile = async (fileId: string) => {
    if (!confirm('ERASE_ENTRY?')) return;
    try {
      const updated = item.files.filter(f => f.id !== fileId);
      await updateDoc(doc(db, 'vaults', item.id), { files: updated });
      if (audioService.getMuteStatus() === false) audioService.playError();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 p-4 font-mono">
       <div className="max-w-3xl w-full kipher-panel relative min-h-[500px] flex flex-col">
          <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors">
            <X size={24} />
          </button>

          <div className="p-8 border-b border-slate-900 bg-slate-900/10 shrink-0">
             <div className="flex items-center gap-4 mb-2">
                <Database size={32} className="text-tactical-cyan" />
                <h2 className="text-2xl font-black text-white tracking-tighter uppercase italic">{item.title}</h2>
             </div>
             <p className="text-[10px] text-slate-600 font-bold uppercase tracking-[0.4em]">Encrypted Storage Protocol // Auth: Verified</p>
          </div>

          <div className="flex-1 flex overflow-hidden">
             {/* Info Sidebar */}
             <div className="w-64 border-r border-slate-900 p-6 space-y-6 hidden md:block">
                <div>
                   <h4 className="text-[10px] font-black text-slate-500 mb-2 uppercase">Integrity</h4>
                   <div className="h-1 bg-slate-900 w-full overflow-hidden">
                      <div className="h-full bg-tactical-cyan w-4/5"></div>
                   </div>
                </div>
                <div className="space-y-3">
                   <div className="flex justify-between text-[9px] font-bold uppercase">
                      <span className="text-slate-700 underline underline-offset-4 decoration-tactical-cyan/30">Owner</span>
                      <span className="text-slate-400">{item.ownerId.slice(0, 8)}</span>
                   </div>
                   <div className="flex justify-between text-[9px] font-bold uppercase">
                      <span className="text-slate-700 underline underline-offset-4 decoration-tactical-cyan/30">Clearance</span>
                      <span className="text-tactical-cyan">LVL_{item.clearanceRequired}</span>
                   </div>
                </div>
                
                <button 
                  disabled={uploading}
                  onClick={simulateUpload}
                  className="w-full kipher-button border-tactical-cyan/30 text-tactical-cyan hover:bg-tactical-cyan hover:text-black font-black uppercase text-[10px] py-3 mt-8"
                >
                  {uploading ? 'UPLOADING...' : 'PUSH_FILE'}
                </button>
             </div>

             {/* File List */}
             <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
                <div className="flex items-center justify-between mb-6">
                   <h3 className="text-xs font-black text-slate-400 flex items-center gap-2">
                     <FileText size={14} /> RECORDED_ENTRIES
                   </h3>
                   <span className="text-[9px] font-bold text-slate-700 uppercase">{item.files?.length || 0} Assets</span>
                </div>

                <div className="space-y-2">
                   {item.files && item.files.length > 0 ? item.files.map(file => (
                     <div key={file.id} className="p-4 bg-slate-900/30 border border-slate-900 group hover:border-tactical-cyan/40 transition-all flex items-center justify-between">
                        <div className="flex items-center gap-4 min-w-0">
                           <div className="w-10 h-10 bg-slate-800 flex items-center justify-center text-slate-500 group-hover:text-tactical-cyan transition-colors">
                              <FileText size={18} />
                           </div>
                           <div className="min-w-0">
                              <div className="text-xs font-black text-slate-200 uppercase truncate">{file.name}</div>
                              <div className="text-[8px] text-slate-600 font-bold uppercase tracking-widest mt-1">
                                SHA-256: {Math.random().toString(16).substring(2, 18).toUpperCase()} // {(file.size / 1024).toFixed(1)} KB
                              </div>
                           </div>
                        </div>
                        <div className="flex gap-2">
                           <div className="px-2 py-1 bg-slate-950 border border-slate-800 text-[8px] font-black text-tactical-cyan self-center">
                             {file.type}
                           </div>
                           <button className="p-2 border border-slate-800 hover:border-tactical-cyan text-slate-600 hover:text-tactical-cyan transition-all">
                              <Download size={14} />
                           </button>
                           {item.ownerId === currentUser.uid && (
                             <button onClick={() => removeFile(file.id)} className="p-2 border border-slate-800 hover:border-red-500 text-slate-600 hover:text-red-500 transition-all">
                                <Trash2 size={14} />
                             </button>
                           )}
                        </div>
                     </div>
                   )) : (
                     <div className="flex flex-col items-center justify-center py-20 opacity-20 italic text-slate-500 font-bold text-[10px] border-2 border-dashed border-slate-900">
                        EMPTY_REPOSITORY_IDLE
                     </div>
                   )}
                </div>
             </div>
          </div>

          <div className="p-4 border-t border-slate-900 bg-black/40 text-[9px] font-bold text-slate-700 uppercase flex justify-between px-8 italic">
             <span>Kernel: v.Vault-K7-1 // Link: Terminated on Close</span>
             <span>Access Logged: {ensureDate(new Date()).toLocaleTimeString()}</span>
          </div>
       </div>
    </motion.div>
  );
}
