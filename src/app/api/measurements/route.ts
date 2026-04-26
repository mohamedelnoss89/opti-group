import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/measurements - Get all measurements with optional filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const type = searchParams.get("type");
    const fromDate = searchParams.get("fromDate");
    const toDate = searchParams.get("toDate");
    const search = searchParams.get("search");

    let where: Record<string, unknown> = {};

    if (userId) where.userId = userId;
    if (type) where.type = type;
    if (fromDate || toDate) {
      where.createdAt = {
        ...(fromDate && { gte: new Date(fromDate) }),
        ...(toDate && { lte: new Date(toDate) }),
      };
    }

    const measurements = await db.measurement.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 1000,
    });

    // Apply search filter on JSON data if needed
    let filtered = measurements;
    if (search) {
      const s = search.toLowerCase();
      filtered = measurements.filter(
        (m) =>
          m.title.toLowerCase().includes(s) ||
          m.type.toLowerCase().includes(s) ||
          m.data.toLowerCase().includes(s)
      );
    }

    // Parse JSON data strings back to objects
    const result = filtered.map((m) => ({
      ...m,
      data: JSON.parse(m.data),
    }));

    return NextResponse.json({ measurements: result, total: result.length });
  } catch (error) {
    console.error("GET /api/measurements error:", error);
    return NextResponse.json({ error: "Failed to fetch measurements" }, { status: 500 });
  }
}

// POST /api/measurements - Create a new measurement
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, userId, type, title, data, timestamp } = body;

    const measurement = await db.measurement.create({
      data: {
        id: id || undefined,
        userId: userId || "anonymous",
        type: type || "unknown",
        title: title || "قياس",
        data: JSON.stringify(data || {}),
        createdAt: timestamp ? new Date(timestamp) : new Date(),
      },
    });

    return NextResponse.json({ measurement, success: true });
  } catch (error) {
    console.error("POST /api/measurements error:", error);
    return NextResponse.json({ error: "Failed to create measurement" }, { status: 500 });
  }
}

// DELETE /api/measurements?id=xxx - Delete a measurement
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    await db.measurement.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/measurements error:", error);
    return NextResponse.json({ error: "Failed to delete measurement" }, { status: 500 });
  }
}
