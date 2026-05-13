import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// Bot URL for remote code verification
const BOT_URL = process.env.BOT_URL || "";

// ====== Built-in Subscription Codes ======
const BUILTIN_CODES: Record<string, { days: number; type: string; maxUsers: number }> = {
  'SIZE2026': { days: 3650, type: 'master', maxUsers: 3 },
  'OPTI2026': { days: 3650, type: 'master', maxUsers: 3 },
  'EYES2026': { days: 3650, type: 'master', maxUsers: 3 },
  'OPTA7X9K': { days: 30, type: 'normal', maxUsers: 1 },
  'OPTB3M5N': { days: 30, type: 'normal', maxUsers: 1 },
  'OPTC4P6R': { days: 30, type: 'normal', maxUsers: 1 },
  'OPTD2T8W': { days: 30, type: 'normal', maxUsers: 1 },
  'OPTE6V1Y': { days: 30, type: 'normal', maxUsers: 1 },
  'OPTF9H3J': { days: 30, type: 'normal', maxUsers: 1 },
  'GIFTA1B2': { days: 30, type: 'gift', maxUsers: 1 },
  'GIFTD4E5': { days: 30, type: 'gift', maxUsers: 1 },
  'GIFTG7H8': { days: 30, type: 'gift', maxUsers: 1 },
  'GIFTJ0K1': { days: 30, type: 'gift', maxUsers: 1 },
  'GIFTM3N4': { days: 30, type: 'gift', maxUsers: 1 },
};

// Check if user has any active subscription
async function getUserActiveSubscription(userId: string) {
  // Check SubscriptionActivation table
  const activation = await db.subscriptionActivation.findFirst({
    where: {
      userId: userId,
      expiresAt: { gt: new Date() },
    },
    include: { subscription: true },
    orderBy: { expiresAt: 'desc' },
  });

  if (activation) {
    return {
      id: activation.subscription.id,
      code: activation.subscription.code,
      isActive: true,
      activatedAt: activation.activatedAt.toISOString(),
      expiresAt: activation.expiresAt.toISOString(),
    };
  }

  // Fallback: check Subscription table (for legacy/bot-generated single-use codes)
  const sub = await db.subscription.findFirst({
    where: {
      userId: userId,
      isActive: true,
      expiresAt: { gt: new Date() },
    },
    orderBy: { expiresAt: 'desc' },
  });

  if (sub) {
    return {
      id: sub.id,
      code: sub.code,
      isActive: true,
      activatedAt: sub.activatedAt?.toISOString(),
      expiresAt: sub.expiresAt?.toISOString(),
    };
  }

  return null;
}

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

    const upperCode = code.toUpperCase().trim();

    // Step 1: Check if user already has an active subscription
    const existingSub = await getUserActiveSubscription(userId);
    if (existingSub) {
      return NextResponse.json({
        success: true,
        message: "الاشتراك مفعل بالفعل",
        subscription: existingSub,
      });
    }

    // Step 2: Check built-in codes
    if (BUILTIN_CODES[upperCode]) {
      const codeInfo = BUILTIN_CODES[upperCode];

      // Ensure the Subscription record exists
      let subscription = await db.subscription.findUnique({
        where: { code: upperCode },
        include: { activations: true },
      });

      if (!subscription) {
        subscription = await db.subscription.create({
          data: {
            code: upperCode,
            phone: codeInfo.type,
            isActive: true,
          },
          include: { activations: true },
        });
      }

      // Check if this user already activated this code
      const existingActivation = subscription.activations.find(
        (a) => a.userId === userId && new Date(a.expiresAt) > new Date()
      );

      if (existingActivation) {
        return NextResponse.json({
          success: true,
          message: "الاشتراك مفعل بالفعل",
          subscription: {
            id: subscription.id,
            code: upperCode,
            isActive: true,
            activatedAt: existingActivation.activatedAt.toISOString(),
            expiresAt: existingActivation.expiresAt.toISOString(),
          },
        });
      }

      // Count active activations for this code
      const activeActivations = subscription.activations.filter(
        (a) => new Date(a.expiresAt) > new Date()
      );

      if (activeActivations.length >= codeInfo.maxUsers) {
        return NextResponse.json(
          { success: false, error: "هذا الكود تم استخدامه من قبل" },
          { status: 400 }
        );
      }

      // Activate - create a new activation record
      const now = new Date();
      const expiresAt = new Date(now);
      expiresAt.setDate(expiresAt.getDate() + codeInfo.days);

      await db.subscriptionActivation.create({
        data: {
          subscriptionId: subscription.id,
          userId: userId,
          activatedAt: now,
          expiresAt: expiresAt,
        },
      });

      // Mark subscription as active
      await db.subscription.update({
        where: { id: subscription.id },
        data: { isActive: true },
      });

      return NextResponse.json({
        success: true,
        message: "تم التفعيل بنجاح",
        subscription: {
          id: subscription.id,
          code: upperCode,
          isActive: true,
          activatedAt: now.toISOString(),
          expiresAt: expiresAt.toISOString(),
        },
      });
    }

    // Step 3: Check database for bot-generated codes
    const dbCode = await db.subscription.findUnique({
      where: { code: upperCode },
      include: { activations: true },
    });

    if (dbCode) {
      // Bot-generated code - single use
      // Check if already activated by someone else
      const activeActs = dbCode.activations.filter(
        (a) => new Date(a.expiresAt) > new Date()
      );

      if (activeActs.length > 0) {
        const alreadyMine = activeActs.find((a) => a.userId === userId);
        if (alreadyMine) {
          return NextResponse.json({
            success: true,
            message: "الاشتراك مفعل بالفعل",
            subscription: {
              id: dbCode.id,
              code: upperCode,
              isActive: true,
              activatedAt: alreadyMine.activatedAt.toISOString(),
              expiresAt: alreadyMine.expiresAt.toISOString(),
            },
          });
        }
        return NextResponse.json(
          { success: false, error: "هذا الكود تم استخدامه من قبل" },
          { status: 400 }
        );
      }

      // Also check legacy userId field
      if (dbCode.userId && dbCode.userId !== userId && dbCode.isActive) {
        return NextResponse.json(
          { success: false, error: "هذا الكود تم استخدامه من قبل" },
          { status: 400 }
        );
      }

      if (dbCode.userId === userId && dbCode.isActive && dbCode.expiresAt && new Date(dbCode.expiresAt) > new Date()) {
        return NextResponse.json({
          success: true,
          message: "الاشتراك مفعل بالفعل",
          subscription: {
            id: dbCode.id,
            code: upperCode,
            isActive: true,
            activatedAt: dbCode.activatedAt?.toISOString(),
            expiresAt: dbCode.expiresAt?.toISOString(),
          },
        });
      }

      // Activate the code
      const now = new Date();
      const expiresAt = new Date(now);
      expiresAt.setDate(expiresAt.getDate() + 30);

      // Use activation table
      await db.subscriptionActivation.create({
        data: {
          subscriptionId: dbCode.id,
          userId: userId,
          activatedAt: now,
          expiresAt: expiresAt,
        },
      });

      await db.subscription.update({
        where: { id: dbCode.id },
        data: {
          userId: userId,
          isActive: true,
          activatedAt: now,
          expiresAt: expiresAt,
        },
      });

      return NextResponse.json({
        success: true,
        message: "تم التفعيل بنجاح",
        subscription: {
          id: dbCode.id,
          code: upperCode,
          isActive: true,
          activatedAt: now.toISOString(),
          expiresAt: expiresAt.toISOString(),
        },
      });
    }

    // Step 4: Check bot API for new codes (with 5s timeout)
    if (BOT_URL) {
      try {
        const controller = new AbortController();
        const tid = setTimeout(() => controller.abort(), 5000);
        const botRes = await fetch(BOT_URL.replace(/\/$/, '') + '/api/verify-code', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: upperCode }),
          signal: controller.signal,
        });
        clearTimeout(tid);
        const botData = await botRes.json();

        if (botData.valid) {
          const now = new Date();
          const expiresAt = new Date(now);
          expiresAt.setDate(expiresAt.getDate() + (botData.days || 30));

          // Save to database
          const subscription = await db.subscription.create({
            data: {
              code: upperCode,
              phone: botData.phone || 'bot',
              userId: userId,
              isActive: true,
              activatedAt: now,
              expiresAt: expiresAt,
            },
          });

          await db.subscriptionActivation.create({
            data: {
              subscriptionId: subscription.id,
              userId: userId,
              activatedAt: now,
              expiresAt: expiresAt,
            },
          });

          return NextResponse.json({
            success: true,
            message: "تم التفعيل بنجاح",
            subscription: {
              id: subscription.id,
              code: upperCode,
              isActive: true,
              activatedAt: now.toISOString(),
              expiresAt: expiresAt.toISOString(),
            },
          });
        }
      } catch (e) {
        // Bot unreachable - not critical
      }
    }

    return NextResponse.json(
      { success: false, error: "كود التفعيل غير صحيح" },
      { status: 404 }
    );
  } catch (error) {
    console.error("Subscription activation error:", error);
    return NextResponse.json(
      { success: false, error: "حدث خطأ أثناء التفعيل" },
      { status: 500 }
    );
  }
}

// GET - Check subscription status
export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("userId");
    if (!userId) {
      return NextResponse.json({ success: false, error: "معرف المستخدم مطلوب" }, { status: 400 });
    }

    const subscription = await getUserActiveSubscription(userId);

    if (subscription) {
      return NextResponse.json({
        success: true,
        hasSubscription: true,
        subscription: subscription,
      });
    }

    return NextResponse.json({ success: true, hasSubscription: false, subscription: null });
  } catch (error) {
    console.error("Subscription status check error:", error);
    return NextResponse.json({ success: false, error: "حدث خطأ أثناء التحقق" }, { status: 500 });
  }
}
