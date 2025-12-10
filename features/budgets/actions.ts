"use server";

import { prisma } from "@/lib/db";
import { createBudgetSchema, type CreateBudgetInput } from "./schemas";
import { Prisma } from "@prisma/client";

// --- REVISI: Ganti nama jadi listBudgets & parameter jadi optional ---
export async function listBudgets(clientId?: string) {
  // Logic: Kalau param kosong atau "all", ambil semua data.
  const whereCondition = clientId && clientId !== "all" ? { clientId } : {};

  const budgets = await prisma.budget.findMany({
    where: whereCondition,
    include: {
      client: true, // Join ke table client biar nama tokonya muncul di tabel
    },
    orderBy: { tanggal: "desc" },
  });

  // PENTING: Map data buat convert Decimal -> Number biar Next.js ga error
  return budgets.map((budget) => ({
    ...budget,
    nominal: budget.nominal.toNumber(), // Convert Decimal ke Number JS
  }));
}

// create 1 record budget
export async function createBudget(input: CreateBudgetInput) {
  const data = createBudgetSchema.parse(input);

  return await prisma.budget.create({
    data: {
      clientId: data.clientId,
      tanggal: data.tanggal,
      jenis: data.jenis,
      nominal: new Prisma.Decimal(data.nominal),
      catatan: data.catatan || null,
    },
  });
}

// update budget
export async function updateBudget(
  id: string,
  input: Partial<CreateBudgetInput>
) {
  const data = createBudgetSchema.partial().parse(input);

  return await prisma.budget.update({
    where: { id },
    data: {
      ...data,
      nominal: data.nominal ? new Prisma.Decimal(data.nominal) : undefined,
    },
  });
}

// total topup client
export async function getTotalTopupByClient(clientId?: string) {
  // Logic sama: kalau "all", hitung total semua client
  const whereCondition =
    clientId && clientId !== "all"
      ? { clientId, jenis: "topup" }
      : { jenis: "topup" };

  // Note: Enum 'Jenis' harus sesuai schema.prisma (huruf kecil semua: 'topup')
  // Kalau di DB lu pake 'Topup' (huruf besar), sesuaikan string di bawah.

  const result = await prisma.budget.aggregate({
    where: whereCondition as any, // Cast any buat safety kalau enum beda dikit
    _sum: { nominal: true },
  });

  // Return sebagai number biar gampang di UI
  return result._sum.nominal?.toNumber() ?? 0;
}
