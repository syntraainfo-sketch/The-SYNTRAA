"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { apiUploadForm } from "@/lib/client-http";
import { cld } from "@/lib/cloudinary";
import { cn } from "@/lib/utils";

type PaymentScreenshotUploadProps = {
  publicId: string | null;
  onPublicIdChange: (id: string | null) => void;
  required?: boolean;
  className?: string;
};

export function PaymentScreenshotUpload({
  publicId,
  onPublicIdChange,
  required = false,
  className,
}: PaymentScreenshotUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onFileChange(file: File | null) {
    if (!file) return;
    setError(null);
    setUploading(true);
    onPublicIdChange(null);
    const localPreview = URL.createObjectURL(file);
    setPreviewUrl(localPreview);

    try {
      const form = new FormData();
      form.append("file", file);
      const res = await apiUploadForm("/checkout/payment-proof", form);
      const body = (await res.json()) as {
        data?: { publicId?: string };
        error?: { message?: string };
      };
      if (!res.ok || !body.data?.publicId) {
        throw new Error(body.error?.message || "Upload failed");
      }
      onPublicIdChange(body.data.publicId);
    } catch (e) {
      setError((e as Error).message);
      setPreviewUrl(null);
      onPublicIdChange(null);
    } finally {
      setUploading(false);
      URL.revokeObjectURL(localPreview);
    }
  }

  function clear() {
    onPublicIdChange(null);
    setPreviewUrl(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  const imageSrc = publicId ? cld(publicId, 400) : previewUrl;

  return (
    <div className={cn("mt-4 space-y-3", className)}>
      <p className="font-sans text-sm text-[#666]">
        {required ? "Payment screenshot (required)" : "Payment screenshot (optional)"}
      </p>

      <div className="flex flex-wrap items-start gap-4">
        {imageSrc ? (
          <div className="relative h-28 w-28 overflow-hidden rounded-lg border border-[#e0e0e0] bg-[#fafafa]">
            <Image
              src={imageSrc}
              alt="Payment screenshot preview"
              fill
              className="object-cover"
              unoptimized
            />
          </div>
        ) : null}

        <div className="flex flex-col gap-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            capture="environment"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0] ?? null;
              void onFileChange(f);
            }}
          />
          <button
            type="button"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
            className="rounded-lg border border-[#2d2d2d] bg-white px-4 py-2.5 font-sans text-sm font-medium text-[#2d2d2d] transition hover:bg-[#f5f5f5] disabled:opacity-50"
          >
            {uploading
              ? "Uploading…"
              : publicId
                ? "Change screenshot"
                : "Upload payment screenshot"}
          </button>
          {publicId ? (
            <button
              type="button"
              onClick={clear}
              className="text-left font-sans text-xs text-[#888] underline-offset-2 hover:text-[#111] hover:underline"
            >
              Remove
            </button>
          ) : null}
        </div>
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {publicId && !uploading ? (
        <p className="text-sm text-green-700">Screenshot uploaded successfully.</p>
      ) : null}
    </div>
  );
}
