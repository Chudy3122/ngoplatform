// app/api/todos/move/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/session";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { userId } = session;

    const { taskId, newStatus } = await req.json();

    if (!taskId || !newStatus) {
      return new NextResponse("taskId and newStatus are required", { status: 400 });
    }

    const todo = await prisma.todo.update({
      where: {
        id: parseInt(taskId.toString()),
        userId: userId
      },
      data: {
        status: newStatus
      }
    });

    return NextResponse.json(todo);
  } catch (error) {
    console.error("[MOVE_TASK]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
