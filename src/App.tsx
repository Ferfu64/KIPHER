import React, { useState, useEffect, useRef } from 'react';
import { auth, db } from './lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, onSnapshot, collection, query, where, limit, orderBy, setDoc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';
import { UserProfile, SystemCommand } from './types';
import { handleFirestoreError, OperationType, ensureDate } from './lib/utils';
import KipherGateway from './components/KipherGateway';
import GhostTerminal from './components/GhostTerminal';
import OwnerIntelligence from './components/OwnerIntelligence';
import NodeGateway from './components/NodeGateway';
import MeetingHub from './components/MeetingHub';
import MiscSystems from './components/MiscSystems';
import SecretSpace from './components/SecretSpace';
import TacticalProtocolHandler from './components/TacticalProtocolHandler';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Users, Home, Archive, ShieldAlert, LogOut, Radio, Activity, Zap, User, ShieldCheck, Lock, Info, Box, Settings, Volume2, VolumeX, MessageCircle, X, Gift, Camera } from 'lucide-react';
import { audioService } from './services/audioService';

import DirectMessageContainer from './components/DirectMessageContainer';
import KipherLogo from './components/KipherLogo';
import NotificationOverlay from './components/NotificationOverlay';
import CortexCutscene from './components/CortexCutscene';
import CasinoHub from './components/CasinoHub';
import { titleService } from './services/titleService';
import { requestNotificationPermission, sendNetworkNotification } from './lib/notifications';
import DailyReward from './components/DailyReward';
import GhostInTheMachine from './components/GhostInTheMachine';
import VoiceProtocolHandler from './components/VoiceProtocolHandler';

type NavigationPage = 'GHOST' | 'OWNER' | 'GATEWAY' | 'MEETING' | 'COMM' | 'MISC' | 'SECRET_SPACE';

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isAdminSynced, setIsAdminSynced] = useState(false);
  const [systemAlert, setSystemAlert] = useState<string | null>(null);
  const [mediaInject, setMediaInject] = useState<string | null>(null);
  const [activePage, setActivePage] = useState<NavigationPage>('GATEWAY');
  const [isCasinoOpen, setIsCasinoOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [audioInitialized, setAudioInitialized] = useState(false);
  const [isCutsceneActive, setIsCutsceneActive] = useState(false);
  const [rollId, setRollId] = useState(0);
  const [totalRolls, setTotalRolls] = useState(0);
  const [pity911, setPity911] = useState(0);
  const [pity500, setPity500] = useState(0);
  const [forcedCutscene, setForcedCutscene] = useState<string | null>(null);
  const [isTitleMenuOpen, setIsTitleMenuOpen] = useState(false);
  const [isImmersive, setIsImmersive] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [luckMultiplier, setLuckMultiplier] = useState(1);
  const [creditMultiplier, setCreditMultiplier] = useState(1);
  const [rollSpeedMultiplier, setRollSpeedMultiplier] = useState(1);
  const [isRainbowMode, setIsRainbowMode] = useState(false);
  const [showDailyReward, setShowDailyReward] = useState(false);
  const [activeEvents, setActiveEvents] = useState<{type: string, multiplier: number}[]>([]);
  const lastRewardPromptRef = useRef<number>(0);

  useEffect(() => {
    if (!user) return;
    
    const checkReward = () => {
      if (showDailyReward) return;
      
      // Prevent re-showing within 5 minutes of dismissing if the state hasn't synced
      if (Date.now() - lastRewardPromptRef.current < 300000) return;

      if (!user.lastRewardTime) {
        setShowDailyReward(true);
        return;
      }
      
      const lastReward = ensureDate(user.lastRewardTime).getTime();
      const now = Date.now();
      const twentyFourHours = 24 * 60 * 60 * 1000;
      
      if (now - lastReward >= twentyFourHours) {
        setShowDailyReward(true);
      }
    };
    
    checkReward();
    const interval = setInterval(checkReward, 60000);
    return () => clearInterval(interval);
  }, [user, showDailyReward]);

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
      setActivePage('GATEWAY'); // Reset to default page on respawn
      audioService.playSuccess();
    };
    window.addEventListener('kipher:respawn', handleRespawn);

    const handleUserUpdate = (e: any) => {
      setUser(e.detail);
    };
    window.addEventListener('kipher:userUpdate', handleUserUpdate);

    return () => {
      window.removeEventListener('kipher:spawnCutscene', handleSpawn);
      window.removeEventListener('kipher:respawn', handleRespawn);
      window.removeEventListener('kipher:userUpdate', handleUserUpdate);
    };
  }, []);

  const handleCutsceneComplete = async (rarity: string) => {
    setIsCutsceneActive(false);
    const wasForced = !!forcedCutscene;
    setForcedCutscene(null);
    if (!user || wasForced) return;

    let creditsEarned = 0;
    let reset911 = false;
    let reset500 = false;

    // Award titles and credits based on rarity/type (Only for natural rolls)
    if (rarity.includes('ARCHANGEL')) {
       await titleService.awardTitle(user.uid, 'DIVINE_MESSENGER');
       creditsEarned = 100000;
       reset911 = true;
    } else if (rarity.includes('ANONYMOUS_DEITY')) {
       await titleService.awardTitle(user.uid, 'ANONYMOUS_DEITY');
       creditsEarned = 10000;
       reset911 = true;
    } else if (rarity.includes('RUNIA') || rarity.includes('750,000,000,000')) {
       await titleService.awardTitle(user.uid, 'THE_HEAVENLY_JUDGE');
       creditsEarned = 25000;
       reset911 = true;
    } else if (rarity.includes('PIXELIZATION') || rarity.includes('450,000,000,000')) {
       await titleService.awardTitle(user.uid, 'DIGITAL_OBLIVION');
       creditsEarned = 20000;
       reset911 = true;
    } else if (rarity.includes('ABYSSAL_HUNTER') || rarity.includes('400,000,000,000')) {
       await titleService.awardTitle(user.uid, 'THE_DEEP_STALKER');
       creditsEarned = 15000;
       reset911 = true;
    } else if (rarity.includes('SUPREME_SOVEREIGN')) {
       await titleService.awardTitle(user.uid, 'SUPREME_SOVEREIGN');
       creditsEarned = 5000;
       reset911 = true;
    } else if (rarity.includes('ANGELIC_SYMPHONY')) {
       await titleService.awardTitle(user.uid, 'ANGELIC_SYMPHONY');
       creditsEarned = 2500;
       reset911 = true;
    } else if (rarity.includes('ETERNAL_OPPRESSION')) {
       await titleService.awardTitle(user.uid, 'ETERNAL_OPPRESSION');
       creditsEarned = 1000;
       reset911 = true;
    } else if (rarity.includes('SINGULARITY')) {
       await titleService.awardTitle(user.uid, 'THE_OMEGA_POINT');
       creditsEarned = 500;
       reset911 = true;
    } else if (rarity.includes('1 in 911') || rarity.includes('STRUCTURAL_COLLAPSE')) {
       await titleService.awardTitle(user.uid, 'SYSTEM_LEAK');
       creditsEarned = 500;
       reset911 = true;
    } else if (rarity.includes('LEGENDARY')) {
       creditsEarned = 500;
       reset911 = true;
    } else if (rarity.includes('EPIC')) {
       creditsEarned = 100;
       reset500 = true;
    } else if (rarity.includes('RARE')) {
       creditsEarned = 25;
    } else if (rarity.includes('1 IN 2')) {
       creditsEarned = -5;
    } else if (rarity.includes('1 IN 20')) {
       creditsEarned = -1;
    }

    // Pity Reset Checks
    if (rarity.includes('PITY_REACHED')) {
      if (rarity.includes('LEGENDARY')) reset911 = true;
      if (rarity.includes('EPIC')) reset500 = true;
    }

    const nextPity911 = reset911 ? 0 : pity911;
    const nextPity500 = reset500 ? 0 : (reset911 ? 0 : pity500); // 911 roll also resets 500 pity for balance

    const finalCreditsEarned = creditsEarned > 0 ? Math.floor(creditsEarned * creditMultiplier) : creditsEarned;
    const newCredits = Math.max(0, (user.credits || 0) + finalCreditsEarned);
    const updatedUser = { 
      ...user, 
      credits: newCredits,
      totalRolls: totalRolls,
      pityCount911: nextPity911,
      pityCount500: nextPity500
    };
    
    setUser(updatedUser);
    setPity911(nextPity911);
    setPity500(nextPity500);
    localStorage.setItem('kipher_session', JSON.stringify(updatedUser));

    if (finalCreditsEarned > 0) {
      audioService.playSuccess();
      window.dispatchEvent(new CustomEvent('kipher:creditsAwarded', { detail: finalCreditsEarned }));
    } else if (finalCreditsEarned < 0) {
      audioService.playError();
    }

    if (rarity.includes('Architect')) {
      await titleService.awardTitle(user.uid, 'THE_ARCHITECT');
    }

    try {
      await setDoc(doc(db, 'users', user.uid), { 
        credits: newCredits,
        totalRolls: totalRolls,
        pityCount911: nextPity911,
        pityCount500: nextPity500
      }, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}`);
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
          requestNotificationPermission();
        } catch (authErr: any) {
          console.warn('Initial anonymous auth failed', authErr);
        }
      }

      // 2. Hydrate user from storage OR Firestore
      if (savedUser) {
        try {
          const profile = JSON.parse(savedUser) as UserProfile;
          setUser(profile);
          setTotalRolls(profile.totalRolls || 0);
          setPity911(profile.pityCount911 || 0);
          setPity500(profile.pityCount500 || 0);

          // Check reward interval
          if (profile.lastRewardTime) {
            const lastReward = new Date(profile.lastRewardTime).getTime();
            const now = Date.now();
            if (now - lastReward > 10 * 60 * 60 * 1000) {
              setShowDailyReward(true);
            }
          } else {
            setShowDailyReward(true);
          }

          // If we have an auth user, re-sync from Firestore to get latest credits/inventory
          if (auth.currentUser) {
            const docRef = doc(db, 'users', profile.uid);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
              const latestData = docSnap.data() as UserProfile;
              const merged = { ...profile, ...latestData };
              setUser(merged);
              setTotalRolls(latestData.totalRolls || 0);
              setPity911(latestData.pityCount911 || 0);
              setPity500(latestData.pityCount500 || 0);
              localStorage.setItem('kipher_session', JSON.stringify(merged));
              
              if (latestData.lastRewardTime) {
                const lr = latestData.lastRewardTime.toDate ? latestData.lastRewardTime.toDate().getTime() : new Date(latestData.lastRewardTime).getTime();
                if (Date.now() - lr > 10 * 60 * 60 * 1000) {
                  setShowDailyReward(true);
                }
              }
            }
          }

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
    requestNotificationPermission();

    // Listen for auth state changes to trigger listeners
    let alertUnsub: (() => void) | null = null;
    let mediaUnsub: (() => void) | null = null;
    let eventUnsub: (() => void) | null = null;

    const authUnsub = onAuthStateChanged(auth, (firebaseUser) => {
      setIsAuthReady(true);
      
      if (firebaseUser) {
        // Listen for global system events
        const eventQuery = query(collection(db, 'system_events'), where('active', '==', true));
        eventUnsub = onSnapshot(eventQuery, (snap) => {
          let rainbow = false;
          let luck = 1;
          let credits = 1;
          let speedMul = 1;
          const events: {type: string, multiplier: number}[] = [];
          
          snap.forEach(d => {
            const ev = d.data();
            if (ev.type === 'RAINBOW_MODE') {
              rainbow = true;
              events.push({ type: 'RAINBOW_MODE', multiplier: 1 });
            }
            if (ev.type === 'LUCK_BOOST') {
              luck = ev.multiplier || 2;
              events.push({ type: 'LUCK_BOOST', multiplier: luck });
            }
            if (ev.type === 'CREDIT_BOOST') {
              credits = ev.multiplier || 2;
              events.push({ type: 'CREDIT_BOOST', multiplier: credits });
            }
            if (ev.type === 'X3_CREDITS_BLITZ') {
              credits = 3;
              events.push({ type: 'X3_CREDITS_BLITZ', multiplier: 3 });
            }
            if (ev.type === 'HACKER_LUCK_OVERLOAD') {
              luck = 5;
              events.push({ type: 'HACKER_LUCK_OVERLOAD', multiplier: 5 });
            }
            if (ev.type === 'SYSTEM_OVERCLOCK') {
              luck = 2;
              speedMul = 2;
              events.push({ type: 'SYSTEM_OVERCLOCK', multiplier: 2 });
            }
            if (ev.type === 'ROLL_SPEED_BOOST') {
              speedMul = ev.multiplier || 2;
              events.push({ type: 'ROLL_SPEED_BOOST', multiplier: speedMul });
            }
            if (ev.type === 'SYSTEM_MSG' && !localStorage.getItem(`read_event_${d.id}`)) {
               sendNetworkNotification('BROADCAST', ev.message);
               localStorage.setItem(`read_event_${d.id}`, 'true');
            }
          });
          
          setIsRainbowMode(rainbow);
          setLuckMultiplier(luck);
          setCreditMultiplier(credits);
          setRollSpeedMultiplier(speedMul);
          setActiveEvents(events);
        });
      }
    });

    return () => {
      authUnsub();
      if (alertUnsub) alertUnsub();
      if (mediaUnsub) mediaUnsub();
      if (eventUnsub) eventUnsub();
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

  const mouseStyle = user.customization ? {
    cursor: 'none',
    '--mouse-color': user.customization.mouseColor || '#22d3ee',
    '--mouse-size': `${user.customization.mouseSize || 16}px`,
    '--mouse-glow': user.customization.neonGlow ? '0 0 15px var(--mouse-color)' : 'none'
  } as any : {};

  return (
    <div 
      className={`h-screen bg-absolute-black text-slate-300 font-mono text-sm flex border-4 border-slate-900 overflow-hidden select-none relative ${isRainbowMode ? 'rainbow-bg' : ''}`}
      style={mouseStyle}
    >
      {user.customization && (
        <CustomMouse customization={user.customization} />
      )}

      <AnimatePresence>
        {isCasinoOpen && (
          <CasinoHub 
            user={user}
            onClose={() => setIsCasinoOpen(false)}
            onPull={async (luck) => {
               if (isCutsceneActive) return;
               audioService.resume();
               
               // ROLLING IS NOW FREE
               const cost = 0;
               if (user.credits < cost) {
                 audioService.playError();
                 return;
               }

               // Immediately trigger cutscene for better UX
               setIsCutsceneActive(true);
               setRollId(prev => prev + 1);

               const newCredits = Math.max(0, (user.credits || 0) - cost);
               const updated = { ...user, credits: newCredits };
               setUser(updated);
               
               try {
                 await updateDoc(doc(db, 'users', user.uid), { 
                   credits: newCredits 
                 });
               } catch (err) {
                 console.error('Failed to sync credits on pull', err);
               }

               const playerLuckBonus = (user.customization?.luckBonus || 0) + (user.purchasedItems?.includes('luck_chip') ? 0.15 : 0);
               setLuckMultiplier(luck * (1 + playerLuckBonus));
               setTotalRolls(prev => prev + 1);
               setPity911(prev => prev + 1);
               setPity500(prev => prev + 1);
            }}
            rollSpeedMultiplier={rollSpeedMultiplier}
            onUpdateCredits={async (cr) => {
               const newCredits = (user.credits || 0) + cr;
               const updated = { ...user, credits: newCredits };
               setUser(updated);
               localStorage.setItem('kipher_session', JSON.stringify(updated));
               await setDoc(doc(db, 'users', user.uid), { credits: newCredits }, { merge: true });
            }}
            onUnlockCasino={async (id, cost) => {
               if ((user.credits || 0) < cost) return;
               const newCredits = (user.credits || 0) - cost;
               const newUnlocked = [...(user.unlockedCasinos || ['base_station']), id];
               const updated = { ...user, credits: newCredits, unlockedCasinos: newUnlocked };
               setUser(updated);
               localStorage.setItem('kipher_session', JSON.stringify(updated));
               await setDoc(doc(db, 'users', user.uid), { 
                  credits: newCredits, 
                  unlockedCasinos: newUnlocked 
               }, { merge: true });
               audioService.playSuccess();
            }}
          />
        )}
      </AnimatePresence>

      <TacticalProtocolHandler currentUser={user} />
      <AnimatePresence>
        {isRainbowMode && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 pointer-events-none z-[10000] mix-blend-overlay opacity-20"
            style={{
              background: 'linear-gradient(45deg, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #9400d3)',
              backgroundSize: '400% 400%',
              animation: 'rainbow 5s ease infinite'
            }}
          />
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes rainbow {
          0% { background-position: 0% 50% }
          50% { background-position: 100% 50% }
          100% { background-position: 0% 50% }
        }
      `}} />

      <AnimatePresence>
        {showDailyReward && user && (
          <DailyReward 
            user={user} 
            onClaim={() => {
              setShowDailyReward(false);
              lastRewardPromptRef.current = Date.now();
              sendNetworkNotification('REWARD_CLAIMED', 'Intelligence packet successfully integrated.');
            }} 
            onClose={() => {
              setShowDailyReward(false);
              lastRewardPromptRef.current = Date.now();
            }} 
          />
        )}
      </AnimatePresence>

      <NotificationOverlay currentUser={user} onNavigate={(page) => navigateTo(page as NavigationPage)} />
      
      <GhostInTheMachine />
      <VoiceProtocolHandler />
      
      {/* Persistent Event Banner */}
      <AnimatePresence>
        {activeEvents.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-2 left-1/2 -translate-x-1/2 z-[100] flex gap-2"
          >
            {activeEvents.map((ev, idx) => (
              <div 
                key={`${ev.type}-${idx}`}
                className="px-3 py-1 bg-black/80 border border-tactical-cyan/40 text-tactical-cyan text-[9px] font-black uppercase tracking-widest flex items-center gap-2 backdrop-blur-md shadow-[0_0_15px_rgba(34,211,238,0.2)]"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-tactical-cyan animate-pulse" />
                <span>
                  {ev.type === 'LUCK_BOOST' ? `LUCK_X${ev.multiplier}_ACTIVATED` : 
                   ev.type === 'CREDIT_BOOST' ? `CREDITS_X${ev.multiplier}_ACTIVATED` :
                   ev.type === 'ROLL_SPEED_BOOST' ? `SPEED_X${ev.multiplier}_ACTIVATED` :
                   ev.type === 'X3_CREDITS_BLITZ' ? 'X3_CREDITS_BLITZ_ACTIVE' :
                   ev.type === 'HACKER_LUCK_OVERLOAD' ? 'HACKER_LUCK_OVERLOAD_5X' :
                   ev.type === 'SYSTEM_OVERCLOCK' ? 'SYSTEM_OVERCLOCK_SYNCHED' :
                   'SYSTEM_EVENT_ACTIVE'}
                </span>
                {ev.multiplier > 1 && (
                  <Zap size={10} className="text-yellow-500 animate-bounce" />
                )}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        {isCutsceneActive && (
          <CortexCutscene 
            key={`roll-${rollId}`}
            onComplete={handleCutsceneComplete} 
            forcedType={forcedCutscene || undefined} 
            luckMultiplier={luckMultiplier}
            level={user.level || user.promotionCount || 1}
            pityCount911={pity911}
            pityCount500={pity500}
          />
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
      {!isImmersive && (
        <nav className="w-20 border-r border-slate-800 flex flex-col items-center py-6 gap-8 bg-slate-950 px-2 shrink-0 relative z-50 overflow-y-auto custom-scrollbar">
          <KipherLogo 
            size={40} 
            showText={false} 
            className="mb-4 cursor-pointer hover:rotate-90 transition-transform duration-500" 
            onClick={(e) => {
               if (e.detail >= 5 || clickCount >= 4) {
                 handleTitleMenuGesture();
               } else if (!isCutsceneActive) {
                 setIsCasinoOpen(true);
                 audioService.playSuccess();
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
      )}

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        {!isImmersive && (
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
                <div className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em]">{user.role} // LVL_{user.level || 1}</div>
                <div 
                  data-text={user.displayName}
                  className={`text-xs font-black uppercase flex flex-col items-end transition-all ${user.customization?.nameColor === 'rainbow' ? 'rainbow-text' : ''} ${user.customization?.glitchEffect ? 'kipher-glitch' : ''}`} 
                  style={{ color: user.customization?.nameColor === 'rainbow' ? undefined : (user.customization?.nameColor || '#22d3ee') }}
                >
                  {user.activeTitle && (
                    <span className="text-[7px] mb-0.5 tracking-[0.3em] font-black" style={{ color: user.customization?.titleColor || 'rgba(34,211,238,0.6)' }}>« {user.activeTitle} »</span>
                  )}
                  <span>{user.displayName}</span>
                </div>
              </div>
            </div>
          </header>
        )}

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
              {activePage === 'MISC' && <MiscSystems currentUser={user} onOpenSecret={() => navigateTo('SECRET_SPACE')} />}
              {activePage === 'SECRET_SPACE' && (
                <SecretSpace 
                  currentUser={user} 
                  onUpdate={(u) => setUser(u)} 
                  onClose={() => { navigateTo('MISC'); setIsImmersive(false); }} 
                  onImmersiveChange={setIsImmersive}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

        {/* TacticalProtocolHandler handles all alerts and media now */}
    </div>
  );
}

function CustomMouse({ customization }: { customization: NonNullable<UserProfile['customization']> }) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const size = customization.mouseSize || 16;
  const color = customization.mouseColor || '#22d3ee';

  return (
    <motion.div
      className="fixed pointer-events-none z-[9999] flex items-center justify-center"
      animate={{ x: mousePos.x, y: mousePos.y }}
      transition={{ type: 'spring', damping: 25, stiffness: 400, mass: 0.5 }}
      style={{
        width: size,
        height: size,
        left: -size / 2,
        top: -size / 2,
      }}
    >
      {/* Outer Ring */}
      <div 
        className="absolute inset-0 border-2 rounded-full opacity-50"
        style={{ borderColor: color, boxShadow: customization.neonGlow ? `0 0 10px ${color}` : 'none' }}
      />
      {/* Inner Dot */}
      <div 
        className="w-1 h-1 rounded-full"
        style={{ backgroundColor: color }}
      />
      {/* Crosshair lines */}
      <div className="absolute w-[150%] h-[1px] opacity-20" style={{ backgroundColor: color }} />
      <div className="absolute h-[150%] w-[1px] opacity-20" style={{ backgroundColor: color }} />
    </motion.div>
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
                {titles.map((t, idx) => (
                  <button 
                    key={`${t}-${idx}`}
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
