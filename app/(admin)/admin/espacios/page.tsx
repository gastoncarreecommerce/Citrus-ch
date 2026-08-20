import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Boxes, Plus } from "lucide-react";

export default async function AdminEspaciosPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Espacios comerciales</h1>
          <p className="mt-1 text-sm text-slate-500">
            Alta, edición y seguimiento de los espacios disponibles para sellers.
          </p>
        </div>
        <Button disabled className="gap-1.5">
          <Plus className="h-4 w-4" />
          Nuevo espacio
        </Button>
      </div>

      <Card>
        <CardHeader className="items-center text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600">
            <Boxes className="h-6 w-6" />
          </div>
          <CardTitle>El CRUD de espacios se implementa en el siguiente bloque</CardTitle>
        </CardHeader>
        <CardContent className="text-center text-sm text-slate-500">
          Acá vas a poder crear espacios, marcarlos como bonificados y ver el ranking de
          propuestas recibidas.
        </CardContent>
      </Card>
    </main>
  );
}
