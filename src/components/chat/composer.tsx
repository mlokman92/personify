"use client";

import {
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import Image from "next/image";
import { ArrowUp, ImagePlus, Loader2, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ACCEPTED_IMAGE_TYPES, MAX_IMAGE_BYTES } from "@/lib/types";
import { cn } from "@/lib/utils";

type ComposerProps = {
  disabled: boolean;
  onSubmit: (input: { file: File; note: string }) => void;
};

export function Composer({ disabled, onSubmit }: ComposerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [dragging, setDragging] = useState(false);

  function acceptFile(candidate: File | null | undefined) {
    if (!candidate) return;

    if (
      !ACCEPTED_IMAGE_TYPES.includes(
        candidate.type as (typeof ACCEPTED_IMAGE_TYPES)[number],
      )
    ) {
      toast.error("Use a PNG, JPEG, WEBP or GIF image.");
      return;
    }
    if (candidate.size > MAX_IMAGE_BYTES) {
      toast.error("That image is larger than 10 MB.");
      return;
    }

    setPreview((old) => {
      if (old) URL.revokeObjectURL(old);
      return URL.createObjectURL(candidate);
    });
    setFile(candidate);
  }

  function clearFile() {
    setPreview((old) => {
      if (old) URL.revokeObjectURL(old);
      return null;
    });
    setFile(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  function handlePick(event: ChangeEvent<HTMLInputElement>) {
    acceptFile(event.target.files?.[0]);
  }

  function handleDrop(event: DragEvent<HTMLFormElement>) {
    event.preventDefault();
    setDragging(false);
    acceptFile(event.dataTransfer.files?.[0]);
  }

  function submit(event?: FormEvent) {
    event?.preventDefault();
    if (disabled) return;
    if (!file) {
      toast.error("Attach an ad copy image first.");
      return;
    }

    onSubmit({ file, note: note.trim() });
    clearFile();
    setNote("");
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submit();
    }
  }

  return (
    <form
      onSubmit={submit}
      onDrop={handleDrop}
      onDragOver={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      className={cn(
        "bg-background focus-within:border-ring/60 rounded-2xl border p-2 shadow-sm transition-colors",
        dragging && "border-primary bg-primary/5",
      )}
    >
      {preview ? (
        <div className="relative mb-2 ml-1 inline-block">
          <Image
            src={preview}
            alt="Ad copy to analyse"
            width={96}
            height={96}
            unoptimized
            className="size-24 rounded-lg border object-cover"
          />
          <Button
            type="button"
            variant="secondary"
            size="icon-xs"
            aria-label="Remove image"
            onClick={clearFile}
            className="absolute -top-2 -right-2 rounded-full shadow"
          >
            <X />
          </Button>
        </div>
      ) : null}

      <div className="flex items-end gap-2">
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_IMAGE_TYPES.join(",")}
          onChange={handlePick}
          className="hidden"
        />

        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Attach ad copy image"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
        >
          <ImagePlus />
        </Button>

        <Textarea
          value={note}
          onChange={(event) => setNote(event.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          disabled={disabled}
          placeholder={
            file
              ? "Add context (optional) - market, budget, goal..."
              : "Drop an ad copy image, or click the image icon to attach one"
          }
          className="max-h-40 min-h-9 flex-1 resize-none border-0 bg-transparent py-2 shadow-none focus-visible:ring-0"
        />

        <Button
          type="submit"
          size="icon"
          aria-label="Analyse ad copy"
          disabled={disabled || !file}
        >
          {disabled ? <Loader2 className="animate-spin" /> : <ArrowUp />}
        </Button>
      </div>
    </form>
  );
}
