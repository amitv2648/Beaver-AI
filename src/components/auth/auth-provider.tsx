"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { FirebaseError } from "firebase/app";
import { onAuthStateChanged, type User } from "firebase/auth";
import {
  linkGoogleIdentity,
  registerWithEmail,
  requestPasswordReset,
  signInWithEmail,
  signInWithGoogle as signInGoogle,
  signOutFromFirebase,
} from "@/infrastructure/firebase/browser-authentication";
import {
  configureFirebaseAuth,
  getFirebaseAuth,
} from "@/infrastructure/firebase/client";

export interface AccountDto {
  id: string;
  email: string;
  displayName: string | null;
  status: "active" | "deleting";
  createdAt: string;
  updatedAt: string;
}

interface AuthContextValue {
  user: User | null;
  account: AccountDto | null;
  loading: boolean;
  error: string | null;
  register(email: string, password: string): Promise<void>;
  signIn(email: string, password: string): Promise<void>;
  signInWithGoogle(): Promise<void>;
  linkGoogle(): Promise<void>;
  sendPasswordReset(email: string): Promise<void>;
  signOut(): Promise<void>;
  refreshAccount(): Promise<void>;
  apiRequest(path: string, init?: RequestInit): Promise<Response>;
  clearError(): void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

class ClientApiError extends Error {
  constructor(
    public readonly code: string,
    message: string,
  ) {
    super(message);
  }
}

function friendlyAuthError(error: unknown): string {
  if (!(error instanceof FirebaseError)) {
    return error instanceof Error
      ? error.message
      : "Authentication could not be completed.";
  }

  const messages: Record<string, string> = {
    "auth/account-exists-with-different-credential":
      "An account already uses this email. Sign in with its existing method, then link Google in settings.",
    "auth/credential-already-in-use":
      "This Google account is already linked to another Beaver AI account.",
    "auth/email-already-in-use":
      "An account already uses this email. Try signing in instead.",
    "auth/invalid-credential": "The email or password is incorrect.",
    "auth/invalid-email": "Enter a valid email address.",
    "auth/network-request-failed":
      "We could not reach the sign-in service. Check your connection and try again.",
    "auth/popup-blocked": "Allow the sign-in popup and try again.",
    "auth/popup-closed-by-user": "Google sign-in was canceled.",
    "auth/requires-recent-login":
      "For your security, sign out and sign in again before trying this action.",
    "auth/too-many-requests":
      "Too many attempts were made. Wait a little while and try again.",
    "auth/weak-password": "Use a password with at least 8 characters.",
  };
  return messages[error.code] ?? "Authentication could not be completed.";
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [account, setAccount] = useState<AccountDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const apiRequest = useCallback(
    async (path: string, init: RequestInit = {}) => {
      const currentUser = getFirebaseAuth().currentUser;
      if (!currentUser) {
        throw new Error("Sign in to continue.");
      }
      const token = await currentUser.getIdToken();
      const headers = new Headers(init.headers);
      headers.set("Authorization", `Bearer ${token}`);
      if (init.body && !headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
      }
      return fetch(path, { ...init, headers, cache: "no-store" });
    },
    [],
  );

  const refreshAccount = useCallback(async () => {
    const response = await apiRequest("/api/account", { method: "POST" });
    const payload = (await response.json()) as {
      account?: AccountDto;
      error?: { code: string; message: string };
    };
    if (!response.ok || !payload.account) {
      throw new ClientApiError(
        payload.error?.code ?? "account_sync_failed",
        payload.error?.message ?? "Your Beaver AI account could not be loaded.",
      );
    }
    setAccount(payload.account);
  }, [apiRequest]);

  useEffect(() => {
    let active = true;
    let unsubscribe: () => void = () => {};

    void configureFirebaseAuth()
      .then((auth) => {
        if (!active) return;
        unsubscribe = onAuthStateChanged(auth, async (nextUser) => {
          if (!active) return;
          setUser(nextUser);
          setError(null);
          if (!nextUser) {
            setAccount(null);
            setLoading(false);
            return;
          }
          try {
            setLoading(true);
            await refreshAccount();
          } catch (syncError) {
            setAccount(null);
            if (
              syncError instanceof ClientApiError &&
              syncError.code === "account_conflict"
            ) {
              await signOutFromFirebase();
            }
            setError(friendlyAuthError(syncError));
          } finally {
            if (active) setLoading(false);
          }
        });
      })
      .catch((configurationError) => {
        if (active) {
          setError(friendlyAuthError(configurationError));
          setLoading(false);
        }
      });

    return () => {
      active = false;
      unsubscribe();
    };
  }, [refreshAccount]);

  const run = useCallback(async (operation: () => Promise<void>) => {
    setError(null);
    try {
      await operation();
    } catch (operationError) {
      const message = friendlyAuthError(operationError);
      setError(message);
      throw new Error(message, { cause: operationError });
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      account,
      loading,
      error,
      clearError: () => setError(null),
      apiRequest,
      refreshAccount,
      register: (email, password) =>
        run(async () => {
          await registerWithEmail(email, password);
        }),
      signIn: (email, password) =>
        run(async () => {
          await signInWithEmail(email, password);
        }),
      signInWithGoogle: () =>
        run(async () => {
          await signInGoogle();
        }),
      linkGoogle: () =>
        run(async () => {
          const currentUser = getFirebaseAuth().currentUser;
          if (!currentUser) throw new Error("Sign in to continue.");
          await linkGoogleIdentity(currentUser);
          await refreshAccount();
        }),
      sendPasswordReset: (email) =>
        run(async () => {
          await requestPasswordReset(email);
        }),
      signOut: () =>
        run(async () => {
          await signOutFromFirebase();
        }),
    }),
    [account, apiRequest, error, loading, refreshAccount, run, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error("useAuth must be used within AuthProvider.");
  }
  return value;
}
