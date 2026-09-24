import { NextRequest, NextResponse } from "next/server";
import { expireOverdueSubscriptions } from "@/lib/users-db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Scheduled sweep: disables premium on every account whose subscription
 * has passed its expiry date.
 *
 * Protect with CRON_SECRET. Call it from Vercel Cron, an external
 * scheduler, or manually, e.g.:
 *   curl -H "Authorization: Bearer $CRON_SECRET" \
 *     https://14eter.org/api/cron/expire-subscriptions
 */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET ?? "";
  if (!secret) {
    return NextResponse.json(
      { error: "CRON_SECRET is not configured." },
      { status: 503 }
    );
  }

  const header = req.headers.get("authorization") ?? "";
  const querySecret = new URL(req.url).searchParams.get("secret") ?? "";
  const provided = header.startsWith("Bearer ")
    ? header.slice("Bearer ".length)
    : querySecret;

  if (provided !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const expired = await expireOverdueSubscriptions();
    return NextResponse.json({ ok: true, expired });
  } catch (err) {
    console.error("Expiry sweep failed:", err);
    return NextResponse.json({ error: "Sweep failed." }, { status: 500 });
  }
}
