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

export async function GET(req: NextRequest) {
  try {
    console.log("Pobieranie ogłoszeń dla strony głównej");
    
    // Pobierz dane z tabeli Announcement
    const announcements = await prisma.announcement.findMany({
      take: 3,
      orderBy: {
        date: 'desc'
      }
    });
    
    console.log(`Znaleziono ${announcements.length} ogłoszeń`);
    
    // Zwróć ogłoszenia z domyślną nazwą autora
    const result = announcements.map(a => ({
      ...a,
      authorName: "Admin" // Domyślna nazwa autora
    }));
    
    return NextResponse.json(result);
  } catch (error) {
    console.error("Błąd pobierania ogłoszeń:", error);
    return NextResponse.json(
      { error: "Błąd pobierania ogłoszeń" },
      { status: 500 }
    );
  }
}

// Dodanie metody DELETE do usuwania ogłoszeń
export async function DELETE(req: NextRequest) {
  try {
    // Sprawdzenie uprawnień użytkownika
    const authData = await auth();
    const role = (authData.sessionClaims?.metadata as { role?: string })?.role;
    
    // Tylko admin może usuwać ogłoszenia
    if (role !== "admin") {
      return NextResponse.json(
        { error: "Brak uprawnień do usuwania ogłoszeń" },
        { status: 403 }
      );
    }
    
    // Pobranie ID ogłoszenia z URL
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    
    if (!id) {
      return NextResponse.json(
        { error: "Nie podano ID ogłoszenia" },
        { status: 400 }
      );
    }
    
    // Usunięcie ogłoszenia
    await prisma.announcement.delete({
      where: {
        id: parseInt(id, 10)
      }
    });
    
    console.log(`Usunięto ogłoszenie o ID: ${id}`);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Błąd usuwania ogłoszenia:", error);
    return NextResponse.json(
      { error: "Błąd usuwania ogłoszenia" },
      { status: 500 }
    );
  }
}

// Dodanie metody POST do tworzenia ogłoszeń
export async function POST(req: NextRequest) {
  try {
    // Sprawdzenie uprawnień użytkownika
    const authData = await auth();
    const role = (authData.sessionClaims?.metadata as { role?: string })?.role;
    const userId = authData.userId;
    
    // Sprawdzenie czy użytkownik ma uprawnienia (admin, nauczyciel lub rodzic)
    if (!role || !["admin", "teacher", "parent"].includes(role)) {
      return NextResponse.json(
        { error: "Brak uprawnień do tworzenia ogłoszeń" },
        { status: 403 }
      );
    }
    
    // Pobranie danych z żądania
    const data = await req.json();
    
    // Walidacja danych
    if (!data.title || !data.description) {
      return NextResponse.json(
        { error: "Brak wymaganych pól: tytuł i opis" },
        { status: 400 }
      );
    }
    
    // Utworzenie nowego ogłoszenia
    const announcement = await prisma.announcement.create({
      data: {
        title: data.title,
        description: data.description,
        date: new Date(),
        authorId: userId,
        classId: data.classId || null
      }
    });
    
    console.log(`Utworzono nowe ogłoszenie ID: ${announcement.id}`);
    
    return NextResponse.json(announcement);
  } catch (error) {
    console.error("Błąd tworzenia ogłoszenia:", error);
    return NextResponse.json(
      { error: "Błąd tworzenia ogłoszenia" },
      { status: 500 }
    );
  }
}