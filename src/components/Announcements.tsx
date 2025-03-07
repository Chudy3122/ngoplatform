import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import UserAvatar from "@/components/UserAvatar";

const Announcements = async () => {
  const authData = await auth();
  const role = (authData.sessionClaims?.metadata as { role?: string })?.role;
  const currentUserId = authData.userId;

  const roleConditions = {
    teacher: { lessons: { some: { teacherId: currentUserId! } } },
    student: { students: { some: { id: currentUserId! } } },
    parent: { students: { some: { parentId: currentUserId! } } },
  };

  // Pobieramy ogłoszenia bez relacji autorów
  const data = await prisma.announcement.findMany({
    take: 3,
    orderBy: { date: "desc" },
    where: {
      ...(role !== "admin" && {
        OR: [
          { classId: null },
          { class: roleConditions[role as keyof typeof roleConditions] || {} },
        ],
      }),
    },
  });

  // Aby rozwiązać problem z typami, możemy użyć "as any"
  const announcements = data as any[];

  return (
    <div className="bg-white p-4 rounded-md">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Ogłoszenia</h1>
      </div>
      <div className="flex flex-col gap-4 mt-4">
        {announcements[0] && (
          <div className="bg-lamaSkyLight rounded-md p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {/* Używamy UserAvatar tylko jeśli mamy authorId */}
                {announcements[0].authorId ? (
                  <UserAvatar 
                    userId={announcements[0].authorId} 
                    size={32} 
                  />
                ) : (
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-xs text-gray-500">?</span>
                  </div>
                )}
                <div>
                  <h2 className="font-medium">{announcements[0].title}</h2>
                </div>
              </div>
              <span className="text-xs text-gray-400 bg-white rounded-md px-1 py-1">
                {new Intl.DateTimeFormat("en-GB").format(announcements[0].date)}
              </span>
            </div>
            <p className="text-sm text-gray-400 mt-1">{announcements[0].description}</p>
          </div>
        )}
        {announcements[1] && (
          <div className="bg-lamaPurpleLight rounded-md p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {announcements[1].authorId ? (
                  <UserAvatar 
                    userId={announcements[1].authorId} 
                    size={32} 
                  />
                ) : (
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-xs text-gray-500">?</span>
                  </div>
                )}
                <div>
                  <h2 className="font-medium">{announcements[1].title}</h2>
                </div>
              </div>
              <span className="text-xs text-gray-400 bg-white rounded-md px-1 py-1">
                {new Intl.DateTimeFormat("en-GB").format(announcements[1].date)}
              </span>
            </div>
            <p className="text-sm text-gray-400 mt-1">{announcements[1].description}</p>
          </div>
        )}
        {announcements[2] && (
          <div className="bg-lamaYellowLight rounded-md p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {announcements[2].authorId ? (
                  <UserAvatar 
                    userId={announcements[2].authorId} 
                    size={32} 
                  />
                ) : (
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-xs text-gray-500">?</span>
                  </div>
                )}
                <div>
                  <h2 className="font-medium">{announcements[2].title}</h2>
                </div>
              </div>
              <span className="text-xs text-gray-400 bg-white rounded-md px-1 py-1">
                {new Intl.DateTimeFormat("en-GB").format(announcements[2].date)}
              </span>
            </div>
            <p className="text-sm text-gray-400 mt-1">{announcements[2].description}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Announcements;