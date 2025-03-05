// src/app/api/admin/update-all-users/route.ts
import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function POST() {
  try {
    const session = await auth();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Pobierz wszystkich użytkowników z bazy danych
    const [admins, teachers, students, parents] = await Promise.all([
      prisma.admin.findMany(),
      prisma.teacher.findMany(),
      prisma.student.findMany(),
      prisma.parent.findMany()
    ]);

    const updates = {
      admins: 0,
      teachers: 0,
      students: 0,
      parents: 0,
      errors: 0
    };

    // Aktualizacja adminów
    for (const admin of admins) {
      try {
        // Pobierz informacje o użytkowniku z Clerk
        const clerk = await clerkClient();
        const user = await clerk.users.getUser(admin.id);
        
        if (!user) {
          console.warn(`Nie znaleziono użytkownika Clerk dla admina: ${admin.id}`);
          continue;
        }
        
        // Generowanie nazwy użytkownika
        let username = admin.username; // Zachowaj istniejącą nazwę użytkownika
        if (user.username || (user.firstName && user.lastName)) {
          // Poprawka: bezpieczne sprawdzenie null wartości
          const firstName = user.firstName || '';
          const lastName = user.lastName || '';
          const newUsername = user.username || `${firstName.toLowerCase()}.${lastName.toLowerCase()}`;
          
          // Sprawdź, czy nowa nazwa użytkownika jest już używana
          const existingUser = await prisma.admin.findUnique({ 
            where: { username: newUsername },
            select: { id: true }
          });
          
          if (!existingUser || existingUser.id === admin.id) {
            username = newUsername;
          } else {
            // Dodaj timestamp, jeśli nazwa jest zajęta
            username = `${newUsername}_${Date.now().toString().slice(-6)}`;
          }
        }
        
        // Aktualizacja danych admina
        await prisma.admin.update({
          where: { id: admin.id },
          data: {
            username: username,
            name: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : admin.name || "Default User",
            email: user.emailAddresses && user.emailAddresses.length > 0 
              ? user.emailAddresses[0].emailAddress 
              : admin.email,
            img: user.imageUrl || null
          }
        });
        
        updates.admins++;
      } catch (error) {
        console.error(`Błąd aktualizacji admina ${admin.id}:`, error);
        updates.errors++;
      }
    }

    // Aktualizacja studentów
    for (const student of students) {
      try {
        const clerk = await clerkClient();
        const user = await clerk.users.getUser(student.id);
        
        if (!user) {
          console.warn(`Nie znaleziono użytkownika Clerk dla studenta: ${student.id}`);
          continue;
        }
        
        let username = student.username;
        if (user.username || (user.firstName && user.lastName)) {
          const firstName = user.firstName || '';
          const lastName = user.lastName || '';
          const newUsername = user.username || `${firstName.toLowerCase()}.${lastName.toLowerCase()}`;
          
          const existingUser = await prisma.student.findUnique({ 
            where: { username: newUsername },
            select: { id: true }
          });
          
          if (!existingUser || existingUser.id === student.id) {
            username = newUsername;
          } else {
            username = `${newUsername}_${Date.now().toString().slice(-6)}`;
          }
        }
        
        await prisma.student.update({
          where: { id: student.id },
          data: {
            username: username,
            name: user.firstName || "Default",
            surname: user.lastName || "User",
            email: user.emailAddresses && user.emailAddresses.length > 0 
              ? user.emailAddresses[0].emailAddress 
              : student.email,
            img: user.imageUrl || null
          }
        });
        
        updates.students++;
      } catch (error) {
        console.error(`Błąd aktualizacji studenta ${student.id}:`, error);
        updates.errors++;
      }
    }

    // Aktualizacja nauczycieli
    for (const teacher of teachers) {
      try {
        const clerk = await clerkClient();
        const user = await clerk.users.getUser(teacher.id);
        
        if (!user) continue;
        
        let username = teacher.username;
        if (user.username || (user.firstName && user.lastName)) {
          const firstName = user.firstName || '';
          const lastName = user.lastName || '';
          const newUsername = user.username || `${firstName.toLowerCase()}.${lastName.toLowerCase()}`;
          
          const existingUser = await prisma.teacher.findUnique({ 
            where: { username: newUsername },
            select: { id: true }
          });
          
          if (!existingUser || existingUser.id === teacher.id) {
            username = newUsername;
          } else {
            username = `${newUsername}_${Date.now().toString().slice(-6)}`;
          }
        }
        
        await prisma.teacher.update({
          where: { id: teacher.id },
          data: {
            username: username,
            name: user.firstName || teacher.name,
            surname: user.lastName || teacher.surname,
            email: user.emailAddresses && user.emailAddresses.length > 0 
              ? user.emailAddresses[0].emailAddress 
              : teacher.email,
            img: user.imageUrl || null
          }
        });
        
        updates.teachers++;
      } catch (error) {
        console.error(`Błąd aktualizacji nauczyciela ${teacher.id}:`, error);
        updates.errors++;
      }
    }
    
    // Aktualizacja rodziców
    for (const parent of parents) {
      try {
        const clerk = await clerkClient();
        const user = await clerk.users.getUser(parent.id.replace('parent_', ''));
        
        if (!user) continue;
        
        let username = parent.username;
        if (user.username || (user.firstName && user.lastName)) {
          const firstName = user.firstName || '';
          const lastName = user.lastName || '';
          const newUsername = user.username || `${firstName.toLowerCase()}.${lastName.toLowerCase()}`;
          
          // Sprawdź, czy nowa nazwa użytkownika jest już używana
          const existingUser = await prisma.parent.findUnique({ 
            where: { username: newUsername },
            select: { id: true }
          });
          
          if (!existingUser || existingUser.id === parent.id) {
            username = newUsername;
          } else {
            username = `${newUsername}_${Date.now().toString().slice(-6)}`;
          }
        }
        
        await prisma.parent.update({
          where: { id: parent.id },
          data: {
            username: username,
            name: user.firstName || parent.name,
            surname: user.lastName || parent.surname,
            email: user.emailAddresses && user.emailAddresses.length > 0 
              ? user.emailAddresses[0].emailAddress 
              : parent.email,
          }
        });
        
        updates.parents++;
      } catch (error) {
        console.error(`Błąd aktualizacji rodzica ${parent.id}:`, error);
        updates.errors++;
      }
    }

    return NextResponse.json({ 
      success: true, 
      updated: updates 
    });
  } catch (error) {
    console.error("Błąd podczas aktualizacji wszystkich użytkowników:", error);
    return NextResponse.json({ error: "Failed to update all users" }, { status: 500 });
  }
}