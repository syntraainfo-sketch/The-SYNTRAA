"use client";

import { API_PREFIX } from "./env";
import { getStoredAccessToken } from "./auth";

function apiUrl(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${API_PREFIX}${p}`;
}

export async function apiGetClient(path: string): Promise<Response> {
  const token = getStoredAccessToken();
  const headers = new Headers();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  return fetch(apiUrl(path), { headers, cache: "no-store" });
}

export async function apiFetch(
  path: string,
  init: RequestInit & { json?: unknown } = {}
): Promise<Response> {
  const token = getStoredAccessToken();
  const headers = new Headers(init.headers);
  if (init.json !== undefined) {
    headers.set("Content-Type", "application/json");
  }
  if (token) headers.set("Authorization", `Bearer ${token}`);
  return fetch(apiUrl(path), {
    ...init,
    headers,
    body: init.json !== undefined ? JSON.stringify(init.json) : init.body,
  });
}
