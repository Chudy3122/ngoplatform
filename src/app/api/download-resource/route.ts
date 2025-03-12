// app/api/download-resource/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    // Pobierz ID zasobu z query string
    const url = new URL(request.url);
    const resourceId = url.searchParams.get('id');
    
    if (!resourceId) {
      return NextResponse.json({ error: "Missing resource ID" }, { status: 400 });
    }
    
    console.log(`API: Download resource called for ID: ${resourceId}`);
    
    const resource = await prisma.resource.findUnique({
      where: { id: resourceId }
    });

    if (!resource) {
      console.log(`API: Resource with ID ${resourceId} not found`);
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    console.log(`API: Resource found, incrementing download count`);
    
    // Inkrementuj licznik pobrań
    await prisma.resource.update({
      where: { id: resourceId },
      data: { downloads: { increment: 1 } }
    });

    // Przygotuj nagłówki odpowiedzi
    const headers = new Headers();
    headers.set('Content-Type', resource.mimeType || 'application/octet-stream');
    headers.set('Content-Disposition', `attachment; filename="${encodeURIComponent(resource.name)}"`);
    
    if (resource.fileData) {
      const fileBuffer = Buffer.from(resource.fileData);
      headers.set('Content-Length', fileBuffer.length.toString());
      
      console.log(`API: Returning resource file ${resource.name} with type ${resource.mimeType}`);
      return new NextResponse(fileBuffer, { headers });
    } else {
      console.log(`API: Resource ${resourceId} has no file data`);
      return NextResponse.json({ error: "File data not found" }, { status: 404 });
    }
  } catch (error) {
    console.error("API: Error downloading resource:", error);
    return NextResponse.json(
      { error: "Failed to download file", details: String(error) },
      { status: 500 }
    );
  }
}