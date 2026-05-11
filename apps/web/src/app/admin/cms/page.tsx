"use client";

export default function AdminCmsPlaceholder() {
  return (
    <main className="space-y-6 py-12 text-sm text-muted">
      <h1 className="font-display text-3xl text-text">CMS & homepage sections</h1>
      <p>
        Wire the PUT <code>/admin/cms/pages/:slug</code> editor here. Homepage blocks are
        served from Settings via <code>/cms/home</code> on the public API.
      </p>
    </main>
  );
}
