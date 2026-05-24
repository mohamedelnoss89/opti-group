import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT =
  "أنت مساعد طبي متخصص في صحة العيون. أجب بالعربية. كن مختصراً ودقيقاً - لا تزيد عن 3 أسطر. اذكر السبب المحتمل ونصيحة واحدة عملية فقط. دائماً ذكّر بزيارة الطبيب للتشخيص الدقيق. لا تصف أدوية.";

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages } = body as { messages: ChatMessage[] };

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Messages array is required" },
        { status: 400 }
      );
    }

    const apiMessages = [
      { role: "system" as const, content: SYSTEM_PROMPT },
      ...messages.map((m: ChatMessage) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    ];

    // Try z-ai-web-dev-sdk first (works locally)
    try {
      const ZAI = (await import("z-ai-web-dev-sdk")).default;
      const zai = await ZAI.create();
      const response = await zai.chat.completions.create({
        model: "default",
        messages: apiMessages,
        max_tokens: 200,
        temperature: 0.7,
      });

      const assistantMessage =
        response.choices?.[0]?.message?.content ||
        "عذراً، لم أتمكن من معالجة طلبك.";

      return NextResponse.json({ message: assistantMessage });
    } catch (sdkError) {
      console.log("z-ai-web-dev-sdk not available, using fallback:", sdkError instanceof Error ? sdkError.message : "unknown error");
    }

    // Fallback: use OpenAI-compatible API with environment variable
    const apiKey = process.env.OPENAI_API_KEY;
    const apiBaseUrl = process.env.OPENAI_API_BASE || "https://api.openai.com/v1";

    if (apiKey) {
      const response = await fetch(`${apiBaseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: process.env.OPENAI_MODEL || "gpt-3.5-turbo",
          messages: apiMessages,
          max_tokens: 200,
          temperature: 0.7,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const assistantMessage =
          data.choices?.[0]?.message?.content ||
          "عذراً، لم أتمكن من معالجة طلبك.";
        return NextResponse.json({ message: assistantMessage });
      }
      console.error("OpenAI API error:", response.status, await response.text());
    }

    // Final fallback: intelligent rule-based responses for common eye symptoms
    const lastUserMessage = messages[messages.length - 1]?.content || "";
    const fallbackResponse = generateSmartFallback(lastUserMessage);
    return NextResponse.json({ message: fallbackResponse });

  } catch (error) {
    console.error("Medical Chat API error:", error);
    return NextResponse.json(
      {
        error: "Failed to get response",
        message:
          "عذراً، حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى لاحقاً. تذكر دائماً زيارة طبيب العيون للحصول على استشارة طبية دقيقة.",
      },
      { status: 500 }
    );
  }
}

/**
 * Smart fallback that provides helpful medical guidance
 * based on keyword matching when AI API is unavailable
 */
function generateSmartFallback(userMessage: string): string {
  const msg = userMessage.toLowerCase();

  // Dry eyes
  if (msg.includes("جفاف") || msg.includes("dry")) {
    return "جفاف العين شائع بسبب قلة الدموع أو التعرض للشاشات. نصيحة: استخدم قطرات دموع صناعية كل ساعتين واخفض سطوع الشاشة. ⚠️ راجع طبيب العيون إذا استمرت الأعراض.";
  }

  // Blurry vision
  if (msg.includes("ضباب") || msg.includes("ضبابي") || msg.includes("blurry") || msg.includes("تشوش")) {
    return "الرؤية الضبابية قد تكون بسبب إجهاد العين أو قصر/طول النظر. نصيحة: اتبع قاعدة 20-20-20 (كل 20 دقيقة، انظر لمسافة 20 قدماً لمدة 20 ثانية). ⚠️ إذا استمرت، راجع طبيب العيون.";
  }

  // Pain/discomfort
  if (msg.includes("ألم") || msg.includes("وجع") || msg.includes("pain") || msg.includes("حرقان") || msg.includes("حرق")) {
    return "ألم العين قد يكون بسبب إجهاد الشاشة أو التهاب. نصيحة: اغلق عينيك لمدة 5 دقائق كل ساعة واستخدم كمادات باردة. ⚠️ إذا كان الألم شديداً أو مصحوباً باحمرار، راجع طبيب العيون فوراً.";
  }

  // Headache
  if (msg.includes("صداع") || msg.includes("رأس") || msg.includes("headache")) {
    return "الصداع مع إجهاد العين شائع عند استخدام الشاشات. نصيحة: اضبط إضاءة الشاشة وابعد عنها 50-70 سم، وارتدِ نظارات حماية من الضوء الأزرق. ⚠️ راجع طبيب العيون لفحص النظر.";
  }

  // Red eyes
  if (msg.includes("احمرار") || msg.includes("أحمر") || msg.includes("red") || msg.includes("دم")) {
    return "احمرار العين قد يكون بسبب جفاف أو التهاب أو حساسية. نصيحة: استخدم قطرات ترطيب وتجنب فرك العين. ⚠️ إذا صاحبه ألم أو تغير في الرؤية، راجع طبيب العيون فوراً.";
  }

  // Itching
  if (msg.includes("حكة") || msg.includes("هرش") || msg.includes("itch")) {
    return "حكة العين عادة تكون بسبب حساسية أو جفاف. نصيحة: لا تفرك عينيك واستخدم قطرات مضادة للحساسية. كمادات باردة تساعد في تهدئة الحكة. ⚠️ راجع طبيب العيون إذا استمرت.";
  }

  // Floaters / flashes
  if (msg.includes("خيوط") || msg.includes("نقاط") || msg.includes("وميض") || msg.includes("floaters") || msg.includes("flashes")) {
    return "الخيوط أو النقاط المتحركة شائعة مع تقدم العمر. نصيحة: لا تقلق إذا كانت قليلة، لكن راقب أي زيادة مفاجئة. ⚠️ إذا ظهرت ومضات ضوئية أو زيادة مفاجئة، راجع طبيب العيون فوراً فقد يكون انفصال شبكية.";
  }

  // Night vision
  if (msg.includes("ليل") || msg.includes("ليلي") || msg.includes("night")) {
    return "صعوبة الرؤية الليلية قد تكون بسبب نقص فيتامين A أو إعتام العدسة. نصيحة: تناول أطعمة غنية بفيتامين A (جزر، بطاطا حلوة) وتجنب القيادة ليلاً إذا كانت الرؤية ضعيفة. ⚠️ راجع طبيب العيون.";
  }

  // Screen/computer strain
  if (msg.includes("شاشة") || msg.includes("كمبيوتر") || msg.includes("موبايل") || msg.includes("هاتف") || msg.includes("screen") || msg.includes("computer")) {
    return "إجهاد العين الرقمي شائع جداً. نصيحة: اتبع قاعدة 20-20-20، اخفض سطوع الشاشة، وارتدِ نظارات حماية من الضوء الأزرق. ⚠️ راجع طبيب العيون لفحص إذا كنت تحتاج نظارات.";
  }

  // General / default
  return "شكراً لتواصلك. بناءً على وصفك، أنصحك بـ: إراحة عينيك بانتظام، تجنب فركها، واستخدام قطرات ترطيب. تابع أعراضك وسجل أي تغييرات. ⚠️ للأعراض المستمرة أو الشديدة، راجع طبيب العيون المتخصص.";
}
