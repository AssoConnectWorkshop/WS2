"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { GameProps } from "./types";
import Avatar from "./Avatar";

type Step = "select" | "shuffle" | "pick" | "reveal";

const slotX = [-130, 0, 130];

function swapArr<T>(arr: T[], i: number, j: number): T[] {
  const next = [...arr];
  [next[i], next[j]] = [next[j], next[i]];
  return next;
}

function generateMoves(count: number): Array<[number, number]> {
  return Array.from({ length: count }, () => {
    const a = Math.floor(Math.random() * 3);
    let b = Math.floor(Math.random() * 3);
    while (b === a) b = Math.floor(Math.random() * 3);
    return [a, b] as [number, number];
  });
}

function Cup({ lifted, children }: { lifted: boolean; children?: React.ReactNode }) {
  return (
    <div className="relative flex flex-col items-center" style={{ width: 88, height: 130 }}>
      <AnimatePresence>
        {!lifted && (
          <motion.div
            key="cup"
            initial={{ y: 0, opacity: 1 }}
            exit={{ y: -80, opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute top-0 z-10 flex flex-col items-center"
            style={{ width: 88 }}
          >
            <svg width="88" height="104" viewBox="0 0 88 104" fill="none">
              <path d="M12 10 L76 10 L66 96 L22 96 Z" fill="#e87c2b" stroke="#c4601a" strokeWidth="2" />
              <rect x="6" y="4" width="76" height="13" rx="6.5" fill="#f59e42" stroke="#c4601a" strokeWidth="2" />
              <path d="M18 23 Q26 17 34 23" stroke="#fcd08a" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            </svg>
            <div className="w-14 h-3 bg-orange-700 rounded-full -mt-1" />
          </motion.div>
        )}
      </AnimatePresence>
      <div className="absolute bottom-0 flex flex-col items-center">{children}</div>
    </div>
  );
}

export default function BonneteauGame({ candidates, onVote }: GameProps) {
  const [step, setStep] = useState<Step>("select");
  const [positions, setPositions] = useState([0, 1, 2]);
  const [animX, setAnimX] = useState([slotX[0], slotX[1], slotX[2]]);
  const [liftedSlot, setLiftedSlot] = useState<number | null>(null);

  useEffect(() => {
    if (step !== "shuffle") return;
    const moves = generateMoves(14);
    let current = [0, 1, 2];
    let delay = 0;
    moves.forEach((move, idx) => {
      const [a, b] = move;
      const isLast = idx === moves.length - 1;
      setTimeout(() => {
        current = swapArr(current, a, b);
        setAnimX(current.map((ci) => slotX[ci]));
        setPositions([...current]);
        if (isLast) setTimeout(() => setStep("pick"), 420);
      }, delay);
      delay += 440;
    });
  }, [step]);

  function handlePickSlot(slotIndex: number) {
    if (step !== "pick") return;
    setLiftedSlot(slotIndex);
    setStep("reveal");
    setTimeout(() => onVote(candidates[positions[slotIndex]]), 900);
  }

  return (
    <div className="flex flex-col items-center gap-8">
      <p className="text-lg font-bold text-indigo-800">🎩 Le Bonneteau</p>
      <AnimatePresence mode="wait">
        {step === "select" && (
          <motion.div key="select" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-5">
            <p className="text-gray-500 text-center">Choisissez un candidat :</p>
            <div className="flex gap-5 flex-wrap justify-center">
              {candidates.map((c) => (
                <motion.button key={c.id} whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}
                  onClick={() => setStep("shuffle")}
                  className="flex flex-col items-center gap-2 bg-white rounded-2xl p-5 shadow border-2 border-transparent hover:border-indigo-400 transition-colors">
                  <Avatar candidate={c} />
                  <span className="text-sm font-medium">{c.firstName}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
        {(step === "shuffle" || step === "pick") && (
          <motion.div key="game" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-6">
            <p className="text-gray-500 text-center text-sm">
              {step === "shuffle" ? "Suivez les gobelets !" : "Cliquez sur un gobelet !"}
            </p>
            <div className="relative flex items-end justify-center" style={{ width: 360, height: 150 }}>
              {[0, 1, 2].map((slotIndex) => (
                <motion.div key={slotIndex} animate={{ x: animX[slotIndex] }} transition={{ duration: 0.38, ease: "easeInOut" }}
                  style={{ position: "absolute", left: "50%", marginLeft: -44 }}
                  onClick={() => handlePickSlot(slotIndex)}
                  className={step === "pick" ? "cursor-pointer" : "cursor-default"}>
                  <motion.div whileHover={step === "pick" ? { y: -8 } : {}}>
                    <Cup lifted={false}><Avatar candidate={candidates[positions[slotIndex]]} size="sm" /></Cup>
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
        {step === "reveal" && (
          <motion.div key="reveal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-6">
            <div className="relative flex items-end justify-center" style={{ width: 360, height: 150 }}>
              {[0, 1, 2].map((slotIndex) => (
                <div key={slotIndex} style={{ position: "absolute", left: "50%", marginLeft: -44, transform: `translateX(${animX[slotIndex]}px)` }}>
                  <Cup lifted={slotIndex === liftedSlot}>
                    <Avatar candidate={candidates[positions[slotIndex]]} size="sm" />
                  </Cup>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
