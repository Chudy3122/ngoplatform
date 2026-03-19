// app/api/users/search/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionFromRequest } from "@/lib/session";

export const dynamic = 'force-dynamic';
export async function GET(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { roleId } = session;

    const url = new URL(req.url);
    const searchQuery = url.searchParams.get('query') || '';

    // Wyszukiwanie we wszystkich typach użytkowników jednocześnie
    const [admins, teachers, parents, students] = await Promise.all([
      // Wyszukiwanie adminów
      prisma.admin.findMany({
        where: {
          OR: [
            { username: { contains: searchQuery, mode: 'insensitive' } },
            { name: { contains: searchQuery, mode: 'insensitive' } },
          ],
          NOT: { id: roleId }
        },
        select: {
          id: true,
          username: true,
          name: true,
          email: true,
        }
      }),

      // Wyszukiwanie nauczycieli
      prisma.teacher.findMany({
        where: {
          OR: [
            { username: { contains: searchQuery, mode: 'insensitive' } },
            { name: { contains: searchQuery, mode: 'insensitive' } },
            { surname: { contains: searchQuery, mode: 'insensitive' } },
          ],
          NOT: { id: roleId }
        },
        select: {
          id: true,
          username: true,
          name: true,
          surname: true,
          email: true,
        }
      }),

      // Wyszukiwanie rodziców
      prisma.parent.findMany({
        where: {
          OR: [
            { username: { contains: searchQuery, mode: 'insensitive' } },
            { name: { contains: searchQuery, mode: 'insensitive' } },
            { surname: { contains: searchQuery, mode: 'insensitive' } },
          ],
          NOT: { id: roleId }
        },
        select: {
          id: true,
          username: true,
          name: true,
          surname: true,
          email: true,
        }
      }),

      // Wyszukiwanie uczniów
      prisma.student.findMany({
        where: {
          OR: [
            { username: { contains: searchQuery, mode: 'insensitive' } },
            { name: { contains: searchQuery, mode: 'insensitive' } },
            { surname: { contains: searchQuery, mode: 'insensitive' } },
          ],
          NOT: { id: roleId }
        },
        select: {
          id: true,
          username: true,
          name: true,
          surname: true,
          email: true,
        }
      })
    ]);

    // Łączenie wyników z odpowiednimi rolami
    const formattedResults = [
      ...admins.map(user => ({
        ...user,
        role: 'ADMIN',
        displayName: user.name || user.username
      })),
      ...teachers.map(user => ({
        ...user,
        role: 'MANAGER',
        displayName: `${user.name} ${user.surname}`
      })),
      ...parents.map(user => ({
        ...user,
        role: 'USER',
        displayName: `${user.name} ${user.surname}`
      })),
      ...students.map(user => ({
        ...user,
        role: 'USER',
        displayName: `${user.name} ${user.surname}`
      }))
    ];

    return NextResponse.json(formattedResults);
  } catch (error) {
    console.error('Error searching users:', error);
    return NextResponse.json(
      { error: "Failed to search users" },
      { status: 500 }
    );
  }
}
