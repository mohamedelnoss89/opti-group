export type ServiceStatus = 'operational' | 'degraded' | 'down' | 'maintenance';

export interface StatusService {
  id: string;
  name: { ar: string; en: string };
  status: ServiceStatus;
  description: { ar: string; en: string };
  uptime: number;
}

export interface Incident {
  id: string;
  title: { ar: string; en: string };
  status: 'investigating' | 'identified' | 'monitoring' | 'resolved';
  serviceId: string;
  startedAt: string;
  updatedAt: string;
  updates: {
    status: string;
    message: { ar: string; en: string };
    time: string;
  }[];
}

export interface ScheduledMaintenance {
  id: string;
  title: { ar: string; en: string };
  serviceId: string;
  startAt: string;
  endAt: string;
  description: { ar: string; en: string };
}

export interface UptimeDay {
  date: string;
  status: ServiceStatus;
  uptime: number;
}

export const statusServices: StatusService[] = [
  {
    id: 'optisize-app',
    name: { ar: 'تطبيق أوبتي سايز', en: 'OptiSize App' },
    status: 'operational',
    description: { ar: 'مركز صحة العين الشامل', en: 'Comprehensive Eye Health Center' },
    uptime: 99.98,
  },
  {
    id: 'opti-group-website',
    name: { ar: 'موقع مجموعة أوبتي', en: 'Opti Group Website' },
    status: 'operational',
    description: { ar: 'الموقع الرسمي والمنصة الرئيسية', en: 'Official website and main platform' },
    uptime: 99.95,
  },
  {
    id: 'auth-system',
    name: { ar: 'نظام المصادقة', en: 'Authentication System' },
    status: 'operational',
    description: { ar: 'تسجيل الدخول وإدارة الحسابات', en: 'Login and account management' },
    uptime: 99.97,
  },
  {
    id: 'api-services',
    name: { ar: 'خدمات API', en: 'API Services' },
    status: 'operational',
    description: { ar: 'واجهات البرمجة والخدمات الخلفية', en: 'API endpoints and backend services' },
    uptime: 99.93,
  },
  {
    id: 'contact-form',
    name: { ar: 'نموذج الاتصال', en: 'Contact Form' },
    status: 'operational',
    description: { ar: 'إرسال واستقبال رسائل التواصل', en: 'Contact message sending and receiving' },
    uptime: 99.99,
  },
  {
    id: 'newsletter-service',
    name: { ar: 'خدمة النشرة البريدية', en: 'Newsletter Service' },
    status: 'operational',
    description: { ar: 'إدارة الاشتراكات وإرسال النشرات', en: 'Subscription management and newsletter delivery' },
    uptime: 99.90,
  },
];

// Current incidents — empty for now
export const currentIncidents: Incident[] = [];

// Scheduled maintenance — empty for now
export const scheduledMaintenance: ScheduledMaintenance[] = [];

// Generate 90 days of uptime history
export function generateUptimeHistory(): UptimeDay[] {
  const days: UptimeDay[] = [];
  const now = new Date();

  for (let i = 89; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    // Mostly operational, with a few degraded days
    const rand = Math.random();
    let status: ServiceStatus = 'operational';
    let uptime = 99.9 + Math.random() * 0.1;

    // ~5% chance of degraded day
    if (rand > 0.95) {
      status = 'down';
      uptime = 90 + Math.random() * 8;
    } else if (rand > 0.90) {
      status = 'degraded';
      uptime = 95 + Math.random() * 4;
    }

    days.push({ date: dateStr, status, uptime: Math.round(uptime * 100) / 100 });
  }

  return days;
}

// Static uptime history for consistent rendering (seeded)
export const uptimeHistory: UptimeDay[] = (() => {
  const days: UptimeDay[] = [];
  const now = new Date();
  // Use a simple seeded pattern for consistency
  const pattern = [
    1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,
    1,1,1,1,1,1,1,1,0.5,1,1,1,1,1,1,1,1,1,1,1,
    1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,
    1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,
    1,1,1,1,1,1,1,1,1,1,0.5,1,1,1,1,1,1,1,1,1,
  ];

  for (let i = 89; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const p = pattern[89 - i];

    let status: ServiceStatus = 'operational';
    let uptime = 99.9 + Math.random() * 0.1;

    if (p === 0) {
      status = 'down';
      uptime = 90 + Math.random() * 5;
    } else if (p === 0.5) {
      status = 'degraded';
      uptime = 96 + Math.random() * 3;
    }

    days.push({ date: dateStr, status, uptime: Math.round(uptime * 100) / 100 });
  }

  return days;
})();

// Calculate overall status
export function getOverallStatus(services: StatusService[]): ServiceStatus {
  const statuses = services.map((s) => s.status);
  if (statuses.includes('down')) return 'down';
  if (statuses.includes('maintenance')) return 'maintenance';
  if (statuses.includes('degraded')) return 'degraded';
  return 'operational';
}
