// app/api/conversations/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.userId) {
      console.log("No session found in GET /conversations");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("Fetching conversations for user:", session.userId);

    const conversations = await prisma.conversation.findMany({
      where: {
        members: {
          some: {
            memberId: session.userId
          }
        }
      },
      include: {
        members: {
          include: {
            // Możemy dodać dodatkowe relacje jeśli potrzebne
          }
        },
        messages: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        }
      },
      orderBy: {
        lastMessageAt: 'desc'
      }
    });

    console.log("Found conversations:", conversations);
    return NextResponse.json(conversations);
  } catch (error) {
    console.error('Error in GET /conversations:', error);
    return NextResponse.json(
      { error: "Failed to fetch conversations" },
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

    const { receiverId, userType, receiverType } = await req.json();
    console.log("Creating conversation:", { receiverId, userType, receiverType });

    // Konwertuj typy na wielkie litery
    const senderType = (userType || 'ADMIN').toUpperCase();
    const recipientType = (receiverType || 'PARENT').toUpperCase();

    // Sprawdź czy konwersacja już istnieje
    const existingConversation = await prisma.conversation.findFirst({
      where: {
        AND: [
          { members: { some: { memberId: session.userId } } },
          { members: { some: { memberId: receiverId } } }
        ]
      },
      include: {
        members: true
      }
    });

    if (existingConversation) {
      return NextResponse.json(existingConversation);
    }

    const newConversation = await prisma.conversation.create({
      data: {
        members: {
          create: [
            {
              memberId: session.userId,
              memberType: senderType,
            },
            {
              memberId: receiverId,
              memberType: recipientType,
            }
          ]
        }
      },
      include: {
        members: true
      }
    });

    return NextResponse.json(newConversation);
  } catch (error) {
    console.error('Error creating conversation:', error);
    return NextResponse.json(
      { error: "Failed to create conversation", details: error },
      { status: 500 }
    );
  }
}