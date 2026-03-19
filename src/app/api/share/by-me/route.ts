import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/session";
import prisma from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { roleId, roleTable } = session;

    const whereClause =
      roleTable === 'admin'   ? { adminOwnerId: roleId } :
      roleTable === 'teacher' ? { teacherOwnerId: roleId } :
      roleTable === 'student' ? { studentOwnerId: roleId } :
                                { parentOwnerId: roleId };

    const sharedFiles = await prisma.libraryFile.findMany({
      where: whereClause,
      include: {
        shares: {
          include: {
            sharedToAdmin:   { select: { username: true, email: true } },
            sharedToTeacher: { select: { username: true, email: true } },
            sharedToStudent: { select: { username: true, email: true } },
            sharedToParent:  { select: { username: true, email: true } }
          }
        }
      }
    });

    return NextResponse.json(sharedFiles);
  } catch (error) {
    console.error("Error getting shared files:", error);
    return NextResponse.json({ error: "Failed to get shared files" }, { status: 500 });
  }
}
