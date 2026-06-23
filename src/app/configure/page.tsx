import { getContacts } from "@/lib/assoconnect";
import { createClient } from "@/lib/supabase/server";
import ConfigurePanel from "@/components/ConfigurePanel";

export const dynamic = "force-dynamic";

export default async function ConfigurePage() {
  const [contactsData, db] = await Promise.all([
    getContacts().catch(() => null),
    createClient(),
  ]);

  const allContacts = (contactsData?.["hydra:member"] ?? []).map((c) => ({
    id: c.id ?? c["@id"],
    firstname: c.firstname ?? "",
    lastname: c.lastname ?? "",
    profilPictureUrl: c.profilPictureUrl ?? null,
  }));

  const { data: rows } = await db.from("votes").select("contact_id");
  const selectedIds = new Set((rows ?? []).map((r) => r.contact_id));
  const selected = allContacts.filter((c) => selectedIds.has(c.id));

  return (
    <main className="min-h-screen flex flex-col items-center gap-8 p-8 bg-gradient-to-b from-indigo-50 to-purple-50">
      <h1 className="text-3xl font-bold text-indigo-800">Configuration du vote</h1>
      <ConfigurePanel contacts={allContacts} selected={selected} />
    </main>
  );
}
