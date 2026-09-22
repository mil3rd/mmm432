"use client";

import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  // Set by the middleware when it bounced you here from a deeper page.
  const callbackUrl = params.get("callbackUrl") ?? "/admin";

  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");

    const form = new FormData(event.currentTarget);
    const result = await signIn("credentials", {
      username: form.get("username"),
      password: form.get("password"),
      redirect: false,
    });

    if (result?.error) {
      // Deliberately vague: saying which half was wrong tells an attacker
      // whether the username is real.
      setError("That username and password don't match.");
      setBusy(false);
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="w-full max-w-sm">
      <h1 className="font-display text-3xl uppercase leading-none text-ink">
        Admin<span className="text-red">.</span>
      </h1>
      <p className="mt-2 font-body text-sm text-muted">Sign in to edit the site.</p>

      <div className="mt-8 space-y-4">
        <label className="block">
          <span className="font-body text-xs tracking-wide text-muted">Username</span>
          <input
            name="username"
            type="text"
            required
            autoComplete="username"
            className="mt-1.5 w-full rounded-sm border border-line bg-card px-3 py-2 font-body text-sm text-ink outline-none transition-colors focus:border-ink"
          />
        </label>

        <label className="block">
          <span className="font-body text-xs tracking-wide text-muted">Password</span>
          <input
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="mt-1.5 w-full rounded-sm border border-line bg-card px-3 py-2 font-body text-sm text-ink outline-none transition-colors focus:border-ink"
          />
        </label>

        {error && (
          <p className="rounded-sm border border-red/40 bg-red/5 px-3 py-2 font-body text-sm text-red">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-sm bg-ink px-4 py-2.5 font-body text-sm text-paper transition-opacity hover:opacity-85 disabled:opacity-50"
        >
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </div>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-6">
      {/* useSearchParams needs a Suspense boundary or the build fails
          prerendering this page. */}
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
