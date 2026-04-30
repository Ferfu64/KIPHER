import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { audioService } from '../services/audioService';
import { ShieldAlert, Zap, Globe, Infinity, Scan, Cpu, Eye, Activity, HardDrive, Smartphone, Search, Share2, Repeat, Layers, Box, Camera, Database, Hash, Play, Wind, Sun, Satellite, Radar, Key, CircuitBoard, Atom, Clock, Rocket, ZapIcon, Mountain, ArrowRight, AlertTriangle, User, Music, Music2 } from 'lucide-react';

interface CutsceneProps {
  onComplete: (rarity: string) => void;
  forcedType?: string;
}

type CutsceneType = 
  | 'FLUSH' | 'SPIKE' | 'BREACH' | 'OMEGA' | 'SINGULARITY' | 'GHOST' | 'VISAGE' | 'LIFEFORM'
  | 'DATA_FALL' | 'BINARY_WAVE' | 'NEON_GRID' | 'SATELLITE_LINK' | 'RADAR_SWEEP' | 'ENCRYPTION_KEY' 
  | 'CIRCUIT_FLOW' | 'VOID_EYE' | 'SILICON_CITY' | 'FRACTAL_GROWTH' | 'DRONE_SURVEILLANCE' 
  | 'DNA_SEQUENCE' | 'QUANTUM_BIT' | 'CORE_PULSE' | 'TIME_FLUX' | 'STARS_ZOOM' | 'PULSAR' 
  | 'NEURAL_MAP' | 'FROST_STATIC' | 'VOLCANIC_DEBUG' | 'CELESTIAL_SYNC' | 'DEEP_SEA_LINK'
  | 'STICK_FIGHT' | 'CYBER_PULSE' | 'HYPER_LOOP' | 'NEURAL_SYNC' | 'CODE_VORTEX' | 'GLITCH_FACE' 
  | 'SIGNAL_INTERFERENCE' | 'ORBITAL_STRIKE' | 'DATA_ERASURE' | 'FIREWALL_BREACH' | 'GRID_LOCK' 
  | 'VECTOR_FIELD' | 'BIO_HAZARD' | 'PRISM_SHIFT' | 'GALAXY_COLLISION' | 'ANGELIC_SYMPHONY';

export default function CortexCutscene({ onComplete, forcedType }: CutsceneProps) {
  const [type, setType] = useState<CutsceneType>('FLUSH');
  const [status, setStatus] = useState<'ACTIVE' | 'DISPLAY_RARITY'>('ACTIVE');
  const [rarityText, setRarityText] = useState('');
  
  useEffect(() => {
    // Total pool of 1,000,000
    const rand = Math.random() * 1000000;
    let selected: CutsceneType = 'FLUSH';
    let text = '';

    if (forcedType) {
        selected = forcedType as CutsceneType;
        text = '1 in 1,000,000 (CELESTIAL_OVERRIDE_ACTIVE)';
    } else {
        // Tiers
        if (rand < 2) { // 1 in 500k
          selected = 'ANGELIC_SYMPHONY';
          text = '1 in 500,000 (CELESTIAL_INTERVENTION)';
        } else if (rand < 10) { // 1 in 100k
          selected = 'SINGULARITY';
          text = '1 in 100,000 (THE_SINGULARITY_REACHED)';
        } else if (rand < 2000) { // 1 in 500 - Epic Tier
      const epicPool: CutsceneType[] = [
        'OMEGA', 'QUANTUM_BIT', 'CORE_PULSE', 'TIME_FLUX', 'STARS_ZOOM', 
        'GALAXY_COLLISION', 'ORBITAL_STRIKE', 'STICK_FIGHT'
      ];
      selected = epicPool[Math.floor(Math.random() * epicPool.length)];
      text = `1 in 500 (EPIC_${selected}_PROTOCOL)`;
    } else if (rand < 50000) { // 1 in 20 - Rare Tier
      const rarePool: CutsceneType[] = [
        'VOID_EYE', 'SILICON_CITY', 'FRACTAL_GROWTH', 'DRONE_SURVEILLANCE', 
        'DNA_SEQUENCE', 'PULSAR', 'CELESTIAL_SYNC', 'PRISM_SHIFT', 
        'CODE_VORTEX', 'GLITCH_FACE', 'BIO_HAZARD'
      ];
      selected = rarePool[Math.floor(Math.random() * rarePool.length)];
      text = `1 in 20 (RARE_${selected}_EVENT)`;
    } else if (rand < 300000) { // 1 in 3 - Uncommon Tier
      const uncommonPool: CutsceneType[] = [
        'VISAGE', 'LIFEFORM', 'SATELLITE_LINK', 'RADAR_SWEEP', 'ENCRYPTION_KEY', 
        'CIRCUIT_FLOW', 'NEURAL_MAP', 'VOLCANIC_DEBUG', 'CYBER_PULSE', 
        'HYPER_LOOP', 'NEURAL_SYNC', 'DATA_ERASURE', 'FIREWALL_BREACH', 'GRID_LOCK', 'VECTOR_FIELD'
      ];
      selected = uncommonPool[Math.floor(Math.random() * uncommonPool.length)];
      text = `1 in 3 (UNCOMMON_${selected}_LINK)`;
    } else { // Common Tier
      const commonPool: CutsceneType[] = [
        'FLUSH', 'SPIKE', 'BREACH', 'GHOST', 'DATA_FALL', 'BINARY_WAVE', 
        'NEON_GRID', 'FROST_STATIC', 'DEEP_SEA_LINK', 'SIGNAL_INTERFERENCE'
      ];
      selected = commonPool[Math.floor(Math.random() * commonPool.length)];
      text = `1 in 2 (COMMON_${selected}_MAINTENANCE)`;
    }
}

    setType(selected);
    setRarityText(text);

    // Sound logic
    if (rand < 10) audioService.playSuccess();
    else if (selected === 'OMEGA' || selected === 'VOLCANIC_DEBUG') audioService.playError();
    else audioService.playBlip();

    const timer = setTimeout(() => {
      setStatus('DISPLAY_RARITY');
    }, (selected === 'SINGULARITY' || selected === 'STARS_ZOOM') ? 6000 : 3500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-[100000] bg-black overflow-hidden flex items-center justify-center font-mono">
      <AnimatePresence mode="wait">
        {status === 'ACTIVE' && (
          <motion.div 
            key={type}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-full"
          >
            {type === 'FLUSH' && <FlushEffect />}
            {type === 'SPIKE' && <SpikeEffect />}
            {type === 'BREACH' && <BreachEffect />}
            {type === 'OMEGA' && <OmegaEffect />}
            {type === 'SINGULARITY' && <SingularityEffect />}
            {type === 'GHOST' && <GhostEffect />}
            {type === 'VISAGE' && <VisageEffect />}
            {type === 'LIFEFORM' && <LifeformEffect />}
            {type === 'DATA_FALL' && <DataFallEffect />}
            {type === 'BINARY_WAVE' && <BinaryWaveEffect />}
            {type === 'NEON_GRID' && <NeonGridEffect />}
            {type === 'SATELLITE_LINK' && <SatelliteLinkEffect />}
            {type === 'RADAR_SWEEP' && <RadarSweepEffect />}
            {type === 'ENCRYPTION_KEY' && <EncryptionKeyEffect />}
            {type === 'CIRCUIT_FLOW' && <CircuitFlowEffect />}
            {type === 'VOID_EYE' && <VoidEyeEffect />}
            {type === 'SILICON_CITY' && <SiliconCityEffect />}
            {type === 'FRACTAL_GROWTH' && <FractalGrowthEffect />}
            {type === 'DRONE_SURVEILLANCE' && <DroneSurveillanceEffect />}
            {type === 'DNA_SEQUENCE' && <DnaSequenceEffect />}
            {type === 'QUANTUM_BIT' && <QuantumBitEffect />}
            {type === 'CORE_PULSE' && <CorePulseEffect />}
            {type === 'TIME_FLUX' && <TimeFluxEffect />}
            {type === 'STARS_ZOOM' && <StarsZoomEffect />}
            {type === 'PULSAR' && <PulsarEffect />}
            {type === 'NEURAL_MAP' && <NeuralMapEffect />}
            {type === 'FROST_STATIC' && <FrostStaticEffect />}
            {type === 'VOLCANIC_DEBUG' && <VolcanicDebugEffect />}
            {type === 'CELESTIAL_SYNC' && <CelestialSyncEffect />}
            {type === 'DEEP_SEA_LINK' && <DeepSeaLinkEffect />}
            {type === 'STICK_FIGHT' && <StickFightEffect />}
            {type === 'CYBER_PULSE' && <CyberPulseEffect />}
            {type === 'HYPER_LOOP' && <HyperLoopEffect />}
            {type === 'NEURAL_SYNC' && <NeuralSyncEffect />}
            {type === 'CODE_VORTEX' && <CodeVortexEffect />}
            {type === 'GLITCH_FACE' && <GlitchFaceEffect />}
            {type === 'SIGNAL_INTERFERENCE' && <SignalInterferenceEffect />}
            {type === 'ORBITAL_STRIKE' && <OrbitalStrikeEffect />}
            {type === 'DATA_ERASURE' && <DataErasureEffect />}
            {type === 'FIREWALL_BREACH' && <FirewallBreachEffect />}
            {type === 'GRID_LOCK' && <GridLockEffect />}
            {type === 'VECTOR_FIELD' && <VectorFieldEffect />}
            {type === 'BIO_HAZARD' && <BioHazardEffect />}
            {type === 'PRISM_SHIFT' && <PrismShiftEffect />}
            {type === 'GALAXY_COLLISION' && <GalaxyCollisionEffect />}
            {type === 'ANGELIC_SYMPHONY' && <AngelicSymphonyEffect />}
          </motion.div>
        )}

        {status === 'DISPLAY_RARITY' && (
          <motion.div 
            key="rarity"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-4"
          >
            <div className="text-tactical-cyan text-[10px] font-black tracking-[0.5em] uppercase animate-pulse">SEQUENCE_COMPLETE</div>
            <div className="text-4xl font-black text-white italic uppercase tracking-tighter">
              ODDS: <span className="text-red-500">{rarityText}</span>
            </div>
            <button 
              onClick={() => onComplete(rarityText)}
              className="mt-8 px-8 py-2 border border-tactical-cyan/40 text-tactical-cyan hover:bg-tactical-cyan hover:text-black transition-all font-black text-xs uppercase"
            >
              RETURN_TO_REALITY
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function VisageEffect() {
    return (
        <div className="relative w-full h-full flex flex-col items-center justify-center bg-slate-950">
            <div className="absolute inset-0 opacity-20">
                <div className="w-full h-full bg-[radial-gradient(circle,rgba(34,211,238,0.2)_1px,transparent_1px)] bg-[length:40px_40px]" />
            </div>
            <motion.div 
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: [0, 1, 0.4, 1, 0], scale: [0.5, 1, 0.95, 1.05, 1.2] }}
                transition={{ duration: 4 }}
                className="relative z-10"
            >
                {/* Non-realistic stylized mask/visage */}
                <div className="w-96 h-96 rounded-full border-8 border-tactical-cyan/40 bg-slate-900 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute top-1/4 flex gap-20">
                        <motion.div animate={{ height: [4, 40, 4] }} transition={{ duration: 0.2, repeat: 999999, repeatDelay: 2 }} className="w-12 h-4 bg-tactical-cyan rounded-full shadow-[0_0_20px_#0ea5e9]" />
                        <motion.div animate={{ height: [4, 40, 4] }} transition={{ duration: 0.2, repeat: 999999, repeatDelay: 2 }} className="w-12 h-4 bg-tactical-cyan rounded-full shadow-[0_0_20px_#0ea5e9]" />
                    </div>
                    <motion.div 
                        animate={{ width: [100, 300, 100] }}
                        className="absolute bottom-1/4 h-2 bg-tactical-cyan/40"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-tactical-cyan/10 to-transparent" />
                </div>
                <div className="absolute inset-0 border-8 border-tactical-cyan/20 rounded-full animate-ping" />
            </motion.div>
            <div className="mt-8 flex gap-4">
                <Scan size={24} className="text-tactical-cyan animate-pulse" />
                <div className="text-xs text-tactical-cyan font-bold tracking-widest uppercase">SYD_VISAGE_MAPPED // NO_DNA_CONFLICT</div>
            </div>
        </div>
    );
}

function StickFightEffect() {
    return (
        <div className="relative w-full h-full bg-slate-950 flex items-center justify-center overflow-hidden">
            <motion.div 
                 animate={{ x: [-200, 200, -200] }}
                 transition={{ duration: 0.5, repeat: 999999 }}
                 className="flex gap-40"
            >
                <div className="relative">
                    <div className="w-10 h-10 border-4 border-tactical-cyan rounded-full" />
                    <div className="w-1 h-20 bg-tactical-cyan mx-auto" />
                    <div className="absolute top-12 -left-8 w-20 h-1 bg-tactical-cyan rotate-45" />
                    <div className="absolute top-12 -right-8 w-20 h-1 bg-tactical-cyan -rotate-45" />
                </div>
                <motion.div 
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 0.2, repeat: 999999 }}
                    className="relative"
                >
                    <div className="w-10 h-10 border-4 border-red-500 rounded-full" />
                    <div className="w-1 h-20 bg-red-500 mx-auto" />
                    <div className="absolute top-12 -left-8 w-20 h-1 bg-red-500" />
                </motion.div>
            </motion.div>
            <div className="absolute top-1/2 w-full h-px bg-white/10" />
        </div>
    );
}

function CyberPulseEffect() {
    return (
        <div className="w-full h-full flex items-center justify-center bg-slate-950">
            <motion.div
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 0.8, repeat: 999999 }}
            >
                <Activity size={200} className="text-red-500 shadow-[0_0_50px_#ef4444]" />
            </motion.div>
        </div>
    );
}

function HyperLoopEffect() {
    return (
        <div className="w-full h-full bg-black flex items-center justify-center overflow-hidden">
            {Array.from({ length: 20 }).map((_, i) => (
                <motion.div 
                    key={i}
                    initial={{ scale: 0, opacity: 1 }}
                    animate={{ scale: 5, opacity: 0 }}
                    transition={{ duration: 1.5, repeat: 999999, delay: i * 0.1, ease: "easeIn" }}
                    className="absolute border-2 border-tactical-cyan rounded-full w-40 h-40"
                />
            ))}
        </div>
    );
}

function NeuralSyncEffect() {
    return (
        <div className="w-full h-full bg-slate-950 p-20 grid grid-cols-5 grid-rows-5 gap-4">
             {Array.from({ length: 25 }).map((_, i) => (
                 <motion.div 
                    key={i}
                    animate={{ backgroundColor: ["#0f172a", "#0ea5e9", "#0f172a"] }}
                    transition={{ duration: 1, delay: Math.random() * 2, repeat: 999999 }}
                    className="rounded-full shadow-inner border border-slate-800 flex items-center justify-center"
                 >
                    <Cpu size={12} className="text-white/20" />
                 </motion.div>
             ))}
        </div>
    );
}

function CodeVortexEffect() {
    return (
        <div className="w-full h-full flex items-center justify-center bg-black overflow-hidden relative">
            <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: 999999, ease: "linear" }}
                className="text-tactical-cyan text-xs font-mono grid grid-cols-10 gap-x-40"
            >
                {Array.from({ length: 100 }).map((_, i) => (
                    <div key={i}>{Math.random().toString(36).substring(7)}</div>
                ))}
            </motion.div>
        </div>
    );
}

function GlitchFaceEffect() {
    return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-red-950/20">
            <motion.div 
                animate={{ x: [-2, 2, -1, 3, -2], filter: ["blur(0px)", "blur(10px)", "blur(0px)"] }}
                transition={{ duration: 0.1, repeat: 999999 }}
            >
                <Eye size={200} className="text-red-500" />
            </motion.div>
            <div className="text-red-500 text-4xl font-black italic animate-pulse mt-8">I_SEE_EVERYTHING</div>
        </div>
    );
}

function SignalInterferenceEffect() {
    return (
        <div className="w-full h-full overflow-hidden relative bg-slate-900">
            <div className="absolute inset-0 bg-white opacity-5 mix-blend-overlay animate-pulse" />
            <motion.div 
                animate={{ y: [-100, 100] }}
                transition={{ duration: 0.05, repeat: 999999 }}
                className="absolute w-full h-1 bg-white/20"
            />
            <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white text-9xl font-black italic tracking-tighter opacity-10">NO_SIGNAL</span>
            </div>
        </div>
    );
}

function OrbitalStrikeEffect() {
    return (
        <div className="w-full h-full bg-slate-950 flex items-center justify-center">
             <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: ["0%", "100%", "0%"], opacity: [0, 1, 0] }}
                transition={{ duration: 1, repeat: 999999 }}
                className="w-1 bg-white shadow-[0_0_50px_white]"
             />
             <motion.div 
                animate={{ scale: [0, 2], opacity: [1, 0] }}
                transition={{ duration: 1, repeat: 999999 }}
                className="absolute bottom-0 w-80 h-20 bg-white blur-xl rounded-full"
             />
        </div>
    );
}

function DataErasureEffect() {
    return (
        <div className="w-full h-full flex flex-col p-20 gap-4 bg-slate-950 font-mono">
            {Array.from({ length: 15 }).map((_, i) => (
                <div key={i} className="flex gap-2">
                    <div className="text-red-500 text-xs font-black">[DELETING]</div>
                    <motion.div 
                        initial={{ width: "100%" }}
                        animate={{ width: "0%" }}
                        transition={{ duration: 0.5, delay: i * 0.1, repeat: 999999 }}
                        className="bg-slate-800 h-4 flex-1"
                    />
                </div>
            ))}
        </div>
    );
}

function FirewallBreachEffect() {
    return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-orange-950 relative overflow-hidden">
             {Array.from({ length: 50 }).map((_, i) => (
                 <motion.div 
                    key={i}
                    animate={{ y: [0, -500], opacity: [1, 0], scale: [1, 2] }}
                    transition={{ duration: 2, delay: Math.random() * 2, repeat: 999999 }}
                    className="absolute bg-orange-500 w-2 h-2 rounded-full"
                    style={{ left: Math.random() * 100 + "%", bottom: "-10%" }}
                 />
             ))}
             <ShieldAlert size={150} className="text-orange-500 relative z-10 animate-bounce" />
             <div className="text-orange-500 font-black text-4xl mt-4">FIREWALL_CRITICAL</div>
        </div>
    );
}

function GridLockEffect() {
    return (
        <div className="grid grid-cols-10 grid-rows-10 w-full h-full p-20 bg-slate-950">
             {Array.from({ length: 100 }).map((_, i) => (
                 <motion.div 
                    key={i}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.1, delay: Math.random() * 3, repeat: 999999 }}
                    className="border border-tactical-cyan/20 bg-tactical-cyan/5"
                 />
             ))}
        </div>
    );
}

function VectorFieldEffect() {
    return (
        <div className="w-full h-full relative overflow-hidden bg-slate-950">
             {Array.from({ length:100 }).map((_, i) => (
                 <motion.div 
                    key={i}
                    animate={{ rotate: 360, x: [0, 50, 0] }}
                    transition={{ duration: 5, repeat: 999999 }}
                    className="absolute"
                    style={{ 
                        left: (i % 10) * 10 + "%", 
                        top: Math.floor(i / 10) * 10 + "%" 
                    }}
                >
                    <ArrowRight size={16} className="text-tactical-cyan/20" />
                </motion.div>
             ))}
        </div>
    );
}

function BioHazardEffect() {
    return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-lime-950/20">
             <AlertTriangle size={200} className="text-lime-500/80 animate-pulse shadow-[0_0_100px_#84cc16]" />
             <motion.div 
                animate={{ opacity: [0, 1, 0], scale: [0.8, 1.2, 0.8] }}
                transition={{ duration: 2, repeat: 999999 }}
                className="text-lime-500 font-black text-6xl mt-8 tracking-tighter"
             >
                BIO_ASYNC_ERROR
             </motion.div>
        </div>
    );
}

function PrismShiftEffect() {
    return (
        <div className="w-full h-full relative overflow-hidden bg-black">
             <div className="absolute inset-0 flex flex-col gap-0">
                {Array.from({ length: 10 }).map((_, i) => (
                    <motion.div 
                        key={i} 
                        animate={{ filter: ["hue-rotate(0deg)", "hue-rotate(360deg)"], x: [-20, 20, -20] }}
                        transition={{ duration: 5, delay: i * 0.1, repeat: 999999 }}
                        className="flex-1 bg-gradient-to-r from-red-500 via-green-500 to-blue-500 opacity-20"
                    />
                ))}
             </div>
             <div className="absolute inset-0 flex items-center justify-center">
                 <Box size={150} className="text-white animate-spin" />
             </div>
        </div>
    );
}

function GalaxyCollisionEffect() {
   return (
       <div className="w-full h-full bg-black relative flex items-center justify-center">
            <motion.div 
               animate={{ rotate: 360 }}
               transition={{ duration: 20, repeat: 999999, ease: "linear" }}
               className="relative"
            >
                <div className="w-[800px] h-2 bg-gradient-to-r from-transparent via-blue-500 to-transparent blur-md transform rotate-12" />
                <div className="w-[800px] h-2 bg-gradient-to-r from-transparent via-purple-500 to-transparent blur-md transform -rotate-45" />
            </motion.div>
            <div className="absolute w-40 h-40 bg-white rounded-full blur-3xl opacity-50" />
       </div>
   )
}

function AngelicSymphonyEffect() {
    return (
        <div className="relative w-full h-full flex items-center justify-center bg-white overflow-hidden">
            <motion.div 
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="absolute inset-0 bg-blue-50/50"
            />
            
            {/* Angelic Wings (Stylized) */}
            <div className="relative z-10 flex items-center justify-center">
                <motion.div 
                    initial={{ x: -100, opacity: 0, rotate: -20 }}
                    animate={{ x: -40, opacity: 0.8, rotate: 0 }}
                    transition={{ duration: 2, repeat: 999999, repeatType: "reverse" }}
                    className="w-80 h-[500px] bg-gradient-to-l from-white to-transparent rounded-full blur-2xl"
                />
                <motion.div 
                    initial={{ x: 100, opacity: 0, rotate: 20 }}
                    animate={{ x: 40, opacity: 0.8, rotate: 0 }}
                    transition={{ duration: 2, repeat: 999999, repeatType: "reverse" }}
                    className="w-80 h-[500px] bg-gradient-to-r from-white to-transparent rounded-full blur-2xl"
                />
                
                {/* Central Light */}
                <motion.div 
                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 0.5, repeat: 999999 }}
                    className="absolute w-40 h-40 bg-white rounded-full shadow-[0_0_100px_white] flex items-center justify-center"
                >
                    <Sun size={60} className="text-yellow-200" />
                </motion.div>
            </div>

            {/* Rising Notes */}
            {Array.from({ length: 40 }).map((_, i) => (
                <motion.div
                    key={i}
                    initial={{ y: 500, x: (Math.random() - 0.5) * 1000, opacity: 0 }}
                    animate={{ y: -500, opacity: [0, 1, 0] }}
                    transition={{ duration: 3 + Math.random() * 2, repeat: 999999, delay: Math.random() * 5 }}
                    className="absolute text-blue-300"
                >
                    {i % 2 === 0 ? <Music size={24} /> : <Music2 size={24} />}
                </motion.div>
            ))}

            <div className="absolute bottom-20 z-20">
                <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="text-blue-900 font-black text-2xl tracking-[1em] uppercase italic"
                >
                    ANGELIC_SYMPHONY
                </motion.div>
            </div>
        </div>
    );
}

function LifeformEffect() {
    return (
        <div className="relative w-full h-full flex flex-col items-center justify-center bg-slate-900 border-4 border-tactical-cyan/10">
            <motion.div 
                initial={{ opacity: 0, y: 100 }}
                animate={{ opacity: [0, 1, 0], y: [-50, -100, -150] }}
                transition={{ duration: 4, ease: "easeOut" }}
                className="relative"
            >
                <img 
                    src="https://images.unsplash.com/photo-1535223289827-42f1e9919769?auto=format&fit=crop&q=80&w=800" 
                    alt="Cybernetic Lifeform" 
                    className="w-full h-full object-cover mix-blend-screen opacity-70 grayscale contrast-200"
                    referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
            </motion.div>
            <div className="absolute bottom-20 flex flex-col items-center gap-2">
                <div className="text-[10px] text-green-500 font-black tracking-[1em] animate-pulse">REMOTE_LIFEFORM_DETECTED</div>
            </div>
        </div>
    );
}

function DataFallEffect() {
    return (
        <div className="grid grid-cols-20 gap-2 opacity-40 p-4">
            {Array.from({ length: 400 }).map((_, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0, y: -100 }}
                    animate={{ opacity: [0, 1, 0], y: 500 }}
                    transition={{ duration: Math.random() * 3 + 2, repeat: 999999 }}
                    className="text-[10px] text-tactical-cyan font-black"
                >
                    {Math.floor(Math.random() * 2)}
                </motion.div>
            ))}
        </div>
    );
}

function BinaryWaveEffect() {
    return (
        <div className="flex flex-col items-center justify-center w-full h-full gap-4 overflow-hidden">
            {Array.from({ length: 10 }).map((_, i) => (
                <motion.div
                    key={i}
                    animate={{ x: [-50, 50, -50], opacity: [0.2, 0.6, 0.2] }}
                    transition={{ duration: 3 + i * 0.5, repeat: 999999, ease: "linear" }}
                    className="text-tactical-cyan text-4xl font-black italic select-none"
                >
                    0101100101010101100101011001010101011001
                </motion.div>
            ))}
        </div>
    );
}

function NeonGridEffect() {
    return (
        <div className="relative w-full h-full bg-slate-950 perspective-[500px]">
            <motion.div 
                animate={{ rotateX: [60, 60], rotateY: [0, 0], translateZ: [0, 0] }}
                className="absolute inset-0 flex items-center justify-center"
            >
                <div className="w-[200%] h-[200%] bg-[linear-gradient(to_right,#0ea5e966_1px,transparent_1px),linear-gradient(to_bottom,#0ea5e966_1px,transparent_1px)] bg-[length:50px_50px] animate-[grid-move_2s_linear_infinite]" />
            </motion.div>
            <style>{`
                @keyframes grid-move {
                    0% { transform: translateY(0); }
                    100% { transform: translateY(50px); }
                }
            `}</style>
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black to-transparent" />
        </div>
    );
}

function SatelliteLinkEffect() {
    return (
        <div className="w-full h-full flex flex-col items-center justify-center p-12 gap-8">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 10, repeat: 999999, ease: "linear" }}>
                <Satellite size={120} className="text-tactical-cyan" />
            </motion.div>
            <div className="space-y-2 text-center">
                <div className="text-tactical-cyan text-xs font-black animate-pulse uppercase">UPLINK_STABLE_SCANNING_COORDINATES</div>
                <div className="flex gap-1 justify-center">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <motion.div 
                            key={i}
                            animate={{ height: [10, 30, 10] }}
                            transition={{ duration: 0.5, delay: i * 0.1, repeat: 999999 }}
                            className="w-1 bg-tactical-cyan"
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

function RadarSweepEffect() {
    return (
        <div className="relative w-full h-full flex items-center justify-center">
            <div className="w-80 h-80 rounded-full border-2 border-green-500/30 relative flex items-center justify-center">
                <div className="w-60 h-60 rounded-full border border-green-500/20" />
                <div className="w-40 h-40 rounded-full border border-green-500/10" />
                <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: 999999, ease: "linear" }}
                    className="absolute inset-0 bg-gradient-to-tr from-green-500/50 to-transparent rounded-full origin-center"
                />
                <Radar className="text-green-500 z-10" size={48} />
            </div>
        </div>
    );
}

function EncryptionKeyEffect() {
    return (
        <div className="w-full h-full flex flex-col items-center justify-center gap-12">
            <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: 999999 }}>
                <Key size={100} className="text-yellow-500" />
            </motion.div>
            <div className="grid grid-cols-8 gap-2">
                {"FORGING_MASTER_KEY".split("").map((char, i) => (
                    <motion.div 
                        key={i}
                        animate={{ opacity: [0, 1, 0] }}
                        transition={{ duration: 1, delay: i * 0.1, repeat: 999999 }}
                        className="w-8 h-10 border border-yellow-500/50 flex items-center justify-center text-yellow-500 font-black"
                    >
                        {char}
                    </motion.div>
                ))}
            </div>
        </div>
    );
}

function CircuitFlowEffect() {
    return (
        <div className="w-full h-full bg-slate-950 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
            {Array.from({ length: 15 }).map((_, i) => (
                <motion.div
                    key={i}
                    initial={{ x: -100, y: Math.random() * 100 + "%" }}
                    animate={{ x: "110vw" }}
                    transition={{ duration: Math.random() * 2 + 1, repeat: 999999, delay: Math.random() * 2 }}
                    className="absolute h-px bg-tactical-cyan shadow-[0_0_10px_#0ea5e9]"
                    style={{ width: Math.random() * 200 + 100 + "px" }}
                />
            ))}
            <div className="absolute inset-0 flex items-center justify-center">
                <CircuitBoard size={200} className="text-tactical-cyan opacity-10" />
            </div>
        </div>
    );
}

function VoidEyeEffect() {
    return (
        <div className="w-full h-full flex items-center justify-center bg-black">
            <motion.div
                animate={{ scale: [0.9, 1.1, 0.9], opacity: [0.8, 1, 0.8] }}
                transition={{ duration: 4, repeat: 999999 }}
                className="relative"
            >
                <div className="w-96 h-96 rounded-full bg-slate-900 border-4 border-slate-800 flex items-center justify-center overflow-hidden">
                    <motion.div 
                        animate={{ scale: [1, 1.2, 1] }} 
                        transition={{ duration: 0.2, repeat: 999999, repeatDelay: 3 }}
                        className="w-40 h-40 rounded-full bg-black border-8 border-slate-700 relative"
                    >
                        <div className="absolute inset-4 rounded-full bg-slate-900 blur-sm" />
                    </motion.div>
                </div>
            </motion.div>
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle,transparent_50%,black_100%)]" />
        </div>
    );
}

function SiliconCityEffect() {
    return (
        <div className="w-full h-full bg-slate-950 flex items-center justify-center relative overflow-hidden perspective-[1000px]">
            <motion.div 
                animate={{ rotateY: [0, 360] }}
                transition={{ duration: 20, repeat: 999999, ease: "linear" }}
                className="flex gap-4 items-end"
            >
                {Array.from({ length: 20 }).map((_, i) => (
                    <motion.div
                        key={i}
                        className="w-8 border-t-2 border-x-2 border-tactical-cyan/40 bg-tactical-cyan/5"
                        style={{ height: Math.random() * 200 + 50 + "px" }}
                    />
                ))}
            </motion.div>
            <div className="absolute inset-x-0 bottom-0 h-px bg-tactical-cyan shadow-[0_0_20px_#0ea5e9]" />
        </div>
    );
}

function FractalGrowthEffect() {
    return (
        <div className="w-full h-full flex items-center justify-center bg-slate-900">
            <motion.div
                animate={{ rotate: 360, scale: [1, 1.5, 1] }}
                transition={{ duration: 10, repeat: 999999, ease: "linear" }}
            >
                <Layers size={100} className="text-emerald-500" />
            </motion.div>
            <div className="absolute inset-0 flex items-center justify-center">
                {Array.from({ length: 8 }).map((_, i) => (
                    <motion.div
                        key={i}
                        animate={{ rotate: i * 45, scale: [1, 2, 1], opacity: [0.1, 0.4, 0.1] }}
                        transition={{ duration: 5, repeat: 999999, delay: i * 0.5 }}
                        className="absolute border border-emerald-500/30 w-80 h-80"
                    />
                ))}
            </div>
        </div>
    );
}

function DroneSurveillanceEffect() {
    return (
        <div className="w-full h-full bg-black relative flex flex-col items-center justify-center">
            <motion.div 
                animate={{ x: [-1, 1, -1], y: [1, -1, 1] }}
                transition={{ duration: 0.05, repeat: 999999 }}
                className="w-full h-full absolute inset-0 bg-[url('https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&q=80&w=1200')] opacity-30 grayscale"
                referrerPolicy="no-referrer"
            />
            <div className="relative z-10 w-full h-full border-[40px] border-black flex flex-col justify-between p-8">
                <div className="flex justify-between items-start">
                    <div className="border-l-4 border-t-4 border-red-500 w-12 h-12" />
                    <div className="flex flex-col items-center text-red-500 font-black">
                        <Camera size={40} className="animate-pulse" />
                        <span className="text-xs">REC_07:44:21</span>
                    </div>
                    <div className="border-r-4 border-t-4 border-red-500 w-12 h-12" />
                </div>
                <div className="flex justify-between items-end">
                    <div className="border-l-4 border-b-4 border-red-500 w-12 h-12" />
                    <div className="text-[10px] text-red-500 font-bold tracking-widest uppercase">TARGET_LOCKED: UNKNOWN_ENTITY</div>
                    <div className="border-r-4 border-b-4 border-red-500 w-12 h-12" />
                </div>
            </div>
        </div>
    );
}

function DnaSequenceEffect() {
    return (
        <div className="w-full h-full flex items-center justify-center gap-4 py-20 bg-slate-950">
            {Array.from({ length: 20 }).map((_, i) => (
                <div key={i} className="flex flex-col items-center gap-8 relative">
                    <motion.div 
                        animate={{ y: [0, 100, 0] }}
                        transition={{ duration: 2, delay: i * 0.1, repeat: 999999 }}
                        className="w-4 h-4 rounded-full bg-tactical-cyan shadow-[0_0_10px_#0ea5e9]"
                    />
                    <div className="w-[1px] h-24 bg-slate-800" />
                    <motion.div 
                        animate={{ y: [0, -100, 0] }}
                        transition={{ duration: 2, delay: i * 0.1, repeat: 999999 }}
                        className="w-4 h-4 rounded-full bg-red-500 shadow-[0_0_10px_#ef4444]"
                    />
                </div>
            ))}
        </div>
    );
}

function QuantumBitEffect() {
    return (
        <div className="w-full h-full flex items-center justify-center bg-slate-900 border-x-[100px] border-slate-950">
            <motion.div
                animate={{ rotateX: 360, rotateY: 360, rotateZ: 360 }}
                transition={{ duration: 5, repeat: 999999, ease: "linear" }}
                className="w-40 h-40 border-4 border-tactical-cyan relative perspective-[500px]"
            >
                <div className="absolute inset-0 bg-tactical-cyan/10 blur-xl" />
                <Atom size={100} className="text-tactical-cyan absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </motion.div>
        </div>
    );
}

function CorePulseEffect() {
    return (
        <div className="w-full h-full flex items-center justify-center bg-slate-950 p-20">
            <div className="w-full max-w-2xl h-80 border-2 border-tactical-cyan/30 rounded-xl relative flex items-center justify-center overflow-hidden">
                <motion.div 
                    animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 1, repeat: 999999 }}
                    className="absolute inset-10 bg-tactical-cyan/5 rounded-lg flex items-center justify-center"
                >
                    <Activity size={180} className="text-tactical-cyan" />
                </motion.div>
                <div className="absolute bottom-4 left-4 text-[10px] text-tactical-cyan font-black flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-tactical-cyan animate-ping" />
                    CPU_LOAD: OPTIMAL // TEMP: 42.1C
                </div>
            </div>
        </div>
    );
}

function TimeFluxEffect() {
    return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 gap-8">
            <div className="relative">
                <Clock size={160} className="text-tactical-cyan opacity-20" />
                <motion.div 
                    animate={{ rotate: 360 * 10 }}
                    transition={{ duration: 5, repeat: 999999, ease: "easeInOut" }}
                    className="absolute top-1/2 left-1/2 w-32 h-[2px] bg-tactical-cyan origin-left -translate-y-1/2"
                />
            </div>
            <div className="text-6xl font-black italic text-tactical-cyan tabular-nums">
                <motion.span
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 0.1, repeat: 999999 }}
                >
                    00:00:00:00
                </motion.span>
            </div>
        </div>
    );
}

function StarsZoomEffect() {
    return (
        <div className="w-full h-full bg-black relative overflow-hidden flex items-center justify-center">
            {Array.from({ length: 150 }).map((_, i) => (
                <motion.div
                    key={i}
                    initial={{ x: 0, y: 0, scale: 0 }}
                    animate={{ 
                        x: (Math.random() - 0.5) * window.innerWidth * 2, 
                        y: (Math.random() - 0.5) * window.innerHeight * 2,
                        scale: [0, 1] 
                    }}
                    transition={{ duration: 0.5, repeat: 999999, repeatDelay: Math.random(), delay: Math.random() }}
                    className="absolute w-1 h-1 bg-white rounded-full"
                />
            ))}
            <Rocket size={100} className="text-white animate-bounce relative z-10" />
        </div>
    );
}

function PulsarEffect() {
    return (
        <div className="w-full h-full flex items-center justify-center bg-black">
            <motion.div
                animate={{ 
                    scale: [1, 5, 1],
                    opacity: [0.1, 1, 0.1]
                }}
                transition={{ duration: 2, repeat: 999999 }}
                className="w-40 h-40 bg-white rounded-full blur-3xl"
            />
            <Sun size={80} className="text-white relative z-10" />
        </div>
    );
}

function NeuralMapEffect() {
    return (
        <div className="w-full h-full bg-slate-950 p-20 relative">
            <div className="grid grid-cols-6 grid-rows-6 gap-8 w-full h-full">
                {Array.from({ length: 36 }).map((_, i) => (
                    <motion.div 
                        key={i}
                        animate={{ opacity: [0.2, 0.8, 0.2] }}
                        transition={{ duration: Math.random() * 2 + 1, repeat: 999999 }}
                        className="w-full h-full bg-tactical-cyan/5 border border-tactical-cyan/20 rounded flex items-center justify-center"
                    >
                        <Share2 size={24} className="text-tactical-cyan/30" />
                    </motion.div>
                ))}
            </div>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <Box size={300} className="text-tactical-cyan opacity-10 animate-spin" />
            </div>
        </div>
    );
}

function FrostStaticEffect() {
    return (
        <div className="w-full h-full bg-slate-100 flex flex-col items-center justify-center gap-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/brushed-alum.png')] opacity-20" />
            <motion.div
                animate={{ opacity: [0.3, 0.7, 0.3], x: [-5, 5, -5] }}
                transition={{ duration: 0.1, repeat: 999999 }}
                className="text-slate-900 font-black text-8xl italic uppercase select-none"
            >
                SYSTEM_FROZEN
            </motion.div>
            <Wind size={100} className="text-slate-400 animate-pulse" />
        </div>
    );
}

function VolcanicDebugEffect() {
    return (
        <div className="w-full h-full bg-orange-950/20 flex flex-col items-center justify-center gap-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-[linear-gradient(to_bottom,#7c2d12_1px,transparent_1px)] bg-[length:100%_4px] opacity-20" />
            <motion.div
                animate={{ y: [0, -10, 0], scale: [1, 1.05, 1] }}
                transition={{ duration: 0.1, repeat: 999999 }}
                className="text-orange-600 font-black text-6xl uppercase italic tracking-tighter"
            >
                CRITICAL_OVERHEAT
            </motion.div>
            <Mountain size={120} className="text-orange-700 animate-bounce" />
            <div className="grid grid-cols-4 gap-4 max-w-md w-full">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-2 bg-orange-900/50 rounded-full overflow-hidden">
                        <motion.div 
                            animate={{ width: ["0%", "100%", "0%"] }}
                            transition={{ duration: 0.5, delay: i * 0.1, repeat: 999999 }}
                            className="h-full bg-orange-500"
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}

function CelestialSyncEffect() {
    return (
        <div className="w-full h-full bg-indigo-950 flex flex-col items-center justify-center relative overflow-hidden">
            <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 30, repeat: 999999, ease: "linear" }}
                className="absolute inset-[-50%] bg-[radial-gradient(circle,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[length:50px_50px]"
            />
            <div className="relative z-10 flex flex-col items-center gap-8">
                <div className="w-48 h-48 rounded-full border-2 border-indigo-400/30 flex items-center justify-center p-4">
                    <Globe size={120} className="text-indigo-300 animate-spin" />
                </div>
                <div className="text-indigo-200 text-xs font-black tracking-[1em] uppercase animate-pulse">SYNCHRONIZING_WITH_CELESTIAL_NODES</div>
            </div>
        </div>
    );
}

function DeepSeaLinkEffect() {
    return (
        <div className="w-full h-full bg-[#00040a] flex flex-col items-center justify-center p-20 gap-12 relative overflow-hidden">
            <motion.div
                animate={{ opacity: [0.1, 0.3, 0.1], scale: [1, 1.1, 1] }}
                transition={{ duration: 5, repeat: 999999 }}
                className="absolute inset-0 bg-[radial-gradient(circle,rgba(2,132,199,0.2)_0%,transparent_70%)]"
            />
            <div className="relative z-10 flex flex-col items-center gap-4">
                <div className="w-32 h-32 rounded-full border border-sky-500/20 flex items-center justify-center">
                    <motion.div
                        animate={{ opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 2, repeat: 999999 }}
                    >
                        <ZapIcon size={64} className="text-sky-400" />
                    </motion.div>
                </div>
                <div className="text-sky-500 text-[10px] font-black uppercase tracking-widest text-center">SUB_OCEANIC_FIBER_ESTABLISHED</div>
                <div className="w-full max-w-xs h-1 bg-sky-900 overflow-hidden rounded-full mt-4">
                    <motion.div 
                        animate={{ x: ["-100%", "100%"] }}
                        transition={{ duration: 3, repeat: 999999, ease: "linear" }}
                        className="w-1/3 h-full bg-sky-400 shadow-[0_0_10px_#38bdf8]"
                    />
                </div>
            </div>
        </div>
    );
}

function FlushEffect() {
  return (
    <div className="grid grid-cols-12 gap-1 opacity-20 p-4">
      {Array.from({ length: 144 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: [0, 1, 1, 0], y: 20 }}
          transition={{ 
            duration: Math.max(0.1, Math.random() * 2 + 1), 
            repeat: 999999, 
            repeatType: "loop"
          }}
          className="text-[8px] text-green-500 font-bold"
        >
          {Math.random().toString(16).substring(2, 6)}
        </motion.div>
      ))}
    </div>
  );
}

function SpikeEffect() {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <motion.div
        animate={{ 
            scale: [1, 2, 1.5, 3, 1],
            rotate: [0, 90, 180, 270, 360],
            opacity: [0.5, 1, 0.5, 1, 0.5]
        }}
        transition={{ 
          duration: 0.5, 
          repeat: 999999,
          ease: "linear"
        }}
        className="text-tactical-cyan"
      >
        <Zap size={200} strokeWidth={1} />
      </motion.div>
      <div className="absolute inset-0 bg-blue-500/10 animate-pulse" />
    </div>
  );
}

function GhostEffect() {
    return (
      <div className="relative w-full h-full flex items-center justify-center">
        <motion.div
          animate={{ x: [-10, 10, -10], opacity: [0.3, 0.7, 0.3] }}
          transition={{ 
            duration: 0.2, // Slightly slower to be safer
            repeat: 999999,
            repeatType: "mirror"
          }}
          className="flex flex-col items-center gap-4"
        >
          <ShieldAlert size={120} className="text-red-500" />
          <div className="text-red-500 font-black text-4xl italic uppercase">GHOST_DETECTED</div>
        </motion.div>
      </div>
    );
}

function BreachEffect() {
  return (
    <div className="relative w-full h-full bg-slate-950 overflow-hidden flex items-center justify-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 20 }}
        transition={{ duration: 3, ease: 'easeIn' }}
        className="w-40 h-40 rounded-full bg-purple-600/20 blur-3xl"
      />
      <div className="relative z-10 flex flex-col items-center">
        <Globe className="text-purple-500 animate-spin" size={100} />
        <div className="mt-4 text-[10px] text-purple-400 font-bold tracking-[1em]">VOID_SYNCHRONIZATION</div>
      </div>
    </div>
  );
}

function OmegaEffect() {
  return (
    <div className="w-full h-full bg-red-950/20 flex flex-col items-center justify-center">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
      <motion.div
        animate={{ filter: ['hue-rotate(0deg)', 'hue-rotate(360deg)'] }}
        transition={{ 
          duration: 2, // Slower for stability
          repeat: 999999,
          ease: "linear"
        }}
        className="relative"
      >
        <ShieldAlert size={300} className="text-red-600" strokeWidth={0.5} />
      </motion.div>
      <div className="mt-8 space-y-2 text-center">
        <div className="text-red-600 text-6xl font-black uppercase italic tracking-tighter animate-bounce">CRITICAL_FAIL</div>
        <div className="text-red-400 font-mono text-xs max-w-md">MEM_CORRUPTION_AT_0x7FF_SYSTEM_HALTED</div>
      </div>
    </div>
  );
}

function SingularityEffect() {
    return (
      <div className="w-full h-full bg-black flex items-center justify-center relative overflow-hidden">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: [0, 1, 0.8, 50], opacity: [0, 1, 1, 1] }}
          transition={{ duration: 7, times: [0, 0.1, 0.8, 1] }}
          className="w-1 h-1 bg-white rounded-full relative"
        >
           <motion.div 
             animate={{ scale: [1, 2, 1], opacity: [0.5, 0, 0.5] }}
             transition={{ 
               duration: 2, 
               repeat: 999999,
               ease: "easeInOut"
             }}
             className="absolute inset-0 bg-white rounded-full blur-xl"
           />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0, 1, 0] }}
          transition={{ duration: 7, times: [0, 0.7, 0.8, 1] }}
          className="absolute inset-0 flex flex-col items-center justify-center"
        >
           <Infinity size={100} className="text-white mb-4" />
           <div className="text-white text-xs font-black tracking-[2em] uppercase">INFINITE_LOOP</div>
        </motion.div>

        {/* Floating particles */}
        {Array.from({ length: 100 }).map((_, i) => (
            <motion.div
                key={i}
                initial={{ 
                    x: Math.random() * window.innerWidth - window.innerWidth/2, 
                    y: Math.random() * window.innerHeight - window.innerHeight/2,
                    opacity: 0 
                }}
                animate={{ 
                    x: 0, 
                    y: 0,
                    opacity: [0, 1, 0]
                }}
                transition={{ duration: 6, delay: Math.random() * 2 }}
                className="absolute w-px h-px bg-white"
            />
        ))}
      </div>
    );
}
