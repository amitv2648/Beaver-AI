"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";

export function InvitationAcceptance({ token }: { token: string }) {
  const { user, account, loading, apiRequest } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const returnTo = `/share/${encodeURIComponent(token)}`;

  async function accept() {
    if (!user) return;
    setSubmitting(true);
    setError(null);
    try {
      await user.reload();
      await user.getIdToken(true);
      const response = await apiRequest("/api/sharing/invitations/accept", {
        method: "POST",
        body: JSON.stringify({ token }),
      });
      const payload = (await response.json()) as {
        error?: { message?: string };
      };
      if (!response.ok) {
        throw new Error(
          payload.error?.message ?? "The invitation could not be accepted.",
        );
      }
      router.replace("/account#sharing");
    } catch (acceptError) {
      setError(
        acceptError instanceof Error
          ? acceptError.message
          : "The invitation could not be accepted.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="centered-page">
      <section className="accept-card">
        <Link className="brand" href="/">
          <span className="brand-mark" aria-hidden="true">
            B
          </span>
          <span>Beaver AI</span>
        </Link>
        <div className="accept-icon" aria-hidden="true">
          ↗
        </div>
        <p className="eyebrow">Private sharing invitation</p>
        <h1>Someone invited you to connect.</h1>
        <p>
          Signing in does not grant blanket access. You will receive only the
          learning permissions the student selected, and the student can revoke
          them at any time.
        </p>

        {error && (
          <div className="message message-error" role="alert">
            {error}
          </div>
        )}

        {loading ? (
          <p className="subtle-status">Checking your account…</p>
        ) : user && account ? (
          <div className="accept-actions">
            <p className="signed-in-note">
              Signed in as <strong>{account.email}</strong>
            </p>
            <button
              className="button button-primary button-wide"
              disabled={submitting}
              type="button"
              onClick={() => void accept()}
            >
              {submitting ? "Accepting…" : "Review and accept connection"}
            </button>
            <p className="field-hint">
              The signed-in email must match the invitation and be verified.
            </p>
          </div>
        ) : (
          <div className="accept-actions">
            <Link
              className="button button-primary button-wide"
              href={`/auth?mode=signin&returnTo=${encodeURIComponent(returnTo)}`}
            >
              Sign in to accept
            </Link>
            <p className="field-hint">
              New to Beaver AI? You can create an account using the invited
              email.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
