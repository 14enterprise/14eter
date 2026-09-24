import { NextResponse } from "next/server";
import { findUserByEmail, createPasswordReset } from "@/lib/users-db";
import {
  generateResetToken,
  hashResetToken,
  RESET_TOKEN_TTL_MS,
} from "@/lib/user-auth";
import {
  escapeHtml as escape,
  renderEmailFrame,
  resendConfigured,
  sendEmail,
} from "@/lib/resend";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as
    | { email?: string }
    | null;

  const email = body?.email?.trim().toLowerCase();

  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    return NextResponse.json(
      { error: "Please provide a valid email address." },
      { status: 400 }
    );
  }

  const user = await findUserByEmail(email);

  if (user) {
    const token = generateResetToken();
    const tokenHash = await hashResetToken(token);
    await createPasswordReset({
      email,
      tokenHash,
      expiresAt: Date.now() + RESET_TOKEN_TTL_MS,
    });
    const origin = new URL(req.url).origin;
    const resetUrl = `${origin}/reset-password?token=${token}`;

    if (resendConfigured()) {
      try {
        await sendEmail({
          to: email,
          subject: "Reset your 14Eter password",
          html: renderEmailFrame({
            title: "Reset your password",
            body: `
              <p>We received a request to reset the password for <strong style="color:#ffffff">${escape(email)}</strong>.</p>
              <p style="color:#9ca3af;font-size:13px;">This link expires in 1 hour. If you didn't request this, you can safely ignore this email.</p>`,
            cta: { href: resetUrl, label: "Reset my password" },
          }),
        });
      } catch (err) {
        console.error("Password reset email failed:", err);
      }
    } else if (process.env.NODE_ENV !== "production") {
      console.log(`[forgot-password] dev reset link for ${email}: ${resetUrl}`);
      return NextResponse.json({ ok: true, devResetUrl: resetUrl });
    }
  }

  return NextResponse.json({
    ok: true,
    message:
      "If that email is registered, a password reset link is on its way.",
  });
}