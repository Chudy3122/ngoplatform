// src/app/api/posts/[id]/route.ts
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

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log("Otrzymano żądanie DELETE dla ID:", params.id);
    
    const postId = parseInt(params.id);
    
    // Spróbuj usunąć post
    try {
      await prisma.post.delete({
        where: { id: postId }
      });
      console.log("Post usunięty pomyślnie");
      return NextResponse.json({ success: true });
    } catch (e) {
      console.error("Błąd usuwania z tabeli Post:", e);
      
      // Spróbuj Announcement
      try {
        await prisma.announcement.delete({
          where: { id: postId }
        });
        console.log("Announcement usunięty pomyślnie");
        return NextResponse.json({ success: true });
      } catch (e2) {
        console.error("Błąd usuwania z tabeli Announcement:", e2);
        return NextResponse.json({ error: "Nie znaleziono posta" }, { status: 404 });
      }
    }
  } catch (error) {
    console.error("Błąd podczas usuwania:", error);
    return NextResponse.json(
      { error: "Wystąpił błąd podczas usuwania" },
      { status: 500 }
    );
  }
}