import PostList from '@/components/PostList';
import AnnouncementsHeader from '@/components/AnnouncementsHeader';
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function AnnouncementsPage() {
  const session = await getSession();
  if (!session) redirect(`/pl/login`);
  const role = session.role;

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      <AnnouncementsHeader role={role} />
      <div className="mt-6">
        <PostList />
      </div>
    </div>
  );
}