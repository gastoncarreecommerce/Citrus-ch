import { auth } from "@/lib/auth";
import { LogoutButton } from "@/components/logout-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AdminEspaciosPage() {
  const session = await auth();

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Panel admin · Espacios comerciales</h1>
          <p className="text-sm text-neutral-500">{session?.user.email}</p>
        </div>
        <LogoutButton />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>CRUD de espacios pendiente</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-neutral-500">
          El alta, edición y baja de espacios comerciales se implementa en el siguiente bloque del
          MVP.
        </CardContent>
      </Card>
    </main>
  );
}
