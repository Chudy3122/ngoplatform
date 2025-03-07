// src/app/api/announcements/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

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