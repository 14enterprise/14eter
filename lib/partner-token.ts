export const PARTNER_COOKIE = "14eter_partner";

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

function partnerSecret(): string {
  return process.env.PARTNER_SESSION_SECRET ?? process.env.ADMIN_PASSWORD ?? "admin123";
}

export async function partnerToken(email: string, exp: number): Promise<string> {
  const sig = await sha256Hex(`partner::${email}::${exp}::${partnerSecret()}`);
  return `${emailToHex(email)}.${exp}.${sig}`;
}

export async function verifyPartnerToken(
  value: string | undefined | null
): Promise<{ email: string } | null> {
  if (!value) return null;
  const parts = value.split(".");
  if (parts.length !== 3) return null;
  const [emailHex, expRaw, sig] = parts;
  if (!/^[0-9a-f]*$/.test(emailHex)) return null;
  const email = hexToEmail(emailHex);
  const exp = Number(expRaw);
  if (!Number.isFinite(exp) || exp < Date.now()) return null;
  const expected = await sha256Hex(`partner::${email}::${exp}::${partnerSecret()}`);
  if (sig !== expected) return null;
  return { email };
}
