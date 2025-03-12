// app/api/files/test/download/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  // Symuluj pobieranie pliku testowego
  const testContent = "To jest testowy plik symulujący pobieranie pliku z bazy danych";
  const buffer = Buffer.from(testContent);
  
  const headers = new Headers();
  headers.set('Content-Type', 'text/plain');
  headers.set('Content-Disposition', 'attachment; filename="test-file.txt"');
  headers.set('Content-Length', buffer.length.toString());
  
  return new NextResponse(buffer, { headers });
}