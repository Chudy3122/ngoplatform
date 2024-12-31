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
  
  // Sprawdzamy czy ścieżka kończy się na /admin lub jest to strona główna w danym języku
  const isHomePage = pathname ? pathname.endsWith('/admin') : false;

  if (!isHomePage) {
    return null;
  }
  
  return (
    <>
      <button
        onClick={() => setIsGuideActive(true)}
        className="guide-button flex items-center gap-2 bg-white rounded-full p-2 hover:bg-gray-100 transition-colors"
        title={t.guide.title}
      >
        <BookOpen className="w-5 h-5 text-gray-600" />
        <span className="hidden md:block text-sm">{t.guide.buttons.start}</span>
      </button>

      {isGuideActive && (
        <GuideOverlay onClose={() => setIsGuideActive(false)} />
      )}
    </>
  );
};

export default GuideButton;