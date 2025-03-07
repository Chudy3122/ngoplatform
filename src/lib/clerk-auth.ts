// lib/clerk-auth.ts
import { NextRequest } from 'next/server';

/**
 * Helper do pobierania ID użytkownika z Clerk w kontekście API
 */
export async function getCurrentUserId(req?: NextRequest): Promise<string | null> {
  try {
    // Spróbuj użyć getAuth z Clerk
    try {
      const { getAuth } = await import('@clerk/nextjs/server');
      if (req) {
        const { userId } = getAuth(req);
        return userId;
      } 
    } catch (e) {
      console.error("Błąd z getAuth:", e);
    }
    
    // Jeśli nie udało się z getAuth, spróbuj z auth
    try {
      const { auth } = await import('@clerk/nextjs/server');
      const { userId } = await auth();
      return userId;
    } catch (e) {
      console.error("Błąd z auth:", e);
    }
    
    // Jeśli wszystko zawiedzie, zwróć null
    return null;
  } catch (error) {
    console.error("Błąd ogólny przy autoryzacji:", error);
    return null;
  }
}