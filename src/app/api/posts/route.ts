// app/api/posts/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

interface CustomError {
  name?: string;
  message: string;
  stack?: string;
}

export async function GET() {
  try {
    const posts = await prisma.post.findMany({
      include: {
        author: {
          select: {
            id: true,
            name: true,
            surname: true,
            img: true,
          }
        },
        comments: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                surname: true,
                img: true,
              }
            },
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        reactions: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(posts);
  } catch (error: unknown) {
    const customError = {
      message: error instanceof Error ? error.message : "An unknown error occurred"
    };
    
    return NextResponse.json({ error: customError.message }, { status: 500 });
  }
}

// Poprawiona obsługa DELETE zgodna z App Router API
export async function DELETE(req: NextRequest) {
  try {
    // Pobierz ID z parametrów URL
    const url = new URL(req.url);
    const idParam = url.searchParams.get("id");
    
    if (!idParam) {
      return NextResponse.json({ error: "Missing post ID" }, { status: 400 });
    }
    
    const postId = parseInt(idParam);
    
    if (isNaN(postId)) {
      return NextResponse.json({ error: "Invalid post ID format" }, { status: 400 });
    }
    
    // Sprawdzenie autoryzacji
    const authResult = await auth();
    const userId = authResult?.userId;
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Sprawdź czy post istnieje i czy należy do użytkownika
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true }
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Dla większej elastyczności - admin też może usuwać posty
    const { sessionClaims } = authResult;
    const role = (sessionClaims?.metadata as { role?: string })?.role;
    const isAdmin = role === "admin";

    if (post.authorId !== userId && !isAdmin) {
      return NextResponse.json({ error: "Unauthorized - you can only delete your own posts" }, { status: 403 });
    }

    // Usuń post
    await prisma.post.delete({
      where: { id: postId },
    });

    // Po usunięciu posta, stwórz także ogłoszenie w tabeli Announcement
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

    return NextResponse.json({ message: "Post deleted successfully", id: postId });
  } catch (error) {
    console.error("Error deleting post:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to delete post", details: errorMessage },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const authResult = await auth();
    const userId = authResult?.userId;
    
    console.log("Auth userId:", userId);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    console.log("Request body:", body);
    const { title, content, type } = body;

    if (!title || !content) {
      return NextResponse.json({ error: "Title and content are required" }, { status: 400 });
    }

    // Sprawdź czy user istnieje
    const user = await prisma.student.findUnique({
      where: { id: userId },
    });

    console.log("Found user:", user);

    if (!user) {
      // Najpierw sprawdź/utwórz niezbędne powiązane rekordy
      
      // 1. Sprawdź/utwórz domyślny Grade
      let grade = await prisma.grade.findFirst({
        where: { level: 1 }
      });

      if (!grade) {
        grade = await prisma.grade.create({
          data: { level: 1 }
        });
      }

      // 2. Sprawdź/utwórz domyślną klasę
      let class_ = await prisma.class.findFirst({
        where: { 
          gradeId: grade.id,
          name: 'Default Class'
        }
      });

      if (!class_) {
        class_ = await prisma.class.create({
          data: {
            name: 'Default Class',
            capacity: 30,
            gradeId: grade.id
          }
        });
      }


      
      // 3. Sprawdź/utwórz domyślnego rodzica
      let parent = await prisma.parent.findFirst({
        where: { username: 'default_parent' }
      });

      if (!parent) {
        parent = await prisma.parent.create({
          data: {
            id: 'default_parent_id',
            username: 'default_parent',
            name: 'Default',
            surname: 'Parent',
            phone: '123456789',
            address: 'Default Address',
          }
        });
      }

      // 4. Teraz możemy utworzyć studenta
      await prisma.student.create({
        data: {
          id: userId,
          username: "temp_user",
          name: "Temporary",
          surname: "User",
          bloodType: "O+",
          sex: "MALE",
          address: "Temporary Address",
          birthday: new Date(),
          parentId: parent.id,
          classId: class_.id,
          gradeId: grade.id
        }
      });
    }

    // Teraz możemy utworzyć post
    const post = await prisma.post.create({
      data: {
        title,
        content,
        type: type as 'JOB' | 'ANNOUNCEMENT' | 'OTHER',
        authorId: userId,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            surname: true,
            img: true,
          }
        },
      },
    });

    // Dodatkowo tworzymy ogłoszenie w tabeli Announcement
    try {
      await prisma.announcement.create({
        data: {
          title,
          description: content.substring(0, 500), // Krótki opis z treści posta
          date: new Date(),
        }
      });
    } catch (announcementError) {
      console.error("Błąd przy tworzeniu odpowiadającego ogłoszenia:", announcementError);
      // Nie przerywamy głównego procesu jeśli to się nie powiedzie
    }

    console.log("Created post:", post);
    return NextResponse.json(post);

  } catch (error: unknown) {
    const customError: CustomError = {
      message: error instanceof Error ? error.message : "An unknown error occurred",
      name: error instanceof Error ? error.name : undefined,
      stack: error instanceof Error ? error.stack : undefined
    };

    console.error("Detailed server error:", {
      name: customError.name,
      message: customError.message,
      stack: customError.stack
    });
    
    return NextResponse.json(
      { 
        error: "Internal server error", 
        details: customError.message,
        stack: customError.stack 
      },
      { status: 500 }
    );
  }
}