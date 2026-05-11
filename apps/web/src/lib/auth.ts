"use client";

const ACCESS = "syntraa_access_token";
const ADMIN_FLAG = "syntraa_is_admin";

export function getStoredAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACCESS);
}

export function setSession(accessToken: string, isAdmin?: boolean): void {
  localStorage.setItem(ACCESS, accessToken);
  if (isAdmin) localStorage.setItem(ADMIN_FLAG, "1");
  else localStorage.removeItem(ADMIN_FLAG);
}

export function clearSession(): void {
  localStorage.removeItem(ACCESS);
  localStorage.removeItem(ADMIN_FLAG);
}

export function isLikelyAdminSession(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(ADMIN_FLAG) === "1";
}
