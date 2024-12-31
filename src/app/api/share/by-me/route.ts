import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sharedFiles = await prisma.libraryFile.findMany({
      where: {
        OR: [
          { adminOwnerId: userId },
          { teacherOwnerId: userId },
          { studentOwnerId: userId },
          { parentOwnerId: userId }
        ]
      },
      include: {
        shares: {
          include: {
            sharedToAdmin: {
              select: { username: true, email: true }
            },
            sharedToTeacher: {
              select: { username: true, email: true }
            },
            sharedToStudent: {
              select: { username: true, email: true }
            },
            sharedToParent: {
              select: { username: true, email: true }
            }
          }
        }
      }
    });

    return NextResponse.json(sharedFiles);
  } catch (error) {
    console.error("Error getting shared files:", error);
    return NextResponse.json(
      { error: "Failed to get shared files" },
      { status: 500 }
    );
  }
}