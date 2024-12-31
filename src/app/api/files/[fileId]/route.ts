import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function DELETE(
  req: Request,
  { params }: { params: { fileId: string } }
) {
  try {
    const session = await auth();
    const userId = session?.userId;
    
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized - no user ID" }, 
        { status: 401 }
      );
    }

    if (!params.fileId) {
      console.error('No fileId provided in params:', params);
      return NextResponse.json(
        { error: "File ID is required" }, 
        { status: 400 }
      );
    }

    console.log('Attempting to delete file:', params.fileId, 'by user:', userId);

    // Sprawdź, czy użytkownik jest właścicielem pliku
    const file = await prisma.libraryFile.findFirst({
      where: {
        id: params.fileId,
        OR: [
          { adminOwnerId: userId },
          { teacherOwnerId: userId },
          { studentOwnerId: userId },
          { parentOwnerId: userId }
        ]
      }
    });

    if (!file) {
      console.log('File not found or user not authorized:', params.fileId, userId);
      return NextResponse.json(
        { error: "File not found or access denied" }, 
        { status: 404 }
      );
    }

    // Dodajemy transakcję dla spójności
    await prisma.$transaction(async (prisma) => {
      // Najpierw usuń udostępnienia
      await prisma.fileShare.deleteMany({
        where: {
          fileId: params.fileId
        }
      });

      // Następnie usuń sam plik
      await prisma.libraryFile.delete({
        where: {
          id: params.fileId
        }
      });
    });

    console.log('Successfully deleted file:', params.fileId);
    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error in DELETE /api/files/[fileId]:', error);
    return NextResponse.json(
      { error: "Failed to delete file", details: error },
      { status: 500 }
    );
  }
}