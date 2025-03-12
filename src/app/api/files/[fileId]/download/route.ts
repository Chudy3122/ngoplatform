// api/files/[fileId]/download/route.ts
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

    console.log(`API: Attempting to download file ${fileId} by user ${userId}`);

    // Pobierz plik wraz z danymi - jawnie wybierz fileData
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
      },
      select: {
        id: true,
        name: true,
        type: true,
        size: true,
        fileData: true
      }
    });

    if (!file) {
      console.log(`API: File ${fileId} not found or user ${userId} has no access`);
      return NextResponse.json({ error: "File not found or no access" }, { status: 404 });
    }

    console.log(`API: File ${fileId} found, has fileData: ${!!file.fileData}`);

    // Sprawdź, czy plik ma dane
    if (!file.fileData) {
      console.log(`API: File ${fileId} has no data`);
      return NextResponse.json({ error: "File data not found" }, { status: 404 });
    }
    
    console.log(`API: File data type: ${typeof file.fileData}, size: ${file.size} bytes`);
    
    // Przygotuj dane pliku jako Buffer
    const fileBuffer = Buffer.from(file.fileData);
    
    console.log(`API: Created buffer with size: ${fileBuffer.length} bytes`);
    
    // Ustawienie nagłówków odpowiedzi
    const headers = new Headers();
    headers.set('Content-Type', file.type || 'application/octet-stream');
    headers.set('Content-Disposition', `attachment; filename="${encodeURIComponent(file.name)}"`);
    headers.set('Content-Length', fileBuffer.length.toString());
    
    // Dodaj nagłówki CORS
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('Access-Control-Allow-Methods', 'GET');
    
    console.log(`API: Headers set, returning file with content type: ${file.type}`);
    return new NextResponse(fileBuffer, { headers });
  } catch (error) {
    console.error(`API: Error downloading file: ${error}`);
    return NextResponse.json(
      { error: "Failed to download file", details: String(error) },
      { status: 500 }
    );
  }
}