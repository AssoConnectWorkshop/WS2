import { getContacts } from "@/lib/assoconnect";
import BonneteauGame from "@/components/BonneteauGame";

export const dynamic = "force-dynamic";

export default async function VotePage() {
  let candidates: { id: string; firstName: string; lastName: string; picture?: string | null }[] = [];

  let error: string | null = null;
  let raw: unknown = null;

  let firstContactKeys: string[] = [];

  try {
    const data = await getContacts();
    raw = data;
    const members = data["hydra:member"];
    if (members.length > 0) {
      firstContactKeys = Object.keys(members[0]);
    }
    candidates = members.slice(0, 3).map((c) => {
      const str = (v: unknown) => (typeof v === "string" ? v : "");
      const firstName = str(c.firstName ?? c.first_name ?? c.prenom ?? c.firstname ?? "");
      const lastName = str(c.lastName ?? c.last_name ?? c.nom ?? c.lastname ?? "");
      const picture = typeof c.picture === "string" ? c.picture :
                      typeof c.photo === "string" ? c.photo :
                      typeof c.avatar === "string" ? c.avatar : null;
      return {
        id: str(c.id ?? c["@id"]),
        firstName: firstName || str(c["@id"]),
        lastName,
        picture,
      };
    });
  } catch (e) {
    error = e instanceof Error ? e.message : String(e);
  }

  if (error || candidates.length < 3 || firstContactKeys.length > 0) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center gap-6 p-8">
        {(error || candidates.length < 3) && (
          <h1 className="text-2xl font-bold text-red-600">Erreur de chargement des candidats</h1>
        )}
        {error && (
          <pre className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-800 max-w-2xl w-full whitespace-pre-wrap break-all">
            {error}
          </pre>
        )}
        {firstContactKeys.length > 0 && (
          <div className="max-w-2xl w-full bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
            <p className="font-semibold mb-1">Champs disponibles sur un contact :</p>
            <code>{firstContactKeys.join(", ")}</code>
          </div>
        )}
        {raw !== null && (
          <details className="max-w-2xl w-full">
            <summary className="cursor-pointer text-sm text-gray-500 mb-2">Réponse brute de l&apos;API (3 premiers contacts)</summary>
            <pre className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-xs text-gray-700 overflow-auto max-h-96 whitespace-pre-wrap break-all">
              {JSON.stringify(
                { ...(raw as object), "hydra:member": (raw as { "hydra:member": unknown[] })["hydra:member"]?.slice(0, 3) },
                null, 2
              )}
            </pre>
          </details>
        )}
        {!error && candidates.length < 3 && (
          <p className="text-gray-600">
            Seulement {candidates.length} contact(s) retourné(s) &mdash; il en faut au moins 3.
          </p>
        )}
      </main>
    );
  }

  return <BonneteauGame candidates={candidates} />;
}
