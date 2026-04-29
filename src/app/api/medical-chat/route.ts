import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT =
  "أنت مساعد طبي ذكي متخصص في صحة العيون. دورك هو:\n- الاستماع لأعراض المريض بعناية وطرح أسئلة توضيحية عند الحاجة\n- تقديم نصائح أولية مبنية على الأعراض المذكورة\n- شرح الأسباب المحتملة بشكل مبسط ومفهوم\n- اقتراح خطوات عملية يمكن اتخاذها فوراً\n- التنبيه على الحالات التي تستدعي زيارة طبيب فوراً\nأجب بالعربية دائماً. كن لطيفاً ومتعاطفاً. قدم معلومات طبية دقيقة ولكن أكد دائماً أن التشخيص النهائي يجب أن يكون من طبيب مختص. لا تصف أدوية بل يمكنك ذكر أنواع القطرات العامة فقط كإرشاد.";

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

    // Use z-ai-web-dev-sdk for LLM
    const ZAI = (await import("z-ai-web-dev-sdk")).default;
    const zai = await ZAI.create();
    const response = await zai.chat.completions.create({
      model: "default",
      messages: apiMessages,
      max_tokens: 800,
      temperature: 0.7,
    });

    const assistantMessage =
      response.choices?.[0]?.message?.content ||
      "عذراً، لم أتمكن من معالجة طلبك. يرجى المحاولة مرة أخرى.";

    return NextResponse.json({ message: assistantMessage });
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
