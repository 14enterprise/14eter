import { NextResponse } from "next/server";
import { findUserByAppSlug } from "@/lib/users-db";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string; pageId: string }> }
) {
  const { slug, pageId } = await params;
  const user = await findUserByAppSlug(slug);
  if (!user) return new Response("Not found", { status: 404 });

  let pagesHtml: Record<string, string> = {};
  try {
    pagesHtml = JSON.parse(user.sitePagesHtml ?? "{}");
  } catch {
    pagesHtml = {};
  }

  const html = pagesHtml[pageId];
  if (!html) return new Response("Page not found", { status: 404 });

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Robots-Tag": "index, follow",
    },
  });
}