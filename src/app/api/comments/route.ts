import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { content, postId } = body;

    if (!content || !postId) {
      return NextResponse.json(
        { error: "Content and postId are required" },
        { status: 400 }
      );
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        postId,
        authorId: userId,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            surname: true,
            img: true,
          },
        },
      },
    });

    return NextResponse.json(comment);
  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json(
      { error: "Failed to create comment" },
      { status: 500 }
    );
  }
}