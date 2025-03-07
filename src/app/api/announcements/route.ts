// app/api/announcements/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limitParam = searchParams.get('limit');
    const classIdParam = searchParams.get('classId');
    
    const limit = limitParam ? parseInt(limitParam, 10) : undefined;
    const classId = classIdParam ? parseInt(classIdParam, 10) : undefined;

    const authData = await auth();
    const role = (authData.sessionClaims?.metadata as { role?: string })?.role;
    const currentUserId = authData.userId;

    // Przygotuj warunki filtrowania
    let whereClause: any = {};
    
    if (classId) {
      whereClause.classId = classId;
    }
    
    if (role !== "admin") {
      // Dodaj warunki w zależności od roli użytkownika
    }

    // Pobierz dane
    const announcements = await prisma.announcement.findMany({
      where: whereClause,
      take: limit,
      orderBy: { date: 'desc' }
    });

    return NextResponse.json(announcements);
  } catch (error) {
    console.error('Error fetching announcements:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authData = await auth();
    if (!authData.userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const role = (authData.sessionClaims?.metadata as { role?: string })?.role;
    if (role !== 'admin' && role !== 'teacher') {
      return new NextResponse('Forbidden', { status: 403 });
    }

    const data = await req.json();
    
    // Przygotuj dane ogłoszenia z polem autora
    const announcementData = {
      title: data.title,
      description: data.description,
      date: new Date(),
      classId: data.classId || null,
      authorId: authData.userId // Dodajemy authorId
    };

    const announcement = await prisma.announcement.create({
      data: announcementData,
    });

    return NextResponse.json(announcement);
  } catch (error) {
    console.error('Error creating announcement:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}