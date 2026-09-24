import { NextResponse } from "next/server";
import { findUserByAppSlug } from "@/lib/users-db";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const user = await findUserByAppSlug(slug);
  if (!user || !user.appHtml) {
    return new Response("App not found", { status: 404 });
  }
  return new NextResponse(user.appHtml, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Robots-Tag": "index, follow",
    },
  });
}