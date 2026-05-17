"use client";

import Image from "next/image";
import { useCallback, useRef, useState } from "react";
import { Loader2, Trash2, Upload } from "lucide-react";
import { apiFetch } from "@/lib/client-http";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cld } from "@/lib/cloudinary";

export type GalleryDraft = { publicId: string; alt?: string };

type SignResponse = {
  data?: {
    signature: string;
    timestamp: number;
    folder: string;
    apiKey: string;
    cloudName: string;
  };
  error?: { message?: string };
};

async function uploadOneFile(
  file: File,
  sign: SignResponse["data"]
): Promise<string> {
  if (!sign?.cloudName || !sign.apiKey) throw new Error("Invalid sign payload");
  const fd = new FormData();
  fd.append("file", file);
  fd.append("api_key", sign.apiKey);
  fd.append("timestamp", String(sign.timestamp));
  fd.append("signature", sign.signature);
  fd.append("folder", sign.folder);
  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${sign.cloudName}/image/upload`,
    { method: "POST", body: fd }
  );
  const json = (await res.json()) as { public_id?: string; error?: { message?: string } };
  if (!res.ok) {
    throw new Error(json.error?.message ?? `Upload failed (${res.status})`);
  }
  if (!json.public_id) throw new Error("No public_id from Cloudinary");
  return json.public_id;
}

export function CloudinaryMultiUpload({
  value,
  onChange,
  disabled,
}: {
  value: GalleryDraft[];
  onChange: (next: GalleryDraft[]) => void;
  disabled?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const onPick = useCallback(
    async (files: FileList | null) => {
      if (!files?.length) return;
      setErr(null);
      setBusy(true);
      try {
        const signRes = await apiFetch("/admin/media/sign", {
          method: "POST",
          json: {},
        });
        const signBody = (await signRes.json()) as SignResponse;
        if (!signRes.ok) {
          throw new Error(
            signBody.error?.message ??
              (signRes.status === 503
                ? "Cloudinary not configured (set CLOUDINARY_* in .env.local)."
                : "Could not get upload signature")
          );
        }
        const sign = signBody.data;
        if (!sign) throw new Error("Empty sign response");

        const next = [...value];
        for (const file of Array.from(files)) {
          if (!file.type.startsWith("image/")) continue;
          if (file.size > 12 * 1024 * 1024) {
            setErr(`Skipped ${file.name} (max 12MB).`);
            continue;
          }
          const publicId = await uploadOneFile(file, sign);
          next.push({ publicId, alt: file.name.replace(/\.[^.]+$/, "") });
        }
        onChange(next);
      } catch (e) {
        setErr((e as Error).message ?? "Upload failed");
      } finally {
        setBusy(false);
        if (inputRef.current) inputRef.current.value = "";
      }
    },
    [onChange, value]
  );

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        disabled={disabled || busy}
        onChange={(e) => void onPick(e.target.files)}
      />
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="secondary"
          disabled={disabled || busy}
          onClick={() => inputRef.current?.click()}
        >
          {busy ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading…
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Add images
            </>
          )}
        </Button>
        <span className="text-xs text-muted">Multiple files ok · max 12MB each</span>
      </div>
      {err && <p className="text-sm text-red-600">{err}</p>}
      {value.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2">
          {value.map((g, idx) => (
            <div
              key={`${g.publicId}-${idx}`}
              className="flex gap-3 rounded-2xl border border-hairline bg-white/70 p-3"
            >
              <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-[#F5EFE6]">
                <Image
                  src={cld(g.publicId, 200)}
                  alt={g.alt ?? ""}
                  fill
                  className="object-contain"
                  unoptimized={cld(g.publicId).startsWith("http")}
                  sizes="96px"
                />
              </div>
              <div className="min-w-0 flex-1 space-y-2">
                <Input
                  value={g.alt ?? ""}
                  placeholder="Alt text"
                  onChange={(e) => {
                    const copy = [...value];
                    copy[idx] = { ...copy[idx], alt: e.target.value };
                    onChange(copy);
                  }}
                />
                <p className="truncate font-mono text-[0.65rem] text-muted">{g.publicId}</p>
                <Button
                  type="button"
                  variant="ghost"
                  className="px-3 py-2 text-xs normal-case tracking-normal text-red-600"
                  onClick={() => onChange(value.filter((_, i) => i !== idx))}
                >
                  <Trash2 className="mr-1 h-4 w-4" />
                  Remove
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
