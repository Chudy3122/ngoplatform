import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/session";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { roleId, roleTable } = session;

    const whereClause =
      roleTable === 'admin'   ? { adminOwnerId: roleId } :
      roleTable === 'teacher' ? { teacherOwnerId: roleId } :
      roleTable === 'student' ? { studentOwnerId: roleId } :
                                { parentOwnerId: roleId };

    const files = await prisma.libraryFile.findMany({
      where: whereClause,
      select: { id: true, name: true, size: true, type: true, createdAt: true },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(files);
  } catch (error) {
    console.error('Error listing files:', error);
    return NextResponse.json({ error: 'Failed to list files' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { roleId, roleTable } = session;

    const data = await req.formData();
    const file: File | null = data.get('file') as unknown as File;
    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileData = { name: file.name, size: file.size, type: file.type, fileData: buffer };

    const ownerField =
      roleTable === 'admin'   ? { adminOwnerId: roleId } :
      roleTable === 'teacher' ? { teacherOwnerId: roleId } :
      roleTable === 'student' ? { studentOwnerId: roleId } :
                                { parentOwnerId: roleId };

    const fileRecord = await prisma.libraryFile.create({ data: { ...fileData, ...ownerField } });
    return NextResponse.json({ id: fileRecord.id, name: fileRecord.name, size: fileRecord.size, type: fileRecord.type });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { roleId, roleTable } = session;

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: "File ID required" }, { status: 400 });

    const ownerField =
      roleTable === 'admin'   ? { adminOwnerId: roleId } :
      roleTable === 'teacher' ? { teacherOwnerId: roleId } :
      roleTable === 'student' ? { studentOwnerId: roleId } :
                                { parentOwnerId: roleId };

    const file = await prisma.libraryFile.findFirst({ where: { id, ...ownerField } });
    if (!file) return NextResponse.json({ error: "File not found or access denied" }, { status: 404 });

    await prisma.libraryFile.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json({ error: 'Failed to delete file' }, { status: 500 });
  }
}
