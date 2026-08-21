import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSellerSurtido } from "@/lib/vtex";

export async function GET() {
  const session = await auth();
  if (session?.user.rol !== "SELLER" || !session.user.sellerId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const seller = await prisma.seller.findUnique({ where: { id: session.user.sellerId } });
  if (!seller) {
    return NextResponse.json({ error: "Seller no encontrado" }, { status: 404 });
  }

  const surtido = await getSellerSurtido(seller.sellerIdVtex);
  return NextResponse.json({ surtido });
}
