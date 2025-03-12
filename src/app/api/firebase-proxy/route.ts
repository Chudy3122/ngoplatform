// app/api/firebase-proxy/route.ts (zaktualizowany z lepszym debugowaniem)
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
      console.log("Firebase proxy: User not authenticated");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Pobierz ścieżkę pliku z parametru zapytania
    const searchParams = request.nextUrl.searchParams;
    const filePath = searchParams.get("path");
    
    if (!filePath) {
      console.log("Firebase proxy: No file path provided");
      return NextResponse.json({ error: "No file path provided" }, { status: 400 });
    }
    
    console.log(`Firebase proxy: Attempting to proxy file: ${filePath} for user ${userId}`);
    
    // Alternatywne podejście: użyj getDownloadURL z Admin SDK
    try {
      // Uzyskaj dostęp do Storage przez Admin SDK
      const bucket = admin.storage().bucket();
      console.log(`Firebase proxy: Accessing bucket: ${bucket.name}`);
      
      // Pobierz plik
      const [fileBuffer] = await bucket.file(filePath).download();
      console.log(`Firebase proxy: File downloaded, size: ${fileBuffer.length} bytes`);
      
      // Pobierz metadane pliku
      const [metadata] = await bucket.file(filePath).getMetadata();
      console.log(`Firebase proxy: File metadata:`, metadata.contentType);
      
      // Ustaw nagłówki odpowiedzi
      const headers = new Headers();
      headers.set('Content-Type', metadata.contentType || 'application/octet-stream');
      
      // Wyciągnij nazwę pliku z ścieżki
      const fileName = filePath.split('/').pop() || 'file';
      const decodedFileName = decodeURIComponent(fileName);
      headers.set('Content-Disposition', `attachment; filename="${encodeURIComponent(decodedFileName)}"`);
      headers.set('Content-Length', fileBuffer.length.toString());
      
      console.log(`Firebase proxy: Returning file with name "${decodedFileName}"`);
      return new NextResponse(fileBuffer, { headers });
    } catch (storageError) {
      console.error("Firebase proxy: Storage error", storageError);
      
      // Spróbuj alternatywne podejście - pobranie publicznego URL i przekierowanie
      try {
        console.log("Firebase proxy: Trying alternative approach");
        const [signedUrl] = await admin.storage().bucket().file(filePath).getSignedUrl({
          action: 'read',
          expires: Date.now() + 5 * 60 * 1000, // 5 minut
        });
        
        console.log(`Firebase proxy: Generated signed URL: ${signedUrl.substring(0, 100)}...`);
        
        // Pobierz plik przez fetch
        const response = await fetch(signedUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch file: ${response.statusText}`);
        }
        
        const contentType = response.headers.get('content-type') || 'application/octet-stream';
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        
        // Ustaw nagłówki odpowiedzi
        const headers = new Headers();
        headers.set('Content-Type', contentType);
        
        // Wyciągnij nazwę pliku z ścieżki
        const fileName = filePath.split('/').pop() || 'file';
        const decodedFileName = decodeURIComponent(fileName);
        headers.set('Content-Disposition', `attachment; filename="${encodeURIComponent(decodedFileName)}"`);
        headers.set('Content-Length', buffer.length.toString());
        
        console.log(`Firebase proxy: Returning file with name "${decodedFileName}" via fetch`);
        return new NextResponse(buffer, { headers });
      } catch (alternativeError) {
        console.error("Firebase proxy: Alternative approach failed", alternativeError);
        throw alternativeError; // Przekaż błąd dalej
      }
    }
  } catch (error) {
    console.error("Firebase proxy: Error", error);
    return NextResponse.json(
      { error: "Failed to proxy file", details: String(error) },
      { status: 500 }
    );
  }
}