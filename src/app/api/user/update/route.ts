// src/app/api/user/update/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/session";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId, username, name } = session;

    // Sprawdź, który typ użytkownika aktualizujemy
    const [admin, teacher, student, parent] = await Promise.all([
      prisma.admin.findUnique({ where: { id: userId } }),
      prisma.teacher.findUnique({ where: { id: userId } }),
      prisma.student.findUnique({ where: { id: userId } }),
      prisma.parent.findUnique({ where: { id: userId } })
    ]);

    let result;
    if (admin) {
      result = await prisma.admin.update({
        where: { id: userId },
        data: {
          username,
          name,
        }
      });
      return NextResponse.json({ success: true, role: "admin", user: result });
    } else if (teacher) {
      result = await prisma.teacher.update({
        where: { id: userId },
        data: {
          username,
          name,
        }
      });
      return NextResponse.json({ success: true, role: "teacher", user: result });
    } else if (student) {
      result = await prisma.student.update({
        where: { id: userId },
        data: {
          username,
          name,
        }
      });
      return NextResponse.json({ success: true, role: "student", user: result });
    } else if (parent) {
      result = await prisma.parent.update({
        where: { id: userId },
        data: {
          username,
          name,
        }
      });
      return NextResponse.json({ success: true, role: "parent", user: result });
    } else {
      return NextResponse.json({ error: "User not found in database" }, { status: 404 });
    }
  } catch (error) {
    console.error("Error updating user:", error);

    // Poprawka: sprawdzenie typu error przed dostępem do jego właściwości
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002' && error.meta?.target) {
        const target = error.meta.target;
        if (Array.isArray(target) && target.includes('username')) {
          return NextResponse.json({
            error: "Username already taken, please try again",
            reason: "unique_constraint",
            field: "username"
          }, { status: 409 });
        }
      }
    }

    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}
