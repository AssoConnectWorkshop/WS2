"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function addCandidate(contactId: string) {
  const db = await createClient();
  await db.rpc("add_candidate", { p_contact_id: contactId });
  revalidatePath("/configure");
  revalidatePath("/vote");
}

export async function removeCandidate(contactId: string) {
  const db = await createClient();
  await db.rpc("remove_candidate", { p_contact_id: contactId });
  revalidatePath("/configure");
  revalidatePath("/vote");
}
