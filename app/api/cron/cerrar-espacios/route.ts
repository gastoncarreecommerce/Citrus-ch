import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rankearPropuestas } from "@/lib/ranking";
import { triggerResultadoPropuesta } from "@/lib/sfmc";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const espaciosVencidos = await prisma.espacio.findMany({
    where: { estado: "ABIERTO", fechaCierre: { lt: new Date() } },
  });

  const resumen: { espacioId: string; nombre: string; ganadoras: number; rechazadas: number }[] = [];

  for (const espacio of espaciosVencidos) {
    const propuestas = await prisma.propuesta.findMany({
      where: { espacioId: espacio.id, estado: "ENVIADA" },
      include: { items: true, seller: true },
    });

    const ranking = rankearPropuestas(propuestas, espacio.criterioRanking, espacio.descuentoMinimo);
    const ganadoras = ranking.slice(0, espacio.cupoMax);
    const ganadorasIds = new Set(ganadoras.map((p) => p.id));
    const rechazadas = propuestas.filter((p) => !ganadorasIds.has(p.id));

    await prisma.$transaction([
      ...ganadoras.map((p) =>
        prisma.propuesta.update({ where: { id: p.id }, data: { estado: "GANADORA" } }),
      ),
      ...rechazadas.map((p) =>
        prisma.propuesta.update({ where: { id: p.id }, data: { estado: "RECHAZADA" } }),
      ),
      prisma.espacio.update({ where: { id: espacio.id }, data: { estado: "CERRADO" } }),
    ]);

    for (const p of ganadoras) await triggerResultadoPropuesta(p.id, "GANADORA");
    for (const p of rechazadas) await triggerResultadoPropuesta(p.id, "RECHAZADA");

    resumen.push({
      espacioId: espacio.id,
      nombre: espacio.nombre,
      ganadoras: ganadoras.length,
      rechazadas: rechazadas.length,
    });
  }

  return NextResponse.json({ cerrados: resumen.length, detalle: resumen });
}
