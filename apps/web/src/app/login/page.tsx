"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  return (
    <main className="mx-auto max-w-md px-5 pb-28 pt-14 md:px-10">
      <p className="text-[0.65rem] uppercase tracking-[0.34em] text-muted">
        Account
      </p>
      <h1 className="mt-4 font-display text-4xl leading-tight text-text">
        Sign in.
      </h1>
      <p className="mt-4 text-sm text-muted">
        Keep your cart and wishlist synced across devices.
      </p>

      <form
        className="mt-10 grid gap-3"
        onSubmit={async (e) => {
          e.preventDefault();
          setError(null);
          setLoading(true);
          try {
            const supabase = getSupabaseBrowserClient();
            const { error } = await supabase.auth.signInWithPassword({
              email,
              password,
            });
            if (error) throw error;
            router.push("/products");
          } catch (e: unknown) {
            setError(e instanceof Error ? e.message : "Login failed");
          } finally {
            setLoading(false);
          }
        }}
      >
        <Input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@domain.com"
          type="email"
          required
        />
        <Input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          type="password"
          required
        />
        {error ? (
          <p className="mt-2 rounded-2xl border border-hairline bg-white/70 px-4 py-3 text-sm text-text">
            {error}
          </p>
        ) : null}
        <Button type="submit" disabled={loading}>
          {loading ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      <p className="mt-6 text-sm text-muted">
        New here?{" "}
        <Link href="/register" className="text-text underline">
          Create an account
        </Link>
        .
      </p>
    </main>
  );
}

