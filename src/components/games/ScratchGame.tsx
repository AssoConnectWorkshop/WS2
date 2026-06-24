"use client";

import { useState, useMemo, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { GameProps, Candidate } from "./types";
import Avatar from "./Avatar";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function ScratchGame({ candidates, onVote }: GameProps) {
  const grid = useMemo<Candidate[]>(() => shuffle([...candidates, ...candidates, ...candidates]), [candidates]);
  const [scratched, setScratched] = useState<boolean[]>(Array(9).fill(false));
  const [done, setDone] = useState(false);
  const scratchedRef = useRef<boolean[]>(Array(9).fill(false));
  const isDragging = useRef(false);
  const doneRef = useRef(false);

  const CARD_COLORS = ["bg-indigo-500", "bg-pink-500", "bg-emerald-500"];
  const candidateColor = useMemo(() => {
    const map: Record<string, string> = {};
    candidates.forEach((c, i) => { map[c.id] = CARD_COLORS[i]; });
    return map;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [candidates]);

  const revealCell = useCallback((idx: number) => {
    if (doneRef.current || scratchedRef.current[idx]) return;
    const next = [...scratchedRef.current];
    next[idx] = true;
    scratchedRef.current = next;
    setScratched([...next]);

    const count = next.filter(Boolean).length;
    if (count === 3) {
      doneRef.current = true;
      setDone(true);
      const counts: Record<string, { candidate: Candidate; count: number }> = {};
      grid.forEach((c, i) => {
        if (next[i]) {
          if (!counts[c.id]) counts[c.id] = { candidate: c, count: 0 };
          counts[c.id].count++;
        }
      });
      const sorted = Object.values(counts).sort((a, b) => b.count - a.count);
      const maxCount = sorted[0].count;
      const tied = sorted.filter((x) => x.count === maxCount);
      const winner = tied[Math.floor(Math.random() * tied.length)].candidate;
      setTimeout(() => onVote(winner), 2000);
    }
  }, [grid, onVote]);

  return (
    <div className="flex flex-col items-center gap-6">
      <p className="text-lg font-bold text-indigo-800">🎟️ Le Ticket à Gratter</p>
      <p className="text-gray-500 text-sm text-center">
        {done ? "Décompte en cours…" : `Grattez 3 cases (${scratched.filter(Boolean).length}/3)`}
      </p>

      <div className="bg-gradient-to-br from-yellow-300 to-yellow-500 p-4 rounded-2xl shadow-xl border-4 border-yellow-600">
        <div className="grid grid-cols-3 gap-2">
          {grid.map((c, idx) => (
            <div key={idx}
              className={`relative w-20 h-20 rounded-xl overflow-hidden shadow border-2 select-none touch-none
                ${scratched[idx] ? "border-white" : "border-yellow-700 cursor-grab active:cursor-grabbing"}
                ${!scratched[idx] && scratched.filter(Boolean).length >= 3 ? "opacity-50" : ""}`}
              onPointerDown={(e) => {
                if (done || scratched.filter(Boolean).length >= 3) return;
                isDragging.current = true;
                (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
                revealCell(idx);
              }}
              onPointerEnter={() => {
                if (isDragging.current) revealCell(idx);
              }}
              onPointerUp={() => { isDragging.current = false; }}
            >
              {/* Silver scratch cover */}
              <AnimatePresence>
                {!scratched[idx] && (
                  <motion.div key="cover"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.25 }}
                    className="absolute inset-0 bg-gradient-to-br from-gray-200 via-gray-300 to-gray-400 flex flex-col items-center justify-center z-10 pointer-events-none">
                    <span className="text-2xl">🪙</span>
                    <span className="text-[10px] text-gray-500 font-medium mt-0.5">Grattez</span>
                  </motion.div>
                )}
              </AnimatePresence>
              {/* Candidate face */}
              <div className={`absolute inset-0 ${candidateColor[c.id]} flex flex-col items-center justify-center gap-1`}>
                <Avatar candidate={c} size="sm" />
                <span className="text-white text-xs font-bold">{c.firstName}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {done && (
        <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="text-gray-700 font-medium text-center">
          Le candidat le plus fréquent remporte votre vote…
        </motion.p>
      )}
    </div>
  );
}
