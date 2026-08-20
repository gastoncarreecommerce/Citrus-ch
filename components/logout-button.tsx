import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  return (
    <form method="post" action="/api/logout">
      <Button variant="outline" size="sm" type="submit" className="gap-1.5">
        <LogOut className="h-3.5 w-3.5" />
        Cerrar sesión
      </Button>
    </form>
  );
}
