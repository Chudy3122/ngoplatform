import { pl } from '@/translations/pl';

declare module '@/hooks/useTranslations' {
 type TranslationType = typeof pl;
 export function useTranslations(): TranslationType;
}