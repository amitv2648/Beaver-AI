import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  authenticateRequest,
  getIdentityAccessService,
} from "@/server/identity-access";
import { apiError, readJson } from "@/server/http";

export const runtime = "nodejs";

async function currentAccount(request: NextRequest) {
  try {
    const { account } = await authenticateRequest(request);
    return NextResponse.json(
      { account },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return apiError(error);
  }
}

export const GET = currentAccount;
export const POST = currentAccount;

export async function PATCH(request: NextRequest) {
  try {
    const { account } = await authenticateRequest(request);
    const updated = await getIdentityAccessService().updateOwnAccount(
      account.id,
      await readJson(request),
    );
    return NextResponse.json({ account: updated });
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { account, identity } = await authenticateRequest(request);
    await getIdentityAccessService().deleteOwnAccount(account.id, identity);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return apiError(error);
  }
}
