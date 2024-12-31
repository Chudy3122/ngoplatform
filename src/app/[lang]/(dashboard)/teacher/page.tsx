import Announcements from "@/components/Announcements";
import BigCalendarContainer from "@/components/BigCalendarContainer";
import Chat from "@/components/Chat"; // Upewnij się, że ścieżka do komponentu Chat jest poprawna
import { auth } from "@clerk/nextjs/server";

const TeacherPage = () => {
  const { userId } = auth();
  return (
    <div className="flex-1 p-4 flex gap-4 flex-col xl:flex-row">
      {/* LEFT */}
      <div className="w-full xl:w-2/3">
        <div className="h-full bg-white p-4 rounded-md">
          <h1 className="text-xl font-semibold">Schedule</h1>
          <BigCalendarContainer type="teacherId" id={userId!} />
        </div>
      </div>
      {/* RIGHT */}
      <div className="w-full xl:w-1/3 flex flex-col gap-8">
        <Announcements />
        <div className="bg-white p-4 rounded-md">
          <h2 className="text-xl font-semibold mb-4">Chat</h2>
          <Chat currentUserId={userId!} />
        </div>
      </div>
    </div>
  );
};

export default TeacherPage;