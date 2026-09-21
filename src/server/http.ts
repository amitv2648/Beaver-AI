import { NextResponse } from "next/server";
import { DomainError } from "@/modules/identity-access/model";
import { HttpError } from "./identity-access";

const statusByDomainCode: Record<DomainError["code"], number> = {
  account_conflict: 409,
  account_deleting: 403,
  forbidden: 403,
  identity_email_required: 422,
  invitation_expired: 410,
  invitation_invalid: 404,
  invitation_recipient_mismatch: 403,
  not_found: 404,
  recent_authentication_required: 403,
  validation_error: 422,
};

export function apiError(error: unknown): NextResponse {
  if (error instanceof HttpError) {
    return NextResponse.json(
      { error: { code: error.code, message: error.message } },
      { status: error.status },
    );
  }
  if (error instanceof DomainError) {
    return NextResponse.json(
      { error: { code: error.code, message: error.message } },
      { status: statusByDomainCode[error.code] },
    );
  }

  console.error("Unhandled API error", {
    name: error instanceof Error ? error.name : "UnknownError",
  });
  return NextResponse.json(
    {
      error: {
        code: "internal_error",
        message: "Something went wrong. Please try again.",
      },
    },
    { status: 500 },
  );
}

export async function readJson(request: Request): Promise<unknown> {
  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (contentLength > 16_384) {
    throw new HttpError(413, "payload_too_large", "Request is too large.");
  }

  try {
    return await request.json();
  } catch {
    throw new HttpError(
      400,
      "invalid_json",
      "Request body must be valid JSON.",
    );
  }
}
