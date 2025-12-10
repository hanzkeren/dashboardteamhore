// src/app/api/clients/route.ts
import { NextResponse } from "next/server";
import { listClients, createClient } from "@/features/clients/actions";
import { createClientSchema } from "@/features/clients/schemas";

export async function GET() {
  try {
    const clients = await listClients();
    return NextResponse.json({ data: clients });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Gagal mengambil client" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = createClientSchema.parse(body);

    const client = await createClient(data);

    return NextResponse.json(client, { status: 201 });
  } catch (error: any) {
    console.error(error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        { message: "Data tidak valid", issues: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Gagal membuat client" },
      { status: 500 }
    );
  }
}