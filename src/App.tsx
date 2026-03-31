/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';

function Digit({ value }: { value: string }) {
  return (
    <div 
      className="relative flex items-center justify-center overflow-hidden bg-zinc-900 border border-zinc-800 shadow-2xl"
      style={{ 
        width: 'min(12vw, 18vh)', 
        height: 'min(18vw, 27vh)', 
        borderRadius: 'min(1.5vw, 2.5vh)' 
      }}
    >
      {/* Gradient overlay for physical look */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/60 pointer-events-none z-10" />
      
      {/* Center split line */}
      <div className="absolute left-0 right-0 top-1/2 h-[2px] -translate-y-1/2 bg-black z-20 shadow-[0_0_4px_rgba(0,0,0,0.8)]" />

      <AnimatePresence mode="popLayout">
        <motion.div
          key={value}
          initial={{ y: "80%", opacity: 0, rotateX: -45 }}
          animate={{ y: 0, opacity: 1, rotateX: 0 }}
          exit={{ y: "-80%", opacity: 0, rotateX: 45 }}
          transition={{ 
            type: "spring", 
            stiffness: 150, 
            damping: 15,
            mass: 1
          }}
          className="absolute font-bold text-zinc-100 font-mono tracking-tighter"
          style={{ 
            fontSize: 'min(13vw, 19vh)',
            transformStyle: "preserve-3d" 
          }}
        >
          {value}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function TimeSection({ value }: { value: number }) {
  const padded = value.toString().padStart(2, '0');
  return (
    <div className="flex" style={{ gap: 'min(1vw, 1.5vh)' }}>
      <Digit value={padded[0]} />
      <Digit value={padded[1]} />
    </div>
  );
}

export default function App() {
  const [time, setTime] = useState(new Date());
  const [mounted, setMounted] = useState(false);
  const [isIdle, setIsIdle] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Idle detection for screensaver mode
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    const handleActivity = () => {
      setIsIdle(false);
      clearTimeout(timeout);
      timeout = setTimeout(() => setIsIdle(true), 3000);
    };
    
    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('touchstart', handleActivity);
    window.addEventListener('click', handleActivity);
    
    handleActivity();
    
    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('touchstart', handleActivity);
      window.removeEventListener('click', handleActivity);
      clearTimeout(timeout);
    };
  }, []);

  // Burn-in prevention (subtle drift)
  useEffect(() => {
    if (!isIdle) {
      setPosition({ x: 0, y: 0 });
      return;
    }
    
    const moveInterval = setInterval(() => {
      setPosition({
        x: Math.random() * 10 - 5, // -5% to 5%
        y: Math.random() * 10 - 5
      });
    }, 5000);
    
    return () => clearInterval(moveInterval);
  }, [isIdle]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  if (!mounted) return <div className="h-screen w-screen bg-black" />;

  return (
    <div 
      onClick={toggleFullscreen}
      className={`flex h-screen w-screen overflow-hidden flex-col items-center justify-center bg-black transition-colors duration-1000 ${isIdle ? 'cursor-none' : 'cursor-default'}`}
    >
      {/* Screensaver overlay hint */}
      <div 
        className={`absolute top-8 text-zinc-500 font-mono text-sm tracking-widest transition-opacity duration-1000 ${isIdle ? 'opacity-0' : 'opacity-100'}`}
      >
        CLICK ANYWHERE FOR FULLSCREEN
      </div>

      <motion.div 
        className="flex items-center"
        style={{ 
          gap: 'min(2vw, 3vh)',
          perspective: "1000px" 
        }}
        animate={{
          x: isIdle ? `${position.x}vw` : "0vw",
          y: isIdle ? `${position.y}vh` : "0vh",
          scale: isIdle ? 0.95 : 1
        }}
        transition={{
          duration: 5,
          ease: "easeInOut"
        }}
      >
        <TimeSection value={time.getHours()} />
        
        <div className="flex flex-col pb-[min(1vw,1.5vh)]" style={{ gap: 'min(2vw, 3vh)' }}>
          <div className="rounded-full bg-zinc-700 animate-pulse" style={{ width: 'min(1.5vw, 2.5vh)', height: 'min(1.5vw, 2.5vh)' }} />
          <div className="rounded-full bg-zinc-700 animate-pulse" style={{ width: 'min(1.5vw, 2.5vh)', height: 'min(1.5vw, 2.5vh)' }} />
        </div>
        
        <TimeSection value={time.getMinutes()} />
        
        <div className="flex flex-col pb-[min(1vw,1.5vh)]" style={{ gap: 'min(2vw, 3vh)' }}>
          <div className="rounded-full bg-zinc-700 animate-pulse" style={{ width: 'min(1.5vw, 2.5vh)', height: 'min(1.5vw, 2.5vh)' }} />
          <div className="rounded-full bg-zinc-700 animate-pulse" style={{ width: 'min(1.5vw, 2.5vh)', height: 'min(1.5vw, 2.5vh)' }} />
        </div>
        
        <TimeSection value={time.getSeconds()} />
      </motion.div>
    </div>
  );
}
