"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export async function deleteConversationAction(formData: FormData) {
  const id = String(formData.get("conversationId") ?? "");
  // Only jump back to a blank chat if the deleted thread is the one on screen.
  const isActive = String(formData.get("isActive") ?? "") === "true";
  if (!id) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Remove the stored creatives first; the rows cascade with the conversation.
  const { data: messages } = await supabase
    .from("messages")
    .select("image_path")
    .eq("conversation_id", id)
    .not("image_path", "is", null);

  const paths = (messages ?? [])
    .map((message) => message.image_path)
    .filter((path): path is string => Boolean(path));

  if (paths.length > 0) {
    await supabase.storage.from("ad-copies").remove(paths);
  }

  await supabase.from("conversations").delete().eq("id", id);

  revalidatePath("/chat", "layout");
  if (isActive) redirect("/chat");
}

export async function renameConversationAction(formData: FormData) {
  const id = String(formData.get("conversationId") ?? "");
  const title = String(formData.get("title") ?? "")
    .trim()
    .slice(0, 120);
  if (!id || !title) return;

  const supabase = await createClient();
  await supabase.from("conversations").update({ title }).eq("id", id);

  revalidatePath("/chat", "layout");
}
