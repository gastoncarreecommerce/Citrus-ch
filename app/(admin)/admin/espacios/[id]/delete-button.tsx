"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteEspacioAction } from "../actions";

export function DeleteEspacioButton({ espacioId }: { espacioId: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={isPending}
      className="gap-1.5 text-red-600 hover:bg-red-50"
      onClick={() => {
        if (!confirm("¿Eliminar este espacio? Esta acción no se puede deshacer.")) return;
        startTransition(async () => {
          try {
            await deleteEspacioAction(espacioId);
            router.push("/admin/espacios");
          } catch (err) {
            alert(err instanceof Error ? err.message : "No se pudo eliminar el espacio");
          }
        });
      }}
    >
      <Trash2 className="h-3.5 w-3.5" />
      {isPending ? "Eliminando..." : "Eliminar"}
    </Button>
  );
}
