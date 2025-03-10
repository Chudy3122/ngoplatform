// app/api/posts/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { deletePost } from "../controller";

// Obsługa żądania DELETE dla endpointu /api/posts/{id}
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log("DELETE żądanie dla endpointu /api/posts/[id] z id:", params.id);
  
  const postId = parseInt(params.id, 10);
  
  if (isNaN(postId)) {
    console.log("Nieprawidłowy format ID:", params.id);
    return NextResponse.json({ error: "Invalid post ID" }, { status: 400 });
  }
  
  const result = await deletePost(postId);
  
  if (!result.success) {
    return NextResponse.json({ error: result.error, details: result.details }, { status: result.status });
  }
  
  return NextResponse.json(result);
}