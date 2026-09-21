"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  permissionLabels,
  permissionsByRelationship,
  type PermissionScope,
  type RelationshipType,
  type SharingOverview,
} from "@/modules/identity-access/model";
import { useAuth } from "@/components/auth/auth-provider";

interface ApiErrorPayload {
  error?: { message?: string };
}

async function responseError(response: Response): Promise<string> {
  const payload = (await response.json().catch(() => ({}))) as ApiErrorPayload;
  return payload.error?.message ?? "The request could not be completed.";
}

export function AccountDashboard() {
  const {
    account,
    user,
    loading,
    apiRequest,
    refreshAccount,
    linkGoogle,
    signOut,
  } = useAuth();
  const router = useRouter();
  const [sharing, setSharing] = useState<SharingOverview | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [recipientEmail, setRecipientEmail] = useState("");
  const [relationshipType, setRelationshipType] =
    useState<RelationshipType>("parent");
  const [selectedScopes, setSelectedScopes] = useState<PermissionScope[]>([
    "learning_time",
    "academic_progress",
  ]);
  const [invitationUrl, setInvitationUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");

  const loadSharing = useCallback(async () => {
    const response = await apiRequest("/api/sharing/invitations");
    if (!response.ok) throw new Error(await responseError(response));
    const payload = (await response.json()) as { sharing: SharingOverview };
    setSharing(payload.sharing);
  }, [apiRequest]);

  useEffect(() => {
    if (!loading && (!user || !account)) {
      router.replace("/auth");
      return;
    }
    if (account) {
      // Loading an external resource is the intended synchronization for this effect.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      void loadSharing().catch((loadError: unknown) =>
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Sharing could not be loaded.",
        ),
      );
    }
  }, [account, loadSharing, loading, router, user]);

  const allowedScopes = useMemo(
    () => permissionsByRelationship[relationshipType],
    [relationshipType],
  );

  function changeRelationship(next: RelationshipType) {
    setRelationshipType(next);
    const allowed = new Set(permissionsByRelationship[next]);
    setSelectedScopes((current) =>
      current.filter((scope) => allowed.has(scope)),
    );
    setInvitationUrl(null);
  }

  function toggleScope(scope: PermissionScope) {
    setSelectedScopes((current) =>
      current.includes(scope)
        ? current.filter((value) => value !== scope)
        : [...current, scope],
    );
  }

  async function saveAccount(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await perform(async () => {
      const response = await apiRequest("/api/account", {
        method: "PATCH",
        body: JSON.stringify({
          displayName: displayName ?? account?.displayName ?? "",
        }),
      });
      if (!response.ok) throw new Error(await responseError(response));
      await refreshAccount();
      setDisplayName(null);
      setMessage("Account information updated.");
    });
  }

  async function createInvitation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await perform(async () => {
      const response = await apiRequest("/api/sharing/invitations", {
        method: "POST",
        body: JSON.stringify({
          recipientEmail,
          relationshipType,
          permissionScopes: selectedScopes,
        }),
      });
      if (!response.ok) throw new Error(await responseError(response));
      const payload = (await response.json()) as { token: string };
      const url = `${window.location.origin}/share/${payload.token}`;
      setInvitationUrl(url);
      setRecipientEmail("");
      await loadSharing();
      setMessage(
        "Invitation created. Share this link with the invited person.",
      );
    });
  }

  async function revokeInvitation(id: string) {
    await perform(async () => {
      const response = await apiRequest(`/api/sharing/invitations/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error(await responseError(response));
      await loadSharing();
      setMessage("Invitation revoked.");
    });
  }

  async function revokeConnection(id: string) {
    await perform(async () => {
      const response = await apiRequest(`/api/sharing/connections/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error(await responseError(response));
      await loadSharing();
      setMessage("Access revoked immediately.");
    });
  }

  async function deleteAccount() {
    if (deleteConfirmation !== "DELETE") return;
    await perform(async () => {
      const response = await apiRequest("/api/account", { method: "DELETE" });
      if (!response.ok) throw new Error(await responseError(response));
      await signOut();
      router.replace("/");
    });
  }

  async function perform(operation: () => Promise<void>) {
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      await operation();
    } catch (operationError) {
      setError(
        operationError instanceof Error
          ? operationError.message
          : "The request could not be completed.",
      );
    } finally {
      setBusy(false);
    }
  }

  if (loading || !account || !user) {
    return <div className="page-loading">Opening your private space…</div>;
  }

  const hasGoogle = user.providerData.some(
    (provider) => provider.providerId === "google.com",
  );

  return (
    <main className="account-shell">
      <header className="account-header">
        <Link className="brand" href="/">
          <span className="brand-mark" aria-hidden="true">
            B
          </span>
          <span>Beaver AI</span>
        </Link>
        <button
          className="button button-secondary button-small"
          type="button"
          onClick={() => void signOut()}
        >
          Sign out
        </button>
      </header>

      <div className="account-layout">
        <aside className="account-nav" aria-label="Account sections">
          <p className="account-greeting">
            <span>Your private space</span>
            {account.displayName || account.email}
          </p>
          <a href="#overview">Overview</a>
          <a href="#sharing">Sharing</a>
          <a href="#settings">Account settings</a>
        </aside>

        <div className="account-content">
          {(error || message) && (
            <div
              className={`message ${error ? "message-error" : "message-success"}`}
              role={error ? "alert" : "status"}
            >
              {error ?? message}
            </div>
          )}

          <section className="welcome-panel" id="overview">
            <div>
              <p className="eyebrow">Account ready</p>
              <h1>
                Welcome{account.displayName ? `, ${account.displayName}` : ""}.
              </h1>
              <p>
                Your Beaver AI account is secure and private. Student onboarding
                will begin here in Phase 2.
              </p>
            </div>
            <div className="privacy-badge">
              <span aria-hidden="true">✓</span>
              Private by default
            </div>
          </section>

          <section className="content-section" id="sharing">
            <div className="section-heading">
              <div>
                <p className="eyebrow">You stay in control</p>
                <h2>Sharing connections</h2>
              </div>
              <p>
                Invite a parent or educator and choose exactly what the
                connection may access. Private notes and AI conversations are
                never included.
              </p>
            </div>

            <form className="sharing-form panel" onSubmit={createInvitation}>
              <div className="form-grid">
                <label>
                  Invite by email
                  <input
                    maxLength={320}
                    onChange={(event) => setRecipientEmail(event.target.value)}
                    placeholder="person@example.com"
                    required
                    type="email"
                    value={recipientEmail}
                  />
                </label>
                <label>
                  Relationship
                  <select
                    onChange={(event) =>
                      changeRelationship(event.target.value as RelationshipType)
                    }
                    value={relationshipType}
                  >
                    <option value="parent">Parent</option>
                    <option value="educator">Educator</option>
                  </select>
                </label>
              </div>
              <fieldset>
                <legend>Permission scope</legend>
                <div className="scope-grid">
                  {allowedScopes.map((scope) => (
                    <label className="check-option" key={scope}>
                      <input
                        checked={selectedScopes.includes(scope)}
                        onChange={() => toggleScope(scope)}
                        type="checkbox"
                      />
                      <span>{permissionLabels[scope]}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
              <button
                className="button button-primary"
                disabled={busy || selectedScopes.length === 0}
                type="submit"
              >
                Create private invitation
              </button>
              {invitationUrl && (
                <div className="invitation-result">
                  <label>
                    One-time invitation link
                    <input readOnly value={invitationUrl} />
                  </label>
                  <button
                    className="button button-secondary button-small"
                    type="button"
                    onClick={() =>
                      void navigator.clipboard.writeText(invitationUrl)
                    }
                  >
                    Copy link
                  </button>
                  <p>
                    The link starts acceptance but does not grant ongoing
                    access. The invited person must sign in with the matching
                    verified email.
                  </p>
                </div>
              )}
            </form>

            <ConnectionLists
              sharing={sharing}
              busy={busy}
              revokeConnection={revokeConnection}
              revokeInvitation={revokeInvitation}
            />
          </section>

          <section className="content-section" id="settings">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Your account</p>
                <h2>Account settings</h2>
              </div>
            </div>

            <div className="settings-grid">
              <form className="panel" onSubmit={saveAccount}>
                <h3>Account information</h3>
                <label>
                  Display name
                  <input
                    maxLength={80}
                    onChange={(event) => setDisplayName(event.target.value)}
                    required
                    value={displayName ?? account.displayName ?? ""}
                  />
                </label>
                <label>
                  Email
                  <input disabled value={account.email} />
                </label>
                <button
                  className="button button-primary button-small"
                  disabled={busy}
                  type="submit"
                >
                  Save changes
                </button>
              </form>

              <div className="panel">
                <h3>Sign-in methods</h3>
                <p className="panel-copy">
                  {hasGoogle
                    ? "Google is linked to this account."
                    : "Link Google after signing in to prevent duplicate accounts."}
                </p>
                {!hasGoogle && (
                  <button
                    className="button button-secondary button-small"
                    disabled={busy}
                    type="button"
                    onClick={() => void perform(linkGoogle)}
                  >
                    Link Google
                  </button>
                )}
              </div>
            </div>

            <div className="danger-panel">
              <div>
                <h3>Delete account</h3>
                <p>
                  This removes your Beaver AI account, authentication identity,
                  invitations, and sharing connections. This cannot be undone.
                </p>
              </div>
              <label>
                Type DELETE to confirm
                <input
                  onChange={(event) =>
                    setDeleteConfirmation(event.target.value)
                  }
                  value={deleteConfirmation}
                />
              </label>
              <button
                className="button button-danger button-small"
                disabled={busy || deleteConfirmation !== "DELETE"}
                type="button"
                onClick={() => void deleteAccount()}
              >
                Delete my account
              </button>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function ConnectionLists({
  sharing,
  busy,
  revokeConnection,
  revokeInvitation,
}: {
  sharing: SharingOverview | null;
  busy: boolean;
  revokeConnection(id: string): Promise<void>;
  revokeInvitation(id: string): Promise<void>;
}) {
  if (!sharing) {
    return <p className="subtle-status">Loading sharing connections…</p>;
  }

  const pending = sharing.invitations.filter(
    (invitation) => invitation.status === "pending",
  );
  const activeOwned = sharing.ownedConnections.filter(
    (connection) => connection.status === "active",
  );
  const activeReceived = sharing.receivedConnections.filter(
    (connection) => connection.status === "active",
  );

  return (
    <div className="connection-groups">
      <div>
        <h3>People you share with</h3>
        {activeOwned.length === 0 && pending.length === 0 ? (
          <p className="empty-state">No active sharing connections.</p>
        ) : (
          <div className="connection-list">
            {activeOwned.map((connection) => (
              <article className="connection-card" key={connection.id}>
                <div>
                  <strong>
                    {connection.counterpartDisplayName ||
                      connection.counterpartEmail ||
                      "Connected account"}
                  </strong>
                  <span className="status-chip">
                    {connection.relationshipType}
                  </span>
                  <p>
                    {connection.permissionScopes
                      .map((scope) => permissionLabels[scope])
                      .join(" · ")}
                  </p>
                </div>
                <button
                  className="text-button text-button-danger"
                  disabled={busy}
                  type="button"
                  onClick={() => void revokeConnection(connection.id)}
                >
                  Revoke access
                </button>
              </article>
            ))}
            {pending.map((invitation) => (
              <article className="connection-card" key={invitation.id}>
                <div>
                  <strong>{invitation.recipientEmail}</strong>
                  <span className="status-chip status-chip-muted">pending</span>
                  <p>
                    {permissionLabels[invitation.permissionScopes[0]!] ?? ""}
                    {invitation.permissionScopes.length > 1
                      ? ` + ${invitation.permissionScopes.length - 1} more`
                      : ""}
                  </p>
                </div>
                <button
                  className="text-button text-button-danger"
                  disabled={busy}
                  type="button"
                  onClick={() => void revokeInvitation(invitation.id)}
                >
                  Revoke invitation
                </button>
              </article>
            ))}
          </div>
        )}
      </div>

      <div>
        <h3>Shared with you</h3>
        {activeReceived.length === 0 ? (
          <p className="empty-state">No students currently share with you.</p>
        ) : (
          <div className="connection-list">
            {activeReceived.map((connection) => (
              <article className="connection-card" key={connection.id}>
                <div>
                  <strong>
                    {connection.counterpartDisplayName ||
                      connection.counterpartEmail ||
                      "Student account"}
                  </strong>
                  <span className="status-chip">
                    {connection.relationshipType}
                  </span>
                  <p>
                    Access is limited to:{" "}
                    {connection.permissionScopes
                      .map((scope) => permissionLabels[scope])
                      .join(" · ")}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
