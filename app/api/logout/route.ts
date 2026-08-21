import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const cookieStore = cookies();

  for (const cookie of cookieStore.getAll()) {
    if (cookie.name.toLowerCase().includes("authjs") || cookie.name.toLowerCase().includes("next-auth")) {
      cookieStore.delete(cookie.name);
    }
  }

  // 303: le dice al navegador que la request de seguimiento sea GET, sin
  // importar que esta fue un POST. Con el 307 por defecto de
  // NextResponse.redirect, el navegador reintentaba un POST a /login (que
  // solo responde GET) y la cookie se borraba pero la pantalla quedaba rota.
  return NextResponse.redirect(new URL("/login", request.url), 303);
}
