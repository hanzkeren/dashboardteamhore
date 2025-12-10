import { NextResponse } from "next/server";
// Pastikan import DUA fungsi ini (sesuaikan path folder actions lu)
import {
  getClientDashboardSummary,
  getDashboardStats,
} from "@/features/dashboard/actions";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const clientId = searchParams.get("clientId");

    // LOGIC CABANG:
    if (clientId) {
      // 1. Jika ada Client ID -> Ambil Summary Per Client
      const summary = await getClientDashboardSummary(clientId);
      return NextResponse.json(summary);
    } else {
      // 2. Jika KOSONG -> Ambil Summary Global (Admin Dashboard)
      // Ini yang dipake buat ngisi Total Budget, Total Spend di halaman depan
      const globalStats = await getDashboardStats();
      return NextResponse.json(globalStats);
    }
  } catch (error) {
    console.error("Dashboard API Error:", error);
    return NextResponse.json(
      { message: "Gagal mengambil data dashboard" },
      { status: 500 }
    );
  }
}
