// app/api/conversations/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/session";

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const conversations = await prisma.conversation.findMany({
      where: {
        members: { some: { memberId: session.userId } }
      },
      include: {
        members: true,
        messages: { orderBy: { createdAt: 'desc' }, take: 1 }
      },
      orderBy: { lastMessageAt: 'desc' }
    });

    return NextResponse.json(conversations);
  } catch (error) {
    console.error('Error in GET /conversations:', error);
    return NextResponse.json({ error: "Failed to fetch conversations" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { receiverId, userType, receiverType } = await req.json();
    const senderType = (userType || session.role).toUpperCase();
    const recipientType = (receiverType || 'USER').toUpperCase();

    // receiverId may be a role-specific ID (from search) — resolve to User.id
    let receiverUserId: string;
    const receiverUser = await prisma.user.findFirst({ where: { roleId: receiverId } });
    if (receiverUser) {
      receiverUserId = receiverUser.id;
    } else {
      // Fallback: treat receiverId as User.id directly
      receiverUserId = receiverId;
    }

    // Check if conversation already exists
    const existing = await prisma.conversation.findFirst({
      where: {
        AND: [
          { members: { some: { memberId: session.userId } } },
          { members: { some: { memberId: receiverUserId } } }
        ]
      },
      include: { members: true }
    });
    if (existing) return NextResponse.json(existing);

    const newConversation = await prisma.conversation.create({
      data: {
        members: {
          create: [
            { memberId: session.userId, memberType: senderType },
            { memberId: receiverUserId, memberType: recipientType }
          ]
        }
      },
      include: { members: true }
    });

    return NextResponse.json(newConversation);
  } catch (error) {
    console.error('Error creating conversation:', error);
    return NextResponse.json({ error: "Failed to create conversation" }, { status: 500 });
  }
}
