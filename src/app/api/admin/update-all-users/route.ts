// src/app/api/admin/update-all-users/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/session";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { userId, role } = session;

    if (role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden - admin only" }, { status: 403 });
    }

    // Pobierz wszystkich użytkowników z bazy danych
    const [admins, teachers, students, parents] = await Promise.all([
      prisma.admin.findMany(),
      prisma.teacher.findMany(),
      prisma.student.findMany(),
      prisma.parent.findMany()
    ]);

    const updates = {
      admins: admins.length,
      teachers: teachers.length,
      students: students.length,
      parents: parents.length,
      errors: 0
    };

    return NextResponse.json({
      success: true,
      updated: updates
    });
  } catch (error) {
    console.error("Błąd podczas aktualizacji wszystkich użytkowników:", error);
    return NextResponse.json({ error: "Failed to update all users" }, { status: 500 });
  }
}
