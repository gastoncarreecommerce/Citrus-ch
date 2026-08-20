import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EspacioForm } from "../espacio-form";
import { createEspacioAction } from "../actions";

export default function NuevoEspacioPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <Link
        href="/admin/espacios"
        className="mb-4 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a espacios
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Nuevo espacio comercial</CardTitle>
        </CardHeader>
        <CardContent>
          <EspacioForm action={createEspacioAction} submitLabel="Crear espacio" />
        </CardContent>
      </Card>
    </main>
  );
}
