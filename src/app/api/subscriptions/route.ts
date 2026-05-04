import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// POST - Verify and activate a subscription code
export async function POST(request: NextRequest) {
  try {
    const { code, userId } = await request.json();

    if (!code || !userId) {
      return NextResponse.json(
        { success: false, error: "الكود ومعرف المستخدم مطلوبان" },
        { status: 400 }
      );
    }

    // Find the subscription code
    const subscription = await prisma.subscription.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!subscription) {
      return NextResponse.json(
        { success: false, error: "كود التفعيل غير صحيح" },
        { status: 404 }
      );
    }

    // Check if already activated by another user
    if (subscription.isActive && subscription.userId && subscription.userId !== userId) {
      return NextResponse.json(
        { success: false, error: "هذا الكود تم استخدامه من قبل" },
        { status: 400 }
      );
    }

    // Check if already activated by same user
    if (subscription.isActive && subscription.userId === userId) {
      return NextResponse.json(
        { success: true, message: "الاشتراك مفعل بالفعل", subscription },
        { status: 200 }
      );
    }

    // Activate the subscription
    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setMonth(expiresAt.getMonth() + 1);

    const activated = await prisma.subscription.update({
      where: { code: code.toUpperCase() },
      data: {
        userId,
        isActive: true,
        activatedAt: now,
        expiresAt,
      },
    });

    return NextResponse.json({
      success: true,
      message: "تم التفعيل بنجاح",
      subscription: {
        id: activated.id,
        code: activated.code,
        isActive: activated.isActive,
        activatedAt: activated.activatedAt,
        expiresAt: activated.expiresAt,
      },
    });
  } catch (error) {
    console.error("Subscription activation error:", error);
    return NextResponse.json(
      { success: false, error: "حدث خطأ أثناء التفعيل" },
      { status: 500 }
    );
  }
}

// GET - Check subscription status for a user
export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "معرف المستخدم مطلوب" },
        { status: 400 }
      );
    }

    const subscription = await prisma.subscription.findFirst({
      where: {
        userId,
        isActive: true,
        expiresAt: { gt: new Date() },
      },
      orderBy: { expiresAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      hasSubscription: !!subscription,
      subscription: subscription
        ? {
            id: subscription.id,
            code: subscription.code,
            isActive: subscription.isActive,
            activatedAt: subscription.activatedAt,
            expiresAt: subscription.expiresAt,
          }
        : null,
    });
  } catch (error) {
    console.error("Subscription check error:", error);
    return NextResponse.json(
      { success: false, error: "حدث خطأ أثناء التحقق" },
      { status: 500 }
    );
  }
}
