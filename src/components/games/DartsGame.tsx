"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { GameProps, Candidate } from "./types";
import Avatar from "./Avatar";

const SIZE = 300;
const CENTER = SIZE / 2;
const ORBIT_R = [90, 90, 90];
const SPEEDS = [0.4, -0.6, 0.5];
const PHASES = [0, (2 * Math.PI) / 3, (4 * Math.PI) / 3];

function candidatePos(t: number, idx: number) {
  const angle = PHASES[idx] + (t * SPEEDS[idx] * Math.PI) / 180;
  return {
    x: CENTER + ORBIT_R[idx] * Math.cos(angle),
    y: CENTER + ORBIT_R[idx] * Math.sin(angle),
  };
}

export default function DartsGame({ candidates, onVote }: GameProps) {
  const [t, setT] = useState(0);
  const [thrown, setThrown] = useState(false);
  const [dartPos, setDartPos] = useState<{ x: number; y: number } | null>(null);
  const [winner, setWinner] = useState<Candidate | null>(null);
  const rafRef = useRef<number | null>(null);
  const tRef = useRef(0);
  const boardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (thrown) return;
    function tick() {
      tRef.current += 1;
      setT(tRef.current);
      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [thrown]);

  const handleThrow = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (thrown) return;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    setThrown(true);

    const rect = boardRef.current!.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    const dx = clientX - rect.left;
    const dy = clientY - rect.top;
    // Add a small random jitter
    const jx = dx + (Math.random() - 0.5) * 20;
    const jy = dy + (Math.random() - 0.5) * 20;
    setDartPos({ x: jx, y: jy });

    // Find nearest candidate at current time
    const positions = candidates.map((_, i) => candidatePos(tRef.current, i));
    let minDist = Infinity;
    let nearest = 0;
    positions.forEach((pos, i) => {
      const d = Math.hypot(jx - pos.x, jy - pos.y);
      if (d < minDist) { minDist = d; nearest = i; }
    });

    setWinner(candidates[nearest]);
    setTimeout(() => onVote(candidates[nearest]), 1200);
  }, [thrown, candidates, onVote]);

  const positions = candidates.map((_, i) => candidatePos(t, i));
  const ringColors = ["border-indigo-400", "border-pink-400", "border-emerald-400"];

  return (
    <div className="flex flex-col items-center gap-6">
      <p className="text-lg font-bold text-indigo-800">🎯 Les Fléchettes</p>
      <p className="text-gray-500 text-sm text-center">
        {thrown ? "La fléchette est lancée !" : "Cliquez pour lancer votre fléchette !"}
      </p>

      <div ref={boardRef}
        className="relative rounded-full bg-gradient-to-br from-red-800 to-red-900 shadow-2xl cursor-crosshair border-8 border-gray-700"
        style={{ width: SIZE, height: SIZE }}
        onClick={handleThrow}
        onTouchStart={handleThrow}
      >
        {/* Rings */}
        {[0.85, 0.65, 0.45, 0.25].map((r, i) => (
          <div key={i} className="absolute rounded-full border border-white/20"
            style={{ width: SIZE * r, height: SIZE * r, left: (SIZE - SIZE * r) / 2, top: (SIZE - SIZE * r) / 2 }} />
        ))}
        <div className="absolute w-3 h-3 bg-yellow-400 rounded-full" style={{ left: CENTER - 6, top: CENTER - 6 }} />

        {/* Moving candidates */}
        {candidates.map((c, i) => (
          <motion.div key={c.id}
            animate={{ left: positions[i].x - 20, top: positions[i].y - 20 }}
            transition={{ duration: 0 }}
            className={`absolute w-10 h-10 rounded-full border-2 ${ringColors[i]} overflow-hidden shadow-lg`}
            style={{ left: positions[i].x - 20, top: positions[i].y - 20 }}
          >
            <Avatar candidate={c} size="sm" />
          </motion.div>
        ))}

        {/* Dart */}
        <AnimatePresence>
          {dartPos && (
            <motion.div key="dart"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="absolute text-xl pointer-events-none z-20"
              style={{ left: dartPos.x - 10, top: dartPos.y - 10 }}
            >🎯</motion.div>
          )}
        </AnimatePresence>
      </div>

      {winner && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="text-gray-700 font-medium text-center">
          Touché ! Vote pour <strong>{winner.firstName} {winner.lastName}</strong>…
        </motion.p>
      )}
    </div>
  );
}
