import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { audioService } from '../services/audioService';
import { ShieldAlert, Zap, Globe, Infinity as InfinityIcon, Scan, Cpu, Eye, Activity, HardDrive, Smartphone, Search, Share2, Repeat, Layers, Box, Camera, Database, Hash, Play, Wind, Sun, Satellite, Radar, Key, CircuitBoard, Atom, Clock, Rocket, Mountain, ArrowRight, AlertTriangle, User, Music, Music2, ExternalLink, Ghost, RotateCw, Unlink, Network, Terminal, Lock, Unlock, FileCode, Dice5, CloudRain, Radio, Signal, RefreshCw, RotateCcw, Trophy, Coins, Plane, XCircle, Maximize, Grid, PlusSquare, CircleSlash, HelpCircle, Dna, Fingerprint, Cat, ArrowLeft, AlertCircle, Skull } from 'lucide-react';

// --- VIDEO SOURCES CONFIGURATION ---
// REPLACE THESE WITH CLOUDINARY OR FIREBASE STORAGE URLS TO BYPASS SCHOOL BLOCKS & NETLIFY LIMITS
// Example: "https://res.cloudinary.com/yourname/video/upload/v12345/angelic_symphony.mp4"
const VIDEO_SOURCES = {
  ANONYMOUS_DEITY: "https://res.cloudinary.com/dad1nkuof/video/upload/v1/videoplayback_6_gideou.mp4",
  ANGELIC_SYMPHONY: "https://res.cloudinary.com/dad1nkuof/video/upload/v1/videoplayback_2_hkdudn.mp4",
  ETERNAL_OPPRESSION: "https://res.cloudinary.com/dad1nkuof/video/upload/v1/videoplayback_5_online-video-cutter.com_vjopio.mp4",
  SUPREME_SOVEREIGN: "https://res.cloudinary.com/dad1nkuof/video/upload/v1/videoplayback_5_online-video-cutter.com_1_wrfhem.mp4",
  AEGIS_ARCHITECH: "https://res.cloudinary.com/dad1nkuof/video/upload/v1/videoplayback_online-video-cutter.com_kmxlyf.mp4",
  RUNIA: "https://res.cloudinary.com/dad1nkuof/video/upload/v1/videoplayback_online-video-cutter.com_1_dsvyp1.mp4",
  PIXELIZATION: "https://res.cloudinary.com/dad1nkuof/video/upload/v1/videoplayback_1_online-video-cutter.com_leldrh.mp4",
  ABYSSAL_HUNTER: "https://res.cloudinary.com/dad1nkuof/video/upload/v1/videoplayback_3_online-video-cutter.com_nfoubz.mp4",
  ARCHANGEL: "https://res.cloudinary.com/dad1nkuof/video/upload/v1/videoplayback_4_online-video-cutter.com_n8hrze.mp4"
};
// -----------------------------------

interface CutsceneProps {
  onComplete: (rarity: string) => void;
  forcedType?: string;
  luckMultiplier?: number;
  level?: number;
  pityCount911?: number;
  pityCount500?: number;
}

type CutsceneType = 
  | 'SPIKE' | 'BREACH' | 'GHOST' | 'DATA_FALL' | 'BINARY_WAVE' | 'SYSTEM_SCAN' | 'NOISE' | 'PIXEL_DRIFT' | 'GLITCH_STORM' | 'TICKER_TAPE' | 'HEX_DUMP'
  | 'VISAGE' | 'LIFEFORM' | 'SATELLITE_LINK' | 'RADAR_SWEEP' | 'ENCRYPTION_KEY' | 'HYPER_LOOP' | 'NEURAL_SYNC' | 'DATA_ERASURE' | 'FIREWALL_BREACH' | 'GRID_LOCK' | 'VECTOR_FIELD' | 'STATIC_RAIN' | 'PULSE_WIDTH' | 'MIRROR_EDGE'
  | 'VOID_EYE' | 'SILICON_CITY' | 'FRACTAL_GROWTH' | 'DRONE_SURVEILLANCE' | 'CODE_VORTEX' | 'GLITCH_FACE' | 'BIO_HAZARD' | 'NEON_GHOST' | 'ORBITAL_STRIKE' | 'SYNTH_WAVE' | 'CHRONO_TRIGGER' | 'CELESTIAL_SYNC' | 'SOLAR_ECLIPSE' | 'QUANTUM_ENTANGLEMENT' | 'DEATH_BYTE' | 'PHANTOM_RECKONING' | 'CHRONOS_REVERSION' | 'VOID_MATRIARCH' | 'CELESTIAL_OVERSEER'
  | 'OMEGA' | 'ALPHA' | 'EPSILON' | 'VOID_STAR' | 'QUANTUM_BIT' | 'CORE_PULSE' | 'TIME_FLUX' | 'STARS_ZOOM' | 'VOLCANIC_DEBUG' | 'SINGULARITY' | 'PRISM_SHIFT' | 'GALAXY_COLLISION' | 'SOLAR_FLARE' | 'VOID_TRESPASS'
  | 'ANGELIC_SYMPHONY' | 'ETERNAL_OPPRESSION' | 'SUPREME_SOVEREIGN' | 'ANONYMOUS_DEITY' | 'AEGIS_ARCHITECH' | 'RUNIA' | 'PIXELIZATION' | 'ABYSSAL_HUNTER' | 'ARCHANGEL'
  | 'STRUCTURAL_COLLAPSE' | 'JACKPOT_DREAM' | 'ROULETTE_REVOLUTION' | 'SLOT_SYNCHRONY'
  | 'COBALT_REIGN' | 'EMERALD_MIST' | 'SCARLET_STORM' | 'VIOLET_VORTEX' | 'AMBER_AWAKENING' | 'MAGENTA_MATRIX'
  | 'CYAN_CORE' | 'SILVER_SHADOW' | 'GOLDEN_GATEWAY' | 'BRONZE_BEAM' | 'OBSIDIAN_OVERLAY' | 'TITANIUM_TRACE'
  | 'PLATINUM_PULSE' | 'STEEL_SURGE' | 'IRON_INITIATIVE' | 'COPPER_CIRCUIT' | 'QUARTZ_QUAKE' | 'RUBY_RESONANCE' | 'SAPPHIRE_SCAN' | 'TOPAZ_TRANSMISSION'
  | 'JADE_JUNCTION' | 'PEARL_PROTOCOL' | 'OPAL_OSCILLATION' | 'GARNET_GRID' | 'ONYX_OUTBREAK' | 'ZIRCON_ZERO' | 'PYRITE_PATTERN' | 'CORAL_COMMAND' | 'METEOR_MIND' | 'COMET_CRASH'
  | 'NEBULA_NOVA' | 'SUPERNOVA_SOUL' | 'QUASAR_QUAKE' | 'BEYOND_BOUNDARY' | 'INFINITY_INIT' | 'ETERNITY_EDGE' | 'COSMOS_CORE'
  | 'GLITCH_GHOST' | 'MALWARE_MIST' | 'VIRUS_VORTEX' | 'TROJAN_TRACE' | 'ROOTKIT_REIGN' | 'EXPLOIT_EYE' | 'ZERO_DAY_ZONE'
  | 'PIXEL_PULSE' | 'VOXEL_VOID' | 'MESH_MATRIX' | 'VERTEX_VECTOR' | 'SHADER_SHADOW' | 'RENDER_REIGN' | 'TEXTURE_TRACE' | 'LIGHT_LINK'
  | 'SIGNAL_SOFT' | 'WAVE_WARP' | 'PULSE_PART' | 'BIT_BEAT' | 'BYTE_BURST' | 'CHIP_CIRCUIT' | 'WIRE_WAVE' | 'FLOW_FIELD'
  | 'PULSE_PRIME' | 'VOID_VELOCITY' | 'NEURAL_NEXUS' | 'CYBER_CRUCIBLE' | 'SILICON_STORM' | 'DATA_DREDGE' | 'BINARY_BLAST' | 'VECTOR_VORTEX' | 'FLUX_FIELD' | 'LOGIC_LEAK' | 'CORE_CRASH' | 'SHELL_SHOCK' | 'BIT_BOUNCE' | 'LINK_LOSS' | 'NET_NODE'
  | 'NEURAL_RESET' | 'VOID_GATE' | 'CYBER_SYMPHONY' | 'STORM_WATCH' | 'GHOST_PULSE' | 'DATA_DUMP' | 'TITAN_FALL' | 'HYPER_SPACE' | 'OMEGA_X' | 'QUARK_QUAKE' | 'NEON_NOIR' | 'PIXEL_PERFECT'
  | 'CHAMELEON_SHIFT' | 'GRAVITY_WELL' | 'NEBULA_DRIFT' | 'COSMIC_RAYS' | 'PHOTON_BURST' 
  | 'DARK_ENERGY' | 'STRING_VIBRATION' | 'WORMHOLE_ENTRY' | 'BLACK_HOLE_SINGULARITY' | 'PULSE_MODULATION' 
  | 'HEARTBEAT_MONITOR' | 'RADAR_PING' | 'SONAR_SWEEP' | 'THERMAL_VISION' | 'NIGHT_MODE'
  | 'NEON_GRID' | 'CIRCUIT_FLOW' | 'DNA_SEQUENCE' | 'PULSAR' | 'NEURAL_MAP' | 'FROST_STATIC' | 'DEEP_SEA_LINK'
  | 'CYBER_PULSE' | 'SIGNAL_INTERFERENCE' | 'PLASMA_STORM' | 'GHOST_PROTOCOL' | 'ZENITH_POINT' 
  | 'NADIR_COLLAPSE' | 'ORBITAL_DESCENT' | 'ATMOSPHERIC_ENTRY' | 'DEEP_CORE_SCAN' | 'NEURAL_REWIRE' 
  | 'QUANTUM_LEAP' | 'BINARY_FISSION' | 'SUPERNOVA_REMNANT' | 'DARK_MATTER_HUNT' | 'DIMENSIONAL_SHIFT' 
  | 'EVENT_HORIZON' | 'WHITE_HOLE_EMISSION'
  | 'VOID_PULSE' | 'BINARY_STORM' | 'CHIP_OVERLOAD' | 'RAID_ARRAY' | 'KERNEL_PANIC' 
  | 'BIOS_UPGRADE' | 'MOTHERBOARD_MELT' | 'CPU_THROTTLE' | 'RAM_CLEANSE' | 'SSD_WIPE' 
  | 'GPU_RENDER_LOCK' | 'DIRECT_X_FAILURE' | 'OPEN_GL_ERROR' | 'VULKAN_ERUPTION' | 'SHADERC_CRASH' 
  | 'PIXEL_BURST' | 'VOXEL_FALL' | 'VECTOR_VOID' | 'RASTER_REIGN' | 'BIT_BUCKET' 
  | 'FLOAT_POINT_BUG' | 'INTEGER_OVERFLOW' | 'STACK_SMASH' | 'HEAP_EXHAUSTION' | 'POINTER_GHOST' 
  | 'NULL_REFERENCE' | 'UNDEFINED_BEHAVIOR' | 'SEGMENTATION_FAULT' | 'DATA_RACE' | 'DEADLOCK_SHIELD' 
  | 'RACE_CONDITION' | 'HEISENBUG' | 'MANDELBUG' | 'SCHRODINBUG' | 'BOHR_BUG' 
  | 'LITTLE_ENDIAN' | 'BIG_ENDIAN' | 'ASCII_ART' | 'UNICODE_UPRISING' | 'UTF8_STORM' 
  | 'COSMIC_CHURN' | 'DIGITAL_DEATH' | 'ELECTRON_END' | 'FIREWALL_FALL' | 'GHOST_GEAR' | 'HEX_HEX' | 'ION_IMPULSE'
  | 'JETTISON_JET' | 'KINETIC_KILL' | 'LOGIC_LOCK' | 'WILLIAM_CRASH' | 'NANO_NOISE' | 'OPTIC_OVERLOAD' | 'PROTON_PULSE' | 'QUARK_QUENCH'
  | 'PLASMA_PULSE' | 'NEBULOUS_NIGHT' | 'VOID_VAGRANT' | 'STELLAR_STORM' | 'GALAXY_GHOST' | 'ORBITAL_ODYSSEY' | 'CELESTIAL_CRASH' | 'ASTRAL_ARRAY' | 'QUANTUM_QUAKE' | 'DIMENSIONAL_DIVE' | 'TIME_TANGLE' | 'SPACE_SPIKE' | 'LUNAR_LEAK' | 'SOLAR_SURGE' | 'GRAVITY_GRIP' | 'METEOR_MELT' | 'COMET_CLASH' | 'TITAN_TICK' | 'EUROPA_END' | 'MARS_MIST' | 'VENUS_VOID' | 'SATURN_SHOCK' | 'JUPITER_JOLT' | 'NEPTUNE_NODE' | 'URANUS_UPRISING' | 'PLUTO_PULSE' | 'MERCURY_MELT' | 'SUN_STORM' | 'STAR_SURGE' | 'RAID_RECOVERY' | 'SENTRY_STANCE' | 'OMEGA_POINT' | 'CYBER_CRUX' | 'DATA_DIVINE' | 'GHOST_GRID' | 'NEURAL_NODE' | 'BINARY_BEAST' | 'SILICON_SOUL' | 'VECTOR_VALOR' | 'CORE_COMMAND' | 'SHELL_SHIELD'
  | 'BAUD_RATE_BURST' | 'LATENCY_LAG' | 'PING_OF_DEATH' | 'PACKET_LOSS_PURGE' | 'CORTEX_OVERRIDE'
  | 'VOID_VENGEANCE' | 'CYBER_CHALICE' | 'NEURAL_NIGHTMARE'
  | 'GHOST_IN_THE_GEAR' | 'MATRIX_MOURNING' | 'SYSTEM_SACRIFICE' | 'VIRTUAL_VIGIL' | 'DATA_DRONE' | 'CORE_CONDUIT' | 'LINK_LAMENT'
  | 'SHELL_SHADOW' | 'BIT_BARRAGE' | 'BYTE_BANE' | 'CHIP_CHAOS' | 'WIRE_WRATH' | 'FLOW_FURY' | 'SIGNAL_SABOTAGE' | 'WAVE_WRATH' | 'PULSE_PLAGUE' | 'NET_NIGHT'
  | 'BIT_BLINK' | 'BYTE_BLUR' | 'CHIP_CHILL' | 'WIRE_WHISPER' | 'FLOW_FADE' | 'SIGNAL_SILENCE' | 'WAVE_WHISPER' | 'PULSE_PAUSE' | 'BIT_BREAK' | 'BYTE_BREEZE' | 'CHIP_CHIME' | 'WIRE_WIND' | 'FLOW_FLUTTER' | 'SHELL_SHIVER' | 'BIT_BUMP' | 'OLIVER_TRANSFORMATION'
  | 'KIPHER_KODEX' | 'CORTEX_COLD' | 'VINE_VIOLATION' | 'GATEWAY_GHOST' | 'THREAT_TACTIC' | 'SIGNAL_STRIKE' | 'NODE_NEGATION' | 'HASH_HELL' | 'ENCRYPT_EYE' | 'SHELL_STORM' | 'PROTOCOL_PAIN' | 'VOICE_VOID'
  | 'GHOST_SIGNAL' | 'VOID_TREMOR' | 'CYBER_CORE' | 'NEURAL_NEST' | 'STATIC_WAVE' | 'PIXEL_PRIME' | 'DATA_DRAIN' | 'SHELL_SWITCH' | 'LINK_LEAK' | 'CHIP_CRUSH' | 'WIRE_WARP' | 'FLOW_FAULT';

export default function CortexCutscene({ onComplete, forcedType, luckMultiplier = 1, level = 1, pityCount911 = 0, pityCount500 = 0 }: CutsceneProps) {
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

    // 1. Identify Seed
    const effectiveLuck = luckMultiplier * (1 + (level - 1) * 0.02);
    const rand = Math.random();
    
    let selected: CutsceneType = type || 'SPIKE';
    let text = rarityText || '';

    // Pity System for 500s (Epic) and 911 (Legendary)
    const is911Pity = pityCount911 >= 500;
    const is500Pity = pityCount500 >= 100;

    if (forcedType) {
        selected = forcedType as CutsceneType;
        text = 'ADMIN_OVERRIDE (FORCED_RESTORE)';
    } else if (is911Pity) {
        const legPool: CutsceneType[] = [
          'ARCHANGEL', 'STRUCTURAL_COLLAPSE', 'SINGULARITY', 'ANGELIC_SYMPHONY', 
          'ETERNAL_OPPRESSION', 'SUPREME_SOVEREIGN', 'ANONYMOUS_DEITY', 'AEGIS_ARCHITECH', 
          'RUNIA', 'PIXELIZATION', 'ABYSSAL_HUNTER', 'SOLAR_ECLIPSE', 'QUANTUM_ENTANGLEMENT', 
          'DEATH_BYTE', 'PHANTOM_RECKONING', 'CHRONOS_REVERSION', 'VOID_MATRIARCH', 'CELESTIAL_OVERSEER'
        ];
        selected = legPool[Math.floor(Math.random() * legPool.length)];
        
        let displayOdds = "LEGENDARY";
        if (selected === 'ARCHANGEL') displayOdds = "1,000,000,000,000,000,000,000,000,000,000,000";
        else if (selected === 'ANONYMOUS_DEITY') displayOdds = "1 in 350,000";
        else if (selected === 'CELESTIAL_OVERSEER') displayOdds = "1 in 250,000";
        else if (selected === 'CHRONOS_REVERSION') displayOdds = "1 in 150,000";
        else if (selected === 'VOID_MATRIARCH') displayOdds = "1 in 100,000";
        else if (selected === 'RUNIA') displayOdds = "1 in 50,000";
        else if (selected === 'PIXELIZATION') displayOdds = "1 in 45,000";
        else if (selected === 'ABYSSAL_HUNTER') displayOdds = "1 in 40,400";
        else if (selected === 'AEGIS_ARCHITECH') displayOdds = "1 in 10,000";
        else if (selected === 'ETERNAL_OPPRESSION') displayOdds = "1 in 10M";
        else if (selected === 'SUPREME_SOVEREIGN') displayOdds = "1 in 5.5M";
        else if (selected === 'ANGELIC_SYMPHONY') displayOdds = "1 in 1,000";
        else if (selected === 'PHANTOM_RECKONING') displayOdds = "1 in 1,000";
        else if (selected === 'DEATH_BYTE') displayOdds = "1 in 1,200";
        else if (selected === 'QUANTUM_ENTANGLEMENT') displayOdds = "1 in 1,500";
        else if (selected === 'SOLAR_ECLIPSE') displayOdds = "1 in 1,111";
        else if (selected === 'SINGULARITY') displayOdds = "1 in 1M";
        else if (selected === 'WILLIAM_CRASH') displayOdds = "1 in 1,000";
        else if (selected === 'STRUCTURAL_COLLAPSE') displayOdds = "1 in 2111";

        text = `PITY_REACHED (${displayOdds}_${selected}_SYNCHRONIZED)`;
    } else if (is500Pity) {
        const epicPool: CutsceneType[] = [
          'OMEGA', 'ALPHA', 'EPSILON', 'VOID_STAR', 'NEBULA_NOVA', 'SUPERNOVA_SOUL', 
          'QUASAR_QUAKE', 'BEYOND_BOUNDARY', 'INFINITY_INIT', 'ETERNITY_EDGE', 'COSMOS_CORE',
          'OMEGA_POINT', 'CYBER_CRUX', 'DATA_DIVINE', 'UNICODE_UPRISING',
          'KIPHER_KODEX', 'CORTEX_COLD', 'VINE_VIOLATION', 'GATEWAY_GHOST'
        ];
        selected = epicPool[Math.floor(Math.random() * epicPool.length)];
        text = `PITY_REACHED (EPIC_${selected}_STABILIZED)`;
    } else if (!type) {
        // Tiers (Updated to user requested "True" odds)
        // Order: Archangel (1M) -> Deity (350k) -> Runia (50k) -> Pixel (45k) -> Abyssal (40.4k) -> Architect (10k)
        if (rand < (0.000001 * effectiveLuck)) { 
          selected = 'ARCHANGEL';
          text = 'ODDS: \n1,000,000,000,000,000,000,000,000,000,000,000 (DIVINE_MESSENGER) [ARCHANGEL]';
        } else if (rand < (0.00000385 * effectiveLuck)) { 
          selected = 'ANONYMOUS_DEITY';
          text = '1 in 350,000 (GHOST_IN_THE_SHELL) [ANONYMOUS_DEITY]';
        } else if (rand < (0.00000785 * effectiveLuck)) { 
          selected = 'CELESTIAL_OVERSEER';
          text = '1 in 250,000 (CELESTIAL_OVERSEER) [DIVINE_EYE]';
        } else if (rand < (0.00001451 * effectiveLuck)) { 
          selected = 'CHRONOS_REVERSION';
          text = '1 in 150,000 (TIME_THIEF) [CHRONOS_REVERSION]';
        } else if (rand < (0.00002451 * effectiveLuck)) { 
          selected = 'VOID_MATRIARCH';
          text = '1 in 100,000 (QUEEN_OF_DARKNESS) [VOID_MATRIARCH]';
        } else if (rand < (0.00004451 * effectiveLuck)) { 
          selected = 'RUNIA';
          text = '1 in 50,000 (THE_HEAVENLY_JUDGE) [RUNIA]';
        } else if (rand < (0.00006673 * effectiveLuck)) { 
          selected = 'PIXELIZATION';
          text = '1 in 45,000 (DIGITAL_OBLIVION) [PIXELIZATION]';
        } else if (rand < (0.00009148 * effectiveLuck)) { 
          selected = 'ABYSSAL_HUNTER';
          text = '1 in 40,400 (THE_DEEP_STALKER) [ABYSSAL_HUNTER]';
        } else if (rand < (0.00014148 * effectiveLuck)) { 
          selected = 'SINGULARITY';
          text = '1 IN 20,000 (SINGULARITY_BREACH)';
        } else if (rand < (0.00024148 * effectiveLuck)) { 
          selected = 'AEGIS_ARCHITECH';
          text = '1 in 10,000 (THE_MASTER_BUILDER) [AEGIS_ARCHITECH]';
        } else if (rand < (0.00032 * effectiveLuck)) {
          selected = 'ETERNAL_OPPRESSION';
          text = '1 IN 10,000,000 (ETERNAL_OPPRESSION)';
        } else if (rand < (0.0005 * effectiveLuck)) {
          selected = 'SUPREME_SOVEREIGN';
          text = '1 IN 5,500,000 (SUPREME_SOVEREIGN)';
        } else if (rand < (0.0007 * effectiveLuck)) {
          selected = 'QUANTUM_ENTANGLEMENT';
          text = '1 IN 1,500 (QUANTUM_ENTANGLEMENT)';
        } else if (rand < (0.0008 * effectiveLuck)) {
          selected = 'DEATH_BYTE';
          text = '1 IN 1,200 (DEATH_BYTE)';
        } else if (rand < (0.0009 * effectiveLuck)) {
          selected = 'SOLAR_ECLIPSE';
          text = '1 IN 1,111 (SOLAR_ECLIPSE)';
        } else if (rand < (0.001 * effectiveLuck)) {
          selected = 'ANGELIC_SYMPHONY';
          text = '1 IN 1,000 (ANGELIC_SYMPHONY)';
        } else if (rand < (0.0011 * effectiveLuck)) {
          selected = 'PHANTOM_RECKONING';
          text = '1 IN 1,000 (PHANTOM_RECKONING)';
        } else if (rand < (0.0021 * effectiveLuck)) {
          selected = 'WILLIAM_CRASH';
          text = '1 IN 1,000 (WILLIAM_CRASH) [ROCKET_IMPACT]';
        } else if (rand < 0.003 * effectiveLuck) { 
          selected = 'STRUCTURAL_COLLAPSE';
          text = '1 IN 2,111 (LEGENDARY_SYSTEM_FAILURE) [STRUCTURAL_COLLAPSE]';
        } else if (rand < 0.005 * effectiveLuck) { 
          // Special Tier: 1 in 500 EXCLUSIVELY for Oliver
          selected = 'OLIVER_TRANSFORMATION';
          text = '1 IN 500 (EPIC_OLIVER_TRANSFORMATION_EVENT)';
        } else if (rand < 0.01 * effectiveLuck) { 
          const epicPool: CutsceneType[] = [
            'OMEGA', 'ALPHA', 'EPSILON', 'VOID_STAR', 'NEBULA_NOVA', 'SUPERNOVA_SOUL', 
            'QUASAR_QUAKE', 'BEYOND_BOUNDARY', 'INFINITY_INIT', 'ETERNITY_EDGE', 'COSMOS_CORE',
            'PULSE_PRIME', 'VOID_VELOCITY', 'NEURAL_NEXUS',
            'OMEGA_X', 'QUARK_QUAKE', 'NEON_NOIR', 'OMEGA_POINT', 'CYBER_CRUX', 'DATA_DIVINE', 'UNICODE_UPRISING',
            'VOID_VENGEANCE', 'CYBER_CHALICE', 'NEURAL_NIGHTMARE',
            'KIPHER_KODEX', 'CORTEX_COLD', 'VINE_VIOLATION', 'GATEWAY_GHOST',
            'GHOST_SIGNAL', 'VOID_TREMOR', 'CYBER_CORE', 'NEURAL_NEST', 'STATIC_WAVE', 'PIXEL_PRIME', 'DATA_DRAIN', 'SHELL_SWITCH', 'LINK_LEAK', 'CHIP_CRUSH', 'WIRE_WARP', 'FLOW_FAULT'
          ];
          selected = epicPool[Math.floor(Math.random() * epicPool.length)];
          text = `1 IN 500 (EPIC_${selected}_PROTOCOL)`;
        } else if (rand < 0.02 * effectiveLuck) { 
          const rarePool: CutsceneType[] = [
            'VOID_EYE', 'SILICON_CITY', 'FRACTAL_GROWTH', 'DRONE_SURVEILLANCE', 
            'CODE_VORTEX', 'GLITCH_FACE', 'BIO_HAZARD', 'NEON_GHOST', 'ORBITAL_STRIKE', 'SYNTH_WAVE', 'CHRONO_TRIGGER', 'CELESTIAL_SYNC',
            'GRAVITY_WELL', 'NEBULA_DRIFT', 'COSMIC_RAYS', 'PHOTON_BURST', 'STRING_VIBRATION', 'QUANTUM_LEAP', 'DIMENSIONAL_SHIFT', 'DARK_MATTER_HUNT', 'ZENITH_POINT', 'NADIR_COLLAPSE',
            'PLATINUM_PULSE', 'STEEL_SURGE', 'IRON_INITIATIVE', 'COPPER_CIRCUIT', 'QUARTZ_QUAKE', 'RUBY_RESONANCE', 'SAPPHIRE_SCAN', 'TOPAZ_TRANSMISSION',
            'GLITCH_GHOST', 'MALWARE_MIST', 'VIRUS_VORTEX', 'TROJAN_TRACE', 'ROOTKIT_REIGN', 'EXPLOIT_EYE', 'ZERO_DAY_ZONE',
            'CYBER_CRUCIBLE', 'SILICON_STORM', 'DATA_DREDGE', 'BINARY_BLAST',
            'NEURAL_RESET', 'VOID_GATE', 'CYBER_SYMPHONY', 'STORM_WATCH',
            'VOID_PULSE', 'BINARY_STORM', 'KERNEL_PANIC', 'SEGMENTATION_FAULT', 'DEADLOCK_SHIELD', 'CORTEX_OVERRIDE',
            'COSMIC_CHURN', 'DIGITAL_DEATH', 'ELECTRON_END', 'FIREWALL_FALL', 'GHOST_GEAR', 'HEX_HEX', 'ION_IMPULSE',
            'JETTISON_JET', 'KINETIC_KILL', 'LOGIC_LOCK', 'WILLIAM_CRASH', 'NANO_NOISE', 'OPTIC_OVERLOAD', 'PROTON_PULSE', 'QUARK_QUENCH',
            'PLASMA_PULSE', 'NEBULOUS_NIGHT', 'VOID_VAGRANT', 'STELLAR_STORM', 'GALAXY_GHOST', 'ORBITAL_ODYSSEY', 'CELESTIAL_CRASH', 'ASTRAL_ARRAY', 'QUANTUM_QUAKE', 'DIMENSIONAL_DIVE', 'TIME_TANGLE', 'SPACE_SPIKE', 'LUNAR_LEAK', 'SOLAR_SURGE', 'GRAVITY_GRIP', 'METEOR_MELT', 'COMET_CLASH', 'TITAN_TICK', 'EUROPA_END', 'MARS_MIST', 'VENUS_VOID', 'SATURN_SHOCK', 'JUPITER_JOLT', 'NEPTUNE_NODE', 'URANUS_UPRISING', 'PLUTO_PULSE', 'MERCURY_MELT', 'SUN_STORM', 'STAR_SURGE',
            'GHOST_GRID', 'NEURAL_NODE',
            'GHOST_IN_THE_GEAR', 'MATRIX_MOURNING', 'SYSTEM_SACRIFICE', 'VIRTUAL_VIGIL', 'DATA_DRONE', 'CORE_CONDUIT', 'LINK_LAMENT',
            'THREAT_TACTIC', 'SIGNAL_STRIKE', 'NODE_NEGATION', 'HASH_HELL'
          ];
          selected = rarePool[Math.floor(Math.random() * rarePool.length)];
          text = `1 IN 200 (RARE_${selected}_EVENT)`;
        } else if (rand < 0.15 * effectiveLuck) { 
          const uncommonPool: CutsceneType[] = [
            'VISAGE', 'LIFEFORM', 'SATELLITE_LINK', 'RADAR_SWEEP', 'ENCRYPTION_KEY', 
            'HYPER_LOOP', 'NEURAL_SYNC', 'DATA_ERASURE', 'FIREWALL_BREACH', 'GRID_LOCK', 'VECTOR_FIELD',
            'STATIC_RAIN', 'PULSE_WIDTH', 'MIRROR_EDGE', 'PULSE_MODULATION', 'HEARTBEAT_MONITOR', 'RADAR_PING', 'SONAR_SWEEP', 'THERMAL_VISION', 'NIGHT_MODE',
            'NEURAL_REWIRE', 'DEEP_CORE_SCAN', 'ATMOSPHERIC_ENTRY', 'ORBITAL_DESCENT', 'PLASMA_STORM', 'GHOST_PROTOCOL', 'CELESTIAL_SYNC',
            'CYAN_CORE', 'SILVER_SHADOW', 'GOLDEN_GATEWAY', 'BRONZE_BEAM', 'OBSIDIAN_OVERLAY', 'TITANIUM_TRACE',
            'PIXEL_PULSE', 'VOXEL_VOID', 'MESH_MATRIX', 'VERTEX_VECTOR', 'SHADER_SHADOW', 'RENDER_REIGN', 'TEXTURE_TRACE', 'LIGHT_LINK',
            'VECTOR_VORTEX', 'FLUX_FIELD', 'LOGIC_LEAK', 'CORE_CRASH',
            'GHOST_PULSE', 'DATA_DUMP', 'TITAN_FALL', 'HYPER_SPACE', 'PIXEL_PERFECT',
            'CHIP_OVERLOAD', 'RAID_ARRAY', 'BIOS_UPGRADE', 'MOTHERBOARD_MELT', 'CPU_THROTTLE', 'RAM_CLEANSE', 'SSD_WIPE',
            'GPU_RENDER_LOCK', 'DIRECT_X_FAILURE', 'OPEN_GL_ERROR', 'VULKAN_ERUPTION', 'SHADERC_CRASH', 'PIXEL_BURST', 'VOXEL_FALL', 'VECTOR_VOID', 'RASTER_REIGN',
            'BIT_BUCKET', 'FLOAT_POINT_BUG', 'INTEGER_OVERFLOW', 'STACK_SMASH', 'HEAP_EXHAUSTION', 'POINTER_GHOST', 'NULL_REFERENCE', 'UNDEFINED_BEHAVIOR',
            'DATA_RACE', 'RACE_CONDITION', 'HEISENBUG', 'MANDELBUG', 'SCHRODINBUG', 'BOHR_BUG', 'LITTLE_ENDIAN', 'BIG_ENDIAN',
            'ASCII_ART', 'UTF8_STORM', 'BAUD_RATE_BURST', 'LATENCY_LAG', 'PING_OF_DEATH', 'PACKET_LOSS_PURGE',
            'SILICON_SOUL', 'VECTOR_VALOR', 'CORE_COMMAND', 'SHELL_SHIELD',
            'SHELL_SHADOW', 'BIT_BARRAGE', 'BYTE_BANE', 'CHIP_CHAOS', 'WIRE_WRATH', 'FLOW_FURY', 'SIGNAL_SABOTAGE', 'WAVE_WRATH', 'PULSE_PLAGUE', 'NET_NIGHT',
            'ENCRYPT_EYE', 'SHELL_STORM'
          ];
          selected = uncommonPool[Math.floor(Math.random() * uncommonPool.length)];
          text = `1 IN 20 (UNCOMMON_${selected}_LINK)`;
        } else { 
          const commonPool: CutsceneType[] = [
            'COBALT_REIGN', 'EMERALD_MIST', 'SCARLET_STORM', 'VIOLET_VORTEX', 'AMBER_AWAKENING', 'MAGENTA_MATRIX',
            'SIGNAL_SOFT', 'WAVE_WARP', 'PULSE_PART', 'BIT_BEAT', 'BYTE_BURST', 'CHIP_CIRCUIT', 'WIRE_WAVE', 'FLOW_FIELD',
            'SHELL_SHOCK', 'BIT_BOUNCE', 'LINK_LOSS', 'NET_NODE',
            'RAID_RECOVERY', 'SENTRY_STANCE', 'BINARY_BEAST',
            'BIT_BLINK', 'BYTE_BLUR', 'CHIP_CHILL', 'WIRE_WHISPER', 'FLOW_FADE', 'SIGNAL_SILENCE', 'WAVE_WHISPER', 'PULSE_PAUSE', 'BIT_BREAK', 'BYTE_BREEZE', 'CHIP_CHIME', 'WIRE_WIND', 'FLOW_FLUTTER', 'SHELL_SHIVER', 'BIT_BUMP',
            'PROTOCOL_PAIN', 'VOICE_VOID'
          ];
          selected = commonPool[Math.floor(Math.random() * commonPool.length)];
          text = `1 IN 2 (COMMON_${selected}_MAINTENANCE)`;
        }
    }

    setType(selected);
    setRarityText(text);

    // Sound logic
    if (selected === 'SINGULARITY' || selected === 'ANGELIC_SYMPHONY' || selected === 'ETERNAL_OPPRESSION' || selected === 'SUPREME_SOVEREIGN' || selected === 'ANONYMOUS_DEITY' || selected === 'AEGIS_ARCHITECH' || selected === 'RUNIA' || selected === 'PIXELIZATION' || selected === 'ABYSSAL_HUNTER' || selected === 'ARCHANGEL') {
        if (selected === 'ANGELIC_SYMPHONY' || selected === 'ETERNAL_OPPRESSION' || selected === 'SUPREME_SOVEREIGN' || selected === 'ANONYMOUS_DEITY' || selected === 'AEGIS_ARCHITECH' || selected === 'RUNIA' || selected === 'PIXELIZATION' || selected === 'ABYSSAL_HUNTER' || selected === 'ARCHANGEL') {
            audioService.ensureMinVolume(0.5);
        }
        audioService.playCelestialSymphony();
    } 
    else if (selected === 'STRUCTURAL_COLLAPSE') audioService.playError();
    else if (selected === 'JACKPOT_DREAM') audioService.playSuccess();
    else if (selected === 'OMEGA' || selected === 'VOLCANIC_DEBUG') audioService.playError();
    else audioService.playBlip();
  }, [type, forcedType]);

  useEffect(() => {
    if (!type) return;
    
    // Only set timer for non-video cutscenes
    const isVideo = type === 'ANGELIC_SYMPHONY' || type === 'ETERNAL_OPPRESSION' || type === 'SUPREME_SOVEREIGN' || type === 'ANONYMOUS_DEITY' || type === 'AEGIS_ARCHITECH' || type === 'RUNIA' || type === 'PIXELIZATION' || type === 'ABYSSAL_HUNTER' || type === 'ARCHANGEL';
    
    // Safety timer for EVERY cutscene (fallback)
    const timeoutDuration = isVideo ? 35000 : 
      ((type === 'SINGULARITY' || type === 'STARS_ZOOM' || type === 'STRUCTURAL_COLLAPSE' || type === 'OMEGA') ? 10000 : 3500);
    
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
             {type === 'SPIKE' && <SpikeEffect />}
             {type === 'BREACH' && <BreachEffect />}
             {type === 'OMEGA' && <OmegaEffect />}
             {type === 'SINGULARITY' && <SingularityEffect />}
             {type === 'GHOST' && <GhostEffect />}
             {type === 'VISAGE' && <VisageEffect />}
             {type === 'LIFEFORM' && <LifeformEffect />}
             {type === 'DATA_FALL' && <DataFallEffect />}
             {type === 'RAID_RECOVERY' && <RaidEffect />}
             {type === 'SENTRY_STANCE' && <SentryEffect />}
             {type === 'OMEGA_POINT' && <SingularityEffect />}
             {type === 'CYBER_CRUX' && <BreachEffect />}
             {type === 'DATA_DIVINE' && <DataFallEffect />}
             {type === 'GHOST_GRID' && <GhostEffect />}
             {type === 'NEURAL_NODE' && <SpikeEffect />}
             {type === 'BINARY_BEAST' && <SpikeEffect />}
             {type === 'SILICON_SOUL' && <BreachEffect />}
             {type === 'VECTOR_VALOR' && <SpikeEffect />}
             {type === 'CORE_COMMAND' && <BreachEffect />}
             {type === 'SHELL_SHIELD' && <SpikeEffect />}
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
 
             {/* 12 New Cutscenes - Series 2 */}
             {type === 'NEURAL_RESET' && <TacticalColorEffect color="#f43f5e" label="RESET" icon={<RefreshCw />} pulse junction rotate />}
             {type === 'VOID_GATE' && <TacticalColorEffect color="#000000" label="GATE" icon={<Lock />} surge grid rotate />}
             {type === 'CYBER_SYMPHONY' && <TacticalColorEffect color="#c026d3" label="SYMPHONY" icon={<Music2 />} pulse junction scan />}
             {type === 'STORM_WATCH' && <TacticalColorEffect color="#3b82f6" label="STORM" icon={<Globe />} scan rotate quake />}
             {type === 'GHOST_PULSE' && <TacticalColorEffect color="#94a3b8" label="GHOST" icon={<Ghost />} pulse grid scan />}
             {type === 'DATA_DUMP' && <TacticalColorEffect color="#22c55e" label="DUMP" icon={<FileCode />} junction surge grid />}
             {type === 'TITAN_FALL' && <TacticalColorEffect color="#f97316" label="TITAN" icon={<Mountain />} surge quake scan />}
             {type === 'HYPER_SPACE' && <TacticalColorEffect color="#ffffff" label="HYPER" icon={<Rocket />} rotate grid />}
             {type === 'OMEGA_X' && <TacticalColorEffect color="#ef4444" label="OMEGA_X" icon={<AlertTriangle />} pulse junction surge />}
             {type === 'QUARK_QUAKE' && <TacticalColorEffect color="#facc15" label="QUARK" icon={<Atom />} quake rotate pulse />}
             {type === 'NEON_NOIR' && <TacticalColorEffect color="#2dd4bf" label="NOIR" icon={<Eye />} scan rotate pulse />}
             {type === 'PIXEL_PERFECT' && <TacticalColorEffect color="#6366f1" label="PIXEL" icon={<Box />} grid scan junction />}

             {/* 45 New Technical Cutscenes */}
             {type === 'VOID_PULSE' && <TacticalColorEffect color="#1e1b4b" label="VOID_PULSE" icon={<Zap />} pulse grid />}
             {type === 'BINARY_STORM' && <TacticalColorEffect color="#00ff00" label="BINARY_STORM" icon={<FileCode />} scan rotate />}
             {type === 'CHIP_OVERLOAD' && <TacticalColorEffect color="#f97316" label="CHIP_OVERLOAD" icon={<Cpu />} surge quake />}
             {type === 'RAID_ARRAY' && <TacticalColorEffect color="#3b82f6" label="RAID_ARRAY" icon={<Database />} grid junction />}
             {type === 'KERNEL_PANIC' && <TacticalColorEffect color="#ef4444" label="KERNEL_PANIC" icon={<ShieldAlert />} quake pulse scan />}
             {type === 'BIOS_UPGRADE' && <TacticalColorEffect color="#eab308" label="BIOS_UPGRADE" icon={<RefreshCw />} rotate junction />}
             {type === 'MOTHERBOARD_MELT' && <TacticalColorEffect color="#dc2626" label="MOTHERBOARD_MELT" icon={<Zap />} surge quake pulse />}
             {type === 'CPU_THROTTLE' && <TacticalColorEffect color="#f59e0b" label="CPU_THROTTLE" icon={<Activity />} pulse scan />}
             {type === 'RAM_CLEANSE' && <TacticalColorEffect color="#06b6d4" label="RAM_CLEANSE" icon={<Database />} scan rotate />}
             {type === 'SSD_WIPE' && <TacticalColorEffect color="#94a3b8" label="SSD_WIPE" icon={<HardDrive />} pulse scan surge />}
             {type === 'GPU_RENDER_LOCK' && <TacticalColorEffect color="#c026d3" label="GPU_RENDER_LOCK" icon={<Box />} grid junction quake />}
             {type === 'DIRECT_X_FAILURE' && <TacticalColorEffect color="#4338ca" label="DIRECT_X_FAILURE" icon={<XCircle />} quake scan />}
             {type === 'OPEN_GL_ERROR' && <TacticalColorEffect color="#fb923c" label="OPEN_GL_ERROR" icon={<AlertTriangle />} rotate junction />}
             {type === 'VULKAN_ERUPTION' && <TacticalColorEffect color="#b91c1c" label="VULKAN_ERUPTION" icon={<Wind />} pulse surge quake />}
             {type === 'SHADERC_CRASH' && <TacticalColorEffect color="#8b5cf6" label="SHADERC_CRASH" icon={<Layers />} junction rotate grid />}
             {type === 'PIXEL_BURST' && <TacticalColorEffect color="#f43f5e" label="PIXEL_BURST" icon={<Box />} surge pulse scan />}
             {type === 'VOXEL_FALL' && <TacticalColorEffect color="#2dd4bf" label="VOXEL_FALL" icon={<Wind />} scan quake rotate />}
             {type === 'VECTOR_VOID' && <TacticalColorEffect color="#000000" label="VECTOR_VOID" icon={<Maximize />} grid rotate surge />}
             {type === 'RASTER_REIGN' && <TacticalColorEffect color="#22c55e" label="RASTER_REIGN" icon={<Grid />} scan junction />}
             {type === 'BIT_BUCKET' && <TacticalColorEffect color="#64748b" label="BIT_BUCKET" icon={<Database />} scan grid pulse />}
             {type === 'FLOAT_POINT_BUG' && <TacticalColorEffect color="#fbbf24" label="FLOAT_POINT_BUG" icon={<Hash />} quake rotate junction />}
             {type === 'INTEGER_OVERFLOW' && <TacticalColorEffect color="#ef4444" label="INTEGER_OVERFLOW" icon={<PlusSquare />} surge scan pulse />}
             {type === 'STACK_SMASH' && <TacticalColorEffect color="#7f1d1d" label="STACK_SMASH" icon={<Layers />} quake grid surge />}
             {type === 'HEAP_EXHAUSTION' && <TacticalColorEffect color="#1e40af" label="HEAP_EXHAUSTION" icon={<Database />} scan pulse junction />}
             {type === 'POINTER_GHOST' && <TacticalColorEffect color="#94a3b8" label="POINTER_GHOST" icon={<Ghost />} pulse grid scan rotate />}
             {type === 'NULL_REFERENCE' && <TacticalColorEffect color="#000000" label="NULL_REFERENCE" icon={<CircleSlash />} grid junction scan />}
             {type === 'UNDEFINED_BEHAVIOR' && <TacticalColorEffect color="#a855f7" label="UNDEFINED_BEHAVIOR" icon={<HelpCircle />} rotate scan quake />}
             {type === 'SEGMENTATION_FAULT' && <TacticalColorEffect color="#dc2626" label="SEGMENTATION_FAULT" icon={<XCircle />} quake junction rotate pulse />}
             {type === 'DATA_RACE' && <TacticalColorEffect color="#3b82f6" label="DATA_RACE" icon={<Repeat />} rotate grid surge />}
             {type === 'DEADLOCK_SHIELD' && <TacticalColorEffect color="#1e1b4b" label="DEADLOCK_SHIELD" icon={<Lock />} grid junction scan rotate />}
             {type === 'RACE_CONDITION' && <TacticalColorEffect color="#f59e0b" label="RACE_CONDITION" icon={<Zap />} rotate surge pulse />}
             {type === 'HEISENBUG' && <TacticalColorEffect color="#06b6d4" label="HEISENBUG" icon={<Dna />} pulse scan grid junction />}
             {type === 'MANDELBUG' && <TacticalColorEffect color="#ec4899" label="MANDELBUG" icon={<Fingerprint />} pulse scan grid junction rotate />}
             {type === 'SCHRODINBUG' && <TacticalColorEffect color="#6b7280" label="SCHRODINBUG" icon={<Cat />} scan grid rotate junction />}
             {type === 'BOHR_BUG' && <TacticalColorEffect color="#fbbf24" label="BOHR_BUG" icon={<Atom />} junction rotate scan quake />}
             {type === 'LITTLE_ENDIAN' && <TacticalColorEffect color="#14b8a6" label="LITTLE_ENDIAN" icon={<ArrowLeft />} rotate scan pulse />}
             {type === 'BIG_ENDIAN' && <TacticalColorEffect color="#f43f5e" label="BIG_ENDIAN" icon={<ArrowRight />} rotate scan pulse />}
             {type === 'ASCII_ART' && <TacticalColorEffect color="#22c55e" label="ASCII_ART" icon={<Terminal />} scan rotate grid junction />}
             {type === 'UNICODE_UPRISING' && <TacticalColorEffect color="#fb923c" label="UNICODE_UPRISING" icon={<Globe />} rotate scan quake surge />}
             {type === 'UTF8_STORM' && <TacticalColorEffect color="#3b82f6" label="UTF8_STORM" icon={<CloudRain />} scan rotate surge junction />}
             {type === 'BAUD_RATE_BURST' && <TacticalColorEffect color="#eab308" label="BAUD_RATE_BURST" icon={<Zap />} rotate surge junction quake />}
             {type === 'LATENCY_LAG' && <TacticalColorEffect color="#94a3b8" label="LATENCY_LAG" icon={<Clock />} pulse scan grid rotate junction quake />}
             {type === 'PING_OF_DEATH' && <TacticalColorEffect color="#ef4444" label="PING_OF_DEATH" icon={<AlertCircle />} quake scan rotate junction surge grid />}
             {type === 'PACKET_LOSS_PURGE' && <TacticalColorEffect color="#4b5563" label="PACKET_LOSS_PURGE" icon={<XCircle />} grid scan rotate junction quake surge />}
             {type === 'CORTEX_OVERRIDE' && <TacticalColorEffect color="#06b6d4" label="CORTEX_OVERRIDE" icon={<Cpu />} junction rotate scan quake surge grid pulse />}

             {/* 35 New Requested Cutscenes */}
             {type === 'VOID_VENGEANCE' && <TacticalColorEffect color="#1e1b4b" label="VENGEANCE" icon={<Skull />} pulse surge rotate grid quake />}
             {type === 'CYBER_CHALICE' && <TacticalColorEffect color="#c026d3" label="CHALICE" icon={<Database />} pulse junction rotate scan />}
             {type === 'NEURAL_NIGHTMARE' && <TacticalColorEffect color="#7f1d1d" label="NIGHTMARE" icon={<Ghost />} pulse grid quake scan rotate />}

             {type === 'GHOST_IN_THE_GEAR' && <TacticalColorEffect color="#94a3b8" label="GEAR_GHOST" icon={<CircuitBoard />} scan grid pulse />}
             {type === 'MATRIX_MOURNING' && <TacticalColorEffect color="#1e293b" label="MOURNING" icon={<Layers />} pulse grid scan />}
             {type === 'SYSTEM_SACRIFICE' && <TacticalColorEffect color="#dc2626" label="SACRIFICE" icon={<Zap />} surge pulse rotate />}
             {type === 'VIRTUAL_VIGIL' && <TacticalColorEffect color="#06b6d4" label="VIGIL" icon={<Eye />} scan pulse grid />}
             {type === 'DATA_DRONE' && <TacticalColorEffect color="#166534" label="DRONE" icon={<Smartphone />} scan rotate junction />}
             {type === 'CORE_CONDUIT' && <TacticalColorEffect color="#f97316" label="CONDUIT" icon={<Cpu />} junction rotate surge />}
             {type === 'LINK_LAMENT' && <TacticalColorEffect color="#64748b" label="LAMENT" icon={<Unlink />} scan pulse rotate />}

             {type === 'SHELL_SHADOW' && <TacticalColorEffect color="#0f172a" label="SHADOW" icon={<Box />} scan pulse />}
             {type === 'BIT_BARRAGE' && <TacticalColorEffect color="#22c55e" label="BARRAGE" icon={<Zap />} surge grid />}
             {type === 'BYTE_BANE' && <TacticalColorEffect color="#991b1b" label="BANE" icon={<Skull />} pulse scan />}
             {type === 'CHIP_CHAOS' && <TacticalColorEffect color="#f59e0b" label="CHAOS" icon={<Activity />} rotate quake />}
             {type === 'WIRE_WRATH' && <TacticalColorEffect color="#dc2626" label="WRATH" icon={<Zap />} surge pulse />}
             {type === 'FLOW_FURY' && <TacticalColorEffect color="#c026d3" label="FURY" icon={<Wind />} surge rotate />}
             {type === 'SIGNAL_SABOTAGE' && <TacticalColorEffect color="#ef4444" label="SABOTAGE" icon={<AlertTriangle />} scan rotate />}
             {type === 'WAVE_WRATH' && <TacticalColorEffect color="#3b82f6" label="WRATH" icon={<CloudRain />} surge quake />}
             {type === 'PULSE_PLAGUE' && <TacticalColorEffect color="#166534" label="PLAGUE" icon={<Activity />} pulse scan />}
             {type === 'NET_NIGHT' && <TacticalColorEffect color="#020617" label="NIGHT" icon={<Globe />} pulse grid />}

             {type === 'BIT_BLINK' && <TacticalColorEffect color="#10b981" label="BLINK" icon={<Zap />} pulse />}
             {type === 'BYTE_BLUR' && <TacticalColorEffect color="#64748b" label="BLUR" icon={<Layers />} scan />}
             {type === 'CHIP_CHILL' && <TacticalColorEffect color="#0ea5e9" label="CHILL" icon={<Cpu />} pulse />}
             {type === 'WIRE_WHISPER' && <TacticalColorEffect color="#94a3b8" label="WHISPER" icon={<Repeat />} pulse />}
             {type === 'FLOW_FADE' && <TacticalColorEffect color="#4b5563" label="FADE" icon={<Layers />} pulse />}
             {type === 'SIGNAL_SILENCE' && <TacticalColorEffect color="#1e293b" label="SILENCE" icon={<Signal />} scan />}
             {type === 'WAVE_WHISPER' && <TacticalColorEffect color="#3b82f6" label="WHISPER" icon={<Wind />} pulse />}
             {type === 'PULSE_PAUSE' && <TacticalColorEffect color="#dc2626" label="PAUSE" icon={<Activity />} pulse />}
             {type === 'BIT_BREAK' && <TacticalColorEffect color="#ef4444" label="BREAK" icon={<XCircle />} quake />}
             {type === 'BYTE_BREEZE' && <TacticalColorEffect color="#10b981" label="BREEZE" icon={<Wind />} surge />}
             {type === 'CHIP_CHIME' && <TacticalColorEffect color="#eab308" label="CHIME" icon={<Music />} pulse />}
             {type === 'WIRE_WIND' && <TacticalColorEffect color="#94a3b8" label="WIND" icon={<Wind />} rotate />}
             {type === 'FLOW_FLUTTER' && <TacticalColorEffect color="#c026d3" label="FLUTTER" icon={<Wind />} rotate />}
             {type === 'SHELL_SHIVER' && <TacticalColorEffect color="#3b82f6" label="SHIVER" icon={<Box />} pulse />}
             {type === 'BIT_BUMP' && <TacticalColorEffect color="#84cc16" label="BUMP" icon={<Dice5 />} pulse />}
             {type === 'OLIVER_TRANSFORMATION' && <OliverTransformationEffect />}

             {/* 12 New Requested Cutscenes */}
             {type === 'KIPHER_KODEX' && <TacticalColorEffect color="#f59e0b" label="KODEX" icon={<FileCode />} scan rotate junction grid pulse />}
             {type === 'CORTEX_COLD' && <TacticalColorEffect color="#3b82f6" label="COLD" icon={<Wind />} rotate scan pulse grid quake />}
             {type === 'VINE_VIOLATION' && <TacticalColorEffect color="#dc2626" label="VIOLATION" icon={<ShieldAlert />} surge quake pulse rotate scan grid />}
             {type === 'GATEWAY_GHOST' && <TacticalColorEffect color="#94a3b8" label="GHOST" icon={<Ghost />} pulse scan rotate junction grid />}
             {type === 'THREAT_TACTIC' && <TacticalColorEffect color="#ef4444" label="TACTIC" icon={<AlertTriangle />} quake scan rotate junction grid pulse />}
             {type === 'SIGNAL_STRIKE' && <TacticalColorEffect color="#3b82f6" label="STRIKE" icon={<Zap />} rotate surge quake scan grid pulse />}
             {type === 'NODE_NEGATION' && <TacticalColorEffect color="#1e1b4b" label="NEGATION" icon={<XCircle />} quake scan rotate junction grid pulse />}
             {type === 'HASH_HELL' && <TacticalColorEffect color="#7f1d1d" label="HELL" icon={<Hash />} quake scan rotate junction grid pulse />}
             {type === 'ENCRYPT_EYE' && <TacticalColorEffect color="#c026d3" label="EYE" icon={<Eye />} scan rotate junction grid pulse />}
             {type === 'SHELL_STORM' && <TacticalColorEffect color="#475569" label="STORM" icon={<Box />} scan rotate junction grid pulse />}
             {type === 'PROTOCOL_PAIN' && <TacticalColorEffect color="#991b1b" label="PAIN" icon={<AlertCircle />} quake scan rotate junction grid pulse />}
             {type === 'VOICE_VOID' && <TacticalColorEffect color="#000000" label="VOID" icon={<Radio />} scan rotate junction grid pulse />}

             {/* 12 New Series 3 Epic Cutscenes */}
             {type === 'GHOST_SIGNAL' && <TacticalColorEffect color="#94a3b8" label="GHOST_SIGNAL" icon={<Ghost />} pulse scan rotate grid quake />}
             {type === 'VOID_TREMOR' && <TacticalColorEffect color="#1e1b4b" label="VOID_TREMOR" icon={<Activity />} quake scan rotate grid />}
             {type === 'CYBER_CORE' && <TacticalColorEffect color="#0ea5e9" label="CYBER_CORE" icon={<Cpu />} pulse junction rotate scan grid />}
             {type === 'NEURAL_NEST' && <TacticalColorEffect color="#a855f7" label="NEURAL_NEST" icon={<Network />} junction rotate pulse grid />}
             {type === 'STATIC_WAVE' && <TacticalColorEffect color="#475569" label="STATIC_WAVE" icon={<Wind />} scan rotate pulse quake />}
             {type === 'PIXEL_PRIME' && <TacticalColorEffect color="#2dd4bf" label="PIXEL_PRIME" icon={<Box />} grid pulse scan junction />}
             {type === 'DATA_DRAIN' && <TacticalColorEffect color="#ef4444" label="DATA_DRAIN" icon={<ArrowRight />} surge scan rotate grid />}
             {type === 'SHELL_SWITCH' && <TacticalColorEffect color="#fb923c" label="SHELL_SWITCH" icon={<Repeat />} rotate junction grid scan />}
             {type === 'LINK_LEAK' && <TacticalColorEffect color="#22c55e" label="LINK_LEAK" icon={<Unlink />} scan rotate pulse grid />}
             {type === 'CHIP_CRUSH' && <TacticalColorEffect color="#dc2626" label="CHIP_CRUSH" icon={<Zap />} quake surge rotate pulse />}
             {type === 'WIRE_WARP' && <TacticalColorEffect color="#6366f1" label="WIRE_WARP" icon={<Repeat />} rotate scan grid pulse />}
             {type === 'FLOW_FAULT' && <TacticalColorEffect color="#fcd34d" label="FLOW_FAULT" icon={<AlertTriangle />} quake scan rotate grid />}

             {/* 15 New Rare Elite Cutscenes */}
             {type === 'COSMIC_CHURN' && <GalaxyCollisionEffect />}
             {type === 'DIGITAL_DEATH' && <DeathByteEffect />}
             {type === 'ELECTRON_END' && <SingularityEffect />}
             {type === 'FIREWALL_FALL' && <BreachEffect />}
             {type === 'GHOST_GEAR' && <GhostEffect />}
             {type === 'HEX_HEX' && <TacticalColorEffect color="#1e1b4b" label="HEX_HEX" icon={<Hash />} grid rotate scan surge />}
             {type === 'ION_IMPULSE' && <TacticalColorEffect color="#0891b2" label="ION_IMPULSE" icon={<Activity />} pulse surge rotate scan />}
             {type === 'JETTISON_JET' && <TacticalColorEffect color="#0f172a" label="JETTISON_JET" icon={<Plane />} surge rotate grid scan />}
             {type === 'KINETIC_KILL' && <TacticalColorEffect color="#991b1b" label="KINETIC_KILL" icon={<Zap />} surge rotate junction quake />}
             {type === 'LOGIC_LOCK' && <TacticalColorEffect color="#1e1b4b" label="LOGIC_LOCK" icon={<Lock />} grid junction rotate pulse />}
             {type === 'WILLIAM_CRASH' && <WilliamHouseCrashEffect />}
             {type === 'NANO_NOISE' && <TacticalColorEffect color="#065f46" label="NANO_NOISE" icon={<Radio />} scan grid rotate pulse />}
             {type === 'OPTIC_OVERLOAD' && <StarsZoomEffect />}
             {type === 'PROTON_PULSE' && <TacticalColorEffect color="#4338ca" label="PROTON_PULSE" icon={<Atom />} pulse surge rotate scan />}
             {type === 'QUARK_QUENCH' && <TacticalColorEffect color="#164e63" label="QUARK_QUENCH" icon={<Activity />} grid rotate pulse surge />}


             {type === 'SOLAR_ECLIPSE' && <SolarEclipseEffect />}
             {type === 'QUANTUM_ENTANGLEMENT' && <QuantumEntanglementEffect />}
             {type === 'DEATH_BYTE' && <DeathByteEffect />}
             {type === 'PHANTOM_RECKONING' && <PhantomReckoningEffect />}
             {type === 'CHRONOS_REVERSION' && <ChronosReversionEffect />}
             {type === 'VOID_MATRIARCH' && <VoidMatriarchEffect />}
             {type === 'CELESTIAL_OVERSEER' && <CelestialOverseerEffect />}
             
             {type === 'ANONYMOUS_DEITY' && <VideoCutscene src={VIDEO_SOURCES.ANONYMOUS_DEITY} label="ANONYMOUS_DEITY" onEnded={() => setStatus('DISPLAY_RARITY')} />}
             {type === 'AEGIS_ARCHITECH' && <VideoCutscene src={VIDEO_SOURCES.AEGIS_ARCHITECH} label="AEGIS_ARCHITECH" onEnded={() => setStatus('DISPLAY_RARITY')} />}
             {type === 'RUNIA' && <VideoCutscene src={VIDEO_SOURCES.RUNIA} label="RUNIA" onEnded={() => setStatus('DISPLAY_RARITY')} />}
             {type === 'PIXELIZATION' && <VideoCutscene src={VIDEO_SOURCES.PIXELIZATION} label="PIXELIZED" onEnded={() => setStatus('DISPLAY_RARITY')} />}
             {type === 'ABYSSAL_HUNTER' && <VideoCutscene src={VIDEO_SOURCES.ABYSSAL_HUNTER} label="ABYSSAL_HUNTER" onEnded={() => setStatus('DISPLAY_RARITY')} />}
             {type === 'ARCHANGEL' && <VideoCutscene src={VIDEO_SOURCES.ARCHANGEL} label="ARCHANGEL" onEnded={() => setStatus('DISPLAY_RARITY')} />}
             {type === 'STRUCTURAL_COLLAPSE' && <TowerCollapseEffect onComplete={() => setStatus('DISPLAY_RARITY')} />}
              {['PLASMA_PULSE', 'NEBULOUS_NIGHT', 'VOID_VAGRANT', 'STELLAR_STORM', 'GALAXY_GHOST', 'ORBITAL_ODYSSEY', 'CELESTIAL_CRASH', 'ASTRAL_ARRAY', 'QUANTUM_QUAKE', 'DIMENSIONAL_DIVE', 'TIME_TANGLE', 'SPACE_SPIKE', 'LUNAR_LEAK', 'SOLAR_SURGE', 'GRAVITY_GRIP', 'METEOR_MELT', 'COMET_CLASH', 'TITAN_TICK', 'EUROPA_END', 'MARS_MIST', 'VENUS_VOID', 'SATURN_SHOCK', 'JUPITER_JOLT', 'NEPTUNE_NODE', 'URANUS_UPRISING', 'PLUTO_PULSE', 'MERCURY_MELT', 'SUN_STORM', 'STAR_SURGE'].includes(type) && (
                <TacticalColorEffect color="#1e293b" label={type} icon={<Zap />} pulse surge rotate grid scan />
              )}
             {type === 'JACKPOT_DREAM' && <TacticalColorEffect color="#FFD700" label="FORTUNE_FAVORS_THE_BOLD" icon={<Trophy className="w-16 h-16" />} pulse surge />}
             {type === 'ROULETTE_REVOLUTION' && <TacticalColorEffect color="#C41E3A" label="FATE_SPINS_THE_WHEEL" icon={<RotateCcw className="w-16 h-16" />} pulse grid />}
             {type === 'SLOT_SYNCHRONY' && <TacticalColorEffect color="#00FF7F" label="SYNCHRONIZED_CHANCE" icon={<Coins className="w-16 h-16" />} surge grid />}
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
            className="text-center space-y-4 max-w-2xl px-4"
          >
            <div className="text-tactical-cyan text-[10px] font-black tracking-[0.5em] uppercase animate-pulse">SEQUENCE_COMPLETE</div>
            
            {type === 'ARCHANGEL' ? (
              <div className="space-y-6">
                <div className="text-6xl font-black text-white italic uppercase tracking-tighter kipher-glitch" data-text="ARCHANGEL">
                  ARCHANGEL
                </div>
                <div className="space-y-2">
                  <div className="text-4xl font-black text-red-500 italic uppercase tracking-tighter">ODDS:</div>
                  <div className="text-3xl md:text-5xl font-black text-red-600 italic uppercase tracking-tighter break-all">
                    1,000,000,000,000,000,000,000,000,000,000,000
                  </div>
                </div>
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">DIVINE_PROTOCOL_ESTABLISHED // TARGET_REACHED</div>
              </div>
            ) : (
              <div className="text-4xl font-black text-white italic uppercase tracking-tighter">
                ODDS: <span className="text-red-500">{rarityText}</span>
              </div>
            )}
            
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

function OliverTransformationEffect() {
  return (
    <div className="relative w-full h-full bg-slate-950 flex items-center justify-center overflow-hidden font-mono">
      <div className="flex flex-col items-center relative gap-8">
        
        {/* Stickman Oliver Stage */}
        <motion.div
          animate={{ 
            opacity: [1, 1, 0],
            scale: [1, 1, 0.5]
          }}
          transition={{ times: [0, 0.65, 0.7], duration: 4 }}
          className="relative flex flex-col items-center"
        >
          <div className="absolute -top-16 bg-white text-black px-2 py-0.5 text-[10px] font-black uppercase tracking-tighter">OLIVER</div>
          
          <div className="w-10 h-10 border-2 border-white rounded-full bg-slate-900" />
          <div className="w-0.5 h-16 bg-white" />
          
          {/* Arms */}
          <div className="absolute top-14 w-16 h-0.5 bg-white -left-8 origin-right rotate-45" />
          <div className="absolute top-14 w-16 h-0.5 bg-white -right-8 origin-left -rotate-45" />
          
          {/* Legs */}
          <div className="absolute top-26 w-0.5 h-16 bg-white -rotate-[30deg] origin-top" />
          <div className="absolute top-26 w-0.5 h-16 bg-white rotate-[30deg] origin-top" />
        </motion.div>

        {/* Falling Olive Part */}
        <motion.div
          initial={{ y: -1000 }}
          animate={{ y: [ -1000, 0, 500 ] }}
          transition={{ times: [0, 0.65, 1], duration: 4, ease: "linear" }}
          className="absolute w-24 h-32 bg-[#4b5320] rounded-full border-4 border-[#2d3213] flex items-center justify-center z-20"
        >
           {/* Pimento center */}
           <div className="w-8 h-8 bg-red-600 rounded-full shadow-inner" />
           {/* Stem */}
           <div className="absolute -top-6 w-2 h-10 bg-[#2d3213] rounded-full" />
        </motion.div>

        {/* Transformation Result */}
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: [0, 0, 1], scale: [0, 0, 1.2, 1] }}
          transition={{ times: [0, 0.65, 0.7, 0.8], duration: 4.5 }}
          className="absolute flex flex-col items-center"
        >
           <div className="w-32 h-40 bg-[#4b5320] rounded-full border-8 border-[#2d3213] flex items-center justify-center relative shadow-[0_0_80px_rgba(75,83,32,0.8)]">
              <div className="w-12 h-12 bg-red-600 rounded-full border-2 border-red-800" />
              <div className="absolute -top-10 w-2 h-12 bg-[#2d3213] rounded-full rotate-12" />
              
              <div className="absolute -bottom-16 w-full text-center">
                <div className="bg-tactical-cyan text-black px-4 py-1 text-xs font-black uppercase tracking-widest inline-block border-2 border-white/50">
                  OLIVER_ENTITY_COMPRESSED
                </div>
              </div>
           </div>
        </motion.div>

      </div>
      
      {/* Visual Impact Flare */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.9, 0] }}
        transition={{ times: [0.65, 0.67, 0.75], duration: 4 }}
        className="absolute inset-0 bg-white pointer-events-none z-50"
      />
      
      <div className="absolute bottom-10 left-10 text-tactical-cyan/40 text-[8px] uppercase tracking-widest leading-loose">
        [SYSTEM_LOG] ATTEMPTING_ORGANIC_COMPRESSION...<br/>
        [SYSTEM_LOG] IMPACT_DETECTED_AT_COORD_Y_0<br/>
        [SYSTEM_LOG] TARGET_OLIVER: STATE_CHANGED_TO_DRUPE
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
                    key={`loop-${i}`}
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
                    key={`sync-${i}`}
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
                    <div key={`vortex-${i}`}>{Math.random().toString(36).substring(7)}</div>
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

function TowerCollapseEffect({ onComplete }: { onComplete: () => void }) {
    useEffect(() => {
        const timer = setTimeout(onComplete, 8000);
        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <div className="w-full h-full bg-slate-950 flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-red-950 to-slate-950 opacity-50" />
            <div className="relative flex items-end gap-12 z-10 bottom-[-100px]">
                <motion.div 
                    initial={{ height: 400 }}
                    className="w-24 bg-slate-800 border-x-4 border-t-4 border-slate-700 relative"
                >
                    <motion.div
                        initial={{ x: -1000, y: 100, opacity: 1, scale: 2 }}
                        animate={{ x: 0, y: 120 }}
                        transition={{ duration: 2, ease: "linear" }}
                        className="absolute z-20"
                    >
                        <Plane size={48} className="text-white fill-white rotate-45" />
                    </motion.div>
                    <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: [0, 4, 3], opacity: [0, 1, 0] }}
                        transition={{ delay: 2, duration: 1.5 }}
                        className="absolute top-1/4 left-1/2 -translate-x-1/2 w-20 h-20 bg-orange-500 rounded-full blur-xl"
                    />
                    <motion.div
                        initial={{ y: 0 }}
                        animate={{ y: 500, rotate: -5 }}
                        transition={{ delay: 4, duration: 3, ease: "easeIn" }}
                        className="w-full h-full bg-inherit border-inherit flex flex-col gap-1 p-2"
                    >
                        {Array.from({ length: 20 }).map((_, i) => (
                            <div key={i} className="w-full h-2 bg-slate-900/50" />
                        ))}
                    </motion.div>
                </motion.div>
                <motion.div 
                    initial={{ height: 450, rotate: 0 }}
                    animate={{ rotate: 90, x: 200, y: 200, opacity: [1, 1, 0.5] }}
                    transition={{ delay: 5.5, duration: 2.5, ease: "easeIn" }}
                    className="w-24 bg-slate-800 border-x-4 border-t-4 border-slate-700 origin-bottom flex flex-col gap-1 p-2"
                >
                     {Array.from({ length: 22 }).map((_, i) => (
                        <div key={i} className="w-full h-2 bg-slate-900/30" />
                    ))}
                </motion.div>
            </div>
            <motion.div 
                animate={{ x: [0, -5, 5, -5, 0], y: [0, 5, -5, 5, 0] }}
                transition={{ delay: 2, duration: 0.2, repeat: 10 }}
                className="absolute inset-0 pointer-events-none"
            />
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0] }}
                transition={{ delay: 7.5, duration: 0.5 }}
                className="absolute inset-0 bg-white z-50 shadow-[0_0_100px_white]"
            />
            <div className="absolute bottom-10 left-10 text-slate-500 font-mono text-[8px] tracking-[0.5em] animate-pulse">
                CRITICAL_FAILURE // STRUCTURAL_INTEGRITY_COMPROMISED
            </div>
        </div>
    );
}

function VideoCutscene({ src, label, onEnded }: { src: string, label?: string, onEnded?: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showBypass, setShowBypass] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    const bypassTimer = setTimeout(() => {
      if (loading) setShowBypass(true);
    }, 3000);

    const safetyTimer = setTimeout(() => {
      if (loading && onEnded) {
        console.warn(`Video ${label} timed out`);
        onEnded();
      }
    }, 25000);

    if (videoRef.current) {
      videoRef.current.load();
      videoRef.current.volume = 1.0;
      videoRef.current.muted = true; // Start muted for autoplay
      videoRef.current.play().then(() => {
        setLoading(false);
        // If it played, try to unmute immediately (most browsers will block this though)
        if (videoRef.current) {
           videoRef.current.muted = false;
           setIsMuted(false);
        }
      }).catch(err => {
        console.warn("Autoplay blocked, attempting muted play:", err);
        if (videoRef.current) {
          videoRef.current.muted = true;
          setIsMuted(true);
          videoRef.current.play().then(() => {
            setLoading(false);
            setShowBypass(true); 
          }).catch(e => {
            console.error("Muted play failed:", e);
            setLoading(false);
            setShowBypass(true);
          });
        }
      });
    }

    return () => {
      clearTimeout(bypassTimer);
      clearTimeout(safetyTimer);
    };
  }, [src, loading, onEnded, label]);

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-black overflow-hidden font-sans">
      <div className="absolute inset-0 pointer-events-none z-10 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)] opacity-60" />
      
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
                onClick={() => {
                    if (videoRef.current) {
                        videoRef.current.muted = false;
                        setIsMuted(false);
                        videoRef.current.volume = 1.0;
                        videoRef.current.play().then(() => {
                            setLoading(false);
                            setShowBypass(false);
                        });
                    }
                }}
                className="group relative px-10 py-5 bg-tactical-cyan/10 border border-tactical-cyan/30 rounded-full hover:bg-tactical-cyan/20 transition-all duration-500 overflow-hidden"
              >
                <div className="absolute inset-0 translate-y-full group-hover:translate-y-0 bg-tactical-cyan transition-transform duration-500 opacity-20" />
                <div className="flex items-center gap-4 relative z-10">
                   <div className="w-10 h-10 flex items-center justify-center rounded-full bg-tactical-cyan text-black">
                      <Play size={20} fill="currentColor" />
                   </div>
                   <div className="text-left">
                     <div className="text-white text-xs font-black tracking-widest uppercase">INITIALIZE_CARRIAGE</div>
                   </div>
                </div>
              </button>
              
              <button 
                onClick={onEnded}
                className="text-[10px] text-white/20 hover:text-white/80 transition-colors uppercase tracking-[0.4em] font-mono"
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
          className={`min-w-full min-h-full object-cover transition-opacity duration-1000 ${loading ? 'opacity-0' : 'opacity-100'}`}
          onEnded={onEnded}
          onError={() => {
              setError(true);
              if (onEnded) onEnded();
          }}
          onCanPlay={() => setLoading(false)}
          src={src}
          muted={isMuted}
      />
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
        <div className="w-full h-full bg-slate-950 flex items-center justify-center relative overflow-hidden">
            {/* Background ambiance */}
            <div className="absolute inset-0 opacity-10" style={{ backgroundColor: color + '10' }} />
            
            {scan && (
                <motion.div 
                    animate={{ y: ["-100%", "200%"] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="absolute w-full h-[15%] z-10 pointer-events-none"
                    style={{ background: `linear-gradient(to bottom, transparent, ${color}60, transparent)` }}
                />
            )}

            {surge && (
                <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <motion.div 
                            key={i}
                            animate={{ scale: [0, 8], opacity: [0.3, 0] }}
                            transition={{ duration: 3, repeat: Infinity, delay: i * 0.4 }}
                            className="absolute border border-current rounded-full w-40 h-40"
                            style={{ color: color }}
                        />
                    ))}
                </div>
            )}

            {grid && (
                <div className="absolute inset-0 grid grid-cols-12 grid-rows-12 opacity-10">
                    {Array.from({ length: 144 }).map((_, i) => (
                        <motion.div 
                            key={i}
                            animate={{ opacity: [0.1, 0.5, 0.1] }}
                            transition={{ duration: 2 + Math.random() * 2, repeat: Infinity }}
                            className="border-[0.5px] border-white/5"
                            style={{ backgroundColor: i % 13 === 0 ? color : 'transparent' }}
                        />
                    ))}
                </div>
            )}

            {junction && (
                 <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                    <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        className="w-[150%] h-[150%] border-[2px] border-dashed border-current rounded-full"
                        style={{ color: color }}
                    />
                    <motion.div 
                        animate={{ rotate: -360 }}
                        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                        className="absolute w-[120%] h-[120%] border border-current rounded-full opacity-50"
                        style={{ color: color }}
                    />
                 </div>
            )}

            {/* Central Focal Component - REMOVED THE BOX, it's now purely HUD-style */}
            <div className="relative z-20 flex flex-col items-center justify-center">
                <motion.div 
                    animate={{ 
                        scale: quake ? [0.97, 1.03, 0.98, 1.02, 1] : pulse ? [1, 1.05, 1] : 1,
                        rotate: rotate ? [0, 360] : 0
                    }}
                    transition={{ 
                        scale: quake ? { duration: 0.1, repeat: Infinity } : { duration: 2, repeat: Infinity },
                        rotate: { duration: 8, repeat: Infinity, ease: "linear" }
                    }}
                    className="flex flex-col items-center justify-center"
                    style={{ color: color }}
                >
                    <div className="relative p-8">
                        {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<any>, { size: 180, strokeWidth: 0.5 }) : icon}
                        {pulse && (
                            <motion.div 
                                animate={{ scale: [1, 2.5], opacity: [0.2, 0] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="absolute inset-0 rounded-full bg-current opacity-10 blur-3xl"
                            />
                        )}
                        
                        {/* Decorative HUD Corners inside the focus area */}
                        <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-current opacity-40" />
                        <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-current opacity-40" />
                        <div className="absolute bottom-0 left-0 w-8 h-8 border-b border-l border-current opacity-40" />
                        <div className="absolute bottom-0 right-0 w-8 h-8 border-b border-r border-current opacity-40" />
                    </div>
                </motion.div>
                
                <motion.div 
                    initial={{ opacity: 0, letterSpacing: "0.2em" }}
                    animate={{ opacity: 1, letterSpacing: "1.2em" }}
                    transition={{ duration: 1 }}
                    className="mt-16 text-center"
                    style={{ color: color }}
                >
                    <div className="text-[10px] font-mono opacity-80 uppercase font-black">
                        {label}
                    </div>
                    <div className="mt-4 flex items-center justify-center gap-6">
                        <div className="h-[2px] w-32 bg-gradient-to-r from-transparent to-current opacity-40" />
                        <div className="w-3 h-3 rotate-45 border border-current animate-pulse" />
                        <div className="h-[2px] w-32 bg-gradient-to-l from-transparent to-current opacity-40" />
                    </div>
                </motion.div>
            </div>

            {/* Full Screen HUD Overlay */}
            <div className="absolute inset-8 border border-current opacity-5 pointer-events-none" style={{ color }} />
            <div className="absolute top-4 left-4 w-40 h-40 border-t-2 border-l-2 border-current opacity-20" style={{ color }} />
            <div className="absolute bottom-4 right-4 w-40 h-40 border-b-2 border-r-2 border-current opacity-20" style={{ color }} />
            
            <div className="absolute top-6 right-6 flex flex-col items-end gap-1 opacity-20" style={{ color }}>
                <div className="text-[8px] font-mono uppercase">SYNC_STATUS: NORMAL</div>
                <div className="text-[8px] font-mono uppercase">BUFFRE_LVL: {Math.floor(Math.random() * 100)}%</div>
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

function RaidEffect() {
  return (
    <div className="w-full h-full bg-slate-900 flex items-center justify-center">
      <motion.div animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 180, 270, 360] }} transition={{ duration: 4, repeat: Infinity }}>
        <Database size={80} className="text-tactical-cyan" />
      </motion.div>
      <div className="absolute bottom-10 text-[10px] text-tactical-cyan font-black animate-pulse uppercase tracking-[2em]">RECONSTRUCTING_DATA_RAID</div>
    </div>
  );
}

function SentryEffect() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-black">
      <motion.div 
        animate={{ 
          y: [-20, 20, -20],
          boxShadow: ["0 0 20px #22d3ee", "0 0 60px #22d3ee", "0 0 20px #22d3ee"] 
        }} 
        transition={{ duration: 2, repeat: Infinity }}
        className="w-32 h-32 border-4 border-tactical-cyan rounded-full flex items-center justify-center"
      >
        <Radar size={48} className="text-tactical-cyan animate-spin" />
      </motion.div>
      <div className="absolute top-10 text-[10px] text-tactical-cyan font-black uppercase tracking-[1em]">SENTRY_STANCE_ACTIVE</div>
    </div>
  );
}

function SolarEclipseEffect() {
  return (
    <div className="relative w-full h-full bg-black flex items-center justify-center overflow-hidden">
      <motion.div 
        animate={{ scale: [1, 1.1, 1], rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="relative w-96 h-96"
      >
        <div className="absolute inset-0 rounded-full bg-white shadow-[0_0_100px_white]" />
        <motion.div 
          initial={{ x: -200 }}
          animate={{ x: 0 }}
          transition={{ duration: 4, ease: "easeInOut" }}
          className="absolute inset-0 rounded-full bg-black"
        />
      </motion.div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 mix-blend-difference">
        <Sun size={120} className="text-white" />
      </div>
      <div className="absolute bottom-10 text-white/20 font-black tracking-[1em] uppercase italic">TOTAL_ECLIPSE</div>
    </div>
  );
}

function QuantumEntanglementEffect() {
  return (
    <div className="w-full h-full bg-slate-950 flex items-center justify-center p-20 overflow-hidden">
      <div className="relative w-full max-w-2xl h-64 flex items-center justify-between">
        <motion.div 
          animate={{ x: [0, 10, -10, 0], y: [0, -5, 5, 0] }}
          transition={{ duration: 0.1, repeat: Infinity }}
          className="w-12 h-12 bg-indigo-500 rounded-full shadow-[0_0_30px_#6366f1]"
        >
           <div className="w-full h-full animate-ping bg-indigo-400 rounded-full opacity-50" />
        </motion.div>
        
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <motion.path
            d="M 48 128 L 620 128"
            stroke="#6366f1"
            strokeWidth="2"
            strokeDasharray="5,5"
            animate={{ strokeDashoffset: [0, -10] }}
            transition={{ duration: 0.2, repeat: Infinity, ease: "linear" }}
          />
        </svg>

        <motion.div 
          animate={{ x: [0, -10, 10, 0], y: [0, 5, -5, 0] }}
          transition={{ duration: 0.1, repeat: Infinity }}
          className="w-12 h-12 bg-indigo-500 rounded-full shadow-[0_0_30px_#6366f1]"
        >
           <div className="w-full h-full animate-ping bg-indigo-400 rounded-full opacity-50" />
        </motion.div>
      </div>
      <div className="absolute text-indigo-500 font-mono text-[10px] tracking-widest bottom-20 uppercase">QUANTUM_STATE_SYNC: [ENTANGLED]</div>
    </div>
  );
}

function DeathByteEffect() {
  return (
    <div className="w-full h-full bg-black flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 flex">
        {Array.from({ length: 40 }).map((_, i) => (
          <motion.div
            key={i}
            animate={{ y: [-1000, 1000] }}
            transition={{ duration: 1, repeat: Infinity, delay: Math.random() * 2, ease: "linear" }}
            className="flex-1 text-[8px] text-red-950 font-mono break-all opacity-20"
            style={{ width: "2.5%" }}
          >
            {Math.random().toString(16).repeat(10)}
          </motion.div>
        ))}
      </div>
      <motion.div 
        animate={{ scale: [1, 1.05, 1], opacity: [0.8, 1, 0.8] }}
        transition={{ duration: 0.05, repeat: Infinity }}
        className="relative z-10"
      >
        <Skull size={300} className="text-red-600 drop-shadow-[0_0_30px_rgba(220,38,38,0.5)]" strokeWidth={1} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-black font-black text-4xl italic">01000100</div>
      </motion.div>
      <div className="absolute bottom-10 bg-red-600 text-black px-4 py-1 text-xs font-black italic uppercase animate-bounce">FATAL_SYSTEM_ERROR</div>
    </div>
  );
}

function PhantomReckoningEffect() {
  return (
    <div className="w-full h-full bg-zinc-950 flex items-center justify-center relative overflow-hidden">
      <motion.div
        animate={{ x: [-100, 1200] }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        className="absolute inset-y-0 w-96 bg-gradient-to-r from-transparent via-zinc-800 to-transparent flex items-center justify-center"
      >
        <Ghost size={400} className="text-zinc-600 opacity-20 blur-sm" />
      </motion.div>
      <div className="absolute inset-0 flex flex-col justify-between py-10 opacity-10">
        {Array.from({ length: 50 }).map((_, i) => (
          <div key={i} className="h-px bg-zinc-500 w-full" />
        ))}
      </div>
      <div className="relative z-10 text-center">
        <motion.div 
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 0.1, repeat: Infinity, delay: 0.5 }}
          className="text-white font-black text-6xl italic tracking-[0.5em] mix-blend-difference"
        >
          PHANTOM
        </motion.div>
        <div className="text-[10px] text-zinc-500 font-mono uppercase tracking-[2em] mt-4">SCANNING_TIMELINE...</div>
      </div>
    </div>
  );
}

function ChronosReversionEffect() {
  return (
    <div className="w-full h-full bg-slate-900 flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 border-[50px] border-black opacity-40 z-20 pointer-events-none" />
      <motion.div 
        animate={{ rotate: -360 * 5 }}
        transition={{ duration: 2, repeat: Infinity, ease: "circIn" }}
        className="relative"
      >
        <Clock size={400} className="text-tactical-cyan opacity-10" strokeWidth={0.5} />
        <div className="absolute top-1/2 left-1/2 w-[2px] h-48 bg-tactical-cyan origin-bottom -translate-x-1/2 -translate-y-full shadow-[0_0_15px_cyan]" />
        <div className="absolute top-1/2 left-1/2 w-[4px] h-32 bg-white origin-bottom -translate-x-1/2 -translate-y-full blur-[1px]" />
      </motion.div>
      <div className="absolute inset-0 bg-[radial-gradient(circle,transparent_40%,#000_100%)] z-10" />
      <div className="absolute flex flex-col items-center gap-2">
        <motion.div 
          animate={{ scale: [1, 2], opacity: [1, 0] }}
          transition={{ duration: 1, repeat: Infinity }}
          className="text-white font-black text-8xl italic uppercase select-none"
        >
          REVERSE
        </motion.div>
        <div className="text-tactical-cyan font-mono text-xs font-black tracking-widest uppercase">Temporal_Distortion_Lock</div>
      </div>
    </div>
  );
}

function VoidMatriarchEffect() {
  return (
    <div className="w-full h-full bg-black flex items-center justify-center relative overflow-hidden">
      <motion.div 
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 2 }}
        className="relative flex flex-col items-center"
      >
        <div className="w-80 h-[500px] bg-indigo-900/20 blur-[100px] rounded-full absolute" />
        <Skull size={250} className="text-indigo-900/40 relative z-10" />
        <div className="absolute top-1/4 flex gap-4">
          <Eye className="text-indigo-500 animate-pulse" size={24} />
          <Eye className="text-indigo-500 animate-pulse" size={24} />
          <Eye className="text-indigo-500 animate-pulse" size={24} />
        </div>
      </motion.div>
      {Array.from({ length: 50 }).map((_, i) => (
        <motion.div
          key={i}
          animate={{ 
            x: [0, (Math.random()-0.5) * 1000], 
            y: [0, (Math.random()-0.5) * 1000], 
            scale: [0, 2],
            opacity: [1, 0] 
          }}
          transition={{ duration: 3, repeat: Infinity, delay: Math.random() * 5 }}
          className="absolute w-1 h-1 bg-indigo-400 rounded-full blur-[2px]"
        />
      ))}
      <div className="absolute top-10 left-1/2 -translate-x-1/2">
        <div className="text-indigo-500 font-black text-xs uppercase tracking-[2em] animate-pulse">VOiD_mAtRiArCh_oWnS_yOu</div>
      </div>
    </div>
  );
}

function CelestialOverseerEffect() {
  return (
    <div className="w-full h-full bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(251,191,36,0.05)_1px,transparent_1px)] bg-[length:30px_30px]" />
      <motion.div 
        animate={{ scale: [1, 1.05, 1] }} 
        transition={{ duration: 5, repeat: Infinity }}
        className="relative"
      >
        <div className="w-[600px] h-64 border-y-2 border-amber-500/20 rounded-[50%] flex items-center justify-center relative overflow-hidden">
          <motion.div 
            animate={{ x: [-100, 100], y: [-20, 20] }}
            transition={{ duration: 10, repeat: Infinity, repeatType: "mirror" }}
            className="w-40 h-40 bg-amber-500 rounded-full shadow-[0_0_100px_#f59e0b] relative"
          >
            <div className="absolute inset-4 bg-black rounded-full shadow-inner flex items-center justify-center overflow-hidden">
              <div className="w-full h-full bg-[radial-gradient(circle,white_1px,transparent_1px)] bg-[length:10px_10px] opacity-40" />
            </div>
          </motion.div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/20" />
        </div>
      </motion.div>
      <div className="mt-12 text-center space-y-4">
        <div className="text-amber-500 font-black text-xs uppercase tracking-[3em] animate-pulse">Watching_The_Cosmos</div>
        <div className="h-px w-96 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
      </div>
    </div>
  );
}

function WilliamHouseCrashEffect() {
  return (
    <div className="w-full h-full bg-slate-900 flex items-center justify-center relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-sky-900 to-slate-900 opacity-50" />
      
      {/* William's Assets */}
      <div className="relative z-10 flex flex-col items-center gap-12">
        <motion.div 
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="relative"
        >
          {/* The House */}
          <div className="relative w-64 h-48 bg-slate-100 rounded-lg shadow-2xl flex flex-col items-center justify-end p-4 border-b-8 border-slate-300">
             <div className="absolute -top-16 left-0 right-0 h-16 bg-slate-400 [clip-path:polygon(50%_0%,0%_100%,100%_100%)]" />
             <div className="flex gap-4 mb-4">
                <div className="w-8 h-8 bg-sky-200 border-2 border-slate-300" />
                <div className="w-8 h-8 bg-sky-200 border-2 border-slate-300" />
             </div>
             <div className="w-10 h-16 bg-amber-800 border-2 border-slate-300" />
             <div className="absolute -top-20 bg-white/10 px-4 py-1 rounded-full border border-white/20 backdrop-blur-md">
                <div className="text-[10px] font-black text-white italic tracking-widest uppercase text-center">William's House</div>
             </div>
          </div>
        </motion.div>

        {/* Youtube Channel UI */}
        <motion.div 
          animate={{ x: [0, 5, 0] }}
          transition={{ duration: 5, repeat: Infinity }}
          className="w-96 bg-black border border-white/10 rounded-xl overflow-hidden shadow-2xl relative"
        >
          <div className="h-4 bg-red-600 w-full" />
          <div className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-slate-800 rounded-full" />
            <div className="flex-1">
              <div className="h-2 w-32 bg-slate-700 rounded mb-2" />
              <div className="h-2 w-20 bg-slate-800 rounded" />
            </div>
            <div className="bg-red-600 px-3 py-1 text-[8px] font-black uppercase text-white rounded">Subscribe</div>
          </div>
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-white/10 px-4 py-1 rounded-full border border-white/20 backdrop-blur-md">
            <div className="text-[8px] font-black text-white italic tracking-widest uppercase">William's Youtube Channel</div>
          </div>
        </motion.div>
      </div>

      {/* The Rocketship Crash Animation */}
      <motion.div
        initial={{ top: '-20%', left: '120%', rotate: -45 }}
        animate={{ top: '50%', left: '50%' }}
        transition={{ duration: 1.5, ease: "circIn" }}
        className="absolute z-30"
      >
        <Rocket size={120} className="text-slate-200 drop-shadow-[0_0_30px_rgba(255,255,255,0.5)]" />
        <div className="absolute -right-10 top-1/2 -translate-y-1/2 w-48 h-8 bg-gradient-to-l from-transparent via-orange-500 to-yellow-500 blur-xl animate-pulse" />
      </motion.div>

      {/* Explosion Sequence */}
      <AnimatePresence>
        <motion.div 
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 2 }}
          transition={{ delay: 1.5, duration: 0.2 }}
          className="absolute inset-0 z-40 bg-white flex items-center justify-center"
        >
           <motion.div 
             animate={{ scale: [1, 10], opacity: [1, 0] }}
             transition={{ duration: 1, delay: 1.5 }}
             className="w-full h-full bg-orange-600 rounded-full blur-[100px]"
           />
           <div className="text-black font-black text-6xl italic tracking-tighter uppercase whitespace-nowrap">REDACTED_BY_NETWORK</div>
        </motion.div>
      </AnimatePresence>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-50">
        <div className="text-[10px] text-white/20 font-black tracking-[1em] uppercase italic">1_IN_1000_RARE_EVENT</div>
      </div>
    </div>
  );
}

function MeltingSiliconEffect() {
  return (
    <div className="w-full h-full bg-slate-950 flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 flex flex-wrap opacity-40">
        {Array.from({ length: 400 }).map((_, i) => (
          <motion.div
            key={i}
            animate={{ 
              scale: [1, 1.2, 0.8, 1],
              opacity: [0.2, 0.5, 0.2],
              borderRadius: ["0%", "50%", "20%", "0%"]
            }}
            transition={{ duration: 3, repeat: Infinity, delay: Math.random() * 2 }}
            className="w-8 h-8 bg-orange-600/20 m-1"
          />
        ))}
      </div>
      <div className="relative z-10 flex flex-col items-center">
        <motion.div
          animate={{ 
            y: [0, 10, 0],
            skewX: [-5, 5, -5]
          }}
          transition={{ duration: 0.2, repeat: Infinity }}
          className="relative"
        >
          <Cpu size={200} className="text-orange-500 blur-[2px]" strokeWidth={0.5} />
          <motion.div 
            animate={{ height: ["0%", "100%", "0%"] }}
            transition={{ duration: 5, repeat: Infinity }}
            className="absolute top-0 left-1/2 w-4 bg-orange-600/50 blur-lg -translate-x-1/2"
          />
        </motion.div>
        <div className="mt-8 text-orange-600 font-black text-4xl italic tracking-tighter uppercase animate-pulse">HARDWARE_MELtdown</div>
      </div>
    </div>
  );
}
