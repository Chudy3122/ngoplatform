import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { AccessType } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.userId;
    const { fileId, targetUserIds, accessType } = await req.json();

    // Sprawdź, czy wszystkie wymagane pola są obecne
    if (!fileId || !targetUserIds || !targetUserIds.length || !accessType) {
      console.error('Missing required fields:', { fileId, targetUserIds, accessType });
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Sprawdź, czy plik istnieje i czy użytkownik jest jego właścicielem
    const file = await prisma.libraryFile.findFirst({
      where: {
        id: fileId,
        OR: [
          { adminOwnerId: userId },
          { teacherOwnerId: userId },
          { studentOwnerId: userId },
          { parentOwnerId: userId }
        ]
      }
    });

    if (!file) {
      return NextResponse.json({ error: "File not found or access denied" }, { status: 404 });
    }

    // Sprawdź typ udostępniającego użytkownika
    const [shareByAdmin, shareByTeacher, shareByStudent, shareByParent] = await Promise.all([
      prisma.admin.findUnique({ where: { id: userId } }),
      prisma.teacher.findUnique({ where: { id: userId } }),
      prisma.student.findUnique({ where: { id: userId } }),
      prisma.parent.findUnique({ where: { id: userId } })
    ]);

    // Przygotuj dane dla udostępniającego
    let shareData = {};
    if (shareByAdmin) shareData = { sharedByAdminId: userId };
    else if (shareByTeacher) shareData = { sharedByTeacherId: userId };
    else if (shareByStudent) shareData = { sharedByStudentId: userId };
    else if (shareByParent) shareData = { sharedByParentId: userId };
    else {
      return NextResponse.json({ error: "Invalid sharing user type" }, { status: 400 });
    }

    // Udostępnij plik każdemu użytkownikowi
    const shares = await Promise.all(
      targetUserIds.map(async (targetUserId: string) => {
        // Sprawdź typ docelowego użytkownika
        const [targetAdmin, targetTeacher, targetStudent, targetParent] = await Promise.all([
          prisma.admin.findUnique({ where: { id: targetUserId } }),
          prisma.teacher.findUnique({ where: { id: targetUserId } }),
          prisma.student.findUnique({ where: { id: targetUserId } }),
          prisma.parent.findUnique({ where: { id: targetUserId } })
        ]);

        let targetData = {};
        if (targetAdmin) targetData = { sharedToAdminId: targetUserId };
        else if (targetTeacher) targetData = { sharedToTeacherId: targetUserId };
        else if (targetStudent) targetData = { sharedToStudentId: targetUserId };
        else if (targetParent) targetData = { sharedToParentId: targetUserId };
        else return null;

        return prisma.fileShare.create({
          data: {
            fileId,
            accessType: accessType as AccessType,
            ...shareData,
            ...targetData
          }
        });
      })
    );

    // Filtruj nieudane udostępnienia i zwróć wynik
    const successfulShares = shares.filter(Boolean);
    return NextResponse.json(successfulShares);

  } catch (error) {
    console.error("Share error:", error);
    return NextResponse.json(
      { error: "Failed to share file" },
      { status: 500 }
    );
  }
}