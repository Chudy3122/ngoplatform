import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.formData();
    const file: File | null = data.get('file') as unknown as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Sprawdzamy typ użytkownika
    const [admin, teacher, student, parent] = await Promise.all([
      prisma.admin.findUnique({ where: { id: userId } }),
      prisma.teacher.findUnique({ where: { id: userId } }),
      prisma.student.findUnique({ where: { id: userId } }),
      prisma.parent.findUnique({ where: { id: userId } })
    ]);

    // Przygotowujemy dane pliku
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    let fileData = {
      name: file.name,
      size: file.size,
      type: file.type,
      fileData: buffer
    };

    let fileRecord;

    // Dodajemy plik z odpowiednim właścicielem
    if (admin) {
      fileRecord = await prisma.libraryFile.create({
        data: {
          ...fileData,
          adminOwnerId: userId
        }
      });
    } else if (teacher) {
      fileRecord = await prisma.libraryFile.create({
        data: {
          ...fileData,
          teacherOwnerId: userId
        }
      });
    } else if (student) {
      fileRecord = await prisma.libraryFile.create({
        data: {
          ...fileData,
          studentOwnerId: userId
        }
      });
    } else if (parent) {
      fileRecord = await prisma.libraryFile.create({
        data: {
          ...fileData,
          parentOwnerId: userId
        }
      });
    } else {
      console.error('User not found in any role:', userId);
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: fileRecord.id,
      name: fileRecord.name,
      size: fileRecord.size,
      type: fileRecord.type
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}