import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { updateBudget } from "@/features/budgets/actions";
import { createBudgetSchema } from "@/features/budgets/schemas";

const updateBudgetSchema = createBudgetSchema.partial();
const formatBudget = (b: any) => ({ ...b, nominal: Number(b.nominal) });

// Definisi tipe params sebagai Promise
type Props = {
  params: Promise<{ id: string }>;
};

// --- UPDATE (PUT) ---
export async function PUT(req: Request, { params }: Props) {
  try {
    // FIX: Wajib await params sebelum ambil id
    const { id } = await params;

    const body = await req.json();
    const data = updateBudgetSchema.parse(body);

    const rawBudget = await updateBudget(id, data);

    return NextResponse.json(formatBudget(rawBudget));
  } catch (error: any) {
    console.error("PUT Error:", error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        { message: "Data tidak valid", issues: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Gagal update budget" },
      { status: 500 }
    );
  }
}

// --- DELETE ---
export async function DELETE(req: Request, { params }: Props) {
  try {
    // FIX: Wajib await params sebelum ambil id
    const { id } = await params;

    await prisma.budget.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Budget berhasil dihapus" });
  } catch (error) {
    console.error("DELETE Error:", error);
    return NextResponse.json(
      { message: "Gagal hapus budget" },
      { status: 500 }
    );
  }
}
