import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  props: { params: Promise<{ key: string }> }
) {
  const { key: accessKey } = await props.params;
  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  try {
    // 1. Cari Client berdasarkan Access Key (Unik)
    const client = await prisma.client.findUnique({
      where: { accessKey: accessKey },
    });

    if (!client) {
      return NextResponse.json(
        { error: "Invalid Key atau Client tidak ditemukan" },
        { status: 404 }
      );
    }

    // 2. Buat filter tanggal Prisma
    let dateFilter: any = {};
    if (from && to) {
      dateFilter = {
        gte: new Date(from),
        lte: new Date(to),
      };
    } else if (from) {
      dateFilter = {
        gte: new Date(from),
      };
    } else if (to) {
      dateFilter = {
        lte: new Date(to),
      };
    }

    // 3. Tarik Report HANYA milik client id tersebut dengan filter tanggal
    const reports = await prisma.adReport.findMany({
      where: {
        clientId: client.id,
        tanggal: dateFilter, // <--- Pasang filter disini
      },
      orderBy: { tanggal: "desc" },
    });

    // 4. Tarik Budgets/Transactions ALL TIME (tanpa filter) untuk perhitungan saldo akurat
    const budgets = await prisma.budget.findMany({
      where: {
        clientId: client.id,
      },
      orderBy: { createdAt: "desc" },
    });

    // 5. Hitung total spend ALL TIME (tanpa filter) untuk saldo akurat
    const allReports = await prisma.adReport.findMany({
      where: {
        clientId: client.id,
      },
    });

    const totalSpendAllTime = allReports.reduce((sum, r) => sum + Number(r.spend), 0);

    return NextResponse.json({
      client: { name: client.nama, toko: client.toko },
      reports: reports,
      budgets: budgets,
      totalSpendAllTime: totalSpendAllTime,
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
