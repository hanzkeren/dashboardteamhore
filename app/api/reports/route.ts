import { NextResponse } from "next/server";
import {
  createAdReportSchema,
} from "@/features/reports/schemas";
import {
  createAdReport,
  listReportsByClient,
} from "@/features/reports/actions";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const clientId = searchParams.get("clientId");

    if (clientId) {
      // Get reports for specific client
      const reports = await listReportsByClient(clientId);
      return NextResponse.json(reports);
    } else {
      // Get all reports
      const allReports = await prisma.adReport.findMany({
        include: {
          client: {
            select: {
              id: true,
              nama: true,
              toko: true,
            },
          },
        },
        orderBy: { tanggal: "desc" },
      });
      return NextResponse.json(allReports);
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Gagal mengambil laporan iklan" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = createAdReportSchema.parse(body);

    const report = await createAdReport(data);

    return NextResponse.json(report, { status: 201 });
  } catch (error: any) {
    console.error(error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        { message: "Data tidak valid", issues: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Gagal membuat laporan iklan" },
      { status: 500 }
    );
  }
}