// app/api/userprofile/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get('id');
    
    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }
    
    // Znajdź studenta w bazie danych na podstawie ID
    const student = await prisma.student.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        name: true,
        surname: true,
        img: true
      }
    });
    
    if (student) {
      return NextResponse.json({
        id: student.id,
        username: student.username || 'User',
        name: student.name,
        surname: student.surname,
        img: student.img,
        loading: false
      });
    }
    
    // Jeśli nie znaleziono studenta, sprawdź inne typy użytkowników
    const teacher = await prisma.teacher.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        name: true,
        surname: true,
        img: true
      }
    });
    
    if (teacher) {
      return NextResponse.json({
        id: teacher.id,
        username: teacher.username || 'User',
        name: teacher.name,
        surname: teacher.surname,
        img: teacher.img,
        loading: false
      });
    }
    
    // Sprawdź admina
    const admin = await prisma.admin.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        name: true,
        img: true
      }
    });
    
    if (admin) {
      return NextResponse.json({
        id: admin.id,
        username: admin.username || 'User',
        name: admin.name,
        img: admin.img,
        loading: false
      });
    }
    
    // Sprawdź rodzica
    const parent = await prisma.parent.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        name: true,
        surname: true
      }
    });
    
    if (parent) {
      return NextResponse.json({
        id: parent.id,
        username: parent.username || 'User',
        name: parent.name,
        surname: parent.surname,
        loading: false
      });
    }
    
    // Jeśli nie znaleziono użytkownika w żadnej tabeli
    return NextResponse.json({ 
      id: userId, 
      username: 'Unknown User',
      loading: false
    });

  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}