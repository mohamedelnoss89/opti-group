import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST - Create a new subscription code (called by WhatsApp bot)
export async function POST(request: NextRequest) {
  try {
    // Verify secret token to prevent abuse
    const authHeader = request.headers.get("authorization");
    if (authHeader !== "Bearer optisize-bot-2026") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { phone, code, type, days } = await request.json();

    if (!phone) {
      return NextResponse.json(
        { success: false, error: "رقم الموبايل مطلوب" },
        { status: 400 }
      );
    }

    // If code is provided by bot, use it. Otherwise generate one.
    let subscriptionCode = code;
    if (!subscriptionCode) {
      // Generate 8-character code: OPT + last 4 digits of phone + 1 random char
      const phoneDigits = phone.replace(/\D/g, '');
      const last4 = phoneDigits.slice(-4);
      const prefix = 'OPT';
      const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      const randChar = letters[Math.floor(Math.random() * 26)];
      subscriptionCode = `${prefix}${last4}${randChar}`;
    }

    // Make sure code is unique - if exists, add random suffix
    const existing = await prisma.subscription.findUnique({
      where: { code: subscriptionCode.toUpperCase() },
    });
    if (existing) {
      // Code already exists, generate a new one
      const phoneDigits = phone.replace(/\D/g, '');
      const last4 = phoneDigits.slice(-4);
      const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      const digits = '0123456789';
      subscriptionCode = 'OPT' + digits[Math.floor(Math.random()*10)] + last4.slice(0,2) + letters[Math.floor(Math.random()*26)] + digits[Math.floor(Math.random()*10)] + letters[Math.floor(Math.random()*26)];
    }

    // Calculate expiry based on type
    const subscriptionDays = days || 30;

    // Save to database
    const subscription = await prisma.subscription.create({
      data: {
        code: subscriptionCode.toUpperCase(),
        phone,
        isActive: false,
      },
    });

    return NextResponse.json({
      success: true,
      code: subscription.code,
      days: subscriptionDays,
      message: "تم إنشاء كود الاشتراك بنجاح",
    });
  } catch (error) {
    console.error("Create subscription error:", error);
    return NextResponse.json(
      { success: false, error: "حدث خطأ أثناء إنشاء الكود" },
      { status: 500 }
    );
  }
}
