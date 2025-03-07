// app/api/posts/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";

// Dodajemy obsługę OPTIONS dla CORS
export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Origin': '*'
    }
  });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log("DELETE request received for post ID:", params.id);
  
  try {
    // Na potrzeby testów możemy tymczasowo wyłączyć autoryzację
    let userId = null;
    try {
      const auth = getAuth(req);
      userId = auth.userId;
      console.log("Authenticated user ID:", userId);
    } catch (error) {
      console.log("Authentication error:", error);
    }
    
    const postId = parseInt(params.id);
    console.log("Trying to delete post with ID:", postId);
    
    // Najpierw sprawdzamy w tabeli Post
    let post = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true }
    });

    if (post) {
      console.log("Found post in Post table, author ID:", post.authorId);
      
      // Tymczasowo wyłączamy sprawdzanie autoryzacji
      /*
      if (userId && post.authorId !== userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }
      */

      // Usuwamy post
      await prisma.post.delete({
        where: { id: postId },
      });
      
      console.log("Post deleted successfully");
      return NextResponse.json({ message: "Post deleted successfully" });
    }
    
    // Jeśli nie znaleziono w tabeli Post, sprawdzamy w Announcement
    const announcement = await prisma.announcement.findUnique({
      where: { id: postId }
    });
    
    if (announcement) {
      console.log("Found post in Announcement table");
      
      // Usuwamy ogłoszenie
      await prisma.announcement.delete({
        where: { id: postId },
      });
      
      console.log("Announcement deleted successfully");
      return NextResponse.json({ message: "Announcement deleted successfully" });
    }
    
    // Nie znaleziono posta ani ogłoszenia
    console.log("Post not found in any table");
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
    
  } catch (error) {
    console.error("Error deleting post:", error);
    return NextResponse.json(
      { 
        error: "Failed to delete post", 
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}