import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const cookieStore = cookies();

  for (const cookie of cookieStore.getAll()) {
    if (cookie.name.toLowerCase().includes("authjs") || cookie.name.toLowerCase().includes("next-auth")) {
      cookieStore.delete(cookie.name);
    }
  }

  return NextResponse.redirect(new URL("/login", request.url));
}
