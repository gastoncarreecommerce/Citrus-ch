"use client";

import { useFormState, useFormStatus } from "react-dom";
import type { Espacio } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import type { EspacioFormState } from "./actions";

const initialState: EspacioFormState = {};

function toDatetimeLocal(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`;
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Guardando..." : label}
    </Button>
  );
}

export function EspacioForm({
  action,
  espacio,
  submitLabel,
}: {
  action: (state: EspacioFormState, formData: FormData) => Promise<EspacioFormState>;
  espacio?: Espacio;
  submitLabel: string;
}) {
  const [state, formAction] = useFormState(action, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="nombre">Nombre</Label>
        <Input
          id="nombre"
          name="nombre"
          required
          defaultValue={espacio?.nombre}
          placeholder="Ej: Home banner destacado"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="descripcion">Descripción</Label>
        <Textarea
          id="descripcion"
          name="descripcion"
          defaultValue={espacio?.descripcion ?? ""}
          placeholder="Detalle visible para el equipo interno"
        />
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="canal">Canal</Label>
          <Select id="canal" name="canal" defaultValue={espacio?.canal ?? "SITE"} required>
            <option value="SITE">Site</option>
            <option value="APP">App</option>
            <option value="MAILING">Mailing</option>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="estado">Estado</Label>
          <Select id="estado" name="estado" defaultValue={espacio?.estado ?? "BORRADOR"} required>
            <option value="BORRADOR">Borrador</option>
            <option value="ABIERTO">Abierto</option>
            <option value="CERRADO">Cerrado</option>
            <option value="ARCHIVADO">Archivado</option>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="fechaApertura">Fecha de apertura</Label>
          <Input
            id="fechaApertura"
            name="fechaApertura"
            type="datetime-local"
            required
            defaultValue={espacio ? toDatetimeLocal(espacio.fechaApertura) : undefined}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="fechaCierre">Fecha de cierre</Label>
          <Input
            id="fechaCierre"
            name="fechaCierre"
            type="datetime-local"
            required
            defaultValue={espacio ? toDatetimeLocal(espacio.fechaCierre) : undefined}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="cupoMax">Cupo máximo</Label>
          <Input
            id="cupoMax"
            name="cupoMax"
            type="number"
            min={1}
            required
            defaultValue={espacio?.cupoMax ?? 1}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="descuentoMinimo">Descuento mínimo (%)</Label>
          <Input
            id="descuentoMinimo"
            name="descuentoMinimo"
            type="number"
            min={0}
            max={100}
            step="0.1"
            placeholder="Opcional"
            defaultValue={espacio?.descuentoMinimo ?? undefined}
          />
        </div>

        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <Label htmlFor="criterioRanking">Criterio de ranking</Label>
          <Select
            id="criterioRanking"
            name="criterioRanking"
            defaultValue={espacio?.criterioRanking ?? "DESCUENTO"}
            required
          >
            <option value="DESCUENTO">% de descuento</option>
            <option value="SCORE_COMPUESTO">Score compuesto (fase 2)</option>
          </Select>
        </div>
      </div>

      <label className="flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2.5">
        <Checkbox
          id="bonificado"
          name="bonificado"
          defaultChecked={espacio?.bonificado}
        />
        <span className="text-sm font-medium text-amber-900">
          Espacio bonificado — se destaca con máxima visibilidad para los sellers
        </span>
      </label>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <div className="flex justify-end gap-2">
        <SubmitButton label={submitLabel} />
      </div>
    </form>
  );
}
