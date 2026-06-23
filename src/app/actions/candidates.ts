"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

function extractId(rawId: string): string {
  // "/api/v1/crm/contacts/01KVTGGQHJZYMMF1T338S2NFG6" → "01KVTGGQHJZYMMF1T338S2NFG6"
  return rawId.split("/").pop() ?? rawId;
}

export async function addCandidate(rawId: string): Promise<{ error: string | null }> {
  const contactId = extractId(rawId);
  console.log("[addCandidate] rawId:", rawId, "→ contactId:", contactId);

  const db = await createClient();

  // Insert new candidate
  const { error: insertError } = await db
    .from("votes")
    .insert({ contact_id: contactId, vote_count: 0 });

  if (insertError && insertError.code !== "23505") {
    // 23505 = unique violation (already exists), safe to ignore
    console.error("[addCandidate] insert error:", insertError);
    return { error: insertError.message };
  }

  // Reset all vote counts to 0
  const { error: resetError } = await db
    .from("votes")
    .update({ vote_count: 0 })
    .gte("vote_count", 0);

  if (resetError) {
    console.error("[addCandidate] reset error:", resetError);
    return { error: resetError.message };
  }

  revalidatePath("/configure");
  revalidatePath("/vote");
  return { error: null };
}

export async function removeCandidate(rawId: string): Promise<{ error: string | null }> {
  const contactId = extractId(rawId);
  console.log("[removeCandidate] rawId:", rawId, "→ contactId:", contactId);

  const db = await createClient();

  const { error: deleteError } = await db
    .from("votes")
    .delete()
    .eq("contact_id", contactId);

  if (deleteError) {
    console.error("[removeCandidate] delete error:", deleteError);
    return { error: deleteError.message };
  }

  // Reset remaining vote counts to 0
  const { error: resetError } = await db
    .from("votes")
    .update({ vote_count: 0 })
    .gte("vote_count", 0);

  if (resetError) {
    console.error("[removeCandidate] reset error:", resetError);
    return { error: resetError.message };
  }

  revalidatePath("/configure");
  revalidatePath("/vote");
  return { error: null };
}
