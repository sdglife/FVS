"use server";

import crypto from "node:crypto";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/server";

function generateShareToken(): string {
  // URL-safe, short enough to read over the phone, long enough not to guess.
  return crypto.randomBytes(9).toString("base64url");
}

export async function createSession(_prevState: string | undefined, formData: FormData) {
  await requireAdmin();

  const projectName = String(formData.get("project_name") ?? "").trim() || null;
  const db = supabaseAdmin();

  const { error } = await db.from("sessions").insert({
    project_name: projectName,
    share_token: generateShareToken(),
    status: "not_started",
  });

  if (error) return error.message;

  revalidatePath("/admin");
  return undefined;
}
