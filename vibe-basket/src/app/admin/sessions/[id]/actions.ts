"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { generateSummary } from "@/lib/summary";

export async function regenerateSummary(respondentId: string, sessionId: string) {
  await requireAdmin();
  await generateSummary(respondentId);
  revalidatePath(`/admin/sessions/${sessionId}`);
}
