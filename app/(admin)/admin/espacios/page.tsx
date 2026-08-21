import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Boxes, Plus } from "lucide-react";
import { CanalBadge, EstadoBadge, BonificadoBadge } from "@/components/espacio-badges";
import { EspacioImage } from "@/components/espacio-image";
import { EstadoQuickAction } from "./estado-actions";

const dateFormatter = new Intl.DateTimeFormat("es-AR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export default async function AdminEspaciosPage() {
  const espacios = await prisma.espacio.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { propuestas: true } } },
  });

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Espacios comerciales</h1>
          <p className="mt-1 text-sm text-slate-500">
            Alta, edición y seguimiento de los espacios disponibles para sellers.
          </p>
        </div>
        <Button asChild className="gap-1.5">
          <Link href="/admin/espacios/nuevo">
            <Plus className="h-4 w-4" />
            Nuevo espacio
          </Link>
        </Button>
      </div>

      {espacios.length === 0 ? (
        <Card>
          <CardHeader className="items-center text-center">
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600">
              <Boxes className="h-6 w-6" />
            </div>
            <CardTitle>Todavía no creaste ningún espacio</CardTitle>
          </CardHeader>
          <CardContent className="text-center text-sm text-slate-500">
            Creá el primero para que los sellers puedan empezar a mandar propuestas.
          </CardContent>
        </Card>
      ) : (
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Espacio</th>
                  <th className="px-4 py-3 font-medium">Canal</th>
                  <th className="px-4 py-3 font-medium">Estado</th>
                  <th className="px-4 py-3 font-medium">Cierre</th>
                  <th className="px-4 py-3 font-medium">Propuestas</th>
                  <th className="px-4 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {espacios.map((espacio) => (
                  <tr key={espacio.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/espacios/${espacio.id}`}
                        className="flex items-center gap-3"
                      >
                        <div className="h-10 w-14 shrink-0 overflow-hidden rounded bg-slate-100">
                          <EspacioImage
                            src={espacio.imagenUrl}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div>
                          <span className="font-medium text-slate-900 hover:text-blue-600">
                            {espacio.nombre}
                          </span>
                          {espacio.bonificado && (
                            <div className="mt-1">
                              <BonificadoBadge />
                            </div>
                          )}
                        </div>
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <CanalBadge canal={espacio.canal} />
                    </td>
                    <td className="px-4 py-3">
                      <EstadoBadge estado={espacio.estado} />
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {dateFormatter.format(espacio.fechaCierre)}
                    </td>
                    <td className="px-4 py-3 text-slate-500">{espacio._count.propuestas}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <EstadoQuickAction espacioId={espacio.id} estado={espacio.estado} />
                        <Button asChild variant="ghost" size="sm">
                          <Link href={`/admin/espacios/${espacio.id}`}>Editar</Link>
                        </Button>
                      </div>
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
