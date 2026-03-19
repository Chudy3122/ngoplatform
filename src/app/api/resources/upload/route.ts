import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/session";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    // Sprawdzamy autoryzację
    const session = await getSessionFromRequest(request);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { userId, role } = session;

    if (role !== "ADMIN") {
      return NextResponse.json(
        { error: "Only admin can upload files" },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const description = formData.get("description") as string;
    const section = formData.get("section") as string;

    if (!file || !section) {
      return NextResponse.json(
        { error: "File and section are required" },
        { status: 400 }
      );
    }

    // Konwertujemy plik na ArrayBuffer, a następnie na Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Zapisujemy w bazie danych
    const resource = await prisma.resource.create({
      data: {
        name: file.name,
        description: description || "",
        fileData: buffer,
        mimeType: file.type,
        size: file.size,
        section,
        addedBy: userId || "admin",
      },
    });

    // Zwracamy dane bez fileData
    return NextResponse.json({
      ...resource,
      fileData: undefined
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
