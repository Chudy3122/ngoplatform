"use client";

import { useTranslations } from '@/hooks/useTranslations';
import { CreatePostModal } from './CreatePostModal';

interface AnnouncementsHeaderProps {
  role?: string;
}

export default function AnnouncementsHeader({ role }: AnnouncementsHeaderProps) {
  const t = useTranslations();

  return (
    <div className="flex items-center justify-between mb-6">
      <h1 className="text-2xl font-semibold">{t.posts.title}</h1>
      {/* Zmieniamy warunek, aby umożliwić rodzicom także tworzenie ogłoszeń */}
      {(role === "admin" || role === "teacher" || role === "parent") && (
        <CreatePostModal />
      )}
    </div>
  );
}