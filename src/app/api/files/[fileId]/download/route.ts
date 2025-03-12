// app/api/files/[fileId]/download/route.ts
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: { fileId: string } }
) {
  try {
    console.log(`API: Download endpoint called for file ID: ${params.fileId}`);
    
    const { userId } = await auth();
    if (!userId) {
      console.log('API: Unauthorized - no user ID');
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const fileId = params.fileId;
    if (!fileId) {
      console.log('API: Missing file ID in params');
      return NextResponse.json({ error: "Missing file ID" }, { status: 400 });
    }

    console.log(`API: Authenticated user ${userId} attempting to download file ${fileId}`);

    // Najpierw sprawdź, czy plik w ogóle istnieje
    const fileExists = await prisma.libraryFile.findUnique({
      where: { id: fileId },
      select: { id: true }
    });

    if (!fileExists) {
      console.log(`API: File with ID ${fileId} does not exist`);
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    console.log(`API: File ${fileId} exists, checking access`);

    // Sprawdź, czy użytkownik ma dostęp do pliku
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
      console.log(`API: User ${userId} has no access to file ${fileId}`);
      return NextResponse.json({ error: "Access denied to this file" }, { status: 403 });
    }

    console.log(`API: Access granted, file data exists: ${!!file.fileData}`);

    // Sprawdź, czy plik ma dane
    if (!file.fileData) {
      console.log(`API: File ${fileId} has no data`);
      return NextResponse.json({ error: "File data is missing" }, { status: 404 });
    }
    
    console.log(`API: File data type: ${typeof file.fileData}, is Buffer: ${Buffer.isBuffer(file.fileData)}`);
    
    // Przygotuj dane pliku jako Buffer
    const fileBuffer = Buffer.from(file.fileData);
    
    console.log(`API: Created buffer with size: ${fileBuffer.length} bytes`);
    
    // Ustawienie nagłówków odpowiedzi
    const headers = new Headers();
    headers.set('Content-Type', file.type || 'application/octet-stream');
    headers.set('Content-Disposition', `attachment; filename="${encodeURIComponent(file.name)}"`);
    headers.set('Content-Length', fileBuffer.length.toString());
    
    console.log(`API: Returning file ${file.name} with type ${file.type} and size ${fileBuffer.length}`);
    return new NextResponse(fileBuffer, { headers });
  } catch (error) {
    console.error(`API: Error in download endpoint:`, error);
    return NextResponse.json(
      { error: "Failed to download file", details: String(error) },
      { status: 500 }
    );
  }
}