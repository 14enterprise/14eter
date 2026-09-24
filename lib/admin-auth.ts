import { cookies } from "next/headers";

export const ADMIN_COOKIE = "14eter_admin";

async function expectedToken(): Promise<string> {
  const secret = process.env.ADMIN_PASSWORD ?? "admin123";
  const data = new TextEncoder().encode(`14eter::${secret}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function isAdminRequest(req: Request): Promise<boolean> {
  const cookieHeader = req.headers.get("cookie") ?? "";
  const match = cookieHeader
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${ADMIN_COOKIE}=`));
  if (!match) return false;
  const value = decodeURIComponent(match.slice(ADMIN_COOKIE.length + 1));
  return value === (await expectedToken());
}

export async function isAdminSession(): Promise<boolean> {
  const store = await cookies();
  return store.get(ADMIN_COOKIE)?.value === (await expectedToken());
}

export { expectedToken };
