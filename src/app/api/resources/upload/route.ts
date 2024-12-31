import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    // Sprawdzamy autoryzację
    const authData = await auth();
    const role = (authData?.sessionClaims?.metadata as { role?: string })?.role;

    if (role !== "admin") {
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
        addedBy: authData.userId || "admin",
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