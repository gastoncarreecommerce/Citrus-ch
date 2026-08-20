"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import type { EspacioEstado } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { setEspacioEstadoAction } from "./actions";

const TRANSICIONES: Partial<Record<EspacioEstado, { label: string; next: EspacioEstado }>> = {
  BORRADOR: { label: "Publicar", next: "ABIERTO" },
  ABIERTO: { label: "Cerrar", next: "CERRADO" },
  CERRADO: { label: "Archivar", next: "ARCHIVADO" },
};

export function EstadoQuickAction({ espacioId, estado }: { espacioId: string; estado: EspacioEstado }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const transicion = TRANSICIONES[estado];

  if (!transicion) return null;

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      disabled={isPending}
      onClick={() => {
        startTransition(async () => {
          await setEspacioEstadoAction(espacioId, transicion.next);
          router.refresh();
        });
      }}
    >
      {isPending ? "..." : transicion.label}
    </Button>
  );
}
