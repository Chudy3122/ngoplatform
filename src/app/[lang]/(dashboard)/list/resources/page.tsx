// app/[lang]/(dashboard)/list/resources/page.tsx
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import ResourcesClient from "./ResourcesClient";

export default async function ResourcesPage() {
  const session = await getSession();
  if (!session) redirect(`/pl/login`);
  const role = session.role;

  return (
    <div className="p-4">
      <ResourcesClient userRole={role} />
    </div>
  );
}