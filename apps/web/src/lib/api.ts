import { headers } from "next/headers";
import { API_PREFIX, SITE_URL } from "./env";

function normalizeApiPath(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${API_PREFIX}${p}`;
}

async function serverSideApiUrl(path: string): Promise<string> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto =
    h.get("x-forwarded-proto") ??
    (process.env.NODE_ENV === "production" ? "https" : "http");
  const base = (host ? `${proto}://${host}` : SITE_URL.replace(/\/$/, "")).replace(
    /\/$/,
    ""
  );
  return `${base}${normalizeApiPath(path)}`;
}

export async function apiGet<T>(
  path: string,
  init?: RequestInit & { next?: { revalidate?: number; tags?: string[] } }
): Promise<T> {
  const url = await serverSideApiUrl(path);
  const res = await fetch(url, {
    ...init,
    headers: { ...(init?.headers ?? {}), "Content-Type": "application/json" },
    cache: init?.cache ?? "no-store",
    next: init?.next,
  });
  if (!res.ok) {
    throw new Error(`GET ${path} failed: ${res.status}`);
  }
  return (await res.json()) as T;
}
