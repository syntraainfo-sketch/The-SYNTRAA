import { notFound } from "next/navigation";
import { apiGet } from "@/lib/api";

const allowed = ["privacy", "terms", "shipping", "returns", "refunds"];

export default async function PolicyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!allowed.includes(slug)) notFound();

  let page: { title?: string; body?: string } | null = null;
  try {
    const res = await apiGet<{ data: { title?: string; body?: string } }>(
      `/cms/pages/${slug}`,
      { cache: "no-store" }
    );
    page = res.data ?? null;
  } catch {
    page = null;
  }

  if (page) {
    return (
      <article className="mx-auto max-w-3xl px-5 pb-28 pt-20 md:px-10">
        <h1 className="font-display text-4xl">
          {page.title ?? slug.toUpperCase()}
        </h1>
        <div
          className="prose prose-invert prose-sm mt-10 max-w-none text-muted"
          dangerouslySetInnerHTML={{
            __html:
              page.body ??
              "<p>This policy page is editable from the CMS.</p>",
          }}
        />
      </article>
    );
  }

  return (
    <article className="mx-auto max-w-3xl px-5 pb-28 pt-20 md:px-10">
      <h1 className="font-display text-4xl">{slug}</h1>
      <p className="mt-8 text-muted">
        Policy content pending CMS publish. Administrators can hydrate this route
        from the admin panel (&ldquo;Page CMS Management&rdquo;).
      </p>
    </article>
  );
}
