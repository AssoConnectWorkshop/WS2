"use client";

import { useEffect, useState } from "react";
import { GENDER_LABELS, type BabyName } from "@/lib/babyNames";

const STORAGE_KEY = "babyNameFavorites";
const FAVORITES_EVENT = "babyname-favorites-changed";

function readFavorites(): BabyName[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export default function NameCard({ name }: { name: BabyName }) {
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    setIsFavorite(readFavorites().some((f) => f.id === name.id));
  }, [name.id]);

  function toggleFavorite() {
    const favorites = readFavorites();
    const next = isFavorite
      ? favorites.filter((f) => f.id !== name.id)
      : [...favorites, name];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setIsFavorite(!isFavorite);
    window.dispatchEvent(new Event(FAVORITES_EVENT));
  }

  return (
    <div className="border rounded-xl p-4 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{name.name}</h2>
        <button
          type="button"
          onClick={toggleFavorite}
          aria-label={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
          aria-pressed={isFavorite}
          className="text-xl leading-none"
        >
          {isFavorite ? "❤️" : "🤍"}
        </button>
      </div>
      <p className="text-xs text-gray-400">
        {GENDER_LABELS[name.gender]} · {name.origin}
      </p>
      <p className="text-sm text-gray-600">{name.meaning}</p>
    </div>
  );
}
