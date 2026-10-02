import { NextResponse } from "next/server";
import { z } from "zod";
import { DomainError } from "@/modules/identity-access/model";
import { HttpError } from "./identity-access";

const MAX_JSON_BYTES = 16_384;
const resourceIdSchema = z.string().uuid();
export const noStoreHeaders = { "Cache-Control": "no-store" } as const;

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
      { status: error.status, headers: noStoreHeaders },
    );
  }
  if (error instanceof DomainError) {
    return NextResponse.json(
      { error: { code: error.code, message: error.message } },
      { status: statusByDomainCode[error.code], headers: noStoreHeaders },
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
    { status: 500, headers: noStoreHeaders },
  );
}

export async function readJson(request: Request): Promise<unknown> {
  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (contentLength > MAX_JSON_BYTES) {
    throw new HttpError(413, "payload_too_large", "Request is too large.");
  }

  try {
    const reader = request.body?.getReader();
    if (!reader) {
      throw new SyntaxError("Request body is empty.");
    }

    const decoder = new TextDecoder();
    let bytesRead = 0;
    let body = "";
    while (true) {
      const chunk = await reader.read();
      if (chunk.done) break;
      bytesRead += chunk.value.byteLength;
      if (bytesRead > MAX_JSON_BYTES) {
        void reader.cancel();
        throw new HttpError(413, "payload_too_large", "Request is too large.");
      }
      body += decoder.decode(chunk.value, { stream: true });
    }
    body += decoder.decode();
    return JSON.parse(body) as unknown;
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }
    throw new HttpError(
      400,
      "invalid_json",
      "Request body must be valid JSON.",
    );
  }
}

export function parseResourceId(value: string, resource: string): string {
  if (!resourceIdSchema.safeParse(value).success) {
    throw new HttpError(422, "validation_error", `${resource} ID is invalid.`);
  }
  return value;
}
