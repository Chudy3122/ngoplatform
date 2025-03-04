import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import Pusher from 'pusher';

export const dynamic = 'force-dynamic';
export const runtime = "nodejs";

// Inicjalizacja Pusher tylko jeśli zmienne środowiskowe są dostępne
const pusher = process.env.PUSHER_APP_ID && process.env.PUSHER_KEY && process.env.PUSHER_SECRET && process.env.PUSHER_CLUSTER
  ? new Pusher({
      appId: process.env.PUSHER_APP_ID,
      key: process.env.PUSHER_KEY,
      secret: process.env.PUSHER_SECRET,
      cluster: process.env.PUSHER_CLUSTER,
      useTLS: true,
    })
  : null;

// GET - Pobieranie statusu użytkownika
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const userType = searchParams.get('userType');

    if (!userId || !userType) {
      return NextResponse.json(
        { error: "Missing userId or userType" },
        { status: 400 }
      );
    }

    let userData = null;

    switch (userType.toUpperCase()) {
      case 'ADMIN':
        userData = await prisma.admin.findUnique({
          where: { id: userId },
          select: { 
            id: true,
            username: true,
            name: true,
            isOnline: true,
            lastActive: true 
          }
        });
        break;
      case 'TEACHER':
        userData = await prisma.teacher.findUnique({
          where: { id: userId },
          select: { 
            id: true,
            username: true,
            name: true,
            isOnline: true,
            lastActive: true 
          }
        });
        break;
      case 'STUDENT':
        userData = await prisma.student.findUnique({
          where: { id: userId },
          select: { 
            id: true,
            username: true,
            name: true,
            isOnline: true,
            lastActive: true 
          }
        });
        break;
      case 'PARENT':
        userData = await prisma.parent.findUnique({
          where: { id: userId },
          select: { 
            id: true,
            username: true,
            name: true,
            isOnline: true,
            lastActive: true 
          }
        });
        break;
    }

    if (!userData) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(userData);
  } catch (error) {
    console.error("Error fetching user status:", error);
    return NextResponse.json(
      { error: "Failed to fetch user status" },
      { status: 500 }
    );
  }
}

// POST - Aktualizacja statusu użytkownika
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, userType, isOnline } = body;

    if (!userId || !userType) {
      return NextResponse.json(
        { error: "Missing userId or userType" },
        { status: 400 }
      );
    }

    const now = new Date();
    let updatedUser = null;

    try {
      switch (userType.toUpperCase()) {
        case 'ADMIN':
          updatedUser = await prisma.admin.update({
            where: { id: userId },
            data: { isOnline, lastActive: now }
          });
          break;
        case 'TEACHER':
          updatedUser = await prisma.teacher.update({
            where: { id: userId },
            data: { isOnline, lastActive: now }
          });
          break;
        case 'STUDENT':
          updatedUser = await prisma.student.update({
            where: { id: userId },
            data: { isOnline, lastActive: now }
          });
          break;
        case 'PARENT':
          updatedUser = await prisma.parent.update({
            where: { id: userId },
            data: { isOnline, lastActive: now }
          });
          break;
      }

      // Powiadom innych o zmianie statusu przez Pusher
      if (pusher) {
        await pusher.trigger('presence-users', 'user-status-change', {
          userId,
          isOnline
        });
      }

      return NextResponse.json({ success: true, user: updatedUser });
    } catch (error) {
      console.error('Error updating user status:', error);
      return NextResponse.json(
        { error: "Failed to update user status" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error parsing request:', error);
    return NextResponse.json(
      { error: "Failed to parse request" },
      { status: 400 }
    );
  }
}