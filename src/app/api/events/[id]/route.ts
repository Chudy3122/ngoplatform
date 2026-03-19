// app/api/events/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/session';
import prisma from '@/lib/prisma';

console.log('Route file loaded: api/events/[id]/route.ts');

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }  // zmiana z eventId na id
) {
  console.log('DELETE method called with params:', params);
  try {
    const session = await getSessionFromRequest(request);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { userId } = session;

    // Upewnij się, że id jest liczbą
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid event ID" }, { status: 400 });
    }

    // Znajdź wydarzenie wraz z autorem
    const event = await prisma.event.findUnique({
      where: {
        id: id  // używamy zmiennej id
      },
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
        where: { id: id }
      })
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/events/[id]:', error);
    return NextResponse.json(
      { error: "Failed to delete event" },
      { status: 500 }
    );
  }
}
