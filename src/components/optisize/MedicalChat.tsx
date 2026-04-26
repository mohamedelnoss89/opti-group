"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Send,
  Bot,
  User,
  AlertTriangle,
  RotateCcw,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface MedicalChatProps {
  onBack: () => void;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

const quickPrompts = [
  "أعاني من جفاف العين",
  "رؤية ضبابية أحياناً",
  "ألم في العين عند استخدام الشاشة",
  "صداع متكرر مع إجهاد العين",
];

export default function MedicalChat({ onBack }: MedicalChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "مرحباً! أنا مساعدك الطبي لصحة العين 👁️ يمكنك إخباري بأي أعراض تعاني منها وسأقدم لك نصائح أولية. تذكر دائماً أن هذه النصائح للإرشاد فقط ويجب زيارة طبيب العيون للتشخيص الدقيق.",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isLoading) return;

      const userMessage: Message = {
        id: `user-${Date.now()}`,
        role: "user",
        content: text.trim(),
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setInput("");
      setIsLoading(true);

      try {
        const chatHistory = [...messages, userMessage]
          .filter((m) => m.id !== "welcome")
          .map((m) => ({
            role: m.role,
            content: m.content,
          }));

        const response = await fetch("/api/medical-chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: chatHistory }),
        });

        const data = await response.json();

        const assistantMessage: Message = {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: data.message || data.error || "عذراً، لم أتمكن من الرد.",
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, assistantMessage]);
      } catch {
        const errorMessage: Message = {
          id: `error-${Date.now()}`,
          role: "assistant",
          content:
            "عذراً، حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى. تذكر أن زيارة طبيب العيون هي الأفضل لحالتك.",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
        inputRef.current?.focus();
      }
    },
    [messages, isLoading]
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      sendMessage(input);
    },
    [input, sendMessage]
  );

  const handleReset = useCallback(() => {
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content:
          "مرحباً! أنا مساعدك الطبي لصحة العين 👁️ يمكنك إخباري بأي أعراض تعاني منها وسأقدم لك نصائح أولية.",
        timestamp: new Date(),
      },
    ]);
    setInput("");
  }, []);

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "#0a0e1a" }}
    >
      {/* Background decoration */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%, rgba(168,85,247,0.05) 0%, transparent 50%)",
        }}
      />

      {/* Header */}
      <div className="flex items-center justify-between p-4 relative z-10 shrink-0">
        <Button
          onClick={onBack}
          variant="ghost"
          size="icon"
          className="w-10 h-10 rounded-xl hover:bg-white/5"
          style={{ color: "#94a3b8" }}
        >
          <ArrowRight className="w-5 h-5" />
        </Button>
        <div className="text-center">
          <h1 className="text-base font-bold" style={{ color: "#e2e8f0" }}>
            محادثة طبية ذكية
          </h1>
          <p className="text-xs" style={{ color: "#64748b" }}>
            AI Medical Assistant
          </p>
        </div>
        <Button
          onClick={handleReset}
          variant="ghost"
          size="icon"
          className="w-10 h-10 rounded-xl hover:bg-white/5"
          style={{ color: "#94a3b8" }}
        >
          <RotateCcw className="w-5 h-5" />
        </Button>
      </div>

      {/* Medical Disclaimer Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-4 mb-2 shrink-0"
      >
        <div
          className="rounded-lg px-3 py-2 flex items-center gap-2"
          style={{
            background: "rgba(255,165,0,0.06)",
            border: "1px solid rgba(255,165,0,0.12)",
          }}
        >
          <AlertTriangle
            className="w-3.5 h-3.5 shrink-0"
            style={{ color: "#ffa500" }}
          />
          <p className="text-[10px] leading-relaxed" style={{ color: "#94a3b8" }}>
            هذه المحادثة للإرشاد العام فقط ولا تغني عن زيارة طبيب العيون المتخصص
          </p>
        </div>
      </motion.div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 relative z-10 custom-scrollbar">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.25 }}
              className={`flex gap-2.5 mb-3 ${
                msg.role === "user" ? "flex-row-reverse" : "flex-row"
              }`}
            >
              {/* Avatar */}
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{
                  background:
                    msg.role === "assistant"
                      ? "linear-gradient(135deg, #a855f7, #6366f1)"
                      : "linear-gradient(135deg, #0080ff, #0050cc)",
                }}
              >
                {msg.role === "assistant" ? (
                  <Bot className="w-4 h-4" style={{ color: "#fff" }} />
                ) : (
                  <User className="w-4 h-4" style={{ color: "#fff" }} />
                )}
              </div>

              {/* Message Bubble */}
              <div
                className="max-w-[80%] rounded-2xl px-4 py-2.5"
                style={{
                  background:
                    msg.role === "user"
                      ? "linear-gradient(135deg, rgba(0,128,255,0.15), rgba(0,80,204,0.08))"
                      : "linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
                  border:
                    msg.role === "user"
                      ? "1px solid rgba(0,128,255,0.2)"
                      : "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <p
                  className="text-sm leading-relaxed"
                  style={{
                    color: "#e2e8f0",
                  }}
                >
                  {msg.content}
                </p>
                <p
                  className="text-[9px] mt-1.5"
                  style={{
                    color: "#64748b",
                    textAlign: msg.role === "user" ? "left" : "right",
                  }}
                >
                  {msg.timestamp.toLocaleTimeString("ar-EG", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing indicator */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-2.5 mb-3"
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              style={{
                background: "linear-gradient(135deg, #a855f7, #6366f1)",
              }}
            >
              <Bot className="w-4 h-4" style={{ color: "#fff" }} />
            </div>
            <div
              className="rounded-2xl px-4 py-3 flex items-center gap-1.5"
              style={{
                background:
                  "linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <motion.div
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                className="w-2 h-2 rounded-full"
                style={{ background: "#a855f7" }}
              />
              <motion.div
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: 0.15 }}
                className="w-2 h-2 rounded-full"
                style={{ background: "#a855f7" }}
              />
              <motion.div
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: 0.3 }}
                className="w-2 h-2 rounded-full"
                style={{ background: "#a855f7" }}
              />
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts */}
      {messages.length <= 1 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="px-4 pb-2 relative z-10 shrink-0"
        >
          <p className="text-[10px] mb-2" style={{ color: "#64748b" }}>
            ابدأ المحادثة:
          </p>
          <div className="flex flex-wrap gap-2">
            {quickPrompts.map((prompt) => (
              <button
                key={prompt}
                onClick={() => sendMessage(prompt)}
                className="text-[11px] px-3 py-1.5 rounded-full transition-all active:scale-95"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "#94a3b8",
                }}
              >
                {prompt}
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Input Area */}
      <div className="px-4 pb-4 pt-2 relative z-10 shrink-0">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="اكتب أعراضك هنا..."
            disabled={isLoading}
            className="flex-1 h-11 rounded-xl px-4 text-sm outline-none transition-all"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "#e2e8f0",
            }}
            dir="rtl"
          />
          <Button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="w-11 h-11 rounded-xl p-0 shrink-0"
            style={{
              background: input.trim()
                ? "linear-gradient(135deg, #a855f7, #6366f1)"
                : "rgba(255,255,255,0.05)",
              border: input.trim()
                ? "none"
                : "1px solid rgba(255,255,255,0.08)",
            }}
          >
            {isLoading ? (
              <Loader2
                className="w-5 h-5 animate-spin"
                style={{ color: "#e2e8f0" }}
              />
            ) : (
              <Send
                className="w-5 h-5"
                style={{
                  color: input.trim() ? "#0a0e1a" : "#64748b",
                }}
              />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
