"use server";

import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";
import {
  createAdReportSchema,
  type CreateAdReportInput,
} from "./schemas";

export async function listReportsByClient(clientId: string) {
  const reports = await prisma.adReport.findMany({
    where: { clientId },
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

  return reports;
}

export async function createAdReport(input: CreateAdReportInput) {
  const data = createAdReportSchema.parse(input);

  const report = await prisma.adReport.create({
    data: {
      clientId: data.clientId,
      tanggal: data.tanggal, // sudah Date dari transform schema
      idAccount: data.idAccount,
      spend: new Prisma.Decimal(data.spend),
      clicks: data.clicks ?? null,
      impressions: data.impressions ?? null,
      conversions: data.conversions ?? null,
    },
  });

  return report;
}

// update ad report
export async function updateAdReport(id: string, input: Partial<CreateAdReportInput>) {
  const data = createAdReportSchema.partial().parse(input);

  const report = await prisma.adReport.update({
    where: { id },
    data: {
      ...data,
      tanggal: data.tanggal ? new Date(data.tanggal) : undefined,
      spend: data.spend ? new Prisma.Decimal(data.spend) : undefined,
    },
  });

  return report;
}

export async function getReportAggregateByClient(clientId: string) {
  const result = await prisma.adReport.aggregate({
    where: { clientId },
    _sum: {
      spend: true,
      clicks: true,
      impressions: true,
      conversions: true,
    },
  });

  return {
    totalSpend: result._sum.spend ?? new Prisma.Decimal(0),
    totalClicks: result._sum.clicks ?? 0,
    totalImpressions: result._sum.impressions ?? 0,
    totalConversions: result._sum.conversions ?? 0,
  };
}