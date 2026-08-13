"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Composer } from "@/components/chat/composer";
import { EmptyState } from "@/components/chat/empty-state";
import { MessageList, ThinkingMessage } from "@/components/chat/message-list";
import type { ChatMessage } from "@/lib/types";

type ChatViewProps = {
  /** null on the "new chat" screen, until the first analysis creates one. */
  conversationId: string | null;
  initialMessages: ChatMessage[];
};

export function ChatView({ conversationId, initialMessages }: ChatViewProps) {
  const router = useRouter();
  const [pending, setPending] = useState<ChatMessage | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Adjusting state when a prop changes: once the server sends the real
  // messages (after router.refresh()), the optimistic copy is no longer needed.
  // https://react.dev/learn/you-might-not-need-an-effect
  const [renderedMessages, setRenderedMessages] = useState(initialMessages);
  if (renderedMessages !== initialMessages) {
    setRenderedMessages(initialMessages);
    setPending(null);
    setIsAnalyzing(false);
  }

  // The optimistic bubble points at a blob URL; release it when it goes away.
  useEffect(() => {
    const url = pending?.imageUrl;
    if (!url) return;
    return () => URL.revokeObjectURL(url);
  }, [pending]);

  const messages = pending ? [...initialMessages, pending] : initialMessages;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length, isAnalyzing]);

  async function handleSubmit({ file, note }: { file: File; note: string }) {
    setPending({
      id: `pending-${Date.now()}`,
      conversation_id: conversationId ?? "",
      role: "user",
      content: note,
      image_path: null,
      analysis: null,
      created_at: new Date().toISOString(),
      imageUrl: URL.createObjectURL(file),
      pending: true,
    });
    setIsAnalyzing(true);

    const body = new FormData();
    body.set("image", file);
    body.set("note", note);
    if (conversationId) body.set("conversationId", conversationId);

    try {
      const response = await fetch("/api/analyze", { method: "POST", body });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.error ?? "The analysis failed.");
      }

      if (conversationId) {
        router.refresh();
      } else {
        router.push(`/chat/${result.conversationId}`);
      }
    } catch (error) {
      setPending(null);
      setIsAnalyzing(false);
      toast.error(
        error instanceof Error ? error.message : "The analysis failed.",
      );
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-4xl px-4 py-6">
          {messages.length === 0 && !isAnalyzing ? (
            <EmptyState />
          ) : (
            <div className="space-y-8">
              <MessageList messages={messages} />
              {isAnalyzing ? <ThinkingMessage /> : null}
            </div>
          )}
          <div ref={bottomRef} className="h-px" />
        </div>
      </div>

      <div className="shrink-0 px-4 pb-4">
        <div className="mx-auto w-full max-w-4xl">
          <Composer disabled={isAnalyzing} onSubmit={handleSubmit} />
          <p className="text-muted-foreground mt-2 text-center text-xs">
            Personify AI infers personas from the creative. Sanity-check before
            you spend budget.
          </p>
        </div>
      </div>
    </div>
  );
}
