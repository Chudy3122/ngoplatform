// src/app/api/events/delete/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/session';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { userId } = session;

    // Pobierz ID wydarzenia z ciała żądania
    const { eventId } = await request.json();

    // Upewnij się, że eventId jest liczbą
    const id = parseInt(eventId);
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid event ID" }, { status: 400 });
    }

    // Znajdź wydarzenie wraz z autorem
    const event = await prisma.event.findUnique({
      where: { id },
      select: {
        id: true,
        authorStudentId: true,
        authorTeacherId: true,
        authorAdminId: true,
        authorParentId: true
      }
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Sprawdź czy użytkownik jest autorem wydarzenia
    const isAuthor =
      event.authorStudentId === userId ||
      event.authorTeacherId === userId ||
      event.authorAdminId === userId ||
      event.authorParentId === userId;

    if (!isAuthor) {
      return NextResponse.json({ error: "Unauthorized - not the author" }, { status: 403 });
    }

    // Usuń wszystkie powiązane rekordy w transakcji
    await prisma.$transaction([
      prisma.eventComment.deleteMany({
        where: { eventId: id }
      }),
      prisma.eventParticipant.deleteMany({
        where: { eventId: id }
      }),
      prisma.event.delete({
        where: { id }
      })
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in POST /api/events/delete:', error);
    return NextResponse.json(
      { error: "Failed to delete event" },
      { status: 500 }
    );
  }
}
