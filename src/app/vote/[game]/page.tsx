import { getContacts } from "@/lib/assoconnect";
import { createClient } from "@/lib/supabase/server";
import VoteGame from "@/components/VoteGame";
import Link from "next/link";

export const dynamic = "force-dynamic";

// 1=Bonneteau, 2=Plinko, 3=Goalkeeper, 4=Darts, 5=Scratch, 6=MagicCard
const GAME_COUNT = 6;

function extractId(raw: string): string {
  return raw.split("/").pop() ?? raw;
}

export default async function VoteGamePage({ params }: { params: Promise<{ game: string }> }) {
  const { game } = await params;
  const gameNum = parseInt(game, 10);
  const forcedGame = gameNum >= 1 && gameNum <= GAME_COUNT ? gameNum - 1 : undefined;

  const [contactsData, db] = await Promise.all([
    getContacts().catch(() => null),
    createClient(),
  ]);

  const { data: rows } = await db.from("votes").select("contact_id");
  const selectedIds = (rows ?? []).map((r) => r.contact_id);

  const allContacts = (contactsData?.["hydra:member"] ?? []).map((c) => ({
    id: extractId((c.id ?? c["@id"]) as string),
    firstname: c.firstname ?? "",
    lastname: c.lastname ?? "",
    profilPictureUrl: c.profilPictureUrl ?? null,
  }));

  const candidates = selectedIds
    .map((id) => allContacts.find((c) => c.id === id))
    .filter(Boolean)
    .map((c) => ({
      id: c!.id,
      firstName: c!.firstname,
      lastName: c!.lastname,
      picture: c!.profilPictureUrl ?? null,
    }));

  if (candidates.length < 3) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center gap-6 p-8 text-center">
        <h1 className="text-2xl font-bold text-gray-700">Aucun vote en cours</h1>
        <p className="text-gray-500">
          Il faut au moins 3 candidats configurés pour démarrer le vote.
          {candidates.length > 0 && <><br />{candidates.length}/3 candidat(s) sélectionné(s)</>}
        </p>
        <Link href="/configure" className="px-6 py-3 bg-indigo-600 text-white rounded-full font-semibold hover:bg-indigo-700 transition-colors">
          Configurer les candidats
        </Link>
      </main>
    );
  }

  return <VoteGame candidates={candidates} forcedGame={forcedGame} />;
}
