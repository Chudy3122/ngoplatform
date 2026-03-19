// app/api/todos/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/session";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId } = session;
    const { searchParams } = new URL(request.url);
    const queryUserId = searchParams.get("userId");

    if (userId !== queryUserId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const todos = await prisma.todo.findMany({
      where: {
        userId: userId
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(todos);
  } catch (error) {
    console.error("[TODOS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId } = session;

    const body = await request.json();
    const { content, description, startDate, dueDate, status } = body;

    if (!content) {
      return new NextResponse("Content is required", { status: 400 });
    }

    const todo = await prisma.todo.create({
      data: {
        content,
        description: description || "",
        startDate: startDate ? new Date(startDate) : null,
        dueDate: dueDate ? new Date(dueDate) : null,
        status: status || "todo",
        userId
      }
    });

    return NextResponse.json(todo);
  } catch (error) {
    console.error("[TODOS_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
