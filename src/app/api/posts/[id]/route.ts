// app/api/posts/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log("DELETE /api/posts/[id] received with ID:", params.id);
  
  try {
    // Sprawdzenie uprawnień użytkownika
    const authData = await auth();
    const userId = authData.userId;
    
    console.log("Auth data:", { userId, sessionClaims: authData.sessionClaims });
    
    if (!userId) {
      console.log("No userId found, returning 401");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Sprawdź rolę użytkownika
    const { sessionClaims } = authData;
    const role = (sessionClaims?.metadata as { role?: string })?.role;
    const isAdmin = role === "admin";
    
    console.log("User role:", role, "Is admin:", isAdmin);

    const postId = parseInt(params.id);
    
    if (isNaN(postId)) {
      console.log("Invalid post ID format:", params.id);
      return NextResponse.json({ error: "Invalid post ID format" }, { status: 400 });
    }

    // Sprawdź czy post istnieje
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    console.log("Found post:", post);

    if (!post) {
      console.log("Post not found, returning 404");
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Admin może usuwać wszystkie posty, autor tylko swoje
    if (post.authorId !== userId && !isAdmin) {
      console.log("User is not author or admin, returning 403");
      return NextResponse.json({ error: "Unauthorized - only post owner or admin can delete" }, { status: 403 });
    }

    console.log("Starting to delete post and related data");

    // Usuń wszystkie powiązane dane
    try {
      // Usuń reakcje
      await prisma.reaction.deleteMany({
        where: { postId }
      });
      console.log("Deleted reactions");
      
      // Usuń komentarze
      await prisma.comment.deleteMany({
        where: { postId }
      });
      console.log("Deleted comments");
      
      // Usuń post
      await prisma.post.delete({
        where: { id: postId }
      });
      console.log("Deleted post");
    } catch (deleteError) {
      console.error("Error during delete transaction:", deleteError);
      throw deleteError;
    }

    console.log("Post deleted successfully");
    return NextResponse.json({ 
      success: true,
      message: "Post deleted successfully",
      id: postId
    });
  } catch (error) {
    console.error("Error deleting post:", error);
    return NextResponse.json(
      { error: "Failed to delete post", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

// Dodajmy również obsługę GET, żeby sprawdzić czy routing działa poprawnie
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log("GET /api/posts/[id] received with ID:", params.id);
  return NextResponse.json({ message: "GET for post ID test", id: params.id });
}