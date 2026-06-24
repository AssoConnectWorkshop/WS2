"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { GameProps } from "./types";
import Avatar from "./Avatar";

const W = 300;
const H = 440;
const PEG_ROWS = 6;
const BUCKET_W = W / 3;

type Point = { x: number; y: number };

function buildPegs() {
  const pegs: Point[] = [];
  for (let row = 0; row < PEG_ROWS; row++) {
    const count = row % 2 === 0 ? 4 : 3;
    const y = 70 + row * 48;
    const spacing = W / (count + 1);
    const offset = row % 2 === 0 ? 0 : spacing / 2;
    for (let col = 0; col < count; col++) {
      pegs.push({ x: spacing * (col + 1) + offset, y });
    }
  }
  return pegs;
}

const PEGS = buildPegs();

function computePath(startX: number): { waypoints: Point[]; bucket: number } {
  let x = Math.max(20, Math.min(W - 20, startX));
  const waypoints: Point[] = [{ x, y: 20 }];
  for (let row = 0; row < PEG_ROWS; row++) {
    const y = 70 + row * 48;
    const dx = (Math.random() < 0.5 ? -1 : 1) * (22 + Math.random() * 16);
    x = Math.max(20, Math.min(W - 20, x + dx));
    waypoints.push({ x, y });
  }
  const bucket = Math.min(2, Math.floor(x / BUCKET_W));
  const finalX = BUCKET_W * bucket + BUCKET_W / 2;
  waypoints.push({ x: finalX, y: H - 40 });
  return { waypoints, bucket };
}

export default function PlinkoGame({ candidates, onVote }: GameProps) {
  const [ballPos, setBallPos] = useState<Point | null>(null);
  const [dropped, setDropped] = useState(false);
  const [winBucket, setWinBucket] = useState<number | null>(null);

  async function drop(e: React.MouseEvent<HTMLDivElement>) {
    if (dropped) return;
    setDropped(true);
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const { waypoints, bucket } = computePath(clickX);
    setBallPos(waypoints[0]);
    for (let i = 1; i < waypoints.length; i++) {
      await new Promise<void>((r) => setTimeout(r, 160));
      setBallPos(waypoints[i]);
    }
    setWinBucket(bucket);
    await new Promise<void>((r) => setTimeout(r, 700));
    onVote(candidates[bucket]);
  }

  const bucketColors = ["from-indigo-400 to-indigo-600", "from-pink-400 to-pink-600", "from-emerald-400 to-emerald-600"];

  return (
    <div className="flex flex-col items-center gap-6">
      <p className="text-lg font-bold text-indigo-800">🎯 Le Plinko</p>
      <p className="text-gray-500 text-sm text-center">Cliquez là où vous voulez lâcher la bille !</p>

      <div className="relative bg-gradient-to-b from-slate-800 to-slate-900 rounded-2xl overflow-hidden shadow-xl cursor-crosshair"
        style={{ width: W, height: H }}
        onClick={drop}
      >
        {!dropped && (
          <div className="absolute inset-x-0 top-0 flex justify-center pt-2 pointer-events-none">
            <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.2 }}
              className="text-white text-xs font-medium bg-white/10 px-3 py-1 rounded-full">
              Cliquez n&apos;importe où en haut
            </motion.div>
          </div>
        )}

        <svg className="absolute inset-0" width={W} height={H}>
          {PEGS.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r={5} fill="#94a3b8" />
          ))}
          {[1, 2].map((i) => (
            <line key={i} x1={BUCKET_W * i} y1={H - 80} x2={BUCKET_W * i} y2={H} stroke="#475569" strokeWidth={2} />
          ))}
        </svg>

        {ballPos && (
          <motion.div
            animate={{ left: ballPos.x - 10, top: ballPos.y - 10 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute w-5 h-5 rounded-full bg-yellow-400 shadow-lg shadow-yellow-400/50 z-10"
            style={{ left: ballPos.x - 10, top: ballPos.y - 10 }}
          />
        )}

        <div className="absolute bottom-0 inset-x-0 flex h-16">
          {candidates.map((c, i) => (
            <div key={c.id}
              className={`flex-1 flex flex-col items-center justify-center gap-1 bg-gradient-to-t ${bucketColors[i]} ${winBucket === i ? "ring-4 ring-yellow-400" : ""} transition-all`}>
              <Avatar candidate={c} size="sm" />
              <span className="text-white text-xs font-semibold truncate px-1">{c.firstName}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
