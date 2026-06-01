'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, 
  MapPin, 
  Brain, 
  Landmark, 
  Phone, 
  X,
  LogIn,
  LogOut,
  Home,
} from 'lucide-react';
import { getAppCountByCategory } from '@/lib/apps-data';
import Logo from './Logo';
import SocialLinks from './SocialLinks';

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (sectionId: string) => void;
  onContactClick: () => void;
}

const categoryIcons: Record<string, React.ReactNode> = {
  health: <Heart className="w-5 h-5" />,
  outings: <MapPin className="w-5 h-5" />,
  ai: <Brain className="w-5 h-5" />,
  landmarks: <Landmark className="w-5 h-5" />,
};

const categoryColors: Record<string, string> = {
  health: 'text-section-health',
  outings: 'text-section-outings',
  ai: 'text-section-ai',
  landmarks: 'text-section-landmarks',
};

const categoryBgColors: Record<string, string> = {
  health: 'bg-section-health/10',
  outings: 'bg-section-outings/10',
  ai: 'bg-section-ai/10',
  landmarks: 'bg-section-landmarks/10',
};

export default function SideMenu({ isOpen, onClose, onNavigate, onContactClick }: SideMenuProps) {
  const { t, locale } = useLanguage();
  const { user, signOut } = useAuth();

  const menuItems = [
    { id: 'section-health', category: 'health' as const, label: t.healthSection },
    { id: 'section-outings', category: 'outings' as const, label: t.outingsSection },
    { id: 'section-ai', category: 'ai' as const, label: t.aiSection },
    { id: 'section-landmarks', category: 'landmarks' as const, label: t.landmarksSection },
  ];

  const handleNavigate = (sectionId: string) => {
    onNavigate(sectionId);
    onClose();
  };

  const handleContact = () => {
    onContactClick();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Side menu panel */}
          <motion.div
            className={`fixed top-0 ${locale === 'ar' ? 'right-0' : 'left-0'} h-full w-[320px] z-50 flex flex-col`}
            style={{
              background: 'rgba(15, 18, 35, 0.95)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              borderRight: locale === 'ar' ? 'none' : '1px solid rgba(192,192,192,0.1)',
              borderLeft: locale === 'ar' ? '1px solid rgba(192,192,192,0.1)' : 'none',
            }}
            initial={{ x: locale === 'ar' ? 320 : -320 }}
            animate={{ x: 0 }}
            exit={{ x: locale === 'ar' ? 320 : -320 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            {/* Header with logo and close button */}
            <div className="flex items-center justify-between p-6 pb-2">
              <div className="scale-50 origin-top-left">
                <Logo size="small" />
              </div>
              <motion.button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="w-5 h-5 text-accent-silver" />
              </motion.button>
            </div>

            {/* Divider */}
            <div className="mx-6 h-px bg-gradient-to-r from-transparent via-accent-silver/20 to-transparent" />

            {/* Menu items */}
            <nav className="flex-1 overflow-y-auto p-4 space-y-2">
              {/* Home Link */}
              <motion.a
                href="/"
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group no-underline ${locale === 'ar' ? 'flex-row-reverse text-right' : 'flex-row text-left'}`}
                style={{
                  background: 'rgba(14,165,233,0.06)',
                }}
                initial={{ opacity: 0, x: locale === 'ar' ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 }}
                whileHover={{ 
                  background: 'rgba(14,165,233,0.12)',
                  scale: 1.02,
                }}
              >
                <span className="p-2 rounded-lg bg-accent-cyan/10 text-accent-cyan">
                  <Home className="w-5 h-5" />
                </span>
                <span className="flex-1 text-sm font-medium text-accent-cyan/80 group-hover:text-accent-cyan transition-colors">
                  {t.home}
                </span>
              </motion.a>

              {menuItems.map((item, index) => (
                <motion.button
                  key={item.id}
                  onClick={() => handleNavigate(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer group ${locale === 'ar' ? 'flex-row-reverse text-right' : 'flex-row text-left'}`}
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                  }}
                  initial={{ opacity: 0, x: locale === 'ar' ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * index + 0.1 }}
                  whileHover={{ 
                    background: 'rgba(255,255,255,0.08)',
                    scale: 1.02,
                  }}
                >
                  <span className={`p-2 rounded-lg ${categoryBgColors[item.category]} ${categoryColors[item.category]}`}>
                    {categoryIcons[item.category]}
                  </span>
                  <span className={`flex-1 text-sm font-medium text-accent-silver/80 group-hover:text-accent-silver transition-colors`}>
                    {item.label}
                  </span>
                  <span className="text-xs text-accent-silver/40 bg-white/5 px-2 py-1 rounded-full">
                    {getAppCountByCategory(item.category)}
                  </span>
                </motion.button>
              ))}

              {/* Contact Us */}
              <motion.button
                onClick={handleContact}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer group ${locale === 'ar' ? 'flex-row-reverse text-right' : 'flex-row text-left'}`}
                style={{
                  background: 'rgba(255,255,255,0.03)',
                }}
                initial={{ opacity: 0, x: locale === 'ar' ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                whileHover={{ 
                  background: 'rgba(255,255,255,0.08)',
                  scale: 1.02,
                }}
              >
                <span className="p-2 rounded-lg bg-accent-cyan/10 text-accent-cyan">
                  <Phone className="w-5 h-5" />
                </span>
                <span className="flex-1 text-sm font-medium text-accent-silver/80 group-hover:text-accent-silver transition-colors">
                  {t.contactUs}
                </span>
              </motion.button>
            </nav>

            {/* Divider */}
            <div className="mx-6 h-px bg-gradient-to-r from-transparent via-accent-silver/20 to-transparent" />

            {/* Social Links */}
            <div className="px-6 py-3">
              <SocialLinks size="small" isArabic={locale === 'ar'} />
            </div>

            {/* Divider */}
            <div className="mx-6 h-px bg-gradient-to-r from-transparent via-accent-silver/20 to-transparent" />

            {/* Auth section */}
            <div className="p-4">
              {user ? (
                <motion.button
                  onClick={signOut}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer group ${locale === 'ar' ? 'flex-row-reverse text-right' : 'flex-row text-left'}`}
                  style={{ background: 'rgba(255,255,255,0.03)' }}
                  whileHover={{ background: 'rgba(255,255,255,0.08)' }}
                >
                  <span className="p-2 rounded-lg bg-red-500/10 text-red-400">
                    <LogOut className="w-5 h-5" />
                  </span>
                  <span className="flex-1 text-sm font-medium text-accent-silver/80 group-hover:text-accent-silver transition-colors">
                    {t.logout}
                  </span>
                </motion.button>
              ) : (
                <motion.a
                  href="/login"
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group no-underline ${locale === 'ar' ? 'flex-row-reverse text-right' : 'flex-row text-left'}`}
                  style={{ background: 'rgba(14,165,233,0.08)' }}
                  whileHover={{ background: 'rgba(14,165,233,0.15)' }}
                >
                  <span className="p-2 rounded-lg bg-accent-cyan/10 text-accent-cyan">
                    <LogIn className="w-5 h-5" />
                  </span>
                  <span className="flex-1 text-sm font-medium text-accent-cyan/80 group-hover:text-accent-cyan transition-colors">
                    {t.login}
                  </span>
                </motion.a>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
