import React, { useState, useEffect, useRef } from 'react';
import { db } from '../lib/firebase';
import { collection, query, where, onSnapshot, orderBy, limit, serverTimestamp, addDoc, Timestamp } from 'firebase/firestore';
import { UserProfile, SystemCommand } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, AlertTriangle, Ghost, RefreshCw, X, Search, Globe, Lock } from 'lucide-react';
import { handleFirestoreError, OperationType } from '../lib/utils';
import { audioService } from '../services/audioService';

export default function TacticalProtocolHandler({ currentUser }: { currentUser: UserProfile }) {
  const [panicMode, setPanicMode] = useState(false);
  const [mediaInject, setMediaInject] = useState<string | null>(null);
  const [systemAlert, setSystemAlert] = useState<string | null>(null);
  const [safetyConfig, setSafetyConfig] = useState({ link: 'https://classroom.google.com' });
  const [gestureStart, setGestureStart] = useState<{ x: number, y: number } | null>(null);
  const clickData = useRef({ count: 0, lastTime: 0 });
  const mountTime = useRef(Date.now());

  // 1. Listen for Remote Commands
  useEffect(() => {
    const q = query(
      collection(db, 'system_commands'),
      where('active', '==', true),
      where('targetUserId', 'in', ['GLOBAL', currentUser.uid])
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const cmd = change.doc.data() as SystemCommand;
          const timestamp = cmd.timestamp as Timestamp | null;
          
          // If no timestamp yet, it's a local optimistic update or just sent
          // We still want to process it if we can
          const cmdTime = timestamp ? timestamp.toMillis() : Date.now();
          
          const isFresh = cmdTime > (mountTime.current - 30000); // 30s grace
          
          if (isFresh) {
            handleIncomingCommand(cmd);
          }
        }
      });
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'system_commands'));

    return unsubscribe;
  }, [currentUser.uid]);

  const handleIncomingCommand = (cmd: SystemCommand) => {
    switch (cmd.type) {
      case 'REDIRECT':
        if (cmd.payload) {
          window.location.href = cmd.payload.startsWith('http') ? cmd.payload : `https://${cmd.payload}`;
        }
        break;
      case 'SAFETY':
        activatePanicMode(cmd.payload);
        break;
      case 'RESTORE':
        respawn();
        break;
      case 'ALERT':
        setSystemAlert(cmd.payload);
        setTimeout(() => setSystemAlert(null), 8000);
        break;
      case 'MEDIA':
        setMediaInject(cmd.payload);
        setTimeout(() => setMediaInject(null), 30000); // 30s TTL
        break;
      case 'SPAWN_CUTSCENE':
        window.dispatchEvent(new CustomEvent('kipher:spawnCutscene', { detail: cmd.payload }));
        break;
    }
  };

  const activatePanicMode = (targetLink?: string) => {
    setPanicMode(true);
    if (targetLink) setSafetyConfig({ link: targetLink });
  };

  // 2. Gesture Detection: Horizontal Line & 6 Clicks
  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      setGestureStart({ x: e.clientX, y: e.clientY });
      
      // 6-Click Detection
      const now = Date.now();
      if (now - clickData.current.lastTime < 500) {
        clickData.current.count++;
      } else {
        clickData.current.count = 1;
      }
      clickData.current.lastTime = now;

      if (clickData.current.count >= 6) {
        activatePanicMode();
        clickData.current.count = 0;
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (!gestureStart) return;
      const dx = Math.abs(e.clientX - gestureStart.x);
      const dy = Math.abs(e.clientY - gestureStart.y);
      
      // Horizontal Line -> Respawn (as requested)
      if (dx > 250 && dy < 40) {
        respawn();
      }
      // Vertical Line -> Panic (additional safety)
      if (dy > 250 && dx < 40) {
        activatePanicMode();
      }
      setGestureStart(null);
    };

    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [gestureStart]);

  // 3. Global Return Keybind
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      // Direct R key for quick respawn when in panic mode
      if (panicMode && e.key.toLowerCase() === 'r') {
        respawn();
        return;
      }

      // Secret Return Key: Shift + Alt + R
      if (e.shiftKey && e.altKey && e.key.toLowerCase() === 'r') {
        respawn();
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [panicMode]);

  const respawn = () => {
    setPanicMode(false);
    setMediaInject(null);
    setSystemAlert(null);
    window.dispatchEvent(new CustomEvent('kipher:respawn'));
    audioService.playSuccess();
  };

  return (
    <>
      <AnimatePresence>
        {mediaInject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/95 p-8 backdrop-blur-sm"
          >
            <div className="relative max-w-3xl w-full border border-white/10 bg-black p-2 shadow-[0_0_100px_rgba(34,211,238,0.1)]">
              <div className="bg-tactical-cyan text-black text-[10px] font-black p-2 mb-2 flex justify-between items-center px-4 uppercase tracking-[0.2em]">
                <span>TERMINAL_INJECT // EPHEMERAL_STREAM</span>
                <button onClick={() => setMediaInject(null)} className="hover:scale-125 transition-transform"><X size={14}/></button>
              </div>
              <img src={mediaInject} alt="INJECT" className="w-full aspect-video object-cover" referrerPolicy="no-referrer" />
            </div>
          </motion.div>
        )}

        {systemAlert && (
          <motion.div 
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-1 left-0 right-0 z-[10001] px-4 flex justify-center pointer-events-none"
          >
            <div className="bg-red-600 text-black p-3 font-black flex items-center gap-4 shadow-2xl border-2 border-red-400 max-w-2xl w-full">
              <ShieldAlert size={20} />
              <div className="flex-1 flex items-center justify-between">
                <span className="text-sm uppercase tracking-tighter truncate">{systemAlert}</span>
                <span className="text-[9px] opacity-50 uppercase font-black shrink-0 ml-4">Broadcast_Priority_A</span>
              </div>
            </div>
          </motion.div>
        )}

        {panicMode && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60000] bg-white flex flex-col items-center select-none cursor-default"
          >
            {/* The "Safety Buffer" - Iframe to a real educational resource */}
            <div className="w-full h-full relative group">
               <iframe 
                 src="https://www.google.com/search?igu=1&q=advanced+mathematics+definitions"
                 className="w-full h-full border-none shadow-inner"
                 title="Safety_Buffer"
                 referrerPolicy="no-referrer"
               />
               
               {/* 
                  Enhanced return capture. We use a larger, invisible area that doesn't block 
                  the main content interactions but is easy to hit for the emergency return.
               */}
               <div 
                 className="absolute inset-x-0 top-0 h-24 bg-transparent z-[60001] cursor-default"
                 onMouseDown={(e) => {
                   const now = Date.now();
                   // If last click was more than 1s ago, reset
                   if (now - clickData.current.lastTime > 1000) {
                     clickData.current.count = 1;
                   } else {
                     clickData.current.count++;
                   }
                   clickData.current.lastTime = now;

                   if (clickData.current.count >= 6) {
                     respawn();
                     clickData.current.count = 0;
                   }
                 }}
               />
               
               <div className="absolute bottom-4 right-4 text-[8px] text-gray-300 font-mono pointer-events-none opacity-20">
                 BUFFER_ACTIVE // ENCRYPTION_STABLE
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {currentUser.clearanceLevel >= 4 && (
        <div className="fixed bottom-4 right-4 z-[50000]">
           <button 
             onClick={respawn}
             className="p-2 bg-slate-950 border border-slate-900 text-slate-700 hover:text-tactical-cyan hover:border-tactical-cyan transition-all group"
             title="RESPAWN_STATE (SHIFT+ALT+R)"
           >
             <RefreshCw size={16} className="group-hover:rotate-180 transition-transform duration-500" />
           </button>
        </div>
      )}
    </>
  );
}
