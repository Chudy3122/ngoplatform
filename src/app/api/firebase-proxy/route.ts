// app/api/firebase-proxy/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import * as admin from 'firebase-admin';

// Inicjalizacja Firebase Admin SDK (jeśli jeszcze nie zainicjalizowano)
if (!admin.apps.length) {
  try {
    // Pobierz nazwę bucketa z zmiennych środowiskowych
    const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
    
    if (!storageBucket) {
      console.error('Firebase storage bucket name not specified in environment variables');
    }
    
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
      storageBucket: storageBucket // Jawnie przekaż nazwę bucketa
    });
    
    console.log(`Firebase Admin initialized with bucket: ${storageBucket}`);
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
    
    // Upewnij się, że nazwa bucketa jest ustawiona
    const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
    if (!storageBucket) {
      console.error('Firebase storage bucket name is missing');
      return NextResponse.json({ 
        error: "Configuration error: Storage bucket not specified" 
      }, { status: 500 });
    }
    
    // Pobierz referencję do bucketa jawnie używając nazwy
    const bucket = admin.storage().bucket(storageBucket);
    console.log(`Firebase proxy: Using bucket: ${bucket.name}`);
    
    try {
      // Sprawdź czy plik istnieje
      const [exists] = await bucket.file(filePath).exists();
      if (!exists) {
        console.log(`Firebase proxy: File not found: ${filePath}`);
        return NextResponse.json({ error: "File not found" }, { status: 404 });
      }
      
      // Pobierz plik
      const [fileBuffer] = await bucket.file(filePath).download();
      console.log(`Firebase proxy: File downloaded, size: ${fileBuffer.length} bytes`);
      
      // Pobierz metadane pliku
      const [metadata] = await bucket.file(filePath).getMetadata();
      const contentType = metadata.contentType || 'application/octet-stream';
      console.log(`Firebase proxy: File metadata:`, contentType);
      
      // Ustaw nagłówki odpowiedzi
      const headers = new Headers();
      headers.set('Content-Type', contentType);
      
      // Wyciągnij nazwę pliku z ścieżki
      const fileName = filePath.split('/').pop() || 'file';
      const decodedFileName = decodeURIComponent(fileName);
      headers.set('Content-Disposition', `attachment; filename="${encodeURIComponent(decodedFileName)}"`);
      headers.set('Content-Length', fileBuffer.length.toString());
      
      console.log(`Firebase proxy: Returning file with name "${decodedFileName}"`);
      return new NextResponse(fileBuffer, { headers });
    } catch (downloadError) {
      console.error("Firebase proxy: Error downloading file", downloadError);

      // Alternatywne podejście - podpisany URL
      try {
        console.log("Firebase proxy: Trying alternative approach with signed URL");
        const [signedUrl] = await bucket.file(filePath).getSignedUrl({
          action: 'read',
          expires: Date.now() + 15 * 60 * 1000, // 15 minut
        });
        
        // Przekieruj zamiast proksowania
        return NextResponse.redirect(signedUrl);
      } catch (urlError) {
        console.error("Firebase proxy: Signed URL approach failed", urlError);
        throw urlError;
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