"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { GameProps } from "./types";
import Avatar from "./Avatar";

type Phase = "aim" | "shoot" | "result";
type Zone = 0 | 1 | 2;

export default function GoalkeeperGame({ candidates, onVote }: GameProps) {
  const [keeperX, setKeeperX] = useState(50);
  const [phase, setPhase] = useState<Phase>("aim");
  const [aimZone, setAimZone] = useState<Zone | null>(null);
  const [saved, setSaved] = useState(false);
  const [finalIdx, setFinalIdx] = useState<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const dirRef = useRef(1);
  const posRef = useRef(50);
  const votedRef = useRef(false);

  useEffect(() => {
    if (phase !== "aim") return;
    function tick() {
      posRef.current += dirRef.current * 0.8;
      if (posRef.current >= 85 || posRef.current <= 15) dirRef.current *= -1;
      setKeeperX(posRef.current);
      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [phase]);

  function shoot(zone: Zone) {
    if (phase !== "aim" || votedRef.current) return;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    setAimZone(zone);
    setPhase("shoot");

    const keeperZone = Math.min(2, Math.floor(posRef.current / 33.4)) as Zone;
    const isBlocked = keeperZone === zone;
    const others = ([0, 1, 2] as Zone[]).filter((z) => z !== zone);
    const redirectIdx = others[Math.floor(Math.random() * others.length)];
    const winnerIdx = isBlocked ? redirectIdx : zone;

    setTimeout(() => {
      setSaved(isBlocked);
      setFinalIdx(winnerIdx);
      setPhase("result");

      setTimeout(() => {
        if (!votedRef.current) {
          votedRef.current = true;
          onVote(candidates[winnerIdx]);
        }
      }, 1400);
    }, 600);
  }

  const ZONE_LABELS = ["⬅️ Gauche", "⬆️ Centre", "➡️ Droite"];

  return (
    <div className="flex flex-col items-center gap-6">
      <p className="text-lg font-bold text-indigo-800">⚽ Le Gardien de But</p>

      {/* Goal */}
      <div className="relative bg-gradient-to-b from-sky-300 to-green-300 rounded-xl overflow-hidden border-4 border-gray-700 shadow-xl"
        style={{ width: 320, height: 200 }}>
        {/* Zone dividers + candidates */}
        <div className="absolute inset-0 grid grid-cols-3">
          {candidates.map((c, i) => (
            <div key={c.id}
              className={`flex flex-col items-center justify-end pb-3 border-r border-gray-400/30 last:border-0 transition-all duration-500 ${finalIdx === i && phase === "result" ? "bg-yellow-300/50" : ""}`}>
              <Avatar candidate={c} size="sm" />
              <span className="text-xs font-bold text-gray-800 mt-1">{c.firstName}</span>
            </div>
          ))}
        </div>

        {/* Keeper */}
        <motion.div className="absolute bottom-10 flex items-end"
          animate={{ left: `calc(${keeperX}% - 20px)` }}
          transition={phase === "aim" ? { duration: 0 } : { duration: 0.35, ease: "easeOut" }}>
          <div className="w-10 h-14 bg-green-600 rounded-t-full flex items-center justify-center text-2xl shadow-lg">🧤</div>
        </motion.div>

        {/* Ball */}
        <AnimatePresence>
          {phase === "shoot" && aimZone !== null && (
            <motion.div key="ball"
              initial={{ bottom: 16, left: "50%", translateX: "-50%", fontSize: "1.5rem", position: "absolute" }}
              animate={{
                bottom: saved ? 90 : 170,
                left: aimZone === 0 ? "17%" : aimZone === 1 ? "50%" : "83%",
              }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="absolute text-2xl">⚽</motion.div>
          )}
        </AnimatePresence>

        {/* Result banner */}
        <AnimatePresence>
          {phase === "result" && (
            <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="text-4xl font-black text-white drop-shadow-lg">
                {saved ? "🧤 ARRÊTÉ !" : "⚽ BUT !"}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {phase === "aim" && (
        <div className="flex gap-3 flex-wrap justify-center">
          {([0, 1, 2] as Zone[]).map((zone) => (
            <motion.button key={zone} whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
              onClick={() => shoot(zone)}
              className="px-4 py-3 bg-indigo-600 text-white rounded-xl font-semibold shadow hover:bg-indigo-700 transition-colors text-sm">
              {ZONE_LABELS[zone]}
            </motion.button>
          ))}
        </div>
      )}

      {phase === "result" && finalIdx !== null && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="text-gray-600 text-center text-sm">
          {saved ? "Déviation du gardien !" : "But !"} Vote pour{" "}
          <strong>{candidates[finalIdx].firstName} {candidates[finalIdx].lastName}</strong>…
        </motion.p>
      )}
    </div>
  );
}
