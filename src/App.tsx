import React, { useState, useEffect } from 'react';
import { auth, db } from './lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, onSnapshot, collection, query, where, limit, orderBy, setDoc, serverTimestamp } from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';
import { UserProfile, SystemCommand } from './types';
import { handleFirestoreError, OperationType } from './lib/utils';
import KipherGateway from './components/KipherGateway';
import GhostTerminal from './components/GhostTerminal';
import OwnerIntelligence from './components/OwnerIntelligence';
import NodeGateway from './components/NodeGateway';
import MeetingHub from './components/MeetingHub';
import MiscSystems from './components/MiscSystems';
import TacticalProtocolHandler from './components/TacticalProtocolHandler';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Users, Home, Archive, ShieldAlert, LogOut, Radio, Activity, Zap, User, ShieldCheck, Lock, Info, Box, Settings, Volume2, VolumeX } from 'lucide-react';
import { audioService } from './services/audioService';

type NavigationPage = 'GHOST' | 'OWNER' | 'GATEWAY' | 'MEETING' | 'MISC';

import KipherLogo from './components/KipherLogo';

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isAdminSynced, setIsAdminSynced] = useState(false);
  const [systemAlert, setSystemAlert] = useState<string | null>(null);
  const [mediaInject, setMediaInject] = useState<string | null>(null);
  const [activePage, setActivePage] = useState<NavigationPage>('GATEWAY');
  const [isMuted, setIsMuted] = useState(true);
  const [audioInitialized, setAudioInitialized] = useState(false);

  useEffect(() => {
    // Stop ambient drone on unmount
    return () => {
      audioService.stopAmbient();
    };
  }, []);

  const toggleAudio = () => {
    if (!audioInitialized) {
      audioService.init();
      audioService.startAmbient();
      setAudioInitialized(true);
    }
    const newMute = audioService.toggleMute();
    setIsMuted(newMute);
    if (!newMute) audioService.playBlip();
  };

  const navigateTo = (page: NavigationPage) => {
    setActivePage(page);
    if (audioInitialized) audioService.playBlip();
  };
  
  // Set default page based on role once user is loaded
  useEffect(() => {
    if (user && activePage === 'GATEWAY') {
      if (user.displayName === 'K7_OWNER') setActivePage('GHOST');
      else if (user.isOwner) setActivePage('OWNER');
    }
  }, [user]);

  useEffect(() => {
    const initAuth = async () => {
      const savedUser = localStorage.getItem('kipher_session');
      
      // 1. Establish Firebase Auth session
      if (!auth.currentUser) {
        try {
          await signInAnonymously(auth);
        } catch (authErr: any) {
          console.warn('Initial anonymous auth failed', authErr);
        }
      }

      // 2. Hydrate user from storage
      if (savedUser) {
        try {
          const profile = JSON.parse(savedUser) as UserProfile;
          setUser(profile);

          // 3. Re-sync admin privilege document if needed
          if (auth.currentUser && (profile.isOwner || profile.role === 'SUPERUSER')) {
            try {
              await setDoc(doc(db, 'admins', auth.currentUser.uid), {
                uid: profile.uid,
                codename: profile.displayName,
                timestamp: serverTimestamp()
              }, { merge: true });
              setIsAdminSynced(true);
            } catch (err) {
              console.warn('Admin sync failed, logic will fallback to cache', err);
              setIsAdminSynced(true); 
            }
          } else {
            setIsAdminSynced(true);
          }
        } catch (e) {
          localStorage.removeItem('kipher_session');
          setIsAdminSynced(true);
        }
      } else {
        setIsAdminSynced(true);
      }
      setLoading(false);
    };

    initAuth();

    // Listen for auth state changes to trigger listeners
    let alertUnsub: (() => void) | null = null;
    let mediaUnsub: (() => void) | null = null;

    const authUnsub = onAuthStateChanged(auth, (firebaseUser) => {
      setIsAuthReady(true);
      
      // Removed redundant tactical listeners - moved to TacticalProtocolHandler
    });

    return () => {
      authUnsub();
      if (alertUnsub) alertUnsub();
      if (mediaUnsub) mediaUnsub();
    };
  }, []);

  const handleAuthChange = (userData: UserProfile | null) => {
    setUser(userData);
    if (userData) {
      localStorage.setItem('kipher_session', JSON.stringify(userData));
    } else {
      localStorage.removeItem('kipher_session');
      signOut(auth);
    }
  };

  if (loading || !isAuthReady || (user && (user.isOwner || user.role === 'SUPERUSER') && !isAdminSynced)) {
    return (
      <div className="h-screen bg-absolute-black flex items-center justify-center font-mono p-4">
        <div className="text-tactical-cyan animate-pulse tracking-[0.5em] text-xs font-black uppercase text-center flex flex-col items-center">
          <KipherLogo size={80} showText={false} className="mb-4" />
          INIT_SYSTEM_ARCHITECTURE...<br/>
          <span className="text-[10px] opacity-50 mt-2 block flex flex-col gap-1">
            <span>Loading KIPHER Core // BY K7</span>
            <span className="animate-bounce">. . .</span>
          </span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <KipherGateway onAuthChange={handleAuthChange} />;
  }

  const isGhost = user.displayName === 'K7_OWNER';

  return (
    <div className="h-screen bg-absolute-black text-slate-300 font-mono text-sm flex border-4 border-slate-900 overflow-hidden select-none">
      <TacticalProtocolHandler currentUser={user} />
      {/* Sidebar Navigation */}
      <nav className="w-20 border-r border-slate-800 flex flex-col items-center py-6 gap-8 bg-slate-950 px-2 shrink-0 relative z-50 overflow-y-auto custom-scrollbar">
        <KipherLogo size={40} showText={false} className="mb-4 cursor-pointer hover:rotate-90 transition-transform duration-500" />
        
        <div className="flex-1 flex flex-col gap-6 w-full">
          {isGhost && (
            <NavIcon 
              active={activePage === 'GHOST'} 
              onClick={() => navigateTo('GHOST')} 
              icon={<ShieldAlert size={20} />} 
              label="ROOT"
              color="text-red-500"
            />
          )}

          {user.isOwner && (
            <NavIcon 
              active={activePage === 'OWNER'} 
              onClick={() => navigateTo('OWNER')} 
              icon={<ShieldCheck size={20} />} 
              label="INTEL"
              color="text-tactical-cyan"
            />
          )}

          <NavIcon 
            active={activePage === 'GATEWAY'} 
            onClick={() => navigateTo('GATEWAY')} 
            icon={<Box size={20} />} 
            label="NODES"
          />

          <NavIcon 
            active={activePage === 'MEETING'} 
            onClick={() => navigateTo('MEETING')} 
            icon={<Users size={20} />} 
            label="HUB"
          />

          <NavIcon 
            active={activePage === 'MISC'} 
            onClick={() => navigateTo('MISC')} 
            icon={<Settings size={20} />} 
            label="SYST"
          />
        </div>

        <button 
          onClick={() => { handleAuthChange(null); audioService.playError(); }} 
          className="p-3 border border-slate-800 text-slate-600 hover:text-red-500 hover:border-red-500 transition-all group shrink-0"
        >
          <LogOut size={20} className="group-hover:rotate-12 transition-transform" />
        </button>
      </nav>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-14 border-b border-slate-800 flex items-center justify-between px-8 bg-slate-950/50 relative shrink-0">
          <div className="flex items-center gap-4">
             <div className="text-[10px] font-black tracking-widest text-slate-600 uppercase">System_Active // Protocol_{activePage}</div>
             <div className="h-1 w-1 rounded-full bg-tactical-cyan animate-ping"></div>
          </div>
          
          <div className="flex items-center gap-6">
            <button 
              onClick={toggleAudio}
              className={`flex items-center gap-2 p-2 border transition-all ${!isMuted ? 'text-tactical-cyan border-tactical-cyan/40 bg-tactical-cyan/5' : 'text-slate-700 border-slate-800'}`}
            >
              {!isMuted ? <Volume2 size={16} /> : <VolumeX size={16} />}
              <span className="text-[9px] font-black tracking-tighter uppercase">{!isMuted ? 'AUDIO_LIVE' : 'AUDIO_DARK'}</span>
            </button>
            <div className="text-right">
              <div className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em]">{user.role} // LVL_{user.clearanceLevel}</div>
              <div className="text-xs text-tactical-cyan font-black uppercase">{user.displayName}</div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto custom-scrollbar relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={activePage}
              initial={{ opacity: 0, scale: 0.99, filter: 'blur(5px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, scale: 1.01, filter: 'blur(5px)' }}
              transition={{ duration: 0.2 }}
              className="min-h-full flex flex-col"
            >
              {activePage === 'GHOST' && <GhostTerminal currentUser={user} />}
              {activePage === 'OWNER' && <OwnerIntelligence currentUser={user} />}
              {activePage === 'GATEWAY' && <NodeGateway currentUser={user} />}
              {activePage === 'MEETING' && <MeetingHub currentUser={user} />}
              {activePage === 'MISC' && <MiscSystems currentUser={user} />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

        {/* TacticalProtocolHandler handles all alerts and media now */}
    </div>
  );
}

function NavIcon({ active, onClick, icon, label, color = "text-slate-500" }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string, color?: string }) {
  return (
    <button 
      onClick={onClick}
      className={`group relative flex flex-col items-center gap-1 p-3 transition-all ${active ? 'bg-white/5 border border-white/10 text-white shadow-inner' : 'hover:scale-110'}`}
    >
      <div className={`${active ? 'text-tactical-cyan' : color} transition-colors group-hover:text-white`}>
        {icon}
      </div>
      <span className={`text-[8px] font-black tracking-widest ${active ? 'text-white' : 'text-slate-700'}`}>{label}</span>
      {active && <div className="absolute left-0 top-1/4 bottom-1/4 w-0.5 bg-tactical-cyan"></div>}
    </button>
  );
}
