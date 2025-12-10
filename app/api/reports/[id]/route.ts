import { NextResponse } from "next/server";
import { z } from "zod";

const updateAdReportSchema = z.object({
  tanggal: z.string().optional(),
  idAccount: z.string().optional(),
  spend: z.number().optional(),
  clicks: z.number().nullable().optional(),
  impressions: z.number().nullable().optional(),
  conversions: z.number().nullable().optional(),
  clientId: z.string().optional(),
});

async function updateAdReport(id: string, data: any) {
  const { prisma } = await import("@/lib/db");

  try {
    const report = await prisma.adReport.update({
      where: { id },
      data,
    });

    return report;
  } catch (error) {
    throw error;
  }
}

export async function PUT(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  const { id } = await props.params;
  try {
    const body = await req.json();
    const data = updateAdReportSchema.parse(body);

    const report = await updateAdReport(id, data);

    return NextResponse.json(report);
  } catch (error: any) {
    console.error(error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        { message: "Data tidak valid", issues: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Gagal update ad report" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await props.params;
    const { prisma } = await import("@/lib/db");

    await prisma.adReport.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Ad Report berhasil dihapus" });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Gagal hapus ad report" },
      { status: 500 }
    );
  }
}