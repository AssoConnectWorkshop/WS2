import { getContacts } from "@/lib/assoconnect";
import BonneteauGame from "@/components/BonneteauGame";

export const dynamic = "force-dynamic";

export default async function VotePage() {
  let candidates: { id: string; firstName: string; lastName: string; picture?: string | null }[] = [];

  try {
    const data = await getContacts();
    candidates = data["hydra:member"].slice(0, 3).map((c) => ({
      id: c.id ?? c["@id"],
      firstName: c.firstName,
      lastName: c.lastName,
      picture: c.picture ?? null,
    }));
  } catch {
    candidates = [];
  }

  return <BonneteauGame candidates={candidates} />;
}
