"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/client-http";
import { setSession } from "@/lib/auth";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@thesyntraa.com");
  const [password, setPassword] = useState("Anu123");
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
          const body = (await res.json()) as {
            data?: { accessToken?: string; user?: { role?: string } };
          };
          if (!res.ok || !body.data?.accessToken) {
            setError("Invalid credentials");
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
            className="mt-2 w-full rounded-2xl border border-hairline bg-black/45 px-4 py-3 text-text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label className="block text-sm text-muted">
          Password
          <input
            type="password"
            className="mt-2 w-full rounded-2xl border border-hairline bg-black/45 px-4 py-3 text-text"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button
          type="submit"
          className="w-full rounded-full border border-hairline py-3 text-[0.7rem] uppercase tracking-[0.28em]"
        >
          Unlock console
        </button>
      </form>
      <p className="text-xs text-muted">
        Seed a super-admin via{" "}
        <code className="text-[0.65rem] text-text/70">npm run seed:admin -w web</code>
      </p>
    </main>
  );
}
