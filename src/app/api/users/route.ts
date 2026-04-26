import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// POST /api/users/sync - Sync user from localStorage to database
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, email, isGuest, createdAt } = body;

    // Upsert user - create if not exists, update if exists
    const user = await db.user.upsert({
      where: { id },
      update: { name, email: email || null },
      create: {
        id,
        name,
        email: email || null,
        password: null,
        isGuest: isGuest || false,
        createdAt: createdAt ? new Date(createdAt) : new Date(),
      },
    });

    return NextResponse.json({ user, success: true });
  } catch (error) {
    console.error("POST /api/users/sync error:", error);
    return NextResponse.json({ error: "Failed to sync user" }, { status: 500 });
  }
}

// GET /api/users - Get user by ID
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const user = await db.user.findUnique({
      where: { id },
      include: {
        measurements: { orderBy: { createdAt: "desc" }, take: 50 },
        prescriptions: { orderBy: { createdAt: "desc" } },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("GET /api/users error:", error);
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 });
  }
}
