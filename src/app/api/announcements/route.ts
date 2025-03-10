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

// Usuwanie ogłoszeń - tylko admin może usuwać
export async function DELETE(req: NextRequest) {
  try {
    // Sprawdzenie uprawnień użytkownika
    const authData = await auth();
    const role = (authData.sessionClaims?.metadata as { role?: string })?.role;
    
    // Tylko admin może usuwać ogłoszenia
    if (role !== "admin") {
      return NextResponse.json({ error: "Brak uprawnień - tylko admin może usuwać ogłoszenia" }, { status: 403 });
    }
    
    // Pobranie ID z URL
    const url = new URL(req.url);
    const idParam = url.searchParams.get("id");
    
    if (!idParam) {
      return NextResponse.json({ error: "Brak parametru ID" }, { status: 400 });
    }
    
    // Konwersja ID do liczby
    const id = parseInt(idParam, 10);
    
    if (isNaN(id)) {
      return NextResponse.json({ error: "Nieprawidłowy format ID" }, { status: 400 });
    }
    
    // Usunięcie ogłoszenia
    const deleted = await prisma.announcement.delete({
      where: { id }
    });
    
    return NextResponse.json({ success: true, deleted });
  } catch (error) {
    console.error("Błąd usuwania ogłoszenia:", error);
    // Sprawdźmy czy to błąd Prisma "Record not found"
    if (error instanceof Error && error.message.includes("Record to delete does not exist")) {
      return NextResponse.json({ error: "Ogłoszenie nie istnieje lub zostało już usunięte" }, { status: 404 });
    }
    return NextResponse.json({ error: "Błąd usuwania ogłoszenia" }, { status: 500 });
  }
}

// Tworzenie ogłoszeń - wszyscy użytkownicy mogą tworzyć
export async function POST(req: NextRequest) {
  try {
    // Sprawdzenie czy użytkownik jest zalogowany
    const authData = await auth();
    const userId = authData.userId;
    
    // Sprawdzamy tylko czy użytkownik jest zalogowany
    if (!userId) {
      return NextResponse.json({ error: "Musisz być zalogowany" }, { status: 401 });
    }
    
    // Pobranie danych z żądania
    const data = await req.json();
    
    if (!data.title || !data.description) {
      return NextResponse.json({ error: "Wymagane pola: title, description" }, { status: 400 });
    }
    
    // Tworzenie ogłoszenia - bezpieczna konwersja classId jeśli istnieje
    let classId = null;
    if (data.classId) {
      const parsedClassId = parseInt(data.classId, 10);
      if (!isNaN(parsedClassId)) {
        classId = parsedClassId;
      }
    }
    
    const announcement = await prisma.announcement.create({
      data: {
        title: data.title,
        description: data.description,
        date: new Date(),
        classId: classId
      }
    });
    
    return NextResponse.json(announcement);
  } catch (error) {
    console.error("Błąd tworzenia ogłoszenia:", error);
    return NextResponse.json({ error: "Błąd tworzenia ogłoszenia" }, { status: 500 });
  }
}