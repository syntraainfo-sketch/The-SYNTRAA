"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/client-http";
import { setSession } from "@/lib/auth";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@thesyntraa.com");
  /** Must match `SEED_ADMIN_PASSWORD` in apps/web/.env.local (do not ship a wrong default). */
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  return (
    <main className="mx-auto max-w-md space-y-8 py-16">
      <div>
        <p className="text-[0.62rem] uppercase tracking-[0.35em] text-muted">
          Command
        </p>
        <h1 className="font-display mt-4 text-3xl text-text">Authenticate</h1>
      </div>
      <form
        className="space-y-4"
        onSubmit={async (e) => {
          e.preventDefault();
          setError(null);
          const res = await apiFetch("/auth/login", {
            method: "POST",
            json: { email, password },
          });
          let body: {
            data?: { accessToken?: string; user?: { role?: string } };
            error?: { message?: string };
          } = {};
          try {
            body = (await res.json()) as typeof body;
          } catch {
            setError("Bad response from server. Check dev terminal for errors.");
            return;
          }
          if (!res.ok || !body.data?.accessToken) {
            setError(
              body.error?.message ??
                (res.status === 500
                  ? "Server error (often MongoDB connection). Check terminal logs."
                  : "Invalid credentials")
            );
            return;
          }
          const role = body.data.user?.role ?? "customer";
          setSession(body.data.accessToken, role !== "customer");
          router.push("/admin/dashboard");
        }}
      >
        <label className="block text-sm text-muted">
          Email
          <input
            className="mt-2 w-full rounded-2xl border border-white/20 bg-white/8 px-4 py-3 text-[#f4f4f8] shadow-inner shadow-black/20 outline-none ring-0 placeholder:text-zinc-500 focus:border-white/40 focus:bg-white/12"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </label>
        <label className="block text-sm text-muted">
          Password
          <input
            type="password"
            className="mt-2 w-full rounded-2xl border border-white/20 bg-white/8 px-4 py-3 text-[#f4f4f8] shadow-inner shadow-black/20 outline-none ring-0 placeholder:text-zinc-500 focus:border-white/40 focus:bg-white/12"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="SEED_ADMIN_PASSWORD from .env.local"
            autoComplete="current-password"
          />
        </label>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button
          type="submit"
          className="w-full rounded-full border border-white/25 bg-[#f4f4f8] py-3 text-[0.7rem] font-medium uppercase tracking-[0.28em] text-[#0b0b0f] shadow-sm transition hover:bg-white"
        >
          Unlock console
        </button>
      </form>
      <p className="text-xs text-muted">
        First time: add{" "}
        <code className="text-[0.65rem] text-text/80">MONGODB_URI</code> and{" "}
        <code className="text-[0.65rem] text-text/80">SEED_ADMIN_PASSWORD</code> to{" "}
        <code className="text-[0.65rem] text-text/80">apps/web/.env.local</code>, then run{" "}
        <code className="text-[0.65rem] text-text/80">npm run seed-admin -w web</code> (same as{" "}
        <code className="text-[0.65rem] text-text/80">seed:admin</code>). Log in with
        that exact password (not a sample password). Default email{" "}
        <code className="text-[0.65rem] text-text/80">admin@thesyntraa.com</code> unless you
        changed <code className="text-[0.65rem] text-text/80">SEED_ADMIN_EMAIL</code>.
      </p>
    </main>
  );
}
