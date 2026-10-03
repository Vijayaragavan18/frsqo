"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";

export default function LoginPage() {
  const searchParams = useSearchParams();

  const nextParam = searchParams.get("next");

  const next =
    nextParam &&
    nextParam.startsWith("/") &&
    !nextParam.startsWith("//")
      ? nextParam
      : "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(true);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState<string | null>(null);

  // Check if already logged in
  useEffect(() => {
    const checkUser = async () => {
      if (!isSupabaseConfigured || !supabase) {
        setLoading(false);
        return;
      }

      const client = supabase;

      const {
        data: { user },
      } = await client.auth.getUser();

      if (user) {
        // Already logged in → don't allow login page
        window.location.replace(next);
        return;
      }

      setLoading(false);
    };

    checkUser();
  }, [next]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError(null);

    if (!isSupabaseConfigured || !supabase) {
      setError("Login isn't connected yet — check your Supabase keys.");
      return;
    }

    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);

    const client = supabase;

   const { data, error: signInError } =
  await client.auth.signInWithPassword({
    email: email.trim(),
    password,
  });

  if (signInError) {
  setLoading(false);
  setError(signInError.message);
  return;
}

if (!data.session) {
  setLoading(false);
  setError("Login succeeded, but no active session was created. Please try again.");
  return;
}

window.location.replace(next);

    // Force full reload so navbar/session updates correctly
    window.location.replace(next);
  };

  const onGoogle = async () => {
    if (!isSupabaseConfigured || !supabase) {
      setError("Login isn't connected yet — check your Supabase keys.");
      return;
    }

    setError(null);
    setGoogleLoading(true);

    const redirectTo =
      `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;

    const { error: googleError } =
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
        },
      });

    if (googleError) {
      setGoogleLoading(false);
      setError(googleError.message);
    }
  };

  // While checking session
  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white">
        <Loader2 className="animate-spin text-green-700" size={24} />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto flex min-h-screen max-w-md items-center px-6 py-16">
        <div className="w-full">

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-ink">
              Welcome back
            </h1>

            <p className="mt-2 text-sm text-ink/60">
              Login to continue to frsqo.
            </p>
          </div>

          {error && (
            <div className="mb-5 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-5">

            <div>
              <label className="mb-2 block text-sm font-medium text-ink">
                Email
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-line px-4 py-3 outline-none transition focus:border-green-600"
              />
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-sm font-medium text-ink">
                  Password
                </label>

                <Link
                  href="/forgot-password"
                  className="text-xs font-medium text-green-700 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full rounded-xl border border-line px-4 py-3 pr-12 outline-none transition focus:border-green-600"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword((value) => !value)
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink/50"
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex w-full items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </button>

          </form>

          <div className="my-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-line" />
            <span className="text-xs text-ink/40">
              OR
            </span>
            <div className="h-px flex-1 bg-line" />
          </div>

          <button
            type="button"
            onClick={onGoogle}
            disabled={googleLoading}
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-line px-4 py-3 text-sm font-medium text-ink transition hover:bg-gray-50"
          >
            {googleLoading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <span className="text-base font-bold">G</span>
                Continue with Google
              </>
            )}
          </button>

          <p className="mt-8 text-center text-sm text-ink/60">
            Don't have an account?{" "}
            <Link
              href={`/signup?next=${encodeURIComponent(next)}`}
              className="font-medium text-green-700 hover:underline"
            >
              Sign up
            </Link>
          </p>

        </div>
      </div>
    </main>
  );
}