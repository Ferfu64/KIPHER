import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Skull } from 'lucide-react';

// Common swear words for detection
const SWEAR_WORDS = ['fuck', 'shit', 'ass', 'bitch', 'damn', 'hell', 'bastard', 'crap', 'piss', 'dick', 'pussy'];

export default function VoiceProtocolHandler() {
  const [showSkullOverlay, setShowSkullOverlay] = useState(false);
  const [showSwearingAlert, setShowSwearingAlert] = useState(false);

  useEffect(() => {
    // Check for speech recognition support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('Speech Recognition is not supported in this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true; // Use interim results for faster response
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      let currentTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          currentTranscript += event.results[i][0].transcript.toLowerCase();
        }
      }
      
      if (!currentTranscript) return;

      console.log('[VOICE_PROTOCOL] Transcript:', currentTranscript);

      // 1. "kip - her" detection
      // Added variations since recognition can vary
      const kipherPatterns = ['kip her', 'kipher', 'kip-her', 'kipper', 'keep her'];
      if (kipherPatterns.some(p => currentTranscript.includes(p))) {
        console.log('[SYSTEM_ALERT] KIPHER_PHRASE_DETECTED');
        setShowSkullOverlay(true);
        // Requirement: "takes over the whole users screen"
        setTimeout(() => setShowSkullOverlay(false), 8000); // 8 seconds of terror
      }

      // 2. "cipher" detection - requirement: "nothing happens"
      if (currentTranscript.includes('cipher')) {
        console.log('[SYSTEM_INFO] CIPHER_DETECTED: IGNORING_AS_PER_PROTOCOL');
        // Explicitly doing nothing
      }

      // 3. Swear word detection
      if (SWEAR_WORDS.some(word => currentTranscript.includes(word))) {
        console.log('[WARNING] HOSTILE_LANGUAGE_DETECTED');
        setShowSwearingAlert(true);
        setTimeout(() => setShowSwearingAlert(false), 4000);
      }
    };

    recognition.onerror = (event: any) => {
      if (event.error === 'no-speech') return;
      console.error('[VOICE_PROTOCOL] Error:', event.error);
    };

    recognition.onend = () => {
      // Auto-restart to keep it always listening
      try {
        recognition.start();
      } catch (e) {
        // Already started or blocked
      }
    };

    try {
      recognition.start();
    } catch (e) {
      console.error('[VOICE_PROTOCOL] Initial start failed:', e);
    }

    return () => {
      try {
        recognition.onend = null;
        recognition.stop();
      } catch (e) {}
    };
  }, []);

  return (
    <>
      {/* Full Screen Skull Overlay */}
      <AnimatePresence>
        {showSkullOverlay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200000] bg-black flex flex-col items-center justify-center p-10 cursor-none"
          >
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ repeat: Infinity, duration: 0.5 }}
            >
              <Skull className="w-[80vh] h-[80vh] text-red-600 drop-shadow-[0_0_100px_rgba(220,38,38,0.8)]" />
            </motion.div>
            <motion.div 
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="mt-8 text-6xl font-black text-white italic tracking-tighter uppercase kipher-glitch"
              data-text="SYSTEM_OVERTAKEN"
            >
              SYSTEM_OVERTAKEN
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Swearing Warning Alert */}
      <AnimatePresence>
        {showSwearingAlert && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="fixed inset-0 z-[199999] flex items-center justify-center pointer-events-none"
          >
            <div className="bg-slate-950/95 border-4 border-red-500 p-12 rounded-[2rem] flex flex-col items-center gap-6 shadow-[0_0_100px_rgba(239,68,68,0.4)] backdrop-blur-xl">
               <motion.div
                 animate={{ rotate: [0, 10, -10, 0] }}
                 transition={{ repeat: Infinity, duration: 0.3 }}
               >
                 <Skull className="w-32 h-32 text-red-500" />
               </motion.div>
               <div className="text-4xl font-black text-white uppercase tracking-tighter italic kipher-glitch" data-text="why you swearing">
                 why you swearing
               </div>
               <div className="text-red-500/50 text-xs font-bold tracking-[0.4em] animate-pulse">
                 HOSTILE_INTENT_LOGGED
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
