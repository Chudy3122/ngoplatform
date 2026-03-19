// /components/GuideButton.tsx
"use client";

import { useState } from 'react';
import { BookOpen } from 'lucide-react';
import GuideOverlay from './GuideOverlay';
import { useTranslations } from "@/hooks/useTranslations";
import { usePathname } from 'next/navigation';

const GuideButton = () => {
  const [isGuideActive, setIsGuideActive] = useState(false);
  const t = useTranslations();
  const pathname = usePathname();
  
  // Sprawdzamy czy ścieżka kończy się na /dashboard lub /admin
  const isVisible = pathname ? (
    pathname.endsWith('/dashboard') || 
    pathname.endsWith('/admin')
  ) : false;

  if (!isVisible) {
    return null;
  }
  
  return (
    <>
      <button
        onClick={() => setIsGuideActive(true)}
        className="guide-button flex items-center gap-2 rounded-lg px-3 py-1.5 hover:bg-white/10 transition-colors text-white/60 hover:text-white/90"
        title={t.guide.title}
      >
        <BookOpen className="w-4 h-4" />
        <span className="hidden md:block text-[13px] font-medium">{t.guide.buttons.start}</span>
      </button>

      {isGuideActive && (
        <GuideOverlay onClose={() => setIsGuideActive(false)} />
      )}
    </>
  );
};

export default GuideButton;