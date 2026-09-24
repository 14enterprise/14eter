import { NextResponse } from "next/server";
import { hashPassword, USER_COOKIE, userToken } from "@/lib/user-auth";
import { PARTNER_COOKIE, partnerToken } from "@/lib/partner-token";
import { createUser, findUserByEmail } from "@/lib/users-db";
import {
  escapeHtml as escape,
  keyValueRows,
  renderEmailFrame,
  resendConfigured,
  sendEmail,
  textToParagraphs,
} from "@/lib/resend";

const CONTACT_TO = process.env.CONTACT_TO ?? "14eter@gmail.com";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as
    | {
        name?: string;
        email?: string;
        password?: string;
        company?: string;
        projectName?: string;
        projectType?: string;
        projectDescription?: string;
        websiteModel?: string;
      }
    | null;

  const name = body?.name?.trim();
  const email = body?.email?.trim().toLowerCase();
  const password = body?.password;
  const company = body?.company?.trim() ?? "";
  const projectName = body?.projectName?.trim();
  const projectType = body?.projectType?.trim();
  const projectDescription = body?.projectDescription?.trim();
  const websiteModel = body?.websiteModel === "diy" ? "diy" : "partner";

  if (!name || !email || !/^\S+@\S+\.\S+$/.test(email)) {
    return NextResponse.json(
      { error: "Please provide a valid name and email address." },
      { status: 400 }
    );
  }
  if (!password || password.length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters long." },
      { status: 400 }
    );
  }
  if (!projectName || !projectType || !projectDescription) {
    return NextResponse.json(
      { error: "Please tell us about your project." },
      { status: 400 }
    );
  }

  const existing = await findUserByEmail(email);
  if (existing) {
    return NextResponse.json(
      { error: "An account with this email already exists. Please log in." },
      { status: 409 }
    );
  }

  const passwordHash = await hashPassword(password);
  const user = await createUser({
    name,
    email,
    passwordHash,
    company,
    projectName,
    projectType,
    projectDescription,
    model: websiteModel,
  });

  const origin = new URL(req.url).origin;

  if (resendConfigured()) {
    try {
      await sendEmail({
        to: user.email,
        subject: "Your 14Eter project is approved",
        html: renderEmailFrame({
          title: `Welcome to 14Eter, ${escape(name)} 🎉`,
          body: `
            <p style="margin:0 0 16px">Good news — your project <strong style="color:#ffffff">${escape(projectName)}</strong> (${escape(projectType)}) has been <strong style="color:#ffffff">approved</strong>. We've received your registration and your portal is live.</p>
            ${keyValueRows([
              { label: "Website Model", value: websiteModel === "diy" ? "AI App Factory" : "Partner With Us" },
              { label: "Company", value: escape(company || "—") },
              { label: "Project", value: escape(projectName) },
              { label: "Type", value: escape(projectType) },
            ])}
            <p style="color:#9ca3af;font-size:13px;margin:0 0 4px;">You can sign in anytime to follow your project's progress.</p>`,
          cta: { href: `${origin}/login`, label: "Open My Dashboard" },
        }),
      });
    } catch (err) {
      console.error("User welcome email failed:", err);
    }

    try {
      await sendEmail({
        to: CONTACT_TO,
        replyTo: email,
        subject: `New project registration from ${name}`,
        html: renderEmailFrame({
          title: "New project registration",
          body: `
            <p style="margin:0 0 8px">A new project just registered on 14eter.org.</p>
            ${keyValueRows([
              { label: "Name", value: escape(name) },
              { label: "Email", value: escape(email) },
              { label: "Website Model", value: websiteModel === "diy" ? "AI App Factory" : "Partner With Us" },
              { label: "Status", value: "Approved" },
              { label: "Company", value: escape(company || "—") },
              { label: "Project", value: escape(projectName) },
              { label: "Type", value: escape(projectType) },
            ])}
            <div style="margin-top:20px;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#9ca3af;">Project Description</div>
            <div style="margin-top:8px;padding:16px 18px;background:#0a0a0e;border:1px solid #1f2937;border-radius:12px;">${textToParagraphs(projectDescription)}</div>`,
        }),
      });
    } catch (err) {
      console.error("Registration notification email failed:", err);
    }
  }

  const res = NextResponse.json({
    ok: true,
    id: user.id,
    redirect: websiteModel === "diy" ? "/user-dashboard" : "/dashboard",
  });
  const cookieName = websiteModel === "diy" ? USER_COOKIE : PARTNER_COOKIE;
  const token = await (websiteModel === "diy"
    ? userToken(email, Date.now() + 7 * 24 * 60 * 60 * 1000)
    : partnerToken(email, Date.now() + 7 * 24 * 60 * 60 * 1000));
  const isHttps =
    req.headers.get("x-forwarded-proto") === "https" ||
    new URL(req.url).protocol === "https:";
  res.cookies.set(cookieName, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
    secure: isHttps,
  });
  return res;
}