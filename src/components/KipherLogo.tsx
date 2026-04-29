import React from 'react';
import { motion } from 'framer-motion';

interface KipherLogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
}

export default function KipherLogo({ className = "", size = 120, showText = true }: KipherLogoProps) {
  return (
    <div className={`flex flex-col items-center gap-4 ${className}`}>
      <motion.svg 
        width={size} 
        height={size} 
        viewBox="0 0 400 400" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        {/* Symmetric Shield/Gate Wings */}
        <motion.path
          d="M140 80L180 120V320L100 240V120L140 80Z"
          fill="var(--color-kipher-orange)"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        />
        <motion.path
          d="M260 80L220 120V320L300 240V120L260 80Z"
          fill="var(--color-kipher-orange)"
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        />
        
        {/* Inner Geometric Details */}
        <motion.path
          d="M150 140L170 160V280L130 240V160L150 140Z"
          fill="#B45309" /* Deep Amber */
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ delay: 0.5 }}
        />
        <motion.path
          d="M250 140L230 160V280L270 240V160L250 140Z"
          fill="#B45309"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ delay: 0.5 }}
        />

        {/* Central Aperture */}
        <motion.circle
          cx="200"
          cy="180"
          r="10"
          fill="white"
          animate={{ opacity: [0.2, 1, 0.2] }}
          transition={{ duration: 2, repeat: Infinity }}
        />

        {/* Outer Tech Accents */}
        <motion.path
          d="M80 160L100 180H60L80 160Z"
          fill="var(--color-kipher-orange)"
          opacity="0.5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
        />
        <motion.path
          d="M320 160L300 180H340L320 160Z"
          fill="var(--color-kipher-orange)"
          opacity="0.5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
        />
      </motion.svg>

      {showText && (
        <motion.div
          initial={{ opacity: 0, letterSpacing: "1em" }}
          animate={{ opacity: 1, letterSpacing: "0.2em" }}
          transition={{ delay: 0.4, duration: 1 }}
          className="text-white font-bold text-4xl tracking-[0.2em] relative"
        >
          KIPHER
          <div className="absolute -bottom-2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-kipher-orange to-transparent" />
        </motion.div>
      )}
    </div>
  );
}
