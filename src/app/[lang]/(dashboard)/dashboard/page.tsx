// src/app/[lang]/(dashboard)/dashboard/page.tsx
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
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
  const authData = await auth();
  
  if (!authData || !authData.userId) {
    return redirect(`/${lang}/login`);
  }
  
  // Wszystkie typy użytkowników widzą tę samą stronę startową (dashboard admina)
  return <UnifiedDashboard />;
};

// Ujednolicony dashboard dla wszystkich użytkowników (taki sam jak admin dashboard)
const UnifiedDashboard = () => {
  return (
    <div className="p-4 flex gap-4 flex-col relative">
      {/* Sekcja Aktualności */}
      <div className="guide-section-news">
        <NewsDashboard />
      </div>

      <div className="flex gap-4 flex-col lg:flex-row">
        {/* Lewa kolumna - kalendarz i wydarzenia jako jedna sekcja */}
        <div className="w-full lg:w-1/2 flex flex-col gap-4 guide-section-calendar-events">
          {/* Kalendarz */}
          <div className="bg-white rounded-lg min-h-[400px] guide-section-calendar">
            <div className="p-4">
              <EventCalendar />
            </div>
          </div>

          {/* Nadchodzące wydarzenia */}
          <div className="bg-white rounded-lg min-h-[300px]">
            <div className="p-4">
              <div className="max-h-[400px] overflow-y-auto">
                <EventList limit={3} compact={true} />
              </div>
            </div>
          </div>
        </div>

        {/* Prawa kolumna */}
        <div className="w-full lg:w-1/2">
          <div className="guide-section-announcements bg-white rounded-lg min-h-[700px]">
            <div className="p-4">
              <div className="max-h-[600px] overflow-y-auto">
                <RecentAnnouncements />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ChatWidget */}
      <ChatWidget />
    </div>
  );
};

export default DashboardPage;