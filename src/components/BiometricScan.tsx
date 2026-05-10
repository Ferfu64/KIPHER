import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, ShieldCheck, Fingerprint, Scan, AlertCircle, RefreshCw } from 'lucide-react';

interface BiometricScanProps {
  onComplete: () => void;
  onFail?: () => void;
}

export default function BiometricScan({ onComplete, onFail }: BiometricScanProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [status, setStatus] = useState<'IDLE' | 'INITIATING' | 'SCANNING' | 'VERIFYING' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');

  const startCamera = async () => {
    setStatus('INITIATING');
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(s);
      if (videoRef.current) {
        videoRef.current.srcObject = s;
      }
      setStatus('SCANNING');
    } catch (err) {
      console.error(err);
      setStatus('ERROR');
      setErrorMessage('CAMERA_ACCESS_DENIED or NOT_FOUND');
    }
  };

  useEffect(() => {
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (status === 'SCANNING') {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setStatus('VERIFYING');
            return 100;
          }
          return prev + 2;
        });
      }, 50);
      return () => clearInterval(interval);
    }
  }, [status]);

  useEffect(() => {
    if (status === 'VERIFYING') {
      const timeout = setTimeout(() => {
        setStatus('SUCCESS');
        setTimeout(() => {
          onComplete();
        }, 1500);
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [status, onComplete]);

  return (
    <div className="w-full h-full bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden font-mono">
      {/* Background HUD Grid */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #00f3ff 1px, transparent 0)', backgroundSize: '30px 30px' }} />

      <div className="relative z-10 w-full max-w-md bg-black border-2 border-tactical-cyan/30 rounded-xl overflow-hidden shadow-[0_0_50px_rgba(0,243,255,0.1)]">
        {/* Header */}
        <div className="bg-tactical-cyan/10 border-b border-tactical-cyan/30 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="text-tactical-cyan animate-pulse" size={20} />
            <span className="text-xs font-black tracking-widest text-tactical-cyan uppercase">Neural_Biometric_Scan</span>
          </div>
          <div className="text-[10px] text-slate-500 uppercase tracking-tighter">LVL_5_CLEARANCE</div>
        </div>

        {/* Viewport */}
        <div className="aspect-video bg-zinc-900 relative">
          <AnimatePresence mode="wait">
            {status === 'ERROR' ? (
              <motion.div 
                key="error"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="absolute inset-0 flex flex-col items-center justify-center text-red-500 p-8 text-center"
              >
                <AlertCircle size={48} className="mb-4 animate-bounce" />
                <div className="text-sm font-black mb-2 uppercase">VERIFICATION_FAILURE</div>
                <div className="text-[10px] opacity-70">{errorMessage}</div>
                <button 
                  onClick={startCamera}
                  className="mt-6 flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/50 hover:bg-red-500/20 transition-colors text-[10px] font-bold uppercase"
                >
                  <RefreshCw size={14} /> Retry_Neural_Link
                </button>
              </motion.div>
            ) : (
              <div className="w-full h-full relative">
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  muted 
                  className={`w-full h-full object-cover grayscale brightness-50 contrast-125 transition-opacity duration-1000 ${status === 'SCANNING' || status === 'VERIFYING' || status === 'SUCCESS' ? 'opacity-100' : 'opacity-0'}`}
                />
                
                {/* HUD Elements */}
                <div className="absolute inset-0 pointer-events-none">
                  {/* Scanning Line */}
                  {status === 'SCANNING' && (
                    <motion.div 
                      animate={{ top: ['0%', '100%', '0%'] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                      className="absolute left-0 right-0 h-1 bg-tactical-cyan shadow-[0_0_15px_#00f3ff] z-20"
                    />
                  )}

                  {/* Corner Marks */}
                  <div className="absolute top-4 left-4 w-10 h-10 border-t-2 border-l-2 border-tactical-cyan/50" />
                  <div className="absolute top-4 right-4 w-10 h-10 border-t-2 border-r-2 border-tactical-cyan/50" />
                  <div className="absolute bottom-4 left-4 w-10 h-10 border-b-2 border-l-2 border-tactical-cyan/50" />
                  <div className="absolute bottom-4 right-4 w-10 h-10 border-b-2 border-r-2 border-tactical-cyan/50" />

                  {/* Reticle */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border border-tactical-cyan/20 rounded-full flex items-center justify-center">
                    <div className="w-4 h-4 border border-tactical-cyan/40" />
                    <div className="absolute inset-0 border-t-2 border-tactical-cyan w-4 h-4 animate-ping" />
                  </div>
                </div>

                {/* Overlay Status */}
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="bg-black/60 backdrop-blur-md border border-white/10 p-2 rounded flex flex-col gap-1">
                    <div className="flex justify-between text-[8px] font-bold text-tactical-cyan uppercase">
                      <span>PROCESS: {status}</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                      <motion.div 
                        animate={{ width: `${progress}%` }}
                        className="h-full bg-tactical-cyan"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </AnimatePresence>

          {/* Verification Highlight */}
          {status === 'VERIFYING' && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="absolute inset-0 bg-tactical-cyan/10 flex items-center justify-center"
            >
              <div className="text-center">
                <Fingerprint size={64} className="text-tactical-cyan mx-auto mb-2 animate-pulse" />
                <div className="text-[10px] font-black tracking-widest text-tactical-cyan uppercase">Cross_Referencing_Node_DB...</div>
              </div>
            </motion.div>
          )}

          {/* Success Reveal */}
          {status === 'SUCCESS' && (
            <motion.div 
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="absolute inset-0 bg-tactical-cyan flex flex-col items-center justify-center z-50"
            >
              <div className="bg-black p-8 rounded-full mb-4 shadow-[0_0_50px_black]">
                <Scan size={80} className="text-tactical-cyan animate-pulse" />
              </div>
              <div className="text-black font-black text-2xl tracking-[0.2em] italic uppercase">Identity_Verified</div>
              <div className="text-black/60 text-[10px] font-mono mt-2">LOGIN_VALIDATED // SESSION_SECURED</div>
            </motion.div>
          )}
        </div>
      </div>

      <div className="mt-8 flex flex-col items-center gap-2 opacity-50">
        <div className="text-[10px] tracking-widest text-tactical-cyan uppercase font-bold">Neural_Terminal_v4.2</div>
        <div className="flex gap-4">
          <div className="w-1 h-1 bg-tactical-cyan animate-ping" />
          <div className="w-1 h-1 bg-tactical-cyan animate-ping delay-100" />
          <div className="w-1 h-1 bg-tactical-cyan animate-ping delay-200" />
        </div>
      </div>
    </div>
  );
}
