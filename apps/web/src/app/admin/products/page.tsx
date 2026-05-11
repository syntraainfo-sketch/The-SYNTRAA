"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/client-http";
import * as Dialog from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";

type AdminProduct = {
  id: string;
  title: string;
  slug: string;
  featured?: boolean;
  variants?: Array<{ sku: string; priceUSD: number; inventory: number }>;
};

function emptyDraft(): AdminProduct {
  return {
    id: "",
    title: "",
    slug: "",
    featured: false,
    variants: [{ sku: "SKU-001", priceUSD: 38, inventory: 25 }],
  };
}

export default function AdminProducts() {
  const [items, setItems] = useState<AdminProduct[]>([]);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<AdminProduct>(() => emptyDraft());
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void (async () => {
      const res = await apiFetch("/admin/products");
      const body = (await res.json()) as { data?: AdminProduct[] };
      setItems(body.data ?? []);
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
            Create, edit, and retire products. Images can be wired via Cloudinary signing in a later pass.
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
            <div>
              <p className="font-display text-2xl text-text">{p.title}</p>
              <p className="mt-1 text-[0.7rem] uppercase tracking-[0.28em] text-muted">
                {p.slug} {p.featured ? "· featured" : ""}
              </p>
              <p className="mt-2 text-sm text-muted">
                Variants: {p.variants?.length ?? 0}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="secondary"
                onClick={() => {
                  setMode("edit");
                  setDraft({
                    id: p.id,
                    title: p.title,
                    slug: p.slug,
                    featured: Boolean(p.featured),
                    variants:
                      p.variants?.length ? p.variants : [{ sku: "SKU-001", priceUSD: 38, inventory: 25 }],
                  });
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

      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
          <Dialog.Content className="fixed left-1/2 top-1/2 w-[min(680px,92vw)] -translate-x-1/2 -translate-y-1/2 rounded-[28px] border border-hairline bg-white/92 p-6 shadow-[0_30px_120px_rgba(0,0,0,0.22)]">
            <div className="flex items-start justify-between gap-6">
              <div>
                <Dialog.Title className="font-display text-2xl text-text">
                  {mode === "create" ? "Create product" : "Edit product"}
                </Dialog.Title>
                <Dialog.Description className="mt-1 text-sm text-muted">
                  Minimal fields for now — variants are required.
                </Dialog.Description>
              </div>
              <Dialog.Close className="rounded-full border border-hairline bg-white/70 p-2 text-text">
                <X className="h-5 w-5" />
              </Dialog.Close>
            </div>

            <div className="mt-6 grid gap-3">
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
              <label className="flex items-center gap-3 rounded-2xl border border-hairline bg-white/70 px-4 py-3 text-sm text-muted">
                <input
                  type="checkbox"
                  checked={Boolean(draft.featured)}
                  onChange={(e) => setDraft((d) => ({ ...d, featured: e.target.checked }))}
                />
                Featured
              </label>

              <div className="mt-2 rounded-3xl border border-hairline bg-white/70 p-4">
                <p className="text-[0.65rem] uppercase tracking-[0.32em] text-muted">
                  Variant 01
                </p>
                <div className="mt-3 grid gap-3 md:grid-cols-3">
                  <Input
                    value={draft.variants?.[0]?.sku ?? ""}
                    onChange={(e) =>
                      setDraft((d) => ({
                        ...d,
                        variants: [{ ...(d.variants?.[0] ?? { priceUSD: 0, inventory: 0 }), sku: e.target.value }],
                      }))
                    }
                    placeholder="SKU"
                  />
                  <Input
                    value={String(draft.variants?.[0]?.priceUSD ?? 0)}
                    onChange={(e) =>
                      setDraft((d) => ({
                        ...d,
                        variants: [{ ...(d.variants?.[0] ?? { sku: "", inventory: 0 }), priceUSD: Number(e.target.value || 0) }],
                      }))
                    }
                    placeholder="Price USD"
                    inputMode="decimal"
                  />
                  <Input
                    value={String(draft.variants?.[0]?.inventory ?? 0)}
                    onChange={(e) =>
                      setDraft((d) => ({
                        ...d,
                        variants: [{ ...(d.variants?.[0] ?? { sku: "", priceUSD: 0 }), inventory: Number(e.target.value || 0) }],
                      }))
                    }
                    placeholder="Inventory"
                    inputMode="numeric"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <Button variant="secondary" onClick={() => setOpen(false)} disabled={busy}>
                Cancel
              </Button>
              <Button
                onClick={async () => {
                  setBusy(true);
                  try {
                    if (!draft.title.trim() || !draft.slug.trim()) return;
                    const payload = {
                      title: draft.title,
                      slug: draft.slug,
                      featured: Boolean(draft.featured),
                      descriptionShort: "",
                      richDescription: "",
                      gallery: [],
                      categories: [],
                      variants: [
                        {
                          sku: draft.variants?.[0]?.sku ?? "SKU-001",
                          priceUSD: Number(draft.variants?.[0]?.priceUSD ?? 0),
                          inventory: Number(draft.variants?.[0]?.inventory ?? 0),
                        },
                      ],
                    };

                    if (mode === "create") {
                      const res = await apiFetch("/admin/products", { method: "POST", json: payload });
                      const body = (await res.json()) as { data?: AdminProduct };
                      const created = body.data;
                      if (created) setItems((x) => [created, ...x]);
                    } else {
                      const res = await apiFetch(`/admin/products/${draft.id}`, { method: "PATCH", json: payload });
                      const body = (await res.json()) as { data?: AdminProduct };
                      const updated = body.data;
                      if (updated) setItems((x) => x.map((i) => (i.id === draft.id ? updated : i)));
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
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </main>
  );
}
