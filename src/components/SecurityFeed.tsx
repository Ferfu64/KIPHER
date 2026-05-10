import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, CameraOff, Scan, Shield, Maximize2, Minimize2, Activity } from 'lucide-react';

export default function SecurityFeed() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user"
        } 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setIsCapturing(true);
      setError(null);
    } catch (err) {
      console.error("Camera access failed:", err);
      setError("CAMERA_LINK_FAILED: PERMISSION_DENIED");
      setIsCapturing(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCapturing(false);
  };

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  return (
    <div className={`relative ${isFullscreen ? 'fixed inset-0 z-[100000] bg-black' : 'w-full aspect-video bg-slate-900 border border-white/10 rounded-xl overflow-hidden'}`}>
      {!isCapturing ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
          <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center animate-pulse">
            <Camera size={32} className="text-white/20" />
          </div>
          <div className="text-center">
            <h4 className="text-xs font-black text-white/40 uppercase tracking-[0.3em]">Neural_Feed_Offline</h4>
            <p className="text-[10px] text-slate-600 mt-1 uppercase font-mono italic">Establish secure visual link</p>
          </div>
          <button 
            onClick={startCamera}
            className="mt-2 kipher-button px-6 py-2 bg-tactical-cyan text-black"
          >
            INITIATE_LINK
          </button>
          {error && <p className="text-[9px] text-red-500 font-bold mt-2 animate-bounce">{error}</p>}
        </div>
      ) : (
        <>
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            className="w-full h-full object-cover"
            style={{ transform: 'scaleX(-1)' }} 
          />
          
          {/* HUD Overlays */}
          <div className="absolute inset-0 pointer-events-none border-[20px] border-black/20" />
          
          {/* Scanning Animation */}
          <motion.div 
            animate={{ top: ['0%', '100%', '0%'] }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="absolute left-0 right-0 h-0.5 bg-tactical-cyan/40 shadow-[0_0_15px_rgba(34,211,238,0.5)] z-10"
          />

          <div className="absolute inset-0 z-20 p-4 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div className="bg-black/60 backdrop-blur-md border border-white/10 p-2 rounded flex items-center gap-3">
                <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse shadow-[0_0_10px_#dc2626]" />
                <div className="flex flex-col">
                  <span className="text-[9px] font-black text-white uppercase tracking-widest">LIVE_FEED // NODE_{Math.random().toString(36).substring(7).toUpperCase()}</span>
                  <span className="text-[7px] text-slate-400 font-mono">SECURE_TUNNEL_ACTIVE // AES-256</span>
                </div>
              </div>
              
              <div className="flex gap-2 pointer-events-auto">
                <button 
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="p-2 bg-black/60 border border-white/10 rounded hover:bg-tactical-cyan hover:text-black transition-all"
                >
                  {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                </button>
                <button 
                  onClick={stopCamera}
                  className="p-2 bg-black/60 border border-white/10 rounded hover:bg-red-600 hover:text-white transition-all"
                >
                  <CameraOff size={14} />
                </button>
              </div>
            </div>

            <div className="flex justify-between items-end">
              <div className="space-y-1">
                <div className="flex items-center gap-2 bg-black/40 px-2 py-1 rounded border border-white/5">
                  <Activity size={10} className="text-tactical-cyan" />
                  <span className="text-[8px] text-tactical-cyan font-black uppercase">Motion_Detection: ACTIVE</span>
                </div>
                <div className="flex items-center gap-2 bg-black/40 px-2 py-1 rounded border border-white/5">
                  <Scan size={10} className="text-tactical-cyan" />
                  <span className="text-[8px] text-tactical-cyan font-black uppercase">Biometric_Pass: READY</span>
                </div>
              </div>

              <div className="text-right">
                <div className="text-[10px] font-black text-white/50 italic tracking-tighter uppercase mb-1">Network_Presence_Confirmed</div>
                <Shield size={24} className="text-tactical-cyan ml-auto animate-pulse" />
              </div>
            </div>
          </div>

          {/* Grain Effect */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.03] select-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />
        </>
      )}
    </div>
  );
}
