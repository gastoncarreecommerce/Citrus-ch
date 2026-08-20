import type { DefaultSession } from "next-auth";
import type { Rol } from "@prisma/client";

declare module "next-auth" {
  interface User {
    rol: Rol;
    sellerId: string | null;
  }

  interface Session {
    user: {
      id: string;
      rol: Rol;
      sellerId: string | null;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    rol: Rol;
    sellerId: string | null;
  }
}
