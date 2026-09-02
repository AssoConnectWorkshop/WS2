"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { GENDER_LABELS, type BabyName } from "@/lib/babyNames";

const STORAGE_KEY = "babyNameFavorites";
const FAVORITES_EVENT = "babyname-favorites-changed";

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<BabyName[]>([]);

  useEffect(() => {
    load();
    window.addEventListener(FAVORITES_EVENT, load);
    return () => window.removeEventListener(FAVORITES_EVENT, load);
  }, []);

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      setFavorites(raw ? JSON.parse(raw) : []);
    } catch {
      setFavorites([]);
    }
  }

  function remove(id: number) {
    const next = favorites.filter((f) => f.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setFavorites(next);
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 p-8">
      <Link href="/baby-names" className="text-sm underline">
        ← Retour à la liste
      </Link>

      <h1 className="text-3xl font-bold">Mes favoris ({favorites.length})</h1>

      {favorites.length === 0 ? (
        <p className="text-sm text-gray-500">
          Vous n&apos;avez pas encore de favori. Retournez à la liste et cliquez sur ❤️ pour en ajouter.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {favorites.map((f) => (
            <li key={f.id} className="border rounded-xl p-4 flex items-center justify-between gap-4">
              <div>
                <p className="font-semibold">{f.name}</p>
                <p className="text-xs text-gray-400">
                  {GENDER_LABELS[f.gender]} · {f.origin} · {f.meaning}
                </p>
              </div>
              <button
                type="button"
                onClick={() => remove(f.id)}
                className="text-sm text-red-500 hover:underline"
              >
                Retirer
              </button>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
