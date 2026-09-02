import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { GENDER_LABELS, type BabyName, type BabyNameGender } from "@/lib/babyNames";
import NameCard from "./name-card";
import SurpriseButton from "./surprise-button";

export const dynamic = "force-dynamic";

const GENDERS: BabyNameGender[] = ["girl", "boy", "unisex"];

export default async function BabyNamesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; gender?: string }>;
}) {
  const { q, gender } = await searchParams;
  const activeGender = GENDERS.find((g) => g === gender);

  const supabase = await createClient();
  let query = supabase.from("baby_names").select("*").order("name");
  if (activeGender) query = query.eq("gender", activeGender);
  if (q) query = query.or(`name.ilike.%${q}%,meaning.ilike.%${q}%,origin.ilike.%${q}%`);

  const { data, error } = await query;
  const names: BabyName[] = error ? [] : (data ?? []);
  const surprise = names.length > 0 ? names[Math.floor(Math.random() * names.length)] : null;

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-8 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">👶 Trouver un prénom</h1>
        <Link href="/baby-names/favorites" className="text-sm underline">
          Mes favoris →
        </Link>
      </div>

      <form className="flex flex-wrap items-center gap-3">
        <input
          type="text"
          name="q"
          defaultValue={q ?? ""}
          placeholder="Rechercher un prénom, une origine, une signification..."
          className="flex-1 min-w-48 border rounded-lg px-3 py-2 text-sm"
        />
        <select
          name="gender"
          defaultValue={activeGender ?? ""}
          className="border rounded-lg px-3 py-2 text-sm"
        >
          <option value="">Tous</option>
          {GENDERS.map((g) => (
            <option key={g} value={g}>
              {GENDER_LABELS[g]}
            </option>
          ))}
        </select>
        <button type="submit" className="border rounded-lg px-4 py-2 text-sm font-medium hover:bg-gray-50">
          Filtrer
        </button>
        {(q || activeGender) && (
          <Link href="/baby-names" className="text-sm underline">
            Réinitialiser
          </Link>
        )}
      </form>

      {surprise && (
        <div className="border rounded-xl p-5 flex items-center justify-between gap-4 bg-gray-50">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide">Idée du moment</p>
            <p className="text-xl font-semibold">{surprise.name}</p>
            <p className="text-sm text-gray-600">
              {GENDER_LABELS[surprise.gender]} · {surprise.origin} · {surprise.meaning}
            </p>
          </div>
          <SurpriseButton />
        </div>
      )}

      <p className="text-sm text-gray-400">
        {names.length} prénom{names.length === 1 ? "" : "s"}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {names.map((n) => (
          <NameCard key={n.id} name={n} />
        ))}
      </div>

      {names.length === 0 && (
        <p className="text-sm text-gray-500">Aucun prénom ne correspond à votre recherche.</p>
      )}
    </main>
  );
}
