import React, { useState } from 'react';
import { db, auth } from '../lib/firebase';
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';
import { UserProfile } from '../types';
import { Shield, UserPlus, Info, Terminal, Key, Smartphone, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function CreateAgentForm() {
  const [codename, setCodename] = useState('');
  const [password, setPassword] = useState('');
  const [clearance, setClearance] = useState(1);
  const [isSuperuser, setIsSuperuser] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'error' | 'success', msg: string } | null>(null);

  const generatePass = () => {
    const charset = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let retVal = "";
    for (let i = 0; i < 8; ++i) {
      retVal += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    setPassword(retVal);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (codename.trim().length < 3) return setStatus({ type: 'error', msg: 'CODENAME_TOO_SHORT' });
    if (!password) return setStatus({ type: 'error', msg: 'PASSWORD_REQUIRED' });

    setLoading(true);
    setStatus(null);

    try {
      // 1. Establish/Verify Auth Session
      if (!auth.currentUser) {
        try {
          await signInAnonymously(auth);
        } catch (authErr: any) {
          if (authErr && authErr.code === 'auth/admin-restricted-operation') {
            throw new Error('SYSTEM_RESTRICTION: ANONYMOUS_AUTH_DISABLED. ENABLE IT IN FIREBASE CONSOLE > AUTH > PROVIDERS.');
          }
          throw new Error('AUTH_IDENTITY_FAILURE: UNABLE_TO_ESTABLISH_SECURE_CONNECTION');
        }
      }
      
      const userUid = auth.currentUser?.uid;
      if (!userUid) throw new Error('AUTH_SESSION_RECOVERY_FAILED');

      // 2. Check if we actually have Admin rights in Firestore
      const adminDoc = await getDoc(doc(db, 'admins', userUid));
      if (!adminDoc.exists()) {
        throw new Error('INSUFFICIENT_PRIVILEGES: THIS_IDENTITY_IS_NOT_RECOGNIZED_AS_ADMIN_IN_FIRESTORE');
      }

      // 3. Prepare User Data
      const formattedCodename = codename.trim().toUpperCase();
      const targetUid = formattedCodename.toLowerCase().replace(/[^a-z0-9]/g, '_') + '_' + Math.random().toString(36).substring(2, 6);
      
      const newUser: UserProfile = {
        uid: targetUid,
        displayName: formattedCodename,
        password: password,
        role: isSuperuser ? 'SUPERUSER' : 'AGENT',
        isOwner: false,
        clearanceLevel: clearance,
        lastSeen: serverTimestamp(),
        isBanned: false
      };

      // 4. Write to Firestore
      await setDoc(doc(db, 'users', targetUid), newUser);
      
      setStatus({ type: 'success', msg: `AGENT_DEPLOYED: ${formattedCodename}` });
      setCodename('');
      setPassword('');
      setClearance(1);
      setIsSuperuser(false);

    } catch (err: any) {
      console.error('Agent Creation Error:', err);
      let errorMsg = 'DEPLOYMENT_FAILED';
      
      if (err.message && err.message.includes('permission')) {
        errorMsg = 'ACCESS_DENIED: INSUFFICIENT_SECURITY_CLEARANCE';
      } else if (err.message) {
        errorMsg = err.message.toUpperCase();
      }
      
      setStatus({ type: 'error', msg: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900/40 border border-tactical-cyan/20 p-6 rounded-sm relative">
      <div className="flex items-center gap-3 mb-6 border-b border-tactical-cyan/10 pb-4">
        <UserPlus className="text-tactical-cyan" size={20} />
        <div>
          <h3 className="text-sm font-black text-white uppercase tracking-[0.2em]">Agent Creation Terminal</h3>
          <p className="text-[10px] text-tactical-cyan/50 font-mono italic">LEVEL_5_CLEARANCE_REQUIRED</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <label className="text-[10px] font-mono text-slate-400 uppercase flex items-center justify-between group">
            <span className="flex items-center gap-1.5"><Smartphone size={10} /> Agent Codename</span>
            <div className="relative">
              <Info size={10} className="text-slate-600 hover:text-tactical-cyan cursor-help" />
              <div className="absolute bottom-full right-0 mb-2 w-48 p-2 bg-absolute-black border border-white/10 rounded text-[8px] leading-tight text-white/70 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10 shadow-2xl normal-case font-sans">
                The agent's public identifier within the network. Minimum 3 characters.
              </div>
            </div>
          </label>
          <input
            value={codename}
            onChange={(e) => setCodename(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded px-4 py-2 text-xs text-tactical-cyan placeholder:text-white/10 outline-none focus:border-tactical-cyan/50 transition-colors uppercase font-mono"
            placeholder="OPERATIVE_ID"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-mono text-slate-400 uppercase flex items-center justify-between group">
            <span className="flex items-center gap-1.5"><Key size={10} /> Passphrase</span>
            <button 
              type="button" 
              onClick={generatePass}
              className="text-[9px] text-tactical-cyan hover:text-white flex items-center gap-1 transition-colors"
            >
              <Terminal size={10} /> AUTO_GEN
            </button>
          </label>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded px-4 py-2 text-xs text-white placeholder:text-white/10 outline-none focus:border-tactical-cyan/50 transition-colors font-mono"
            placeholder="SECURE_KEY"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono text-slate-400 uppercase flex items-center gap-1.5 group">
              Clearance
              <div className="relative">
                <Info size={10} className="text-slate-600 hover:text-tactical-cyan cursor-help" />
                <div className="absolute bottom-full left-0 mb-2 w-40 p-2 bg-absolute-black border border-white/10 rounded text-[8px] leading-tight text-white/70 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10 shadow-2xl normal-case font-sans">
                  Default level is 1. Level 5 provides maximum system oversight.
                </div>
              </div>
            </label>
            <select
              value={clearance}
              onChange={(e) => setClearance(Number(e.target.value))}
              className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-xs text-tactical-cyan outline-none appearance-none font-mono"
            >
              {[1, 2, 3, 4, 5].map(lv => (
                <option key={lv} value={lv} className="bg-slate-900 text-tactical-cyan">LEVEL_{lv}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-mono text-slate-400 uppercase flex items-center gap-1.5 group">
              Privileges
              <div className="relative">
                <Info size={10} className="text-slate-600 hover:text-tactical-cyan cursor-help" />
                <div className="absolute bottom-full right-0 mb-2 w-40 p-2 bg-absolute-black border border-white/10 rounded text-[8px] leading-tight text-white/70 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10 shadow-2xl normal-case font-sans">
                  Superusers can manage other agents and broadcasts.
                </div>
              </div>
            </label>
            <div className={`h-[34px] border rounded flex items-center px-3 transition-colors cursor-pointer ${isSuperuser ? 'bg-tactical-cyan/10 border-tactical-cyan/40' : 'bg-black/40 border-white/10'}`} onClick={() => setIsSuperuser(!isSuperuser)}>
               <div className={`w-3 h-3 rounded-full mr-2 border transition-all ${isSuperuser ? 'bg-tactical-cyan border-tactical-cyan scale-110 shadow-[0_0_8px_rgba(4,217,217,0.5)]' : 'border-white/20'}`} />
               <span className={`text-[10px] font-mono uppercase ${isSuperuser ? 'text-tactical-cyan' : 'text-slate-500'}`}>Superuser</span>
            </div>
          </div>
        </div>

        {status && (
          <div className={`p-3 rounded border flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300 ${status.type === 'error' ? 'bg-blood-red/10 border-blood-red/30' : 'bg-tactical-cyan/10 border-tactical-cyan/30'}`}>
            {status.type === 'error' ? <AlertCircle size={14} className="text-blood-red mt-0.5" /> : <CheckCircle2 size={14} className="text-tactical-cyan mt-0.5" />}
            <span className={`text-[10px] font-mono uppercase leading-tight ${status.type === 'error' ? 'text-blood-red' : 'text-tactical-cyan'}`}>
              {status.msg}
            </span>
          </div>
        )}

        <button
          disabled={loading}
          className={`w-full py-4 rounded border font-black text-xs uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3 ${loading ? 'opacity-50 border-white/10 text-slate-500 cursor-not-allowed' : 'border-tactical-cyan text-tactical-cyan hover:bg-tactical-cyan hover:text-black hover:shadow-[0_0_20px_rgba(4,217,217,0.3)]'}`}
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 border-2 border-t-transparent border-slate-500 rounded-full animate-spin" />
              DEPLOYING...
            </div>
          ) : (
            <>
              <Shield size={14} />
              Commit Identity
            </>
          )}
        </button>
      </form>
    </div>
  );
}
