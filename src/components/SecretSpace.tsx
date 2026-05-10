import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  TrendingUp, 
  ShoppingBag, 
  Gamepad2, 
  ArrowLeft, 
  Star, 
  Shield, 
  Zap, 
  Sparkles, 
  User, 
  Badge, 
  Swords, 
  Crosshair, 
  Brain, 
  Cpu, 
  Maximize2, 
  Clock,
  AlertTriangle,
  HelpCircle,
  Target as TargetIcon,
  Terminal
} from 'lucide-react';
import { titleService } from '../services/titleService';
import { audioService } from '../services/audioService';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { doc, setDoc, updateDoc, collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import TankGame from './TankGame';
import MemoryMatch from './MemoryMatch';
import TimeGame from './TimeGame';
import TriviaGame from './TriviaGame';
import BiometricScan from './BiometricScan';
import NeuralCipher from './NeuralCipher';

interface SecretSpaceProps {
  currentUser: UserProfile;
  onUpdate: (user: UserProfile) => void;
  onClose: () => void;
  onImmersiveChange?: (active: boolean) => void;
}

type TabType = 'HONOR' | 'PROMOTIONS' | 'SHOP' | 'GAMES' | 'LEADERBOARD';

export default function SecretSpace({ currentUser, onUpdate, onClose, onImmersiveChange }: SecretSpaceProps) {
  const [activeTab, setActiveTab] = useState<TabType>('HONOR');
  const [isGameActive, setIsGameActive] = useState(false);
  const [titles, setTitles] = useState<string[]>([]);
  const [isPromoting, setIsPromoting] = useState(false);
  const [localUser, setLocalUser] = useState(currentUser);
  const [selectedGame, setSelectedGame] = useState<'NONE' | 'TANK' | 'MEMORY' | 'CHRONOS' | 'TRIVIA' | 'BIO' | 'CIPHER'>('NONE');

  useEffect(() => {
    setLocalUser(currentUser);
  }, [currentUser]);

  useEffect(() => {
    onImmersiveChange?.(isGameActive || selectedGame !== 'NONE');
  }, [isGameActive, selectedGame, onImmersiveChange]);

  useEffect(() => {
    const fetchTitles = async () => {
      const list = await titleService.getAvailableTitles(currentUser.uid);
      setTitles(list);
    };
    fetchTitles();
  }, [currentUser]);

  const selectTitle = async (t: string | null) => {
    await titleService.setActiveTitle(currentUser.uid, t);
    const updated = { ...localUser, activeTitle: t || undefined };
    setLocalUser(updated);
    onUpdate(updated);
    audioService.playBlip();
  };

  const handlePromotion = async () => {
    if ((localUser.credits || 0) < 500) return;
    setIsPromoting(true);
    audioService.playSuccess();
    
    const newLevel = (localUser.level || 1) + 1;
    const newCredits = (localUser.credits || 0) - 500;
    
    const updated = { ...localUser, level: newLevel, credits: newCredits };
    setLocalUser(updated);
    onUpdate(updated);
    
    await updateDoc(doc(db, 'users', localUser.uid), {
      level: newLevel,
      credits: newCredits
    });
    
    setTimeout(() => setIsPromoting(false), 2000);
  };

  const purchaseCustomization = async (id: string, cost: number, customizationObj: any) => {
     const isOwned = localUser.purchasedItems?.includes(id);
     
     if (!isOwned && (localUser.credits || 0) < cost) {
       audioService.playError();
       return;
     }
     
     let newCredits = localUser.credits || 0;
     let newPurchasedItems = [...(localUser.purchasedItems || [])];
     
     if (!isOwned) {
       newCredits -= cost;
       newPurchasedItems.push(id);
     }
     
     // Toggle off if currently active with the same values (simplified check)
     const isActive = localUser.customization && customizationObj ? JSON.stringify(localUser.customization).includes(JSON.stringify(customizationObj).slice(1, -1)) : false;
     const newCustomization = isActive ? {} : { ...(localUser.customization || {}), ...customizationObj };
     
     const updated = { 
       ...localUser, 
       credits: newCredits, 
       purchasedItems: newPurchasedItems,
       customization: newCustomization 
     };
     
     setLocalUser(updated);
     onUpdate(updated);
     
     await updateDoc(doc(db, 'users', localUser.uid), {
       credits: newCredits,
       purchasedItems: newPurchasedItems,
       customization: newCustomization
     });
     
     audioService.playSuccess();
  };

  const SHOP_ITEMS = [
    {
      id: 'neon_glow',
      title: "Cyber_Neon_Glow",
      desc: "Emanate a tactical radiance from your locator nodes.",
      cost: 300,
      icon: Sparkles,
      config: { neonGlow: true }
    },
    {
      id: 'mouse_trail',
      title: "Liquid_Interface",
      desc: "Fluid cursor movement protocol implementation.",
      cost: 100,
      icon: Zap,
      config: { mouseTrail: true }
    },
    {
      id: 'name_cyan',
      title: "Cyan_Mastery",
      desc: "Custom tactical cyan user visualization.",
      cost: 50,
      icon: TargetIcon,
      config: { nameColor: '#22d3ee', titleColor: 'rgba(34,211,238,0.6)', mouseColor: '#22d3ee' }
    },
    {
      id: 'name_gold',
      title: "Gold_Sovereign",
      desc: "High-status golden interface aesthetics with ultra-heavy heavy locator.",
      cost: 1000,
      icon: Star,
      config: { nameColor: '#fbbf24', titleColor: 'rgba(251,191,36,0.6)', mouseColor: '#fbbf24', mouseSize: 48, neonGlow: true }
    },
    {
      id: 'cursor_size',
      title: "Heavy_Cursor",
      desc: "Increase locator dimensions for better focus.",
      cost: 200,
      icon: Maximize2,
      config: { mouseSize: 32 }
    },
    {
      id: 'rainbow_shift',
      title: "Prism_Shift",
      desc: "Unstable color spectrum synchronization. (Rainbow Name)",
      cost: 5000,
      icon: Sparkles,
      config: { nameColor: 'rainbow', neonGlow: true }
    },
    {
      id: 'luck_chip',
      title: "Neural_Luck_Buffer",
      desc: "Experimental chip that boosts critical gacha probability by 15%.",
      cost: 5000,
      icon: Zap,
      config: { luckBonus: 0.15 }
    },
    {
      id: 'high_roller_id',
      title: "High_Sovereign_ID",
      desc: "Unlock secret VIP dialogues and higher betting limits in all sectors.",
      cost: 15000,
      icon: Shield,
      config: { vipStatus: true }
    },
    {
      id: 'glitch_name',
      title: "Corrupted_ID",
      desc: "Partial database corruption in naming protocol.",
      cost: 2500,
      icon: AlertTriangle,
      config: { glitchEffect: true }
    },
    {
      id: 'name_red',
      title: "Blood_Ops",
      desc: "Aggressive red-spectrum visualization suite.",
      cost: 1500,
      icon: Shield,
      config: { nameColor: '#ef4444', titleColor: 'rgba(239,68,68,0.6)', mouseColor: '#ef4444' }
    },
    {
      id: 'ghost_protocol',
      title: "Ghost_Protocol",
      desc: "Pure white spectral visualization for stealth ops.",
      cost: 800,
      icon: User,
      config: { nameColor: '#ffffff', titleColor: 'rgba(255,255,255,0.4)', mouseColor: '#ffffff' }
    },
    {
      id: 'emerald_matrix',
      title: "Emerald_Matrix",
      desc: "System-level green matrix interface protocol.",
      cost: 600,
      icon: Cpu,
      config: { nameColor: '#10b981', titleColor: 'rgba(16,185,129,0.4)', mouseColor: '#10b981' }
    },
    {
      id: 'neural_bridge',
      title: "Neural_Link_V3",
      desc: "Direct neural uplink. Boosts simulation credit rewards by 10%.",
      cost: 8000,
      icon: Zap,
      config: { creditBonus: 0.1 }
    },
    {
      id: 'overclock_module',
      title: "Overclock_Module",
      desc: "Increases processing speed. (Visual particles on mouse)",
      cost: 1200,
      icon: Zap,
      config: { overclocked: true }
    },
    {
      id: 'sentry_drone',
      title: "Sentry_Pod",
      desc: "Tactical sentinel following your interface locator.",
      cost: 2500,
      icon: Shield,
      config: { hasSentry: true }
    }
  ];

  const applyGameCredits = async (cr: number, extra?: any) => {
    let finalCr = cr;
    if (localUser.customization?.creditBonus) {
      finalCr = Math.round(cr * (1 + localUser.customization.creditBonus));
    }
    
    const newCredits = (localUser.credits || 0) + finalCr;
    const updatePayload: any = { credits: newCredits };
    const updatedUser = { ...localUser, credits: newCredits };

    if (extra && extra.tankHighscore !== undefined) {
      const currentHigh = localUser.tankHighscore || 0;
      const newHigh = Math.max(currentHigh, extra.tankHighscore);
      updatePayload.tankHighscore = newHigh;
      updatedUser.tankHighscore = newHigh;
    }

    setLocalUser(updatedUser);
    onUpdate(updatedUser);
    
    try {
      await updateDoc(doc(db, 'users', localUser.uid), updatePayload);
      if (finalCr > 0) {
        window.dispatchEvent(new CustomEvent('kipher:creditsAwarded', { detail: finalCr }));
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${localUser.uid}`);
    }
  };

  const tabs = [
    { id: 'HONOR', icon: Trophy, label: 'Honors_Vault' },
    { id: 'PROMOTIONS', icon: TrendingUp, label: 'Neural_Ascension' },
    { id: 'SHOP', icon: ShoppingBag, label: 'Upgrade_Shop' },
    { id: 'LEADERBOARD', icon: Star, label: 'Leaderboard' },
    { id: 'GAMES', icon: Gamepad2, label: 'Tactical_Sims' },
  ] as const;

  return (
    <div className="fixed inset-0 z-[100] bg-absolute-black flex flex-col md:flex-row font-mono overflow-hidden">
      {/* Sidebar Nav */}
      <AnimatePresence>
        {!isGameActive && (
          <motion.div 
            initial={{ x: -256 }}
            animate={{ x: 0 }}
            exit={{ x: -256 }}
            className="w-full md:w-64 bg-slate-950 border-r border-slate-900 flex flex-col p-6 shrink-0 h-20 md:h-full justify-between items-center md:items-stretch z-10"
          >
            <div className="flex-1 flex md:flex-col items-center md:items-stretch gap-4 md:gap-2">
              <button 
                onClick={onClose}
                className="flex items-center gap-2 p-3 text-slate-500 hover:text-white transition-all group mb-0 md:mb-8"
              >
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                <span className="text-[10px] font-black uppercase tracking-widest hidden md:inline">RETURN_TO_SYSTEM</span>
              </button>

              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); audioService.playBlip(); }}
                  className={`flex-1 md:flex-none flex items-center justify-center md:justify-start gap-3 p-4 transition-all border shrink-0 ${activeTab === tab.id ? 'bg-tactical-cyan/10 border-tactical-cyan text-tactical-cyan shadow-[0_0_15px_rgba(34,211,238,0.1)]' : 'border-transparent text-slate-600 hover:text-slate-400'}`}
                >
                  <tab.icon size={18} />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] hidden md:inline">{tab.label}</span>
                </button>
              ))}
            </div>

            <div className="hidden md:block p-4 border border-slate-900 bg-slate-900/30">
               <div className="text-[9px] font-black text-slate-500 uppercase mb-2">Authenticated_Asset</div>
               <div className="flex items-center gap-3">
                  <div className="h-10 w-10 border border-tactical-cyan/40 bg-tactical-cyan/10 flex items-center justify-center">
                     <Shield className="text-tactical-cyan" size={20} />
                  </div>
                  <div className="overflow-hidden">
                     <div className="text-[11px] font-black text-white truncate truncate uppercase">{localUser.displayName}</div>
                     <div className="text-[9px] font-bold text-tactical-cyan flex items-center gap-1">
                        <Zap size={10} />
                        {localUser.credits || 0} CR
                     </div>
                  </div>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-10 relative overflow-hidden flex flex-col min-h-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex-1 overflow-y-auto custom-scrollbar pr-4 flex flex-col"
          >
            {activeTab === 'HONOR' && (
              <div className="space-y-8 max-w-2xl mx-auto w-full py-10">
                <div className="text-center mb-12">
                   <h1 className="text-4xl font-black text-white tracking-[0.3em] uppercase mb-4">Honors_Vault</h1>
                   <div className="h-1 w-20 bg-tactical-cyan mx-auto"></div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <button 
                    onClick={() => selectTitle(null)}
                    className={`p-6 border text-left transition-all ${!localUser.activeTitle ? 'border-tactical-cyan bg-tactical-cyan/10' : 'border-slate-900 hover:border-slate-700'}`}
                  >
                    <div className="text-xs font-black uppercase tracking-widest text-slate-500 mb-1">Standard_Asset</div>
                    <div className="text-lg font-black text-white uppercase tracking-[0.2em]">[ NONE ]</div>
                  </button>
                  {titles.map((t, i) => (
                    <button 
                      key={`${t}-${i}`}
                      onClick={() => selectTitle(t)}
                      className={`p-6 border text-left transition-all relative overflow-hidden group ${localUser.activeTitle === t ? 'border-tactical-cyan bg-tactical-cyan/10' : 'border-slate-900 hover:border-slate-700'}`}
                    >
                      <div className="text-[10px] font-black uppercase tracking-widest text-tactical-cyan/60 mb-1">Authenticated_Rank</div>
                      <div className="text-xl font-black text-white uppercase tracking-[0.2em]">« {t} »</div>
                      <Shield className="absolute -bottom-4 -right-4 text-white/5 group-hover:text-tactical-cyan/10 transition-colors" size={80} />
                    </button>
                  ))}
                  {titles.length === 0 && (
                    <div className="text-center py-20 border border-dashed border-slate-900 text-slate-700 text-xs font-black uppercase italic">
                      No achievements detected on this node trace.
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'PROMOTIONS' && (
              <div className="max-w-2xl mx-auto w-full py-10 flex flex-col items-center">
                 <div className="text-center mb-20">
                   <h1 className="text-4xl font-black text-white tracking-[0.3em] uppercase mb-4">Neural_Ascension</h1>
                   <p className="text-slate-500 text-xs font-black tracking-widest uppercase">Increase your synchronization level to boost gacha luck</p>
                 </div>

                 <div className="relative w-64 h-64 mb-12">
                   <div className="absolute inset-0 border-8 border-slate-900 rounded-full"></div>
                   <motion.div 
                     className="absolute inset-0 border-8 border-tactical-cyan rounded-full border-t-transparent"
                     animate={{ rotate: 360 }}
                     transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                   ></motion.div>
                   <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <div className="text-5xl font-black text-white">LVL_{localUser.level || 1}</div>
                      <div className="text-[10px] font-black text-tactical-cyan uppercase tracking-widest mt-1">Gacha_Luck_Bonus: +{((localUser.level || 1) - 1) * 2}%</div>
                   </div>
                 </div>

                 <div className="bg-slate-900/50 border border-slate-800 p-8 w-full max-w-md text-center">
                    <h3 className="text-lg font-black text-white uppercase mb-4 tracking-widest">Neural_Uplink_Protocol</h3>
                    <p className="text-slate-500 text-xs mb-8 uppercase italic">Cost per Level: <span className="text-tactical-cyan font-black">500 Credits</span></p>
                    
                    <button 
                      onClick={handlePromotion}
                      disabled={isPromoting || (localUser.credits || 0) < 500}
                      className={`w-full py-4 font-black uppercase tracking-[.3em] transition-all relative overflow-hidden ${isPromoting ? 'bg-slate-800 text-slate-600' : (localUser.credits || 0) >= 500 ? 'bg-tactical-cyan text-black hover:bg-white' : 'bg-slate-900 text-slate-700 border border-slate-800 cursor-not-allowed'}`}
                    >
                      {isPromoting ? 'ASCENDING...' : 'INITIATE_LEVEL_UP'}
                      {isPromoting && (
                         <motion.div 
                           initial={{ x: '-100%' }}
                           animate={{ x: '100%' }}
                           transition={{ duration: 1.5, repeat: Infinity }}
                           className="absolute inset-0 bg-white/20 skew-x-12"
                         />
                      )}
                    </button>
                    {(localUser.credits || 0) < 500 && !isPromoting && (
                      <p className="mt-4 text-[9px] text-red-500/60 font-black uppercase tracking-widest italic">Insufficient_Intel_Units_Detected</p>
                    )}
                 </div>
              </div>
            )}

            {activeTab === 'SHOP' && (
              <div className="max-w-4xl mx-auto w-full py-10">
                <div className="text-center mb-16">
                  <h1 className="text-4xl font-black text-white tracking-[0.3em] uppercase mb-4">Upgrade_Shop</h1>
                  <p className="text-slate-500 text-xs font-black tracking-widest uppercase">Convert raw data into interface enhancements</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {SHOP_ITEMS.map((item) => {
                    const isOwned = localUser.purchasedItems?.includes(item.id);
                    const isActive = localUser.customization && item.config ? JSON.stringify(localUser.customization).includes(JSON.stringify(item.config).slice(1, -1)) : false;

                    return (
                      <ShopItem 
                        key={item.id}
                        title={item.title}
                        desc={item.desc}
                        cost={item.cost}
                        icon={item.icon}
                        owned={!!isOwned}
                        active={isActive}
                        onBuy={() => purchaseCustomization(item.id, item.cost, item.config)}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === 'LEADERBOARD' && (
              <div className="max-w-2xl mx-auto w-full py-10">
                 <div className="text-center mb-12">
                   <h1 className="text-4xl font-black text-white tracking-[0.3em] uppercase mb-4">Command_Ranks</h1>
                   <div className="h-1 w-20 bg-tactical-cyan mx-auto"></div>
                 </div>
                 
                 <TankLeaderboard />
              </div>
            )}

            {activeTab === 'GAMES' && (
              <div className="h-full flex flex-col">
                 {selectedGame === 'NONE' ? (
                   <div className="flex-1 flex flex-col items-center justify-center space-y-8 py-10 overflow-y-auto px-4 custom-scrollbar">
                      <div className="text-center mb-4">
                        <h1 className="text-4xl font-black text-white tracking-[0.4em] uppercase mb-2">Arcade_Cortex_V2</h1>
                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Select tactical simulation module // High Intensity active</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
                         <GameCard 
                           title="Armored_Core"
                           desc="Top-down tactical tank survival. Dodge Boss attacks and unleash your Ultimate Smash."
                           icon={Shield}
                           onPlay={() => setSelectedGame('TANK')}
                         />
                         <GameCard 
                           title="Cortex_Match"
                           desc="Neural pattern synchronization and data block decryption."
                           icon={Brain}
                           onPlay={() => setSelectedGame('MEMORY')}
                         />
                         <GameCard 
                           title="Chronos_Drift"
                           desc="Navigate the chronos-stream. Manipulate time to bypass corruption."
                           icon={Clock}
                           onPlay={() => setSelectedGame('CHRONOS')}
                         />
                         <GameCard 
                           title="Trivia_Nexus"
                           desc="Extract technical intelligence. Survive neural feedback loops."
                           icon={HelpCircle}
                           onPlay={() => setSelectedGame('TRIVIA')}
                         />
                         <GameCard 
                           title="Biometric_Nexus"
                           desc="Synchronize neural patterns through optical validation. Extract identity units."
                           icon={User}
                           onPlay={() => setSelectedGame('BIO')}
                         />
                         <GameCard 
                           title="Neural_Cipher"
                           desc="Decrypt complex frequency patterns to harvest encrypted credits."
                           icon={Terminal}
                           onPlay={() => setSelectedGame('CIPHER')}
                         />
                      </div>
                   </div>
                 ) : selectedGame === 'TANK' ? (
                    <TankGame 
                      onBack={() => setSelectedGame('NONE')} 
                      onCreditsEarned={(cr, wave) => applyGameCredits(cr, { tankHighscore: wave })}
                    />
                 ) : selectedGame === 'MEMORY' ? (
                    <MemoryMatch 
                      onBack={() => setSelectedGame('NONE')} 
                      onCreditsEarned={(cr) => applyGameCredits(cr)}
                    />
                  ) : selectedGame === 'CHRONOS' ? (
                     <TimeGame 
                       onBack={() => setSelectedGame('NONE')}
                       onCreditsEarned={(cr) => applyGameCredits(cr)}
                     />
                  ) : selectedGame === 'BIO' ? (
                    <BiometricScan 
                      onComplete={() => {
                        applyGameCredits(250);
                        setSelectedGame('NONE');
                      }}
                      onFail={() => setSelectedGame('NONE')}
                    />
                  ) : selectedGame === 'CIPHER' ? (
                    <NeuralCipher 
                      onComplete={(score) => {
                        applyGameCredits(score);
                        setSelectedGame('NONE');
                      }}
                      onFail={() => setSelectedGame('NONE')}
                    />
                  ) : (
                    <TriviaGame 
                      onBack={() => setSelectedGame('NONE')}
                      onCreditsEarned={(cr) => applyGameCredits(cr)}
                    />
                  )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function GameCard({ title, desc, icon: Icon, onPlay }: { title: string, desc: string, icon: any, onPlay: () => void }) {
  return (
    <motion.div 
      whileHover={{ scale: 1.02 }}
      className="bg-slate-900 border border-slate-800 p-8 flex flex-col items-center text-center group hover:border-tactical-cyan/40"
    >
       <div className="w-20 h-20 rounded-full bg-slate-950 flex items-center justify-center text-slate-700 group-hover:text-tactical-cyan border border-slate-800 group-hover:border-tactical-cyan/20 mb-6 transition-colors shadow-[0_0_30px_rgba(0,0,0,0.5)]">
          <Icon size={40} />
       </div>
       <h3 className="text-xl font-black text-white uppercase tracking-[0.2em] mb-4">{title}</h3>
       <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-8 flex-1 leading-relaxed">{desc}</p>
       <button 
         onClick={() => { onPlay(); audioService.playSuccess(); }}
         className="w-full py-4 bg-slate-950 border border-slate-800 text-slate-400 font-black uppercase tracking-[0.3em] hover:bg-tactical-cyan hover:text-black hover:border-tactical-cyan transition-all"
       >
         INITIATE_LINK
       </button>
    </motion.div>
  );
}

function ShopItem({ title, desc, cost, icon: Icon, onBuy, owned, active }: { title: string, desc: string, cost: number, icon: any, onBuy: () => void, owned: boolean, active?: boolean }) {
  return (
    <div className={`p-6 bg-slate-900 border transition-all flex flex-col ${owned ? 'border-green-500/30' : 'border-slate-800 hover:border-tactical-cyan'}`}>
       <div className="flex justify-between items-start mb-6">
          <div className={`p-3 border rounded ${owned ? 'border-green-500/20 bg-green-500/5 text-green-500' : 'border-slate-800 bg-slate-950 text-slate-500'}`}>
             <Icon size={24} />
          </div>
          {owned && <Shield className={active ? "text-tactical-cyan" : "text-green-500"} size={16} />}
       </div>
       <h3 className="text-sm font-black text-white uppercase tracking-widest mb-1">{title}</h3>
       <p className="text-[10px] text-slate-500 mb-6 flex-1 line-clamp-2 uppercase italic">{desc}</p>
       <button 
         onClick={onBuy}
         className={`w-full py-3 text-[10px] font-black uppercase tracking-widest transition-all ${owned ? (active ? 'bg-tactical-cyan text-black border-tactical-cyan' : 'bg-green-500/10 text-green-500 border border-green-500/20 hover:bg-green-500 hover:text-black') : 'bg-slate-950 border border-slate-800 text-slate-400 hover:border-tactical-cyan hover:text-tactical-cyan'}`}
       >
         {active ? 'SYSTEM_ACTIVE' : owned ? 'TOGGLE_BOOT' : `ACQUIRE // ${cost} CR`}
       </button>
    </div>
  );
}

function TankLeaderboard() {
  const [scores, setScores] = useState<{name: string, wave: number}[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchScores = async () => {
      try {
        const q = query(collection(db, 'users'), orderBy('tankHighscore', 'desc'), limit(10));
        const snap = await getDocs(q);
        const list = snap.docs
          .map(d => ({ name: d.data().displayName, wave: d.data().tankHighscore || 0 }))
          .filter(s => s.wave > 0);
        setScores(list);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchScores();
  }, []);

  if (loading) return <div className="text-center py-10 text-tactical-cyan animate-pulse font-black">FETCHING_COMMAND_DATA...</div>;

  return (
    <div className="space-y-4">
      {scores.map((s, i) => (
        <div key={i} className="flex justify-between items-center p-4 bg-slate-900 border-l-4 border-tactical-cyan">
           <div className="flex items-center gap-4">
              <span className="text-slate-500 font-black">#{i+1}</span>
              <span className="text-white font-black uppercase tracking-widest">{s.name}</span>
           </div>
           <div className="text-tactical-cyan font-black">WAVE_{s.wave}</div>
        </div>
      ))}
      {scores.length === 0 && (
         <div className="text-center py-10 text-slate-700 italic border border-dashed border-slate-900">No active combat records found.</div>
      )}
    </div>
  );
}
