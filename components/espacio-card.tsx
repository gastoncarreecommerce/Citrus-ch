import type { Espacio } from "@prisma/client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CanalBadge, BonificadoBadge } from "@/components/espacio-badges";
import { EspacioImage } from "@/components/espacio-image";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

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
      className={cn(
        "overflow-hidden",
        espacio.bonificado && "border-2 border-amber-400 shadow-md",
      )}
    >
      <div className="relative aspect-[16/9] w-full bg-slate-100">
        <EspacioImage
          src={espacio.imagenUrl}
          alt={espacio.nombre}
          className="h-full w-full object-cover"
        />
        {espacio.bonificado && (
          <div className="absolute left-2 top-2">
            <BonificadoBadge />
          </div>
        )}
      </div>

      <CardHeader className="gap-2 pb-3">
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
