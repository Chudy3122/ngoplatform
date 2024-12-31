import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request, { params }) {
  try {
    const { userId } = params;
    console.log("\n=== API Request ===");
    console.log("Fetching user data for userId:", userId);

    // Sprawdź czy ID jest ID konwersacji
    if (userId.startsWith('cm2')) {
      // Znajdź konwersację
      const conversation = await prisma.conversation.findUnique({
        where: { id: userId }
      });

      if (conversation) {
        // Weź ID użytkownika z members (nie będące ID clerk)
        const actualUserId = conversation.members.find(m => !m.startsWith('user_'));
        console.log("Found actual userId:", actualUserId);
        
        if (!actualUserId) {
          return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Teraz szukaj właściwego użytkownika
        if (actualUserId === 'admin') {
          const admin = await prisma.admin.findUnique({ where: { id: 'admin' } });
          return NextResponse.json(admin);
        }

        if (actualUserId === 'parent') {
          const parent = await prisma.parent.findUnique({ where: { id: 'parent' } });
          return NextResponse.json(parent);
        }

        if (actualUserId === 'teacher' || actualUserId === 'teacher 1') {
          const teacher = await prisma.teacher.findUnique({ where: { id: actualUserId } });
          return NextResponse.json(teacher);
        }
      }
    }

    // Bezpośrednie wyszukiwanie dla prostych ID
    if (userId === 'admin') {
      const admin = await prisma.admin.findUnique({ where: { id: 'admin' } });
      return NextResponse.json(admin);
    }

    if (userId === 'parent') {
      const parent = await prisma.parent.findUnique({ where: { id: 'parent' } });
      return NextResponse.json(parent);
    }

    if (userId === 'teacher' || userId === 'teacher 1') {
      const teacher = await prisma.teacher.findUnique({ where: { id: userId } });
      return NextResponse.json(teacher);
    }

    // Jeśli nie znaleziono użytkownika
    console.log("No user found for ID:", userId);
    return NextResponse.json({ error: "User not found" }, { status: 404 });

  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch user data", details: error.message },
      { status: 500 }
    );
  }
}