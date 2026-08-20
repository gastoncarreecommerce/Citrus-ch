import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { LogoutButton } from "@/components/logout-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function DashboardPage() {
  const session = await auth();
  const seller = session?.user.sellerId
    ? await prisma.seller.findUnique({ where: { id: session.user.sellerId } })
    : null;

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Espacios comerciales disponibles</h1>
          <p className="text-sm text-neutral-500">
            {seller?.razonSocial ?? "Seller"} · {session?.user.email}
          </p>
        </div>
        <LogoutButton />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Todavía no hay espacios cargados</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-neutral-500">
          El catálogo de espacios comerciales (CRUD desde el panel admin) se implementa en el
          siguiente bloque del MVP.
        </CardContent>
      </Card>
    </main>
  );
}
