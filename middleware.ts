import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/lib/auth.config";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  const isAdminRoute = pathname.startsWith("/admin");
  const isSellerRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/espacios") ||
    pathname.startsWith("/mis-propuestas");

  if (!session?.user) {
    if (isAdminRoute || isSellerRoute) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  if (isAdminRoute && session.user.rol !== "ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  if (isSellerRoute && session.user.rol !== "SELLER") {
    return NextResponse.redirect(new URL("/admin/espacios", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/dashboard/:path*", "/espacios/:path*", "/mis-propuestas/:path*", "/admin/:path*"],
};
