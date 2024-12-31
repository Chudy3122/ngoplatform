// app/[lang]/(dashboard)/list/resources/page.tsx
import { auth } from "@clerk/nextjs/server";
import ResourcesClient from "./ResourcesClient";

export default async function ResourcesPage() {
  const authData = await auth();
  const role = (authData?.sessionClaims?.metadata as { role?: string })?.role;

  return (
    <div className="p-4">
      <ResourcesClient userRole={role} />
    </div>
  );
}