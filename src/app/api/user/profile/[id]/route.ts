// src/app/api/user/profile/[id]/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id;
    
    // Sprawdź, jaki typ użytkownika to jest
    const [admin, teacher, student, parent] = await Promise.all([
      prisma.admin.findUnique({ where: { id: userId } }),
      prisma.teacher.findUnique({ where: { id: userId } }),
      prisma.student.findUnique({ where: { id: userId } }),
      prisma.parent.findUnique({ where: { id: userId } })
    ]);
    
    // Ustaw odpowiednie dane użytkownika i typ
    let userData = null;
    let userType = null;
    
    if (admin) {
      userData = admin;
      userType = 'admin';
    } else if (teacher) {
      userData = teacher;
      userType = 'teacher';
    } else if (student) {
      userData = student;
      userType = 'student';
    } else if (parent) {
      userData = parent;
      userType = 'parent';
    } else {
      // Sprawdź, czy ID może być ID rodzica (parent_)
      if (userId.startsWith('parent_')) {
        const parentId = userId;
        const parent = await prisma.parent.findUnique({ where: { id: parentId } });
        if (parent) {
          userData = parent;
          userType = 'parent';
        }
      }
    }
    
    if (!userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    
    // Przygotuj odpowiedź
    const response: any = {
      id: userData.id,
      username: userData.username,
      name: userData.name,
      type: userType,
      email: userData.email
    };
    
    // Dodaj specyficzne pola dla różnych typów użytkowników
    if (userType !== 'admin') {
      // Admin nie ma pola surname
      if ('surname' in userData) {
        response.surname = userData.surname;
      }
    }
    
    // Dodaj obrazek profilowy, jeśli dostępny
    if ('img' in userData && userData.img !== null) {
      response.img = userData.img;
    }
    
    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json({ error: "Failed to fetch user profile" }, { status: 500 });
  }
}