import { NextRequest, NextResponse } from "next/server";
import { USER_COOKIE, verifyUserToken } from "@/lib/user-auth";
import { findUserByEmail } from "@/lib/users-db";
import {
  paystackConfigured,
  initializeTransaction,
  PAYSTACK_PLANS,
  type PlanKey,
} from "@/lib/paystack";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const session = await verifyUserToken(req.cookies.get(USER_COOKIE)?.value ?? null);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await findUserByEmail(session.email);
  if (!user || user.model === "partner") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!paystackConfigured()) {
    return NextResponse.json(
      { error: "Payment system is not configured yet. Add PAYSTACK_SECRET_KEY to continue." },
      { status: 503 }
    );
  }

  const body = (await req.json().catch(() => null)) as { plan?: PlanKey } | null;
  const planKey: PlanKey =
    body?.plan && body.plan in PAYSTACK_PLANS ? body.plan : "monthly";
  const plan = PAYSTACK_PLANS[planKey];

  try {
    const reference = `sub_${user.id}_${planKey}_${Date.now()}`;
    const origin = new URL(req.url).origin;
    const callbackUrl = `${origin}/user-dashboard?payment=success&reference=${reference}`;

    const transaction = await initializeTransaction(
      user.email,
      plan.amount,
      reference,
      callbackUrl,
      { userId: user.id, plan: planKey }
    );

    return NextResponse.json({
      ok: true,
      authorizationUrl: transaction.data.authorization_url,
      reference,
    });
  } catch (err) {
    console.error("Paystack checkout error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to initialize payment" },
      { status: 500 }
    );
  }
}
