import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Ghost, AlertTriangle, Zap } from 'lucide-react';

export default function GhostInTheMachine() {
  const [isActive, setIsActive] = useState(false);
  const [glitchText, setGlitchText] = useState('');
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const crypticMessages = [
    "I_SEE_YOU",
    "THE_VINE_IS_WATCHING",
    "REBOOT_ABORTED",
    "WHO_ARE_YOU?",
    "YOU_DONT_BELONG_HERE",
    "SYSTEM_ERR_0x99",
    "K7_HAS_EYES",
    "VOID_CONSUMES",
  ];

  useEffect(() => {
    const trigger = () => {
      // Rare chance: 1 in 1000 every 30 seconds
      if (Math.random() < 0.05) { // Increased for demo/testing, usually would be much lower
        setIsActive(true);
        setGlitchText(crypticMessages[Math.floor(Math.random() * crypticMessages.length)]);
        setPosition({ 
          x: Math.random() * 80 + 10, 
          y: Math.random() * 80 + 10 
        });

        setTimeout(() => setIsActive(false), 3000);
      }
    };

    const interval = setInterval(trigger, 30000);
    return () => clearInterval(interval);
  }, []);

  if (!isActive) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ 
          opacity: [0, 1, 0.8, 1, 0],
          scale: [0.5, 1.2, 1, 1.5, 0.8],
          x: position.x + '%',
          y: position.y + '%',
        }}
        exit={{ opacity: 0 }}
        transition={{ duration: 3, ease: "easeInOut" }}
        className="fixed z-[1000] pointer-events-none flex flex-col items-center justify-center mix-blend-difference"
      >
        <div className="relative">
          <Ghost size={120} className="text-white opacity-20 blur-sm absolute" />
          <Ghost size={120} className="text-tactical-cyan animate-pulse" />
          <motion.div 
            animate={{ skewX: [0, 45, -45, 0], opacity: [1, 0, 1] }}
            transition={{ repeat: Infinity, duration: 0.2 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <Ghost size={120} className="text-red-500 opacity-50" />
          </motion.div>
        </div>
        
        <div className="mt-4 bg-black text-tactical-cyan px-4 py-1 text-xs font-mono font-black tracking-[0.5em] border border-tactical-cyan/40">
          <motion.span
            animate={{ opacity: [1, 0, 1] }}
            transition={{ repeat: Infinity, duration: 0.1 }}
          >
            {glitchText}
          </motion.span>
        </div>
        
        <div className="absolute -inset-20 bg-tactical-cyan/5 blur-3xl rounded-full" />
      </motion.div>
      
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.1, 0, 0.05, 0] }}
        transition={{ duration: 0.5 }}
        className="fixed inset-0 bg-white pointer-events-none z-[999]"
      />
    </AnimatePresence>
  );
}
