import "server-only";
import { cookies } from "next/headers";
import { USER_COOKIE, verifyUserToken } from "@/lib/user-auth";
import { PARTNER_COOKIE, verifyPartnerToken } from "@/lib/partner-token";
import { findUserByEmail } from "@/lib/users-db";

export type SessionInfo =
  | { loggedIn: true; model: "diy" | "partner"; name: string; dashboard: string }
  | { loggedIn: false };

export async function currentSession(): Promise<SessionInfo> {
  const store = await cookies();

  const userToken = store.get(USER_COOKIE)?.value ?? null;
  if (userToken) {
    const session = await verifyUserToken(userToken);
    if (session) {
      const user = await findUserByEmail(session.email);
      if (user) {
        return {
          loggedIn: true,
          model: "diy",
          name: user.name,
          dashboard: "/user-dashboard",
        };
      }
    }
  }

  const partnerToken = store.get(PARTNER_COOKIE)?.value ?? null;
  if (partnerToken) {
    const session = await verifyPartnerToken(partnerToken);
    if (session) {
      const user = await findUserByEmail(session.email);
      if (user) {
        return {
          loggedIn: true,
          model: "partner",
          name: user.name,
          dashboard: "/dashboard",
        };
      }
    }
  }

  return { loggedIn: false };
}