// components/RecentEvents.tsx
"use client";

import EventList from "./EventList";
import { useTranslations } from "@/hooks/useTranslations";
import Link from 'next/link';

export default function RecentEvents() {
  const t = useTranslations();

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b flex justify-between items-center">
        <h2 className="text-lg font-semibold">{t.events.title}</h2>
        <Link 
          href="/events" 
          className="text-blue-500 hover:text-blue-600 text-sm"
        >
          {t.common.viewAll}
        </Link>
      </div>
      <div className="p-4">
        <div className="w-full overflow-x-auto">
          <EventList limit={1} compact={true} />
        </div>
      </div>
    </div>
  );
}