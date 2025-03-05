import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function POST() {
  try {
    console.log("Rozpoczęcie inicjalizacji użytkownika");
    const session = await auth();
    if (!session?.userId) {
      console.log("Brak autoryzacji - brak ID użytkownika w sesji");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.userId;
    console.log(`Inicjalizacja użytkownika o ID: ${userId}`);
    
    // Pobieranie danych użytkownika z Clerk
    let userFirstName = "Default Name";
    let userLastName = "Default Surname";
    let userUsername = `user_${userId.slice(0, 8)}`;
    let userEmail = null;
    let userImageUrl = null;
    
    try {
      console.log("Pobieranie danych użytkownika z Clerk");
      const clerk = await clerkClient();
      const user = await clerk.users.getUser(userId);
      console.log(`Pobrano dane użytkownika: ${user.id}`);
      
      // Pobierz URL zdjęcia profilowego z Clerk
      userImageUrl = user.imageUrl || null;
      
      // Pobierz imię i nazwisko z Clerk jeśli dostępne
      if (user.firstName) userFirstName = user.firstName;
      if (user.lastName) userLastName = user.lastName;
      
      // Ustaw username na podstawie danych Clerk
      // Priorytet: username > firstName+lastName > email > ID
      if (user.username) {
        userUsername = user.username;
      } else if (user.firstName && user.lastName) {
        userUsername = `${user.firstName.toLowerCase()}.${user.lastName.toLowerCase()}`;
      } else if (user.emailAddresses && user.emailAddresses.length > 0) {
        const primaryEmail = user.emailAddresses.find(email => email.id === user.primaryEmailAddressId);
        const email = primaryEmail ? primaryEmail.emailAddress : user.emailAddresses[0].emailAddress;
        userUsername = email.split('@')[0];
        userEmail = email;
      }
      
      // Pobierz email, jeśli nie został ustawiony wcześniej
      if (!userEmail && user.emailAddresses && user.emailAddresses.length > 0) {
        const primaryEmail = user.emailAddresses.find(email => email.id === user.primaryEmailAddressId);
        userEmail = primaryEmail ? primaryEmail.emailAddress : user.emailAddresses[0].emailAddress;
      }
      
      // Sprawdź czy użytkownik ma już przypisaną rolę
      const userRole = user.publicMetadata?.role;
      console.log(`Aktualna rola użytkownika: ${userRole || 'brak'}`);

      if (!userRole) {
        console.log(`Przypisywanie roli 'student' do użytkownika ${userId}`);
        
        // Przypisz rolę "student" jeśli jej nie ma
        await clerk.users.updateUser(userId, {
          publicMetadata: {
            ...user.publicMetadata, // Zachowaj istniejące metadane
            role: 'student'
          }
        });
        
        console.log('Rola przypisana pomyślnie');
      }
    } catch (clerkError) {
      console.error('Błąd podczas aktualizacji metadanych Clerk:', clerkError);
      if (clerkError instanceof Error) {
        console.error('Szczegóły błędu Clerk:', clerkError.message);
      }
    }
    
    // Sprawdź czy użytkownik już istnieje w jednej z ról
    console.log("Sprawdzanie czy użytkownik już istnieje w bazie danych");
    const [existingAdmin, existingTeacher, existingStudent, existingParent] = await Promise.all([
      prisma.admin.findUnique({ where: { id: userId } }),
      prisma.teacher.findUnique({ where: { id: userId } }),
      prisma.student.findUnique({ where: { id: userId } }),
      prisma.parent.findUnique({ where: { id: userId } })
    ]);

    if (existingAdmin || existingTeacher || existingStudent || existingParent) {
      // Użytkownik istnieje, ale możemy zaktualizować jego dane
      if (existingAdmin) {
        await prisma.admin.update({
          where: { id: userId },
          data: { 
            username: userUsername,
            name: `${userFirstName} ${userLastName}`,
            email: userEmail,
            img: userImageUrl
          }
        });
        console.log(`Admin zaktualizowany: ${userUsername}`);
      } else if (existingTeacher) {
        await prisma.teacher.update({
          where: { id: userId },
          data: { 
            username: userUsername,
            name: userFirstName,
            surname: userLastName,
            email: userEmail,
            img: userImageUrl
          }
        });
        console.log(`Nauczyciel zaktualizowany: ${userUsername}`);
      } else if (existingStudent) {
        await prisma.student.update({
          where: { id: userId },
          data: { 
            username: userUsername,
            name: userFirstName,
            surname: userLastName,
            email: userEmail,
            img: userImageUrl
          }
        });
        console.log(`Student zaktualizowany: ${userUsername}`);
      } else if (existingParent) {
        await prisma.parent.update({
          where: { id: userId },
          data: { 
            username: userUsername,
            name: userFirstName,
            surname: userLastName,
            email: userEmail
          }
        });
        console.log(`Rodzic zaktualizowany: ${userUsername}`);
      }
      
      return NextResponse.json({ 
        message: "User data updated", 
        role: existingAdmin ? "admin" : existingTeacher ? "teacher" : existingStudent ? "student" : "parent" 
      }, { status: 200 });
    }

    // Tworzenie nowego użytkownika...
    console.log('Tworzenie początkowych rekordów dla użytkownika:', userId);

    // 1. Stwórz lub znajdź domyślny Grade
    console.log("Tworzenie lub wyszukiwanie domyślnego poziomu (Grade)");
    const grade = await prisma.grade.upsert({
      where: { level: 1 },
      update: {},
      create: { level: 1 }
    });
    console.log(`Poziom (Grade) utworzony/znaleziony: ${grade.id}`);

    // 2. Stwórz lub znajdź domyślną Class
    console.log("Tworzenie lub wyszukiwanie domyślnej klasy");
    const class1 = await prisma.class.upsert({
      where: { name: '1A' },
      update: {},
      create: {
        name: '1A',
        capacity: 30,
        gradeId: grade.id
      }
    });
    console.log(`Klasa utworzona/znaleziona: ${class1.id}`);

    // 3. Stwórz tymczasowego rodzica z danymi z Clerk
    console.log("Tworzenie tymczasowego rodzica");
    const parentId = `parent_${userId}`;
    const timestamp = Date.now().toString().slice(-6);
    const parentUsername = `parent_${userUsername}`;
    const parentEmail = userEmail ? `parent_${userEmail}` : `parent_${userId.slice(0, 6)}_${timestamp}@example.com`;
    
    // Skróć numer telefonu, aby nie przekroczył dozwolonej długości
    const phoneNumber = userId.length > 15 ? userId.slice(0, 15) : userId;
    
    try {
      const newParent = await prisma.parent.create({
        data: {
          id: parentId,
          username: parentUsername,
          name: userFirstName,
          surname: userLastName,
          email: parentEmail,
          phone: phoneNumber,
          address: 'Default Address'
        }
      });
      console.log(`Rodzic utworzony: ${newParent.id}`);
      
      // 4. Stwórz studenta z danymi z Clerk
      console.log("Tworzenie rekordu studenta");
      try {
        const newStudent = await prisma.student.create({
          data: {
            id: userId,
            username: userUsername,
            name: userFirstName,
            surname: userLastName,
            email: userEmail,
            img: userImageUrl,
            address: 'Default Address',
            sex: 'MALE', // Możesz dodać to jako metadata w Clerk
            birthday: new Date(),
            parentId: newParent.id,
            classId: class1.id,
            gradeId: grade.id
          }
        });

        console.log(`Student utworzony pomyślnie: ${newStudent.id}`);
        return NextResponse.json({ success: true, student: newStudent });
      } catch (studentError) {
        console.error("Błąd podczas tworzenia studenta:", studentError);
        
        // Próba usunięcia rodzica, ponieważ student nie został utworzony
        try {
          await prisma.parent.delete({ where: { id: parentId } });
          console.log("Usunięto rodzica po niepowodzeniu tworzenia studenta");
        } catch (cleanupError) {
          console.error("Nie można usunąć rodzica:", cleanupError);
        }
        
        throw studentError;
      }
    } catch (parentError) {
      console.error("Błąd podczas tworzenia rodzica:", parentError);
      if (parentError instanceof Prisma.PrismaClientKnownRequestError && parentError.code === 'P2002') {
        // Spróbuj użyć alternatywnego ID dla rodzica
        const altParentId = `parent_${userId}_${timestamp}`;
        console.log(`Próba utworzenia rodzica z alternatywnym ID: ${altParentId}`);
        
        try {
          const newParent = await prisma.parent.create({
            data: {
              id: altParentId,
              username: parentUsername,
              name: userFirstName,
              surname: userLastName,
              email: parentEmail,
              phone: phoneNumber,
              address: 'Default Address'
            }
          });
          
          // Utwórz studenta z nowo utworzonym rodzicem
          const newStudent = await prisma.student.create({
            data: {
              id: userId,
              username: userUsername,
              name: userFirstName,
              surname: userLastName,
              email: userEmail,
              img: userImageUrl,
              address: 'Default Address',
              sex: 'MALE',
              birthday: new Date(),
              parentId: newParent.id,
              classId: class1.id,
              gradeId: grade.id
            }
          });
          
          console.log(`Student utworzony pomyślnie z alternatywnym rodzicem: ${newStudent.id}`);
          return NextResponse.json({ success: true, student: newStudent });
        } catch (altError) {
          console.error("Błąd podczas tworzenia z alternatywnym ID:", altError);
          throw altError;
        }
      } else {
        throw parentError;
      }
    }
  } catch (error) {
    console.error('Błąd podczas inicjalizacji użytkownika:', error);
    
    if (error instanceof Error) {
      console.error('Wiadomość błędu:', error.message);
    } else {
      console.error('Nieznany typ błędu:', typeof error);
    }
    
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.error('Kod błędu Prisma:', error.code);
      
      if (error.code === 'P2002') {
        const target = error.meta?.target as string[] || [];
        const field = target.join(', ') || 'unknown field';
        console.error(`Naruszenie ograniczenia unikalności w polu: ${field}`);
        
        // Spróbuj obejść problem unikalności dodając timestamp
        if (field.includes('username') || field.includes('email')) {
          return NextResponse.json({ 
            error: "Unique constraint violation", 
            field,
            message: "Spróbuj użyć innej nazwy użytkownika lub adresu email"
          }, { status: 409 });
        }
      }
    }
    
    return NextResponse.json({ error: "Failed to initialize user" }, { status: 500 });
  }
}