import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: { fileId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const fileId = params.fileId;
    if (!fileId) {
      return NextResponse.json({ error: "Missing file ID" }, { status: 400 });
    }

    console.log('Attempting to download file:', fileId, 'by user:', userId);

    // Sprawdź czy użytkownik ma dostęp do pliku
    const file = await prisma.libraryFile.findFirst({
      where: {
        id: fileId,
        OR: [
          // Użytkownik jest właścicielem pliku
          { adminOwnerId: userId },
          { teacherOwnerId: userId },
          { studentOwnerId: userId },
          { parentOwnerId: userId },
          // Użytkownik ma udostępniony plik
          {
            shares: {
              some: {
                OR: [
                  { sharedToAdminId: userId },
                  { sharedToTeacherId: userId },
                  { sharedToStudentId: userId },
                  { sharedToParentId: userId }
                ]
              }
            }
          }
        ]
      }
    });

    if (!file) {
      console.log('File not found or user not authorized for download:', fileId, userId);
      return NextResponse.json({ error: "File not found or no access" }, { status: 404 });
    }

    // Sprawdź, czy plik ma dane
    if (!file.fileData) {
      console.log('File data is missing:', fileId);
      return NextResponse.json({ error: "File data not found" }, { status: 404 });
    }
    
    // Konwertuj dane pliku do odpowiedniego formatu
    let fileBuffer: Buffer;
    if (Buffer.isBuffer(file.fileData)) {
      fileBuffer = file.fileData;
    } else if (typeof file.fileData === 'string') {
      fileBuffer = Buffer.from(file.fileData, 'base64');
    } else {
      console.error('Unsupported file data format:', typeof file.fileData);
      return NextResponse.json({ error: "Unsupported file data format" }, { status: 500 });
    }
    
    // Ustawienie nagłówków odpowiedzi
    const headers = new Headers();
    headers.set('Content-Type', file.type || 'application/octet-stream');
    headers.set('Content-Disposition', `attachment; filename="${encodeURIComponent(file.name)}"`);
    headers.set('Content-Length', fileBuffer.length.toString());

    console.log('Successfully prepared file for download:', fileId);
    return new NextResponse(fileBuffer, { headers });
  } catch (error) {
    console.error("Error downloading file:", error);
    return NextResponse.json(
      { error: "Failed to download file", details: String(error) },
      { status: 500 }
    );
  }
}