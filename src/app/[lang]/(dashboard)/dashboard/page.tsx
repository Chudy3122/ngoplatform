// src/app/[lang]/(dashboard)/dashboard/page.tsx
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import RecentAnnouncements from "@/components/RecentAnnouncements";
import NewsDashboard from "@/components/NewsDashboard";
import EventCalendar from "@/components/EventCalendar";
import EventList from "@/components/EventList";
import ChatWidget from "@/components/ChatWidget/ChatWidget";
import BigCalendarContainer from "@/components/BigCalendarContainer";
import Announcements from "@/components/Announcements";
import prisma from "@/lib/prisma";
import { Class, Student } from "@prisma/client";

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
  
  // Pobierz rolę z metadanych użytkownika
  const role = (authData.sessionClaims?.metadata as { role?: string })?.role;
  const currentUserId = authData.userId;
  
  console.log("Dashboard - User ID:", currentUserId);
  console.log("Dashboard - User Role:", role);

  // Jeśli rola nie jest zdefiniowana, pokaż widok studenta
  if (!role) {
    return <StudentDashboard userId={currentUserId} />;
  }

  // Renderowanie strony zależnie od roli użytkownika
  switch (role) {
    case "admin":
      return <AdminDashboard />;
    case "student":
      return <StudentDashboard userId={currentUserId} />;
    case "teacher":
      return <TeacherDashboard userId={currentUserId} />;
    case "parent":
      return <ParentDashboard userId={currentUserId} />;
    default:
      // W przypadku nieznanej roli, użyj widoku studenta
      return <StudentDashboard userId={currentUserId} />;
  }
};

// Komponent panelu dla administratora
const AdminDashboard = () => {
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

// Komponent panelu dla studenta
const StudentDashboard = async ({ userId }: { userId: string }) => {
  let classItems: Class[] = [];
  try {
    classItems = await prisma.class.findMany({
      where: {
        students: { some: { id: userId } },
      },
    });
  } catch (error) {
    console.error("Error fetching class for student:", error);
  }

  return (
    <div className="p-4 flex gap-4 flex-col xl:flex-row">
      {/* LEFT */}
      <div className="w-full xl:w-2/3">
        <div className="h-full bg-white p-4 rounded-md">
          <h1 className="text-xl font-semibold">
            {classItems && classItems.length > 0 ? `Schedule (${classItems[0].name})` : "Schedule"}
          </h1>
          {classItems && classItems.length > 0 && (
            <BigCalendarContainer type="classId" id={classItems[0].id} />
          )}
        </div>
      </div>
      {/* RIGHT */}
      <div className="w-full xl:w-1/3 flex flex-col gap-8">
        <EventCalendar />
        <Announcements />
      </div>
      
      {/* ChatWidget */}
      <ChatWidget />
    </div>
  );
};

// Komponent panelu dla rodzica
const ParentDashboard = async ({ userId }: { userId: string }) => {
  let students: Student[] = [];
  try {
    students = await prisma.student.findMany({
      where: {
        parentId: userId,
      },
    });
  } catch (error) {
    console.error("Error fetching students for parent:", error);
  }

  return (
    <div className="flex-1 p-4 flex gap-4 flex-col xl:flex-row">
      {/* LEFT */}
      <div className="">
        {students && students.length > 0 ? (
          students.map((student) => (
            <div className="w-full xl:w-2/3" key={student.id}>
              <div className="h-full bg-white p-4 rounded-md">
                <h1 className="text-xl font-semibold">
                  Schedule ({student.name + " " + student.surname})
                </h1>
                <BigCalendarContainer type="classId" id={student.classId} />
              </div>
            </div>
          ))
        ) : (
          <div className="w-full xl:w-2/3">
            <div className="h-full bg-white p-4 rounded-md">
              <h1 className="text-xl font-semibold">No students found</h1>
            </div>
          </div>
        )}
      </div>
      {/* RIGHT */}
      <div className="w-full xl:w-1/3 flex flex-col gap-8">
        <Announcements />
      </div>
      
      {/* ChatWidget */}
      <ChatWidget />
    </div>
  );
};

// Komponent panelu dla nauczyciela
const TeacherDashboard = ({ userId }: { userId: string }) => {
  return (
    <div className="p-4 flex gap-4 flex-col xl:flex-row">
      {/* LEFT */}
      <div className="w-full xl:w-2/3">
        <div className="h-full bg-white p-4 rounded-md">
          <h1 className="text-xl font-semibold">Teacher Schedule</h1>
          <BigCalendarContainer type="teacherId" id={userId} />
        </div>
      </div>
      {/* RIGHT */}
      <div className="w-full xl:w-1/3 flex flex-col gap-8">
        <EventCalendar />
        <Announcements />
      </div>
      
      {/* ChatWidget */}
      <ChatWidget />
    </div>
  );
};

export default DashboardPage;