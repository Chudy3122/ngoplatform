// app/api/post-delete/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

// Prosty endpoint do usuwania postów metodą POST
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
    const role = (authData.sessionClaims?.metadata as { role?: string })?.role;
    const isAdmin = role === "admin";
    
    console.log("User ID:", userId, "Rola:", role, "Admin:", isAdmin);
    
    if (!userId) {
      console.log("Brak autoryzacji - brak userId");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Admin zawsze może usuwać posty
    if (!isAdmin) {
      console.log("Użytkownik nie jest adminem, sprawdzanie czy jest autorem...");
      // Sprawdź czy post istnieje i czy należy do użytkownika
      const post = await prisma.post.findUnique({
        where: { id },
        select: { authorId: true }
      });
      
      if (!post) {
        console.log("Post nie znaleziony:", id);
        return NextResponse.json({ error: "Post not found" }, { status: 404 });
      }
      
      if (post.authorId !== userId) {
        console.log("Brak uprawnień - użytkownik nie jest autorem ani adminem");
        return NextResponse.json({ error: "Unauthorized - only post owner or admin can delete" }, { status: 403 });
      }
    }
    
    console.log("Usuwanie posta...");
    
    // Usuwanie posta i powiązanych danych
    try {
      // Usuń reakcje
      await prisma.reaction.deleteMany({
        where: { postId: id }
      });
      console.log("Usunięto reakcje");
      
      // Usuń komentarze
      await prisma.comment.deleteMany({
        where: { postId: id }
      });
      console.log("Usunięto komentarze");
      
      // Usuń post
      await prisma.post.delete({
        where: { id }
      });
      console.log("Usunięto post");
    } catch (deleteError) {
      console.error("Błąd podczas usuwania danych:", deleteError);
      throw deleteError;
    }
    
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