"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function addCandidate(contactId: string): Promise<{ error: string | null }> {
  console.log("[addCandidate] contactId:", contactId);
  const db = await createClient();
  const { error } = await db.rpc("add_candidate", { p_contact_id: contactId });
  console.log("[addCandidate] rpc result error:", error);
  if (error) return { error: error.message };
  revalidatePath("/configure");
  revalidatePath("/vote");
  return { error: null };
}

export async function removeCandidate(contactId: string): Promise<{ error: string | null }> {
  console.log("[removeCandidate] contactId:", contactId);
  const db = await createClient();
  const { error } = await db.rpc("remove_candidate", { p_contact_id: contactId });
  console.log("[removeCandidate] rpc result error:", error);
  if (error) return { error: error.message };
  revalidatePath("/configure");
  revalidatePath("/vote");
  return { error: null };
}
