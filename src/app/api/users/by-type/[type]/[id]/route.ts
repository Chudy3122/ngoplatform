// app/api/users/by-type/[type]/[id]/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function GET(
  request: Request,
  { params }: { params: { type: string; id: string } }
) {
  try {
    const { type, id } = params;
    console.log("Fetching user data:", { type, id });

    let userData;
    switch (type.toLowerCase()) {
      case 'admin':
        userData = await prisma.admin.findUnique({
          where: { id }
        });
        break;
      case 'teacher':
        userData = await prisma.teacher.findUnique({
          where: { id }
        });
        break;
      case 'student':
        userData = await prisma.student.findUnique({
          where: { id }
        });
        break;
      case 'parent':
        userData = await prisma.parent.findUnique({
          where: { id }
        });
        break;
      default:
        return NextResponse.json(
          { error: `Invalid user type: ${type}` },
          { status: 400 }
        );
    }

    if (!userData) {
      console.log(`User not found: ${type}/${id}`);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(userData);
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Failed to fetch user data" },
      { status: 500 }
    );
  }
}