"use client";

import Image from "next/image";
import { Sparkles } from "lucide-react";

import { AnalysisPanel } from "@/components/chat/analysis-panel";
import { normalizeAnalysis } from "@/lib/ai/persona-schema";
import { Skeleton } from "@/components/ui/skeleton";
import type { ChatMessage } from "@/lib/types";

function Avatar() {
  return (
    <span className="bg-primary text-primary-foreground flex size-7 shrink-0 items-center justify-center rounded-lg">
      <Sparkles className="size-3.5" />
    </span>
  );
}

function UserMessage({ message }: { message: ChatMessage }) {
  return (
    <div className="flex justify-end">
      <div className="bg-muted max-w-[85%] space-y-2 rounded-2xl rounded-br-md p-2.5">
        {message.imageUrl ? (
          <Image
            src={message.imageUrl}
            alt="Uploaded ad copy"
            width={320}
            height={320}
            unoptimized
            className="max-h-80 w-auto rounded-xl border object-contain"
          />
        ) : null}
        {message.content ? (
          <p className="px-1 pb-0.5 text-sm whitespace-pre-wrap">
            {message.content}
          </p>
        ) : null}
      </div>
    </div>
  );
}

function AssistantMessage({ message }: { message: ChatMessage }) {
  const analysis = normalizeAnalysis(message.analysis);

  return (
    <div className="flex gap-3">
      <Avatar />
      <div className="min-w-0 flex-1 space-y-4">
        {message.content ? (
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {message.content}
          </p>
        ) : null}
        {analysis ? <AnalysisPanel analysis={analysis} /> : null}
      </div>
    </div>
  );
}

export function ThinkingMessage() {
  return (
    <div className="flex gap-3">
      <Avatar />
      <div className="min-w-0 flex-1 space-y-3">
        <p className="text-muted-foreground animate-pulse text-sm">
          Reading the creative and building personas...
        </p>
        <div className="grid gap-4 xl:grid-cols-2">
          <Skeleton className="h-44 w-full rounded-xl" />
          <Skeleton className="h-44 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export function MessageList({ messages }: { messages: ChatMessage[] }) {
  return (
    <div className="space-y-8">
      {messages.map((message) =>
        message.role === "user" ? (
          <UserMessage key={message.id} message={message} />
        ) : (
          <AssistantMessage key={message.id} message={message} />
        ),
      )}
    </div>
  );
}
