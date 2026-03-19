import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/session";

export const dynamic = "force-dynamic";

// GET - returns online user IDs, or profile of specific user when ?userId= param provided
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get('userId'); // User.id for profile lookup

    // Single user profile lookup
    if (userId) {
      // Try by User.id first, then fallback to roleId (handles cases where memberId = roleId)
      let user = await prisma.user.findUnique({
        where: { id: userId },
        select: { roleId: true, role: true }
      });
      if (!user) {
        user = await prisma.user.findFirst({
          where: { roleId: userId },
          select: { roleId: true, role: true }
        });
      }
      if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

      let profile: any = null;
      if (user.role === 'ADMIN') {
        profile = await prisma.admin.findUnique({ where: { id: user.roleId } });
      } else if (user.role === 'MANAGER') {
        profile = await prisma.teacher.findUnique({ where: { id: user.roleId } });
      } else {
        profile = await prisma.student.findUnique({ where: { id: user.roleId } })
               ?? await prisma.parent.findUnique({ where: { id: user.roleId } });
      }
      if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });
      return NextResponse.json({ ...profile, userId });
    }

    // Return all online user IDs (for polling in OnlineContext)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const [admins, teachers, students, parents] = await Promise.all([
      prisma.admin.findMany({ where: { isOnline: true, lastActive: { gte: fiveMinutesAgo } }, select: { id: true } }),
      prisma.teacher.findMany({ where: { isOnline: true, lastActive: { gte: fiveMinutesAgo } }, select: { id: true } }),
      prisma.student.findMany({ where: { isOnline: true, lastActive: { gte: fiveMinutesAgo } }, select: { id: true } }),
      prisma.parent.findMany({ where: { isOnline: true, lastActive: { gte: fiveMinutesAgo } }, select: { id: true } }),
    ]);
    const onlineIds = [
      ...admins.map(u => u.id),
      ...teachers.map(u => u.id),
      ...students.map(u => u.id),
      ...parents.map(u => u.id),
    ];
    return NextResponse.json(onlineIds);
  } catch (error) {
    console.error("Error in GET /api/users/status:", error);
    return NextResponse.json([], { status: 500 });
  }
}

// POST - update online status for the logged-in user
export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = await request.json();
    const { isOnline } = body;
    const { roleId, roleTable } = session;
    const now = new Date();

    switch (roleTable) {
      case "admin":
        await prisma.admin.update({ where: { id: roleId }, data: { isOnline: !!isOnline, lastActive: now } });
        break;
      case "teacher":
        await prisma.teacher.update({ where: { id: roleId }, data: { isOnline: !!isOnline, lastActive: now } });
        break;
      case "student":
        await prisma.student.update({ where: { id: roleId }, data: { isOnline: !!isOnline, lastActive: now } });
        break;
      case "parent":
        await prisma.parent.update({ where: { id: roleId }, data: { isOnline: !!isOnline, lastActive: now } });
        break;
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating user status:", error);
    return NextResponse.json({ error: "Failed to update status" }, { status: 500 });
  }
}
