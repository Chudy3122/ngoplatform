// src/app/api/get-firebase-token/route.ts
import { getAuth } from '@clerk/nextjs/server';
import { NextResponse, NextRequest } from 'next/server';
import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  } catch (error) {
    console.error('Firebase admin initialization error', error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = getAuth(req);
    const { userId } = auth;
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const customToken = await admin.auth().createCustomToken(userId);
    
    return NextResponse.json({ token: customToken });
  } catch (error) {
    console.error('Error creating custom token:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}