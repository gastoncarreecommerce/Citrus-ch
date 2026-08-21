import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const cookieStore = cookies();

  for (const cookie of cookieStore.getAll()) {
    if (
      cookie.name.toLowerCase().includes("authjs") ||
      cookie.name.toLowerCase().includes("next-auth")
    ) {
      // Los navegadores exigen el flag `Secure` en CUALQUIER Set-Cookie
      // para un nombre con prefijo __Secure-/__Host- (el que usa NextAuth
      // en producción sobre HTTPS) -- sin eso, el navegador ignora el
      // borrado en silencio y la cookie de sesión queda viva. Por eso
      // andaba en local (HTTP, sin prefijo) pero no en producción.
      cookieStore.set(cookie.name, "", {
        path: "/",
        expires: new Date(0),
        secure: true,
        httpOnly: true,
        sameSite: "lax",
      });
    }
  }

  // 303: le dice al navegador que la request de seguimiento sea GET, sin
  // importar que esta fue un POST.
  return NextResponse.redirect(new URL("/login", request.url), 303);
}
