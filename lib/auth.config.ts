import type { Rol } from "@prisma/client";
import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [],
  callbacks: {
    jwt: ({ token, user }) => {
      if (user) {
        token.rol = user.rol;
        token.sellerId = user.sellerId ?? null;
      }
      return token;
    },
    session: ({ session, token }) => {
      if (session.user) {
        session.user.id = token.sub as string;
        session.user.rol = token.rol as Rol;
        session.user.sellerId = (token.sellerId as string | null) ?? null;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
