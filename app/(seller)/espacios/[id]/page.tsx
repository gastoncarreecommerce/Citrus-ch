import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSellerSurtido } from "@/lib/vtex";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CanalBadge, BonificadoBadge, EstadoBadge } from "@/components/espacio-badges";
import { PropuestaForm } from "./propuesta-form";

const dateFormatter = new Intl.DateTimeFormat("es-AR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export default async function EspacioDetallePage({ params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user.sellerId) notFound();

  const espacio = await prisma.espacio.findUnique({ where: { id: params.id } });
  if (!espacio) notFound();

  const propuestaExistente = await prisma.propuesta.findFirst({
    where: { espacioId: espacio.id, sellerId: session.user.sellerId },
    include: { items: true },
  });

  const seller = await prisma.seller.findUnique({ where: { id: session.user.sellerId } });
  const surtido = seller ? await getSellerSurtido(seller.sellerIdVtex) : [];

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <Link
        href="/dashboard"
        className="mb-4 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver al dashboard
      </Link>

      <Card className="mb-6">
        <CardHeader className="gap-2">
          {espacio.bonificado && <BonificadoBadge />}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle>{espacio.nombre}</CardTitle>
            <div className="flex items-center gap-2">
              <CanalBadge canal={espacio.canal} />
              <EstadoBadge estado={espacio.estado} />
            </div>
          </div>
          {espacio.descripcion && <p className="text-sm text-slate-500">{espacio.descripcion}</p>}
          <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              Cierra: {dateFormatter.format(espacio.fechaCierre)}
            </span>
            {espacio.descuentoMinimo != null && (
              <span>Descuento mínimo requerido: {espacio.descuentoMinimo}%</span>
            )}
            <span>Cupo: {espacio.cupoMax}</span>
          </div>
        </CardHeader>
      </Card>

      {espacio.estado !== "ABIERTO" ? (
        <Card>
          <CardContent className="py-6 text-sm text-slate-500">
            Este espacio no está abierto para recibir propuestas en este momento.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Armá tu propuesta</CardTitle>
          </CardHeader>
          <CardContent>
            <PropuestaForm
              espacio={espacio}
              surtido={surtido}
              itemsExistentes={propuestaExistente?.items ?? []}
              yaEnviada={propuestaExistente?.estado === "ENVIADA"}
            />
          </CardContent>
        </Card>
      )}
    </main>
  );
}
