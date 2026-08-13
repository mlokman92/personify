import type { AdCopyAnalysis } from "@/lib/ai/persona-schema";

export type Conversation = {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
};

export type MessageRow = {
  id: string;
  conversation_id: string;
  role: "user" | "assistant";
  content: string;
  image_path: string | null;
  analysis: AdCopyAnalysis | null;
  created_at: string;
};

/** A message as the UI sees it: the row plus a viewable image URL. */
export type ChatMessage = MessageRow & {
  imageUrl: string | null;
  /** Set on optimistic messages that have not been persisted yet. */
  pending?: boolean;
};

export const ACCEPTED_IMAGE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
] as const;

export const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10 MB, matches the bucket limit
