import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";

const Announcements = async () => {
  const session = await getSession();
  const role = session?.role;
  const currentUserId = session?.userId;

  const roleConditions = {
    TEACHER: { lessons: { some: { teacherId: currentUserId! } } },
    STUDENT: { students: { some: { id: currentUserId! } } },
    PARENT: { students: { some: { parentId: currentUserId! } } },
  };

  const data = await prisma.announcement.findMany({
    take: 3,
    orderBy: { date: "desc" },
    where: {
      ...(role !== "ADMIN" && {
        OR: [
          { classId: null },
          { class: roleConditions[role as keyof typeof roleConditions] || {} },
        ],
      }),
    },
  });

  // Style dla różnych kolorów ogłoszeń
  const cardStyles = [
    "bg-lamaSkyLight",
    "bg-lamaPurpleLight",
    "bg-lamaYellowLight",
  ];

  return (
    <div className="bg-white p-4 rounded-md">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Ogłoszenia</h1>
      </div>
      <div className="flex flex-col gap-4 mt-4">
        {data.map((announcement, index) => (
          <div key={announcement.id} className={`${cardStyles[index % 3]} rounded-md p-4`}>
            <div className="flex items-center justify-between">
              <h2 className="font-medium">{announcement.title}</h2>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400 bg-white rounded-md px-1 py-1">
                  {new Intl.DateTimeFormat("en-GB").format(announcement.date)}
                </span>
                {/* Usunięto przycisk usuwania */}
              </div>
            </div>
            <p className="text-sm text-gray-400 mt-1">{announcement.description}</p>
          </div>
        ))}
        
        {data.length === 0 && (
          <p className="text-gray-500 text-center py-4">Brak ogłoszeń</p>
        )}
      </div>
    </div>
  );
};

export default Announcements;