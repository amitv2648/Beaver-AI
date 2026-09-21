import { Suspense } from "react";
import type { Metadata } from "next";
import { AuthPanel } from "@/components/auth/auth-panel";

export const metadata: Metadata = {
  title: "Sign in",
};

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="page-loading">Opening Beaver AI…</div>}>
      <AuthPanel />
    </Suspense>
  );
}
