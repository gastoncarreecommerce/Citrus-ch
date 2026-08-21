"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { setPropuestaEstadoAction } from "../actions";

export function RankingActions({ propuestaId }: { propuestaId: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function run(estado: "GANADORA" | "RECHAZADA" | "ENVIADA") {
    startTransition(async () => {
      await setPropuestaEstadoAction(propuestaId, estado);
      router.refresh();
    });
  }

  return (
    <div className="flex justify-end gap-1">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        disabled={isPending}
        className="text-emerald-700 hover:bg-emerald-50"
        onClick={() => run("GANADORA")}
      >
        Marcar ganadora
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        disabled={isPending}
        className="text-red-600 hover:bg-red-50"
        onClick={() => run("RECHAZADA")}
      >
        Rechazar
      </Button>
    </div>
  );
}
