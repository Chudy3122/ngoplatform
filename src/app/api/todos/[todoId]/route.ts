import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

// Handle PATCH requests
export async function PATCH(
  req: NextRequest,
  { params }: { params: { todoId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
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

// Handle DELETE requests
export async function DELETE(
  req: NextRequest,
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

// Handle GET requests
export async function GET(
  req: NextRequest,
  { params }: { params: { todoId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const todo = await prisma.todo.findUnique({
      where: {
        id: parseInt(params.todoId),
        userId: userId
      }
    });

    if (!todo) {
      return new NextResponse("Not found", { status: 404 });
    }

    return NextResponse.json(todo);
  } catch (error) {
    console.error("[TODO_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

// Add OPTIONS method to handle preflight requests
export async function OPTIONS(
  req: NextRequest
) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Methods': 'GET, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400'
    }
  });
}