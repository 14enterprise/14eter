export const USER_COOKIE = "14eter_user";

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function emailToHex(email: string): string {
  return Array.from(new TextEncoder().encode(email))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function hexToEmail(hex: string): string {
  const bytes = new Uint8Array(
    (hex.match(/.{2}/g) ?? []).map((x) => parseInt(x, 16))
  );
  return new TextDecoder().decode(bytes);
}

function userSecret(): string {
  return (
    process.env.USER_SESSION_SECRET ??
    process.env.ADMIN_PASSWORD ??
    "admin123"
  );
}

export async function userToken(email: string, exp: number): Promise<string> {
  const sig = await sha256Hex(`user::${email}::${exp}::${userSecret()}`);
  return `${emailToHex(email)}.${exp}.${sig}`;
}

export async function verifyUserToken(
  value: string | undefined | null
): Promise<{ email: string } | null> {
  if (!value) return null;
  const parts = value.split(".");
  if (parts.length !== 3) return null;
  const [emailHex, expRaw, sig] = parts;
  if (!/^[0-9a-f]*$/.test(emailHex) || emailHex.length % 2 !== 0) return null;
  const email = hexToEmail(emailHex);
  const exp = Number(expRaw);
  if (!Number.isFinite(exp) || exp < Date.now()) return null;
  const expected = await sha256Hex(`user::${email}::${exp}::${userSecret()}`);
  if (sig !== expected) return null;
  return { email };
}

export async function hashPassword(password: string): Promise<string> {
  const salt = Array.from(crypto.getRandomValues(new Uint8Array(16)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  const hash = await sha256Hex(`${salt}::${password}`);
  return `${salt}:${hash}`;
}

export async function verifyPassword(
  password: string,
  stored: string
): Promise<boolean> {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  return (await sha256Hex(`${salt}::${password}`)) === hash;
}

export function generateResetToken(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function hashResetToken(token: string): Promise<string> {
  return sha256Hex(`reset::${token}`);
}

export const RESET_TOKEN_TTL_MS = 60 * 60 * 1000;