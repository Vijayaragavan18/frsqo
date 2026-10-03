"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  supabase,
  isSupabaseConfigured,
} from "@/lib/supabaseClient";

export default function SignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Where the user should return after authentication
  const nextParam = searchParams.get("next");

  const next =
    nextParam &&
    nextParam.startsWith("/") &&
    !nextParam.startsWith("//")
      ? nextParam
      : "/";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // NEW: Check whether the user is already logged in
  const [checkingUser, setCheckingUser] = useState(true);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  /*
   * ---------------------------------------------------------
   * CHECK IF USER IS ALREADY LOGGED IN
   * ---------------------------------------------------------
   */
  useEffect(() => {
    const checkUser = async () => {
      if (!isSupabaseConfigured || !supabase) {
        setCheckingUser(false);
        return;
      }

      const client = supabase;

      const {
        data: { user },
      } = await client.auth.getUser();

      if (user) {
        // User is already logged in.
        // Do not allow them to stay on signup page.
        window.location.replace(next);
        return;
      }

      setCheckingUser(false);
    };

    checkUser();
  }, [next]);

  /*
   * ---------------------------------------------------------
   * EMAIL SIGNUP
   * ---------------------------------------------------------
   */
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError(null);
    setSuccess(false);

    if (!isSupabaseConfigured || !supabase) {
      setError(
        "Signup isn't connected yet — add your Supabase project keys."
      );
      return;
    }

    // Name validation
    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }

    // Email validation
    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }

    // Password validation
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    // Confirm password validation
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    const client = supabase;

    const redirectUrl =
      `${window.location.origin}/auth/callback?next=${encodeURIComponent(
        next
      )}`;

    const { data, error: signupError } =
      await client.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: name.trim(),
          },

          /*
           * Supabase will send the confirmation email.
           *
           * After the user confirms their email,
           * they will return to:
           *
           * /auth/callback?next=/original-page
           */
          emailRedirectTo: redirectUrl,
        },
      });

    setLoading(false);

    if (signupError) {
      console.error("Signup error:", signupError);
      setError(signupError.message);
      return;
    }

    /*
     * If email confirmation is disabled,
     * Supabase creates a session immediately.
     */
    if (data.session) {
      window.location.replace(next);
      return;
    }

    /*
     * If email confirmation is enabled,
     * Supabase sends the confirmation email.
     */
    setSuccess(true);
  };

  /*
   * ---------------------------------------------------------
   * GOOGLE SIGNUP / LOGIN
   * ---------------------------------------------------------
   */
  const onGoogle = async () => {
    if (!isSupabaseConfigured || !supabase) {
      setError(
        "Signup isn't connected yet — add your Supabase project keys."
      );
      return;
    }

    setError(null);
    setGoogleLoading(true);

    const client = supabase;

    const redirectUrl =
      `${window.location.origin}/auth/callback?next=${encodeURIComponent(
        next
      )}`;

    const { error: googleError } =
      await client.auth.signInWithOAuth({
        provider: "google",

        options: {
          redirectTo: redirectUrl,
        },
      });

    if (googleError) {
      console.error(
        "Google signup error:",
        googleError
      );

      setGoogleLoading(false);
      setError(googleError.message);
    }
  };

  /*
   * ---------------------------------------------------------
   * WHILE CHECKING AUTHENTICATION
   * ---------------------------------------------------------
   *
   * This prevents the signup form from briefly appearing
   * before we know whether the user is already logged in.
   */
  if (checkingUser) {
    return (
      <section className="flex min-h-[70vh] items-center justify-center bg-cream">
        <Loader2
          className="animate-spin text-green-700"
          size={24}
        />
      </section>
    );
  }

  return (
    <section className="flex min-h-[70vh] items-center bg-cream py-16">
      <div className="container-froska">
        <div className="mx-auto w-full max-w-sm card-surface p-8">

          {/* Header */}
          <div className="text-center">
            <span className="font-display text-xl font-bold text-ink">
              frsqo
            </span>

            <h1 className="mt-3 font-display text-2xl font-bold tracking-tight text-ink">
              Create your account
            </h1>

            <p className="mt-1.5 text-sm text-ink/55">
              Create an account to manage your bookings.
            </p>
          </div>

          {/* Signup form */}
          <form
            onSubmit={onSubmit}
            className="mt-8 flex flex-col gap-4"
          >

            {/* Name */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink/80">
                Name
              </label>

              <input
                type="text"
                required
                autoComplete="name"
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
                placeholder="Your name"
                className="w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none transition-colors placeholder:text-ink/30 focus:border-green-500"
              />
            </div>

            {/* Email */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink/80">
                Email
              </label>

              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                placeholder="you@example.com"
                className="w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none transition-colors placeholder:text-ink/30 focus:border-green-500"
              />
            </div>

            {/* Password */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink/80">
                Password
              </label>

              <input
                type="password"
                required
                minLength={6}
                autoComplete="new-password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                placeholder="At least 6 characters"
                className="w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none transition-colors placeholder:text-ink/30 focus:border-green-500"
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink/80">
                Confirm Password
              </label>

              <input
                type="password"
                required
                minLength={6}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(e.target.value)
                }
                placeholder="Enter your password again"
                className="w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none transition-colors placeholder:text-ink/30 focus:border-green-500"
              />

              {/* Password match indicator */}
              {confirmPassword.length > 0 &&
                password !== confirmPassword && (
                  <p className="mt-1.5 text-xs text-red-500">
                    Passwords do not match.
                  </p>
                )}

              {confirmPassword.length > 0 &&
                password === confirmPassword && (
                  <p className="mt-1.5 text-xs text-green-600">
                    Passwords match.
                  </p>
                )}
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-xl bg-red-50 px-4 py-3">
                <p className="text-sm leading-5 text-red-600">
                  {error}
                </p>
              </div>
            )}

            {/* Success */}
            {success && (
              <div className="rounded-xl bg-green-50 px-4 py-3">
                <p className="text-sm leading-5 text-green-700">
                  Account created successfully.
                  <br />
                  <br />
                  We&rsquo;ve sent a confirmation email to{" "}
                  <strong>{email}</strong>.
                  <br />
                  <br />
                  Please check your inbox and click the
                  confirmation link to activate your account.
                </p>
              </div>
            )}

            {/* Create account */}
            <button
              type="submit"
              disabled={
                loading ||
                googleLoading ||
                password !== confirmPassword
              }
              className="btn-primary mt-2 flex w-full items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2
                    className="animate-spin"
                    size={16}
                  />
                  Creating account...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <span className="h-px flex-1 bg-line" />

            <span className="text-xs text-ink/40">
              or
            </span>

            <span className="h-px flex-1 bg-line" />
          </div>

          {/* Google */}
          <button
            type="button"
            onClick={onGoogle}
            disabled={loading || googleLoading}
            className="btn-secondary flex w-full items-center justify-center gap-2"
          >
            {googleLoading ? (
              <>
                <Loader2
                  className="animate-spin"
                  size={16}
                />
                Connecting...
              </>
            ) : (
              "Continue with Google"
            )}
          </button>

          {/* Login */}
          <p className="mt-6 text-center text-sm text-ink/55">
            Already have an account?{" "}

            <Link
              href={`/login?next=${encodeURIComponent(next)}`}
              className="font-medium text-green-700 hover:underline"
            >
              Login
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}