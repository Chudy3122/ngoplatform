import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const userType = searchParams.get('userType');

    if (!userId || !userType) {
      return NextResponse.json(
        { error: "Missing userId or userType" },
        { status: 400 }
      );
    }

    let userData = null;

    switch (userType.toUpperCase()) {
      case 'ADMIN':
        userData = await prisma.admin.findUnique({
          where: { id: userId },
          select: { 
            id: true,
            username: true,
            name: true,
            isOnline: true,
            lastActive: true 
          }
        });
        break;
      case 'TEACHER':
        userData = await prisma.teacher.findUnique({
          where: { id: userId },
          select: { 
            id: true,
            username: true,
            name: true,
            isOnline: true,
            lastActive: true 
          }
        });
        break;
      case 'STUDENT':
        userData = await prisma.student.findUnique({
          where: { id: userId },
          select: { 
            id: true,
            username: true,
            name: true,
            isOnline: true,
            lastActive: true 
          }
        });
        break;
      case 'PARENT':
        userData = await prisma.parent.findUnique({
          where: { id: userId },
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
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
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