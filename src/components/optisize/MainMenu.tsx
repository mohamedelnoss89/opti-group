"use client";

import { motion } from "framer-motion";
import {
  Eye,
  Stethoscope,
  Heart,
  Glasses,
  History,
  LogOut,
  Info,
  Mail,
  Ruler,
  Sparkles,
  Save,
  Cpu,
  Sun,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { StoredUser } from "@/lib/auth";
import { logout } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from "@/lib/i18n";

interface MainMenuProps {
  user: StoredUser;
  onNavigate: (screen: string) => void;
  onLogout: () => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

export default function MainMenu({
  user,
  onNavigate,
  onLogout,
}: MainMenuProps) {
  const { toast } = useToast();
  const { t, isRTL } = useI18n();

  const mainActions = [
    {
      id: "scanner",
      label: t("menu.pd"),
      description: "قياس مسافة البؤبؤ",
      icon: Eye,
      gradient: "linear-gradient(135deg, #00f0ff, #0080ff)",
      glowClass: "glow-cyan",
    },
    {
      id: "vision-test",
      label: t("menu.vision"),
      description: "اختبارات النظر",
      icon: Stethoscope,
      gradient: "linear-gradient(135deg, #a855f7, #6366f1)",
      glowClass: "glow-purple",
    },
    {
      id: "health-center",
      label: t("menu.health"),
      description: "مركز صحة العين",
      icon: Heart,
      gradient: "linear-gradient(135deg, #ff3b30, #ff6b6b)",
      glowClass: "glow-red",
    },
    {
      id: "glasses-catalog",
      label: t("menu.glasses"),
      description: "معرض النظارات",
      icon: Glasses,
      gradient: "linear-gradient(135deg, #ffa500, #ff6b00)",
      glowClass: "glow-orange",
    },
    {
      id: "records",
      label: t("menu.records"),
      description: "السجلات المحفوظة",
      icon: History,
      gradient: "linear-gradient(135deg, #0080ff, #0050cc)",
      glowClass: "glow-blue",
    },
  ];

  const features = [
    {
      icon: Ruler,
      label: t("menu.pdDesc"),
      color: "#00f0ff",
    },
    {
      icon: Cpu,
      label: t("menu.pdFeat"),
      color: "#a855f7",
    },
    {
      icon: Save,
      label: t("menu.saveFeat"),
      color: "#00d4aa",
    },
    {
      icon: Sparkles,
      label: t("menu.uiFeat"),
      color: "#ffa500",
    },
  ];

  // Quick tools in main menu (Light Sensitivity + Export)
  const quickTools = [
    {
      id: "light-sensitivity",
      label: t("light.title"),
      subtitle: "تحسس الإضاءة",
      icon: Sun,
      gradient: "linear-gradient(135deg, #fbbf24, #f59e0b)",
      color: "#fbbf24",
    },
    {
      id: "records",
      label: t("records.export"),
      subtitle: "تصدير وفرز",
      icon: Download,
      gradient: "linear-gradient(135deg, #00d4aa, #00a88a)",
      color: "#00d4aa",
    },
  ];

  const handleLogout = () => {
    logout();
    toast({ title: t("menu.toast.loggedOut"), description: t("menu.toast.bye") });
    onLogout();
  };

  return (
    <div
      className="min-h-screen pb-8"
      style={{ background: "#0a0e1a" }}
    >
      {/* Background decoration */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%, rgba(0,240,255,0.05) 0%, transparent 50%)",
        }}
      />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative max-w-lg mx-auto px-4 pt-6"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center glow-cyan"
              style={{ background: "linear-gradient(135deg, #00f0ff, #0080ff)" }}
            >
              <Eye className="w-6 h-6" style={{ color: "#0a0e1a" }} />
            </div>
            <div>
              <h1
                className="text-xl font-bold text-glow-cyan"
                style={{ color: "#00f0ff" }}
              >
                OptiSize
              </h1>
              <p className="text-xs" style={{ color: "#64748b" }}>
                {t("menu.subtitle")}
              </p>
            </div>
          </div>

          {/* User bar */}
          <div className="flex items-center gap-2">
            <div className="text-left">
              <p className="text-sm font-medium" style={{ color: "#e2e8f0" }}>
                {user.name}
              </p>
              {user.isGuest && (
                <p className="text-[10px]" style={{ color: "#64748b" }}>
                  {t("menu.guest")}
                </p>
              )}
            </div>
            <Button
              onClick={handleLogout}
              variant="ghost"
              size="icon"
              className="w-9 h-9 rounded-lg hover:bg-white/5 transition-colors"
              style={{ color: "#94a3b8" }}
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>

        {/* Main Action Cards */}
        <motion.div variants={itemVariants} className="space-y-3 mb-6">
          <h2
            className="text-sm font-semibold mb-3"
            style={{ color: "#94a3b8" }}
          >
            {t("menu.services")}
          </h2>
          <div className="grid grid-cols-1 gap-3">
            {mainActions.map((action, index) => (
              <motion.button
                key={action.id}
                onClick={() => onNavigate(action.id)}
                className="w-full text-right rounded-xl p-4 transition-all duration-200 group"
                style={{
                  background: "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
                whileHover={{
                  scale: 1.015,
                  borderColor: "rgba(255,255,255,0.15)",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
                }}
                whileTap={{ scale: 0.985 }}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.06, duration: 0.3 }}
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-200"
                    style={{ background: action.gradient }}
                  >
                    <action.icon className="w-6 h-6" style={{ color: "#0a0e1a" }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-base font-semibold"
                      style={{ color: "#e2e8f0" }}
                    >
                      {action.label}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: "#64748b" }}>
                      {action.description}
                    </p>
                  </div>
                  <div
                    className="w-2 h-2 rounded-full shrink-0 opacity-40 group-hover:opacity-100 transition-opacity"
                    style={{
                      background: action.gradient,
                    }}
                  />
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Feature Cards */}
        <motion.div variants={itemVariants} className="mb-6">
          <h2
            className="text-sm font-semibold mb-3"
            style={{ color: "#94a3b8" }}
          >
            {t("menu.features")}
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {features.map((feature, index) => (
              <motion.div
                key={feature.label}
                className="glass-card rounded-xl p-3 text-center"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + index * 0.06 }}
                whileHover={{ scale: 1.03 }}
              >
                <feature.icon
                  className="w-5 h-5 mx-auto mb-2"
                  style={{ color: feature.color }}
                />
                <p
                  className="text-xs font-medium"
                  style={{ color: "#e2e8f0" }}
                >
                  {feature.label}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Quick Tools (Light Sensitivity + Export) */}
        <motion.div variants={itemVariants} className="mb-6">
          <h2 className="text-sm font-semibold mb-3" style={{ color: "#94a3b8" }}>
            أدوات سريعة
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {quickTools.map((tool, index) => (
              <motion.button
                key={tool.id}
                onClick={() => onNavigate(tool.id)}
                className="glass-card rounded-xl p-4 text-center transition-all duration-200 group"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + index * 0.06 }}
                whileHover={{ scale: 1.03, borderColor: `${tool.color}30` }}
                whileTap={{ scale: 0.97 }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform"
                  style={{ background: tool.gradient }}
                >
                  <tool.icon className="w-5 h-5" style={{ color: "#0a0e1a" }} />
                </div>
                <p className="text-xs font-semibold" style={{ color: "#e2e8f0" }}>
                  {tool.label}
                </p>
                <p className="text-[10px] mt-0.5" style={{ color: tool.color }}>
                  {tool.subtitle}
                </p>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Disclaimer */}
        <motion.div
          variants={itemVariants}
          className="glass-card rounded-xl p-4 mb-6"
        >
          <div className="flex gap-3">
            <Info
              className="w-5 h-5 shrink-0 mt-0.5"
              style={{ color: "#ffa500" }}
            />
            <p
              className="text-xs leading-relaxed"
              style={{ color: "#94a3b8" }}
            >
              {t("menu.disclaimer")}
            </p>
          </div>
        </motion.div>

        {/* Contact Button */}
        <motion.div variants={itemVariants} className="mb-6">
          <Button
            asChild
            className="w-full h-11 rounded-xl font-medium transition-all hover:opacity-90"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "#e2e8f0",
            }}
          >
            <a href="mailto:mohamed10.mohamed10@gmail.com">
              <Mail
                className={`w-4 h-4 ${isRTL ? "ml-2" : "mr-2"}`}
                style={{ color: "#00f0ff" }}
              />
              {t("menu.contact")}
            </a>
          </Button>
        </motion.div>

        {/* Footer */}
        <motion.div variants={itemVariants} className="text-center pt-4">
          <div
            className="h-px mx-auto mb-4 max-w-[200px]"
            style={{ background: "rgba(255,255,255,0.08)" }}
          />
          <p className="text-xs" style={{ color: "#64748b" }}>
            {t("menu.rights")}
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
