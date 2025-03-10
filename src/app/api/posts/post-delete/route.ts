// app/api/delete-post/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
  console.log("POST /api/delete-post received");
  
  try {
    const body = await req.json();
    const { postId } = body;
    
    console.log("Received data:", { postId });
    
    if (!postId) {
      console.log("Missing post ID");
      return NextResponse.json({ error: "Missing post ID" }, { status: 400 });
    }
    
    const id = parseInt(postId);
    
    if (isNaN(id)) {
      console.log("Invalid post ID format");
      return NextResponse.json({ error: "Invalid post ID format" }, { status: 400 });
    }
    
    // Sprawdzenie uprawnień użytkownika
    const authData = await auth();
    const role = (authData.sessionClaims?.metadata as { role?: string })?.role;
    const isAdmin = role === "admin";
    
    console.log("User role:", role, "Is admin:", isAdmin);
    
    if (!authData.userId) {
      console.log("Unauthorized - no user ID");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Znajdź post
    const post = await prisma.post.findUnique({
      where: { id },
    });
    
    console.log("Found post:", post);
    
    if (!post) {
      console.log("Post not found");
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }
    
    // Usuwanie posta
    console.log("Deleting post");
    
    try {
      // Usuń reakcje
      await prisma.reaction.deleteMany({
        where: { postId: id }
      });
      
      // Usuń komentarze
      await prisma.comment.deleteMany({
        where: { postId: id }
      });
      
      // Usuń post
      await prisma.post.delete({
        where: { id }
      });
    } catch (deleteError) {
      console.error("Error during deletion:", deleteError);
      throw deleteError;
    }
    
    console.log("Post deleted successfully");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in delete-post endpoint:", error);
    return NextResponse.json(
      { error: "Failed to delete post", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

// Dodaj również opcje CORS
export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  });
}