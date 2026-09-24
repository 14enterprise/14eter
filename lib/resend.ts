type SendArgs = {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
};

export function resendConfigured(): boolean {
  const key = process.env.RESEND_API_KEY ?? "";
  return key.startsWith("re_") && key.length > 20;
}

export async function sendEmail({ to, subject, html, replyTo }: SendArgs) {
  if (!resendConfigured()) {
    throw new Error(
      "RESEND_API_KEY is not configured (or still the placeholder value)"
    );
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.RESEND_FROM ?? "14Eter <onboarding@resend.dev>",
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      ...(replyTo ? { reply_to: replyTo } : {}),
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Resend error ${res.status}: ${detail.slice(0, 300)}`);
  }

  return (await res.json()) as { id?: string };
}

export function textToParagraphs(text: string): string {
  return text
    .split(/\n{2,}|\n/)
    .filter(Boolean)
    .map((p) => `<p style="margin:0 0 12px">${escapeHtml(p)}</p>`)
    .join("");
}

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export type EmailFrame = {
  title: string;
  body: string;
  cta?: { href: string; label: string };
};

export function emailButton(href: string, label: string): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0">
    <tr><td align="center">
      <a href="${escapeHtml(href)}" style="display:inline-block;background:#3b82f6;color:#ffffff;text-decoration:none;font-weight:700;font-size:15px;padding:14px 28px;border-radius:12px;box-shadow:0 8px 20px rgba(59,130,246,.35)">${label}</a>
    </td></tr>
  </table>`;
}

export function keyValueRows(rows: { label: string; value: string }[]): string {
  const grid = rows
    .map(
      (r) => `<tr>
        <td style="padding:10px 16px;font-size:12px;color:#9ca3af;font-weight:600;text-transform:uppercase;letter-spacing:.04em;white-space:nowrap;vertical-align:top;width:1%">${r.label}</td>
        <td style="padding:10px 16px;font-size:14px;color:#e5e7eb">${r.value}</td>
      </tr>`
    )
    .join("");
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #1f2937;border-radius:12px;border-spacing:0;overflow:hidden;margin:16px 0">${grid}</table>`;
}

export function renderEmailFrame({ title, body, cta }: EmailFrame): string {
  return `<!DOCTYPE html>
<html lang="en">
<body style="margin:0;padding:0;background-color:#050508;">
  <div style="max-width:600px;margin:0 auto;padding:32px 20px;font-family:Helvetica,Arial,sans-serif;">
    <div style="background-color:#0d0d13;border:1px solid #1f2937;border-radius:18px;overflow:hidden;">
      <div style="padding:28px 32px;background:linear-gradient(135deg,#0a0a10,#131320);border-bottom:1px solid #1f2937;">
        <div style="font-size:26px;font-weight:800;letter-spacing:-0.5px;color:#ffffff">
          <span style="color:#3b82f6">14</span>Eter<span style="color:#06b6d4">.</span>
        </div>
        <div style="margin-top:8px;height:2px;width:64px;background:#3b82f6;border-radius:2px;"></div>
        <div style="margin-top:20px;font-size:20px;font-weight:700;color:#ffffff;line-height:1.35;">${title}</div>
      </div>
      <div style="padding:28px 32px;font-size:15px;line-height:1.65;color:#d1d5db;">
        ${body}
        ${cta ? emailButton(cta.href, cta.label) : ""}
      </div>
      <div style="padding:20px 32px;border-top:1px solid #1f2937;background:#0a0a0e;font-size:12px;color:#6b7280;text-align:center;">
        <div style="font-weight:700;color:#9ca3af;letter-spacing:.05em;">14<span style="color:#3b82f6">ETER</span> LIMITED</div>
        <div style="margin-top:4px;">No 30 Church Street, Mowe, Lagos Ibadan Express Way</div>
        <div style="margin-top:2px;">info@14eter.org · +234 911 5963 439</div>
        <div style="margin-top:10px;color:#4b5563;border-top:1px solid #1f2937;padding-top:10px;">You received this email because you interact with 14Eter Limited.</div>
      </div>
    </div>
  </div>
</body>
</html>`;
}
