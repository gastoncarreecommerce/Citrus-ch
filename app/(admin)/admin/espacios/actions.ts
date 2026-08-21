"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await auth();
  if (session?.user.rol !== "ADMIN") {
    throw new Error("No autorizado");
  }
}

const espacioSchema = z
  .object({
    nombre: z.string().trim().min(1, "El nombre es obligatorio"),
    descripcion: z
      .string()
      .trim()
      .optional()
      .transform((v) => (v ? v : undefined)),
    imagenUrl: z
      .string()
      .trim()
      .optional()
      .transform((v) => (v ? v : undefined))
      .refine((v) => v === undefined || z.string().url().safeParse(v).success, {
        message: "La imagen debe ser una URL válida",
      }),
    canal: z.enum(["SITE", "APP", "MAILING"]),
    bonificado: z.coerce.boolean(),
    descuentoMinimo: z
      .string()
      .optional()
      .transform((v) => (v ? Number(v) : undefined))
      .refine((v) => v === undefined || (v >= 0 && v <= 100), {
        message: "El descuento mínimo debe estar entre 0 y 100",
      }),
    cupoMax: z.coerce.number().int().min(1, "El cupo debe ser al menos 1"),
    fechaApertura: z.string().min(1, "La fecha de apertura es obligatoria"),
    fechaCierre: z.string().min(1, "La fecha de cierre es obligatoria"),
    estado: z.enum(["BORRADOR", "ABIERTO", "CERRADO", "ARCHIVADO"]),
    criterioRanking: z.enum(["DESCUENTO", "SCORE_COMPUESTO"]),
  })
  .refine((data) => new Date(data.fechaCierre) > new Date(data.fechaApertura), {
    message: "La fecha de cierre debe ser posterior a la de apertura",
    path: ["fechaCierre"],
  });

export type EspacioFormState = {
  error?: string;
};

function parseEspacioForm(formData: FormData) {
  return espacioSchema.safeParse({
    nombre: formData.get("nombre"),
    descripcion: formData.get("descripcion"),
    imagenUrl: formData.get("imagenUrl"),
    canal: formData.get("canal"),
    bonificado: formData.get("bonificado") === "on" || formData.get("bonificado") === "true",
    descuentoMinimo: formData.get("descuentoMinimo") || undefined,
    cupoMax: formData.get("cupoMax"),
    fechaApertura: formData.get("fechaApertura"),
    fechaCierre: formData.get("fechaCierre"),
    estado: formData.get("estado"),
    criterioRanking: formData.get("criterioRanking"),
  });
}

export async function createEspacioAction(
  _prevState: EspacioFormState,
  formData: FormData,
): Promise<EspacioFormState> {
  await requireAdmin();

  const parsed = parseEspacioForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const { data } = parsed;
  await prisma.espacio.create({
    data: {
      nombre: data.nombre,
      descripcion: data.descripcion,
      imagenUrl: data.imagenUrl,
      canal: data.canal,
      bonificado: data.bonificado,
      descuentoMinimo: data.descuentoMinimo,
      cupoMax: data.cupoMax,
      fechaApertura: new Date(data.fechaApertura),
      fechaCierre: new Date(data.fechaCierre),
      estado: data.estado,
      criterioRanking: data.criterioRanking,
    },
  });

  revalidatePath("/admin/espacios");
  redirect("/admin/espacios");
}

export async function updateEspacioAction(
  espacioId: string,
  _prevState: EspacioFormState,
  formData: FormData,
): Promise<EspacioFormState> {
  await requireAdmin();

  const parsed = parseEspacioForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const { data } = parsed;
  await prisma.espacio.update({
    where: { id: espacioId },
    data: {
      nombre: data.nombre,
      descripcion: data.descripcion,
      imagenUrl: data.imagenUrl,
      canal: data.canal,
      bonificado: data.bonificado,
      descuentoMinimo: data.descuentoMinimo,
      cupoMax: data.cupoMax,
      fechaApertura: new Date(data.fechaApertura),
      fechaCierre: new Date(data.fechaCierre),
      estado: data.estado,
      criterioRanking: data.criterioRanking,
    },
  });

  revalidatePath("/admin/espacios");
  revalidatePath(`/admin/espacios/${espacioId}`);
  redirect("/admin/espacios");
}

export async function setEspacioEstadoAction(espacioId: string, estado: string) {
  await requireAdmin();
  const parsedEstado = z.enum(["BORRADOR", "ABIERTO", "CERRADO", "ARCHIVADO"]).parse(estado);

  await prisma.espacio.update({
    where: { id: espacioId },
    data: { estado: parsedEstado },
  });

  revalidatePath("/admin/espacios");
  revalidatePath(`/admin/espacios/${espacioId}`);
}

export async function setPropuestaEstadoAction(
  propuestaId: string,
  estado: "GANADORA" | "RECHAZADA" | "ENVIADA",
) {
  await requireAdmin();
  const propuesta = await prisma.propuesta.update({
    where: { id: propuestaId },
    data: { estado },
  });

  revalidatePath(`/admin/espacios/${propuesta.espacioId}`);
}

export async function deleteEspacioAction(espacioId: string) {
  await requireAdmin();

  try {
    await prisma.espacio.delete({ where: { id: espacioId } });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2003") {
      throw new Error(
        "No se puede eliminar: el espacio tiene propuestas asociadas. Archivalo en su lugar.",
      );
    }
    throw err;
  }

  revalidatePath("/admin/espacios");
}
