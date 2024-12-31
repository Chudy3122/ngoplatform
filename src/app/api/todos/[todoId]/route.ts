// app/api/todos/[todoId]/route.ts
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: { todoId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { content, description, startDate, dueDate, status } = body;

    const todo = await prisma.todo.update({
      where: {
        id: parseInt(params.todoId),
        userId: userId
      },
      data: {
        content,
        description,
        startDate: startDate ? new Date(startDate) : null,
        dueDate: dueDate ? new Date(dueDate) : null,
        status
      }
    });

    return NextResponse.json(todo);
  } catch (error) {
    console.error("[TODO_PATCH]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { todoId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await prisma.todo.delete({
      where: {
        id: parseInt(params.todoId),
        userId: userId
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[TODO_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}