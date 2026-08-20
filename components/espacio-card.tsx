import type { Espacio } from "@prisma/client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CanalBadge, BonificadoBadge } from "@/components/espacio-badges";
import { Clock } from "lucide-react";

function tiempoRestante(fechaCierre: Date) {
  const ms = fechaCierre.getTime() - Date.now();
  if (ms <= 0) return "Cierra en breve";
  const horas = Math.floor(ms / (1000 * 60 * 60));
  if (horas < 24) return `Cierra en ${horas}h`;
  const dias = Math.floor(horas / 24);
  return `Cierra en ${dias}d`;
}

export function EspacioCard({ espacio }: { espacio: Espacio }) {
  return (
    <Card
      className={
        espacio.bonificado
          ? "border-2 border-amber-400 shadow-md"
          : ""
      }
    >
      <CardHeader className="gap-2 pb-3">
        {espacio.bonificado && <BonificadoBadge />}
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-base font-semibold text-slate-900">{espacio.nombre}</h3>
          <CanalBadge canal={espacio.canal} />
        </div>
      </CardHeader>
      <CardContent className="flex items-center justify-between pt-0">
        {espacio.descripcion ? (
          <p className="line-clamp-2 text-sm text-slate-500">{espacio.descripcion}</p>
        ) : (
          <span />
        )}
        <div className="flex shrink-0 items-center gap-1 text-xs font-medium text-slate-500">
          <Clock className="h-3.5 w-3.5" />
          {tiempoRestante(espacio.fechaCierre)}
        </div>
      </CardContent>
    </Card>
  );
}
