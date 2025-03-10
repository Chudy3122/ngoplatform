// app/api/post-delete/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

// Alternatywny endpoint do usuwania postów metodą POST
export async function POST(req: NextRequest) {
  try {
    // Pobierz ID posta z ciała żądania
    const body = await req.json();
    const { postId } = body;
    
    console.log("POST request do usunięcia posta ID:", postId);
    
    if (!postId) {
      console.log("Brak ID posta w żądaniu");
      return NextResponse.json({ error: "Missing post ID" }, { status: 400 });
    }
    
    const id = parseInt(postId);
    
    if (isNaN(id)) {
      console.log("Nieprawidłowy format ID:", postId);
      return NextResponse.json({ error: "Invalid post ID format" }, { status: 400 });
    }
    
    // Sprawdzenie uprawnień użytkownika
    const authData = await auth();
    const userId = authData.userId;
    
    if (!userId) {
      console.log("Brak autoryzacji - brak userId");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Sprawdź rolę użytkownika
    const { sessionClaims } = authData;
    const role = (sessionClaims?.metadata as { role?: string })?.role;
    const isAdmin = role === "admin";
    
    console.log("User ID:", userId, "Rola:", role, "Admin:", isAdmin);
    
    // Sprawdź czy post istnieje
    const post = await prisma.post.findUnique({
      where: { id },
    });
    
    if (!post) {
      console.log("Post nie znaleziony:", id);
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }
    
    console.log("Znaleziony post:", post);
    console.log("Author ID:", post.authorId, "Current user ID:", userId);
    
    // Admin może usuwać wszystkie posty, autor tylko swoje
    if (post.authorId !== userId && !isAdmin) {
      console.log("Brak uprawnień do usunięcia posta");
      return NextResponse.json({ error: "Unauthorized - only post owner or admin can delete" }, { status: 403 });
    }
    
    console.log("Usuwanie powiązanych danych i posta...");
    // Usuń wszystkie powiązane dane
    await prisma.$transaction([
      prisma.reaction.deleteMany({ where: { postId: id } }),
      prisma.comment.deleteMany({ where: { postId: id } }),
      prisma.post.delete({ where: { id } })
    ]);
    
    console.log("Post został pomyślnie usunięty");
    return NextResponse.json({ 
      success: true,
      message: "Post deleted successfully",
      id
    });
  } catch (error) {
    console.error("Błąd usuwania posta:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to delete post", details: errorMessage },
      { status: 500 }
    );
  }
}