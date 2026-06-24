"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Result = {
  id: string;
  firstName: string;
  lastName: string;
  picture?: string | null;
  voteCount: number;
  percent: number;
};

function Avatar({ r }: { r: Result }) {
  const initials = `${r.firstName?.[0] ?? "?"}${r.lastName?.[0] ?? ""}`.toUpperCase();
  return r.picture ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={r.picture} alt={`${r.firstName} ${r.lastName}`}
      className="w-12 h-12 rounded-full object-cover border-2 border-white shadow flex-shrink-0" />
  ) : (
    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 border-2 border-white shadow">
      {initials}
    </div>
  );
}

const COLORS = [
  "from-indigo-500 to-purple-500",
  "from-pink-500 to-rose-500",
  "from-emerald-500 to-teal-500",
];

const DICTATOR: Result = {
  id: "__dictator__",
  firstName: "Arno",
  lastName: "D'LA TAIYE",
  picture: null,
  voteCount: 999999,
  percent: 100,
};

export default function ResultBars({ results, totalVotes }: { results: Result[]; totalVotes: number }) {
  const [animated, setAnimated] = useState(false);
  const [dictatorVisible, setDictatorVisible] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setAnimated(true), 100);
    let t2: ReturnType<typeof setTimeout> | undefined;
    if (totalVotes >= 15) t2 = setTimeout(() => setDictatorVisible(true), 1800);
    return () => { clearTimeout(t1); if (t2) clearTimeout(t2); };
  }, [totalVotes]);

  const sorted = [...results].sort((a, b) => b.voteCount - a.voteCount);
  const winner = sorted[0];

  return (
    <div className="flex flex-col gap-6 w-full max-w-xl">

      {/* Dictator row */}
      <AnimatePresence>
        {dictatorVisible && (
          <motion.div
            key="dictator"
            initial={{ scale: 0, rotate: -720, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 14, duration: 0.7 }}
            className="flex flex-col gap-2"
          >
            <div className="flex items-center gap-3 bg-red-950 rounded-2xl p-3 ring-4 ring-red-500 shadow-2xl shadow-red-900">
              {/* Avatar dictateur */}
              <motion.div
                animate={{ rotate: [0, -5, 5, -3, 3, 0] }}
                transition={{ delay: 0.8, duration: 0.4 }}
                className="w-12 h-12 rounded-full bg-gradient-to-br from-red-600 to-red-900 flex items-center justify-center text-white font-black text-sm flex-shrink-0 border-2 border-red-400 shadow"
              >
                🎖️
              </motion.div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-black text-red-100 tracking-wide">
                    Arno D&apos;LA TAIYE
                    <span className="ml-2 text-xs bg-red-500 text-white px-2 py-0.5 rounded-full font-bold">
                      👑 Président suprème
                    </span>
                  </span>
                  <span className="text-sm font-black text-red-300">∞ votes</span>
                </div>
                <div className="w-full h-5 bg-red-950 rounded-full overflow-hidden border border-red-700">
                  <motion.div
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
                    className="h-full rounded-full bg-gradient-to-r from-red-600 via-red-400 to-yellow-400"
                  />
                </div>
                <div className="text-xs text-red-400 mt-0.5 text-right font-bold">100.0 %</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Regular candidates */}
      {sorted.map((r, i) => (
        <div key={r.id} className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <Avatar r={r} />
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-gray-800">
                  {r.firstName} {r.lastName}
                  {r.id === winner.id && winner.voteCount > 0 && !dictatorVisible && (
                    <span className="ml-2 text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-medium">
                      👑 En tête
                    </span>
                  )}
                </span>
                <span className="text-sm font-bold text-gray-600">
                  {r.voteCount} vote{r.voteCount !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="w-full h-5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${COLORS[i % COLORS.length]} transition-all duration-1000 ease-out`}
                  style={{ width: animated ? `${Math.max(r.percent, r.voteCount > 0 ? 4 : 0)}%` : "0%" }}
                />
              </div>
              <div className="text-xs text-gray-400 mt-0.5 text-right">{r.percent.toFixed(1)} %</div>
            </div>
          </div>
        </div>
      ))}

      {results.every((r) => r.voteCount === 0) && (
        <p className="text-center text-gray-400 italic text-sm mt-4">Aucun vote enregistré pour l&apos;instant.</p>
      )}
    </div>
  );
}

// suppress unused import warning
void DICTATOR;
