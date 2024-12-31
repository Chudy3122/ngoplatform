// app/[lang]/(dashboard)/page.tsx
import RecentAnnouncements from "@/components/RecentAnnouncements";
import NewsDashboard from "@/components/NewsDashboard";
import EventCalendar from "@/components/EventCalendar";
import EventList from "@/components/EventList";
import ChatWidget from "@/components/ChatWidget/ChatWidget"; // Dodajemy import

interface AdminPageProps {
  params: { lang: string };
  searchParams: { [key: string]: string | undefined };
}

const AdminPage = ({
  params: { lang },
  searchParams,
}: AdminPageProps) => {
  return (
    <div className="p-4 flex gap-4 flex-col relative"> {/* Dodajemy relative dla prawidłowego pozycjonowania ChatWidget */}
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

      {/* Dodajemy ChatWidget */}
      <ChatWidget />
    </div>
  );
};

export default AdminPage;