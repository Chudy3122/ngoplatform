// src/lib/auth.ts
import { getAuth, signInWithCustomToken } from 'firebase/auth';
import { auth } from './firebase';

export async function getFirebaseToken(userId: string) {
  try {
    if (!userId) {
      throw new Error('No user ID provided');
    }

    const response = await fetch('/api/get-firebase-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get Firebase token');
    }

    const { token } = await response.json();
    
    if (token) {
      await signInWithCustomToken(auth, token);
      console.log("Successfully authenticated with Firebase");
    }
    
    return token;
  } catch (error) {
    console.error('Error getting Firebase token:', error);
    throw error;
  }
}

export { auth };