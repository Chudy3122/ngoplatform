// app/api/events/[id]/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }  // zmiana z eventId na id
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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