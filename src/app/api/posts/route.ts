// app/api/posts/route.ts
import { NextResponse } from "next/server";
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

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const postId = parseInt(params.id);
    
    // Sprawdź czy post istnieje i czy należy do użytkownika
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true }
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    if (post.authorId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Usuń post
    await prisma.post.delete({
      where: { id: postId },
    });

    return NextResponse.json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Error deleting post:", error);
    return NextResponse.json(
      { error: "Failed to delete post" },
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