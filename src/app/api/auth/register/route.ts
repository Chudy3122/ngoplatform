import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { setSessionCookie } from "@/lib/session";

export async function POST(req: NextRequest) {
  try {
    const { username, password, name, surname, email, address, birthday, sex } =
      await req.json();

    if (!username || !password || !name || !surname) {
      return NextResponse.json(
        { error: "Wypełnij wszystkie wymagane pola" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Hasło musi mieć co najmniej 6 znaków" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({ where: { username } });
    if (existingUser) {
      return NextResponse.json(
        { error: "Taka nazwa użytkownika jest już zajęta" },
        { status: 409 }
      );
    }

    if (email) {
      const existingEmail = await prisma.user.findUnique({ where: { email } });
      if (existingEmail) {
        return NextResponse.json(
          { error: "Ten adres email jest już zajęty" },
          { status: 409 }
        );
      }
    }

    // Utwórz domyślne Grade i Class jeśli nie istnieją
    const grade = await prisma.grade.upsert({
      where: { level: 1 },
      update: {},
      create: { level: 1 },
    });

    const defaultClass = await prisma.class.upsert({
      where: { name: "1A" },
      update: {},
      create: { name: "1A", capacity: 30, gradeId: grade.id },
    });

    // Utwórz tymczasowego rodzica
    const parent = await prisma.parent.create({
      data: {
        username: `parent_${username}`,
        name: "Rodzic",
        surname: surname,
        email: email ? `parent_${email}` : undefined,
        phone: `${Date.now()}`.slice(-10),
        address: address || "Do uzupełnienia",
      },
    });

    const hashedPassword = await hashPassword(password);

    // Utwórz studenta
    const student = await prisma.student.create({
      data: {
        username,
        name,
        surname,
        email,
        address: address || "Do uzupełnienia",
        birthday: birthday ? new Date(birthday) : new Date(),
        sex: sex || "MALE",
        parentId: parent.id,
        classId: defaultClass.id,
        gradeId: grade.id,
      },
    });

    // Utwórz konto użytkownika
    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        email,
        role: "USER",
        roleId: student.id,
      },
    });

    await setSessionCookie({
      userId: user.id,
      role: "USER",
      roleId: student.id,
      roleTable: "student",
      username: user.username,
      name: `${name} ${surname}`,
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json({ error: "Błąd serwera" }, { status: 500 });
  }
}
