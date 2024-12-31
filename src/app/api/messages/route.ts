import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { MessageStatus, Prisma, UserType } from "@prisma/client";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const conversationId = searchParams.get('conversationId');

    if (!conversationId) {
      return NextResponse.json(
        { error: "Conversation ID is required" },
        { status: 400 }
      );
    }

    const messages = await prisma.message.findMany({
      where: {
        conversationId,
        conversation: {
          members: {
            some: {
              memberId: session.userId
            }
          }
        }
      },
      include: {
        conversation: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    // Optional: Fetch user details for each message if needed
    const messagesWithSenderDetails = await Promise.all(
      messages.map(async (message) => {
        let senderDetails = null;
        switch (message.senderType) {
          case 'ADMIN':
            senderDetails = await prisma.admin.findUnique({
              where: { id: message.senderId }
            });
            break;
          case 'TEACHER':
            senderDetails = await prisma.teacher.findUnique({
              where: { id: message.senderId }
            });
            break;
          case 'STUDENT':
            senderDetails = await prisma.student.findUnique({
              where: { id: message.senderId }
            });
            break;
          case 'PARENT':
            senderDetails = await prisma.parent.findUnique({
              where: { id: message.senderId }
            });
            break;
        }
        return {
          ...message,
          sender: senderDetails
        };
      })
    );

    return NextResponse.json(messagesWithSenderDetails);
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { content, conversationId } = await req.json();
    
    const conversationMember = await prisma.conversationMember.findFirst({
      where: {
        memberId: session.userId,
        conversationId: conversationId
      }
    });

    if (!conversationMember) {
      return NextResponse.json(
        { error: "User not in conversation" },
        { status: 403 }
      );
    }

    // Verify user exists in their respective table
    let userExists = false;
    switch (conversationMember.memberType) {
      case 'ADMIN':
        userExists = await prisma.admin.findUnique({ 
          where: { id: session.userId } 
        }) !== null;
        break;
      case 'TEACHER':
        userExists = await prisma.teacher.findUnique({ 
          where: { id: session.userId } 
        }) !== null;
        break;
      case 'STUDENT':
        userExists = await prisma.student.findUnique({ 
          where: { id: session.userId } 
        }) !== null;
        break;
      case 'PARENT':
        userExists = await prisma.parent.findUnique({ 
          where: { id: session.userId } 
        }) !== null;
        break;
    }

    if (!userExists) {
      return NextResponse.json(
        { error: "User does not exist in the system" },
        { status: 404 }
      );
    }

    const messageData: Prisma.MessageUncheckedCreateInput = {
      content,
      conversationId,
      senderId: session.userId,
      senderType: conversationMember.memberType,
      status: 'SENT'
    };

    console.log("Creating message with data:", messageData);

    // Use transaction for consistency
    const result = await prisma.$transaction(async (prisma) => {
      const message = await prisma.message.create({
        data: messageData,
        include: {
          conversation: true
        }
      });

      // Get sender details based on type
      let sender;
      switch (conversationMember.memberType) {
        case 'ADMIN':
          sender = await prisma.admin.findUnique({ where: { id: session.userId } });
          break;
        case 'TEACHER':
          sender = await prisma.teacher.findUnique({ where: { id: session.userId } });
          break;
        case 'STUDENT':
          sender = await prisma.student.findUnique({ where: { id: session.userId } });
          break;
        case 'PARENT':
          sender = await prisma.parent.findUnique({ where: { id: session.userId } });
          break;
      }

      await prisma.conversation.update({
        where: { id: conversationId },
        data: { lastMessageAt: new Date() }
      });

      return {
        ...message,
        sender
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error creating message:', error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.error('Error code:', error.code);
      console.error('Error meta:', error.meta);
    }
    return NextResponse.json(
      { error: "Failed to create message", details: error },
      { status: 500 }
    );
  }
}