// app/api/events/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/session";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const events = await prisma.event.findMany({
      include: {
        authorStudent: {
          select: {
            id: true,
            username: true,
            name: true,
            surname: true,
            img: true,
          },
        },
        authorTeacher: {
          select: {
            id: true,
            username: true,
            name: true,
            surname: true,
            img: true,
          },
        },
        authorAdmin: {
          select: {
            id: true,
            username: true,
            name: true,
          },
        },
        authorParent: {
          select: {
            id: true,
            username: true,
            name: true,
            surname: true,
          },
        },
        participants: {
          select: {
            id: true,
            userId: true,
            status: true,
            userType: true,
            createdAt: true,
          },
        },
        class: true,
        comments: {
          include: {
            authorStudent: true,
            authorTeacher: true,
            authorAdmin: true,
            authorParent: true,
          }
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Pobierz dodatkowe informacje o uczestnikach
    const eventsWithParticipants = await Promise.all(
      events.map(async (event) => {
        const participantsWithDetails = await Promise.all(
          event.participants.map(async (participant) => {
            let userData = null;

            switch (participant.userType) {
              case 'STUDENT':
                userData = await prisma.student.findUnique({
                  where: { id: participant.userId },
                  select: { username: true, name: true, surname: true, img: true }
                });
                break;
              case 'TEACHER':
                userData = await prisma.teacher.findUnique({
                  where: { id: participant.userId },
                  select: { username: true, name: true, surname: true, img: true }
                });
                break;
              case 'ADMIN':
                userData = await prisma.admin.findUnique({
                  where: { id: participant.userId },
                  select: { username: true, name: true }
                });
                break;
              case 'PARENT':
                userData = await prisma.parent.findUnique({
                  where: { id: participant.userId },
                  select: { username: true, name: true, surname: true }
                });
                break;
            }

            return {
              ...participant,
              userData
            };
          })
        );

        return {
          ...event,
          participants: participantsWithDetails
        };
      })
    );

    return NextResponse.json(eventsWithParticipants);
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    console.log('Session:', session);

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { userId, role } = session;
    const userRole = role.toLowerCase();

    console.log('User ID:', userId);
    console.log('User role:', userRole);

    // Sprawdź typ użytkownika
    const [student, teacher, admin, parent] = await Promise.all([
      prisma.student.findUnique({ where: { id: userId } }),
      prisma.teacher.findUnique({ where: { id: userId } }),
      prisma.admin.findUnique({ where: { id: userId } }),
      prisma.parent.findUnique({ where: { id: userId } })
    ]);

    console.log('Found user records:', {
      student,
      teacher,
      admin,
      parent
    });

    const data = await req.json();
    console.log('Received data:', data);

    // Sprawdź typ użytkownika na podstawie roli i znalezionych rekordów
    let userType = null;
    let userRecord = null;

    // Próba utworzenia nowego użytkownika jeśli nie istnieje
    if (userRole === 'student' && !student) {
      userRecord = await prisma.student.create({
        data: {
          id: userId,
          username: userId,
          name: 'New',
          surname: 'Student',
          address: 'Default Address',
          bloodType: 'O+',
          sex: 'MALE',
          birthday: new Date(),
          gradeId: 1,
          classId: 1,
          parentId: 'default-parent-id'
        }
      });
      userType = 'student';
    } else if (userRole === 'teacher' && !teacher) {
      userRecord = await prisma.teacher.create({
        data: {
          id: userId,
          username: userId,
          name: 'New',
          surname: 'Teacher',
          address: 'Default Address',
          bloodType: 'O+',
          sex: 'MALE',
          birthday: new Date()
        }
      });
      userType = 'teacher';
    } else if (userRole === 'admin' && !admin) {
      // Dodano tworzenie konta administratora
      userRecord = await prisma.admin.create({
        data: {
          id: userId,
          username: userId
        }
      });
      userType = 'admin';
    } else if (userRole === 'parent' && !parent) {
      userRecord = await prisma.parent.create({
        data: {
          id: userId,
          username: userId,
          name: 'New',
          surname: 'Parent',
          phone: 'default-phone',
          address: 'Default Address'
        }
      });
      userType = 'parent';
    } else {
      // Użyj istniejącego rekordu
      userType = userRole;
      userRecord = student || teacher || admin || parent;
    }

    console.log('User type:', userType);
    console.log('User record:', userRecord);

    if (!userType || !userRecord) {
      return NextResponse.json(
        { error: 'Failed to create or find user record' },
        { status: 400 }
      );
    }

    // Przygotuj podstawowe dane wydarzenia
    const eventBaseData = {
      title: data.title,
      description: data.description,
      location: data.location,
      startTime: new Date(data.startTime),
      endTime: new Date(data.endTime),
      price: data.price ? parseFloat(data.price) : null,
      maxParticipants: data.maxParticipants ? parseInt(data.maxParticipants) : null,
      isPublic: data.isPublic,
      classId: data.classId || null,
    };

    // Dodaj ID autora w zależności od typu użytkownika
    const eventData = {
      ...eventBaseData,
      [`author${userType.charAt(0).toUpperCase() + userType.slice(1)}Id`]: userId,
    };

    console.log('Final event data:', eventData);

    const event = await prisma.event.create({
      data: eventData,
      include: {
        authorStudent: true,
        authorTeacher: true,
        authorAdmin: true,
        authorParent: true,
        participants: true,
        comments: true,
        class: true,
      }
    });

    return NextResponse.json(event);
  } catch (error) {
    console.error('Error details:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error occurred' },
      { status: 500 }
    );
  }
}
