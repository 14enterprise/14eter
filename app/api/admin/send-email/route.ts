import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { findAllUsers, findClientUsers, findPartnerUsers } from "@/lib/users-db";
import { escapeHtml, renderEmailFrame, resendConfigured, sendEmail, textToParagraphs } from "@/lib/resend";

const FROM = process.env.RESEND_FROM ?? "14Eter <onboarding@resend.dev>";

type Audience = "all" | "partners" | "clients";

export async function POST(req: Request) {
  if (!(await isAdminRequest(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as
    | {
        to?: string;
        audience?: Audience;
        emails?: string[];
        subject?: string;
        message?: string;
        allPartners?: boolean;
      }
    | null;

  const subject = body?.subject?.trim();
  const message = body?.message?.trim();

  if (
    !body ||
    !subject ||
    !message ||
    (!body.audience && !body.allPartners && !body.to && !body.emails)
  ) {
    return NextResponse.json(
      { error: "Subject, message and a recipient are required" },
      { status: 400 }
    );
  }

  if (!resendConfigured()) {
    return NextResponse.json(
      {
        error:
          "RESEND_API_KEY is not configured — add a real key in your environment settings first.",
      },
      { status: 503 }
    );
  }

  let recipients: string[] = [];

  if (body.allPartners) {
    recipients = await resolveAudience("partners");
  } else if (body.audience) {
    recipients = await resolveAudience(body.audience);
  } else if (body.emails && body.emails.length > 0) {
    recipients = [
      ...new Set(
        body.emails
          .map((e) => e.trim().toLowerCase())
          .filter((e) => /^\S+@\S+\.\S+$/.test(e))
      ),
    ];
  } else if (body.to && /^\S+@\S+\.\S+$/.test(body.to.trim())) {
    recipients = [body.to.trim()];
  } else {
    return NextResponse.json({ error: "Invalid recipient." }, { status: 400 });
  }

  if (recipients.length === 0) {
    return NextResponse.json(
      { error: "No valid recipients — no registered accounts in that group yet." },
      { status: 400 }
    );
  }

  const html = renderEmailFrame({
    title: escapeHtml(subject),
    body: textToParagraphs(message),
  });

  let sent = 0;
  const errors: string[] = [];

  const results = await Promise.allSettled(
    recipients.map((to) => sendEmail({ to, subject, html }))
  );
  results.forEach((r, i) => {
    if (r.status === "fulfilled") sent += 1;
    else errors.push(`${recipients[i]}: ${String(r.reason).slice(0, 120)}`);
  });

  return NextResponse.json({ ok: sent > 0, sent, failed: errors.length, errors });
}

async function resolveAudience(audience: Audience): Promise<string[]> {
  const rows =
    audience === "all"
      ? await findAllUsers()
      : audience === "clients"
        ? await findClientUsers()
        : await findPartnerUsers();
  return [
    ...new Set(
      rows
        .map((u) => u.email.trim().toLowerCase())
        .filter((e): e is string => !!e)
    ),
  ];
}