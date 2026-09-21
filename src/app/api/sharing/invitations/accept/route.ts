import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import {
  authenticateRequest,
  getIdentityAccessService,
} from "@/server/identity-access";
import { apiError, readJson } from "@/server/http";

export const runtime = "nodejs";

const requestSchema = z.object({
  token: z.string().min(20).max(256),
});

export async function POST(request: NextRequest) {
  try {
    const { account, identity } = await authenticateRequest(request);
    const body = requestSchema.safeParse(await readJson(request));
    if (!body.success) {
      return NextResponse.json(
        {
          error: {
            code: "validation_error",
            message: "Invitation token is invalid.",
          },
        },
        { status: 422 },
      );
    }

    const connection = await getIdentityAccessService().acceptInvitation(
      body.data.token,
      account.id,
      identity,
    );
    return NextResponse.json({ connection });
  } catch (error) {
    return apiError(error);
  }
}
