"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, User, Mail, Lock, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { register, login, loginAsGuest } from "@/lib/auth";
import type { StoredUser } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

interface AuthScreenProps {
  onAuth: (user: StoredUser) => void;
  onBack?: () => void;
}

export default function AuthScreen({ onAuth, onBack }: AuthScreenProps) {
  const [activeTab, setActiveTab] = useState<string>("register");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { toast } = useToast();

  const handleRegister = () => {
    setError("");
    if (!name.trim()) {
      setError("يرجى إدخال الاسم");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setError("يرجى إدخال بريد إلكتروني صحيح");
      return;
    }
    if (password.length < 6) {
      setError("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
      return;
    }
    if (password !== confirmPassword) {
      setError("كلمة المرور غير متطابقة");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const user = register(name.trim(), email.trim(), password);
      setLoading(false);
      toast({
        title: "تم التسجيل بنجاح!",
        description: `مرحباً ${user.name}`,
      });
      onAuth(user);
    }, 800);
  };

  const handleLogin = () => {
    setError("");
    if (!email.trim() || !email.includes("@")) {
      setError("يرجى إدخال بريد إلكتروني صحيح");
      return;
    }
    if (!password) {
      setError("يرجى إدخال كلمة المرور");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const user = login(email.trim(), password);
      setLoading(false);
      if (user) {
        toast({
          title: "تم تسجيل الدخول بنجاح!",
          description: `مرحباً بعودتك ${user.name}`,
        });
        onAuth(user);
      } else {
        setError("البريد الإلكتروني أو كلمة المرور غير صحيحة");
      }
    }, 800);
  };

  const handleGuest = () => {
    setLoading(true);
    setTimeout(() => {
      const user = loginAsGuest();
      setLoading(false);
      toast({
        title: "مرحباً بك كزائر",
        description: "يمكنك التسجيل لاحقاً لحفظ بياناتك",
      });
      onAuth(user);
    }, 500);
  };

  return (
    <div
      className="fixed inset-0 z-40 flex flex-col items-center justify-center p-4"
      style={{ background: "#0a0e1a" }}
    >
      {/* Background decoration */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%, rgba(0,240,255,0.06) 0%, transparent 50%)",
        }}
      />

      {/* Back button */}
      {onBack && (
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          onClick={onBack}
          className="absolute top-6 right-6 flex items-center gap-2 text-sm"
          style={{ color: "#94a3b8" }}
        >
          <ArrowLeft className="w-4 h-4" />
          رجوع
        </motion.button>
      )}

      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <motion.div
          className="flex flex-col items-center mb-8"
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 glow-cyan"
            style={{ background: "linear-gradient(135deg, #00f0ff, #0080ff)" }}
          >
            <Eye className="w-8 h-8" style={{ color: "#0a0e1a" }} />
          </div>
          <h1
            className="text-3xl font-bold text-glow-cyan"
            style={{ color: "#00f0ff" }}
          >
            OptiSize
          </h1>
          <p className="text-sm mt-1" style={{ color: "#64748b" }}>
            مركز صحة العين الشامل
          </p>
        </motion.div>

        {/* Auth Card */}
        <div className="glass-card rounded-2xl p-6">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            dir="rtl"
            className="w-full"
          >
            <TabsList
              className="w-full grid grid-cols-2 mb-6"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <TabsTrigger
                value="register"
                className="data-[state=active]:bg-[#00f0ff] data-[state=active]:text-[#0a0e1a] rounded-lg transition-all"
              >
                تسجيل جديد
              </TabsTrigger>
              <TabsTrigger
                value="login"
                className="data-[state=active]:bg-[#00f0ff] data-[state=active]:text-[#0a0e1a] rounded-lg transition-all"
              >
                تسجيل الدخول
              </TabsTrigger>
            </TabsList>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
              >
                <TabsContent value="register" className="mt-0 space-y-4">
                  {/* Name */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="reg-name"
                      className="text-sm"
                      style={{ color: "#94a3b8" }}
                    >
                      الاسم الكامل
                    </Label>
                    <div className="relative">
                      <User
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4"
                        style={{ color: "#64748b" }}
                      />
                      <Input
                        id="reg-name"
                        placeholder="أدخل اسمك"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="pr-10 h-11 rounded-lg"
                        style={{
                          background: "rgba(255,255,255,0.05)",
                          border: "1px solid rgba(255,255,255,0.1)",
                          color: "#e2e8f0",
                        }}
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="reg-email"
                      className="text-sm"
                      style={{ color: "#94a3b8" }}
                    >
                      البريد الإلكتروني
                    </Label>
                    <div className="relative">
                      <Mail
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4"
                        style={{ color: "#64748b" }}
                      />
                      <Input
                        id="reg-email"
                        type="email"
                        placeholder="example@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pr-10 h-11 rounded-lg"
                        dir="ltr"
                        style={{
                          background: "rgba(255,255,255,0.05)",
                          border: "1px solid rgba(255,255,255,0.1)",
                          color: "#e2e8f0",
                          textAlign: "right",
                        }}
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="reg-password"
                      className="text-sm"
                      style={{ color: "#94a3b8" }}
                    >
                      كلمة المرور
                    </Label>
                    <div className="relative">
                      <Lock
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4"
                        style={{ color: "#64748b" }}
                      />
                      <Input
                        id="reg-password"
                        type="password"
                        placeholder="6 أحرف على الأقل"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pr-10 h-11 rounded-lg"
                        style={{
                          background: "rgba(255,255,255,0.05)",
                          border: "1px solid rgba(255,255,255,0.1)",
                          color: "#e2e8f0",
                        }}
                      />
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="reg-confirm"
                      className="text-sm"
                      style={{ color: "#94a3b8" }}
                    >
                      تأكيد كلمة المرور
                    </Label>
                    <div className="relative">
                      <Lock
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4"
                        style={{ color: "#64748b" }}
                      />
                      <Input
                        id="reg-confirm"
                        type="password"
                        placeholder="أعد كتابة كلمة المرور"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="pr-10 h-11 rounded-lg"
                        style={{
                          background: "rgba(255,255,255,0.05)",
                          border: "1px solid rgba(255,255,255,0.1)",
                          color: "#e2e8f0",
                        }}
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="login" className="mt-0 space-y-4">
                  {/* Email */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="login-email"
                      className="text-sm"
                      style={{ color: "#94a3b8" }}
                    >
                      البريد الإلكتروني
                    </Label>
                    <div className="relative">
                      <Mail
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4"
                        style={{ color: "#64748b" }}
                      />
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="example@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pr-10 h-11 rounded-lg"
                        dir="ltr"
                        style={{
                          background: "rgba(255,255,255,0.05)",
                          border: "1px solid rgba(255,255,255,0.1)",
                          color: "#e2e8f0",
                          textAlign: "right",
                        }}
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="login-password"
                      className="text-sm"
                      style={{ color: "#94a3b8" }}
                    >
                      كلمة المرور
                    </Label>
                    <div className="relative">
                      <Lock
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4"
                        style={{ color: "#64748b" }}
                      />
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="أدخل كلمة المرور"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pr-10 h-11 rounded-lg"
                        style={{
                          background: "rgba(255,255,255,0.05)",
                          border: "1px solid rgba(255,255,255,0.1)",
                          color: "#e2e8f0",
                        }}
                      />
                    </div>
                  </div>
                </TabsContent>
              </motion.div>
            </AnimatePresence>

            {/* Error message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3 px-3 py-2 rounded-lg text-sm"
                  style={{
                    background: "rgba(255,59,48,0.1)",
                    color: "#ff6b6b",
                    border: "1px solid rgba(255,59,48,0.2)",
                  }}
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit Button */}
            <Button
              onClick={activeTab === "register" ? handleRegister : handleLogin}
              disabled={loading}
              className="w-full h-11 mt-5 rounded-lg font-semibold text-base transition-all hover:opacity-90"
              style={{ background: "linear-gradient(135deg, #00f0ff, #0080ff)", color: "#0a0e1a" }}
            >
              {loading ? (
                <motion.div
                  className="w-5 h-5 border-2 border-[#0a0e1a] border-t-transparent rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                />
              ) : activeTab === "register" ? (
                "إنشاء حساب"
              ) : (
                "تسجيل الدخول"
              )}
            </Button>
          </Tabs>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div
              className="flex-1 h-px"
              style={{ background: "rgba(255,255,255,0.1)" }}
            />
            <span className="text-xs" style={{ color: "#64748b" }}>
              أو
            </span>
            <div
              className="flex-1 h-px"
              style={{ background: "rgba(255,255,255,0.1)" }}
            />
          </div>

          {/* Guest Login - Big prominent button */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              onClick={handleGuest}
              disabled={loading}
              className="w-full h-12 rounded-xl font-bold text-lg transition-all"
              style={{
                background: "linear-gradient(135deg, #a855f7, #0080ff)",
                color: "#ffffff",
                border: "none",
              }}
            >
              👤 دخول كزائر
            </Button>
          </motion.div>
          <p className="text-center text-xs mt-2" style={{ color: "#64748b" }}>
            يمكنك التسجيل لاحقاً لحفظ بياناتك
          </p>
        </div>
      </motion.div>
    </div>
  );
}
