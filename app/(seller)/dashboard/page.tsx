import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EspacioCard } from "@/components/espacio-card";
import { LayoutGrid } from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();
  const seller = session?.user.sellerId
    ? await prisma.seller.findUnique({ where: { id: session.user.sellerId } })
    : null;

  const espacios = await prisma.espacio.findMany({
    where: { estado: "ABIERTO" },
    orderBy: [{ bonificado: "desc" }, { fechaCierre: "asc" }],
  });

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-slate-900">
          Espacios comerciales disponibles
        </h1>
        <p className="mt-1 text-sm text-slate-500">{seller?.razonSocial ?? "Seller"}</p>
      </div>

      {espacios.length === 0 ? (
        <Card>
          <CardHeader className="items-center text-center">
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600">
              <LayoutGrid className="h-6 w-6" />
            </div>
            <CardTitle>Todavía no hay espacios cargados</CardTitle>
          </CardHeader>
          <CardContent className="text-center text-sm text-slate-500">
            En cuanto el equipo de Carrefour publique espacios comerciales, los vas a ver acá para
            armar tu propuesta.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {espacios.map((espacio) => (
            <EspacioCard key={espacio.id} espacio={espacio} />
          ))}
        </div>
      )}
    </main>
  );
}
