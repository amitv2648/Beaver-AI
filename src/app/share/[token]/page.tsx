import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { InvitationAcceptance } from "@/components/account/invitation-acceptance";

export const metadata: Metadata = {
  title: "Sharing invitation",
  robots: { index: false, follow: false },
};

export default async function SharingInvitationPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  if (token.length < 20 || token.length > 256) {
    notFound();
  }
  return <InvitationAcceptance token={token} />;
}
