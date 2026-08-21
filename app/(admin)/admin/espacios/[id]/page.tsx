import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Trophy } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { rankearPropuestas, descuentoPromedio } from "@/lib/ranking";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PropuestaEstadoBadge } from "@/components/propuesta-badges";
import { EspacioForm } from "../espacio-form";
import { updateEspacioAction } from "../actions";
import { DeleteEspacioButton } from "./delete-button";
import { RankingActions } from "./ranking-actions";

export default async function EditarEspacioPage({ params }: { params: { id: string } }) {
  const espacio = await prisma.espacio.findUnique({ where: { id: params.id } });

  if (!espacio) {
    notFound();
  }

  const boundUpdateAction = updateEspacioAction.bind(null, espacio.id);

  const propuestas = await prisma.propuesta.findMany({
    where: { espacioId: espacio.id, estado: { in: ["ENVIADA", "GANADORA", "RECHAZADA"] } },
    include: { items: true, seller: true },
  });

  const enviadas = propuestas.filter((p) => p.estado === "ENVIADA");
  const decididas = propuestas.filter((p) => p.estado !== "ENVIADA");
  const ranking = rankearPropuestas(enviadas, espacio.criterioRanking, espacio.descuentoMinimo);

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <Link
        href="/admin/espacios"
        className="mb-4 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a espacios
      </Link>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Editar espacio</CardTitle>
          <DeleteEspacioButton espacioId={espacio.id} />
        </CardHeader>
        <CardContent>
          <EspacioForm action={boundUpdateAction} espacio={espacio} submitLabel="Guardar cambios" />
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">
            Propuestas recibidas ({propuestas.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {propuestas.length === 0 ? (
            <p className="text-sm text-slate-500">Todavía no llegaron propuestas para este espacio.</p>
          ) : (
            <div className="flex flex-col gap-6">
              {ranking.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                    Ranking (por {espacio.criterioRanking === "DESCUENTO" ? "% descuento" : "score compuesto"})
                  </p>
                  <div className="overflow-x-auto rounded-lg border border-slate-200">
                    <table className="w-full text-left text-sm">
                      <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                        <tr>
                          <th className="w-10 px-3 py-2.5"></th>
                          <th className="px-3 py-2.5 font-medium">Seller</th>
                          <th className="px-3 py-2.5 font-medium">SKUs</th>
                          <th className="px-3 py-2.5 font-medium">Desc. promedio</th>
                          <th className="px-3 py-2.5 font-medium"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {ranking.map((propuesta, index) => (
                          <tr key={propuesta.id} className={index === 0 ? "bg-amber-50/60" : undefined}>
                            <td className="px-3 py-2.5">
                              {index === 0 && propuesta.estado === "ENVIADA" ? (
                                <Trophy className="h-4 w-4 text-amber-500" />
                              ) : (
                                <span className="text-slate-400">{index + 1}</span>
                              )}
                            </td>
                            <td className="px-3 py-2.5 font-medium text-slate-900">
                              {propuesta.seller.razonSocial}
                            </td>
                            <td className="px-3 py-2.5 text-slate-500">{propuesta.items.length}</td>
                            <td className="px-3 py-2.5 text-slate-500">
                              {descuentoPromedio(propuesta.items).toFixed(1)}%
                            </td>
                            <td className="px-3 py-2.5">
                              <RankingActions propuestaId={propuesta.id} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {espacio.descuentoMinimo != null &&
                    enviadas.length > ranking.length && (
                      <p className="mt-2 text-xs text-amber-700">
                        {enviadas.length - ranking.length} propuesta(s) no cumplen el descuento
                        mínimo ({espacio.descuentoMinimo}%) y quedaron fuera del ranking.
                      </p>
                    )}
                </div>
              )}

              {decididas.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                    Decididas
                  </p>
                  <div className="flex flex-col gap-2">
                    {decididas.map((propuesta) => (
                      <div
                        key={propuesta.id}
                        className="flex items-center justify-between rounded-md border border-slate-200 px-3 py-2 text-sm"
                      >
                        <span className="font-medium text-slate-900">
                          {propuesta.seller.razonSocial}
                        </span>
                        <div className="flex items-center gap-3">
                          <span className="text-slate-500">
                            {descuentoPromedio(propuesta.items).toFixed(1)}%
                          </span>
                          <PropuestaEstadoBadge estado={propuesta.estado} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
