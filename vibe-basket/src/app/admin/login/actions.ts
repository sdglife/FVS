"use server";

import { redirect } from "next/navigation";
import { createAdminSession, verifyAdminCredentials } from "@/lib/auth";

export async function login(_prevState: string | undefined, formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  let valid: boolean;
  try {
    valid = verifyAdminCredentials(email, password);
  } catch (err) {
    return `Server not configured: ${String(err)}`;
  }

  if (!valid) {
    return "Incorrect email or password.";
  }

  await createAdminSession();
  redirect("/admin");
}
