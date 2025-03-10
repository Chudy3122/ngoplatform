// src/app/api/posts/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
  try {
    // Sprawdzenie czy użytkownik jest zalogowany
    const authData = await auth();
    const userId = authData.userId;
    
    if (!userId) {
      return NextResponse.json({ error: "Musisz być zalogowany" }, { status: 401 });
    }
    
    // Pobranie danych z żądania
    const data = await req.json();
    
    if (!data.title || !data.content) {
      return NextResponse.json({ error: "Wymagane pola: title, content" }, { status: 400 });
    }
    
    // Tworzenie posta w bazie danych
    const post = await prisma.post.create({
      data: {
        title: data.title,
        content: data.content,
        type: data.type || "JOB",
        authorId: userId,
        // Pozostałe wartości ustawione przez model
      }
    });
    
    // Tworzenie odpowiadającego ogłoszenia w tabeli Announcement
    // To pozwala na wyświetlanie postów w komponencie Announcements
    await prisma.announcement.create({
      data: {
        title: data.title,
        description: data.content.substring(0, 500), // Krótki opis z treści posta
        date: new Date(),
      }
    });
    
    return NextResponse.json(post);
  } catch (error) {
    console.error("Błąd tworzenia posta:", error);
    return NextResponse.json({ error: "Błąd tworzenia posta" }, { status: 500 });
  }
}