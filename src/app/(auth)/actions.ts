"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import type { AuthState } from "@/lib/auth-state";

function readCredentials(formData: FormData) {
  return {
    email: String(formData.get("email") ?? "").trim(),
    password: String(formData.get("password") ?? ""),
    fullName: String(formData.get("fullName") ?? "").trim(),
    next: String(formData.get("next") ?? "/chat"),
  };
}

/** Only allow same-origin relative redirects. */
function safeNext(next: string) {
  return next.startsWith("/") && !next.startsWith("//") ? next : "/chat";
}

export async function signUpAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const { email, password, fullName, next } = readCredentials(formData);

  if (!email || !password) {
    return { error: "Email and password are required.", notice: null };
  }
  if (password.length < 6) {
    return { error: "Password must be at least 6 characters.", notice: null };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName || null } },
  });

  if (error) {
    return { error: error.message, notice: null };
  }

  // With "Confirm email" turned off in Supabase, signUp returns a live session
  // and the user is signed in immediately.
  if (!data.session) {
    return {
      error: null,
      notice:
        "Account created, but Supabase still has email confirmation enabled. Turn it off under Authentication -> Sign In / Providers -> Email, or confirm the email to continue.",
    };
  }

  revalidatePath("/", "layout");
  redirect(safeNext(next));
}

export async function signInAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const { email, password, next } = readCredentials(formData);

  if (!email || !password) {
    return { error: "Email and password are required.", notice: null };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: error.message, notice: null };
  }

  revalidatePath("/", "layout");
  redirect(safeNext(next));
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
