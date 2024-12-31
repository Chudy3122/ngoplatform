// app/api/events/participation/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { eventId, status } = await req.json();
    const metadata = (auth() as any).sessionClaims?.metadata || {};
    const userRole = (metadata.role?.toLowerCase() || '').toUpperCase();

    // Sprawdź czy uczestnictwo już istnieje
    const existingParticipation = await prisma.eventParticipant.findUnique({
      where: {
        eventId_userId: {
          eventId,
          userId
        }
      }
    });

    if (existingParticipation) {
      if (existingParticipation.status === status) {
        // Usuń uczestnictwo
        await prisma.eventParticipant.delete({
          where: {
            eventId_userId: {
              eventId,
              userId
            }
          }
        });
      } else {
        // Aktualizuj status
        await prisma.eventParticipant.update({
          where: {
            eventId_userId: {
              eventId,
              userId
            }
          },
          data: { status }
        });
      }
    } else if (status !== 'NOT_GOING') {
      // Dodaj nowe uczestnictwo
      await prisma.eventParticipant.create({
        data: {
          eventId,
          userId,
          status,
          userType: userRole
        }
      });
    }

    // Pobierz zaktualizowane wydarzenie
    const updatedEvent = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        participants: true,
        authorStudent: {
          select: {
            id: true,
            username: true,
            name: true,
            surname: true,
            img: true
          }
        },
        authorTeacher: {
          select: {
            id: true,
            username: true,
            name: true,
            surname: true,
            img: true
          }
        },
        authorAdmin: {
          select: {
            id: true,
            username: true,
            name: true
          }
        },
        authorParent: {
          select: {
            id: true,
            username: true,
            name: true,
            surname: true
          }
        }
      }
    });

    // Pobierz dodatkowe informacje o uczestnikach
    const participantsWithDetails = await Promise.all(
      updatedEvent?.participants.map(async (participant) => {
        let userData = null;
        
        switch (participant.userType) {
          case 'STUDENT':
            userData = await prisma.student.findUnique({
              where: { id: participant.userId },
              select: {
                username: true,
                name: true,
                surname: true,
                img: true
              }
            });
            break;
          case 'TEACHER':
            userData = await prisma.teacher.findUnique({
              where: { id: participant.userId },
              select: {
                username: true,
                name: true,
                surname: true,
                img: true
              }
            });
            break;
          case 'ADMIN':
            userData = await prisma.admin.findUnique({
              where: { id: participant.userId },
              select: {
                username: true,
                name: true
              }
            });
            break;
          case 'PARENT':
            userData = await prisma.parent.findUnique({
              where: { id: participant.userId },
              select: {
                username: true,
                name: true,
                surname: true
              }
            });
            break;
        }

        return {
          ...participant,
          userData
        };
      }) || []
    );

    return NextResponse.json({
      ...updatedEvent,
      participants: participantsWithDetails
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unknown error occurred" },
      { status: 500 }
    );
  }
}