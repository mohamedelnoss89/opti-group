import ZAI from "z-ai-web-dev-sdk";

const PORT = 3031;

const SYSTEM_PROMPT =
  "أنت مساعد طبي متخصص في صحة العين. اسأل المريض عن أعراضه وقدم نصائح أولية. ذكّره دائماً بزيارة طبيب العيون. أجب بالعربية دائماً. كن لطيفاً ومتعاطفاً. قدم معلومات طبية دقيقة ولكن أكد دائماً أن التشخيص النهائي يجب أن يكون من طبيب مختص. أجب بإيجاز في 3-5 جمل.";

// Keep a single ZAI instance to avoid re-creating
let zaiInstance: Awaited<ReturnType<typeof ZAI.create>> | null = null;

async function getZAI() {
  if (!zaiInstance) {
    zaiInstance = await ZAI.create();
  }
  return zaiInstance;
}

const server = Bun.serve({
  port: PORT,
  async fetch(req) {
    if (req.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    if (req.method !== "POST") {
      return Response.json({ error: "Method not allowed" }, { status: 405 });
    }

    try {
      const body = await req.json();
      const { messages } = body as { messages: Array<{ role: string; content: string }> };

      if (!messages || !Array.isArray(messages)) {
        return Response.json({ error: "Messages required" }, { status: 400 });
      }

      const apiMessages = [
        { role: "system" as const, content: SYSTEM_PROMPT },
        ...messages.slice(-6).map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
      ];

      const zai = await getZAI();
      const response = await zai.chat.completions.create({
        messages: apiMessages,
        max_tokens: 300,
        temperature: 0.7,
      });

      const content = response.choices?.[0]?.message?.content;

      if (content && content.trim().length > 5) {
        return Response.json(
          { message: content.trim(), source: "ai" },
          {
            headers: {
              "Access-Control-Allow-Origin": "*",
              "Content-Type": "application/json",
            },
          }
        );
      }

      // Reset ZAI instance on bad response
      zaiInstance = null;

      return Response.json(
        { error: "Empty AI response", source: "ai-error" },
        {
          status: 502,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Content-Type": "application/json",
          },
        }
      );
    } catch (error) {
      console.error("AI Service error:", error);
      // Reset ZAI instance on error
      zaiInstance = null;
      return Response.json(
        { error: String(error), source: "ai-error" },
        {
          status: 500,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Content-Type": "application/json",
          },
        }
      );
    }
  },
});

console.log(`AI Service running on port ${PORT}`);
