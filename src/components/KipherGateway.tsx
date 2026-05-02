import React, { useState, useEffect } from 'react';
import { auth, db } from '../lib/firebase';
import { signInWithEmailAndPassword, onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { collection, query, where, getDocs, doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Lock, Terminal, Activity, User, Key, Info } from 'lucide-react';
import { UserProfile } from '../types';
import GestureListener, { GhostTerminal } from './GestureListener';

import KipherLogo from './KipherLogo';

export default function KipherGateway({ onAuthChange }: { onAuthChange: (user: UserProfile | null) => void }) {
  const [codename, setCodename] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isGhostTerminalOpen, setIsGhostTerminalOpen] = useState(false);

  const handleCustomLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Backdoor to open ghost terminal
    if (codename.toUpperCase() === 'K7' && password === '67') {
      setIsGhostTerminalOpen(true);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Ensure Firebase Auth is established BEFORE querying
      if (!auth.currentUser) {
        try {
          const authResult = await signInAnonymously(auth);
          if (!authResult.user) throw new Error('AUTH_IDENTITY_ESTABLISHMENT_FAILED');
        } catch (authErr: any) {
          if (authErr && authErr.code === 'auth/admin-restricted-operation') {
            throw new Error('SYSTEM_ERROR: ANONYMOUS_LOGIN_RESTRICTED_BY_FIREBASE_CONSOLE');
          }
          throw authErr;
        }
      }

      // 2. Search for user by Codename and Password in Firestore
      const q = query(
        collection(db, 'users'), 
        where('displayName', '==', codename.toUpperCase()),
        where('password', '==', password),
        where('isBanned', '==', false)
      );
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        throw new Error('INVALID_CREDENTIALS');
      }

      const userDoc = snapshot.docs[0];
      const userData = userDoc.data() as UserProfile;

      const authUid = auth.currentUser?.uid;
      if (!authUid) throw new Error('AUTH_SESSION_MISSING');
      
      // 3. Mark this session in Firestore if they are an owner/admin
      if (userData.isOwner || userData.role === 'SUPERUSER') {
        try {
          await setDoc(doc(db, 'admins', authUid), {
            uid: userData.uid,
            codename: userData.displayName,
            timestamp: serverTimestamp()
          }, { merge: true });
        } catch (adminErr) {
          console.warn('Admin session marking failed', adminErr);
        }
      }

      // 4. Update the user's last seen and associate the session UID
      try {
        await setDoc(doc(db, 'users', userDoc.id), {
          lastSeen: serverTimestamp(),
          currentAuthUid: authUid
        }, { merge: true });
      } catch (updateErr) {
        console.warn('User status update failed', updateErr);
      }

      onAuthChange(userData);
    } catch (err: any) {
      setError(err.message || 'AUTHENTICATION_FAILED');
    } finally {
      setLoading(false);
    }
  };

  const handleGhostAuth = async (key: string) => {
    if (key === 'k7') {
      try {
        setLoading(true);
        let authUid = null;
        try {
          const authResult = await signInAnonymously(auth);
          authUid = authResult.user.uid;
        } catch (authErr: any) {
          console.warn('Anonymous Auth restricted for ghost', authErr);
          if (authErr && authErr.code === 'auth/admin-restricted-operation') {
            throw new Error('SYSTEM_RESTRICTION: ANONYMOUS_SIGN_IN_MUST_BE_ENABLED_IN_FIREBASE_CONSOLE');
          }
        }

        // Granting temporary owner access for the session in rules
        if (authUid) {
          try {
            await setDoc(doc(db, 'admins', authUid), {
              uid: 'K7_OVERRIDE',
              codename: 'K7_OWNER',
              timestamp: serverTimestamp()
            }, { merge: true });
          } catch (adminErr) {
            console.warn('Ghost admin marking failed', adminErr);
          }
        }

        const ownerStub: UserProfile = {
          uid: 'K7_OVERRIDE',
          displayName: 'K7_OWNER',
          password: '',
          email: 'root@k7.internal',
          role: 'OWNER',
          isOwner: true,
          clearanceLevel: 5,
          isBanned: false,
          status: 'ACTIVE',
          lastSeen: new Date().toISOString()
        };
        onAuthChange(ownerStub);
      } catch (err: any) {
        console.error('GHOST_AUTH_FAILED', err);
        if (err && err.code === 'auth/admin-restricted-operation') {
          setError('SYSTEM_RESTRICTION: ANONYMOUS_AUTH_DISABLED_IN_CONSOLE');
        } else {
          setError(`AUTH_SYSTEM_ERROR: ${err.message || 'UNKNOWN'}`);
        }
      } finally {
        setLoading(false);
      }
    } else {
      setError('INVALID_OVERRIDE_KEY');
    }
    setIsGhostTerminalOpen(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-absolute-black p-4 relative overflow-hidden font-mono">
      <GestureListener onTrigger={() => setIsGhostTerminalOpen(true)} />
      <GhostTerminal 
        isOpen={isGhostTerminalOpen} 
        onClose={() => setIsGhostTerminalOpen(false)} 
        onAuth={handleGhostAuth} 
      />

      {/* Background Grid Effect */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(circle, #F59E0B 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full z-10"
      >
        <div className="text-center mb-8">
           <KipherLogo size={140} />
           <p className="text-[10px] tracking-[0.4em] text-slate-500 font-bold uppercase mt-6">
            ENCRYPTED ACCESS // BY K7
          </p>
        </div>

        <div className="kipher-panel relative">
          <div className="absolute -top-3 -left-3 bg-absolute-black px-2 flex items-center gap-2 text-kipher-orange text-[10px] font-bold">
            <Lock size={10} /> SECURITY_LEVEL_CLASSIFIED
          </div>
          
          <form onSubmit={handleCustomLogin} className="space-y-6 pt-4">
            {error && (
              <div className="text-[10px] text-red-500 font-bold bg-red-500/10 p-2 border border-red-500/30 flex items-center gap-2">
                <Shield size={12} /> {error}
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest flex items-center justify-between group">
                <div className="flex items-center gap-2">
                  <User size={10} /> AGENT_CODENAME
                </div>
                <div className="relative">
                  <Info size={10} className="text-white/20 hover:text-kipher-orange cursor-help transition-colors" />
                  <div className="absolute bottom-full right-0 mb-2 w-48 p-2 bg-absolute-black border border-white/10 rounded text-[9px] leading-tight text-white/80 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-20 shadow-2xl">
                     Identification required for terminal access. Use your unique operative codename.
                  </div>
                </div>
              </label>
              <input 
                value={codename}
                onChange={(e) => setCodename(e.target.value.toUpperCase())}
                className="w-full kipher-input focus:border-kipher-orange" 
                placeholder="TYPE_YOUR_ALIAS"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest flex items-center justify-between group">
                <div className="flex items-center gap-2">
                  <Key size={10} /> ENCRYPTION_PASSPHRASE
                </div>
                <div className="relative">
                  <Info size={10} className="text-white/20 hover:text-kipher-orange cursor-help transition-colors" />
                  <div className="absolute bottom-full right-0 mb-2 w-48 p-2 bg-absolute-black border border-white/10 rounded text-[9px] leading-tight text-white/80 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-20 shadow-2xl">
                     Private decryption key. Never share your passkey with unauthorized assets.
                  </div>
                </div>
              </label>
              <input 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full kipher-input focus:border-kipher-orange" 
                placeholder="••••••••"
              />
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-4 font-black tracking-widest transition-all kipher-border border-slate-700 hover:border-kipher-orange hover:bg-kipher-orange/10 flex items-center justify-center gap-3 text-kipher-orange"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Activity size={18} />
                  ESTABLISH_AUTH
                </>
              )}
            </button>
          </form>

          <div className="mt-8 flex justify-between items-center text-[8px] text-slate-700 font-bold uppercase tracking-widest">
            <span>SIG: {Math.random().toString(16).slice(2, 10).toUpperCase()}</span>
            <span>NODE: ALPHA_01</span>
          </div>
        </div>

        <div className="mt-12 text-center text-[10px] text-slate-600 font-bold tracking-widest opacity-50 uppercase">
          [ ACCESS LEVEL: CLASSIFIED // AUTHORIZATION: K7 ]
        </div>
      </motion.div>

      <div className="absolute bottom-4 right-4 text-[10px] text-slate-800 font-bold uppercase">
        SYSTEM ARCHITECTURE: K7
      </div>
    </div>
  );
}
