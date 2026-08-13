import type { Metadata } from "next";

import { ChatView } from "@/components/chat/chat-view";

export const metadata: Metadata = { title: "New chat - Personify AI" };

export default function NewChatPage() {
  return <ChatView conversationId={null} initialMessages={[]} />;
}
