"use client";

import { useEffect, useState } from "react";

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

export default function ResultBars({ results }: { results: Result[] }) {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(t);
  }, []);

  const sorted = [...results].sort((a, b) => b.voteCount - a.voteCount);
  const winner = sorted[0];

  return (
    <div className="flex flex-col gap-6 w-full max-w-xl">
      {sorted.map((r, i) => (
        <div key={r.id} className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <Avatar r={r} />
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-gray-800">
                  {r.firstName} {r.lastName}
                  {r.id === winner.id && winner.voteCount > 0 && (
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
