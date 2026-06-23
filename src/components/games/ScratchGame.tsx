"use client";

import { useState, useMemo } from "react";
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
  // 9 cells: 3 per candidate, shuffled
  const grid = useMemo<Candidate[]>(() => shuffle([...candidates, ...candidates, ...candidates]), [candidates]);
  const [scratched, setScratched] = useState<boolean[]>(Array(9).fill(false));
  const [done, setDone] = useState(false);

  const scratchedCount = scratched.filter(Boolean).length;

  function scratch(idx: number) {
    if (done || scratched[idx]) return;
    const next = [...scratched];
    next[idx] = true;
    setScratched(next);

    if (scratchedCount + 1 === 3) {
      setDone(true);
      // Count who appears most
      const counts: Record<string, { candidate: Candidate; count: number }> = {};
      grid.forEach((c, i) => {
        if (next[i]) {
          if (!counts[c.id]) counts[c.id] = { candidate: c, count: 0 };
          counts[c.id].count++;
        }
      });
      const winner = Object.values(counts).sort((a, b) => b.count - a.count)[0].candidate;
      setTimeout(() => onVote(winner), 1000);
    }
  }

  const CARD_COLORS = ["bg-indigo-500", "bg-pink-500", "bg-emerald-500"];
  const candidateColor = useMemo(() => {
    const map: Record<string, string> = {};
    candidates.forEach((c, i) => { map[c.id] = CARD_COLORS[i]; });
    return map;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [candidates]);

  return (
    <div className="flex flex-col items-center gap-6">
      <p className="text-lg font-bold text-indigo-800">🎟️ Le Ticket à Gratter</p>
      <p className="text-gray-500 text-sm text-center">
        {done ? "Décompte en cours…" : `Grattez 3 cases (${scratchedCount}/3)`}
      </p>

      <div className="bg-gradient-to-br from-yellow-300 to-yellow-500 p-4 rounded-2xl shadow-xl border-4 border-yellow-600">
        <div className="grid grid-cols-3 gap-2">
          {grid.map((c, idx) => (
            <motion.button key={idx} onClick={() => scratch(idx)}
              whileHover={!scratched[idx] && !done ? { scale: 1.05 } : {}}
              whileTap={!scratched[idx] && !done ? { scale: 0.95 } : {}}
              className={`relative w-20 h-20 rounded-xl overflow-hidden shadow border-2 ${scratched[idx] ? "border-white" : "border-yellow-700 cursor-pointer"} ${!scratched[idx] && scratchedCount >= 3 ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {/* Hidden face (silver) */}
              <AnimatePresence>
                {!scratched[idx] && (
                  <motion.div key="cover" initial={{ scaleX: 1 }} exit={{ scaleX: 0 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0 bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center text-2xl z-10">
                    🪙
                  </motion.div>
                )}
              </AnimatePresence>
              {/* Revealed face */}
              <div className={`absolute inset-0 ${candidateColor[c.id]} flex flex-col items-center justify-center gap-1`}>
                <Avatar candidate={c} size="sm" />
                <span className="text-white text-xs font-bold">{c.firstName}</span>
              </div>
            </motion.button>
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
