import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  authenticateRequest,
  getIdentityAccessService,
} from "@/server/identity-access";
import { apiError } from "@/server/http";

export const runtime = "nodejs";

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { account } = await authenticateRequest(request);
    const { id } = await context.params;
    await getIdentityAccessService().revokeInvitation(id, account.id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return apiError(error);
  }
}
