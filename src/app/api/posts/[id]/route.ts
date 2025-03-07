// app/api/posts/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Absolutnie minimalna implementacja metody DELETE
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log("DELETE request received for post ID:", params.id);
    const postId = parseInt(params.id);
    
    // Usuń post bez jakiegokolwiek sprawdzania autoryzacji
    await prisma.post.delete({
      where: { id: postId },
    });
    
    console.log("Post deleted successfully");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting post:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

// Domyślna obsługa OPTIONS dla CORS
export function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Origin": "*"
    }
  });
}