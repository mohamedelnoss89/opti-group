'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';
import { Mail, Phone, Globe, Share2, MessageSquare } from 'lucide-react';

export default function ContactSection() {
  const { t, locale } = useLanguage();

  const socialLinks = [
    { icon: Globe, label: 'Website', href: '#', color: '#0ea5e9' },
    { icon: MessageSquare, label: 'Twitter / X', href: '#', color: '#1da1f2' },
    { icon: Share2, label: 'Social', href: '#', color: '#f97316' },
  ];

  return (
    <section id="section-contact" className="relative py-20 px-4">
      {/* Background glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(14,165,233,0.04), transparent 70%)',
        }}
      />

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Section header */}
        <motion.div
          className={`flex items-center gap-4 mb-12 ${locale === 'ar' ? 'flex-row-reverse' : ''}`}
          initial={{ opacity: 0, x: locale === 'ar' ? 30 : -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div
            className="p-3 rounded-2xl"
            style={{
              background: 'rgba(14,165,233,0.12)',
              border: '1px solid rgba(14,165,233,0.25)',
            }}
          >
            <Phone className="w-7 h-7 text-accent-cyan" />
          </div>
          <div className={locale === 'ar' ? 'text-right' : ''}>
            <h2 className="text-2xl sm:text-3xl font-bold text-accent-cyan">
              {t.contactTitle}
            </h2>
            <p className={`text-sm text-accent-silver/50 mt-1 ${locale === 'ar' ? 'font-arabic' : ''}`}>
              {t.contactDescription}
            </p>
          </div>
        </motion.div>

        {/* Contact cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Email card */}
          <motion.div
            className="glass-card p-6 flex items-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            whileHover={{ y: -4, borderColor: 'rgba(14,165,233,0.25)' }}
          >
            <div className="p-3 rounded-xl bg-accent-cyan/10">
              <Mail className="w-6 h-6 text-accent-cyan" />
            </div>
            <div className={locale === 'ar' ? 'text-right' : ''}>
              <p className="text-xs text-accent-silver/50">{t.emailLabel}</p>
              <p className="text-sm text-accent-silver mt-1">contact@optigroup.app</p>
            </div>
          </motion.div>

          {/* Phone card */}
          <motion.div
            className="glass-card p-6 flex items-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            whileHover={{ y: -4, borderColor: 'rgba(14,165,233,0.25)' }}
          >
            <div className="p-3 rounded-xl bg-accent-cyan/10">
              <Phone className="w-6 h-6 text-accent-cyan" />
            </div>
            <div className={locale === 'ar' ? 'text-right' : ''}>
              <p className="text-xs text-accent-silver/50">{t.phoneLabel}</p>
              <p className="text-sm text-accent-silver mt-1" dir="ltr">+20 123 456 7890</p>
            </div>
          </motion.div>
        </div>

        {/* Social links */}
        <motion.div
          className="mt-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <p className={`text-sm text-accent-silver/50 mb-4 ${locale === 'ar' ? 'text-right font-arabic' : ''}`}>
            {t.followUs}
          </p>
          <div className={`flex gap-4 ${locale === 'ar' ? 'justify-end' : 'justify-start'}`}>
            {socialLinks.map((social) => (
              <motion.a
                key={social.label}
                href={social.href}
                className="p-3 rounded-xl glass-card transition-all duration-300"
                whileHover={{ 
                  scale: 1.1, 
                  boxShadow: `0 0 20px ${social.color}20`,
                  borderColor: `${social.color}40`,
                }}
                whileTap={{ scale: 0.95 }}
                aria-label={social.label}
              >
                <social.icon className="w-5 h-5 text-accent-silver/70" />
              </motion.a>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
