import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { email, username, firstName, lastName } = await req.json();

    // Symulujemy ID z Clerka
    const clerkUserId = `user_${Date.now()}`;

    // Tworzymy użytkownika w Prismie
    const student = await prisma.student.create({
      data: {
        id: clerkUserId,
        username: username || email.split('@')[0],
        email: email,
        name: firstName || '',
        surname: lastName || '',
        sex: 'MALE',
        address: 'Test Address',
        birthday: new Date(),
        // Testowe wartości dla wymaganych pól
        parentId: 'parent1', // Upewnij się, że taki parent istnieje
        classId: 1,
        gradeId: 1
      }
    });

    return NextResponse.json({
      success: true,
      user: student,
      message: 'Test user created successfully'
    });

  } catch (error) {
    console.error('Test registration error:', error);
    return NextResponse.json(
      { error: "Failed to create test user" },
      { status: 500 }
    );
  }
}