import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal as TerminalIcon, X } from 'lucide-react';

interface Point {
  x: number;
  y: number;
}

export default function GestureListener({ onTrigger }: { onTrigger: () => void }) {
  const [isTracking, setIsTracking] = useState(false);
  const points = useRef<Point[]>([]);

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 2) { // Right click
        setIsTracking(true);
        points.current = [{ x: e.clientX, y: e.clientY }];
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (isTracking) {
        points.current.push({ x: e.clientX, y: e.clientY });
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (e.button === 2 && isTracking) {
        setIsTracking(false);
        if (detectSeven(points.current)) {
          onTrigger();
        }
        points.current = [];
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      // Prevent context menu while tracking or if it's the right click we're using
      e.preventDefault();
    };

    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('contextmenu', handleContextMenu);

    const handleKeyDown = (e: any) => {
      if (e.shiftKey && e.key === '7') {
        onTrigger();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isTracking, onTrigger]);

  const detectSeven = (path: Point[]) => {
    if (path.length < 10) return false;

    const start = path[0];
    const end = path[path.length - 1];

    // Find the "corner" of the 7
    // Segment 1: Horizontal right
    // Segment 2: Diagonal down-left
    
    let maxRight = start.x;
    let cornerIndex = 0;
    
    for (let i = 0; i < path.length; i++) {
      if (path[i].x > maxRight) {
        maxRight = path[i].x;
        cornerIndex = i;
      }
    }

    const corner = path[cornerIndex];

    // Horizontal check (Segment 1)
    const horizontalDist = corner.x - start.x;
    const horizontalVertDist = Math.abs(corner.y - start.y);
    const isHorizontal = horizontalDist > 100 && horizontalVertDist < 50;

    // Diagonal check (Segment 2)
    const diagonalXDist = corner.x - end.x;
    const diagonalYDist = end.y - corner.y;
    const isDiagonal = diagonalXDist > 50 && diagonalYDist > 100;

    return isHorizontal && isDiagonal;
  };

  return null; // This is a logic-only component
}

export function GhostTerminal({ isOpen, onClose, onAuth }: { isOpen: boolean, onClose: () => void, onAuth: (key: string) => void }) {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAuth(input);
    setInput('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[1000] bg-black/95 flex items-center justify-center p-4 font-mono"
        >
          <div className="max-w-md w-full border border-tactical-cyan p-6 relative">
            <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-tactical-cyan">
              <X size={20} />
            </button>
            
            <div className="flex items-center gap-2 text-tactical-cyan mb-8">
              <TerminalIcon size={24} className="animate-pulse" />
              <span className="text-sm font-black tracking-widest uppercase">GHOST_OVERRIDE_TERMINAL</span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-[10px] text-slate-500 uppercase">INPUT_ENCRYPTION_KEY_FOR_ROOT_ACCESS:</p>
              <div className="relative">
                <span className="absolute left-0 top-1/2 -translate-y-1/2 text-tactical-cyan">{'>'}</span>
                <input 
                  autoFocus
                  type="password"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="w-full bg-transparent border-b border-tactical-cyan/30 focus:border-tactical-cyan outline-none pl-6 py-2 text-tactical-cyan tracking-[0.5em]"
                />
              </div>
              <div className="flex justify-end pt-4">
                <div className="text-[8px] text-slate-700 uppercase font-bold">
                  AUTH_STATE: PENDING_VALIDATION
                </div>
              </div>
            </form>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
