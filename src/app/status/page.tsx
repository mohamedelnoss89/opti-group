'use client';

import { useState, useCallback } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import Header from '@/components/Header';
import SideMenu from '@/components/SideMenu';
import BackToTop from '@/components/BackToTop';
import { motion } from 'framer-motion';
import {
  statusServices,
  currentIncidents,
  scheduledMaintenance,
  uptimeHistory,
  getOverallStatus,
  type ServiceStatus,
  type Incident,
  type ScheduledMaintenance,
} from '@/lib/status-data';
import { CheckCircle2, AlertTriangle, XCircle, Wrench, Clock, Shield } from 'lucide-react';
import Link from 'next/link';

const statusConfig: Record<ServiceStatus, { color: string; bgColor: string; borderColor: string; icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }> }> = {
  operational: { color: '#22c55e', bgColor: 'rgba(34,197,94,0.1)', borderColor: 'rgba(34,197,94,0.2)', icon: CheckCircle2 },
  degraded: { color: '#f59e0b', bgColor: 'rgba(245,158,11,0.1)', borderColor: 'rgba(245,158,11,0.2)', icon: AlertTriangle },
  down: { color: '#ef4444', bgColor: 'rgba(239,68,68,0.1)', borderColor: 'rgba(239,68,68,0.2)', icon: XCircle },
  maintenance: { color: '#0ea5e9', bgColor: 'rgba(14,165,233,0.1)', borderColor: 'rgba(14,165,233,0.2)', icon: Wrench },
};

const statusLabels: Record<ServiceStatus, { ar: string; en: string }> = {
  operational: { ar: 'يعمل', en: 'Operational' },
  degraded: { ar: 'أداء متدني', en: 'Degraded' },
  down: { ar: 'متوقف', en: 'Down' },
  maintenance: { ar: 'صيانة', en: 'Maintenance' },
};

const incidentStatusLabels: Record<Incident['status'], { ar: string; en: string }> = {
  investigating: { ar: 'قيد التحقيق', en: 'Investigating' },
  identified: { ar: 'تم التحديد', en: 'Identified' },
  monitoring: { ar: 'قصد المراقبة', en: 'Monitoring' },
  resolved: { ar: 'تم الحل', en: 'Resolved' },
};

function UptimeBar() {
  const { locale } = useLanguage();
  const isArabic = locale === 'ar';

  return (
    <div className="space-y-3">
      <div className={`flex items-center justify-between ${isArabic ? 'flex-row-reverse' : ''}`}>
        <span className={`text-xs font-medium ${isArabic ? 'font-arabic' : ''}`} style={{ color: 'rgba(192,192,192,0.5)' }}>
          {isArabic ? 'آخر ٩٠ يوماً' : 'Last 90 Days'}
        </span>
        <span className="text-xs font-medium" style={{ color: '#22c55e' }}>
          99.94%
        </span>
      </div>
      <div className="flex gap-[2px] h-8" style={{ direction: 'ltr' }}>
        {uptimeHistory.map((day, index) => {
          const config = statusConfig[day.status];
          return (
            <motion.div
              key={day.date}
              className="flex-1 rounded-sm cursor-pointer relative group"
              style={{
                backgroundColor: config.color,
                opacity: day.status === 'operational' ? 0.7 : 0.9,
                minWidth: '2px',
              }}
              initial={{ opacity: 0, scaleY: 0 }}
              animate={{ opacity: day.status === 'operational' ? 0.7 : 0.9, scaleY: 1 }}
              transition={{ duration: 0.2, delay: index * 0.005 }}
              title={`${day.date} — ${day.uptime}%`}
            />
          );
        })}
      </div>
      {/* Legend */}
      <div className={`flex items-center gap-4 ${isArabic ? 'flex-row-reverse font-arabic' : ''}`}>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: '#22c55e', opacity: 0.7 }} />
          <span className="text-[10px]" style={{ color: 'rgba(192,192,192,0.4)' }}>
            {isArabic ? 'يعمل' : 'Operational'}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: '#f59e0b', opacity: 0.9 }} />
          <span className="text-[10px]" style={{ color: 'rgba(192,192,192,0.4)' }}>
            {isArabic ? 'أداء متدني' : 'Degraded'}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: '#ef4444', opacity: 0.9 }} />
          <span className="text-[10px]" style={{ color: 'rgba(192,192,192,0.4)' }}>
            {isArabic ? 'متوقف' : 'Down'}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function StatusPage() {
  const { t, locale, dir } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isArabic = locale === 'ar';

  const handleMenuToggle = useCallback(() => {
    setIsMenuOpen((prev) => !prev);
  }, []);

  const handleMenuClose = useCallback(() => {
    setIsMenuOpen(false);
  }, []);

  const handleNavigate = useCallback((sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 80;
      const top = element.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  }, []);

  const overallStatus = getOverallStatus(statusServices);
  const overallConfig = statusConfig[overallStatus];
  const OverallIcon = overallConfig.icon;

  return (
    <div dir={dir} className="min-h-screen flex flex-col" style={{ background: '#0a0e1a' }}>
      <Header onMenuToggle={handleMenuToggle} />
      <SideMenu
        isOpen={isMenuOpen}
        onClose={handleMenuClose}
        onNavigate={handleNavigate}
        onContactClick={() => handleNavigate('section-contact')}
      />

      <main className="flex-1 pt-20 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Overall Status Banner */}
          <motion.div
            className="rounded-2xl p-8 text-center mb-10"
            style={{
              background: overallConfig.bgColor,
              border: `1px solid ${overallConfig.borderColor}`,
              backdropFilter: 'blur(12px)',
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              className="mx-auto mb-4 w-16 h-16 rounded-full flex items-center justify-center"
              style={{
                background: `${overallConfig.color}20`,
                border: `2px solid ${overallConfig.color}40`,
              }}
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', damping: 15 }}
            >
              <OverallIcon className="w-8 h-8" style={{ color: overallConfig.color }} />
            </motion.div>
            <h1
              className={`text-2xl sm:text-3xl font-bold mb-2 ${isArabic ? 'font-arabic' : ''}`}
              style={{ color: overallConfig.color }}
            >
              {overallStatus === 'operational'
                ? t.statusAllOperational
                : overallStatus === 'degraded'
                ? t.statusPartialOutage
                : overallStatus === 'down'
                ? t.statusMajorOutage
                : t.statusMaintenance
              }
            </h1>
            <p
              className={`text-sm ${isArabic ? 'font-arabic' : ''}`}
              style={{ color: 'rgba(192,192,192,0.5)' }}
            >
              {isArabic
                ? 'آخر تحديث: الآن'
                : 'Last updated: Just now'}
            </p>
          </motion.div>

          {/* Uptime Graph */}
          <motion.div
            className="rounded-2xl p-6 mb-8"
            style={{
              background: 'rgba(26, 31, 54, 0.5)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(14,165,233,0.08)',
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h2
              className={`text-base font-bold mb-4 ${isArabic ? 'font-arabic' : ''}`}
              style={{ color: 'rgba(232,232,232,0.9)' }}
            >
              {t.statusUptime}
            </h2>
            <UptimeBar />
          </motion.div>

          {/* Services List */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h2
              className={`text-base font-bold mb-4 ${isArabic ? 'font-arabic' : ''}`}
              style={{ color: 'rgba(232,232,232,0.9)' }}
            >
              {isArabic ? 'الخدمات' : 'Services'}
            </h2>
            <div className="space-y-3">
              {statusServices.map((service, index) => {
                const config = statusConfig[service.status];
                const Icon = config.icon;
                return (
                  <motion.div
                    key={service.id}
                    className="rounded-xl p-4"
                    style={{
                      background: 'rgba(26, 31, 54, 0.4)',
                      backdropFilter: 'blur(12px)',
                      border: `1px solid rgba(14,165,233,0.06)`,
                    }}
                    initial={{ opacity: 0, x: isArabic ? 10 : -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.25 + index * 0.05 }}
                  >
                    <div className={`flex items-center justify-between ${isArabic ? 'flex-row-reverse' : ''}`}>
                      <div className={`flex items-center gap-3 ${isArabic ? 'flex-row-reverse' : ''}`}>
                        <div
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                          style={{
                            backgroundColor: config.color,
                            boxShadow: `0 0 8px ${config.color}60`,
                          }}
                        />
                        <div className={isArabic ? 'text-right' : ''}>
                          <h3
                            className={`text-sm font-semibold ${isArabic ? 'font-arabic' : ''}`}
                            style={{ color: 'rgba(232,232,232,0.9)' }}
                          >
                            {service.name[locale]}
                          </h3>
                          <p
                            className={`text-xs mt-0.5 ${isArabic ? 'font-arabic' : ''}`}
                            style={{ color: 'rgba(192,192,192,0.4)' }}
                          >
                            {service.description[locale]}
                          </p>
                        </div>
                      </div>
                      <div className={`flex items-center gap-3 ${isArabic ? 'flex-row-reverse' : ''}`}>
                        <span
                          className={`text-xs font-medium px-2.5 py-1 rounded-full ${isArabic ? 'font-arabic' : ''}`}
                          style={{
                            background: config.bgColor,
                            color: config.color,
                            border: `1px solid ${config.borderColor}`,
                          }}
                        >
                          {statusLabels[service.status][locale]}
                        </span>
                        <span
                          className="text-xs font-medium"
                          style={{ color: 'rgba(192,192,192,0.4)' }}
                        >
                          {service.uptime}%
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Incidents Section */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h2
              className={`text-base font-bold mb-4 ${isArabic ? 'font-arabic' : ''}`}
              style={{ color: 'rgba(232,232,232,0.9)' }}
            >
              {t.statusIncidents}
            </h2>
            {currentIncidents.length > 0 ? (
              <div className="space-y-3">
                {currentIncidents.map((incident) => {
                  const service = statusServices.find((s) => s.id === incident.serviceId);
                  return (
                    <div
                      key={incident.id}
                      className="rounded-xl p-4"
                      style={{
                        background: 'rgba(239,68,68,0.05)',
                        border: '1px solid rgba(239,68,68,0.15)',
                      }}
                    >
                      <div className={`flex items-start justify-between ${isArabic ? 'flex-row-reverse' : ''}`}>
                        <div className={isArabic ? 'text-right' : ''}>
                          <h3
                            className={`text-sm font-semibold ${isArabic ? 'font-arabic' : ''}`}
                            style={{ color: 'rgba(232,232,232,0.9)' }}
                          >
                            {incident.title[locale]}
                          </h3>
                          <p className="text-xs mt-1" style={{ color: 'rgba(192,192,192,0.4)' }}>
                            {service?.name[locale]}
                          </p>
                        </div>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${isArabic ? 'font-arabic' : ''}`}
                          style={{
                            background: 'rgba(239,68,68,0.1)',
                            color: '#ef4444',
                            border: '1px solid rgba(239,68,68,0.2)',
                          }}
                        >
                          {incidentStatusLabels[incident.status][locale]}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div
                className="rounded-xl p-6 text-center"
                style={{
                  background: 'rgba(26, 31, 54, 0.3)',
                  border: '1px solid rgba(34,197,94,0.1)',
                }}
              >
                <CheckCircle2 className="w-6 h-6 mx-auto mb-2" style={{ color: 'rgba(34,197,94,0.5)' }} />
                <p
                  className={`text-sm ${isArabic ? 'font-arabic' : ''}`}
                  style={{ color: 'rgba(192,192,192,0.4)' }}
                >
                  {t.statusNoIncidents}
                </p>
              </div>
            )}
          </motion.div>

          {/* Scheduled Maintenance */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
          >
            <h2
              className={`text-base font-bold mb-4 ${isArabic ? 'font-arabic' : ''}`}
              style={{ color: 'rgba(232,232,232,0.9)' }}
            >
              {t.statusScheduledMaintenance}
            </h2>
            {scheduledMaintenance.length > 0 ? (
              <div className="space-y-3">
                {scheduledMaintenance.map((maint) => (
                  <div
                    key={maint.id}
                    className="rounded-xl p-4"
                    style={{
                      background: 'rgba(14,165,233,0.05)',
                      border: '1px solid rgba(14,165,233,0.15)',
                    }}
                  >
                    <div className={`flex items-start justify-between ${isArabic ? 'flex-row-reverse' : ''}`}>
                      <div className={isArabic ? 'text-right' : ''}>
                        <h3
                          className={`text-sm font-semibold ${isArabic ? 'font-arabic' : ''}`}
                          style={{ color: 'rgba(232,232,232,0.9)' }}
                        >
                          {maint.title[locale]}
                        </h3>
                        <p
                          className={`text-xs mt-1 ${isArabic ? 'font-arabic' : ''}`}
                          style={{ color: 'rgba(192,192,192,0.4)' }}
                        >
                          {maint.description[locale]}
                        </p>
                      </div>
                      <div className={`flex items-center gap-1 text-xs ${isArabic ? 'flex-row-reverse font-arabic' : ''}`} style={{ color: 'rgba(14,165,233,0.7)' }}>
                        <Clock className="w-3 h-3" />
                        <span>
                          {new Date(maint.startAt).toLocaleDateString(isArabic ? 'ar-EG' : 'en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div
                className="rounded-xl p-6 text-center"
                style={{
                  background: 'rgba(26, 31, 54, 0.3)',
                  border: '1px solid rgba(14,165,233,0.08)',
                }}
              >
                <Shield className="w-6 h-6 mx-auto mb-2" style={{ color: 'rgba(14,165,233,0.3)' }} />
                <p
                  className={`text-sm ${isArabic ? 'font-arabic' : ''}`}
                  style={{ color: 'rgba(192,192,192,0.4)' }}
                >
                  {t.statusNoMaintenance}
                </p>
              </div>
            )}
          </motion.div>

          {/* Subscribe / Status History Note */}
          <motion.div
            className="rounded-2xl p-6 text-center"
            style={{
              background: 'rgba(26, 31, 54, 0.3)',
              border: '1px solid rgba(14,165,233,0.06)',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <p
              className={`text-xs ${isArabic ? 'font-arabic' : ''}`}
              style={{ color: 'rgba(192,192,192,0.3)' }}
            >
              {isArabic
                ? 'يتم تحديث حالة الخدمات تلقائياً. تابع هذه الصفحة لمعرفة آخر التحديثات.'
                : 'Service status is updated automatically. Bookmark this page for the latest updates.'}
            </p>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer
        className="py-8 px-4"
        style={{
          background: 'rgba(10, 14, 26, 0.9)',
          borderTop: '1px solid rgba(192,192,192,0.06)',
        }}
      >
        <div className="max-w-7xl mx-auto text-center">
          <p
            className={`text-xs ${isArabic ? 'font-arabic' : ''}`}
            style={{ color: 'rgba(192,192,192,0.2)' }}
          >
            {t.footerText}
          </p>
        </div>
      </footer>

      <BackToTop />
    </div>
  );
}
