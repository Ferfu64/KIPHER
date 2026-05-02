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
import { Terminal, Users, Home, Archive, ShieldAlert, LogOut, Radio, Activity, Zap, User, ShieldCheck, Lock, Info, Box, Settings, Volume2, VolumeX, MessageCircle, X } from 'lucide-react';
import { audioService } from './services/audioService';

import DirectMessageContainer from './components/DirectMessageContainer';
import KipherLogo from './components/KipherLogo';
import NotificationOverlay from './components/NotificationOverlay';
import CortexCutscene from './components/CortexCutscene';
import { titleService } from './services/titleService';

type NavigationPage = 'GHOST' | 'OWNER' | 'GATEWAY' | 'MEETING' | 'COMM' | 'MISC';

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
  const [isCutsceneActive, setIsCutsceneActive] = useState(false);
  const [forcedCutscene, setForcedCutscene] = useState<string | null>(null);
  const [isTitleMenuOpen, setIsTitleMenuOpen] = useState(false);
  const [clickCount, setClickCount] = useState(0);

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

  const handleTitleMenuGesture = () => {
    setClickCount(prev => {
      const next = prev + 1;
      if (next >= 5) {
        setIsTitleMenuOpen(true);
        audioService.playSuccess();
        return 0;
      }
      return next;
    });
    // Reset click count after 3s of inactivity
    setTimeout(() => setClickCount(0), 3000);
  };

  useEffect(() => {
    const handleSpawn = (e: any) => {
      setForcedCutscene(e.detail);
      setIsCutsceneActive(true);
      audioService.playSuccess();
    };
    window.addEventListener('kipher:spawnCutscene', handleSpawn);

    const handleRespawn = () => {
      setIsCutsceneActive(false);
      setForcedCutscene(null);
      setIsTitleMenuOpen(false);
    };
    window.addEventListener('kipher:respawn', handleRespawn);

    return () => {
      window.removeEventListener('kipher:spawnCutscene', handleSpawn);
      window.removeEventListener('kipher:respawn', handleRespawn);
    };
  }, []);

  const handleCutsceneComplete = async (rarity: string) => {
    setIsCutsceneActive(false);
    const wasForced = !!forcedCutscene;
    setForcedCutscene(null);
    if (!user || wasForced) return;

    // Award titles based on rarity/type (Only for natural rolls)
    if (rarity.includes('ANONYMOUS_DEITY')) {
       await titleService.awardTitle(user.uid, 'ANONYMOUS_DEITY');
    } else if (rarity.includes('SUPREME_SOVEREIGN')) {
       await titleService.awardTitle(user.uid, 'SUPREME_SOVEREIGN');
    } else if (rarity.includes('ANGELIC_SYMPHONY')) {
       await titleService.awardTitle(user.uid, 'ANGELIC_SYMPHONY');
    } else if (rarity.includes('ETERNAL_OPPRESSION')) {
       await titleService.awardTitle(user.uid, 'ETERNAL_OPPRESSION');
    } else if (rarity.includes('SINGULARITY')) {
      await titleService.awardTitle(user.uid, 'THE_OMEGA_POINT');
    } else if (rarity.includes('EPIC')) {
      await titleService.awardTitle(user.uid, 'NETWORK_ANOMALY');
    } else if (rarity.includes('RARE')) {
       await titleService.awardTitle(user.uid, 'ELITE_ASSET');
    }
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
          if (auth.currentUser && (profile.isOwner || profile.role === 'SUPERUSER' || profile.displayName === 'K7_OWNER')) {
            try {
              await setDoc(doc(db, 'admins', auth.currentUser.uid), {
                uid: profile.uid,
                codename: profile.displayName,
                timestamp: serverTimestamp(),
                isGhost: profile.displayName === 'K7_OWNER'
              }, { merge: true });

              // Bootstrap ghost identity in the users table so it appears in CommandCenter
              if (profile.displayName === 'K7_OWNER' || profile.displayName === 'K7_OVERRIDE') {
                await setDoc(doc(db, 'users', profile.uid), {
                   ...profile,
                   lastSeen: serverTimestamp(),
                   isOnline: true
                }, { merge: true });
              }

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
      try {
        // Safer stringify for session data
        localStorage.setItem('kipher_session', JSON.stringify(userData));
      } catch (e) {
        console.error('SESSION_STORAGE_FAILURE', e);
      }
    } else {
      localStorage.removeItem('kipher_session');
      signOut(auth);
    }
  };

  if (loading || !isAuthReady || (user && (user.isOwner || user.role === 'SUPERUSER' || user.displayName === 'K7_OWNER') && !isAdminSynced)) {
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
      <NotificationOverlay currentUser={user} onNavigate={(page) => navigateTo(page as NavigationPage)} />
      
      <AnimatePresence>
        {isCutsceneActive && (
          <CortexCutscene onComplete={handleCutsceneComplete} forcedType={forcedCutscene || undefined} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isTitleMenuOpen && user && (
          <TitleManagerUI 
            user={user} 
            onClose={() => setIsTitleMenuOpen(false)} 
            onUpdate={(updated) => setUser(updated)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar Navigation */}
      <nav className="w-20 border-r border-slate-800 flex flex-col items-center py-6 gap-8 bg-slate-950 px-2 shrink-0 relative z-50 overflow-y-auto custom-scrollbar">
        <KipherLogo 
          size={40} 
          showText={false} 
          className="mb-4 cursor-pointer hover:rotate-90 transition-transform duration-500" 
          onClick={(e) => {
             if (e.detail >= 5 || clickCount >= 4) {
               handleTitleMenuGesture();
             } else if (!isCutsceneActive) {
               setIsCutsceneActive(true);
             }
          }}
        />
        
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
            active={activePage === 'COMM'} 
            onClick={() => navigateTo('COMM')} 
            icon={<MessageCircle size={20} />} 
            label="COMM"
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
              <div className="text-xs text-tactical-cyan font-black uppercase flex flex-col items-end">
                {user.activeTitle && (
                  <span className="text-[7px] text-tactical-cyan/60 mb-0.5 tracking-[0.3em]">« {user.activeTitle} »</span>
                )}
                <span>{user.displayName}</span>
              </div>
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
              {activePage === 'COMM' && <DirectMessageContainer currentUser={user} />}
              {activePage === 'MISC' && <MiscSystems currentUser={user} onOpenTitles={() => setIsTitleMenuOpen(true)} />}
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

function TitleManagerUI({ user, onClose, onUpdate }: { user: UserProfile, onClose: () => void, onUpdate: (u: UserProfile) => void }) {
  const [titles, setTitles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const list = await titleService.getAvailableTitles(user.uid);
      
      // Auto-award special titles if missing
      const specialTitles: string[] = [];
      if (user.displayName === 'K7_OWNER' && !list.includes('KIPHER_FOUNDER')) {
        specialTitles.push('KIPHER_FOUNDER');
      }
      if (user.isOwner && !list.includes('SYSTEM_ARCHITECT')) {
        specialTitles.push('SYSTEM_ARCHITECT');
      }
      
      if (specialTitles.length > 0) {
        for (const t of specialTitles) {
          await titleService.awardTitle(user.uid, t);
          list.push(t);
        }
      }

      setTitles(list);
      setLoading(false);
    };
    fetch();
  }, [user]);

  const selectTitle = async (t: string | null) => {
    await titleService.setActiveTitle(user.uid, t);
    onUpdate({ ...user, activeTitle: t || undefined });
    audioService.playBlip();
    onClose();
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[70000] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4"
    >
      <div className="max-w-md w-full kipher-panel bg-slate-950 border-tactical-cyan/20">
        <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
          <div className="flex items-center gap-2">
            <Zap className="text-tactical-cyan" size={16} />
            <h2 className="text-xs font-black text-white tracking-[0.5em] uppercase">TITLE_MANAGEMENT</h2>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {loading ? (
          <div className="h-40 flex items-center justify-center text-tactical-cyan animate-pulse text-[10px] font-black italic">
            QUERYING_USER_METADATA...
          </div>
        ) : (
          <div className="space-y-4">
             <div className="text-[8px] text-slate-500 font-bold uppercase italic mb-2">Available_Honors</div>
             <div className="grid grid-cols-1 gap-2 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                <button 
                  onClick={() => selectTitle(null)}
                  className={`w-full p-4 border text-left transition-all ${!user.activeTitle ? 'border-tactical-cyan bg-tactical-cyan/10 text-tactical-cyan' : 'border-white/5 text-white/40 hover:border-white/20'}`}
                >
                  <div className="text-[10px] font-black uppercase tracking-widest">[ NONE ]</div>
                </button>
                {titles.map(t => (
                  <button 
                    key={t}
                    onClick={() => selectTitle(t)}
                    className={`w-full p-4 border text-left transition-all ${user.activeTitle === t ? 'border-tactical-cyan bg-tactical-cyan/10 text-tactical-cyan shadow-[inset_0_0_20px_rgba(4,217,217,0.1)]' : 'border-white/5 text-white hover:border-tactical-cyan/40'}`}
                  >
                    <div className="text-[12px] font-black uppercase tracking-[0.2em] mb-1">« {t} »</div>
                    <div className="text-[7px] opacity-50 uppercase font-bold italic">AUTHENTICATED_ACHIEVEMENT</div>
                  </button>
                ))}
             </div>
             {titles.length === 0 && (
               <div className="text-center py-8 text-white/20 text-[9px] italic border border-dashed border-white/5 uppercase">
                 No honors detected. Land rare cutscenes or receive recognition from KIPHER root.
               </div>
             )}
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-white/5 text-center">
           <p className="text-[8px] text-white/30 uppercase tracking-[0.3em]">Credentials verified by KIPHER Core</p>
        </div>
      </div>
    </motion.div>
  );
}
