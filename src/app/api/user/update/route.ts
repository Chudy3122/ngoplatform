// src/app/api/user/update/route.ts
import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function POST() {
  try {
    const session = await auth();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.userId;
    
    // Pobieranie danych użytkownika z Clerk
    const clerk = await clerkClient();
    const user = await clerk.users.getUser(userId);
    
    // Przygotowanie danych
    const userFirstName = user.firstName || "Default";
    const userLastName = user.lastName || "User";
    let userUsername = user.username;
    let userEmail = null;
    let userImageUrl = user.imageUrl || null; // Pobranie URL zdjęcia profilowego
    
    // Ustaw username na podstawie danych Clerk
    if (!userUsername) {
      if (user.firstName && user.lastName) {
        userUsername = `${user.firstName.toLowerCase()}.${user.lastName.toLowerCase()}`;
      } else if (user.emailAddresses && user.emailAddresses.length > 0) {
        const primaryEmail = user.emailAddresses.find(email => email.id === user.primaryEmailAddressId);
        const email = primaryEmail ? primaryEmail.emailAddress : user.emailAddresses[0].emailAddress;
        userUsername = email.split('@')[0];
        userEmail = email;
      } else {
        userUsername = `user_${userId.slice(0, 8)}`;
      }
    }
    
    // Pobierz email, jeśli nie został ustawiony wcześniej
    if (!userEmail && user.emailAddresses && user.emailAddresses.length > 0) {
      const primaryEmail = user.emailAddresses.find(email => email.id === user.primaryEmailAddressId);
      userEmail = primaryEmail ? primaryEmail.emailAddress : user.emailAddresses[0].emailAddress;
    }
    
    // Sprawdź, który typ użytkownika aktualizujemy
    const [admin, teacher, student, parent] = await Promise.all([
      prisma.admin.findUnique({ where: { id: userId } }),
      prisma.teacher.findUnique({ where: { id: userId } }),
      prisma.student.findUnique({ where: { id: userId } }),
      prisma.parent.findUnique({ where: { id: userId } })
    ]);
    
    let result;
    if (admin) {
      result = await prisma.admin.update({
        where: { id: userId },
        data: { 
          username: userUsername,
          name: `${userFirstName} ${userLastName}`,
          email: userEmail,
          img: userImageUrl // Dodajemy zdjęcie dla admina
        }
      });
      return NextResponse.json({ success: true, role: "admin", user: result });
    } else if (teacher) {
      result = await prisma.teacher.update({
        where: { id: userId },
        data: { 
          username: userUsername,
          name: userFirstName,
          surname: userLastName,
          email: userEmail,
          img: userImageUrl // Zdjęcie dla nauczyciela
        }
      });
      return NextResponse.json({ success: true, role: "teacher", user: result });
    } else if (student) {
      result = await prisma.student.update({
        where: { id: userId },
        data: { 
          username: userUsername,
          name: userFirstName,
          surname: userLastName,
          email: userEmail,
          img: userImageUrl // Zdjęcie dla studenta
        }
      });
      return NextResponse.json({ success: true, role: "student", user: result });
    } else if (parent) {
      // Uwaga: model Parent w schemacie nie ma pola img
      result = await prisma.parent.update({
        where: { id: userId },
        data: { 
          username: userUsername,
          name: userFirstName,
          surname: userLastName,
          email: userEmail 
        }
      });
      return NextResponse.json({ success: true, role: "parent", user: result });
    } else {
      return NextResponse.json({ error: "User not found in database" }, { status: 404 });
    }
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}