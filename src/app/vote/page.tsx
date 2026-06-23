import { getContacts } from "@/lib/assoconnect";
import BonneteauGame from "@/components/BonneteauGame";

export const dynamic = "force-dynamic";

export default async function VotePage() {
  let candidates: { id: string; firstName: string; lastName: string; picture?: string | null }[] = [];
  let error: string | null = null;

  try {
    const data = await getContacts();
    candidates = data["hydra:member"].slice(0, 3).map((c) => ({
      id: c.id ?? c["@id"],
      firstName: c.firstname ?? "",
      lastName: c.lastname ?? "",
      picture: c.profilPictureUrl ?? null,
    }));
  } catch (e) {
    error = e instanceof Error ? e.message : String(e);
  }

  if (error || candidates.length < 3) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center gap-6 p-8">
        <h1 className="text-2xl font-bold text-red-600">Erreur de chargement des candidats</h1>
        {error && (
          <pre className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-800 max-w-2xl w-full whitespace-pre-wrap break-all">
            {error}
          </pre>
        )}
        {!error && (
          <p className="text-gray-600">
            Seulement {candidates.length} contact(s) retourné(s) &mdash; il en faut au moins 3.
          </p>
        )}
      </main>
    );
  }

  return <BonneteauGame candidates={candidates} />;
}
