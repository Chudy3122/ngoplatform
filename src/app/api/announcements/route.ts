// src/app/api/announcements/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

// Obsługa CORS
export function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization'
    }
  });
}

// Pobieranie ogłoszeń
export async function GET(req: NextRequest) {
  try {
    const announcements = await prisma.announcement.findMany({
      take: 3,
      orderBy: {
        date: 'desc'
      }
    });
    
    return NextResponse.json(announcements);
  } catch (error) {
    console.error("Błąd pobierania ogłoszeń:", error);
    return NextResponse.json(
      { error: "Błąd pobierania ogłoszeń" },
      { status: 500 }
    );
  }
}

// Usuwanie ogłoszeń
export async function DELETE(req: NextRequest) {
  try {
    // Sprawdzenie uprawnień użytkownika
    const authData = await auth();
    const role = (authData.sessionClaims?.metadata as { role?: string })?.role;
    
    if (role !== "admin") {
      return NextResponse.json({ error: "Brak uprawnień" }, { status: 403 });
    }
    
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    
    if (!id) {
      return NextResponse.json({ error: "Brak ID" }, { status: 400 });
    }
    
    await prisma.announcement.delete({
      where: { id: parseInt(id, 10) }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Błąd usuwania ogłoszenia:", error);
    return NextResponse.json({ error: "Błąd serwera" }, { status: 500 });
  }
}

// Tworzenie ogłoszeń
export async function POST(req: NextRequest) {
  try {
    // Sprawdzenie uprawnień
    const authData = await auth();
    const role = (authData.sessionClaims?.metadata as { role?: string })?.role;
    
    if (!role || !["admin", "teacher", "parent"].includes(role)) {
      return NextResponse.json({ error: "Brak uprawnień" }, { status: 403 });
    }
    
    const data = await req.json();
    
    if (!data.title || !data.description) {
      return NextResponse.json({ error: "Niepełne dane" }, { status: 400 });
    }
    
    const announcement = await prisma.announcement.create({
      data: {
        title: data.title,
        description: data.description,
        date: new Date(),
        classId: data.classId || null
      }
    });
    
    return NextResponse.json(announcement);
  } catch (error) {
    console.error("Błąd tworzenia ogłoszenia:", error);
    return NextResponse.json({ error: "Błąd serwera" }, { status: 500 });
  }
}