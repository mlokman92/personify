import { notFound } from "next/navigation";

import { ChatView } from "@/components/chat/chat-view";
import { createClient } from "@/lib/supabase/server";
import type { ChatMessage, MessageRow } from "@/lib/types";

const SIGNED_URL_TTL = 60 * 60; // 1 hour

export async function generateMetadata({ params }: PageProps<"/chat/[id]">) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("conversations")
    .select("title")
    .eq("id", id)
    .maybeSingle();

  return { title: `${data?.title ?? "Chat"} - Personify AI` };
}

export default async function ConversationPage({
  params,
}: PageProps<"/chat/[id]">) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: conversation } = await supabase
    .from("conversations")
    .select("id")
    .eq("id", id)
    .maybeSingle();

  if (!conversation) {
    notFound();
  }

  const { data: rows } = await supabase
    .from("messages")
    .select(
      "id, conversation_id, role, content, image_path, analysis, created_at",
    )
    .eq("conversation_id", id)
    .order("created_at", { ascending: true });

  const messages = (rows ?? []) as MessageRow[];

  // The bucket is private, so hand the browser short-lived signed URLs.
  const paths = messages
    .map((message) => message.image_path)
    .filter((path): path is string => Boolean(path));

  const signedUrls = new Map<string, string>();
  if (paths.length > 0) {
    const { data: signed } = await supabase.storage
      .from("ad-copies")
      .createSignedUrls(paths, SIGNED_URL_TTL);

    for (const entry of signed ?? []) {
      if (entry.path && entry.signedUrl) {
        signedUrls.set(entry.path, entry.signedUrl);
      }
    }
  }

  const initialMessages: ChatMessage[] = messages.map((message) => ({
    ...message,
    imageUrl: message.image_path
      ? (signedUrls.get(message.image_path) ?? null)
      : null,
  }));

  return <ChatView conversationId={id} initialMessages={initialMessages} />;
}
