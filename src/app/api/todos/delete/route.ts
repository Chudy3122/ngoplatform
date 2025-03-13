// app/api/todos/delete/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

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