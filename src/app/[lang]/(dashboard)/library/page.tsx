"use client";

import FileStorage from '@/components/FileStorage';
import { useTranslations } from "@/hooks/useTranslations";
import { useParams } from "next/navigation";

export default function LibraryPage() {
  const t = useTranslations();
  const params = useParams();
  const lang = params?.lang || 'pl';

  return (
    <div className="p-4 bg-[#F7F8FA] min-h-screen">
      <div className="mb-4">
        <h1 className="text-2xl font-semibold">{t.library.title}</h1>
      </div>
      <FileStorage />
    </div>
  );
}