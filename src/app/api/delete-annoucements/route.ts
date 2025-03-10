// app/api/delete-announcement/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { announcementId } = body;
    
    if (!announcementId) {
      return NextResponse.json({ error: "Brak ID ogłoszenia" }, { status: 400 });
    }
    
    const id = parseInt(announcementId);
    
    if (isNaN(id)) {
      return NextResponse.json({ error: "Nieprawidłowy format ID" }, { status: 400 });
    }
    
    // Sprawdzenie uprawnień użytkownika
    const authData = await auth();
    const role = (authData.sessionClaims?.metadata as { role?: string })?.role;
    
    if (role !== "admin") {
      return NextResponse.json({ error: "Tylko administrator może usuwać ogłoszenia" }, { status: 403 });
    }
    
    // Usuń ogłoszenie
    await prisma.announcement.delete({
      where: { id }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Błąd usuwania ogłoszenia:", error);
    return NextResponse.json({ error: "Nie udało się usunąć ogłoszenia" }, { status: 500 });
  }
}