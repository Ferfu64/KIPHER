import React, { useState } from 'react';
import { db, auth } from '../lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';
import { UserProfile } from '../types';
import { Shield, UserPlus, AlertCircle } from 'lucide-react';
import { handleFirestoreError, OperationType } from '../lib/utils';

export default function AdminUserForm({ onComplete }: { onComplete: () => void }) {
  const [codename, setCodename] = useState('');
  const [password, setPassword] = useState('');
  const [clearance, setClearance] = useState(1);
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!codename || !password) return setError('ALL_FIELDS_REQUIRED');
    
    setLoading(true);
    setError(null);

    try {
      // Ensure we have a valid Auth identity before writing to Firestore
      if (!auth.currentUser) {
        await signInAnonymously(auth);
      }

      // Generate a URL-safe UID from the codename
      const uid = codename.toLowerCase().replace(/[^a-z0-9]/g, '_') + '_' + Math.random().toString(36).substring(2, 7);
      
      const newUser: UserProfile = {
        uid,
        displayName: codename,
        password: password, // Stored in DB as requested for custom logic
        email: `${codename.toLowerCase()}@kipher.internal`,
        role: isOwner ? 'OWNER' : 'ASSET',
        isOwner: isOwner,
        clearanceLevel: clearance,
        isBanned: false,
        status: 'ACTIVE',
        lastSeen: new Date().toISOString()
      };

      await setDoc(doc(db, 'users', uid), {
        ...newUser,
        createdAt: serverTimestamp(),
        lastSeen: serverTimestamp()
      });

      setCodename('');
      setPassword('');
      setIsOwner(false);
      setClearance(1);
      onComplete();
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'users');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="kipher-panel bg-slate-950/50 border border-slate-800">
      <div className="flex items-center gap-3 mb-6 border-b border-slate-900 pb-4">
        <Shield className="text-tactical-cyan" size={20} />
        <h3 className="text-sm font-black tracking-widest uppercase">NEW_AGENT_PROVISIONING</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="text-[10px] text-red-500 font-bold bg-red-500/10 p-2 border border-red-500/30 flex items-center gap-2">
            <AlertCircle size={12} /> {error}
          </div>
        )}

        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Agent Codename</label>
            <input 
              value={codename}
              onChange={(e) => setCodename(e.target.value.toUpperCase())}
              className="w-full kipher-input" 
              placeholder="GHOST_PROTOCOL" 
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Initial Password</label>
            <input 
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full kipher-input text-tactical-cyan font-mono" 
              placeholder="••••••••" 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Clearance Level</label>
              <select 
                value={clearance}
                onChange={(e) => setClearance(Number(e.target.value))}
                className="w-full bg-slate-900 border-b border-slate-800 p-2 text-xs text-tactical-cyan outline-none"
              >
                {[1, 2, 3, 4, 5].map(lvl => (
                  <option key={lvl} value={lvl}>LEVEL_{lvl}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end pb-2">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={isOwner}
                  onChange={(e) => setIsOwner(e.target.checked)}
                  className="hidden"
                />
                <div className={`w-4 h-4 border ${isOwner ? 'bg-tactical-cyan border-tactical-cyan' : 'border-slate-800'}`} />
                <span className="text-[10px] text-slate-500 group-hover:text-slate-300 font-bold uppercase">Grant Owner Access</span>
              </label>
            </div>
          </div>
        </div>

        <button 
          disabled={loading}
          className="w-full kipher-button bg-tactical-cyan text-absolute-black font-black flex items-center justify-center gap-2"
        >
          {loading ? 'PROCESSING...' : <><UserPlus size={14} /> DEPLOY_AGENT</>}
        </button>
      </form>
    </div>
  );
}
