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

    const todoId = parseInt(params.todoId);
    if (isNaN(todoId)) {
      return new NextResponse("Invalid todoId", { status: 400 });
    }

    // Sprawdź, czy użytkownik jest właścicielem zadania
    const todo = await prisma.todo.findUnique({
      where: {
        id: todoId
      }
    });

    if (!todo) {
      return new NextResponse("Todo not found", { status: 404 });
    }

    if (todo.userId !== userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { content, description, startDate, dueDate, status } = body;

    const updatedTodo = await prisma.todo.update({
      where: {
        id: todoId
      },
      data: {
        content: content || todo.content,
        description: description !== undefined ? description : todo.description,
        startDate: startDate ? new Date(startDate) : todo.startDate,
        dueDate: dueDate ? new Date(dueDate) : todo.dueDate,
        status: status || todo.status
      }
    });

    return NextResponse.json(updatedTodo);
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

    const todoId = parseInt(params.todoId);
    if (isNaN(todoId)) {
      return new NextResponse("Invalid todoId", { status: 400 });
    }

    // Sprawdź, czy użytkownik jest właścicielem zadania
    const todo = await prisma.todo.findUnique({
      where: {
        id: todoId
      }
    });

    if (!todo) {
      return new NextResponse("Todo not found", { status: 404 });
    }

    if (todo.userId !== userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await prisma.todo.delete({
      where: {
        id: todoId
      }
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[TODO_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}