import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import { setSessionCookie, RoleTable } from "@/lib/session";

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: "Podaj login i hasło" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { username } });

    if (!user) {
      return NextResponse.json(
        { error: "Nieprawidłowy login lub hasło" },
        { status: 401 }
      );
    }

    const valid = await verifyPassword(password, user.password);

    if (!valid) {
      return NextResponse.json(
        { error: "Nieprawidłowy login lub hasło" },
        { status: 401 }
      );
    }

    // Pobierz imię z tabeli roli
    let name = user.username;
    let roleTable: RoleTable = "admin";

    if (user.role === "ADMIN") {
      roleTable = "admin";
      const admin = await prisma.admin.findUnique({ where: { id: user.roleId } });
      name = admin?.name || user.username;
    } else if (user.role === "MANAGER") {
      roleTable = "teacher";
      const teacher = await prisma.teacher.findUnique({ where: { id: user.roleId } });
      name = teacher ? `${teacher.name} ${teacher.surname}` : user.username;
    } else if (user.role === "USER") {
      // roleId may point to Student or Parent table
      const student = await prisma.student.findUnique({ where: { id: user.roleId } });
      if (student) {
        roleTable = "student";
        name = `${student.name} ${student.surname}`;
      } else {
        roleTable = "parent";
        const parent = await prisma.parent.findUnique({ where: { id: user.roleId } });
        name = parent ? `${parent.name} ${parent.surname}` : user.username;
      }
    }

    await setSessionCookie({
      userId: user.id,
      role: user.role,
      roleId: user.roleId,
      roleTable,
      username: user.username,
      name,
    });

    return NextResponse.json({ success: true, role: user.role });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Błąd serwera" }, { status: 500 });
  }
}
