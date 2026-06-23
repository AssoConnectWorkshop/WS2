import { getContacts } from "@/lib/assoconnect";
import { createClient } from "@/lib/supabase/server";
import BonneteauGame from "@/components/BonneteauGame";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function VotePage() {
  const [contactsData, db] = await Promise.all([
    getContacts().catch(() => null),
    createClient(),
  ]);

  const { data: rows } = await db.from("votes").select("contact_id");
  const selectedIds = (rows ?? []).map((r) => r.contact_id);

  const allContacts = contactsData?.["hydra:member"] ?? [];
  const candidates = selectedIds
    .map((id) => allContacts.find((c) => (c.id ?? c["@id"]) === id))
    .filter(Boolean)
    .map((c) => ({
      id: (c!.id ?? c!["@id"]) as string,
      firstName: c!.firstname ?? "",
      lastName: c!.lastname ?? "",
      picture: c!.profilPictureUrl ?? null,
    }));

  if (candidates.length < 3) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center gap-6 p-8 text-center">
        <h1 className="text-2xl font-bold text-gray-700">Aucun vote en cours</h1>
        <p className="text-gray-500">
          Il faut au moins 3 candidats configurés pour démarrer le vote.
          <br />
          {candidates.length > 0 && `(${candidates.length}/3 candidat(s) sélectionné(s))`}
        </p>
        <Link
          href="/configure"
          className="px-6 py-3 bg-indigo-600 text-white rounded-full font-semibold hover:bg-indigo-700 transition-colors"
        >
          Configurer les candidats
        </Link>
      </main>
    );
  }

  return <BonneteauGame candidates={candidates} />;
}
