import { NextRequest, NextResponse } from "next/server";

// Fetches a cover image server-side so the browser can draw it onto a
// <canvas> without hitting CORS restrictions from arbitrary third-party
// hosts (which is the case for many pasted cover URLs / Open Library / etc).
export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  if (!url) {
    return NextResponse.json({ error: "missing url" }, { status: 400 });
  }

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return NextResponse.json({ error: "invalid url" }, { status: 400 });
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return NextResponse.json({ error: "unsupported protocol" }, { status: 400 });
  }

  let res: Response;
  try {
    res = await fetch(parsed.toString());
  } catch {
    return NextResponse.json({ error: "fetch failed" }, { status: 502 });
  }
  if (!res.ok || !res.body) {
    return NextResponse.json({ error: "upstream error" }, { status: 502 });
  }

  const contentType = res.headers.get("content-type") ?? "image/jpeg";
  if (!contentType.startsWith("image/")) {
    return NextResponse.json({ error: "not an image" }, { status: 415 });
  }

  return new NextResponse(res.body, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=86400",
    },
  });
}
