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
    
    // Przypisanie roli "student" w Clerk, jeśli jeszcze nie ma przypisanej roli
    try {
      console.log("Pobieranie danych użytkownika z Clerk");
      const clerk = await clerkClient();
      const user = await clerk.users.getUser(userId);
      console.log(`Pobrano dane użytkownika: ${user.id}`);
      
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
      // Nie przerywamy wykonania, ale logujemy błąd
      if (clerkError instanceof Error) {
        console.error('Szczegóły błędu Clerk:', clerkError.message);
        console.error('Stack błędu Clerk:', clerkError.stack);
      }
    }
    
    // Sprawdź czy użytkownik już istnieje
    console.log("Sprawdzanie czy użytkownik już istnieje w bazie danych");
    const [existingAdmin, existingTeacher, existingStudent, existingParent] = await Promise.all([
      prisma.admin.findUnique({ where: { id: userId } }),
      prisma.teacher.findUnique({ where: { id: userId } }),
      prisma.student.findUnique({ where: { id: userId } }),
      prisma.parent.findUnique({ where: { id: userId } })
    ]);

    if (existingAdmin) console.log("Znaleziono istniejącego admina");
    if (existingTeacher) console.log("Znaleziono istniejącego nauczyciela");
    if (existingStudent) console.log("Znaleziono istniejącego studenta");
    if (existingParent) console.log("Znaleziono istniejącego rodzica");

    if (existingAdmin || existingTeacher || existingStudent || existingParent) {
      console.log("Użytkownik już istnieje w bazie danych - zwracanie odpowiedzi");
      return NextResponse.json({ message: "User already exists" }, { status: 200 });
    }

    // Stwórz podstawowe rekordy
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

    // 3. Stwórz tymczasowego rodzica
    console.log("Tworzenie tymczasowego rodzica");
    const parentId = `parent_${userId}`;
    let parentUsername = `parent_${userId.slice(0, 8)}`;
    let parentEmail = `parent_${userId.slice(0, 8)}@example.com`;
    
    // Sprawdź czy długość telefonu nie przekracza limitu
    let phoneNumber = userId.length > 15 ? userId.slice(0, 15) : userId;
    
    try {
      const newParent = await prisma.parent.create({
        data: {
          id: parentId,
          username: parentUsername,
          name: 'Default Parent',
          surname: 'Default Surname',
          email: parentEmail,
          phone: phoneNumber,
          address: 'Default Address'
        }
      });
      console.log(`Rodzic utworzony: ${newParent.id}`);
      
      // 4. Stwórz studenta
      console.log("Tworzenie rekordu studenta");
      try {
        const newStudent = await prisma.student.create({
          data: {
            id: userId,
            username: `user_${userId.slice(0, 8)}`,
            name: 'Default Name',
            surname: 'Default Surname',
            email: null,
            address: 'Default Address',
            sex: 'MALE',
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
        
        throw studentError; // Przekazanie błędu do głównego bloku catch
      }
    } catch (parentError) {
      console.error("Błąd podczas tworzenia rodzica:", parentError);
      throw parentError; // Przekazanie błędu do głównego bloku catch
    }
  } catch (error) {
    console.error('Błąd podczas inicjalizacji użytkownika:', error);
    
    // Szczegółowe logowanie błędu
    if (error instanceof Error) {
      console.error('Wiadomość błędu:', error.message);
      console.error('Stack błędu:', error.stack);
    } else {
      console.error('Nieznany typ błędu:', typeof error);
    }
    
    // Sprawdź czy błąd jest związany z bazą danych Prisma
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.error('Kod błędu Prisma:', error.code);
      
      // Obsługa typowych błędów Prisma
      if (error.code === 'P2002') {
        return NextResponse.json({ error: "Unique constraint violation" }, { status: 409 });
      } else if (error.code === 'P2003') {
        return NextResponse.json({ error: "Foreign key constraint failed" }, { status: 400 });
      }
    }
    
    return NextResponse.json({ error: "Failed to initialize user" }, { status: 500 });
  }
}