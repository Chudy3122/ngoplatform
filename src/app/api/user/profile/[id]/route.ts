// src/app/api/user/profile/[id]/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  console.log(`API called with user ID: ${params.id}`);
  
  try {
    const userId = params.id;
    
    // Dodajmy proste testowe sprawdzenie dla debugowania
    const isTest = userId === 'test';
    if (isTest) {
      console.log('Returning test data');
      return NextResponse.json({
        id: 'test',
        username: 'testuser',
        name: 'Test User',
        type: 'admin',
        email: 'test@example.com'
      });
    }
    
    console.log(`Looking up user in database: ${userId}`);
    
    // Sprawdź, jaki typ użytkownika to jest
    // Reszta kodu pozostaje bez zmian...
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
      console.log('Found admin user');
    } else if (teacher) {
      userData = teacher;
      userType = 'teacher';
      console.log('Found teacher user');
    } else if (student) {
      userData = student;
      userType = 'student';
      console.log('Found student user');
    } else if (parent) {
      userData = parent;
      userType = 'parent';
      console.log('Found parent user');
    } else {
      // Sprawdź, czy ID może być ID rodzica (parent_)
      if (userId.startsWith('parent_')) {
        const parentId = userId;
        const parent = await prisma.parent.findUnique({ where: { id: parentId } });
        if (parent) {
          userData = parent;
          userType = 'parent';
          console.log('Found parent (from parent_ prefix)');
        }
      }
    }
    
    if (!userData) {
      console.log(`User not found: ${userId}`);
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
    
    console.log(`Returning user data: ${JSON.stringify(response)}`);
    return NextResponse.json(response);
  } catch (error) {
    console.error("Full error details:", error);
    return NextResponse.json({ error: "Failed to fetch user profile" }, { status: 500 });
  }
}