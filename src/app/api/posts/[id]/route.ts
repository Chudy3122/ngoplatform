import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Pobierz informacje o użytkowniku
    const authData = await auth();
    const userId = authData.userId;
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Sprawdź rolę użytkownika
    const { sessionClaims } = authData;
    const role = (sessionClaims?.metadata as { role?: string })?.role;
    const isAdmin = role === "admin";

    const postId = parseInt(params.id);

    // Sprawdź czy post istnieje
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Sprawdź czy użytkownik jest właścicielem posta lub adminem
    if (post.authorId !== userId && !isAdmin) {
      return NextResponse.json({ error: "Unauthorized - only post owner or admin can delete posts" }, { status: 403 });
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

    // Po usunięciu posta, stwórz ogłoszenie w tabeli Announcement
    try {
      await prisma.announcement.create({
        data: {
          title: "Post został usunięty",
          description: `Post o ID ${postId} został usunięty przez ${isAdmin ? 'administratora' : 'autora'}.`,
          date: new Date(),
        }
      });
    } catch (announcementError) {
      console.error("Błąd przy tworzeniu ogłoszenia o usunięciu posta:", announcementError);
      // Nie przerywamy głównego procesu jeśli to się nie powiedzie
    }

    return NextResponse.json({ 
      success: true,
      message: "Post deleted successfully",
      id: postId,
      deletedBy: isAdmin ? "admin" : "author" 
    });
  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json(
      { error: "Failed to delete post" },
      { status: 500 }
    );
  }
}