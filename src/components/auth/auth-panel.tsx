"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "./auth-provider";

type Mode = "signin" | "signup" | "reset";

export function AuthPanel() {
  const searchParams = useSearchParams();
  const requestedMode = searchParams.get("mode");
  const requestedReturnTo = searchParams.get("returnTo");
  const returnTo =
    requestedReturnTo?.startsWith("/share/") === true
      ? requestedReturnTo
      : "/account";
  const [mode, setMode] = useState<Mode>(
    requestedMode === "signup" || requestedMode === "reset"
      ? requestedMode
      : "signin",
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const {
    user,
    account,
    loading,
    error,
    clearError,
    register,
    signIn,
    signInWithGoogle,
    sendPasswordReset,
  } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && account) {
      router.replace(returnTo);
    }
  }, [account, returnTo, router, user]);

  function changeMode(nextMode: Mode) {
    setMode(nextMode);
    setNotice(null);
    clearError();
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setNotice(null);
    try {
      if (mode === "signup") {
        await register(email, password);
        setNotice(
          "Account created. We sent a verification link to your email.",
        );
      } else if (mode === "reset") {
        await sendPasswordReset(email);
        setNotice(
          "If an account uses that email, a password reset link is on its way.",
        );
      } else {
        await signIn(email, password);
      }
    } catch {
      // The provider exposes a safe, user-facing error.
    } finally {
      setSubmitting(false);
    }
  }

  async function googleSignIn() {
    setSubmitting(true);
    setNotice(null);
    try {
      await signInWithGoogle();
    } catch {
      // The provider exposes a safe, user-facing error.
    } finally {
      setSubmitting(false);
    }
  }

  const title =
    mode === "signup"
      ? "Create your learning space"
      : mode === "reset"
        ? "Reset your password"
        : "Welcome back";
  const description =
    mode === "signup"
      ? "Start with just your account. Your learning details come later."
      : mode === "reset"
        ? "Enter your email and we’ll send a secure reset link."
        : "Continue to your private Beaver AI account.";

  return (
    <main className="auth-shell">
      <section className="auth-aside" aria-label="About Beaver AI">
        <Link className="brand brand-light" href="/">
          <span className="brand-mark brand-mark-light" aria-hidden="true">
            B
          </span>
          <span>Beaver AI</span>
        </Link>
        <div>
          <p className="eyebrow eyebrow-light">A calmer way to learn</p>
          <h1>Your path. Your pace. Your progress.</h1>
          <p>
            A private learning space that will grow around your knowledge and
            goals—not a one-size-fits-all classroom.
          </p>
        </div>
        <p className="aside-footnote">
          Private by default · Sharing stays in your control
        </p>
      </section>

      <section className="auth-main">
        <div className="auth-card">
          <Link className="auth-mobile-brand brand" href="/">
            <span className="brand-mark" aria-hidden="true">
              B
            </span>
            <span>Beaver AI</span>
          </Link>
          <div className="auth-heading">
            <p className="eyebrow">
              {mode === "signup"
                ? "Your account"
                : mode === "reset"
                  ? "Account recovery"
                  : "Your learning space"}
            </p>
            <h2>{title}</h2>
            <p>{description}</p>
          </div>

          {mode !== "reset" && (
            <>
              <button
                className="button button-google"
                type="button"
                disabled={submitting || loading}
                onClick={() => void googleSignIn()}
              >
                <span aria-hidden="true">G</span>
                Continue with Google
              </button>
              <div className="separator">
                <span>or use email</span>
              </div>
            </>
          )}

          <form className="auth-form" onSubmit={(event) => void submit(event)}>
            <label>
              Email
              <input
                autoComplete="email"
                inputMode="email"
                maxLength={320}
                name="email"
                onChange={(event) => setEmail(event.target.value)}
                required
                type="email"
                value={email}
              />
            </label>

            {mode !== "reset" && (
              <label>
                Password
                <input
                  autoComplete={
                    mode === "signup" ? "new-password" : "current-password"
                  }
                  minLength={8}
                  name="password"
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  type="password"
                  value={password}
                />
                {mode === "signup" && (
                  <span className="field-hint">At least 8 characters</span>
                )}
              </label>
            )}

            {error && (
              <div className="message message-error" role="alert">
                {error}
              </div>
            )}
            {notice && (
              <div className="message message-success" role="status">
                {notice}
              </div>
            )}

            <button
              className="button button-primary button-wide"
              disabled={submitting || loading}
              type="submit"
            >
              {submitting
                ? "Please wait…"
                : mode === "signup"
                  ? "Create account"
                  : mode === "reset"
                    ? "Send reset link"
                    : "Sign in"}
            </button>
          </form>

          <div className="auth-switch">
            {mode === "signin" && (
              <>
                <button type="button" onClick={() => changeMode("reset")}>
                  Forgot password?
                </button>
                <p>
                  New to Beaver AI?{" "}
                  <button type="button" onClick={() => changeMode("signup")}>
                    Create an account
                  </button>
                </p>
              </>
            )}
            {mode === "signup" && (
              <p>
                Already have an account?{" "}
                <button type="button" onClick={() => changeMode("signin")}>
                  Sign in
                </button>
              </p>
            )}
            {mode === "reset" && (
              <button type="button" onClick={() => changeMode("signin")}>
                Back to sign in
              </button>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
