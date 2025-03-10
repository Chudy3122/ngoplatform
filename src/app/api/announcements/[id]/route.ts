// app/api/announcements/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log("DELETE request received for announcement ID:", params.id);
    
    // Sprawdzenie uprawnień użytkownika
    const authData = await auth();
    const role = (authData.sessionClaims?.metadata as { role?: string })?.role;
    
    // Tylko admin może usuwać ogłoszenia
    if (role !== "admin") {
      console.log("Unauthorized - only admin can delete announcements");
      return NextResponse.json({ error: "Brak uprawnień - tylko admin może usuwać ogłoszenia" }, { status: 403 });
    }
    
    // Konwersja ID do liczby
    const id = parseInt(params.id, 10);
    
    if (isNaN(id)) {
      console.log("Invalid announcement ID format:", params.id);
      return NextResponse.json({ error: "Nieprawidłowy format ID" }, { status: 400 });
    }
    
    console.log("Deleting announcement:", id);
    // Usunięcie ogłoszenia
    await prisma.announcement.delete({
      where: { id }
    });
    
    console.log("Announcement deleted successfully");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting announcement:", error);
    // Sprawdź czy to błąd Prisma "Record not found"
    if (error instanceof Error && error.message.includes("Record to delete does not exist")) {
      return NextResponse.json({ error: "Ogłoszenie nie istnieje lub zostało już usunięte" }, { status: 404 });
    }
    return NextResponse.json({ error: "Błąd usuwania ogłoszenia" }, { status: 500 });
  }
}