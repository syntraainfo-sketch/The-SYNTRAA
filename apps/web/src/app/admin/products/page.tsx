"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/client-http";
import { cld } from "@/lib/cloudinary";
import * as Dialog from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";
import {
  CloudinaryMultiUpload,
  type GalleryDraft,
} from "@/components/admin/CloudinaryMultiUpload";

type ProductVariantDraft = {
  sku: string;
  label?: string;
  size?: string;
  priceUSD: number;
  inventory: number;
};

type AdminCategory = {
  id: string;
  name: string;
  slug: string;
};

type AdminProduct = {
  id: string;
  title: string;
  slug: string;
  featured?: boolean;
  descriptionShort?: string;
  richDescription?: string;
  ingredients?: string;
  howToUse?: string;
  benefits?: string;
  sustainability?: string;
  highlights?: string[];
  gallery?: GalleryDraft[];
  categories?: string[];
  variants?: ProductVariantDraft[];
};

type DraftState = AdminProduct & {
  /** One highlight per line in the form */
  highlightsText: string;
};

function emptyDraft(): DraftState {
  return {
    id: "",
    title: "",
    slug: "",
    featured: false,
    descriptionShort: "",
    richDescription: "",
    ingredients: "",
    howToUse: "",
    benefits: "",
    sustainability: "",
    highlightsText: "",
    gallery: [],
    variants: [
      { sku: "SKU-100ML", label: "100 ml", size: "100 ml", priceUSD: 15, inventory: 25 },
      { sku: "SKU-200ML", label: "200 ml", size: "200 ml", priceUSD: 30, inventory: 25 },
      { sku: "SKU-300ML", label: "300 ml", size: "300 ml", priceUSD: 45, inventory: 25 },
    ],
  };
}

function toDraft(p: AdminProduct): DraftState {
  return {
    ...p,
    gallery: p.gallery?.length ? p.gallery : [],
    highlightsText: (p.highlights ?? []).join("\n"),
  };
}

export default function AdminProducts() {
  const [items, setItems] = useState<AdminProduct[]>([]);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<DraftState>(() => emptyDraft());
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [busy, setBusy] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      const [productsRes, categoriesRes] = await Promise.all([
        apiFetch("/admin/products"),
        apiFetch("/admin/categories"),
      ]);
      const productsBody = (await productsRes.json()) as { data?: AdminProduct[] };
      const categoriesBody = (await categoriesRes.json()) as { data?: AdminCategory[] };
      setItems(productsBody.data ?? []);
      setCategories(categoriesBody.data ?? []);
    })();
  }, []);

  return (
    <main className="space-y-10 py-12">
      <header className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[0.65rem] uppercase tracking-[0.34em] text-muted">
            Admin · Products
          </p>
          <h1 className="mt-4 font-display text-4xl leading-tight text-text">
            Product management
          </h1>
          <p className="mt-4 max-w-2xl text-sm text-muted">
            Upload multiple images (Cloudinary). First image is the catalog hero; order matches the
            storefront gallery.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button
            variant="secondary"
            onClick={() => {
              setMode("create");
              setDraft(emptyDraft());
              setOpen(true);
            }}
          >
            New product
          </Button>
        </div>
      </header>

      <div className="grid gap-3">
        {items.map((p) => (
          <div
            key={p.id}
            className="glass-panel flex flex-col gap-4 rounded-3xl px-6 py-5 md:flex-row md:items-center md:justify-between"
          >
            <div className="flex gap-4">
              {p.gallery?.[0]?.publicId ? (
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-[#F5EFE6]">
                  <Image
                    src={cld(p.gallery[0].publicId, 128)}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="64px"
                    unoptimized={cld(p.gallery[0].publicId).startsWith("http")}
                  />
                </div>
              ) : null}
              <div>
                <p className="font-display text-2xl text-text">{p.title}</p>
                <p className="mt-1 text-[0.7rem] uppercase tracking-[0.28em] text-muted">
                  {p.slug} {p.featured ? "· featured" : ""}
                </p>
                <p className="mt-2 text-sm text-muted">
                  Images: {p.gallery?.length ?? 0} · Variants: {p.variants?.length ?? 0}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="secondary"
                onClick={() => {
                  setMode("edit");
                  setDraft(toDraft(p));
                  setOpen(true);
                }}
              >
                Edit
              </Button>
              <Button
                variant="ghost"
                onClick={async () => {
                  if (!confirm("Delete this product?")) return;
                  await apiFetch(`/admin/products/${p.id}`, { method: "DELETE" });
                  setItems((x) => x.filter((i) => i.id !== p.id));
                }}
              >
                Delete
              </Button>
            </div>
          </div>
        ))}
        {items.length === 0 ? (
          <div className="glass-panel rounded-3xl px-6 py-5 text-sm text-muted">
            No products yet. Create your first product.
          </div>
        ) : null}
      </div>

      <Dialog.Root
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) setSaveError(null);
        }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
          <Dialog.Content className="fixed left-1/2 top-1/2 max-h-[min(90vh,860px)] w-[min(720px,94vw)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-[28px] border border-hairline bg-white/92 p-6 shadow-[0_30px_120px_rgba(0,0,0,0.22)]">
            <div className="flex items-start justify-between gap-6">
              <div>
                <Dialog.Title className="font-display text-2xl text-text">
                  {mode === "create" ? "Create product" : "Edit product"}
                </Dialog.Title>
                <Dialog.Description className="mt-1 text-sm text-muted">
                  Variants, images, and short copy for the storefront.
                </Dialog.Description>
              </div>
              <Dialog.Close className="rounded-full border border-hairline bg-white/70 p-2 text-text">
                <X className="h-5 w-5" />
              </Dialog.Close>
            </div>

            <div className="mt-6 grid gap-4">
              <Input
                value={draft.title}
                onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
                placeholder="Title"
              />
              <Input
                value={draft.slug}
                onChange={(e) => setDraft((d) => ({ ...d, slug: e.target.value }))}
                placeholder="Slug"
              />
              <label className="space-y-2 text-[0.65rem] uppercase tracking-[0.22em] text-muted">
                Short description
                <textarea
                  value={draft.descriptionShort ?? ""}
                  onChange={(e) => setDraft((d) => ({ ...d, descriptionShort: e.target.value }))}
                  rows={3}
                  className="w-full rounded-2xl border border-hairline bg-white/80 px-4 py-3 text-sm normal-case tracking-normal text-text"
                  placeholder="Shown under the title on the product page"
                />
              </label>

              <div className="rounded-3xl border border-hairline bg-white/70 p-4">
                <p className="text-[0.65rem] uppercase tracking-[0.32em] text-muted">
                  Product details (storefront accordions)
                </p>
                <div className="mt-4 grid gap-4">
                  <label className="space-y-2 text-[0.65rem] uppercase tracking-[0.22em] text-muted">
                    Main description
                    <textarea
                      value={draft.richDescription ?? ""}
                      onChange={(e) => setDraft((d) => ({ ...d, richDescription: e.target.value }))}
                      rows={5}
                      className="w-full rounded-2xl border border-hairline bg-white/80 px-4 py-3 text-sm normal-case tracking-normal text-text"
                      placeholder="Full product story for the Description accordion"
                    />
                  </label>
                  <label className="space-y-2 text-[0.65rem] uppercase tracking-[0.22em] text-muted">
                    Ingredients
                    <textarea
                      value={draft.ingredients ?? ""}
                      onChange={(e) => setDraft((d) => ({ ...d, ingredients: e.target.value }))}
                      rows={4}
                      className="w-full rounded-2xl border border-hairline bg-white/80 px-4 py-3 text-sm normal-case tracking-normal text-text"
                      placeholder="INCI list, actives, sourcing notes"
                    />
                  </label>
                  <label className="space-y-2 text-[0.65rem] uppercase tracking-[0.22em] text-muted">
                    How to use
                    <textarea
                      value={draft.howToUse ?? ""}
                      onChange={(e) => setDraft((d) => ({ ...d, howToUse: e.target.value }))}
                      rows={4}
                      className="w-full rounded-2xl border border-hairline bg-white/80 px-4 py-3 text-sm normal-case tracking-normal text-text"
                      placeholder="Application steps, frequency, tips"
                    />
                  </label>
                  <label className="space-y-2 text-[0.65rem] uppercase tracking-[0.22em] text-muted">
                    Benefits
                    <textarea
                      value={draft.benefits ?? ""}
                      onChange={(e) => setDraft((d) => ({ ...d, benefits: e.target.value }))}
                      rows={4}
                      className="w-full rounded-2xl border border-hairline bg-white/80 px-4 py-3 text-sm normal-case tracking-normal text-text"
                      placeholder="Key benefits for the Benefits accordion"
                    />
                  </label>
                  <label className="space-y-2 text-[0.65rem] uppercase tracking-[0.22em] text-muted">
                    Sustainability & ethics
                    <textarea
                      value={draft.sustainability ?? ""}
                      onChange={(e) => setDraft((d) => ({ ...d, sustainability: e.target.value }))}
                      rows={4}
                      className="w-full rounded-2xl border border-hairline bg-white/80 px-4 py-3 text-sm normal-case tracking-normal text-text"
                      placeholder="Packaging, sourcing, cruelty-free, etc."
                    />
                  </label>
                </div>
              </div>

              <label className="space-y-2 text-[0.65rem] uppercase tracking-[0.22em] text-muted">
                Highlights (one per line)
                <textarea
                  value={draft.highlightsText}
                  onChange={(e) => setDraft((d) => ({ ...d, highlightsText: e.target.value }))}
                  rows={4}
                  className="w-full rounded-2xl border border-hairline bg-white/80 px-4 py-3 text-sm normal-case tracking-normal text-text"
                  placeholder="Lightweight & non-greasy&#10;Deep hydration"
                />
              </label>
              <label className="flex items-center gap-3 rounded-2xl border border-hairline bg-white/70 px-4 py-3 text-sm text-muted">
                <input
                  type="checkbox"
                  checked={Boolean(draft.featured)}
                  onChange={(e) => setDraft((d) => ({ ...d, featured: e.target.checked }))}
                />
                Featured
              </label>

              <div className="rounded-3xl border border-hairline bg-white/70 p-4">
                <p className="text-[0.65rem] uppercase tracking-[0.32em] text-muted">
                  Category
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {categories.map((category) => {
                    const selected = Boolean(draft.categories?.includes(category.id));
                    return (
                      <button
                        key={category.id}
                        type="button"
                        className={
                          selected
                            ? "rounded-full bg-[#2d2d2d] px-4 py-2 text-xs uppercase tracking-[0.14em] text-white"
                            : "rounded-full border border-hairline bg-white px-4 py-2 text-xs uppercase tracking-[0.14em] text-muted transition hover:border-text/30 hover:text-text"
                        }
                        onClick={() =>
                          setDraft((d) => {
                            const current = d.categories ?? [];
                            return {
                              ...d,
                              categories: selected
                                ? current.filter((id) => id !== category.id)
                                : [...current, category.id],
                            };
                          })
                        }
                      >
                        {category.name}
                      </button>
                    );
                  })}
                  {categories.length === 0 ? (
                    <p className="text-sm text-muted">No categories found.</p>
                  ) : null}
                </div>
              </div>

              <div className="rounded-3xl border border-hairline bg-white/70 p-4">
                <p className="text-[0.65rem] uppercase tracking-[0.32em] text-muted">Images</p>
                <div className="mt-3">
                  <CloudinaryMultiUpload
                    value={draft.gallery ?? []}
                    onChange={(gallery) => setDraft((d) => ({ ...d, gallery }))}
                    disabled={busy}
                  />
                </div>
              </div>

              <div className="rounded-3xl border border-hairline bg-white/70 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-[0.65rem] uppercase tracking-[0.32em] text-muted">
                      ML / Price variants
                    </p>
                    <p className="mt-1 text-xs text-muted">
                      Add sizes like 100 ml, 200 ml, 300 ml with separate prices.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() =>
                      setDraft((d) => ({
                        ...d,
                        variants: [
                          ...(d.variants ?? []),
                          {
                            sku: `SKU-${(d.variants?.length ?? 0) + 1}`,
                            label: "",
                            size: "",
                            priceUSD: 0,
                            inventory: 25,
                          },
                        ],
                      }))
                    }
                  >
                    Add variant
                  </Button>
                </div>
                <div className="mt-4 grid gap-4">
                  {(draft.variants?.length ? draft.variants : (emptyDraft().variants ?? [])).map(
                    (variant, idx) => (
                      <div
                        key={`${variant.sku}-${idx}`}
                        className="rounded-2xl border border-hairline bg-white/75 p-3"
                      >
                        <div className="mb-3 flex items-center justify-between gap-3">
                          <p className="text-[0.62rem] uppercase tracking-[0.22em] text-muted">
                            Variant {String(idx + 1).padStart(2, "0")}
                          </p>
                          {(draft.variants?.length ?? 0) > 1 ? (
                            <button
                              type="button"
                              className="text-xs uppercase tracking-[0.18em] text-red-600"
                              onClick={() =>
                                setDraft((d) => ({
                                  ...d,
                                  variants: (d.variants ?? []).filter((_, i) => i !== idx),
                                }))
                              }
                            >
                              Remove
                            </button>
                          ) : null}
                        </div>
                        <div className="grid gap-3 md:grid-cols-4">
                          <Input
                            value={variant.size ?? variant.label ?? ""}
                            onChange={(e) =>
                              setDraft((d) => ({
                                ...d,
                                variants: (d.variants ?? []).map((v, i) =>
                                  i === idx
                                    ? { ...v, size: e.target.value, label: e.target.value }
                                    : v
                                ),
                              }))
                            }
                            placeholder="ML e.g. 10ml, 50ml, 100ml"
                          />
                          <Input
                            value={variant.sku ?? ""}
                            onChange={(e) =>
                              setDraft((d) => ({
                                ...d,
                                variants: (d.variants ?? []).map((v, i) =>
                                  i === idx ? { ...v, sku: e.target.value } : v
                                ),
                              }))
                            }
                            placeholder="SKU"
                          />
                          <Input
                            value={String(variant.priceUSD ?? 0)}
                            onChange={(e) =>
                              setDraft((d) => ({
                                ...d,
                                variants: (d.variants ?? []).map((v, i) =>
                                  i === idx ? { ...v, priceUSD: Number(e.target.value || 0) } : v
                                ),
                              }))
                            }
                            placeholder="Price USD"
                            inputMode="decimal"
                          />
                          <Input
                            value={String(variant.inventory ?? 0)}
                            onChange={(e) =>
                              setDraft((d) => ({
                                ...d,
                                variants: (d.variants ?? []).map((v, i) =>
                                  i === idx ? { ...v, inventory: Number(e.target.value || 0) } : v
                                ),
                              }))
                            }
                            placeholder="Stock"
                            inputMode="numeric"
                          />
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {saveError ? (
                <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                  {saveError}
                </p>
              ) : null}
              <div className="flex flex-wrap justify-end gap-3">
                <Button variant="secondary" onClick={() => setOpen(false)} disabled={busy}>
                  Cancel
                </Button>
                <Button
                  onClick={async () => {
                    setBusy(true);
                    setSaveError(null);
                    try {
                      if (!draft.title.trim() || !draft.slug.trim()) {
                        setSaveError("Title aur slug dono zaroori hain.");
                        return;
                      }
                      const highlights = draft.highlightsText
                        .split("\n")
                        .map((s) => s.trim())
                        .filter(Boolean);
                      const gallery = (draft.gallery ?? [])
                        .filter((g) => g.publicId?.trim())
                        .map((g) => ({
                          publicId: g.publicId.trim(),
                          alt: g.alt?.trim() || undefined,
                        }));
                      const variants = (draft.variants?.length
                        ? draft.variants
                        : (emptyDraft().variants ?? [])
                      )
                        .map((variant, idx) => {
                          const size = (variant.size ?? variant.label ?? "").trim();
                          const price = Number(variant.priceUSD ?? 0);
                          const stock = Number(variant.inventory ?? 0);
                          const fallbackSku = `${draft.slug.trim() || "SKU"}-${idx + 1}`
                            .toUpperCase()
                            .replace(/[^A-Z0-9]+/g, "-")
                            .replace(/^-|-$/g, "");
                          return {
                            sku: (variant.sku ?? "").trim() || fallbackSku,
                            label: size || undefined,
                            size: size || undefined,
                            priceUSD: Number.isFinite(price) && price >= 0 ? price : 0,
                            inventory:
                              Number.isFinite(stock) && stock >= 0 ? Math.floor(stock) : 0,
                          };
                        })
                        .filter((variant) => variant.sku && variant.priceUSD >= 0);
                      if (variants.length === 0) {
                        setSaveError("Kam az kam ek variant (ML + price) add karein.");
                        return;
                      }
                      if (variants.some((v) => !v.size)) {
                        setSaveError("Har variant ke liye ML size likhein (jaise 10ml, 50ml, 100ml).");
                        return;
                      }
                      if (variants.some((v) => (v.inventory ?? 0) <= 0)) {
                        setSaveError(
                          "Har variant ka Stock kam az kam 1 hona chahiye — warna Add to basket kaam nahi karega."
                        );
                        return;
                      }
                      const payload = {
                        title: draft.title.trim(),
                        slug: draft.slug.trim(),
                        featured: Boolean(draft.featured),
                        descriptionShort: draft.descriptionShort?.trim() ?? "",
                        richDescription: draft.richDescription?.trim() ?? "",
                        ingredients: draft.ingredients?.trim() ?? "",
                        howToUse: draft.howToUse?.trim() ?? "",
                        benefits: draft.benefits?.trim() ?? "",
                        sustainability: draft.sustainability?.trim() ?? "",
                        highlights,
                        gallery,
                        categories: draft.categories ?? [],
                        variants,
                      };

                      type ErrBody = { error?: { message?: string; code?: string } };
                      const readErr = async (res: Response): Promise<string> => {
                        try {
                          const b = (await res.json()) as ErrBody;
                          const msg = b.error?.message;
                          if (typeof msg === "string" && msg.length) return msg;
                        } catch {
                          /* ignore */
                        }
                        return res.statusText || `Request failed (${res.status})`;
                      };

                      if (mode === "create") {
                        const res = await apiFetch("/admin/products", {
                          method: "POST",
                          json: payload,
                        });
                        if (!res.ok) {
                          setSaveError(await readErr(res));
                          return;
                        }
                        const body = (await res.json()) as { data?: AdminProduct };
                        const created = body.data;
                        if (!created) {
                          setSaveError("Server ne product return nahi kiya.");
                          return;
                        }
                        setItems((x) => [created, ...x]);
                      } else {
                        const res = await apiFetch(`/admin/products/${draft.id}`, {
                          method: "PATCH",
                          json: payload,
                        });
                        if (!res.ok) {
                          setSaveError(await readErr(res));
                          return;
                        }
                        const body = (await res.json()) as { data?: AdminProduct };
                        const updated = body.data;
                        if (!updated) {
                          setSaveError("Server ne updated product return nahi kiya.");
                          return;
                        }
                        setItems((x) => x.map((i) => (i.id === draft.id ? updated : i)));
                      }
                      setOpen(false);
                    } finally {
                      setBusy(false);
                    }
                  }}
                  disabled={busy}
                >
                  {busy ? "Saving…" : "Save"}
                </Button>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </main>
  );
}
