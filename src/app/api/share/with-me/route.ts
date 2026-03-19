import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/session";
import prisma from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { roleId, roleTable } = session;

    const whereCondition =
      roleTable === 'admin'   ? { sharedToAdminId: roleId } :
      roleTable === 'teacher' ? { sharedToTeacherId: roleId } :
      roleTable === 'student' ? { sharedToStudentId: roleId } :
                                { sharedToParentId: roleId };

    const sharedWithMe = await prisma.fileShare.findMany({
      where: whereCondition,
      include: {
        file: true,
        sharedByAdmin:   { select: { id: true, username: true, email: true } },
        sharedByTeacher: { select: { id: true, username: true, email: true } },
        sharedByStudent: { select: { id: true, username: true, email: true } },
        sharedByParent:  { select: { id: true, username: true, email: true } }
      }
    });

    return NextResponse.json(sharedWithMe);
  } catch (error) {
    console.error("Error getting files shared with me:", error);
    return NextResponse.json({ error: "Failed to get shared files" }, { status: 500 });
  }
}
