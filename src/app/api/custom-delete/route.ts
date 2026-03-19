// app/api/custom-delete/route.ts
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

    const id = parseInt(postId, 10);

    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid post ID" }, { status: 400 });
    }

    const session = await getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { role } = session;
    const isAdmin = role === "ADMIN";

    if (!isAdmin) {
      return NextResponse.json({ error: "Only admin can delete posts" }, { status: 403 });
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
