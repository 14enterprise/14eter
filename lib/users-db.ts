import { and, desc, eq, lte } from "drizzle-orm";
import { dbReady, getDb, passwordResets, users } from "./db";

export type UserRecord = typeof users.$inferSelect;

export type NewUser = {
  name: string;
  email: string;
  passwordHash: string;
  company: string;
  projectName: string;
  projectType: string;
  projectDescription: string;
  model: "partner" | "diy";
};

export async function findUserByEmail(email: string): Promise<UserRecord | null> {
  await dbReady();
  const db = getDb();
  const rows = await db
    .select()
    .from(users)
    .where(eq(users.email, email.trim().toLowerCase()));
  return rows[0] ?? null;
}

export async function findUserById(id: number): Promise<UserRecord | null> {
  await dbReady();
  const db = getDb();
  const rows = await db.select().from(users).where(eq(users.id, id));
  return rows[0] ?? null;
}

export async function createUser(user: NewUser): Promise<UserRecord> {
  await dbReady();
  const db = getDb();
  const [created] = await db
    .insert(users)
    .values({
      ...user,
      email: user.email.trim().toLowerCase(),
      status: "approved",
      createdAt: Date.now(),
    })
    .returning();
  return created;
}

export async function findAllUsers(): Promise<UserRecord[]> {
  await dbReady();
  const db = getDb();
  return db.select().from(users).orderBy(desc(users.createdAt));
}

export async function updateUserStatus(id: number, status: string) {
  await dbReady();
  const db = getDb();
  await db.update(users).set({ status }).where(eq(users.id, id));
}

export async function findPartnerUsers(): Promise<UserRecord[]> {
  await dbReady();
  const db = getDb();
  return db.select().from(users).where(eq(users.model, "partner"));
}

export async function findClientUsers(): Promise<UserRecord[]> {
  await dbReady();
  const db = getDb();
  return db.select().from(users).where(eq(users.model, "diy"));
}

export async function setUserPassword(id: number, passwordHash: string) {
  await dbReady();
  const db = getDb();
  await db.update(users).set({ passwordHash }).where(eq(users.id, id));
}

export async function setUserApp(
  id: number,
  appSlug: string,
  appHtml: string
) {
  await dbReady();
  const db = getDb();
  await db.update(users).set({ appSlug, appHtml }).where(eq(users.id, id));
}

export async function setUserSite(
  id: number,
  templateId: string,
  siteContent: string
) {
  await dbReady();
  const db = getDb();
  await db
    .update(users)
    .set({ templateId, siteContent })
    .where(eq(users.id, id));
}

export async function setUserPages(
  id: number,
  sitePages: string,
  sitePagesHtml: string
) {
  await dbReady();
  const db = getDb();
  await db
    .update(users)
    .set({ sitePages, sitePagesHtml })
    .where(eq(users.id, id));
}

export async function deleteUserApp(id: number) {
  await dbReady();
  const db = getDb();
  await db.update(users).set({ appSlug: "", appHtml: "" }).where(eq(users.id, id));
}

export async function deleteUser(id: number) {
  await dbReady();
  const db = getDb();
  await db.delete(users).where(eq(users.id, id));
}

export async function findUserByAppSlug(slug: string): Promise<UserRecord | null> {
  await dbReady();
  const db = getDb();
  const rows = await db
    .select()
    .from(users)
    .where(eq(users.appSlug, slug.trim().toLowerCase()));
  return rows[0] ?? null;
}

export async function setUserSubscription(
  id: number,
  data: {
    status?: string;
    plan?: string;
    expiresAt?: number;
    paystackCustomerId?: string;
    paystackSubscriptionId?: string;
  }
) {
  await dbReady();
  const db = getDb();
  const patch: Partial<typeof users.$inferInsert> = {};
  if (data.status !== undefined) patch.subscriptionStatus = data.status;
  if (data.plan !== undefined) patch.subscriptionPlan = data.plan;
  if (data.expiresAt !== undefined) patch.subscriptionExpiresAt = data.expiresAt;
  if (data.paystackCustomerId !== undefined)
    patch.paystackCustomerId = data.paystackCustomerId;
  if (data.paystackSubscriptionId !== undefined)
    patch.paystackSubscriptionId = data.paystackSubscriptionId;
  if (Object.keys(patch).length === 0) return;
  await db.update(users).set(patch).where(eq(users.id, id));
}

export async function getUserSubscriptionStatus(id: number): Promise<{
  status: string;
  plan: string;
  expiresAt: number;
  isActive: boolean;
}> {
  await dbReady();
  const db = getDb();
  const rows = await db
    .select({
      subscriptionStatus: users.subscriptionStatus,
      subscriptionPlan: users.subscriptionPlan,
      subscriptionExpiresAt: users.subscriptionExpiresAt,
    })
    .from(users)
    .where(eq(users.id, id));
  const user = rows[0];
  if (!user) {
    return { status: "free", plan: "", expiresAt: 0, isActive: false };
  }
  // Lazy expiry: flip overdue "active" rows to "expired" on read so the
  // stored status is always truthful, even without the cron job running.
  if (
    user.subscriptionStatus === "active" &&
    (user.subscriptionExpiresAt ?? 0) <= Date.now()
  ) {
    await db
      .update(users)
      .set({ subscriptionStatus: "expired" })
      .where(eq(users.id, id));
    return {
      status: "expired",
      plan: user.subscriptionPlan ?? "",
      expiresAt: user.subscriptionExpiresAt ?? 0,
      isActive: false,
    };
  }
  const isActive =
    user.subscriptionStatus === "active" && user.subscriptionExpiresAt > Date.now();
  return {
    status: user.subscriptionStatus ?? "free",
    plan: user.subscriptionPlan ?? "",
    expiresAt: user.subscriptionExpiresAt ?? 0,
    isActive,
  };
}

/**
 * Marks every overdue "active" subscription as "expired".
 * Run on a schedule (see /api/cron/expire-subscriptions) so accounts are
 * disabled even when the user never logs in again.
 * Returns the number of accounts expired.
 */
export async function expireOverdueSubscriptions(): Promise<number> {
  await dbReady();
  const db = getDb();
  const overdue = await db
    .select({ id: users.id })
    .from(users)
    .where(
      and(
        eq(users.subscriptionStatus, "active"),
        lte(users.subscriptionExpiresAt, Date.now())
      )
    );
  for (const row of overdue) {
    await db
      .update(users)
      .set({ subscriptionStatus: "expired" })
      .where(eq(users.id, row.id));
  }
  return overdue.length;
}

export async function createPasswordReset({
  email,
  tokenHash,
  expiresAt,
}: {
  email: string;
  tokenHash: string;
  expiresAt: number;
}) {
  await dbReady();
  const db = getDb();
  const cleanEmail = email.trim().toLowerCase();
  await db.delete(passwordResets).where(eq(passwordResets.email, cleanEmail));
  await db.insert(passwordResets).values({
    email: cleanEmail,
    tokenHash,
    expiresAt,
    usedAt: null,
    createdAt: Date.now(),
  });
}

export async function consumePasswordReset(
  tokenHash: string
): Promise<{ email: string; id: number } | null> {
  await dbReady();
  const db = getDb();
  const rows = await db
    .select()
    .from(passwordResets)
    .where(eq(passwordResets.tokenHash, tokenHash));
  if (rows.length === 0) return null;
  const row = rows[0];
  if (row.usedAt != null) return null;
  if (row.expiresAt < Date.now()) return null;
  await db
    .update(passwordResets)
    .set({ usedAt: Date.now() })
    .where(eq(passwordResets.id, row.id));
  return { email: row.email, id: row.id };
}