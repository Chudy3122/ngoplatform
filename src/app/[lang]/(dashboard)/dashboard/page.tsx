// src/app/[lang]/(dashboard)/dashboard/page.tsx
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import RecentAnnouncements from "@/components/RecentAnnouncements";
import NewsDashboard from "@/components/NewsDashboard";
import EventCalendar from "@/components/EventCalendar";
import EventList from "@/components/EventList";
import ChatWidget from "@/components/ChatWidget/ChatWidget";

interface DashboardPageProps {
  params: { lang: string };
  searchParams: { [key: string]: string | undefined };
}

const DashboardPage = async ({
  params: { lang },
  searchParams,
}: DashboardPageProps) => {
  const session = await getSession();

  if (!session) {
    return redirect(`/${lang}/login`);
  }
  
  // Wszystkie typy użytkowników widzą tę samą stronę startową (dashboard admina)
  return <UnifiedDashboard />;
};

// Ujednolicony dashboard dla wszystkich użytkowników (taki sam jak admin dashboard)
const UnifiedDashboard = () => {
  return (
    <div className="p-6 flex flex-col gap-5 relative">
      {/* Aktualności */}
      <div className="guide-section-news">
        <NewsDashboard />
      </div>

      {/* Główna sekcja: Kalendarz + Ogłoszenia */}
      <div className="flex gap-5 flex-col lg:flex-row">
        {/* Kalendarz */}
        <div className="w-full lg:w-[58%] guide-section-calendar">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <EventCalendar />
          </div>
        </div>

        {/* Tablica ogłoszeń */}
        <div className="w-full lg:w-[42%] guide-section-announcements">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 h-full" style={{ minHeight: '420px' }}>
            <div className="max-h-[520px] overflow-y-auto">
              <RecentAnnouncements />
            </div>
          </div>
        </div>
      </div>

      {/* Nadchodzące wydarzenia — pełna szerokość */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
          <svg className="w-4 h-4 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          <h2 className="text-sm font-semibold text-slate-700">Nadchodzące wydarzenia</h2>
        </div>
        <div className="p-5">
          <EventList limit={4} compact={true} />
        </div>
      </div>

      <ChatWidget />
    </div>
  );
};

export default DashboardPage;