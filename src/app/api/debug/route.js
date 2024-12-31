// app/api/debug/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    console.log("Fetching all database records...");
    
    const conversations = await prisma.conversation.findMany();
    console.log("Conversations:", conversations);

    const parents = await prisma.parent.findMany();
    console.log("Parents:", parents);

    const admins = await prisma.admin.findMany();
    console.log("Admins:", admins);

    const teachers = await prisma.teacher.findMany();
    console.log("Teachers:", teachers);

    return NextResponse.json({
      conversations,
      parents,
      admins,
      teachers
    });
  } catch (error) {
    console.error("Debug endpoint error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}