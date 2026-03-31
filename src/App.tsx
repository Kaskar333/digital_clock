/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, MouseEvent as ReactMouseEvent } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Clock, Palette, Monitor } from 'lucide-react';

function Digit({ value, color }: { value: string, color: string }) {
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
          className="absolute font-bold font-mono tracking-tighter"
          style={{
            fontSize: 'min(13vw, 19vh)',
            transformStyle: "preserve-3d",
            color: color
          }}
        >
          {value}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function TimeSection({ value, color }: { value: number, color: string }) {
  const padded = value.toString().padStart(2, '0');
  return (
    <div className="flex" style={{ gap: 'min(1vw, 1.5vh)' }}>
      <Digit value={padded[0]} color={color} />
      <Digit value={padded[1]} color={color} />
    </div>
  );
}

function AnalogueClock({ time, color }: { time: Date, color: string }) {
  const seconds = time.getSeconds();
  const minutes = time.getMinutes();
  const hours = time.getHours();

  // Calculate degrees
  const secondDeg = seconds * 6;
  const minuteDeg = minutes * 6 + seconds * 0.1;
  const hourDeg = (hours % 12) * 30 + minutes * 0.5;

  return (
    <div
      className="relative flex items-center justify-center rounded-full transition-colors duration-500"
      style={{
        width: 'min(85vw, 85vh)',
        height: 'min(85vw, 85vh)',
        backgroundColor: 'transparent',
        border: `min(0.8vw, 0.8vh) solid ${color}`,
        boxShadow: `0 0 min(4vw, 4vh) ${color}, inset 0 0 min(4vw, 4vh) ${color}`
      }}
    >
      {/* Numbers 1-12 */}
      {[...Array(12)].map((_, i) => {
        const num = i === 0 ? 12 : i;
        const angle = i * 30;
        return (
          <div
            key={i}
            className="absolute inset-0 flex items-start justify-center pointer-events-none"
            style={{
              transform: `rotate(${angle}deg)`,
              paddingTop: '6%',
            }}
          >
            <div
              className="font-bold font-sans flex items-center justify-center transition-colors duration-500"
              style={{
                transform: `rotate(-${angle}deg)`,
                color: color,
                textShadow: `0 0 min(1.5vw, 1.5vh) ${color}, 0 0 min(3vw, 3vh) ${color}`,
                fontSize: 'min(7vw, 7vh)',
                lineHeight: 1
              }}
            >
              {num}
            </div>
          </div>
        );
      })}

      {/* Hour Hand */}
      <motion.div
        className="absolute origin-bottom z-10 rounded-full transition-colors duration-500 pointer-events-none"
        style={{
          width: 'min(1.2vw, 1.2vh)',
          height: '25%',
          bottom: '50%',
          backgroundColor: color,
          boxShadow: `0 0 min(1.5vw, 1.5vh) ${color}, 0 0 min(3vw, 3vh) ${color}`,
        }}
        animate={{ rotate: hourDeg }}
        transition={{ type: "tween", ease: "linear", duration: 0.1 }}
      />

      {/* Minute Hand */}
      <motion.div
        className="absolute origin-bottom z-20 rounded-full transition-colors duration-500 pointer-events-none"
        style={{
          width: 'min(0.8vw, 0.8vh)',
          height: '35%',
          bottom: '50%',
          backgroundColor: color,
          boxShadow: `0 0 min(1.5vw, 1.5vh) ${color}, 0 0 min(3vw, 3vh) ${color}`,
        }}
        animate={{ rotate: minuteDeg }}
        transition={{ type: "tween", ease: "linear", duration: 0.1 }}
      />

      {/* Second Hand */}
      <motion.div
        className="absolute origin-bottom z-30 rounded-full pointer-events-none"
        style={{
          width: 'min(0.4vw, 0.4vh)',
          height: '45%',
          bottom: '50%',
          backgroundColor: '#ff00ff',
          boxShadow: `0 0 min(1.5vw, 1.5vh) #ff00ff, 0 0 min(3vw, 3vh) #ff00ff`,
        }}
        animate={{ rotate: secondDeg }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
      />

      {/* Center Dot */}
      <div
        className="absolute rounded-full z-40 transition-colors duration-500 pointer-events-none"
        style={{
          width: 'min(3.5vw, 3.5vh)',
          height: 'min(3.5vw, 3.5vh)',
          backgroundColor: color,
          boxShadow: `0 0 min(2vw, 2vh) ${color}`,
        }}
      />
    </div>
  );
}

export default function App() {
  const [time, setTime] = useState(new Date());
  const [mounted, setMounted] = useState(false);
  const [isIdle, setIsIdle] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  // New features state
  const [is12Hour, setIs12Hour] = useState(false);
  const [clockColor, setClockColor] = useState('#00e5ff'); // neon cyan default
  const [isAnalogue, setIsAnalogue] = useState(false);

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

  const toggleFullscreen = (e: any) => {
    // Prevent fullscreen toggle if clicking sidebar icons
    if ((e.target as HTMLElement).closest('.sidebar')) return;

    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => { });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  let displayHours = time.getHours();
  let ampm = '';
  if (is12Hour && !isAnalogue) {
    ampm = displayHours >= 12 ? ' PM' : ' AM';
    displayHours = displayHours % 12 || 12;
  }

  if (!mounted) return <div className="h-screen w-screen bg-black" />;

  return (
    <div
      onClick={toggleFullscreen}
      className={`flex h-screen w-screen overflow-hidden flex-col items-center justify-center bg-black transition-colors duration-1000 ${isIdle ? 'cursor-none' : 'cursor-default'}`}
    >
      {/* Sidebar for toggles */}
      <div
        className={`sidebar absolute left-6 top-1/2 -translate-y-1/2 flex flex-col gap-6 z-50 transition-all duration-1000 ${isIdle ? 'opacity-0 -translate-x-10 pointer-events-none' : 'opacity-100'}`}
      >
        <button
          onClick={() => setIs12Hour(!is12Hour)}
          className="p-3 bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 rounded-2xl text-zinc-400 hover:text-zinc-100 backdrop-blur transition-all active:scale-95 group relative flex items-center justify-center cursor-pointer"
          title="Toggle 12/24 Hour"
        >
          <span className="font-mono font-bold text-sm leading-none transition-colors">{is12Hour ? '12h' : '24h'}</span>
        </button>

        <div className="relative group">
          <button
            className="p-3 bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 rounded-2xl text-zinc-400 hover:text-zinc-100 backdrop-blur transition-all active:scale-95 flex items-center justify-center relative overflow-hidden cursor-pointer"
            title="Choose Color"
          >
            <Palette size={20} />
            <input
              type="color"
              value={clockColor}
              onChange={(e) => setClockColor(e.target.value)}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
          </button>
        </div>

        <button
          onClick={() => setIsAnalogue(!isAnalogue)}
          className="p-3 bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 rounded-2xl text-zinc-400 hover:text-zinc-100 backdrop-blur transition-all active:scale-95 flex items-center justify-center cursor-pointer"
          title="Toggle Digital/Analogue"
        >
          {isAnalogue ? <Monitor size={20} /> : <Clock size={20} />}
        </button>
      </div>

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
        {isAnalogue ? (
          <AnalogueClock time={time} color={clockColor} />
        ) : (
          <div className="flex items-center" style={{ gap: 'min(2vw, 3vh)' }}>
            <TimeSection value={displayHours} color={clockColor} />

            <div className="flex flex-col pb-[min(1vw,1.5vh)]" style={{ gap: 'min(2vw, 3vh)' }}>
              <div className="rounded-full animate-pulse transition-colors" style={{ width: 'min(1.5vw, 2.5vh)', height: 'min(1.5vw, 2.5vh)', backgroundColor: clockColor, opacity: 0.5 }} />
              <div className="rounded-full animate-pulse transition-colors" style={{ width: 'min(1.5vw, 2.5vh)', height: 'min(1.5vw, 2.5vh)', backgroundColor: clockColor, opacity: 0.5 }} />
            </div>

            <TimeSection value={time.getMinutes()} color={clockColor} />

            <div className="flex flex-col pb-[min(1vw,1.5vh)]" style={{ gap: 'min(2vw, 3vh)' }}>
              <div className="rounded-full animate-pulse transition-colors" style={{ width: 'min(1.5vw, 2.5vh)', height: 'min(1.5vw, 2.5vh)', backgroundColor: clockColor, opacity: 0.5 }} />
              <div className="rounded-full animate-pulse transition-colors" style={{ width: 'min(1.5vw, 2.5vh)', height: 'min(1.5vw, 2.5vh)', backgroundColor: clockColor, opacity: 0.5 }} />
            </div>

            <TimeSection value={time.getSeconds()} color={clockColor} />

            {is12Hour && (
              <div className="self-end font-mono font-bold tracking-widest ml-4 mb-2 transition-colors" style={{ color: clockColor, fontSize: 'min(3vw, 4vh)', opacity: 0.8, paddingBottom: 'min(2vw, 3vh)' }}>
                {ampm}
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}
