import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EspacioForm } from "../espacio-form";
import { updateEspacioAction } from "../actions";
import { DeleteEspacioButton } from "./delete-button";

export default async function EditarEspacioPage({ params }: { params: { id: string } }) {
  const espacio = await prisma.espacio.findUnique({ where: { id: params.id } });

  if (!espacio) {
    notFound();
  }

  const boundUpdateAction = updateEspacioAction.bind(null, espacio.id);

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
          <CardTitle className="text-base">Propuestas recibidas</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-slate-500">
          El ranking de propuestas para este espacio se habilita cuando esté listo el flujo de
          armado de propuestas (siguiente bloque del MVP).
        </CardContent>
      </Card>
    </main>
  );
}
