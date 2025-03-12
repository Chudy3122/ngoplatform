// app/api/firebase-proxy/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import * as admin from 'firebase-admin';

// Inicjalizacja Firebase Admin SDK (jeśli jeszcze nie zainicjalizowano)
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    });
  } catch (error) {
    console.error('Firebase admin initialization error', error);
  }
}

export async function GET(request: NextRequest) {
  try {
    // Sprawdź autoryzację
    const auth = getAuth(request);
    const { userId } = auth;
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Pobierz ścieżkę pliku z parametru zapytania
    const searchParams = request.nextUrl.searchParams;
    const filePath = searchParams.get("path");
    
    if (!filePath) {
      return NextResponse.json({ error: "No file path provided" }, { status: 400 });
    }
    
    console.log(`Server: Attempting to proxy file: ${filePath}`);
    
    // Uzyskaj dostęp do Storage przez Admin SDK
    const bucket = admin.storage().bucket();
    const file = bucket.file(filePath);
    
    // Sprawdź, czy plik istnieje
    const [exists] = await file.exists();
    if (!exists) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }
    
    // Pobierz metadane pliku
    const [metadata] = await file.getMetadata();
    const contentType = metadata.contentType || 'application/octet-stream';
    
    // Pobierz nazwę pliku
    const fileName = filePath.split("/").pop() || "download";
    const decodedFileName = decodeURIComponent(fileName);
    
    // Utwórz strumień do pobierania pliku
    const [fileContent] = await file.download();
    
    // Ustaw nagłówki odpowiedzi
    const headers = new Headers();
    headers.set("Content-Type", contentType);
    headers.set("Content-Disposition", `attachment; filename="${encodeURIComponent(decodedFileName)}"`);
    headers.set("Content-Length", fileContent.length.toString());
    
    // Zwróć dane pliku
    return new NextResponse(fileContent, { headers });
  } catch (error) {
    console.error("Firebase proxy error:", error);
    return NextResponse.json(
      { error: "Failed to proxy file", details: String(error) },
      { status: 500 }
    );
  }
}