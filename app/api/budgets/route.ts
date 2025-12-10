import { NextResponse } from "next/server";
import { createBudgetSchema } from "@/features/budgets/schemas";
// PERBAIKAN IMPORT: Pakai 'listBudgets', bukan 'listBudgetsByClient'
import { createBudget, listBudgets } from "@/features/budgets/actions";

const formatBudget = (budget: any) => ({
  ...budget,
  nominal: Number(budget.nominal),
});

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const clientId = searchParams.get("clientId");

    // Panggil listBudgets (dia udah pinter handle "all" atau specific ID)
    const rawBudgets = await listBudgets(clientId || "all");

    const data = rawBudgets.map(formatBudget);

    return NextResponse.json(data);
  } catch (error) {
    console.error("GET Error:", error);
    return NextResponse.json(
      { message: "Gagal mengambil budgets", error: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = createBudgetSchema.parse(body);
    const rawBudget = await createBudget(data);
    return NextResponse.json(formatBudget(rawBudget), { status: 201 });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json(
        { message: "Invalid", issues: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}
