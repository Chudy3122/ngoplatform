// app/api/delete-post/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/session";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { postId } = body;

    if (!postId) {
      return NextResponse.json({ error: "Missing post ID" }, { status: 400 });
    }

    const id = parseInt(postId);

    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid post ID format" }, { status: 400 });
    }

    // Sprawdzenie uprawnień użytkownika
    const session = await getSessionFromRequest(req);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { userId, role } = session;

    // Znajdź post
    const post = await prisma.post.findUnique({
      where: { id },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Sprawdź czy użytkownik jest autorem posta lub adminem
    const isAdmin = role === "ADMIN";

    if (post.authorId !== userId && !isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Usuń powiązane dane i post
    await prisma.$transaction([
      prisma.reaction.deleteMany({ where: { postId: id } }),
      prisma.comment.deleteMany({ where: { postId: id } }),
      prisma.post.delete({ where: { id } })
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting post:", error);
    return NextResponse.json({ error: "Failed to delete post" }, { status: 500 });
  }
}
