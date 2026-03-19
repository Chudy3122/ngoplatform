"use client";

import FileStorage from '@/components/FileStorage';
import { useTranslations } from "@/hooks/useTranslations";
import { useParams } from "next/navigation";

export default function LibraryPage() {
  const t = useTranslations();
  const params = useParams();
  const lang = params?.lang || 'pl';

  return (
    <div className="p-6">
      <div className="mb-5">
        <h1 className="text-xl font-semibold text-slate-800">{t.library.title}</h1>
      </div>
      <FileStorage />
    </div>
  );
}