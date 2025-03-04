import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import Pusher from 'pusher';
import { getAuth } from '@clerk/nextjs/server';

export const dynamic = 'force-dynamic';
export const runtime = "nodejs";

// Enum dla typu płci zgodny z modelem Prisma
enum UserSex {
  MALE = "MALE",
  FEMALE = "FEMALE",
  OTHER = "OTHER"
}

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

// Obsługa żądań OPTIONS (dla CORS)
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

// GET - Pobieranie statusu użytkownika
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const userType = searchParams.get('userType');

    console.log("GET /api/users/status", { userId, userType });

    if (!userId || !userType) {
      return NextResponse.json(
        { error: "Missing userId or userType" },
        { status: 400 }
      );
    }

    let userData = null;

    try {
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
    } catch (err: any) {
      console.error("Database error:", err);
      return NextResponse.json(
        { error: "Database error: " + (err?.message || String(err)) },
        { status: 500 }
      );
    }

    if (!userData) {
      console.log(`User not found: ${userId} (${userType})`);
      
      // Dodaj domyślne dane jeśli użytkownik nie istnieje
      return NextResponse.json({
        id: userId,
        username: "User",
        name: "Unknown User",
        isOnline: false,
        lastActive: new Date()
      });
    }

    return NextResponse.json(userData);
  } catch (error: any) {
    console.error("Error fetching user status:", error);
    return NextResponse.json(
      { error: "Failed to fetch user status: " + (error?.message || String(error)) },
      { status: 500 }
    );
  }
}

// POST - Aktualizacja statusu użytkownika
export async function POST(request: NextRequest) {
  try {
    // Sprawdź autentykację
    const { userId: authUserId } = getAuth(request);
    
    if (!authUserId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { userId, userType, isOnline } = body;

    console.log("POST /api/users/status", { userId, userType, isOnline });

    // Użytkownik może aktualizować tylko swój własny status
    if (userId !== authUserId) {
      return NextResponse.json(
        { error: "Cannot update status for another user" },
        { status: 403 }
      );
    }

    if (typeof userId !== 'string' || typeof userType !== 'string' || typeof isOnline !== 'boolean') {
      return NextResponse.json(
        { error: "Invalid request data types" },
        { status: 400 }
      );
    }

    const now = new Date();
    let updatedUser = null;

    try {
      // Aktualizuj tylko status i czas aktywności
      // Bez tworzenia nowych użytkowników, żeby uniknąć problemów z schematem
      switch (userType.toUpperCase()) {
        case 'ADMIN': {
          const admin = await prisma.admin.findUnique({
            where: { id: userId }
          });
          
          if (admin) {
            updatedUser = await prisma.admin.update({
              where: { id: userId },
              data: { isOnline, lastActive: now }
            });
          } else {
            // Użytkownik nie istnieje, ale możemy zwrócić dane statusu
            updatedUser = {
              id: userId,
              isOnline,
              lastActive: now,
              username: "Admin",
              name: "Administrator"
            };
          }
          break;
        }
        case 'TEACHER': {
          const teacher = await prisma.teacher.findUnique({
            where: { id: userId }
          });
          
          if (teacher) {
            updatedUser = await prisma.teacher.update({
              where: { id: userId },
              data: { isOnline, lastActive: now }
            });
          } else {
            // Użytkownik nie istnieje, ale możemy zwrócić dane statusu
            updatedUser = {
              id: userId,
              isOnline,
              lastActive: now,
              username: "Teacher",
              name: "Teacher"
            };
          }
          break;
        }
        case 'STUDENT': {
          const student = await prisma.student.findUnique({
            where: { id: userId }
          });
          
          if (student) {
            updatedUser = await prisma.student.update({
              where: { id: userId },
              data: { isOnline, lastActive: now }
            });
          } else {
            // Użytkownik nie istnieje, ale możemy zwrócić dane statusu
            updatedUser = {
              id: userId,
              isOnline,
              lastActive: now,
              username: "Student",
              name: "Student"
            };
          }
          break;
        }
        case 'PARENT': {
          const parent = await prisma.parent.findUnique({
            where: { id: userId }
          });
          
          if (parent) {
            updatedUser = await prisma.parent.update({
              where: { id: userId },
              data: { isOnline, lastActive: now }
            });
          } else {
            // Użytkownik nie istnieje, ale możemy zwrócić dane statusu
            updatedUser = {
              id: userId,
              isOnline,
              lastActive: now,
              username: "Parent",
              name: "Parent"
            };
          }
          break;
        }
        default:
          return NextResponse.json(
            { error: "Invalid user type" },
            { status: 400 }
          );
      }
    } catch (error: any) {
      console.error('Database error updating user status:', error);
      return NextResponse.json(
        { error: "Database error: " + (error?.message || String(error)) },
        { status: 500 }
      );
    }

    // Powiadom innych o zmianie statusu przez Pusher
    if (pusher) {
      try {
        await pusher.trigger('presence-users', 'user-status-change', {
          userId,
          isOnline
        });
        console.log(`Status notification sent via Pusher: ${userId} is ${isOnline ? 'online' : 'offline'}`);
      } catch (error: any) {
        console.error('Error sending Pusher notification:', error);
      }
    }

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error: any) {
    console.error('Error updating user status:', error);
    return NextResponse.json(
      { error: "Failed to update user status: " + (error?.message || String(error)) },
      { status: 500 }
    );
  }
}