// src/app/api/users/search/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuth } from '@clerk/nextjs/server';

export async function GET(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Pobierz użytkowników z Prismy
    const users = await prisma.user.findMany({
      where: {
        NOT: {
          id: userId
        }
      },
      select: {
        id: true,
        email: true,
        username: true,
      }
    });

    // Formatuj dane
    const formattedUsers = users.map(user => ({
      id: user.id,
      email: user.email,
      name: user.username
    }));

    return NextResponse.json(formattedUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { message: 'Internal server error' }, 
      { status: 500 }
    );
  }
}