// app/api/test-download/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  const testContent = "To jest testowy plik";
  const buffer = Buffer.from(testContent);
  
  const headers = new Headers();
  headers.set('Content-Type', 'text/plain');
  headers.set('Content-Disposition', 'attachment; filename="test.txt"');
  headers.set('Content-Length', buffer.length.toString());
  
  return new NextResponse(buffer, { headers });
}