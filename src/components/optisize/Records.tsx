"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Trash2,
  FileX,
  Eye,
  Calendar,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getRecords,
  deleteRecord,
  clearRecords,
  type Record as StoredRecord,
} from "@/lib/storage";

interface RecordsProps {
  onBack: () => void;
}

export default function Records({ onBack }: RecordsProps) {
  const [records, setRecords] = useState<StoredRecord[]>(() => {
    if (typeof window === "undefined") return [];
    return getRecords();
  });
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = useCallback((id: string) => {
    setDeletingId(id);
    setTimeout(() => {
      deleteRecord(id);
      setRecords(getRecords());
      setDeletingId(null);
    }, 300);
  }, []);

  const handleClearAll = useCallback(() => {
    clearRecords();
    setRecords([]);
    setShowClearConfirm(false);
  }, []);

  const formatDate = (timestamp: string) => {
    const d = new Date(timestamp);
    return d.toLocaleDateString("ar-SA", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (timestamp: string) => {
    const d = new Date(timestamp);
    return d.toLocaleTimeString("ar-SA", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getRecordIcon = (type: string) => {
    switch (type) {
      case "pd":
        return Eye;
      default:
        return Eye;
    }
  };

  const getRecordTitle = (record: StoredRecord) => {
    switch (record.type) {
      case "pd":
        return "قياس مسافة البؤبؤ";
      default:
        return record.title;
    }
  };

  const getRecordValue = (record: StoredRecord) => {
    const data = record.data as { pd?: number; value?: number };
    const pd = data?.pd ?? data?.value;
    return pd ? `${pd} مم` : null;
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#0a0e1a" }}>
      {/* Background decoration */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at 50% 0%, rgba(0,128,255,0.05) 0%, transparent 50%)",
        }}
      />

      {/* Header */}
      <div className="flex items-center justify-between p-4 relative z-10">
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
            السجلات المحفوظة
          </h1>
          <p className="text-xs" style={{ color: "#64748b" }}>
            Saved Records ({records.length})
          </p>
        </div>
        {records.length > 0 && !showClearConfirm && (
          <Button
            onClick={() => setShowClearConfirm(true)}
            variant="ghost"
            size="icon"
            className="w-10 h-10 rounded-xl hover:bg-red-500/10"
            style={{ color: "#ff3b30" }}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
        {records.length === 0 && <div className="w-10" />}
      </div>

      <div className="flex-1 px-4 relative z-10">
        {/* Clear All Confirmation */}
        <AnimatePresence>
          {showClearConfirm && (
            <motion.div
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              className="mb-4 overflow-hidden"
            >
              <div
                className="flex items-center justify-between p-3 rounded-xl"
                style={{
                  background: "rgba(255, 59, 48, 0.08)",
                  border: "1px solid rgba(255, 59, 48, 0.2)",
                }}
              >
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" style={{ color: "#ff3b30" }} />
                  <p className="text-xs" style={{ color: "#ff6b6b" }}>
                    مسح جميع السجلات؟
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={handleClearAll}
                    size="sm"
                    className="h-7 px-3 rounded-lg text-xs"
                    style={{
                      background: "rgba(255, 59, 48, 0.2)",
                      color: "#ff3b30",
                      border: "none",
                    }}
                  >
                    مسح
                  </Button>
                  <Button
                    onClick={() => setShowClearConfirm(false)}
                    size="sm"
                    variant="ghost"
                    className="h-7 px-3 rounded-lg text-xs"
                    style={{ color: "#94a3b8" }}
                  >
                    إلغاء
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Records List */}
        {records.length > 0 ? (
          <div className="space-y-3 pb-8">
            <AnimatePresence>
              {records.map((record, index) => {
                const Icon = getRecordIcon(record.type);
                const value = getRecordValue(record);
                return (
                  <motion.div
                    key={record.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{
                      opacity: deletingId === record.id ? 0 : 1,
                      x: deletingId === record.id ? 100 : 0,
                      height: deletingId === record.id ? 0 : "auto",
                    }}
                    exit={{ opacity: 0, x: 100, height: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div
                      className="flex items-center gap-3 p-4 rounded-xl"
                      style={{
                        background: "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)",
                        border: "1px solid rgba(255,255,255,0.08)",
                      }}
                    >
                      {/* Icon */}
                      <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                        style={{
                          background: record.type === "pd"
                            ? "linear-gradient(135deg, #00f0ff20, #0080ff20)"
                            : "linear-gradient(135deg, #a855f720, #6366f120)",
                        }}
                      >
                        <Icon className="w-5 h-5" style={{ color: record.type === "pd" ? "#00f0ff" : "#a855f7" }} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate" style={{ color: "#e2e8f0" }}>
                          {getRecordTitle(record)}
                        </p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="flex items-center gap-1 text-[10px]" style={{ color: "#64748b" }}>
                            <Calendar className="w-3 h-3" />
                            {formatDate(record.timestamp)}
                          </span>
                          <span className="flex items-center gap-1 text-[10px]" style={{ color: "#64748b" }}>
                            <Clock className="w-3 h-3" />
                            {formatTime(record.timestamp)}
                          </span>
                        </div>
                      </div>

                      {/* Value */}
                      {value && (
                        <div className="text-left shrink-0">
                          <p className="text-lg font-bold" style={{ color: "#00f0ff" }}>
                            {value}
                          </p>
                        </div>
                      )}

                      {/* Delete button */}
                      <Button
                        onClick={() => handleDelete(record.id)}
                        variant="ghost"
                        size="icon"
                        className="w-8 h-8 rounded-lg hover:bg-red-500/10 shrink-0"
                        style={{ color: "#64748b" }}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        ) : (
          /* Empty State */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center mb-4"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <FileX className="w-10 h-10" style={{ color: "#64748b" }} />
            </div>
            <p className="text-base font-medium mb-1" style={{ color: "#94a3b8" }}>
              لا توجد قياسات محفوظة
            </p>
            <p className="text-xs text-center max-w-[200px]" style={{ color: "#64748b" }}>
              قم بإجراء قياس مسافة البؤبؤ وسيتم حفظه هنا تلقائياً
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
