"use server";

import { prisma } from "@/lib/db";
import { createClientSchema, type CreateClientInput } from "./schemas";
import { Status } from "@prisma/client";

// --- LIST CLIENTS ---
export async function listClients() {
  const clients = await prisma.client.findMany({
    include: {
      _count: {
        select: {
          budgets: true,
          reports: true, // Nama relasi di schema adalah 'reports'
        },
      },
      // Kalo butuh data reports di list, uncomment bawah ini (berat!)
      // reports: true
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Transform data
  return clients.map((client) => ({
    ...client,
    name: client.nama, // Map DB 'nama' -> Frontend 'name'
    company: client.toko, // Map DB 'toko' -> Frontend 'company'
    isActive: client.status === Status.ACTIVE,

    // Hapus baris 'adReports: client.reports' karena datanya gak di-fetch di atas

    _count: {
      ...client._count,
      adReports: client._count.reports, // Map count reports
    },
  }));
}

// --- GET BY ID ---
export async function getClientById(id: string) {
  const client = await prisma.client.findUnique({
    where: { id },
    include: {
      budgets: {
        orderBy: { tanggal: "desc" },
      },
      reports: {
        // <--- PERBAIKAN: Gunakan 'reports', bukan 'adReports'
        orderBy: { tanggal: "desc" },
      },
      _count: {
        select: {
          budgets: true,
          reports: true, // <--- PERBAIKAN: Gunakan 'reports'
        },
      },
    },
  });

  return client;
}

// --- CREATE ---
export async function createClient(input: CreateClientInput) {
  const data = createClientSchema.parse(input);

  const existingClient = await prisma.client.findUnique({
    where: { email: data.email },
  });

  if (existingClient) {
    throw new Error("Email sudah terdaftar");
  }

  return await prisma.client.create({
    data: {
      nama: data.name,
      email: data.email,
      phone: data.phone || null,
      toko: data.company || "",
      status: data.isActive ? Status.ACTIVE : Status.INACTIVE,
    },
  });
}

// --- UPDATE ---
export async function updateClient(
  id: string,
  input: Partial<CreateClientInput>
) {
  const data = createClientSchema.partial().parse(input);

  if (data.email) {
    const existingClient = await prisma.client.findFirst({
      where: {
        email: data.email,
        NOT: { id },
      },
    });

    if (existingClient) {
      throw new Error("Email sudah terdaftar di client lain");
    }
  }

  // PERBAIKAN: Mapping manual field Zod -> DB
  return await prisma.client.update({
    where: { id },
    data: {
      nama: data.name, // Zod 'name' -> DB 'nama'
      toko: data.company, // Zod 'company' -> DB 'toko'
      email: data.email,
      phone: data.phone,
      status:
        data.isActive === undefined
          ? undefined
          : data.isActive
          ? Status.ACTIVE
          : Status.INACTIVE,
    },
  });
}

// --- DELETE ---
export async function deleteClient(id: string) {
  // Cek relasi
  // Note: Karena di schema lu pake 'onDelete: Cascade', sebenarnya langkah ini opsional.
  // Kalau mau langsung hapus (dan data anak ikut kehapus), hapus aja pengecekan ini.

  const hasBudgets = await prisma.budget.findFirst({ where: { clientId: id } });
  const hasReports = await prisma.adReport.findFirst({
    where: { clientId: id },
  });

  if (hasBudgets || hasReports) {
    throw new Error(
      "Tidak dapat menghapus client yang masih memiliki budget atau report"
    );
  }

  return await prisma.client.delete({
    where: { id },
  });
}

// --- STATS ---
export async function getClientStats() {
  const totalClients = await prisma.client.count();
  const activeClients = await prisma.client.count({
    where: { status: Status.ACTIVE },
  });

  return {
    totalClients,
    activeClients,
    inactiveClients: totalClients - activeClients,
  };
}
