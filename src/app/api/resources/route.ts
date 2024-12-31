// app/api/resources/route.ts
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const section = searchParams.get("section");

    const files = await prisma.resource.findMany({
      where: {
        section: section || undefined
      },
      select: {
        id: true,
        name: true,
        description: true,
        mimeType: true, // zmiana z type na mimeType
        size: true,
        section: true,
        uploadedAt: true,
        downloads: true,
        // nie wybieramy fileData, bo nie jest potrzebne w listingu
      }
    });

    return NextResponse.json(files);
  } catch (error) {
    console.error("Error fetching files:", error);
    return NextResponse.json(
      { error: "Failed to fetch files" },
      { status: 500 }
    );
  }
}