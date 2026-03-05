"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

export default function AdminLoginPage() {
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const login = async () => {
    setError(null);
    const { error: loginError } = await supabase.auth.signInWithPassword({ email, password });
    if (loginError) {
      setError(loginError.message);
      return;
    }

    router.push("/admin/dashboard");
    router.refresh();
  };

  return (
    <section className="section-shell max-w-md">
      <div className="card space-y-4">
        <h1 className="text-3xl font-bold">Admin Login</h1>
        <input
          className="w-full rounded-lg border border-white/20 bg-black px-3 py-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
        />
        <input
          type="password"
          className="w-full rounded-lg border border-white/20 bg-black px-3 py-2"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
        />
        <button onClick={login} className="w-full rounded-lg bg-brand-blue px-4 py-2 font-semibold">
          Sign in
        </button>
        {error && <p className="text-sm text-red-400">{error}</p>}
      </div>
    </section>
  );
}
