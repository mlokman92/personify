import { NextResponse } from "next/server";

import { analyzeAdCopy } from "@/lib/ai/analyze";
import { createClient } from "@/lib/supabase/server";
import { ACCEPTED_IMAGE_TYPES, MAX_IMAGE_BYTES } from "@/lib/types";

export const runtime = "nodejs";
// Vision analysis of a dense creative can take a while.
export const maxDuration = 60;

const BUCKET = "ad-copies";

function fail(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

function extensionFor(type: string) {
  return (
    {
      "image/png": "png",
      "image/jpeg": "jpg",
      "image/webp": "webp",
      "image/gif": "gif",
    }[type] ?? "png"
  );
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return fail("You need to be signed in to analyse an ad copy.", 401);
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return fail("Could not read the upload.", 400);
  }

  const file = form.get("image");
  const note = String(form.get("note") ?? "").slice(0, 2000);
  const existingConversationId = form.get("conversationId");

  if (!(file instanceof File) || file.size === 0) {
    return fail("Attach an ad copy image to analyse.", 400);
  }
  if (
    !ACCEPTED_IMAGE_TYPES.includes(
      file.type as (typeof ACCEPTED_IMAGE_TYPES)[number],
    )
  ) {
    return fail("Unsupported file type. Use PNG, JPEG, WEBP or GIF.", 400);
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return fail("That image is larger than 10 MB.", 400);
  }

  // 1. Store the creative. RLS requires the first path segment to be the user id.
  const bytes = Buffer.from(await file.arrayBuffer());
  const imagePath = `${user.id}/${crypto.randomUUID()}.${extensionFor(file.type)}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(imagePath, bytes, { contentType: file.type, upsert: false });

  if (uploadError) {
    return fail(`Upload failed: ${uploadError.message}`, 500);
  }

  const cleanUpImage = async () => {
    await supabase.storage.from(BUCKET).remove([imagePath]);
  };

  // 2. Ask the model to read the creative and build personas.
  let analysis;
  try {
    analysis = await analyzeAdCopy({
      dataUrl: `data:${file.type};base64,${bytes.toString("base64")}`,
      note,
    });
  } catch (error) {
    await cleanUpImage();
    const message =
      error instanceof Error ? error.message : "The analysis failed.";
    console.error("[analyze] model call failed:", error);
    return fail(message, 502);
  }

  // 3. Persist the conversation and both messages.
  let conversationId =
    typeof existingConversationId === "string" && existingConversationId
      ? existingConversationId
      : null;

  if (conversationId) {
    const { data: owned, error } = await supabase
      .from("conversations")
      .select("id")
      .eq("id", conversationId)
      .maybeSingle();

    if (error || !owned) {
      await cleanUpImage();
      return fail("Conversation not found.", 404);
    }
  } else {
    const { data: created, error } = await supabase
      .from("conversations")
      .insert({ user_id: user.id, title: analysis.title || "New chat" })
      .select("id")
      .single();

    if (error || !created) {
      await cleanUpImage();
      return fail(`Could not start the chat: ${error?.message}`, 500);
    }
    conversationId = created.id;
  }

  const { error: insertError } = await supabase.from("messages").insert([
    {
      conversation_id: conversationId,
      user_id: user.id,
      role: "user",
      content: note,
      image_path: imagePath,
    },
    {
      conversation_id: conversationId,
      user_id: user.id,
      role: "assistant",
      content: analysis.summary,
      analysis,
    },
  ]);

  if (insertError) {
    return fail(`Could not save the analysis: ${insertError.message}`, 500);
  }

  return NextResponse.json({ conversationId, analysis });
}
