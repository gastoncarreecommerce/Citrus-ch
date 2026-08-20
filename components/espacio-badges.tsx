import type { Canal, EspacioEstado } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";

const CANAL_LABEL: Record<Canal, string> = {
  SITE: "Site",
  APP: "App",
  MAILING: "Mailing",
};

export function CanalBadge({ canal }: { canal: Canal }) {
  return <Badge variant="outline">{CANAL_LABEL[canal]}</Badge>;
}

const ESTADO_LABEL: Record<EspacioEstado, string> = {
  BORRADOR: "Borrador",
  ABIERTO: "Abierto",
  CERRADO: "Cerrado",
  ARCHIVADO: "Archivado",
};

const ESTADO_VARIANT: Record<EspacioEstado, "secondary" | "success" | "outline"> = {
  BORRADOR: "secondary",
  ABIERTO: "success",
  CERRADO: "outline",
  ARCHIVADO: "outline",
};

export function EstadoBadge({ estado }: { estado: EspacioEstado }) {
  return <Badge variant={ESTADO_VARIANT[estado]}>{ESTADO_LABEL[estado]}</Badge>;
}

export function BonificadoBadge() {
  return (
    <Badge variant="gold" className="gap-1">
      <Sparkles className="h-3 w-3" />
      BONIFICADO
    </Badge>
  );
}
