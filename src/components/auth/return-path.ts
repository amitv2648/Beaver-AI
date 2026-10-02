const invitationReturnPath = /^\/share\/[A-Za-z0-9_-]{20,256}$/;

export function safeAuthReturnPath(value: string | null): string {
  return value && invitationReturnPath.test(value) ? value : "/account";
}
