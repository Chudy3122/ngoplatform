import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function POST() {
  try {
    const session = await auth();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.userId;
    
    // Sprawdź czy użytkownik już istnieje
    const [existingAdmin, existingTeacher, existingStudent, existingParent] = await Promise.all([
      prisma.admin.findUnique({ where: { id: userId } }),
      prisma.teacher.findUnique({ where: { id: userId } }),
      prisma.student.findUnique({ where: { id: userId } }),
      prisma.parent.findUnique({ where: { id: userId } })
    ]);

    if (existingAdmin || existingTeacher || existingStudent || existingParent) {
      return NextResponse.json({ message: "User already exists" }, { status: 200 });
    }

    // Stwórz podstawowe rekordy
    console.log('Creating initial records for user:', userId);

    // 1. Stwórz lub znajdź domyślny Grade
    const grade = await prisma.grade.upsert({
      where: { level: 1 },
      update: {},
      create: { level: 1 }
    });

    // 2. Stwórz lub znajdź domyślną Class
    const class1 = await prisma.class.upsert({
      where: { name: '1A' },
      update: {},
      create: {
        name: '1A',
        capacity: 30,
        gradeId: grade.id
      }
    });

    // 3. Stwórz tymczasowego rodzica
    const newParent = await prisma.parent.create({
      data: {
        id: `parent_${userId}`,
        username: `parent_${userId.slice(0, 8)}`, // Krótszy, czytelniejszy username
        name: 'Default Parent',
        surname: 'Default Surname',
        email: `parent_${userId}@example.com`,
        phone: userId,
        address: 'Default Address'
      }
    });

    // 4. Stwórz studenta
    const newStudent = await prisma.student.create({
      data: {
        id: userId,
        username: `user_${userId.slice(0, 8)}`,
        name: 'Default Name',
        surname: 'Default Surname',
        email: null,
        address: 'Default Address',
        sex: 'MALE',
        birthday: new Date(),
        parentId: newParent.id,
        classId: class1.id,
        gradeId: grade.id
      }
    });

    console.log('Successfully created student record:', newStudent);
    return NextResponse.json({ success: true, student: newStudent });
  } catch (error) {
    console.error('Error initializing user:', error);
    return NextResponse.json({ error: "Failed to initialize user" }, { status: 500 });
  }
}