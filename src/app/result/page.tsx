import { getContacts } from "@/lib/assoconnect";
import { createClient } from "@/lib/supabase/server";
import ResultBars from "@/components/ResultBars";
import Link from "next/link";

export const dynamic = "force-dynamic";

function extractId(raw: string): string {
  return raw.split("/").pop() ?? raw;
}

export default async function ResultPage() {
  const [contactsData, db] = await Promise.all([
    getContacts().catch(() => null),
    createClient(),
  ]);

  const { data: rows } = await db.from("votes").select("contact_id, vote_count");

  if (!rows || rows.length === 0) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center gap-6 p-8 text-center">
        <h1 className="text-2xl font-bold text-gray-700">Pas encore de candidats</h1>
        <Link href="/configure" className="px-6 py-3 bg-indigo-600 text-white rounded-full font-semibold hover:bg-indigo-700 transition-colors">
          Configurer les candidats
        </Link>
      </main>
    );
  }

  const allContacts = (contactsData?.["hydra:member"] ?? []).map((c) => ({
    id: extractId((c.id ?? c["@id"]) as string),
    firstname: c.firstname ?? "",
    lastname: c.lastname ?? "",
    profilPictureUrl: c.profilPictureUrl ?? null,
  }));

  const totalVotes = rows.reduce((sum, r) => sum + (r.vote_count ?? 0), 0);

  const results = rows.map((r) => {
    const contact = allContacts.find((c) => c.id === r.contact_id);
    return {
      id: r.contact_id,
      firstName: contact?.firstname ?? r.contact_id,
      lastName: contact?.lastname ?? "",
      picture: contact?.profilPictureUrl ?? null,
      voteCount: r.vote_count ?? 0,
      percent: totalVotes > 0 ? ((r.vote_count ?? 0) / totalVotes) * 100 : 0,
    };
  });

  return (
    <main className="min-h-screen flex flex-col items-center gap-8 p-8 bg-gradient-to-b from-indigo-50 to-purple-50">
      <h1 className="text-3xl font-bold text-indigo-800">Résultats du vote</h1>
      <p className="text-gray-500 text-sm">{totalVotes} vote{totalVotes !== 1 ? "s" : ""} exprimé{totalVotes !== 1 ? "s" : ""}</p>
      <ResultBars results={results} />
      <Link href="/vote" className="mt-4 text-sm text-indigo-500 hover:underline">
        ← Retour au vote
      </Link>
    </main>
  );
}
