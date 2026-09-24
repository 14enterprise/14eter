const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY ?? "";
const PAYSTACK_PUBLIC_KEY = process.env.PAYSTACK_PUBLIC_KEY ?? "";

export const PAYSTACK_PLANS = {
  monthly: { amount: 300000, name: "Monthly", interval: "monthly" as const, label: "₦3,000/month" },
  sixMonths: { amount: 1800000, name: "6 Months", interval: "monthly" as const, label: "₦18,000/6 months" },
  yearly: { amount: 3000000, name: "Yearly", interval: "annually" as const, label: "₦30,000/year" },
} as const;

export type PlanKey = keyof typeof PAYSTACK_PLANS;

export function paystackConfigured(): boolean {
  return PAYSTACK_SECRET_KEY.startsWith("sk_") && PAYSTACK_SECRET_KEY.length > 20;
}

export async function createPaystackCustomer(email: string, name: string) {
  if (!paystackConfigured()) {
    throw new Error("Paystack is not configured");
  }

  const res = await fetch("https://api.paystack.co/customer", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, first_name: name.split(" ")[0], last_name: name.split(" ").slice(1).join(" ") || "" }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Paystack customer creation failed: ${res.status} ${detail}`);
  }

  return (await res.json()) as { data: { customer_code: string; id: number } };
}

export async function createPaystackPlan(planKey: PlanKey) {
  if (!paystackConfigured()) {
    throw new Error("Paystack is not configured");
  }

  const plan = PAYSTACK_PLANS[planKey];
  const res = await fetch("https://api.paystack.co/plan", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: `AI App Factory - ${plan.name}`,
      amount: plan.amount,
      interval: plan.interval,
      currency: "NGN",
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Paystack plan creation failed: ${res.status} ${detail}`);
  }

  return (await res.json()) as { data: { plan_code: string } };
}

export async function initializeTransaction(
  email: string,
  amount: number,
  reference: string,
  callbackUrl: string,
  metadata?: Record<string, unknown>
) {
  if (!paystackConfigured()) {
    throw new Error("Paystack is not configured");
  }

  const res = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      amount,
      reference,
      callback_url: callbackUrl,
      metadata,
      currency: "NGN",
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Paystack transaction initialization failed: ${res.status} ${detail}`);
  }

  return (await res.json()) as { data: { authorization_url: string; access_code: string; reference: string } };
}

export async function verifyTransaction(reference: string) {
  if (!paystackConfigured()) {
    throw new Error("Paystack is not configured");
  }

  const res = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
    },
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Paystack transaction verification failed: ${res.status} ${detail}`);
  }

  return (await res.json()) as { data: { status: string; amount: number; customer: { customer_code: string; email: string }; plan?: { plan_code: string }; paid_at: string } };
}

export async function createSubscription(customerCode: string, planCode: string) {
  if (!paystackConfigured()) {
    throw new Error("Paystack is not configured");
  }

  const res = await fetch("https://api.paystack.co/subscription", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      customer: customerCode,
      plan: planCode,
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Paystack subscription creation failed: ${res.status} ${detail}`);
  }

  return (await res.json()) as { data: { subscription_code: string; email_token: string } };
}

export function getPublicKey(): string {
  return PAYSTACK_PUBLIC_KEY;
}