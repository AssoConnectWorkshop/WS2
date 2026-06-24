"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { GameProps } from "./types";
import Avatar from "./Avatar";

type Phase = "aim" | "shoot" | "result";
type Zone = 0 | 1 | 2;

const ZONE_X = ["12%", "44%", "76%"]; // ball destination x in goal
const KEEPER_DIVE_X = ["-60px", "0px", "60px"]; // keeper dive offset from center
const KEEPER_DIVE_ROTATE = [-40, 0, 40];

export default function GoalkeeperGame({ candidates, onVote, onChoose }: GameProps) {
  const [phase, setPhase] = useState<Phase>("aim");
  const [aimZone, setAimZone] = useState<Zone | null>(null);
  const [diveZone, setDiveZone] = useState<Zone | null>(null);
  const [saved, setSaved] = useState(false);
  const [finalIdx, setFinalIdx] = useState<number | null>(null);
  const votedRef = useRef(false);

  const ZONE_LABELS = ["⬅️ Gauche", "⬆️ Centre", "➡️ Droite"];

  function shoot(zone: Zone) {
    if (phase !== "aim" || votedRef.current) return;
    onChoose?.(candidates[zone]);
    setAimZone(zone);
    setPhase("shoot");

    // Keeper dives randomly
    const dive = Math.floor(Math.random() * 3) as Zone;
    setDiveZone(dive);
    const isBlocked = dive === zone;
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
      }, 2000);
    }, 800);
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <p className="text-lg font-bold text-indigo-800">⚽ Le Gardien de But</p>

      {/* Goal */}
      <div className="relative bg-gradient-to-b from-sky-300 to-green-300 rounded-xl overflow-hidden border-4 border-gray-700 shadow-xl"
        style={{ width: 320, height: 210 }}>

        {/* Goalposts */}
        <div className="absolute inset-y-0 left-0 w-2 bg-white/60" />
        <div className="absolute inset-y-0 right-0 w-2 bg-white/60" />
        <div className="absolute top-0 inset-x-0 h-2 bg-white/60" />

        {/* Net lines */}
        {[1,2,3,4,5].map(i => (
          <div key={i} className="absolute top-0 bottom-16 border-r border-white/20" style={{ left: `${i * 16.6}%` }} />
        ))}
        {[1,2,3].map(i => (
          <div key={i} className="absolute inset-x-0 border-b border-white/20" style={{ top: `${i * 20}%` }} />
        ))}

        {/* Candidates in zones */}
        <div className="absolute inset-x-0 bottom-0 grid grid-cols-3 h-16">
          {candidates.map((c, i) => (
            <div key={c.id}
              className={`flex flex-col items-center justify-end pb-2 border-r border-white/20 last:border-0 transition-all duration-500 ${finalIdx === i && phase === "result" ? "bg-yellow-300/50" : ""}`}>
              <Avatar candidate={c} size="sm" />
              <span className="text-[10px] font-bold text-gray-800">{c.firstName}</span>
            </div>
          ))}
        </div>

        {/* Keeper — centered, static until dive */}
        <motion.div
          className="absolute flex flex-col items-center"
          style={{ bottom: 56, left: "50%", x: "-50%" }}
          animate={diveZone !== null ? {
            x: KEEPER_DIVE_X[diveZone],
            rotate: KEEPER_DIVE_ROTATE[diveZone],
            y: diveZone === 1 ? 0 : 10,
          } : { x: "-50%", rotate: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        >
          <div className="text-4xl leading-none">🧤</div>
          <div className="w-8 h-6 bg-green-600 rounded-b-lg" />
        </motion.div>

        {/* Ball */}
        <AnimatePresence>
          {phase !== "aim" && aimZone !== null && (
            <motion.div key="ball"
              initial={{ bottom: 10, left: "50%", translateX: "-50%", opacity: 1 }}
              animate={{
                bottom: saved ? 80 : 185,
                left: ZONE_X[aimZone],
                opacity: 1,
              }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="absolute text-2xl z-20">⚽</motion.div>
          )}
        </AnimatePresence>

        {/* Result banner */}
        <AnimatePresence>
          {phase === "result" && (
            <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="absolute inset-x-0 top-4 flex items-center justify-center pointer-events-none">
              <span className="text-3xl font-black text-white drop-shadow-lg bg-black/30 px-4 py-1 rounded-full">
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
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          className="text-gray-600 text-center text-sm">
          {saved ? "Le gardien plonge et dévie !" : "Goal !"} Vote pour{" "}
          <strong>{candidates[finalIdx].firstName} {candidates[finalIdx].lastName}</strong>…
        </motion.p>
      )}
    </div>
  );
}
