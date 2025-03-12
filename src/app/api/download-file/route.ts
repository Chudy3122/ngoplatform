// app/api/download-file/route.ts
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    // Pobierz fileId z query string
    const url = new URL(req.url);
    const fileId = url.searchParams.get('fileId');
    
    console.log(`API: Download-file endpoint called with fileId: ${fileId}`);
    
    if (!fileId) {
      console.log('API: Missing fileId parameter');
      return NextResponse.json({ error: "Missing fileId parameter" }, { status: 400 });
    }
    
    const { userId } = await auth();
    if (!userId) {
      console.log('API: Unauthorized - no user ID');
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Pobierz plik z bazy danych
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
    
    if (!file.fileData) {
      console.log(`API: File ${fileId} has no data`);
      return NextResponse.json({ error: "File data is missing" }, { status: 404 });
    }
    
    // Przygotuj dane pliku jako Buffer
    const fileBuffer = Buffer.from(file.fileData);
    
    // Ustawienie nagłówków odpowiedzi
    const headers = new Headers();
    headers.set('Content-Type', file.type || 'application/octet-stream');
    headers.set('Content-Disposition', `attachment; filename="${encodeURIComponent(file.name)}"`);
    headers.set('Content-Length', fileBuffer.length.toString());
    
    console.log(`API: Returning file ${file.name} with type ${file.type} and size ${fileBuffer.length}`);
    return new NextResponse(fileBuffer, { headers });
  } catch (error) {
    console.error(`API: Error in download-file endpoint:`, error);
    return NextResponse.json(
      { error: "Failed to download file", details: String(error) },
      { status: 500 }
    );
  }
}