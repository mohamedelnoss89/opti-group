import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/prescriptions - Get prescriptions for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    const prescriptions = await db.prescription.findMany({
      where: userId ? { userId } : {},
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ prescriptions });
  } catch (error) {
    console.error("GET /api/prescriptions error:", error);
    return NextResponse.json({ error: "Failed to fetch prescriptions" }, { status: 500 });
  }
}

// POST /api/prescriptions - Save a prescription
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const prescription = await db.prescription.create({
      data: {
        userId: body.userId || "anonymous",
        label: body.label || "وصفة",
        odSph: body.odSph || 0,
        odCyl: body.odCyl || 0,
        odAxis: body.odAxis || 0,
        odAdd: body.odAdd || 0,
        osSph: body.osSph || 0,
        osCyl: body.osCyl || 0,
        osAxis: body.osAxis || 0,
        osAdd: body.osAdd || 0,
        pd: body.pd || null,
        notes: body.notes || null,
      },
    });

    return NextResponse.json({ prescription, success: true });
  } catch (error) {
    console.error("POST /api/prescriptions error:", error);
    return NextResponse.json({ error: "Failed to save prescription" }, { status: 500 });
  }
}
