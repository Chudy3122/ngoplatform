import PostList from '@/components/PostList';
import AnnouncementsHeader from '@/components/AnnouncementsHeader';
import { auth } from "@clerk/nextjs/server";

export default async function AnnouncementsPage() {
  const { sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      <AnnouncementsHeader role={role} />
      <div className="mt-6">
        <PostList />
      </div>
    </div>
  );
}