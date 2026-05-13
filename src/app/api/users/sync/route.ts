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
    // Return JSON error, not HTML 404
    return NextResponse.json({ error: "Failed to sync user", success: false }, { status: 500 });
  }
}
