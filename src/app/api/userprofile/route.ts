// src/app/api/userprofile/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Admin, Teacher, Student, Parent } from "@prisma/client";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('id');
    
    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }
    
    console.log(`Getting profile for user: ${userId}`);
    
    // Sprawdź wszystkie typy użytkowników
    const [admin, teacher, student, parent] = await Promise.all([
      prisma.admin.findUnique({ where: { id: userId } }),
      prisma.teacher.findUnique({ where: { id: userId } }),
      prisma.student.findUnique({ where: { id: userId } }),
      prisma.parent.findUnique({ where: { id: userId } })
    ]);
    
    // Przygotuj podstawową odpowiedź
    let response: Record<string, any> = {
      id: '',
      username: '',
      name: 'Unknown',
      type: '',
    };
    
    if (admin) {
      response = {
        id: admin.id,
        username: admin.username,
        name: admin.name || 'Admin',
        type: 'admin',
        email: admin.email,
      };
      
      // Admin może mieć zdjęcie profilowe
      if ('img' in admin && admin.img) {
        response.img = admin.img;
      }
    } else if (teacher) {
      response = {
        id: teacher.id,
        username: teacher.username,
        name: teacher.name,
        surname: teacher.surname,
        type: 'teacher',
        email: teacher.email,
      };
      
      if ('img' in teacher && teacher.img) {
        response.img = teacher.img;
      }
    } else if (student) {
      response = {
        id: student.id,
        username: student.username,
        name: student.name,
        surname: student.surname,
        type: 'student',
        email: student.email,
      };
      
      if ('img' in student && student.img) {
        response.img = student.img;
      }
    } else if (parent) {
      response = {
        id: parent.id,
        username: parent.username,
        name: parent.name,
        surname: parent.surname,
        type: 'parent',
        email: parent.email,
      };
      // Parent nie ma pola img w schemacie
    } else {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    
    return NextResponse.json(response);
  } catch (error) {
    console.error("Error in userprofile API:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}