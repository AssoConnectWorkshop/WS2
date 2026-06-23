"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { GameProps } from "./types";
import Avatar from "./Avatar";

type Phase = "pick" | "shuffle" | "reveal";

function generateShufflePath(count: number) {
  const moves: Array<[number, number]> = [];
  for (let i = 0; i < count; i++) {
    const a = Math.floor(Math.random() * 3);
    let b = Math.floor(Math.random() * 3);
    while (b === a) b = Math.floor(Math.random() * 3);
    moves.push([a, b]);
  }
  return moves;
}

const CARD_X = [-120, 0, 120];

export default function MagicCardGame({ candidates, onVote }: GameProps) {
  const [phase, setPhase] = useState<Phase>("pick");
  const [positions, setPositions] = useState([0, 1, 2]);
  const [animX, setAnimX] = useState([CARD_X[0], CARD_X[1], CARD_X[2]]);
  const [flipped, setFlipped] = useState([false, false, false]);
  const [revealedSlot, setRevealedSlot] = useState<number | null>(null);
  const [handVisible, setHandVisible] = useState(false);

  async function startShuffle(chosenSlot: number) {
    void chosenSlot;
    // Flip all cards down
    setFlipped([true, true, true]);
    setPhase("shuffle");

    await new Promise((r) => setTimeout(r, 400));

    const moves = generateShufflePath(12);
    const current = [...positions];
    for (const [a, b] of moves) {
      await new Promise((r) => setTimeout(r, 350));
      [current[a], current[b]] = [current[b], current[a]];
      setAnimX(current.map((ci) => CARD_X[ci]));
      setPositions([...current]);
    }

    await new Promise((r) => setTimeout(r, 500));

    // Magic hand appears and picks a random card
    setHandVisible(true);
    await new Promise((r) => setTimeout(r, 800));

    const pickedSlot = Math.floor(Math.random() * 3);
    setRevealedSlot(pickedSlot);
    const newFlipped = [true, true, true];
    newFlipped[pickedSlot] = false;
    setFlipped(newFlipped);
    setPhase("reveal");

    await new Promise((r) => setTimeout(r, 1000));
    const candidateIdx = current[pickedSlot];
    onVote(candidates[candidateIdx]);
  }

  const SUIT_COLORS = ["text-indigo-600", "text-pink-600", "text-emerald-600"];
  const SUITS = ["♠", "♥", "♣"];

  return (
    <div className="flex flex-col items-center gap-8">
      <p className="text-lg font-bold text-indigo-800">🪄 Le Tour de Magie</p>

      {phase === "pick" && (
        <p className="text-gray-500 text-sm text-center">Choisissez une carte !</p>
      )}

      <div className="relative flex items-center justify-center" style={{ height: 180, width: 360 }}>
        {/* Magic hand */}
        <AnimatePresence>
          {handVisible && (
            <motion.div key="hand"
              initial={{ y: -60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="absolute top-0 left-1/2 -translate-x-1/2 text-5xl z-20 pointer-events-none">
              🫳
            </motion.div>
          )}
        </AnimatePresence>

        {[0, 1, 2].map((slotIdx) => {
          const candidateIdx = positions[slotIdx];
          const candidate = candidates[candidateIdx];
          const isFlipped = flipped[slotIdx];
          const isRevealed = revealedSlot === slotIdx;

          return (
            <motion.div key={slotIdx}
              animate={{ x: animX[slotIdx] }}
              transition={{ duration: 0.32, ease: "easeInOut" }}
              style={{ position: "absolute", left: "50%", marginLeft: -44 }}
              onClick={() => phase === "pick" && startShuffle(slotIdx)}
              className={phase === "pick" ? "cursor-pointer" : "cursor-default"}
            >
              <motion.div
                whileHover={phase === "pick" ? { y: -12, scale: 1.04 } : {}}
                animate={isRevealed ? { y: -20 } : {}}
                className="relative w-[88px] h-[130px]"
                style={{ perspective: 600 }}
              >
                {/* Card front (candidate) */}
                <motion.div
                  animate={{ rotateY: isFlipped ? 90 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="absolute inset-0 rounded-xl bg-white border-2 border-gray-200 shadow-lg flex flex-col items-center justify-center gap-1 backface-hidden overflow-hidden"
                >
                  <span className={`text-xl font-black ${SUIT_COLORS[candidateIdx]}`}>{SUITS[candidateIdx]}</span>
                  <Avatar candidate={candidate} size="sm" />
                  <span className="text-xs font-bold text-gray-700 text-center px-1 leading-tight">
                    {candidate.firstName}
                  </span>
                  <span className={`text-xl font-black ${SUIT_COLORS[candidateIdx]}`}>{SUITS[candidateIdx]}</span>
                </motion.div>

                {/* Card back */}
                <motion.div
                  animate={{ rotateY: isFlipped ? 0 : -90 }}
                  transition={{ duration: 0.2, delay: isFlipped ? 0.2 : 0 }}
                  className="absolute inset-0 rounded-xl shadow-lg overflow-hidden"
                >
                  <div className="w-full h-full bg-gradient-to-br from-indigo-700 to-purple-800 flex items-center justify-center">
                    <div className="w-16 h-24 rounded-lg border-2 border-white/30 flex items-center justify-center text-2xl">
                      🌟
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>
          );
        })}
      </div>

      {phase === "reveal" && revealedSlot !== null && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="text-gray-700 font-medium text-center">
          La magie a parlé ! Vote pour <strong>{candidates[positions[revealedSlot]].firstName} {candidates[positions[revealedSlot]].lastName}</strong>…
        </motion.p>
      )}
    </div>
  );
}
