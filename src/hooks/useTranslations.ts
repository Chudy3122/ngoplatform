"use client";

import { useParams } from 'next/navigation';
import { pl } from '@/translations/pl';
import { en } from '@/translations/en';

const translations = {
  pl,
  en,
} as const;

export type Language = keyof typeof translations;

export function useTranslations() {
  const params = useParams();
  const lang = (params?.lang as Language) || 'pl';
  return translations[lang];
}