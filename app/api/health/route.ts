import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Check database connection
    const { prisma } = await import("@/lib/db");
    await prisma.$queryRaw`SELECT 1`;

    return NextResponse.json({
      status: "ok",
      message: "Server is healthy",
      timestamp: new Date().toISOString(),
      database: "connected"
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message: "Database connection failed",
        timestamp: new Date().toISOString(),
        database: "disconnected"
      },
      { status: 500 }
    );
  }
}