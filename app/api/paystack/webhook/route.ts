import { NextRequest, NextResponse } from "next/server";
import { dbReady, getDb, users } from "@/lib/db";
import { eq } from "drizzle-orm";
import crypto from "crypto";
import { PAYSTACK_PLANS, type PlanKey } from "@/lib/paystack";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY ?? "";

export const runtime = "nodejs";

function expiryFor(planKey: PlanKey): number {
  const day = 24 * 60 * 60 * 1000;
  if (planKey === "sixMonths") return Date.now() + 180 * day;
  if (planKey === "yearly") return Date.now() + 365 * day;
  return Date.now() + 30 * day;
}

export async function POST(req: NextRequest) {
  const signature = req.headers.get("x-paystack-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const body = await req.text();
  const hash = crypto
    .createHmac("sha512", PAYSTACK_SECRET_KEY)
    .update(body)
    .digest("hex");

  if (!PAYSTACK_SECRET_KEY || hash !== signature) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  let event: { event?: string; data?: any };
  try {
    event = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  try {
    await dbReady();
    const db = getDb();

    switch (event.event) {
      case "charge.success": {
        const data = event.data ?? {};
        const reference = String(data.reference ?? "");
        const customerCode = String(data.customer?.customer_code ?? "");
        if (!reference.startsWith("sub_")) break;

        const parts = reference.split("_");
        const userId = parseInt(parts[1] ?? "", 10);
        const rawPlan = parts[2] as PlanKey;
        if (!Number.isFinite(userId)) break;
        const planKey: PlanKey =
          rawPlan && rawPlan in PAYSTACK_PLANS ? rawPlan : "monthly";

        const rows = await db.select().from(users).where(eq(users.id, userId));
        if (!rows[0]) break;

        await db
          .update(users)
          .set({
            subscriptionStatus: "active",
            subscriptionPlan: planKey,
            subscriptionExpiresAt: expiryFor(planKey),
            paystackCustomerId: customerCode,
          })
          .where(eq(users.id, userId));
        break;
      }
      case "subscription.expiring":
      case "subscription.disable": {
        const customerCode = String(event.data?.customer?.customer_code ?? "");
        if (!customerCode) break;
        const rows = await db
          .select()
          .from(users)
          .where(eq(users.paystackCustomerId, customerCode));
        if (!rows[0]) break;
        await db
          .update(users)
          .set({ subscriptionStatus: "expired" })
          .where(eq(users.id, rows[0].id));
        break;
      }
      case "subscription.not_renew": {
        const customerCode = String(event.data?.customer?.customer_code ?? "");
        if (!customerCode) break;
        const rows = await db
          .select()
          .from(users)
          .where(eq(users.paystackCustomerId, customerCode));
        if (!rows[0]) break;
        await db
          .update(users)
          .set({ subscriptionStatus: "cancelled" })
          .where(eq(users.id, rows[0].id));
        break;
      }
      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Webhook error:", err);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
