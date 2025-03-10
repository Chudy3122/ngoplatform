// app/api/post-delete/route.ts
import { NextRequest, NextResponse } from "next/server";
import { deletePost } from "../../posts/controller";

// Alternatywny endpoint do usuwania postów metodą POST
export async function POST(req: NextRequest) {
  try {
    console.log("POST żądanie dla endpointu /api/post-delete");
    
    // Pobierz ID posta z ciała żądania
    const body = await req.json();
    const { postId } = body;
    
    console.log("Odebrane postId:", postId);
    
    if (!postId) {
      console.log("Brak ID posta w żądaniu");
      return NextResponse.json({ error: "Missing post ID" }, { status: 400 });
    }
    
    const id = parseInt(postId, 10);
    
    if (isNaN(id)) {
      console.log("Nieprawidłowy format ID:", postId);
      return NextResponse.json({ error: "Invalid post ID format" }, { status: 400 });
    }
    
    const result = await deletePost(id);
    
    if (!result.success) {
      return NextResponse.json({ error: result.error, details: result.details }, { status: result.status });
    }
    
    return NextResponse.json(result);
  } catch (error) {
    console.error("Błąd w obsłudze żądania POST:", error);
    return NextResponse.json(
      { error: "Failed to process request", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}