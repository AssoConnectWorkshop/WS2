"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { recordVote } from "@/app/actions/candidates";
import BonneteauGame from "./games/BonneteauGame";
import PlinkoGame from "./games/PlinkoGame";
import GoalkeeperGame from "./games/GoalkeeperGame";
import DartsGame from "./games/DartsGame";
import ScratchGame from "./games/ScratchGame";
import MagicCardGame from "./games/MagicCardGame";
import Avatar from "./games/Avatar";
import type { Candidate, GameProps } from "./games/types";

const GAMES: React.ComponentType<GameProps>[] = [
  BonneteauGame,
  PlinkoGame,
  GoalkeeperGame,
  DartsGame,
  ScratchGame,
  MagicCardGame,
];

const FUNNY_MESSAGES = [
  "😅 La démocratie a ses mystères... et un sacré sens de l'humour !",
  "🎲 Votre candidat a préféré passer la main. Sage décision ?",
  "🌀 Le destin en a décidé autrement. C'est ça la vie associative !",
  "🤷 Surprise ! Même les urnes ont leurs caprices.",
  "🃏 C'est pas vous qui votez, c'est le jeu qui décide !",
  "🔮 On appelle ça la démocratie participative aléatoire.",
  "🦆 Votre candidat a pris ses cliques et ses claques. Dommage.",
  "⚡ Un coup du sort ! Votre vote a changé de cap en route.",
];

function pickRandom() {
  return Math.floor(Math.random() * GAMES.length);
}

export default function VoteGame({ candidates }: { candidates: Candidate[] }) {
  const [gameIdx, setGameIdx] = useState(pickRandom);
  const [voted, setVoted] = useState<Candidate | null>(null);
  const [chosen, setChosen] = useState<Candidate | null>(null);
  const [funnyMsg] = useState(() => FUNNY_MESSAGES[Math.floor(Math.random() * FUNNY_MESSAGES.length)]);

  async function handleVote(candidate: Candidate) {
    if (voted) return;
    setVoted(candidate);
    const res = await recordVote(candidate.id);
    if (res.error) console.error("[VoteGame] recordVote error:", res.error);
  }

  function reset() {
    setVoted(null);
    setChosen(null);
    setGameIdx(pickRandom());
  }

  const voteDiffersFromChoice = voted && chosen && voted.id !== chosen.id;

  if (voted) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center gap-6 p-8 bg-gradient-to-b from-indigo-50 to-purple-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", duration: 0.6 }}
          className="flex flex-col items-center gap-5 bg-white rounded-3xl p-10 shadow-xl max-w-sm w-full text-center"
        >
          <div className="text-5xl">🗳️</div>
          <Avatar candidate={voted} size="lg" />
          <p className="text-xl font-bold text-indigo-800 leading-snug">
            Votre vote pour{" "}
            <span className="text-purple-600">{voted.firstName} {voted.lastName}</span>{" "}
            a bien été pris en compte.
          </p>
          {voteDiffersFromChoice && (
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-sm text-orange-600 bg-orange-50 rounded-xl px-4 py-2 border border-orange-200"
            >
              {funnyMsg}
            </motion.p>
          )}
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={reset}
            className="mt-2 px-6 py-3 bg-indigo-600 text-white rounded-full font-semibold shadow hover:bg-indigo-700 transition-colors"
          >
            Voter à nouveau
          </motion.button>
        </motion.div>
      </main>
    );
  }

  const GameComponent = GAMES[gameIdx];

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-8 p-6 bg-gradient-to-b from-indigo-50 to-purple-50 select-none">
      <h1 className="text-2xl font-bold text-indigo-800">Élection du Président</h1>
      <GameComponent candidates={candidates} onVote={handleVote} onChoose={setChosen} />
    </main>
  );
}
