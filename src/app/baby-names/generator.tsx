"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { GENDER_LABELS, type BabyName } from "@/lib/babyNames";

const STORAGE_KEY = "babyNameFavorites";

function readFavorites(): BabyName[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function pickRandom(names: BabyName[], excludeId?: number): BabyName {
  const pool = names.length > 1 ? names.filter((n) => n.id !== excludeId) : names;
  return pool[Math.floor(Math.random() * pool.length)];
}

export default function Generator({ names }: { names: BabyName[] }) {
  const [current, setCurrent] = useState<BabyName | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [favoriteCount, setFavoriteCount] = useState(0);

  useEffect(() => {
    setFavoriteCount(readFavorites().length);
  }, []);

  function generate() {
    const next = pickRandom(names, current?.id);
    setCurrent(next);
    setIsSaved(readFavorites().some((f) => f.id === next.id));
    setFavoriteCount(readFavorites().length);
  }

  function toggleSave() {
    if (!current) return;
    const favorites = readFavorites();
    const next = isSaved
      ? favorites.filter((f) => f.id !== current.id)
      : [...favorites, current];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setIsSaved(!isSaved);
    setFavoriteCount(next.length);
  }

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-md">
      {current ? (
        <div className="border rounded-2xl p-8 flex flex-col items-center gap-2 w-full text-center">
          <p className="text-4xl font-bold">{current.name}</p>
          <p className="text-sm text-gray-400">
            {GENDER_LABELS[current.gender]} · {current.origin}
          </p>
          <p className="text-sm text-gray-600">{current.meaning}</p>
        </div>
      ) : (
        <div className="border rounded-2xl p-8 flex items-center justify-center w-full text-gray-400 text-sm">
          Cliquez sur le bouton pour découvrir un prénom
        </div>
      )}

      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={generate}
          className="bg-black text-white rounded-full px-6 py-3 text-sm font-medium hover:opacity-90"
        >
          🎲 Générer un prénom
        </button>
        {current && (
          <button
            type="button"
            onClick={toggleSave}
            aria-label={isSaved ? "Retirer des favoris" : "Ajouter aux favoris"}
            aria-pressed={isSaved}
            className="border rounded-full w-12 h-12 flex items-center justify-center text-xl"
          >
            {isSaved ? "❤️" : "🤍"}
          </button>
        )}
      </div>

      <Link href="/baby-names/favorites" className="text-sm underline text-gray-500">
        Mes favoris {favoriteCount > 0 && `(${favoriteCount})`}
      </Link>
    </div>
  );
}
