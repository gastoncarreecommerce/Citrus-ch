/**
 * Cliente de VTEX server-side. Nunca se importa desde un componente cliente:
 * usa VTEX_APP_KEY/VTEX_APP_TOKEN, que son credenciales privadas.
 *
 * Usamos la Search API legacy (`/api/catalog_system/pub/products/search`)
 * con `fq=sellerId:{sellerId}` y no Intelligent Search: en una corrida real
 * contra la cuenta de Carrefour AR, Intelligent Search ignoraba ese filtro
 * y devolvía el top-ventas genérico sin filtrar por seller (confirmado en
 * el pipeline de scripts/fetch-seller-catalog.ts del repo
 * Constructor-de-colecciones). La Search API legacy sí lo soporta.
 *
 * Si no hay credenciales VTEX configuradas todavía, se sirve un catálogo de
 * demo (datos reales de un seller de Carrefour AR, recortado) para poder
 * probar el flujo de propuestas de punta a punta sin esperar el alta VTEX.
 */
import { readFile } from "node:fs/promises";
import path from "node:path";

export interface SurtidoItem {
  sku: string;
  nombreProducto: string;
  precioLista: number;
  precioOferta: number;
  stock: number;
  imageUrl: string;
}

interface VtexConfig {
  accountName: string;
  appKey: string;
  appToken: string;
  salesChannel: string;
}

function loadVtexConfig(): VtexConfig | null {
  const accountName = process.env.VTEX_ACCOUNT_NAME;
  const appKey = process.env.VTEX_APP_KEY;
  const appToken = process.env.VTEX_APP_TOKEN;
  const salesChannel = process.env.VTEX_SALES_CHANNEL || "1";

  if (!accountName || !appKey || !appToken) return null;
  return { accountName, appKey, appToken, salesChannel };
}

function baseUrl(config: VtexConfig) {
  return `https://${config.accountName}.vtexcommercestable.com.br`;
}

function authHeaders(config: VtexConfig): Record<string, string> {
  return {
    "X-VTEX-API-AppKey": config.appKey,
    "X-VTEX-API-AppToken": config.appToken,
    Accept: "application/json",
  };
}

interface VtexSearchOffer {
  Price?: number;
  ListPrice?: number;
  AvailableQuantity?: number;
}

interface VtexSearchSeller {
  sellerId: string;
  commertialOffer?: VtexSearchOffer;
}

interface VtexSearchSku {
  itemId: string;
  sellers?: VtexSearchSeller[];
  images?: { imageUrl: string }[];
}

interface VtexSearchProduct {
  productId: string;
  productName: string;
  items: VtexSearchSku[];
}

const PAGE_SIZE = 50;
const MAX_PAGES = 20; // hasta 1000 SKUs por seller, suficiente para el MVP

async function fetchLiveSurtido(config: VtexConfig, sellerIdVtex: string): Promise<SurtidoItem[]> {
  const items: SurtidoItem[] = [];

  for (let page = 0; page < MAX_PAGES; page++) {
    const from = page * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    const url =
      `${baseUrl(config)}/api/catalog_system/pub/products/search` +
      `?fq=sellerId:${encodeURIComponent(sellerIdVtex)}` +
      `&sc=${encodeURIComponent(config.salesChannel)}` +
      `&_from=${from}&_to=${to}`;

    const res = await fetch(url, { headers: authHeaders(config), cache: "no-store" });
    if (!res.ok) {
      throw new Error(`VTEX respondió ${res.status} al buscar el surtido de ${sellerIdVtex}`);
    }
    const products = (await res.json()) as VtexSearchProduct[];
    if (products.length === 0) break;

    for (const product of products) {
      for (const sku of product.items ?? []) {
        const seller = sku.sellers?.find((s) => s.sellerId === sellerIdVtex);
        if (!seller) continue;

        items.push({
          sku: sku.itemId,
          nombreProducto: product.productName,
          precioLista: seller.commertialOffer?.ListPrice ?? 0,
          precioOferta: seller.commertialOffer?.Price ?? 0,
          stock: seller.commertialOffer?.AvailableQuantity ?? 0,
          imageUrl: sku.images?.[0]?.imageUrl ?? "",
        });
      }
    }

    if (products.length < PAGE_SIZE) break;
  }

  return items;
}

interface DemoCatalog {
  sellerId: string;
  products: {
    skuId: string;
    productName: string;
    price: number;
    listPrice: number;
    stock: number;
    imageUrl: string;
  }[];
}

async function fetchDemoSurtido(sellerIdVtex: string): Promise<SurtidoItem[]> {
  try {
    const filePath = path.join(process.cwd(), "lib", "vtex-demo-data", `${sellerIdVtex}.json`);
    const raw = await readFile(filePath, "utf-8");
    const catalog = JSON.parse(raw) as DemoCatalog;
    return catalog.products.map((p) => ({
      sku: p.skuId,
      nombreProducto: p.productName,
      precioLista: p.listPrice,
      precioOferta: p.price,
      stock: p.stock,
      imageUrl: p.imageUrl,
    }));
  } catch {
    return [];
  }
}

export function isVtexConfigured(): boolean {
  return loadVtexConfig() !== null;
}

/**
 * Trae el surtido activo + stock de un seller. Server-side únicamente.
 * Usa VTEX en vivo si hay credenciales configuradas; si no, sirve el
 * catálogo de demo embebido (ver lib/vtex-demo-data/).
 */
export async function getSellerSurtido(sellerIdVtex: string): Promise<SurtidoItem[]> {
  const config = loadVtexConfig();
  if (config) {
    return fetchLiveSurtido(config, sellerIdVtex);
  }
  return fetchDemoSurtido(sellerIdVtex);
}
