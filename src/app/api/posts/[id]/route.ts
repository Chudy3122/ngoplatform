import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const postId = parseInt(params.id);

    // Sprawdź czy post istnieje
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Sprawdź czy użytkownik jest właścicielem posta
    if (post.authorId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Usuń wszystkie reakcje i komentarze powiązane z postem
    await prisma.$transaction([
      prisma.reaction.deleteMany({
        where: { postId },
      }),
      prisma.comment.deleteMany({
        where: { postId },
      }),
      prisma.post.delete({
        where: { id: postId },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json(
      { error: "Failed to delete post" },
      { status: 500 }
    );
  }
}