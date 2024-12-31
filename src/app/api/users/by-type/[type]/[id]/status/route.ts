import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { type: string; id: string } }
) {
  try {
    const { type, id } = params;
    let userData = null;

    switch (type.toLowerCase()) {
      case 'admin':
        userData = await prisma.admin.findUnique({
          where: { id },
          select: { 
            id: true,
            username: true,
            name: true,
            isOnline: true,
            lastActive: true 
          }
        });
        break;
      case 'teacher':
        userData = await prisma.teacher.findUnique({
          where: { id },
          select: { 
            id: true,
            username: true,
            name: true,
            isOnline: true,
            lastActive: true 
          }
        });
        break;
      case 'student':
        userData = await prisma.student.findUnique({
          where: { id },
          select: { 
            id: true,
            username: true,
            name: true,
            isOnline: true,
            lastActive: true 
          }
        });
        break;
      case 'parent':
        userData = await prisma.parent.findUnique({
          where: { id },
          select: { 
            id: true,
            username: true,
            name: true,
            isOnline: true,
            lastActive: true 
          }
        });
        break;
    }

    if (!userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(userData);
  } catch (error) {
    console.error("Error fetching user status:", error);
    return NextResponse.json(
      { error: "Failed to fetch user status" },
      { status: 500 }
    );
  }
}