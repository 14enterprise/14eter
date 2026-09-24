import { NextResponse } from "next/server";
import { currentSession } from "@/lib/auth-session";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json(await currentSession());
}