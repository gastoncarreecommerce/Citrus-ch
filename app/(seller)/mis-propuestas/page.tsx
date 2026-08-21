import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { descuentoPromedio } from "@/lib/ranking";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PropuestaEstadoBadge } from "@/components/propuesta-badges";
import { FileText } from "lucide-react";

const dateFormatter = new Intl.DateTimeFormat("es-AR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export default async function MisPropuestasPage() {
  const session = await auth();
  if (!session?.user.sellerId) {
    return null;
  }

  const propuestas = await prisma.propuesta.findMany({
    where: { sellerId: session.user.sellerId },
    include: { espacio: true, items: true },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-slate-900">Mis propuestas</h1>
        <p className="mt-1 text-sm text-slate-500">
          Historial de propuestas enviadas y borradores en curso.
        </p>
      </div>

      {propuestas.length === 0 ? (
        <Card>
          <CardHeader className="items-center text-center">
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600">
              <FileText className="h-6 w-6" />
            </div>
            <CardTitle>Todavía no armaste ninguna propuesta</CardTitle>
          </CardHeader>
          <CardContent className="text-center text-sm text-slate-500">
            Elegí un espacio comercial desde el dashboard para empezar.
          </CardContent>
        </Card>
      ) : (
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Espacio</th>
                  <th className="px-4 py-3 font-medium">Estado</th>
                  <th className="px-4 py-3 font-medium">Versión</th>
                  <th className="px-4 py-3 font-medium">SKUs</th>
                  <th className="px-4 py-3 font-medium">Desc. promedio</th>
                  <th className="px-4 py-3 font-medium">Actualizada</th>
                  <th className="px-4 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {propuestas.map((propuesta) => (
                  <tr key={propuesta.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {propuesta.espacio.nombre}
                    </td>
                    <td className="px-4 py-3">
                      <PropuestaEstadoBadge estado={propuesta.estado} />
                    </td>
                    <td className="px-4 py-3 text-slate-500">v{propuesta.version}</td>
                    <td className="px-4 py-3 text-slate-500">{propuesta.items.length}</td>
                    <td className="px-4 py-3 text-slate-500">
                      {descuentoPromedio(propuesta.items).toFixed(1)}%
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {dateFormatter.format(propuesta.updatedAt)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {propuesta.espacio.estado === "ABIERTO" && (
                        <Button asChild variant="ghost" size="sm">
                          <Link href={`/espacios/${propuesta.espacio.id}`}>
                            {propuesta.estado === "ENVIADA" ? "Mejorar oferta" : "Continuar"}
                          </Link>
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </main>
  );
}
