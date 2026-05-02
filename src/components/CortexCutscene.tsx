import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { audioService } from '../services/audioService';
import { ShieldAlert, Zap, Globe, Infinity as InfinityIcon, Scan, Cpu, Eye, Activity, HardDrive, Smartphone, Search, Share2, Repeat, Layers, Box, Camera, Database, Hash, Play, Wind, Sun, Satellite, Radar, Key, CircuitBoard, Atom, Clock, Rocket, Mountain, ArrowRight, AlertTriangle, User, Music, Music2, ExternalLink, Ghost, RotateCw, Unlink, Network, Terminal, Lock, Unlock, FileCode, Dice5, CloudRain, Radio, Signal } from 'lucide-react';

// --- VIDEO SOURCES CONFIGURATION ---
// REPLACE THESE WITH CLOUDINARY OR FIREBASE STORAGE URLS TO BYPASS SCHOOL BLOCKS & NETLIFY LIMITS
// Example: "https://res.cloudinary.com/yourname/video/upload/v12345/angelic_symphony.mp4"
const VIDEO_SOURCES = {
  ANONYMOUS_DEITY: "https://res.cloudinary.com/dad1nkuof/video/upload/v1/videoplayback_6_gideou.mp4",
  ANGELIC_SYMPHONY: "https://res.cloudinary.com/dad1nkuof/video/upload/v1/videoplayback_2_hkdudn.mp4",
  ETERNAL_OPPRESSION: "https://res.cloudinary.com/dad1nkuof/video/upload/v1/videoplayback_5_online-video-cutter.com_vjopio.mp4",
  SUPREME_SOVEREIGN: "https://res.cloudinary.com/dad1nkuof/video/upload/v1/videoplayback_5_online-video-cutter.com_1_wrfhem.mp4"
};
// -----------------------------------

interface CutsceneProps {
  onComplete: (rarity: string) => void;
  forcedType?: string;
}

type CutsceneType = 
  | 'FLUSH' | 'SPIKE' | 'BREACH' | 'GHOST' | 'DATA_FALL' | 'BINARY_WAVE' | 'SYSTEM_SCAN' | 'NOISE' | 'PIXEL_DRIFT' | 'GLITCH_STORM' | 'TICKER_TAPE' | 'HEX_DUMP'
  | 'VISAGE' | 'LIFEFORM' | 'SATELLITE_LINK' | 'RADAR_SWEEP' | 'ENCRYPTION_KEY' | 'HYPER_LOOP' | 'NEURAL_SYNC' | 'DATA_ERASURE' | 'FIREWALL_BREACH' | 'GRID_LOCK' | 'VECTOR_FIELD' | 'STATIC_RAIN' | 'PULSE_WIDTH' | 'MIRROR_EDGE'
  | 'VOID_EYE' | 'SILICON_CITY' | 'FRACTAL_GROWTH' | 'DRONE_SURVEILLANCE' | 'CODE_VORTEX' | 'GLITCH_FACE' | 'BIO_HAZARD' | 'NEON_GHOST' | 'ORBITAL_STRIKE' | 'SYNTH_WAVE' | 'CHRONO_TRIGGER' | 'CELESTIAL_SYNC'
  | 'OMEGA' | 'QUANTUM_BIT' | 'CORE_PULSE' | 'TIME_FLUX' | 'STARS_ZOOM' | 'VOLCANIC_DEBUG' | 'SINGULARITY' | 'PRISM_SHIFT' | 'GALAXY_COLLISION' | 'SOLAR_FLARE' | 'VOID_TRESPASS'
  | 'ANGELIC_SYMPHONY' | 'ETERNAL_OPPRESSION' | 'SUPREME_SOVEREIGN' | 'ANONYMOUS_DEITY'
  | 'COBALT_REIGN' | 'EMERALD_MIST' | 'SCARLET_STORM' | 'VIOLET_VORTEX' | 'AMBER_AWAKENING' | 'MAGENTA_MATRIX'
  | 'CYAN_CORE' | 'SILVER_SHADOW' | 'GOLDEN_GATEWAY' | 'BRONZE_BEAM' | 'OBSIDIAN_OVERLAY' | 'TITANIUM_TRACE'
  | 'PLATINUM_PULSE' | 'STEEL_SURGE' | 'IRON_INITIATIVE' | 'COPPER_CIRCUIT' | 'QUARTZ_QUAKE' | 'RUBY_RESONANCE' | 'SAPPHIRE_SCAN' | 'TOPAZ_TRANSMISSION'
  | 'JADE_JUNCTION' | 'PEARL_PROTOCOL' | 'OPAL_OSCILLATION' | 'GARNET_GRID' | 'ONYX_OUTBREAK' | 'ZIRCON_ZERO' | 'PYRITE_PATTERN' | 'CORAL_COMMAND' | 'METEOR_MIND' | 'COMET_CRASH'
  | 'NEBULA_NOVA' | 'SUPERNOVA_SOUL' | 'QUASAR_QUAKE' | 'BEYOND_BOUNDARY' | 'INFINITY_INIT' | 'ETERNITY_EDGE' | 'COSMOS_CORE'
  | 'GLITCH_GHOST' | 'MALWARE_MIST' | 'VIRUS_VORTEX' | 'TROJAN_TRACE' | 'ROOTKIT_REIGN' | 'EXPLOIT_EYE' | 'ZERO_DAY_ZONE'
  | 'PIXEL_PULSE' | 'VOXEL_VOID' | 'MESH_MATRIX' | 'VERTEX_VECTOR' | 'SHADER_SHADOW' | 'RENDER_REIGN' | 'TEXTURE_TRACE' | 'LIGHT_LINK'
  | 'SIGNAL_SOFT' | 'WAVE_WARP' | 'PULSE_PART' | 'BIT_BEAT' | 'BYTE_BURST' | 'CHIP_CIRCUIT' | 'WIRE_WAVE' | 'FLOW_FIELD'
  | 'PULSE_PRIME' | 'VOID_VELOCITY' | 'NEURAL_NEXUS' | 'CYBER_CRUCIBLE' | 'SILICON_STORM' | 'DATA_DREDGE' | 'BINARY_BLAST' | 'VECTOR_VORTEX' | 'FLUX_FIELD' | 'LOGIC_LEAK' | 'CORE_CRASH' | 'SHELL_SHOCK' | 'BIT_BOUNCE' | 'LINK_LOSS' | 'NET_NODE'
  | 'CHAMELEON_SHIFT' | 'GRAVITY_WELL' | 'NEBULA_DRIFT' | 'COSMIC_RAYS' | 'PHOTON_BURST' 
  | 'DARK_ENERGY' | 'STRING_VIBRATION' | 'WORMHOLE_ENTRY' | 'BLACK_HOLE_SINGULARITY' | 'PULSE_MODULATION' 
  | 'HEARTBEAT_MONITOR' | 'RADAR_PING' | 'SONAR_SWEEP' | 'THERMAL_VISION' | 'NIGHT_MODE'
  | 'NEON_GRID' | 'CIRCUIT_FLOW' | 'DNA_SEQUENCE' | 'PULSAR' | 'NEURAL_MAP' | 'FROST_STATIC' | 'DEEP_SEA_LINK'
  | 'STICK_FIGHT' | 'CYBER_PULSE' | 'SIGNAL_INTERFERENCE' | 'PLASMA_STORM' | 'GHOST_PROTOCOL' | 'ZENITH_POINT' 
  | 'NADIR_COLLAPSE' | 'ORBITAL_DESCENT' | 'ATMOSPHERIC_ENTRY' | 'DEEP_CORE_SCAN' | 'NEURAL_REWIRE' 
  | 'QUANTUM_LEAP' | 'BINARY_FISSION' | 'SUPERNOVA_REMNANT' | 'DARK_MATTER_HUNT' | 'DIMENSIONAL_SHIFT' 
  | 'EVENT_HORIZON' | 'WHITE_HOLE_EMISSION';

export default function CortexCutscene({ onComplete, forcedType }: CutsceneProps) {
  const [type, setType] = useState<CutsceneType | null>(forcedType as CutsceneType || null);
  const [status, setStatus] = useState<'ACTIVE' | 'DISPLAY_RARITY'>('ACTIVE');
  const [rarityText, setRarityText] = useState(forcedType ? 'ADMIN_OVERRIDE (FORCED_RESTORE)' : '');
  const audioInitialized = useRef(false);
  
  useEffect(() => {
    // If type is already set and matches forcedType (or no forcedType is pending), we check if we need to initialize
    const isInitialRun = !type || (forcedType && type === forcedType && rarityText === 'ADMIN_OVERRIDE (FORCED_RESTORE)' && !audioInitialized.current);
    
    if (!isInitialRun && type && !forcedType) return;
    if (!isInitialRun && forcedType && type === forcedType) return;

    if (forcedType) {
        setStatus('ACTIVE');
    }
    
    audioInitialized.current = true;

    // Total pool of 1,000,000
    const rand = Math.random() * 1000000;
    let selected: CutsceneType = type || 'FLUSH';
    let text = rarityText || '';

    if (forcedType) {
        selected = forcedType as CutsceneType;
        text = 'ADMIN_OVERRIDE (FORCED_RESTORE)';
    } else if (!type) {
    // Tiers (Odds adjusted for more accessibility while remaining rare)
        if (rand < 500) {
          selected = 'ANONYMOUS_DEITY';
          text = '1 in 1,000,000,000 (GHOST_IN_THE_SHELL) [ANONYMOUS_DEITY]';
        } else if (rand < 1500) { 
          selected = 'ANGELIC_SYMPHONY';
          text = '1 in 10,000 (CELESTIAL_INTERVENTION) [ANGELIC_SYMPHONY]';
        } else if (rand < 2500) { 
          selected = 'SUPREME_SOVEREIGN';
          text = '1 in 750,000,000 (ABSOLUTE_AUTHORITY) [SUPREME_SOVEREIGN]';
        } else if (rand < 4500) {
          selected = 'ETERNAL_OPPRESSION';
          text = '1 in 5,000 (THE_UNAVOIDABLE_TRUTH) [ETERNAL_OPPRESSION]';
        } else if (rand < 10000) { 
          selected = 'SINGULARITY';
          text = '1 in 1,000 (THE_SINGULARITY_REACHED) [SINGULARITY]';
        } else if (rand < 60000) { 
          const epicPool: CutsceneType[] = [
            'OMEGA', 'QUANTUM_BIT', 'CORE_PULSE', 'TIME_FLUX', 'STARS_ZOOM', 
            'VOLCANIC_DEBUG', 'PRISM_SHIFT', 'GALAXY_COLLISION', 'SOLAR_FLARE', 'VOID_TRESPASS',
            'BLACK_HOLE_SINGULARITY', 'WORMHOLE_ENTRY', 'DARK_ENERGY', 'SUPERNOVA_REMNANT', 'EVENT_HORIZON', 'WHITE_HOLE_EMISSION',
            'JADE_JUNCTION', 'PEARL_PROTOCOL', 'OPAL_OSCILLATION', 'GARNET_GRID', 'ONYX_OUTBREAK', 'ZIRCON_ZERO', 'PYRITE_PATTERN', 'CORAL_COMMAND', 'METEOR_MIND', 'COMET_CRASH',
            'NEBULA_NOVA', 'SUPERNOVA_SOUL', 'QUASAR_QUAKE', 'BEYOND_BOUNDARY', 'INFINITY_INIT', 'ETERNITY_EDGE', 'COSMOS_CORE',
            'PULSE_PRIME', 'VOID_VELOCITY', 'NEURAL_NEXUS'
          ];
          selected = epicPool[Math.floor(Math.random() * epicPool.length)];
          text = `1 IN 500 (EPIC_${selected}_PROTOCOL)`;
        } else if (rand < 200000) { 
          const rarePool: CutsceneType[] = [
            'VOID_EYE', 'SILICON_CITY', 'FRACTAL_GROWTH', 'DRONE_SURVEILLANCE', 
            'CODE_VORTEX', 'GLITCH_FACE', 'BIO_HAZARD', 'NEON_GHOST', 'ORBITAL_STRIKE', 'SYNTH_WAVE', 'CHRONO_TRIGGER', 'CELESTIAL_SYNC',
            'GRAVITY_WELL', 'NEBULA_DRIFT', 'COSMIC_RAYS', 'PHOTON_BURST', 'STRING_VIBRATION', 'QUANTUM_LEAP', 'DIMENSIONAL_SHIFT', 'DARK_MATTER_HUNT', 'ZENITH_POINT', 'NADIR_COLLAPSE',
            'PLATINUM_PULSE', 'STEEL_SURGE', 'IRON_INITIATIVE', 'COPPER_CIRCUIT', 'QUARTZ_QUAKE', 'RUBY_RESONANCE', 'SAPPHIRE_SCAN', 'TOPAZ_TRANSMISSION',
            'GLITCH_GHOST', 'MALWARE_MIST', 'VIRUS_VORTEX', 'TROJAN_TRACE', 'ROOTKIT_REIGN', 'EXPLOIT_EYE', 'ZERO_DAY_ZONE',
            'CYBER_CRUCIBLE', 'SILICON_STORM', 'DATA_DREDGE', 'BINARY_BLAST'
          ];
          selected = rarePool[Math.floor(Math.random() * rarePool.length)];
          text = `1 IN 100 (RARE_${selected}_EVENT)`;
        } else if (rand < 550000) { 
          const uncommonPool: CutsceneType[] = [
            'VISAGE', 'LIFEFORM', 'SATELLITE_LINK', 'RADAR_SWEEP', 'ENCRYPTION_KEY', 
            'HYPER_LOOP', 'NEURAL_SYNC', 'DATA_ERASURE', 'FIREWALL_BREACH', 'GRID_LOCK', 'VECTOR_FIELD',
            'STATIC_RAIN', 'PULSE_WIDTH', 'MIRROR_EDGE', 'PULSE_MODULATION', 'HEARTBEAT_MONITOR', 'RADAR_PING', 'SONAR_SWEEP', 'THERMAL_VISION', 'NIGHT_MODE',
            'NEURAL_REWIRE', 'DEEP_CORE_SCAN', 'ATMOSPHERIC_ENTRY', 'ORBITAL_DESCENT', 'PLASMA_STORM', 'GHOST_PROTOCOL', 'CELESTIAL_SYNC',
            'CYAN_CORE', 'SILVER_SHADOW', 'GOLDEN_GATEWAY', 'BRONZE_BEAM', 'OBSIDIAN_OVERLAY', 'TITANIUM_TRACE',
            'PIXEL_PULSE', 'VOXEL_VOID', 'MESH_MATRIX', 'VERTEX_VECTOR', 'SHADER_SHADOW', 'RENDER_REIGN', 'TEXTURE_TRACE', 'LIGHT_LINK',
            'VECTOR_VORTEX', 'FLUX_FIELD', 'LOGIC_LEAK', 'CORE_CRASH'
          ];
          selected = uncommonPool[Math.floor(Math.random() * uncommonPool.length)];
          text = `1 IN 20 (UNCOMMON_${selected}_LINK)`;
        } else { 
          const commonPool: CutsceneType[] = [
            'FLUSH', 'SPIKE', 'BREACH', 'GHOST', 'DATA_FALL', 'BINARY_WAVE', 
            'SYSTEM_SCAN', 'NOISE', 'PIXEL_DRIFT', 'GLITCH_STORM', 'TICKER_TAPE', 'HEX_DUMP', 'CHAMELEON_SHIFT',
            'NEON_GRID', 'CIRCUIT_FLOW', 'DNA_SEQUENCE', 'PULSAR', 'NEURAL_MAP', 'FROST_STATIC', 'DEEP_SEA_LINK', 'STICK_FIGHT', 'CYBER_PULSE', 'SIGNAL_INTERFERENCE', 'BINARY_FISSION',
            'COBALT_REIGN', 'EMERALD_MIST', 'SCARLET_STORM', 'VIOLET_VORTEX', 'AMBER_AWAKENING', 'MAGENTA_MATRIX',
            'SIGNAL_SOFT', 'WAVE_WARP', 'PULSE_PART', 'BIT_BEAT', 'BYTE_BURST', 'CHIP_CIRCUIT', 'WIRE_WAVE', 'FLOW_FIELD',
            'SHELL_SHOCK', 'BIT_BOUNCE', 'LINK_LOSS', 'NET_NODE'
          ];
          selected = commonPool[Math.floor(Math.random() * commonPool.length)];
          text = `1 IN 5 (COMMON_${selected}_MAINTENANCE)`;
        }
    }

    setType(selected);
    setRarityText(text);

    // Sound logic
    if (selected === 'SINGULARITY' || selected === 'ANGELIC_SYMPHONY' || selected === 'ETERNAL_OPPRESSION' || selected === 'SUPREME_SOVEREIGN' || selected === 'ANONYMOUS_DEITY') {
        if (selected === 'ANGELIC_SYMPHONY' || selected === 'ETERNAL_OPPRESSION' || selected === 'SUPREME_SOVEREIGN' || selected === 'ANONYMOUS_DEITY') {
            audioService.ensureMinVolume(0.3);
        }
        audioService.playCelestialSymphony();
    } 
    else if (selected === 'OMEGA' || selected === 'VOLCANIC_DEBUG') audioService.playError();
    else audioService.playBlip();
  }, [type, forcedType]);

  useEffect(() => {
    if (!type) return;
    
    // Only set timer for non-video cutscenes
    const isVideo = type === 'ANGELIC_SYMPHONY' || type === 'ETERNAL_OPPRESSION' || type === 'SUPREME_SOVEREIGN' || type === 'ANONYMOUS_DEITY';
    
    // Safety timer for EVERY cutscene (fallback)
    const timeoutDuration = isVideo ? 30000 : ((type === 'SINGULARITY' || type === 'STARS_ZOOM') ? 6000 : 3500);
    
    const timer = setTimeout(() => {
      setStatus('DISPLAY_RARITY');
    }, timeoutDuration);

    return () => clearTimeout(timer);
  }, [type]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Allow returning to reality with any key if in the rarity display state
      if (status === 'DISPLAY_RARITY') {
        onComplete(rarityText);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [status, onComplete, rarityText]);


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
           <AnimatePresence>
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
             {type === 'SOLAR_FLARE' && <SolarFlareEffect />}
             {type === 'VOID_TRESPASS' && <VoidTrespassEffect />}
             {type === 'NEON_GHOST' && <NeonGhostEffect />}
             {type === 'SYNTH_WAVE' && <SynthWaveEffect />}
             {type === 'CHRONO_TRIGGER' && <ChronoTriggerEffect />}
             {type === 'STATIC_RAIN' && <StaticRainEffect />}
             {type === 'PULSE_WIDTH' && <PulseWidthEffect />}
             {type === 'MIRROR_EDGE' && <MirrorEdgeEffect />}
             {type === 'GLITCH_STORM' && <GlitchStormEffect />}
             {type === 'TICKER_TAPE' && <TickerTapeEffect />}
             {type === 'HEX_DUMP' && <HexDumpEffect />}
             {type === 'SYSTEM_SCAN' && <SystemScanEffect />}
             {type === 'NOISE' && <NoiseEffect />}
             {type === 'PIXEL_DRIFT' && <PixelDriftEffect />}
             {type === 'PLASMA_STORM' && <PlasmaStormEffect />}
             {type === 'GHOST_PROTOCOL' && <GhostProtocolEffect />}
             {type === 'ZENITH_POINT' && <ZenithPointEffect />}
             {type === 'NADIR_COLLAPSE' && <NadirCollapseEffect />}
             {type === 'ORBITAL_DESCENT' && <OrbitalDescentEffect />}
             {type === 'ATMOSPHERIC_ENTRY' && <AtmosphericEntryEffect />}
             {type === 'DEEP_CORE_SCAN' && <DeepCoreScanEffect />}
             {type === 'NEURAL_REWIRE' && <NeuralRewireEffect />}
             {type === 'QUANTUM_LEAP' && <QuantumLeapEffect />}
             {type === 'BINARY_FISSION' && <BinaryFissionEffect />}
             {type === 'SUPERNOVA_REMNANT' && <SupernovaRemnantEffect />}
             {type === 'DARK_MATTER_HUNT' && <DarkMatterHuntEffect />}
             {type === 'DIMENSIONAL_SHIFT' && <DimensionalShiftEffect />}
             {type === 'EVENT_HORIZON' && <EventHorizonEffect />}
             {type === 'WHITE_HOLE_EMISSION' && <WhiteHoleEmissionEffect />}
             
             {/* New Tactical Series */}
             {type === 'COBALT_REIGN' && <TacticalColorEffect color="#1d4ed8" label="COBALT" icon={<ShieldAlert />} />}
             {type === 'EMERALD_MIST' && <TacticalColorEffect color="#059669" label="EMERALD" icon={<Wind />} />}
             {type === 'SCARLET_STORM' && <TacticalColorEffect color="#dc2626" label="SCARLET" icon={<Zap />} />}
             {type === 'VIOLET_VORTEX' && <TacticalColorEffect color="#7c3aed" label="VIOLET" icon={<InfinityIcon />} />}
             {type === 'AMBER_AWAKENING' && <TacticalColorEffect color="#d97706" label="AMBER" icon={<Sun />} />}
             {type === 'MAGENTA_MATRIX' && <TacticalColorEffect color="#c026d3" label="MAGENTA" icon={<Layers />} grid />}
             
             {type === 'CYAN_CORE' && <TacticalColorEffect color="#0891b2" label="CYAN" icon={<Cpu />} />}
             {type === 'SILVER_SHADOW' && <TacticalColorEffect color="#94a3b8" label="SILVER" icon={<Ghost />} />}
             {type === 'GOLDEN_GATEWAY' && <TacticalColorEffect color="#eab308" label="GOLDEN" icon={<Key />} />}
             {type === 'BRONZE_BEAM' && <TacticalColorEffect color="#92400e" label="BRONZE" icon={<Zap />} />}
             {type === 'OBSIDIAN_OVERLAY' && <TacticalColorEffect color="#020617" label="OBSIDIAN" icon={<Eye />} />}
             {type === 'TITANIUM_TRACE' && <TacticalColorEffect color="#64748b" label="TITANIUM" icon={<Scan />} />}
             
             {type === 'PLATINUM_PULSE' && <TacticalColorEffect color="#cbd5e1" label="PLATINUM" icon={<Activity />} pulse />}
             {type === 'STEEL_SURGE' && <TacticalColorEffect color="#475569" label="STEEL" icon={<Zap />} surge />}
             {type === 'IRON_INITIATIVE' && <TacticalColorEffect color="#334155" label="IRON" icon={<ShieldAlert />} />}
             {type === 'COPPER_CIRCUIT' && <TacticalColorEffect color="#9a3412" label="COPPER" icon={<CircuitBoard />} />}
             {type === 'QUARTZ_QUAKE' && <TacticalColorEffect color="#e2e8f0" label="QUARTZ" icon={<Activity />} quake />}
             {type === 'RUBY_RESONANCE' && <TacticalColorEffect color="#991b1b" label="RUBY" icon={<Music />} pulse />}
             {type === 'SAPPHIRE_SCAN' && <TacticalColorEffect color="#1e3a8a" label="SAPPHIRE" icon={<Search />} scan />}
             {type === 'TOPAZ_TRANSMISSION' && <TacticalColorEffect color="#a16207" label="TOPAZ" icon={<Satellite />} />}
             
             {type === 'JADE_JUNCTION' && <TacticalColorEffect color="#065f46" label="JADE" icon={<Layers />} junction />}
             {type === 'PEARL_PROTOCOL' && <TacticalColorEffect color="#f1f5f9" label="PEARL" icon={<ShieldAlert />} pulse />}
             {type === 'OPAL_OSCILLATION' && <TacticalColorEffect color="#9333ea" label="OPAL" icon={<Repeat />} rotate />}
             {type === 'GARNET_GRID' && <TacticalColorEffect color="#7f1d1d" label="GARNET" icon={<Hash />} grid />}
             {type === 'ONYX_OUTBREAK' && <TacticalColorEffect color="#0a0a0a" label="ONYX" icon={<AlertTriangle />} pulse />}
             {type === 'ZIRCON_ZERO' && <TacticalColorEffect color="#0d9488" label="ZIRCON" icon={<Box />} />}
             {type === 'PYRITE_PATTERN' && <TacticalColorEffect color="#ca8a04" label="PYRITE" icon={<Cpu />} grid />}
             {type === 'CORAL_COMMAND' && <TacticalColorEffect color="#f43f5e" label="CORAL" icon={<Smartphone />} />}
             {type === 'METEOR_MIND' && <TacticalColorEffect color="#4b5563" label="METEOR" icon={<Rocket />} surge />}
             {type === 'COMET_CRASH' && <TacticalColorEffect color="#1e293b" label="COMET" icon={<Mountain />} quake />}

             {/* 30 Additional Cutscenes */}
             {/* Epic Series */}
             {type === 'NEBULA_NOVA' && <TacticalColorEffect color="#7e22ce" label="NEBULA" icon={<Globe />} pulse surge />}
             {type === 'SUPERNOVA_SOUL' && <TacticalColorEffect color="#fde047" label="SUPERNOVA" icon={<Sun />} surge quake />}
             {type === 'QUASAR_QUAKE' && <TacticalColorEffect color="#3b82f6" label="QUASAR" icon={<Activity />} quake scan />}
             {type === 'BEYOND_BOUNDARY' && <TacticalColorEffect color="#ffffff" label="BEYOND" icon={<InfinityIcon />} rotate pulse />}
             {type === 'INFINITY_INIT' && <TacticalColorEffect color="#4f46e5" label="INFINITY" icon={<Repeat />} junction rotate />}
             {type === 'ETERNITY_EDGE' && <TacticalColorEffect color="#1e1b4b" label="ETERNITY" icon={<Layers />} grid rotate />}
             {type === 'COSMOS_CORE' && <TacticalColorEffect color="#0ea5e9" label="COSMOS" icon={<Atom />} pulse junction />}

             {/* Rare Series */}
             {type === 'GLITCH_GHOST' && <TacticalColorEffect color="#9f1239" label="GLITCH" icon={<Ghost />} grid quake />}
             {type === 'MALWARE_MIST' && <TacticalColorEffect color="#166534" label="MALWARE" icon={<Wind />} scan pulse />}
             {type === 'VIRUS_VORTEX' && <TacticalColorEffect color="#991b1b" label="VIRUS" icon={<RotateCw />} rotate surge />}
             {type === 'TROJAN_TRACE' && <TacticalColorEffect color="#15803d" label="TROJAN" icon={<Search />} scan grid />}
             {type === 'ROOTKIT_REIGN' && <TacticalColorEffect color="#111827" label="ROOTKIT" icon={<ShieldAlert />} pulse grid />}
             {type === 'EXPLOIT_EYE' && <TacticalColorEffect color="#b91c1c" label="EXPLOIT" icon={<Eye />} scan rotate />}
             {type === 'ZERO_DAY_ZONE' && <TacticalColorEffect color="#334155" label="ZERO_DAY" icon={<AlertTriangle />} quake junction />}

             {/* Uncommon Series */}
             {type === 'PIXEL_PULSE' && <TacticalColorEffect color="#06b6d4" label="PIXEL" icon={<Box />} grid pulse />}
             {type === 'VOXEL_VOID' && <TacticalColorEffect color="#1e293b" label="VOXEL" icon={<Layers />} surge scan />}
             {type === 'MESH_MATRIX' && <TacticalColorEffect color="#10b981" label="MESH" icon={<Hash />} grid junction />}
             {type === 'VERTEX_VECTOR' && <TacticalColorEffect color="#6366f1" label="VERTEX" icon={<ArrowRight />} rotate junction />}
             {type === 'SHADER_SHADOW' && <TacticalColorEffect color="#0f172a" label="SHADER" icon={<Scan />} pulse scan />}
             {type === 'RENDER_REIGN' && <TacticalColorEffect color="#f59e0b" label="RENDER" icon={<Camera />} scan rotate />}
             {type === 'TEXTURE_TRACE' && <TacticalColorEffect color="#84cc16" label="TEXTURE" icon={<Database />} surge grid />}
             {type === 'LIGHT_LINK' && <TacticalColorEffect color="#fef08a" label="LIGHT" icon={<Zap />} pulse rotate />}

             {/* Common Series */}
             {type === 'SIGNAL_SOFT' && <TacticalColorEffect color="#94a3b8" label="SIGNAL" icon={<Radar />} scan />}
             {type === 'WAVE_WARP' && <TacticalColorEffect color="#3b82f6" label="WAVE" icon={<Wind />} surge />}
             {type === 'PULSE_PART' && <TacticalColorEffect color="#dc2626" label="PULSE" icon={<Activity />} pulse />}
             {type === 'BIT_BEAT' && <TacticalColorEffect color="#10b981" label="BIT" icon={<Cpu />} grid />}
             {type === 'BYTE_BURST' && <TacticalColorEffect color="#f97316" label="BYTE" icon={<Zap />} surge />}
             {type === 'CHIP_CIRCUIT' && <TacticalColorEffect color="#0ea5e9" label="CHIP" icon={<CircuitBoard />} junction />}
             {type === 'WIRE_WAVE' && <TacticalColorEffect color="#6366f1" label="WIRE" icon={<Repeat />} rotate />}
             {type === 'FLOW_FIELD' && <TacticalColorEffect color="#ec4899" label="FLOW" icon={<Layers />} scan />}

             {/* 15 New Cutscenes */}
             {/* Epic Series */}
             {type === 'PULSE_PRIME' && <TacticalColorEffect color="#fbbf24" label="PRIME" icon={<Zap />} pulse surge scan />}
             {type === 'VOID_VELOCITY' && <TacticalColorEffect color="#ffffff" label="VOID" icon={<Rocket />} surge rotate grid />}
             {type === 'NEURAL_NEXUS' && <TacticalColorEffect color="#a855f7" label="NEXUS" icon={<Network />} junction rotate pulse />}

             {/* Rare Series */}
             {type === 'CYBER_CRUCIBLE' && <TacticalColorEffect color="#f97316" label="CRUCIBLE" icon={<ShieldAlert />} surge grid />}
             {type === 'SILICON_STORM' && <TacticalColorEffect color="#94a3b8" label="STORM" icon={<CloudRain />} scan rotate />}
             {type === 'DATA_DREDGE' && <TacticalColorEffect color="#166534" label="DREDGE" icon={<Search />} scan junction />}
             {type === 'BINARY_BLAST' && <TacticalColorEffect color="#22c55e" label="BLAST" icon={<Cpu />} grid surge />}

             {/* Uncommon Series */}
             {type === 'VECTOR_VORTEX' && <TacticalColorEffect color="#14b8a6" label="VORTEX" icon={<Repeat />} rotate />}
             {type === 'FLUX_FIELD' && <TacticalColorEffect color="#d946ef" label="FLUX" icon={<Layers />} pulse junction />}
             {type === 'LOGIC_LEAK' && <TacticalColorEffect color="#facc15" label="LOGIC" icon={<Terminal />} scan quake />}
             {type === 'CORE_CRASH' && <TacticalColorEffect color="#ef4444" label="CORE" icon={<AlertTriangle />} quake pulse />}

             {/* Common Series */}
             {type === 'SHELL_SHOCK' && <TacticalColorEffect color="#3b82f6" label="SHELL" icon={<Box />} scan />}
             {type === 'BIT_BOUNCE' && <TacticalColorEffect color="#84cc16" label="BIT" icon={<Dice5 />} pulse />}
             {type === 'LINK_LOSS' && <TacticalColorEffect color="#64748b" label="LINK" icon={<Unlink />} scan />}
             {type === 'NET_NODE' && <TacticalColorEffect color="#06b6d4" label="NODE" icon={<Signal />} junction />}

             {type === 'ANONYMOUS_DEITY' && <VideoCutscene src={VIDEO_SOURCES.ANONYMOUS_DEITY} label="ANONYMOUS_DEITY" onEnded={() => setStatus('DISPLAY_RARITY')} />}
             {type === 'CHAMELEON_SHIFT' && <ChameleonShiftEffect />}
             {type === 'GRAVITY_WELL' && <GravityWellEffect />}
             {type === 'NEBULA_DRIFT' && <NebulaDriftEffect />}
             {type === 'COSMIC_RAYS' && <CosmicRaysEffect />}
             {type === 'PHOTON_BURST' && <PhotonBurstEffect />}
             {type === 'DARK_ENERGY' && <DarkEnergyEffect />}
             {type === 'STRING_VIBRATION' && <StringVibrationEffect />}
             {type === 'WORMHOLE_ENTRY' && <WormholeEntryEffect />}
             {type === 'BLACK_HOLE_SINGULARITY' && <BlackHoleSingularityEffect />}
             {type === 'PULSE_MODULATION' && <PulseModulationEffect />}
             {type === 'HEARTBEAT_MONITOR' && <HeartbeatMonitorEffect />}
             {type === 'RADAR_PING' && <RadarPingEffect />}
             {type === 'SONAR_SWEEP' && <SonarSweepEffect />}
             {type === 'THERMAL_VISION' && <ThermalVisionEffect />}
             {type === 'NIGHT_MODE' && <NightModeEffect />}
             {type === 'ANGELIC_SYMPHONY' && <VideoCutscene src={VIDEO_SOURCES.ANGELIC_SYMPHONY} label="ANGELIC_SYMPHONY" onEnded={() => setStatus('DISPLAY_RARITY')} />}
             {type === 'ETERNAL_OPPRESSION' && <VideoCutscene src={VIDEO_SOURCES.ETERNAL_OPPRESSION} label="ETERNAL_OPPRESSION" onEnded={() => setStatus('DISPLAY_RARITY')} />}
             {type === 'SUPREME_SOVEREIGN' && <VideoCutscene src={VIDEO_SOURCES.SUPREME_SOVEREIGN} label="SUPREME_SOVEREIGN" onEnded={() => setStatus('DISPLAY_RARITY')} />}
           </AnimatePresence>
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
                        <motion.div animate={{ height: [4, 40, 4] }} transition={{ duration: 0.2, repeat: Infinity, repeatDelay: 2 }} className="w-12 h-4 bg-tactical-cyan rounded-full shadow-[0_0_20px_#0ea5e9]" />
                        <motion.div animate={{ height: [4, 40, 4] }} transition={{ duration: 0.2, repeat: Infinity, repeatDelay: 2 }} className="w-12 h-4 bg-tactical-cyan rounded-full shadow-[0_0_20px_#0ea5e9]" />
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
                 transition={{ duration: 0.5, repeat: Infinity }}
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
                    transition={{ duration: 0.2, repeat: Infinity }}
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
                transition={{ duration: 0.8, repeat: Infinity }}
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
                    transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1, ease: "easeIn" }}
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
                    transition={{ duration: 1, delay: Math.random() * 2, repeat: Infinity }}
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
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
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
                transition={{ duration: 0.1, repeat: Infinity }}
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
                transition={{ duration: 0.05, repeat: Infinity }}
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
                transition={{ duration: 1, repeat: Infinity }}
                className="w-1 bg-white shadow-[0_0_50px_white]"
             />
             <motion.div 
                animate={{ scale: [0, 2], opacity: [1, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
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
                        transition={{ duration: 0.5, delay: i * 0.1, repeat: Infinity }}
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
                    transition={{ duration: 2, delay: Math.random() * 2, repeat: Infinity }}
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
                    transition={{ duration: 0.1, delay: Math.random() * 3, repeat: Infinity }}
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
                    transition={{ duration: 5, repeat: Infinity }}
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
                transition={{ duration: 2, repeat: Infinity }}
                className="text-lime-500 font-black text-6xl mt-8 tracking-tighter"
             >
                BIO_ASYNC_ERROR
             </motion.div>
        </div>
    );
}

function VideoCutscene({ src, label, onEnded }: { src: string, label?: string, onEnded?: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showBypass, setShowBypass] = useState(false);

  useEffect(() => {
    // Show manual bypass after 3 seconds if still loading
    const bypassTimer = setTimeout(() => {
      if (loading) setShowBypass(true);
    }, 3000);

    // Skip entirely after 25 seconds as a final fail-safe
    const safetyTimer = setTimeout(() => {
      if (loading && onEnded) {
        console.warn(`Video ${label} timed out`);
        onEnded();
      }
    }, 25000);

    if (videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().then(() => {
        setLoading(false);
        setShowBypass(false);
      }).catch(err => {
        console.warn("Autoplay interaction blocked:", err);
        setShowBypass(true);
      });
    }

    return () => {
      clearTimeout(bypassTimer);
      clearTimeout(safetyTimer);
    };
  }, [src, loading, label, onEnded]);

  const handleManualPlay = () => {
    // Attempt to resume audio context or play audio service music
    audioService.ensureMinVolume(0.3);
    audioService.playCelestialSymphony();
    
    if (videoRef.current) {
      videoRef.current.play().then(() => {
        setLoading(false);
        setShowBypass(false);
      }).catch(err => {
        console.error("Manual play failed:", err);
        if (onEnded) onEnded();
      });
    }
  };

  const handleCanPlay = () => {
    setLoading(false);
  };

  const handleVideoError = () => {
    console.error(`Failed to load video: ${src}`);
    setError(true);
    if (onEnded) onEnded();
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-black overflow-hidden font-sans">
      {/* Cinematic Overlays */}
      <div className="absolute inset-0 pointer-events-none z-10 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)] opacity-60" />
      <div className="absolute inset-0 pointer-events-none z-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] opacity-20" />
      
      {(loading || showBypass) && !error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-50 bg-black/95 backdrop-blur-md">
          <motion.div 
            animate={{ 
                rotate: 360,
                boxShadow: ["0 0 20px rgba(0,255,255,0.2)", "0 0 50px rgba(0,255,255,0.4)", "0 0 20px rgba(0,255,255,0.2)"] 
            }}
            transition={{ rotate: { duration: 2, repeat: Infinity, ease: "linear" }, boxShadow: { duration: 2, repeat: Infinity } }}
            className="w-16 h-16 border-t-2 border-tactical-cyan rounded-full mb-8"
          />
          
          <div className="flex flex-col items-center gap-2">
            <div className="text-tactical-cyan text-[10px] font-mono tracking-[0.6em] animate-pulse uppercase">
                ESTABLISHING_NEURAL_LINK
            </div>
          </div>
          
          {showBypass && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-12 flex flex-col items-center gap-6"
            >
              <button 
                onClick={handleManualPlay}
                className="group relative px-10 py-5 bg-tactical-cyan/10 border border-tactical-cyan/30 rounded-full hover:bg-tactical-cyan/20 transition-all duration-500 overflow-hidden"
              >
                <div className="absolute inset-0 translate-y-full group-hover:translate-y-0 bg-tactical-cyan transition-transform duration-500 opacity-20" />
                <div className="flex items-center gap-4 relative z-10">
                   <div className="w-10 h-10 flex items-center justify-center rounded-full bg-tactical-cyan text-black">
                      <Play size={20} fill="currentColor" />
                   </div>
                   <div className="text-left">
                     <div className="text-white text-xs font-black tracking-widest uppercase">INITIALIZE_CARRIAGE</div>
                     <div className="text-tactical-cyan/60 text-[9px] font-mono uppercase tracking-tighter">Bypass_Browser_Audio_Lock</div>
                   </div>
                </div>
              </button>
              
              <button 
                onClick={onEnded}
                className="text-[10px] text-white/20 hover:text-white/80 transition-colors uppercase tracking-[0.4em] font-mono border-b border-white/5 pb-1"
              >
                SKIP_ENCRYPTED_STREAM
              </button>
            </motion.div>
          )}
        </div>
      )}
      
      <video 
          ref={videoRef}
          playsInline
          className={`min-w-full min-h-full object-cover transition-all duration-3000 ease-in-out ${loading ? 'opacity-0 scale-110 blur-xl' : 'opacity-100 scale-100 blur-none'}`}
          onEnded={onEnded}
          onError={handleVideoError}
          onCanPlay={handleCanPlay}
      >
          <source src={src} type="video/mp4" />
          Your browser does not support the video tag.
      </video>

      {/* Decorative Tactical Elements */}
      {!loading && (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 pointer-events-none z-20"
        >
            {/* Corner Brackets */}
            <div className="absolute top-5 left-5 w-10 h-10 border-t border-l border-white/20" />
            <div className="absolute top-5 right-5 w-10 h-10 border-t border-r border-white/20" />
            <div className="absolute bottom-5 left-5 w-10 h-10 border-b border-l border-white/20" />
            <div className="absolute bottom-5 right-5 w-10 h-10 border-b border-r border-white/20" />
        </motion.div>
      )}
    </div>
  );
}

function TacticalColorEffect({ color, label, icon, pulse, scan, surge, quake, junction, grid, rotate }: { 
    color: string, 
    label: string, 
    icon: React.ReactNode, 
    pulse?: boolean, 
    scan?: boolean, 
    surge?: boolean, 
    quake?: boolean,
    junction?: boolean,
    grid?: boolean,
    rotate?: boolean
}) {
    return (
        <div className="w-full h-full relative overflow-hidden bg-slate-950 flex items-center justify-center">
            {/* Background Atmosphere */}
            <div className="absolute inset-0 opacity-20" style={{ backgroundColor: `${color}10` }} />
            
            {/* Dynamic Grid Background */}
            <div 
                className="absolute inset-0 opacity-10" 
                style={{ 
                    backgroundImage: `radial-gradient(circle at 2px 2px, ${color} 1px, transparent 0)`,
                    backgroundSize: '40px 40px'
                }} 
            />

            {/* Effect Layers */}
            {scan && (
                <motion.div 
                    animate={{ y: ["-100%", "200%"] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="absolute w-full h-[30%] z-10 pointer-events-none"
                    style={{ background: `linear-gradient(to bottom, transparent, ${color}40, transparent)` }}
                />
            )}

            {surge && (
                <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <motion.div 
                            key={i}
                            animate={{ scale: [0, 4], opacity: [0.5, 0] }}
                            transition={{ duration: 2, repeat: Infinity, delay: i * 0.4 }}
                            className="absolute border-2 rounded-full w-40 h-40"
                            style={{ borderColor: color }}
                        />
                    ))}
                </div>
            )}

            {grid && (
                <div className="absolute inset-0 grid grid-cols-8 grid-rows-8 opacity-20">
                    {Array.from({ length: 64 }).map((_, i) => (
                        <motion.div 
                            key={i}
                            animate={{ opacity: [0, 1, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity, delay: Math.random() * 2 }}
                            className="border border-white/5"
                            style={{ backgroundColor: i % 7 === 0 ? color : 'transparent' }}
                        />
                    ))}
                </div>
            )}

            {junction && (
                 <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div 
                        initial={{ rotate: 0 }}
                        animate={{ rotate: 360 }}
                        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                        className="w-[120%] h-px opacity-30"
                        style={{ backgroundColor: color }}
                    />
                    <motion.div 
                        initial={{ rotate: 90 }}
                        animate={{ rotate: 450 }}
                        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                        className="w-[120%] h-px opacity-30"
                        style={{ backgroundColor: color }}
                    />
                 </div>
            )}

            {/* Central Focal Component */}
            <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ 
                    scale: quake ? [0.95, 1.05, 0.98, 1.02, 1] : 1,
                    opacity: 1,
                    boxShadow: pulse ? [`0 0 20px ${color}30`, `0 0 60px ${color}60`, `0 0 20px ${color}30`] : `0 0 40px ${color}40`,
                    rotate: rotate ? [0, 360] : 0
                }}
                transition={{ 
                    scale: quake ? { duration: 0.1, repeat: Infinity } : { duration: 0.5 },
                    opacity: { duration: 0.5 },
                    boxShadow: { duration: 1.5, repeat: Infinity },
                    rotate: { duration: 4, repeat: Infinity, ease: "linear" }
                }}
                className="relative z-20 flex flex-col items-center justify-center p-12 bg-black/40 border border-white/10 rounded-2xl backdrop-blur-xl"
            >
                <div className="text-white relative" style={{ color: color }}>
                    {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement, { size: 100 }) : icon}
                    {pulse && (
                        <motion.div 
                            animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                            transition={{ duration: 1, repeat: Infinity }}
                            className="absolute inset-0 rounded-full bg-current opacity-20 blur-xl"
                        />
                    )}
                </div>
                
                <div className="mt-8 flex flex-col items-center gap-1">
                    <div className="text-[10px] font-mono tracking-[0.6em] opacity-40 uppercase" style={{ color: color }}>
                        SYSTEM_OVERRIDE_{label}
                    </div>
                    <div className="h-px w-24 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                </div>
            </motion.div>

            {/* Tactical Decals */}
            <div className="absolute top-10 left-10 text-white/10 font-mono text-[8px] tracking-[0.5em] flex flex-col gap-1">
                <div>HASH_SEQUENCE: {Math.random().toString(16).slice(2, 10).toUpperCase()}</div>
                <div>SIGNAL_STRENGTH: 98.4%</div>
            </div>
            
            <div className="absolute bottom-10 right-10 text-white/10 font-mono text-[8px] tracking-[0.5em] flex flex-col gap-1 items-end">
                <div>LATENCY: 4.2ms</div>
                <div>ENCRYPTION: AES-256-TACTICAL</div>
            </div>
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
                        transition={{ duration: 5, delay: i * 0.1, repeat: Infinity }}
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
               transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
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
                    transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
                    className="w-80 h-[500px] bg-gradient-to-l from-white to-transparent rounded-full blur-2xl"
                />
                <motion.div 
                    initial={{ x: 100, opacity: 0, rotate: 20 }}
                    animate={{ x: 40, opacity: 0.8, rotate: 0 }}
                    transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
                    className="w-80 h-[500px] bg-gradient-to-r from-white to-transparent rounded-full blur-2xl"
                />
                
                {/* Central Light */}
                <motion.div 
                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
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
                    transition={{ duration: 3 + Math.random() * 2, repeat: Infinity, delay: Math.random() * 5 }}
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
                    transition={{ duration: Math.random() * 3 + 2, repeat: Infinity }}
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
                    transition={{ duration: 3 + i * 0.5, repeat: Infinity, ease: "linear" }}
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
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }}>
                <Satellite size={120} className="text-tactical-cyan" />
            </motion.div>
            <div className="space-y-2 text-center">
                <div className="text-tactical-cyan text-xs font-black animate-pulse uppercase">UPLINK_STABLE_SCANNING_COORDINATES</div>
                <div className="flex gap-1 justify-center">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <motion.div 
                            key={i}
                            animate={{ height: [10, 30, 10] }}
                            transition={{ duration: 0.5, delay: i * 0.1, repeat: Infinity }}
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
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
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
            <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                <Key size={100} className="text-yellow-500" />
            </motion.div>
            <div className="grid grid-cols-8 gap-2">
                {"FORGING_MASTER_KEY".split("").map((char, i) => (
                    <motion.div 
                        key={i}
                        animate={{ opacity: [0, 1, 0] }}
                        transition={{ duration: 1, delay: i * 0.1, repeat: Infinity }}
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
                    transition={{ duration: Math.random() * 2 + 1, repeat: Infinity, delay: Math.random() * 2 }}
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
                transition={{ duration: 4, repeat: Infinity }}
                className="relative"
            >
                <div className="w-96 h-96 rounded-full bg-slate-900 border-4 border-slate-800 flex items-center justify-center overflow-hidden">
                    <motion.div 
                        animate={{ scale: [1, 1.2, 1] }} 
                        transition={{ duration: 0.2, repeat: Infinity, repeatDelay: 3 }}
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
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
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
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            >
                <Layers size={100} className="text-emerald-500" />
            </motion.div>
            <div className="absolute inset-0 flex items-center justify-center">
                {Array.from({ length: 8 }).map((_, i) => (
                    <motion.div
                        key={i}
                        animate={{ rotate: i * 45, scale: [1, 2, 1], opacity: [0.1, 0.4, 0.1] }}
                        transition={{ duration: 5, repeat: Infinity, delay: i * 0.5 }}
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
                transition={{ duration: 0.05, repeat: Infinity }}
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
                        transition={{ duration: 2, delay: i * 0.1, repeat: Infinity }}
                        className="w-4 h-4 rounded-full bg-tactical-cyan shadow-[0_0_10px_#0ea5e9]"
                    />
                    <div className="w-[1px] h-24 bg-slate-800" />
                    <motion.div 
                        animate={{ y: [0, -100, 0] }}
                        transition={{ duration: 2, delay: i * 0.1, repeat: Infinity }}
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
                transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
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
                    transition={{ duration: 1, repeat: Infinity }}
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
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-1/2 left-1/2 w-32 h-[2px] bg-tactical-cyan origin-left -translate-y-1/2"
                />
            </div>
            <div className="text-6xl font-black italic text-tactical-cyan tabular-nums">
                <motion.span
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 0.1, repeat: Infinity }}
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
                    transition={{ duration: 0.5, repeat: Infinity, repeatDelay: Math.random(), delay: Math.random() }}
                    className="absolute w-1 h-1 bg-white rounded-full"
                />
            ))}
            <Rocket size={100} className="text-white animate-bounce relative z-10" />
        </div>
    );
}

function SolarFlareEffect() {
  return (
    <div className="w-full h-full bg-orange-600 relative overflow-hidden">
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          animate={{ scale: [1, 2, 1], opacity: [0.1, 0.4, 0.1], rotate: [0, 180, 360] }}
          transition={{ duration: 3, repeat: Infinity, delay: i * 0.1 }}
          className="absolute inset-0 bg-white/20 rounded-full blur-3xl"
          style={{ 
            left: `${Math.random() * 100}%`, 
            top: `${Math.random() * 100}%`,
            width: `${Math.random() * 50}%`,
            height: `${Math.random() * 50}%`
          }}
        />
      ))}
      <div className="absolute inset-x-0 top-0 h-1 bg-white animate-pulse" />
      <div className="absolute inset-x-0 bottom-0 h-1 bg-white animate-pulse" />
    </div>
  );
}

function VoidTrespassEffect() {
  return (
    <div className="w-full h-full bg-black flex items-center justify-center">
      <motion.div 
        animate={{ scale: [0, 10], opacity: [1, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="w-10 h-10 border-2 border-purple-500 rounded-full"
      />
      <motion.div 
        animate={{ scale: [0, 8], opacity: [1, 0] }}
        transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
        className="w-10 h-10 border-2 border-blue-500 rounded-full"
      />
      <div className="text-white text-[10px] font-black animate-ping">CRITICAL_TRESPASS_DETECTED</div>
    </div>
  );
}

function NeonGhostEffect() {
  return (
    <div className="w-full h-full bg-slate-900 flex items-center justify-center gap-10 overflow-hidden">
       {[...Array(5)].map((_, i) => (
         <motion.div
           key={i}
           animate={{ x: [-100, 1100], opacity: [0, 1, 0] }}
           transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 }}
           className="w-20 h-[500px] bg-cyan-400/20 blur-xl rotate-12"
         />
       ))}
       <div className="absolute text-cyan-400 font-mono text-4xl font-black blur-sm italic">GHOST_SHELL</div>
    </div>
  );
}

function SynthWaveEffect() {
  return (
    <div className="w-full h-full bg-[#1a0b2e] flex flex-col items-center justify-end overflow-hidden">
       <div className="w-full h-[300px] perspective-[500px]">
          <motion.div 
            animate={{ backgroundPositionY: ['0px', '40px'] }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-full h-full bg-grid-pink relative"
            style={{ backgroundImage: 'linear-gradient(to right, #ff00ff22 1px, transparent 1px), linear-gradient(to bottom, #ff00ff22 1px, transparent 1px)', backgroundSize: '40px 40px', transform: 'rotateX(60deg)' }}
          />
       </div>
       <div className="absolute inset-0 bg-gradient-to-t from-pink-500/20 to-transparent" />
    </div>
  );
}

function ChronoTriggerEffect() {
  return (
    <div className="w-full h-full bg-indigo-900 flex items-center justify-center">
       {[...Array(12)].map((_, i) => (
         <motion.div
           key={i}
           animate={{ rotate: [i * 30, i * 30 + 360] }}
           transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
           className="absolute w-64 h-1 bg-white/20 origin-center"
         />
       ))}
       <div className="text-white text-5xl font-black italic">TIME_LINE_ALTERED</div>
    </div>
  );
}

function StaticRainEffect() {
  return (
    <div className="w-full h-full bg-zinc-900 overflow-hidden relative">
       {[...Array(100)].map((_, i) => (
         <motion.div
           key={i}
           animate={{ y: [-10, 1000] }}
           transition={{ duration: Math.random() + 0.5, repeat: Infinity, ease: 'linear' }}
           className="absolute w-px h-8 bg-zinc-500"
           style={{ left: `${Math.random() * 100}%` }}
         />
       ))}
       <div className="absolute inset-0 bg-black/40 mix-blend-overlay" />
    </div>
  );
}

function PulseWidthEffect() {
  return (
    <div className="w-full h-full bg-emerald-950 flex items-center justify-center font-mono">
       <motion.div 
         animate={{ height: ['10%', '80%', '10%'] }}
         transition={{ duration: 0.5, repeat: Infinity }}
         className="w-full flex justify-center items-center overflow-hidden"
       >
          <div className="text-emerald-400 text-9xl font-black flex gap-4">
             {[...Array(10)].map((_, i) => <span key={i} className="animate-pulse">|</span>)}
          </div>
       </motion.div>
    </div>
  );
}

function MirrorEdgeEffect() {
  return (
    <div className="w-full h-full flex">
       <div className="flex-1 bg-white relative overflow-hidden">
          <motion.div animate={{ x: [-100, 100] }} transition={{ duration: 1, repeat: Infinity }} className="absolute inset-0 bg-black/5" />
       </div>
       <div className="flex-1 bg-black relative overflow-hidden">
          <motion.div animate={{ x: [100, -100] }} transition={{ duration: 1, repeat: Infinity }} className="absolute inset-0 bg-white/5" />
       </div>
       <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-4xl font-black bg-black text-white px-8 py-4 -rotate-12 border-4 border-white">MIRROR_EDGE</div>
       </div>
    </div>
  );
}

function GlitchStormEffect() {
  return (
    <div className="w-full h-full bg-black relative">
       {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            animate={{ 
              x: [Math.random() * 100, Math.random() * 100],
              y: [Math.random() * 100, Math.random() * 100],
              opacity: [0, 1, 0],
              scale: [0.5, 2]
            }}
            transition={{ duration: 0.2, repeat: Infinity }}
            className="absolute p-4 bg-white text-black font-mono text-[8px]"
            style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
          >
            0x{Math.floor(Math.random() * 1000).toString(16)}
          </motion.div>
       ))}
    </div>
  );
}

function TickerTapeEffect() {
  return (
    <div className="w-full h-full bg-slate-100 flex flex-col justify-between py-20 overflow-hidden">
       {[...Array(8)].map((_, j) => (
         <motion.div 
          key={j}
          animate={{ x: j % 2 === 0 ? ['-100%', '100%'] : ['100%', '-100%'] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
          className="text-black font-mono text-2xl font-bold whitespace-nowrap opacity-20"
         >
            SYSTEM_UPTIME_OK // LOG_ENTRY_#00{j}67 // MEMORY_FLUSHING... // NODES_HEALTHY //
         </motion.div>
       ))}
    </div>
  );
}

function HexDumpEffect() {
  return (
    <div className="w-full h-full bg-black p-4 font-mono text-[8px] text-green-500 overflow-hidden">
       <div className="grid grid-cols-8 gap-1">
          {[...Array(400)].map((_, i) => (
            <motion.div 
              key={i}
              animate={{ opacity: [0.2, 1, 0.2] }}
              transition={{ duration: 2, repeat: Infinity, delay: Math.random() }}
            >
              {Math.floor(Math.random() * 256).toString(16).padStart(2, '0')}
            </motion.div>
          ))}
       </div>
    </div>
  );
}

function NightModeEffect() {
  return (
    <div className="w-full h-full bg-green-950/20 overflow-hidden relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle,transparent_20%,black_80%)]" />
      <div className="absolute inset-0 opacity-30 pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))', backgroundSize: '100% 2px, 3px 100%' }} />
      <div className="absolute top-10 left-10 border border-green-500 p-2 text-green-500 font-mono text-[8px]">NVG_CONNECTED [STABLE]</div>
    </div>
  );
}

function ThermalVisionEffect() {
  return (
    <div className="w-full h-full bg-blue-900 overflow-hidden relative">
      <motion.div 
        animate={{ x: [-100, 1100], y: [-100, 1100] }}
        transition={{ duration: 10, repeat: Infinity, repeatType: 'mirror' }}
        className="absolute w-[600px] h-[600px] bg-red-500 blur-[150px] rounded-full opacity-40"
      />
      <motion.div 
        animate={{ x: [1100, -100], y: [1100, -100] }}
        transition={{ duration: 8, repeat: Infinity, repeatType: 'mirror' }}
        className="absolute w-[400px] h-[400px] bg-yellow-400 blur-[120px] rounded-full opacity-30"
      />
      <div className="absolute inset-0 flex items-center justify-center border-4 border-white/5">
        <label className="text-white/20 font-black text-xl italic uppercase tracking-tighter">Heat_Sigma_Active</label>
      </div>
    </div>
  );
}

function SonarSweepEffect() {
  return (
    <div className="w-full h-full bg-blue-950 flex items-center justify-center">
      <motion.div
        animate={{ scale: [1, 10], opacity: [1, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute w-20 h-20 border-2 border-blue-400 rounded-full"
      />
      <motion.div
        animate={{ scale: [1, 10], opacity: [1, 0] }}
        transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
        className="absolute w-20 h-20 border-2 border-blue-400 rounded-full"
      />
      <div className="text-blue-400 font-mono text-xs opacity-50 animate-ping">PING_RETURNED</div>
    </div>
  );
}

function RadarPingEffect() {
  return (
    <div className="w-full h-full bg-emerald-950 flex items-center justify-center">
      <div className="w-64 h-64 border border-emerald-500/30 rounded-full relative">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-transparent origin-center rounded-full"
        />
        <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-emerald-400 -translate-x-1/2 -translate-y-1/2 rounded-full" />
      </div>
    </div>
  );
}

function HeartbeatMonitorEffect() {
  return (
    <div className="w-full h-full bg-zinc-950 flex items-center justify-center p-10">
       <div className="w-full h-32 border-b border-emerald-900/50 relative">
          <motion.div
            animate={{ x: ['-10%', '110%'] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="absolute top-0 bottom-0 w-20 bg-gradient-to-r from-transparent via-emerald-400 to-transparent blur-sm"
          />
          <svg className="w-full h-full opacity-20" viewBox="0 0 100 20" preserveAspectRatio="none">
             <path d="M0,10 L10,10 L12,2 L15,18 L17,10 L100,10" fill="none" stroke="#10b981" strokeWidth="0.5" />
          </svg>
       </div>
       <div className="absolute bottom-10 right-10 text-emerald-500 font-mono text-4xl">82 BPM</div>
    </div>
  );
}

function PulseModulationEffect() {
  return (
    <div className="w-full h-full bg-indigo-950 flex gap-1 items-end p-2 justify-center">
       {[...Array(32)].map((_, i) => (
         <motion.div
           key={i}
           animate={{ height: [`${Math.random()*100}%`, `${Math.random()*100}%`] }}
           transition={{ duration: 0.1, repeat: Infinity }}
           className="flex-1 bg-indigo-400 rounded-t-sm opacity-60"
         />
       ))}
       <div className="absolute inset-0 flex items-center justify-center text-indigo-200 font-black text-2xl rotate-90 italic">MOD_ACTIVE</div>
    </div>
  );
}

function BlackHoleSingularityEffect() {
  return (
    <div className="w-full h-full bg-black flex items-center justify-center">
       <motion.div
         animate={{ scale: [1, 1.1, 1], rotate: 360 }}
         transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
         className="w-[800px] h-[800px] bg-[conic-gradient(from_0deg,transparent,rgba(255,255,255,0.1),transparent)] rounded-full blur-xl"
       />
       <div className="absolute w-40 h-40 bg-black rounded-full shadow-[0_0_100px_rgba(255,255,255,0.2)]" />
       <div className="text-white font-mono text-[8px] absolute bottom-10 tracking-[1em] opacity-30 animate-pulse">GRAVITATIONAL_FIELD_STABLE</div>
    </div>
  );
}

function WormholeEntryEffect() {
  return (
    <div className="w-full h-full bg-black overflow-hidden perspective-[1000px]">
       {[...Array(20)].map((_, i) => (
         <motion.div
           key={i}
           animate={{ translateZ: [0, 1000], opacity: [0, 1, 0] }}
           transition={{ duration: 2, repeat: Infinity, delay: i * 0.1 }}
           className="absolute inset-0 border border-blue-500/20"
         />
       ))}
       <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-white font-black text-xs uppercase tracking-widest italic animate-ping">JUMPING...</div>
       </div>
    </div>
  );
}

function StringVibrationEffect() {
  return (
    <div className="w-full h-full bg-slate-900 flex flex-col justify-center gap-10">
       {[...Array(10)].map((_, i) => (
         <motion.div
           key={i}
           animate={{ opacity: [0, 1, 0], scaleY: [0.5, 2, 0.5] }}
           transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
           className="h-px w-full bg-tactical-cyan/40 shadow-[0_0_10px_cyan]"
         />
       ))}
    </div>
  );
}

function DarkEnergyEffect() {
  return (
    <div className="w-full h-full bg-black flex items-center justify-center">
       <motion.div
         animate={{ scale: [0, 10], opacity: [1, 0] }}
         transition={{ duration: 5, repeat: Infinity, ease: 'easeIn' }}
         className="w-20 h-20 bg-purple-900 rounded-full blur-[100px]"
       />
       <div className="text-purple-400 font-mono text-xs italic tracking-widest opacity-20">ACCELERATING_EXPANSION</div>
    </div>
  );
}

function PhotonBurstEffect() {
  return (
    <div className="w-full h-full bg-slate-900 flex items-center justify-center">
       <motion.div
         animate={{ scale: [0, 20], opacity: [1, 0], rotate: [0, 90] }}
         transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
         className="w-10 h-10 bg-white"
       />
       <div className="absolute inset-0 bg-white/5 opacity-0 animate-pulse" />
    </div>
  );
}

function CosmicRaysEffect() {
  return (
    <div className="w-full h-full bg-zinc-950 overflow-hidden relative">
       {[...Array(100)].map((_, i) => (
         <motion.div
           key={i}
           animate={{ x: [-100, 1200], opacity: [0, 1, 0] }}
           transition={{ duration: 0.3, repeat: Infinity, delay: Math.random() }}
           className="absolute w-20 h-px bg-white/60 blur-[1px]"
           style={{ top: `${Math.random()*100}%` }}
         />
       ))}
       <div className="absolute inset-0 bg-blue-500/5 mix-blend-overlay" />
    </div>
  );
}

function NebulaDriftEffect() {
  return (
    <div className="w-full h-full bg-slate-950 overflow-hidden relative">
       {[...Array(5)].map((_, i) => (
         <motion.div
           key={i}
           animate={{ 
             scale: [1, 1.5, 1],
             x: [0, (i-2)*100, 0],
             opacity: [0.1, 0.3, 0.1]
           }}
           transition={{ duration: 15, repeat: Infinity }}
           className={`absolute inset-0 rounded-full blur-[200px] ${i % 2 === 0 ? 'bg-cyan-900' : 'bg-purple-900'}`}
         />
       ))}
       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/5 font-black text-6xl italic">DRIFT</div>
    </div>
  );
}

function GravityWellEffect() {
  return (
    <div className="w-full h-full bg-slate-900 flex items-center justify-center overflow-hidden">
       <motion.div
        animate={{ scale: [1, 0], opacity: [0, 1, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeIn' }}
        className="w-[1000px] h-[1000px] border border-white/10 rounded-full"
       />
       <motion.div
        animate={{ scale: [1, 0], opacity: [0, 1, 0] }}
        transition={{ duration: 2, repeat: Infinity, delay: 0.5, ease: 'easeIn' }}
        className="w-[1000px] h-[1000px] border border-white/10 rounded-full"
       />
       <div className="w-4 h-4 bg-white shadow-[0_0_20px_white] rounded-full" />
    </div>
  );
}

function ChameleonShiftEffect() {
  const colors = ['bg-red-500', 'bg-emerald-500', 'bg-tactical-cyan', 'bg-orange-500', 'bg-purple-500', 'bg-white'];
  return (
    <motion.div 
      animate={{ backgroundColor: ['#ef4444', '#10b981', '#22d3ee', '#f97316', '#a855f7', '#ffffff'] }}
      transition={{ duration: 2, repeat: Infinity }}
      className="w-full h-full flex items-center justify-center"
    >
       <div className="text-black font-black text-7xl italic mix-blend-difference">ADAPTIVE_FLUSH</div>
    </motion.div>
  );
}

function SystemScanEffect() {
  return (
    <div className="w-full h-full bg-slate-900 flex items-center justify-center p-20">
       <div className="w-full h-1 bg-tactical-cyan relative overflow-hidden">
          <motion.div 
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0 bg-white shadow-[0_0_20px_white]"
          />
       </div>
       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-tactical-cyan font-black text-4xl opacity-10 italic">SYSTEM_SCAN</div>
    </div>
  );
}

function NoiseEffect() {
  return (
    <div className="w-full h-full bg-black flex items-center justify-center overflow-hidden">
       <div className="w-full h-full opacity-30 flex flex-wrap">
          {[...Array(100)].map((_, i) => (
            <motion.div 
              key={i}
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 0.1, repeat: Infinity, delay: Math.random() }}
              className="w-4 h-4 bg-white"
            />
          ))}
       </div>
       <div className="absolute text-white font-mono text-xs opacity-50">ERROR: NOISE_LEVEL_CRITICAL</div>
    </div>
  );
}

function PixelDriftEffect() {
  return (
    <div className="w-full h-full bg-indigo-950 p-10 overflow-hidden">
       {[...Array(30)].map((_, i) => (
         <motion.div
           key={i}
           animate={{ x: [-100, 1200], y: i * 20 }}
           transition={{ duration: Math.random() * 2 + 1, repeat: Infinity, ease: 'linear' }}
           className="absolute w-2 h-2 bg-indigo-400 opacity-40 shrink-0"
         />
       ))}
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
                transition={{ duration: 2, repeat: Infinity }}
                className="w-40 h-40 bg-white rounded-full blur-3xl"
            />
            <Sun size={80} className="text-white relative z-10" />
        </div>
    );
}

function PlasmaStormEffect() {
  return (
    <div className="w-full h-full bg-purple-900 overflow-hidden relative">
      {[...Array(30)].map((_, i) => (
        <motion.div
          key={i}
          animate={{ 
            x: [Math.random() * 100, Math.random() * 1000], 
            y: [Math.random() * 100, Math.random() * 1000],
            opacity: [0, 0.5, 0],
            scale: [1, 10]
          }}
          transition={{ duration: Math.random() * 2 + 1, repeat: Infinity }}
          className="absolute w-2 h-2 bg-purple-400 blur-xl"
          style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
        />
      ))}
      <div className="absolute inset-0 flex items-center justify-center">
        <h2 className="text-purple-300 font-black text-6xl italic animate-pulse">PLASMA_CRITICAL</h2>
      </div>
    </div>
  );
}

function GhostProtocolEffect() {
  return (
    <div className="w-full h-full bg-slate-950 flex items-center justify-center overflow-hidden">
       <motion.div animate={{ opacity: [0.1, 0.4, 0.1] }} transition={{ duration: 3, repeat: Infinity }} className="text-white/5 font-mono text-[10vw] font-black absolute">OFF_THE_GRID</motion.div>
       <div className="relative flex gap-4">
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              animate={{ height: [20, 200, 20], opacity: [0.2, 1, 0.2] }}
              transition={{ duration: 1, delay: i * 0.1, repeat: Infinity }}
              className="w-1 bg-white shadow-[0_0_15px_white]"
            />
          ))}
       </div>
    </div>
  );
}

function ZenithPointEffect() {
  return (
    <div className="w-full h-full bg-sky-950 flex items-center justify-center">
       <motion.div animate={{ scale: [0.8, 1.2, 0.8] }} transition={{ duration: 5, repeat: Infinity }} className="relative">
          <div className="w-32 h-32 border-4 border-sky-400 rotate-45 animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
             <div className="w-4 h-4 bg-white shadow-[0_0_20px_white]" />
          </div>
       </motion.div>
       <div className="absolute top-10 right-10 text-sky-400 font-mono text-xs uppercase font-black">ZENITH_REACHED</div>
    </div>
  );
}

function NadirCollapseEffect() {
  return (
    <div className="w-full h-full bg-black flex items-center justify-center">
       <motion.div 
        animate={{ width: [0, 400], height: [0, 1], opacity: [1, 0] }}
        transition={{ duration: 0.5, repeat: Infinity }}
        className="bg-white"
       />
       <div className="absolute flex flex-col items-center">
          <div className="text-white text-5xl font-black italic tracking-widest animate-ping">COLLAPSE</div>
       </div>
    </div>
  );
}

function OrbitalDescentEffect() {
  return (
    <div className="w-full h-full bg-slate-900 overflow-hidden relative">
       {[...Array(50)].map((_, i) => (
         <motion.div
           key={i}
           animate={{ y: [-100, 1100], opacity: [0, 1, 0] }}
           transition={{ duration: 0.2, repeat: Infinity, delay: Math.random() }}
           className="absolute w-px h-20 bg-tactical-cyan/40"
           style={{ left: `${Math.random() * 100}%` }}
         />
       ))}
       <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
          <div className="text-white font-black text-xs uppercase tracking-[1em]">Orbital Descent Initiated</div>
          <div className="text-tactical-cyan text-4xl font-black italic">ALT: {Math.floor(Math.random() * 100000)}M</div>
       </div>
    </div>
  );
}

function AtmosphericEntryEffect() {
  return (
    <div className="w-full h-full bg-orange-950 flex items-center justify-center">
       <motion.div 
        animate={{ scale: [1, 1.2, 1], rotate: [0, 2, -2, 0] }}
        transition={{ duration: 0.05, repeat: Infinity }}
        className="w-[500px] h-2 bg-gradient-to-r from-transparent via-orange-500 to-transparent blur-xl"
       />
       <div className="absolute text-orange-500 font-black text-6xl italic animate-pulse">ENTRY_BURNING</div>
    </div>
  );
}

function DeepCoreScanEffect() {
  return (
    <div className="w-full h-full bg-slate-950 p-20 flex items-center justify-center">
       <div className="grid grid-cols-10 grid-rows-10 gap-2 w-full h-full max-w-2xl max-h-2xl">
          {[...Array(100)].map((_, i) => (
            <motion.div
              key={i}
              animate={{ background: i % 7 === 0 ? ['rgba(34,211,238,0)', 'rgba(34,211,238,0.5)', 'rgba(34,211,238,0)'] : 'rgba(34,211,238,0.05)' }}
              transition={{ duration: 2, repeat: Infinity, delay: Math.random() }}
              className="w-full h-full border border-white/5"
            />
          ))}
       </div>
       <div className="absolute flex flex-col items-center gap-4 text-tactical-cyan">
          <Scan size={60} className="animate-pulse" />
          <div className="text-xs font-black tracking-widest uppercase">Deep_Core_Analysis_In_Progress</div>
       </div>
    </div>
  );
}

function NeuralRewireEffect() {
  return (
    <div className="w-full h-full bg-black flex items-center justify-center overflow-hidden">
       {[...Array(40)].map((_, i) => (
         <motion.div
           key={i}
           animate={{ 
             pathLength: [0, 1], 
             opacity: [0, 1, 0],
             scale: [0.9, 1.1]
           }}
           transition={{ duration: 2, repeat: Infinity, delay: Math.random() }}
           className="absolute border border-tactical-cyan/20 rounded-full"
           style={{ width: `${i * 30}px`, height: `${i * 30}px` }}
         />
       ))}
       <div className="text-tactical-cyan font-black text-2xl animate-pulse italic">REWIRING...</div>
    </div>
  );
}

function QuantumLeapEffect() {
  return (
    <div className="w-full h-full bg-white flex items-center justify-center overflow-hidden">
       <motion.div 
        animate={{ scale: [1, 100], opacity: [1, 0] }}
        transition={{ duration: 1, repeat: Infinity }}
        className="w-10 h-10 bg-black rounded-full"
       />
       <div className="absolute text-black font-black text-9xl italic tracking-tighter opacity-10">LEAP</div>
    </div>
  );
}

function BinaryFissionEffect() {
  return (
    <div className="w-full h-full bg-slate-900 flex items-center justify-center gap-20">
       <motion.div animate={{ x: [-200, -50] }} transition={{ duration: 2, repeat: Infinity, repeatType: 'mirror' }} className="w-20 h-20 bg-emerald-500 rounded-full blur-xl" />
       <motion.div animate={{ x: [200, 50] }} transition={{ duration: 2, repeat: Infinity, repeatType: 'mirror' }} className="w-20 h-20 bg-emerald-500 rounded-full blur-xl" />
       <div className="absolute font-black text-emerald-400 text-xs uppercase tracking-widest">Cellular_Division_Simulated</div>
    </div>
  );
}

function SupernovaRemnantEffect() {
  return (
    <div className="w-full h-full bg-black relative flex items-center justify-center">
       <motion.div
        animate={{ scale: [1, 2, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 10, repeat: Infinity }}
        className="w-[800px] h-[800px] bg-[radial-gradient(circle,rgba(255,0,0,0.2)_0%,rgba(139,0,0,0.1)_50%,transparent_100%)] rounded-full blur-3xl"
       />
       <motion.div 
        animate={{ rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
        className="absolute w-full h-full opacity-10"
        style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '100px 100px' }}
       />
       <div className="relative text-red-500 font-black text-7xl italic uppercase tracking-tighter mix-blend-screen animate-pulse">REMNANT</div>
    </div>
  );
}

function DarkMatterHuntEffect() {
  return (
    <div className="w-full h-full bg-black flex items-center justify-center">
       <motion.div 
        animate={{ opacity: [0, 1, 0], scale: [0.5, 1.5] }}
        transition={{ duration: 0.1, repeat: Infinity }}
        className="w-px h-px bg-white shadow-[0_0_50px_20px_white]"
        style={{ left: `${Math.random()*100}%`, top: `${Math.random()*100}%` }}
       />
       <div className="text-white/10 font-bold text-xs uppercase tracking-[2em]">Scanning for non-baryonic matter</div>
    </div>
  );
}

function DimensionalShiftEffect() {
  return (
    <div className="w-full h-full relative perspective-[1000px]">
       <motion.div
        animate={{ rotateX: [0, 45, 0], rotateY: [0, 45, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 3, repeat: Infinity }}
        className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 flex items-center justify-center border-4 border-white/10"
       >
          <div className="text-white font-black text-[15vw] italic opacity-20">SHIFT</div>
       </motion.div>
    </div>
  );
}

function EventHorizonEffect() {
  return (
    <div className="w-full h-full bg-black flex items-center justify-center overflow-hidden">
       <motion.div
        animate={{ scale: [1, 1.2, 1], rotate: 360 }}
        transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
        className="w-[600px] h-[600px] border-l-4 border-t-4 border-white/20 rounded-full blur-sm"
       />
       <div className="absolute w-32 h-32 bg-black rounded-full shadow-[0_0_100px_50px_rgba(255,255,255,0.1)]" />
       <div className="absolute bottom-20 text-white font-mono text-[10px] tracking-widest animate-pulse uppercase">Entering point of no return</div>
    </div>
  );
}

function WhiteHoleEmissionEffect() {
  return (
    <div className="w-full h-full bg-white relative flex items-center justify-center">
       {[...Array(50)].map((_, i) => (
         <motion.div
           key={i}
           animate={{ x: [0, (Math.random()-0.5) * 1000], y: [0, (Math.random()-0.5) * 1000], opacity: [1, 0], scale: [1, 0] }}
           transition={{ duration: 2, repeat: Infinity, delay: Math.random() }}
           className="absolute w-4 h-4 bg-black rounded-full blur-md"
         />
       ))}
       <div className="text-black font-black text-5xl uppercase italic animate-bounce">EMISSION</div>
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
                        transition={{ duration: Math.random() * 2 + 1, repeat: Infinity }}
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
                transition={{ duration: 0.1, repeat: Infinity }}
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
                transition={{ duration: 0.1, repeat: Infinity }}
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
                            transition={{ duration: 0.5, delay: i * 0.1, repeat: Infinity }}
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
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
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
                transition={{ duration: 5, repeat: Infinity }}
                className="absolute inset-0 bg-[radial-gradient(circle,rgba(2,132,199,0.2)_0%,transparent_70%)]"
            />
            <div className="relative z-10 flex flex-col items-center gap-4">
                <div className="w-32 h-32 rounded-full border border-sky-500/20 flex items-center justify-center">
                    <motion.div
                        animate={{ opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    >
                        <Zap size={64} className="text-sky-400" />
                    </motion.div>
                </div>
                <div className="text-sky-500 text-[10px] font-black uppercase tracking-widest text-center">SUB_OCEANIC_FIBER_ESTABLISHED</div>
                <div className="w-full max-w-xs h-1 bg-sky-900 overflow-hidden rounded-full mt-4">
                    <motion.div 
                        animate={{ x: ["-100%", "100%"] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
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
            repeat: Infinity, 
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
          repeat: Infinity,
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
            repeat: Infinity,
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
          repeat: Infinity,
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
               repeat: Infinity,
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
           <InfinityIcon size={100} className="text-white mb-4" />
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
