// app/api/files/[fileId]/download/route.ts - uproszczona wersja
import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: { fileId: string } }) {
  try {
    const fileId = params.fileId;
    console.log(`API: Test endpoint called for file ${fileId}`);
    
    // Utwórz przykładowy plik tekstowy
    const content = `To jest testowy plik dla ID: ${fileId}`;
    const buffer = Buffer.from(content);
    
    // Ustaw nagłówki
    const headers = new Headers();
    headers.set('Content-Type', 'text/plain');
    headers.set('Content-Disposition', `attachment; filename="test-${fileId}.txt"`);
    headers.set('Content-Length', buffer.length.toString());
    
    return new NextResponse(buffer, { headers });
  } catch (error) {
    console.error("API Test Error:", error);
    return NextResponse.json({ error: "Test failed" }, { status: 500 });
  }
}