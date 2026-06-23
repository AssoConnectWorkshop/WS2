"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

function extractId(rawId: string): string {
  return rawId.split("/").pop() ?? rawId;
}

export async function recordVote(contactId: string): Promise<{ error: string | null }> {
  const db = await createClient();
  const { error } = await db.rpc("increment_vote", { p_contact_id: contactId });
  if (error) {
    console.error("[recordVote] error:", error);
    return { error: error.message };
  }
  return { error: null };
}

export async function addCandidate(rawId: string): Promise<{ error: string | null }> {
  const contactId = extractId(rawId);
  console.log("[addCandidate] rawId:", rawId, "→ contactId:", contactId);

  const db = await createClient();

  const { error: insertError } = await db
    .from("votes")
    .insert({ contact_id: contactId, vote_count: 0 });

  if (insertError && insertError.code !== "23505") {
    console.error("[addCandidate] insert error:", insertError);
    return { error: insertError.message };
  }

  const { error: resetError } = await db
    .from("votes")
    .update({ vote_count: 0 })
    .neq("contact_id", "");

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

  const { error: resetError } = await db
    .from("votes")
    .update({ vote_count: 0 })
    .neq("contact_id", "");

  if (resetError) {
    console.error("[removeCandidate] reset error:", resetError);
    return { error: resetError.message };
  }

  revalidatePath("/configure");
  revalidatePath("/vote");
  return { error: null };
}
