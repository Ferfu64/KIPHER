import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, TrendingUp, ShoppingBag, Gamepad2, ArrowLeft, Star, Shield, Zap, Sparkles, User, Badge, Swords, Crosshair } from 'lucide-react';
import { titleService } from '../services/titleService';
import { audioService } from '../services/audioService';
import { db } from '../lib/firebase';
import { doc, setDoc, updateDoc } from 'firebase/firestore';
import TankGame from './TankGame';
import CyberRunner from './CyberRunner';

interface SecretSpaceProps {
  currentUser: UserProfile;
  onUpdate: (user: UserProfile) => void;
  onClose: () => void;
  onImmersiveChange?: (active: boolean) => void;
}

export default function SecretSpace({ currentUser, onUpdate, onClose, onImmersiveChange }: SecretSpaceProps) {
  const [activeTab, setActiveTab] = useState<'HONOR' | 'PROMOTIONS' | 'SHOP' | 'GAMES'>('HONOR');
  const [isGameActive, setIsGameActive] = useState(false);
  const [titles, setTitles] = useState<string[]>([]);
  const [isPromoting, setIsPromoting] = useState(false);
  const [localUser, setLocalUser] = useState(currentUser);
  const [selectedGame, setSelectedGame] = useState<'NONE' | 'TANK' | 'RUNNER'>('NONE');

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
    
    const newPromotionCount = (localUser.promotionCount || 0) + 1;
    const newCredits = (localUser.credits || 0) - 500;
    
    const updated = { ...localUser, promotionCount: newPromotionCount, credits: newCredits };
    setLocalUser(updated);
    onUpdate(updated);
    
    await updateDoc(doc(db, 'users', localUser.uid), {
      promotionCount: newPromotionCount,
      credits: newCredits
    });
    
    setTimeout(() => setIsPromoting(false), 2000);
  };

  const purchaseCustomization = async (id: string, cost: number, customizationObj: any) => {
     if ((localUser.credits || 0) < cost) return;
     
     const newCredits = (localUser.credits || 0) - cost;
     const newCustomization = { ...(localUser.customization || {}), ...customizationObj };
     
     const updated = { ...localUser, credits: newCredits, customization: newCustomization };
     setLocalUser(updated);
     onUpdate(updated);
     
     await updateDoc(doc(db, 'users', localUser.uid), {
       credits: newCredits,
       customization: newCustomization
     });
     audioService.playSuccess();
  };

  const tabs = [
    { id: 'HONOR', icon: Trophy, label: 'Honors_Vault' },
    { id: 'PROMOTIONS', icon: TrendingUp, label: 'Rank_Ascension' },
    { id: 'SHOP', icon: ShoppingBag, label: 'Upgrade_Shop' },
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
                   <h1 className="text-4xl font-black text-white tracking-[0.3em] uppercase mb-4">Rank_Ascension</h1>
                   <p className="text-slate-500 text-xs font-black tracking-widest uppercase">Forge your path through the KIPHER hierarchy</p>
                 </div>

                 <div className="relative w-64 h-64 mb-12">
                   <div className="absolute inset-0 border-8 border-slate-900 rounded-full"></div>
                   <motion.div 
                     className="absolute inset-0 border-8 border-tactical-cyan rounded-full border-t-transparent"
                     animate={{ rotate: 360 }}
                     transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                   ></motion.div>
                   <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <div className="text-5xl font-black text-white">{localUser.clearanceLevel + (localUser.promotionCount || 0)}</div>
                      <div className="text-[10px] font-black text-tactical-cyan uppercase tracking-widest mt-1">Current_Clearance</div>
                   </div>
                 </div>

                 <div className="bg-slate-900/50 border border-slate-800 p-8 w-full max-w-md text-center">
                    <h3 className="text-lg font-black text-white uppercase mb-4 tracking-widest">Protocol_Enhancement</h3>
                    <p className="text-slate-500 text-xs mb-8 uppercase italic">Cost per ascension: <span className="text-tactical-cyan font-black">500 Credits</span></p>
                    
                    <button 
                      onClick={handlePromotion}
                      disabled={isPromoting || (localUser.credits || 0) < 500}
                      className={`w-full py-4 font-black uppercase tracking-[.3em] transition-all relative overflow-hidden ${isPromoting ? 'bg-slate-800 text-slate-600' : (localUser.credits || 0) >= 500 ? 'bg-tactical-cyan text-black hover:bg-white' : 'bg-slate-900 text-slate-700 border border-slate-800 cursor-not-allowed'}`}
                    >
                      {isPromoting ? 'ASCENDING...' : 'INITIATE_PROMOTION'}
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
                  <ShopItem 
                    title="Cyber_Neon_Glow"
                    desc="Emanate a tactical radiance from your locator nodes."
                    cost={300}
                    icon={Sparkles}
                    owned={!!localUser.customization?.neonGlow}
                    onBuy={() => purchaseCustomization('neon_glow', 300, { neonGlow: true })}
                  />
                  <ShopItem 
                    title="Liquid_Interface"
                    desc="Fluid cursor movement protocol implementation."
                    cost={100}
                    icon={Zap}
                    owned={!!localUser.customization?.mouseTrail}
                    onBuy={() => purchaseCustomization('mouse_trail', 100, { mouseTrail: true })}
                  />
                  <ShopItem 
                    title="Cyan_Mastery"
                    desc="Custom tactical cyan user visualization."
                    cost={50}
                    icon={Target}
                    owned={localUser.customization?.nameColor === '#22d3ee'}
                    onBuy={() => purchaseCustomization('name_cyan', 50, { nameColor: '#22d3ee', titleColor: 'rgba(34,211,238,0.6)' })}
                  />
                  <ShopItem 
                    title="Gold_Sovereign"
                    desc="High-status golden interface aesthetics."
                    cost={1000}
                    icon={Star}
                    owned={localUser.customization?.nameColor === '#fbbf24'}
                    onBuy={() => purchaseCustomization('name_gold', 1000, { nameColor: '#fbbf24', titleColor: 'rgba(251,191,36,0.6)' })}
                  />
                  <ShopItem 
                    title="Heavy_Cursor"
                    desc="Increase locator dimensions for better focus."
                    cost={200}
                    icon={Maximize2}
                    owned={localUser.customization?.mouseSize === 32}
                    onBuy={() => purchaseCustomization('cursor_size', 200, { mouseSize: 32 })}
                  />
                  <ShopItem 
                    title="Blood_Ops"
                    desc="Aggressive red-spectrum visualization suite."
                    cost={1500}
                    icon={Shield}
                    owned={localUser.customization?.nameColor === '#ef4444'}
                    onBuy={() => purchaseCustomization('name_red', 1500, { nameColor: '#ef4444', titleColor: 'rgba(239,68,68,0.6)', mouseColor: '#ef4444' })}
                  />
                </div>
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
                           desc="Top-down tactical tank survival. Now with Berserker Melee Mode [Shift] and Boss Encounters."
                           icon={Shield}
                           onPlay={() => setSelectedGame('TANK')}
                         />
                         <GameCard 
                           title="Cyber_Runner"
                           desc="Dynamic data stream navigation. Avoid firewalls. Collect signal optimizers."
                           icon={Zap}
                           onPlay={() => setSelectedGame('RUNNER')}
                         />
                      </div>
                   </div>
                 ) : selectedGame === 'TANK' ? (
                    <TankGame onBack={() => setSelectedGame('NONE')} />
                 ) : (
                    <CyberRunner onBack={() => setSelectedGame('NONE')} />
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

function ShopItem({ title, desc, cost, icon: Icon, onBuy, owned }: { title: string, desc: string, cost: number, icon: any, onBuy: () => void, owned: boolean }) {
  return (
    <div className={`p-6 bg-slate-900 border transition-all flex flex-col ${owned ? 'border-green-500/30' : 'border-slate-800 hover:border-tactical-cyan'}`}>
       <div className="flex justify-between items-start mb-6">
          <div className={`p-3 border rounded ${owned ? 'border-green-500/20 bg-green-500/5 text-green-500' : 'border-slate-800 bg-slate-950 text-slate-500'}`}>
             <Icon size={24} />
          </div>
          {owned && <Shield className="text-green-500" size={16} />}
       </div>
       <h3 className="text-sm font-black text-white uppercase tracking-widest mb-1">{title}</h3>
       <p className="text-[10px] text-slate-500 mb-6 flex-1 line-clamp-2 uppercase italic">{desc}</p>
       <button 
         onClick={onBuy}
         disabled={owned}
         className={`w-full py-3 text-[10px] font-black uppercase tracking-widest transition-all ${owned ? 'bg-green-500/10 text-green-500 cursor-not-allowed border border-green-500/20' : 'bg-slate-950 border border-slate-800 text-slate-400 hover:border-tactical-cyan hover:text-tactical-cyan'}`}
       >
         {owned ? 'PROTOCOL_ACTIVE' : `ACQUIRE // ${cost} CR`}
       </button>
    </div>
  );
}

function Maximize2(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 3 21 3 21 9"></polyline><polyline points="9 21 3 21 3 15"></polyline><line x1="21" y1="3" x2="14" y2="10"></line><line x1="3" y1="21" x2="10" y2="14"></line></svg>;
}

function Target(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>;
}
