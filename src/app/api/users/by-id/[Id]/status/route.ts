import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const userId = params.userId;

    // Sprawdź status we wszystkich tabelach użytkowników
    const admin = await prisma.admin.findUnique({
      where: { id: userId },
      select: { isOnline: true, lastActive: true }
    });

    if (admin) return NextResponse.json(admin);

    const teacher = await prisma.teacher.findUnique({
      where: { id: userId },
      select: { isOnline: true, lastActive: true }
    });

    if (teacher) return NextResponse.json(teacher);

    const student = await prisma.student.findUnique({
      where: { id: userId },
      select: { isOnline: true, lastActive: true }
    });

    if (student) return NextResponse.json(student);

    const parent = await prisma.parent.findUnique({
      where: { id: userId },
      select: { isOnline: true, lastActive: true }
    });

    if (parent) return NextResponse.json(parent);

    return NextResponse.json(
      { error: "User not found" },
      { status: 404 }
    );
  } catch (error) {
    console.error("Error fetching user status:", error);
    return NextResponse.json(
      { error: "Failed to fetch user status" },
      { status: 500 }
    );
  }
}