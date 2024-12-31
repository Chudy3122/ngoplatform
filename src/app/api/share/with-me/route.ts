import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Sprawdź typ użytkownika
    const [isAdmin, isTeacher, isStudent, isParent] = await Promise.all([
      prisma.admin.findUnique({ where: { id: userId } }),
      prisma.teacher.findUnique({ where: { id: userId } }),
      prisma.student.findUnique({ where: { id: userId } }),
      prisma.parent.findUnique({ where: { id: userId } })
    ]);

    // Przygotuj warunki wyszukiwania
    let whereCondition = {};
    if (isAdmin) {
      whereCondition = { sharedToAdminId: userId };
    } else if (isTeacher) {
      whereCondition = { sharedToTeacherId: userId };
    } else if (isStudent) {
      whereCondition = { sharedToStudentId: userId };
    } else if (isParent) {
      whereCondition = { sharedToParentId: userId };
    } else {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const sharedWithMe = await prisma.fileShare.findMany({
      where: whereCondition,
      include: {
        file: true
      }
    });

    return NextResponse.json(sharedWithMe);
  } catch (error) {
    console.error("Error getting files shared with me:", error);
    return NextResponse.json(
      { error: "Failed to get shared files" },
      { status: 500 }
    );
  }
}