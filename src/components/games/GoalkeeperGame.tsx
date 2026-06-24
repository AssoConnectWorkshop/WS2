"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { GameProps } from "./types";
import Avatar from "./Avatar";

type Phase = "aim" | "shoot" | "result";
type Zone = 0 | 1 | 2;

const ZONE_X = ["12%", "44%", "76%"];
const KEEPER_DIVE_X = [-90, 0, 90];
const KEEPER_DIVE_ROTATE = [-50, 0, 50];

const ZONE_COLORS = [
  { idle: "bg-indigo-600 hover:bg-indigo-500", glow: "bg-indigo-400/30 ring-4 ring-indigo-400 shadow-indigo-400/60" },
  { idle: "bg-pink-600 hover:bg-pink-500", glow: "bg-pink-400/30 ring-4 ring-pink-400 shadow-pink-400/60" },
  { idle: "bg-emerald-600 hover:bg-emerald-500", glow: "bg-emerald-400/30 ring-4 ring-emerald-400 shadow-emerald-400/60" },
];

function Keeper({ diving }: { diving: boolean }) {
  return (
    <div className="flex flex-col items-center select-none" style={{ filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.5))" }}>
      {/* Head */}
      <div className="relative w-9 h-9 rounded-full bg-amber-300 border-2 border-amber-500 flex items-center justify-center shadow-md">
        {/* Eyes */}
        <div className="flex gap-1.5 mt-1">
          <div className="w-1.5 h-1.5 rounded-full bg-gray-800" />
          <div className="w-1.5 h-1.5 rounded-full bg-gray-800" />
        </div>
        {/* Mouth */}
        <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-1 border-b-2 border-gray-700 rounded-b-full" />
        {/* Cap */}
        <div className="absolute -top-2 inset-x-0 h-3 bg-yellow-400 rounded-t-full border border-yellow-500" />
        <div className="absolute -top-1 -left-1 -right-1 h-1 bg-yellow-500 rounded" />
      </div>
      {/* Jersey */}
      <div className={`w-11 h-8 rounded-t-lg mt-0.5 flex items-center justify-center shadow transition-colors ${diving ? "bg-green-400" : "bg-green-500"} border border-green-700`}>
        <span className="text-white font-black text-xs leading-none">1</span>
      </div>
      {/* Shorts */}
      <div className="w-10 h-4 bg-green-900 rounded-b-md border border-green-950 shadow" />
      {/* Gloves */}
      <div className="flex gap-6 -mt-8">
        <div className="w-4 h-5 bg-yellow-400 rounded-full border border-yellow-500 shadow" />
        <div className="w-4 h-5 bg-yellow-400 rounded-full border border-yellow-500 shadow" />
      </div>
      {/* Legs */}
      <div className="flex gap-1 mt-1">
        <div className="w-3 h-5 bg-green-800 rounded-b-sm" />
        <div className="w-3 h-5 bg-green-800 rounded-b-sm" />
      </div>
    </div>
  );
}

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
      <div className="relative bg-gradient-to-b from-sky-400 to-green-400 rounded-xl overflow-hidden border-4 border-gray-700 shadow-2xl"
        style={{ width: 320, height: 220 }}>

        {/* Goalposts */}
        <div className="absolute inset-y-0 left-0 w-3 bg-white shadow-md" />
        <div className="absolute inset-y-0 right-0 w-3 bg-white shadow-md" />
        <div className="absolute top-0 inset-x-0 h-3 bg-white shadow-md" />

        {/* Net */}
        {[1,2,3,4,5].map(i => (
          <div key={i} className="absolute top-0 bottom-16 border-r border-white/30" style={{ left: `${i * 16.6}%` }} />
        ))}
        {[1,2,3].map(i => (
          <div key={i} className="absolute inset-x-0 border-b border-white/30" style={{ top: `${i * 20}%` }} />
        ))}

        {/* Zone glow overlays */}
        {aimZone !== null && (
          <div
            className={`absolute top-0 bottom-16 transition-all duration-300 ${ZONE_COLORS[aimZone].glow} shadow-xl`}
            style={{ left: `${aimZone * 33.33}%`, width: "33.33%" }}
          />
        )}

        {/* Candidates in zones */}
        <div className="absolute inset-x-0 bottom-0 grid grid-cols-3 h-16">
          {candidates.map((c, i) => (
            <div key={c.id}
              className={`flex flex-col items-center justify-end pb-1 border-r border-white/20 last:border-0 transition-all duration-500 ${finalIdx === i && phase === "result" ? "bg-yellow-300/60 scale-105" : ""}`}>
              <Avatar candidate={c} size="sm" />
              <span className="text-[10px] font-bold text-gray-800 drop-shadow">{c.firstName}</span>
            </div>
          ))}
        </div>

        {/* Keeper */}
        <motion.div
          className="absolute flex flex-col items-center"
          style={{ bottom: 60, left: "50%", x: "-50%" }}
          animate={diveZone !== null ? {
            x: KEEPER_DIVE_X[diveZone],
            rotate: KEEPER_DIVE_ROTATE[diveZone],
            y: diveZone === 1 ? -10 : 15,
          } : { x: "-50%", rotate: 0, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        >
          <Keeper diving={diveZone !== null} />
        </motion.div>

        {/* Ball */}
        <AnimatePresence>
          {phase !== "aim" && aimZone !== null && (
            <motion.div key="ball"
              initial={{ bottom: 10, left: "50%", translateX: "-50%", scale: 1 }}
              animate={{
                bottom: saved ? 90 : 190,
                left: ZONE_X[aimZone],
                scale: saved ? 0.6 : 1.2,
              }}
              transition={{ duration: 0.45, ease: "easeOut" }}
              className="absolute text-2xl z-20 drop-shadow-lg">⚽</motion.div>
          )}
        </AnimatePresence>

        {/* Result banner */}
        <AnimatePresence>
          {phase === "result" && (
            <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, type: "spring" }}
              className="absolute inset-x-0 top-3 flex items-center justify-center pointer-events-none z-30">
              <span className={`text-2xl font-black text-white drop-shadow-lg px-4 py-1 rounded-full ${saved ? "bg-red-600/80" : "bg-emerald-600/80"}`}>
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
              className={`px-5 py-3 text-white rounded-xl font-semibold shadow-lg transition-colors text-sm ${ZONE_COLORS[zone].idle}`}>
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
