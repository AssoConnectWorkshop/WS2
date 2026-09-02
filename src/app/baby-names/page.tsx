import { createClient } from "@/lib/supabase/server";
import type { BabyName } from "@/lib/babyNames";
import Generator from "./generator";

export const dynamic = "force-dynamic";

export default async function BabyNamesPage() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("baby_names").select("*");
  const names: BabyName[] = error ? [] : (data ?? []);

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-10 p-8">
      <h1 className="text-3xl font-bold text-center">👶 Trouver un prénom</h1>
      {names.length > 0 ? (
        <Generator names={names} />
      ) : (
        <p className="text-sm text-gray-500">Aucun prénom disponible pour le moment.</p>
      )}
    </main>
  );
}
