import type { PropuestaEstado } from "@prisma/client";
import { Badge } from "@/components/ui/badge";

const ESTADO_LABEL: Record<PropuestaEstado, string> = {
  BORRADOR: "Borrador",
  ENVIADA: "Enviada",
  GANADORA: "Ganadora",
  RECHAZADA: "Rechazada",
  VENCIDA: "Vencida",
};

const ESTADO_VARIANT: Record<
  PropuestaEstado,
  "secondary" | "success" | "outline" | "destructive" | "gold"
> = {
  BORRADOR: "secondary",
  ENVIADA: "outline",
  GANADORA: "gold",
  RECHAZADA: "destructive",
  VENCIDA: "secondary",
};

export function PropuestaEstadoBadge({ estado }: { estado: PropuestaEstado }) {
  return <Badge variant={ESTADO_VARIANT[estado]}>{ESTADO_LABEL[estado]}</Badge>;
}
