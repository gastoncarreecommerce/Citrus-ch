"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Espacio, PropuestaItem } from "@prisma/client";
import type { SurtidoItem } from "@/lib/vtex";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { guardarBorradorAction, enviarPropuestaAction, type PropuestaItemInput } from "./actions";

interface Row {
  sku: string;
  nombreProducto: string;
  stock: number;
  precioTachado: string;
  precioOferta: string;
  cuotas: string;
  envioGratis: boolean;
  incluido: boolean;
}

function buildInitialRows(surtido: SurtidoItem[], itemsExistentes: PropuestaItem[]): Row[] {
  const existentesPorSku = new Map(itemsExistentes.map((item) => [item.sku, item]));

  return surtido.map((s) => {
    const existente = existentesPorSku.get(s.sku);
    return {
      sku: s.sku,
      nombreProducto: s.nombreProducto,
      stock: s.stock,
      precioTachado: String(existente?.precioTachado ?? (s.precioLista || s.precioOferta)),
      precioOferta: String(existente?.precioOferta ?? s.precioOferta),
      cuotas: String(existente?.cuotas ?? 1),
      envioGratis: existente?.envioGratis ?? false,
      incluido: Boolean(existente),
    };
  });
}

function descuentoPct(precioTachado: string, precioOferta: string): number | null {
  const tachado = Number(precioTachado);
  const oferta = Number(precioOferta);
  if (!tachado || !oferta || tachado <= 0) return null;
  return ((tachado - oferta) / tachado) * 100;
}

export function PropuestaForm({
  espacio,
  surtido,
  itemsExistentes,
  yaEnviada,
}: {
  espacio: Espacio;
  surtido: SurtidoItem[];
  itemsExistentes: PropuestaItem[];
  yaEnviada: boolean;
}) {
  const router = useRouter();
  const [rows, setRows] = useState<Row[]>(() => buildInitialRows(surtido, itemsExistentes));
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const incluidos = useMemo(() => rows.filter((r) => r.incluido), [rows]);

  function updateRow(sku: string, patch: Partial<Row>) {
    setRows((prev) => prev.map((r) => (r.sku === sku ? { ...r, ...patch } : r)));
  }

  function buildPayload(): PropuestaItemInput[] {
    return incluidos.map((r) => ({
      sku: r.sku,
      nombreProducto: r.nombreProducto,
      precioTachado: Number(r.precioTachado),
      precioOferta: Number(r.precioOferta),
      cuotas: Number(r.cuotas),
      envioGratis: r.envioGratis,
      stockDisponible: r.stock,
    }));
  }

  function submit(kind: "borrador" | "enviar") {
    setError(null);
    startTransition(async () => {
      const action = kind === "borrador" ? guardarBorradorAction : enviarPropuestaAction;
      const result = await action(espacio.id, buildPayload());
      if ("error" in result && result.error) {
        setError(result.error);
        return;
      }
      router.push("/mis-propuestas");
    });
  }

  if (surtido.length === 0) {
    return (
      <p className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        No encontramos surtido activo para tu cuenta en VTEX. Verificá que tengas productos
        publicados o contactá al equipo de Carrefour.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="w-10 px-3 py-2.5"></th>
              <th className="px-3 py-2.5 font-medium">Producto</th>
              <th className="px-3 py-2.5 font-medium">Stock</th>
              <th className="px-3 py-2.5 font-medium">Precio tachado</th>
              <th className="px-3 py-2.5 font-medium">Precio oferta</th>
              <th className="px-3 py-2.5 font-medium">Desc. %</th>
              <th className="px-3 py-2.5 font-medium">Cuotas</th>
              <th className="px-3 py-2.5 font-medium">Envío gratis</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row) => {
              const desc = descuentoPct(row.precioTachado, row.precioOferta);
              const precioInvalido = row.incluido && Number(row.precioOferta) >= Number(row.precioTachado);
              const bajoMinimo =
                row.incluido &&
                espacio.descuentoMinimo != null &&
                desc !== null &&
                desc < espacio.descuentoMinimo;
              const sinStock = row.stock <= 0;

              return (
                <tr
                  key={row.sku}
                  className={cn(
                    row.incluido && "bg-blue-50/40",
                    (precioInvalido || bajoMinimo) && "bg-red-50",
                  )}
                >
                  <td className="px-3 py-2">
                    <Checkbox
                      checked={row.incluido}
                      disabled={sinStock}
                      onCheckedChange={(checked) => updateRow(row.sku, { incluido: checked === true })}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <p className="font-medium text-slate-900">{row.nombreProducto}</p>
                    <p className="text-xs text-slate-400">SKU {row.sku}</p>
                  </td>
                  <td className={cn("px-3 py-2", sinStock && "text-red-600")}>
                    {row.stock}
                    {sinStock && <p className="text-xs">Sin stock</p>}
                  </td>
                  <td className="px-3 py-2">
                    <Input
                      type="number"
                      min={0}
                      step="0.01"
                      className="h-9 w-28"
                      value={row.precioTachado}
                      onChange={(e) => updateRow(row.sku, { precioTachado: e.target.value })}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <Input
                      type="number"
                      min={0}
                      step="0.01"
                      className={cn("h-9 w-28", precioInvalido && "border-red-400")}
                      value={row.precioOferta}
                      onChange={(e) => updateRow(row.sku, { precioOferta: e.target.value })}
                    />
                  </td>
                  <td className="px-3 py-2">
                    {desc !== null ? (
                      <Badge variant={bajoMinimo ? "destructive" : "secondary"}>
                        {desc.toFixed(0)}%
                      </Badge>
                    ) : (
                      "—"
                    )}
                    {bajoMinimo && (
                      <p className="mt-1 text-xs text-red-600">
                        Mínimo requerido: {espacio.descuentoMinimo}%
                      </p>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <Input
                      type="number"
                      min={1}
                      className="h-9 w-20"
                      value={row.cuotas}
                      onChange={(e) => updateRow(row.sku, { cuotas: e.target.value })}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <Checkbox
                      checked={row.envioGratis}
                      onCheckedChange={(checked) =>
                        updateRow(row.sku, { envioGratis: checked === true })
                      }
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="text-sm text-slate-500">
        {incluidos.length} SKU{incluidos.length === 1 ? "" : "s"} seleccionado
        {incluidos.length === 1 ? "" : "s"} para esta propuesta.
      </p>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex justify-end gap-2">
        <Button variant="outline" disabled={isPending} onClick={() => submit("borrador")}>
          Guardar borrador
        </Button>
        <Button disabled={isPending} onClick={() => submit("enviar")}>
          {isPending ? "Guardando..." : yaEnviada ? "Mejorar oferta" : "Enviar propuesta"}
        </Button>
      </div>
    </div>
  );
}
