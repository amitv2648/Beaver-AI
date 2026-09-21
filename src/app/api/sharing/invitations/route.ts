import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  authenticateRequest,
  getIdentityAccessService,
} from "@/server/identity-access";
import { apiError, readJson } from "@/server/http";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const { account } = await authenticateRequest(request);
    const sharing = await getIdentityAccessService().getSharingOverview(
      account.id,
    );
    return NextResponse.json(
      { sharing },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { account } = await authenticateRequest(request);
    const result = await getIdentityAccessService().createInvitation(
      account.id,
      await readJson(request),
    );
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
