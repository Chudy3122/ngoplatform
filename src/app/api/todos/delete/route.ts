// app/api/todos/delete/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/session";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { userId } = session;

    const { taskId } = await req.json();

    if (!taskId) {
      return new NextResponse("taskId is required", { status: 400 });
    }

    await prisma.todo.delete({
      where: {
        id: parseInt(taskId.toString()),
        userId: userId
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE_TASK]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
