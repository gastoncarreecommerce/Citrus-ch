"use client";

import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  const [mounted, setMounted] = useState(false);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <Button
      variant="outline"
      size="sm"
      type="button"
      className="gap-1.5"
      disabled={!mounted || pending}
      onClick={() => {
        setPending(true);
        signOut({ callbackUrl: "/login" });
      }}
    >
      <LogOut className="h-3.5 w-3.5" />
      {pending ? "Cerrando..." : "Cerrar sesión"}
    </Button>
  );
}
