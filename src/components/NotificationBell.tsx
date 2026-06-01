'use client';

import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, BellOff, Info, RefreshCw, Megaphone } from 'lucide-react';

interface Notification {
  id: string;
  title: { ar: string; en: string };
  message: { ar: string; en: string };
  type: 'info' | 'update' | 'promo';
  read: boolean;
  created_at: string;
}

// Sample notifications (used when API fails or no Supabase table exists)
const sampleNotifications: Notification[] = [
  {
    id: '1',
    title: { ar: 'مرحباً بك في مجموعة أوبتي!', en: 'Welcome to Opti Group!' },
    message: {
      ar: 'شكراً لانضمامك! استكشف تطبيقاتنا الذكية وابقَ على اطلاع بأحدث الأخبار.',
      en: 'Thanks for joining! Explore our smart apps and stay updated with the latest news.',
    },
    type: 'info',
    read: false,
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    title: { ar: 'تحديث أوبتي سايز v2.0', en: 'OptiSize Update v2.0' },
    message: {
      ar: 'تم إطلاق التحديث الجديد مع ميزات محسنة لقياس مسافة البؤبؤ واختبارات النظر.',
      en: 'The new update has been released with improved PD measurement and vision tests.',
    },
    type: 'update',
    read: false,
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: '3',
    title: { ar: 'تطبيق جديد قريباً!', en: 'New App Coming Soon!' },
    message: {
      ar: 'ترقبوا إطلاق تطبيق أوبتي فيت - مدربك الشخصي لللياقة البدنية بالذكاء الاصطناعي.',
      en: 'Stay tuned for the launch of OptiFit — your AI-powered personal fitness trainer.',
    },
    type: 'promo',
    read: true,
    created_at: new Date(Date.now() - 172800000).toISOString(),
  },
];

export default function NotificationBell() {
  const { t, locale } = useLanguage();
  const isArabic = locale === 'ar';
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(sampleNotifications);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/notifications');
        if (response.ok) {
          const data = await response.json();
          if (data.notifications && data.notifications.length > 0) {
            setNotifications(data.notifications);
          }
          // Keep sample notifications if API returns empty
        }
      } catch {
        // Keep sample notifications on error
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const markAsRead = async (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    );

    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: notificationId }),
      });
    } catch {
      // silent fail
    }
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    notifications.forEach((n) => {
      if (!n.read) markAsRead(n.id);
    });
  };

  const getTypeIcon = (type: Notification['type']) => {
    switch (type) {
      case 'info':
        return <Info className="w-4 h-4" />;
      case 'update':
        return <RefreshCw className="w-4 h-4" />;
      case 'promo':
        return <Megaphone className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: Notification['type']) => {
    switch (type) {
      case 'info':
        return '#0ea5e9';
      case 'update':
        return '#22c55e';
      case 'promo':
        return '#f59e0b';
    }
  };

  const formatTimeAgo = (dateStr: string) => {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return isArabic ? 'الآن' : 'Just now';
    if (diffMins < 60) return isArabic ? `منذ ${diffMins} دقيقة` : `${diffMins}m ago`;
    if (diffHours < 24) return isArabic ? `منذ ${diffHours} ساعة` : `${diffHours}h ago`;
    return isArabic ? `منذ ${diffDays} يوم` : `${diffDays}d ago`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl transition-colors cursor-pointer"
        style={{ background: 'rgba(255,255,255,0.03)' }}
        whileHover={{ scale: 1.1, background: 'rgba(255,255,255,0.06)' }}
        whileTap={{ scale: 0.9 }}
        aria-label={t.notificationsTitle}
      >
        <Bell className="w-4 h-4" style={{ color: 'rgba(192,192,192,0.6)' }} />
        {/* Unread badge */}
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              className="absolute -top-0.5 -right-0.5 flex items-center justify-center w-4 h-4 rounded-full text-[9px] font-bold"
              style={{
                background: '#ef4444',
                color: '#fff',
              }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 25 }}
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className={`absolute top-full mt-2 w-80 rounded-2xl overflow-hidden z-50 ${isArabic ? 'left-0' : 'right-0'}`}
            style={{
              background: 'rgba(16, 20, 38, 0.98)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              border: '1px solid rgba(192,192,192,0.08)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 40px rgba(14,165,233,0.05)',
            }}
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between p-4"
              style={{
                background: 'linear-gradient(135deg, rgba(14,165,233,0.06), rgba(14,165,233,0.01))',
                borderBottom: '1px solid rgba(192,192,192,0.06)',
              }}
            >
              <h3
                className={`text-sm font-semibold ${isArabic ? 'font-arabic' : ''}`}
                style={{ color: 'rgba(232,232,232,0.9)' }}
              >
                {t.notificationsTitle}
              </h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className={`text-xs cursor-pointer transition-colors ${isArabic ? 'font-arabic' : ''}`}
                  style={{ color: '#0ea5e9' }}
                >
                  {t.notificationsMarkRead}
                </button>
              )}
            </div>

            {/* Notification list */}
            <div className="max-h-80 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
              {loading ? (
                <div className="p-8 text-center">
                  <div
                    className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin mx-auto mb-2"
                    style={{ borderColor: 'rgba(14,165,233,0.3)', borderTopColor: 'transparent' }}
                  />
                  <p
                    className={`text-xs ${isArabic ? 'font-arabic' : ''}`}
                    style={{ color: 'rgba(192,192,192,0.4)' }}
                  >
                    {isArabic ? 'جاري التحميل...' : 'Loading...'}
                  </p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <BellOff
                    className="w-8 h-8 mx-auto mb-3"
                    style={{ color: 'rgba(192,192,192,0.15)' }}
                  />
                  <p
                    className={`text-xs ${isArabic ? 'font-arabic' : ''}`}
                    style={{ color: 'rgba(192,192,192,0.4)' }}
                  >
                    {t.notificationsEmpty}
                  </p>
                </div>
              ) : (
                <div>
                  {notifications.map((notification, index) => {
                    const typeColor = getTypeColor(notification.type);
                    return (
                      <div key={notification.id}>
                        {index > 0 && (
                          <div
                            className="mx-4 h-px"
                            style={{ background: 'rgba(192,192,192,0.04)' }}
                          />
                        )}
                        <motion.div
                          className={`flex items-start gap-3 p-4 cursor-pointer transition-all ${isArabic ? 'flex-row-reverse' : ''}`}
                          style={{
                            background: notification.read
                              ? 'transparent'
                              : 'rgba(14,165,233,0.03)',
                          }}
                          onClick={() => markAsRead(notification.id)}
                          whileHover={{ background: 'rgba(255,255,255,0.02)' }}
                        >
                          {/* Type icon */}
                          <div
                            className="flex-shrink-0 p-2 rounded-xl"
                            style={{
                              background: `${typeColor}10`,
                              border: `1px solid ${typeColor}20`,
                            }}
                          >
                            <span style={{ color: typeColor }}>
                              {getTypeIcon(notification.type)}
                            </span>
                          </div>

                          {/* Content */}
                          <div className={`flex-1 min-w-0 ${isArabic ? 'text-right' : 'text-left'}`}>
                            <div className="flex items-start justify-between gap-2">
                              <p
                                className={`text-xs font-semibold leading-relaxed ${isArabic ? 'font-arabic' : ''}`}
                                style={{
                                  color: notification.read
                                    ? 'rgba(192,192,192,0.5)'
                                    : 'rgba(232,232,232,0.9)',
                                }}
                              >
                                {isArabic ? notification.title.ar : notification.title.en}
                              </p>
                              {!notification.read && (
                                <div
                                  className="flex-shrink-0 w-2 h-2 rounded-full mt-1"
                                  style={{ background: '#0ea5e9' }}
                                />
                              )}
                            </div>
                            <p
                              className={`text-xs mt-1 leading-relaxed ${isArabic ? 'font-arabic' : ''}`}
                              style={{ color: 'rgba(192,192,192,0.4)' }}
                            >
                              {isArabic ? notification.message.ar : notification.message.en}
                            </p>
                            <p
                              className={`text-[10px] mt-1.5 ${isArabic ? 'font-arabic' : ''}`}
                              style={{ color: 'rgba(192,192,192,0.25)' }}
                            >
                              {formatTimeAgo(notification.created_at)}
                            </p>
                          </div>
                        </motion.div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
