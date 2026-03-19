import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/session";
import { Prisma } from "@prisma/client";

// Dodanie obsługi CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId } = session;

    const { searchParams } = new URL(req.url);
    const conversationId = searchParams.get('conversationId');

    console.log("GET /api/messages - Pobieranie wiadomości dla konwersacji:", conversationId, "użytkownik:", userId);

    if (!conversationId) {
      return NextResponse.json(
        { error: "Conversation ID is required" },
        { status: 400 }
      );
    }

    // Sprawdź czy konwersacja istnieje
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { members: true }
    });

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    // Sprawdź czy użytkownik jest członkiem konwersacji
    const isMember = conversation.members.some(m => m.memberId === userId);
    if (!isMember) {
      return NextResponse.json(
        { error: "User not in conversation" },
        { status: 403 }
      );
    }

    // Pobierz wiadomości
    const messages = await prisma.message.findMany({
      where: {
        conversationId,
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    console.log(`Znaleziono ${messages.length} wiadomości`);
    return NextResponse.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    console.log("POST /api/messages - Próba utworzenia nowej wiadomości");

    const session = await getSessionFromRequest(req);
    if (!session) {
      console.log("Brak autoryzacji - brak sesji");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId } = session;
    console.log("Autoryzowany użytkownik:", userId);

    // Pobieranie danych z żądania
    const reqData = await req.json();
    console.log("Dane żądania:", reqData);

    const { content, conversationId } = reqData;

    if (!content || !conversationId) {
      console.log("Brak wymaganych pól:", { content, conversationId });
      return NextResponse.json(
        { error: "Missing required fields: content, conversationId" },
        { status: 400 }
      );
    }

    // Sprawdź czy konwersacja istnieje
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { members: true }
    });

    if (!conversation) {
      console.log("Konwersacja nie istnieje:", conversationId);
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    // Znajdź członkostwo użytkownika w konwersacji
    const member = conversation.members.find(m => m.memberId === userId);
    if (!member) {
      console.log("Użytkownik nie jest członkiem konwersacji");
      return NextResponse.json(
        { error: "User not in conversation" },
        { status: 403 }
      );
    }

    // Tworzenie wiadomości (uproszczone)
    const message = await prisma.message.create({
      data: {
        content,
        conversationId,
        senderId: userId,
        senderType: member.memberType,
        status: 'SENT'
      }
    });

    // Aktualizacja czasu ostatniej wiadomości
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: new Date() }
    });

    console.log("Wiadomość utworzona pomyślnie, ID:", message.id);
    return NextResponse.json(message);
  } catch (error) {
    console.error('Error creating message:', error);
    // Szczegółowe logowanie błędów Prisma
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.error('Prisma error code:', error.code);
      console.error('Prisma error meta:', error.meta);
    }
    return NextResponse.json(
      { error: "Failed to create message", details: String(error) },
      { status: 500 }
    );
  }
}
