"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const itemSchema = z
  .object({
    sku: z.string().min(1),
    nombreProducto: z.string().min(1),
    precioTachado: z.coerce.number().positive("El precio tachado debe ser mayor a 0"),
    precioOferta: z.coerce.number().positive("El precio oferta debe ser mayor a 0"),
    cuotas: z.coerce.number().int().min(1),
    envioGratis: z.boolean(),
    stockDisponible: z.coerce.number().int().min(0),
  })
  .refine((d) => d.precioOferta < d.precioTachado, {
    message: `El precio oferta debe ser menor al precio tachado`,
    path: ["precioOferta"],
  })
  .refine((d) => d.stockDisponible > 0, {
    message: "No se puede incluir un SKU sin stock",
    path: ["stockDisponible"],
  });

export type PropuestaItemInput = z.input<typeof itemSchema>;

export type SavePropuestaResult = { error?: string } | { ok: true };

async function requireSellerSession(espacioId: string) {
  const session = await auth();
  if (session?.user.rol !== "SELLER" || !session.user.sellerId) {
    throw new Error("No autorizado");
  }

  const espacio = await prisma.espacio.findUnique({ where: { id: espacioId } });
  if (!espacio) {
    throw new Error("El espacio no existe");
  }

  return { sellerId: session.user.sellerId, espacio };
}

async function persistPropuesta(
  espacioId: string,
  sellerId: string,
  items: PropuestaItemInput[],
  estadoDestino: "BORRADOR" | "ENVIADA",
): Promise<SavePropuestaResult> {
  const parsedItems = [];
  for (const raw of items) {
    const parsed = itemSchema.safeParse(raw);
    if (!parsed.success) {
      return { error: `${raw.nombreProducto || raw.sku}: ${parsed.error.issues[0]?.message}` };
    }
    parsedItems.push(parsed.data);
  }

  if (parsedItems.length === 0) {
    return { error: "Agregá al menos un SKU a la propuesta" };
  }

  const existing = await prisma.propuesta.findFirst({
    where: { espacioId, sellerId },
  });

  const yaEstabaEnviada = existing?.estado === "ENVIADA";
  const nuevaVersion = yaEstabaEnviada && estadoDestino === "ENVIADA" ? existing!.version + 1 : (existing?.version ?? 1);

  const propuestaId = existing
    ? (
        await prisma.propuesta.update({
          where: { id: existing.id },
          data: { estado: estadoDestino, version: nuevaVersion },
        })
      ).id
    : (
        await prisma.propuesta.create({
          data: { espacioId, sellerId, estado: estadoDestino, version: 1 },
        })
      ).id;

  await prisma.propuestaItem.deleteMany({ where: { propuestaId } });
  await prisma.propuestaItem.createMany({
    data: parsedItems.map((item) => ({
      propuestaId,
      sku: item.sku,
      nombreProducto: item.nombreProducto,
      precioTachado: item.precioTachado,
      precioOferta: item.precioOferta,
      cuotas: item.cuotas,
      envioGratis: item.envioGratis,
      stockDisponible: item.stockDisponible,
    })),
  });

  revalidatePath(`/espacios/${espacioId}`);
  revalidatePath("/mis-propuestas");
  return { ok: true };
}

export async function guardarBorradorAction(
  espacioId: string,
  items: PropuestaItemInput[],
): Promise<SavePropuestaResult> {
  const { sellerId } = await requireSellerSession(espacioId);
  return persistPropuesta(espacioId, sellerId, items, "BORRADOR");
}

export async function enviarPropuestaAction(
  espacioId: string,
  items: PropuestaItemInput[],
): Promise<SavePropuestaResult> {
  const { sellerId, espacio } = await requireSellerSession(espacioId);
  if (espacio.estado !== "ABIERTO") {
    return { error: "Este espacio ya no está abierto para recibir propuestas" };
  }
  return persistPropuesta(espacioId, sellerId, items, "ENVIADA");
}
