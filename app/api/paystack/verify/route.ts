import { NextRequest, NextResponse } from "next/server";
import { USER_COOKIE, verifyUserToken } from "@/lib/user-auth";
import { findUserByEmail, setUserSubscription } from "@/lib/users-db";
import { verifyTransaction, PAYSTACK_PLANS, type PlanKey } from "@/lib/paystack";

export const runtime = "nodejs";

function getPlanExpiry(planKey: PlanKey): number {
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;
  switch (planKey) {
    case "monthly":
      return now + 30 * day;
    case "sixMonths":
      return now + 180 * day;
    case "yearly":
      return now + 365 * day;
    default:
      return now + 30 * day;
  }
}

export async function POST(req: NextRequest) {
  const session = await verifyUserToken(req.cookies.get(USER_COOKIE)?.value ?? null);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await findUserByEmail(session.email);
  if (!user || user.model === "partner") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as { reference?: string } | null;
  const reference = body?.reference?.trim();
  if (!reference) {
    return NextResponse.json({ error: "Missing reference" }, { status: 400 });
  }

  try {
    const verification = await verifyTransaction(reference);
    const data = verification.data;

    if (data.status !== "success") {
      return NextResponse.json(
        { error: "Payment not successful", status: data.status },
        { status: 400 }
      );
    }

    const parts = reference.split("_");
    const rawPlan = parts[2] as PlanKey;
    const planKey: PlanKey = rawPlan && rawPlan in PAYSTACK_PLANS ? rawPlan : "monthly";
    const plan = PAYSTACK_PLANS[planKey];

    // Optional safety: confirm the paid amount matches the plan.
    if (data.amount && data.amount !== plan.amount) {
      console.warn(
        `Paystack amount mismatch for ${reference}: got ${data.amount}, expected ${plan.amount}`
      );
    }

    const expiresAt = getPlanExpiry(planKey);

    await setUserSubscription(user.id, {
      status: "active",
      plan: planKey,
      expiresAt,
      paystackCustomerId: data.customer?.customer_code ?? user.paystackCustomerId ?? "",
      paystackSubscriptionId: user.paystackSubscriptionId ?? "",
    });

    return NextResponse.json({
      ok: true,
      subscription: {
        status: "active",
        plan: planKey,
        expiresAt,
        planLabel: plan.label,
      },
    });
  } catch (err) {
    console.error("Paystack verification error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to verify payment" },
      { status: 500 }
    );
  }
}
