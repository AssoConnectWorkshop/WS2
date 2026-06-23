"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { recordVote } from "@/app/actions/candidates";

type Candidate = {
  id: string;
  firstName: string;
  lastName: string;
  picture?: string | null;
};

type Step = "select" | "shuffle" | "pick" | "reveal" | "confirm";

function Avatar({ candidate }: { candidate: Candidate }) {
  const initials = `${candidate.firstName[0]}${candidate.lastName[0]}`.toUpperCase();
  return (
    <div className="flex flex-col items-center gap-2">
      {candidate.picture ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={candidate.picture}
          alt={`${candidate.firstName} ${candidate.lastName}`}
          className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg"
        />
      ) : (
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg border-4 border-white">
          {initials}
        </div>
      )}
      <span className="text-sm font-semibold text-center leading-tight">
        {candidate.firstName}
        <br />
        {candidate.lastName}
      </span>
    </div>
  );
}

function Cup({ lifted, children }: { lifted: boolean; children?: React.ReactNode }) {
  return (
    <div className="relative flex flex-col items-center" style={{ width: 96, height: 140 }}>
      <AnimatePresence>
        {!lifted && (
          <motion.div
            key="cup"
            initial={{ y: 0, opacity: 1 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -90, opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="absolute top-0 flex flex-col items-center z-10"
            style={{ width: 96 }}
          >
            {/* Cup body */}
            <svg width="96" height="110" viewBox="0 0 96 110" fill="none">
              <path
                d="M14 10 L82 10 L72 100 L24 100 Z"
                fill="#e87c2b"
                stroke="#c4601a"
                strokeWidth="2"
              />
              {/* rim */}
              <rect x="8" y="4" width="80" height="14" rx="7" fill="#f59e42" stroke="#c4601a" strokeWidth="2" />
              {/* shine */}
              <path d="M20 24 Q28 18 36 24" stroke="#fcd08a" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            </svg>
            {/* base */}
            <div className="w-16 h-3 bg-orange-700 rounded-full -mt-1" />
          </motion.div>
        )}
      </AnimatePresence>
      {/* Candidate underneath */}
      <div className="absolute bottom-0 flex flex-col items-center">
        {children}
      </div>
    </div>
  );
}

function generateShuffleMoves(count: number): Array<[number, number]> {
  const moves: Array<[number, number]> = [];
  for (let i = 0; i < count; i++) {
    const a = Math.floor(Math.random() * 3);
    let b = Math.floor(Math.random() * 3);
    while (b === a) b = Math.floor(Math.random() * 3);
    moves.push([a, b]);
  }
  return moves;
}

function swapArr<T>(arr: T[], i: number, j: number): T[] {
  const next = [...arr];
  [next[i], next[j]] = [next[j], next[i]];
  return next;
}

export default function BonneteauGame({ candidates }: { candidates: Candidate[] }) {
  const [step, setStep] = useState<Step>("select");
  const [chosen, setChosen] = useState<Candidate | null>(null);
  const [positions, setPositions] = useState([0, 1, 2]); // positions[slotIndex] = candidateIndex
  const [liftedSlot, setLiftedSlot] = useState<number | null>(null);
  const [revealed, setRevealed] = useState<Candidate | null>(null);

  const shuffleRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // x positions for the 3 slots
  const slotX = [-140, 0, 140];

  // animated x values per slot
  const [animX, setAnimX] = useState([slotX[0], slotX[1], slotX[2]]);

  function startShuffle(initial: number[]) {
    const moves = generateShuffleMoves(14);
    let current = [...initial];
    let delay = 0;

    moves.forEach((move, idx) => {
      const [a, b] = move;
      const isLast = idx === moves.length - 1;
      const duration = 380;

      setTimeout(() => {
        current = swapArr(current, a, b);
        const newX = current.map((ci) => slotX[ci]);
        setAnimX(newX);
        setPositions([...current]);

        if (isLast) {
          setTimeout(() => setStep("pick"), duration + 100);
        }
      }, delay);

      delay += duration + 60;
    });
  }

  function handleSelect(candidate: Candidate) {
    setChosen(candidate);
    const initialPositions = [0, 1, 2];
    setPositions(initialPositions);
    setAnimX([slotX[0], slotX[1], slotX[2]]);
    setStep("shuffle");
    setTimeout(() => startShuffle(initialPositions), 400);
  }

  function handlePickSlot(slotIndex: number) {
    if (step !== "pick") return;
    const candidateIndex = positions[slotIndex];
    const revealedCandidate = candidates[candidateIndex];
    setLiftedSlot(slotIndex);
    setRevealed(revealedCandidate);
    setStep("reveal");
    recordVote(revealedCandidate.id).then((res) => {
      if (res.error) console.error("[handlePickSlot] recordVote error:", res.error);
    });
    setTimeout(() => setStep("confirm"), 1600);
  }

  function reset() {
    if (shuffleRef.current) clearTimeout(shuffleRef.current);
    setStep("select");
    setChosen(null);
    setLiftedSlot(null);
    setRevealed(null);
    setPositions([0, 1, 2]);
    setAnimX([slotX[0], slotX[1], slotX[2]]);
  }

  useEffect(() => {
    const ref = shuffleRef;
    return () => {
      if (ref.current) clearTimeout(ref.current);
    };
  }, []);

  if (candidates.length < 3) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-lg text-red-500">Impossible de charger les candidats depuis AssoConnect.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-8 p-6 bg-gradient-to-b from-indigo-50 to-purple-50 select-none">
      <h1 className="text-3xl font-bold text-indigo-800 text-center">
        Élection du Président
      </h1>

      {/* STEP: SELECT */}
      <AnimatePresence mode="wait">
        {step === "select" && (
          <motion.div
            key="select"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center gap-6"
          >
            <p className="text-gray-600 text-center">Choisissez le candidat pour lequel vous souhaitez voter :</p>
            <div className="flex gap-6 flex-wrap justify-center">
              {candidates.map((c) => (
                <motion.button
                  key={c.id}
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => handleSelect(c)}
                  className="flex flex-col items-center gap-2 bg-white rounded-2xl p-6 shadow-md border-2 border-transparent hover:border-indigo-400 transition-colors cursor-pointer"
                >
                  <Avatar candidate={c} />
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* STEP: SHUFFLE or PICK */}
        {(step === "shuffle" || step === "pick") && (
          <motion.div
            key="game"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-8"
          >
            <p className="text-gray-600 text-center font-medium">
              {step === "shuffle"
                ? "Les gobelets se mélangent… Suivez bien votre candidat !"
                : "Retrouvez votre candidat ! Cliquez sur un gobelet."}
            </p>

            <div className="relative flex items-end justify-center" style={{ width: 380, height: 160 }}>
              {candidates.map((_, slotIndex) => {
                const candidateIndex = positions[slotIndex];
                const candidate = candidates[candidateIndex];
                return (
                  <motion.div
                    key={slotIndex}
                    animate={{ x: animX[slotIndex] }}
                    transition={{ duration: 0.38, ease: "easeInOut" }}
                    style={{ position: "absolute", left: "50%", marginLeft: -48 }}
                    onClick={() => handlePickSlot(slotIndex)}
                    className={step === "pick" ? "cursor-pointer" : "cursor-default"}
                  >
                    <motion.div
                      whileHover={step === "pick" ? { y: -8 } : {}}
                      transition={{ duration: 0.15 }}
                    >
                      <Cup lifted={false}>
                        <Avatar candidate={candidate} />
                      </Cup>
                    </motion.div>
                  </motion.div>
                );
              })}
            </div>

            {chosen && (
              <p className="text-sm text-indigo-500">
                Votre choix : <span className="font-semibold">{chosen.firstName} {chosen.lastName}</span>
              </p>
            )}
          </motion.div>
        )}

        {/* STEP: REVEAL */}
        {step === "reveal" && (
          <motion.div
            key="reveal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-8"
          >
            <p className="text-gray-600 text-center font-medium">Révélation…</p>
            <div className="relative flex items-end justify-center" style={{ width: 380, height: 160 }}>
              {candidates.map((_, slotIndex) => {
                const candidateIndex = positions[slotIndex];
                const candidate = candidates[candidateIndex];
                const isLifted = slotIndex === liftedSlot;
                return (
                  <motion.div
                    key={slotIndex}
                    style={{ position: "absolute", left: "50%", marginLeft: -48, x: animX[slotIndex] }}
                  >
                    <Cup lifted={isLifted}>
                      <Avatar candidate={candidate} />
                    </Cup>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* STEP: CONFIRM */}
        {step === "confirm" && revealed && (
          <motion.div
            key="confirm"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", duration: 0.6 }}
            className="flex flex-col items-center gap-6 bg-white rounded-3xl p-10 shadow-xl max-w-sm w-full text-center"
          >
            <div className="text-5xl">🗳️</div>
            <Avatar candidate={revealed} />
            <p className="text-xl font-bold text-indigo-800 leading-snug">
              Votre vote pour{" "}
              <span className="text-purple-600">
                {revealed.firstName} {revealed.lastName}
              </span>{" "}
              a bien été pris en compte.
            </p>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={reset}
              className="mt-2 px-6 py-3 bg-indigo-600 text-white rounded-full font-semibold shadow hover:bg-indigo-700 transition-colors"
            >
              Voter à nouveau
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
