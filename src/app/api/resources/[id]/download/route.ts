// app/api/resources/[id]/download/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const resource = await prisma.resource.findUnique({
      where: { id: params.id }
    });

    if (!resource) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Inkrementuj licznik pobrań
    await prisma.resource.update({
      where: { id: params.id },
      data: { downloads: { increment: 1 } }
    });

    // Zwróć plik z odpowiednimi headerami
    return new NextResponse(resource.fileData, {
      headers: {
        'Content-Type': resource.mimeType,
        'Content-Disposition': `attachment; filename="${resource.name}"`,
      },
    });
  } catch (error) {
    console.error("Error downloading file:", error);
    return NextResponse.json(
      { error: "Failed to download file" },
      { status: 500 }
    );
  }
}