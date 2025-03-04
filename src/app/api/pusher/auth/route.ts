import { NextRequest, NextResponse } from 'next/server';
import Pusher from 'pusher';
import { getAuth } from '@clerk/nextjs/server';

export const runtime = "nodejs";
export const dynamic = 'force-dynamic';

// Inicjalizacja Pusher
const pusher = process.env.PUSHER_APP_ID && process.env.PUSHER_KEY && process.env.PUSHER_SECRET && process.env.PUSHER_CLUSTER
  ? new Pusher({
      appId: process.env.PUSHER_APP_ID,
      key: process.env.PUSHER_KEY,
      secret: process.env.PUSHER_SECRET,
      cluster: process.env.PUSHER_CLUSTER,
      useTLS: true,
    })
  : null;

// Obsługa żądań OPTIONS (dla CORS)
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

// Obsługa żądań POST dla autoryzacji Pusher
export async function POST(request: NextRequest) {
  // Logowanie dla debugowania
  console.log("Otrzymano żądanie autoryzacji Pusher");
  
  if (!pusher) {
    console.error("Pusher nie jest skonfigurowany");
    return NextResponse.json(
      { error: 'Pusher is not configured' },
      { status: 500 }
    );
  }

  try {
    // Pobierz dane z żądania
    const formData = await request.formData();
    const socketId = formData.get('socket_id') as string;
    const channel = formData.get('channel_name') as string;

    console.log("Dane autoryzacji:", { socketId, channel });

    if (!socketId || !channel) {
      console.error("Brak wymaganych parametrów");
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Ekstrakcja tokenu z nagłówka Authorization
    const authHeader = request.headers.get('authorization');
    let userId = null;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      userId = authHeader.substring(7); // Usunięcie "Bearer " z początku
      console.log("ID użytkownika z tokenu Bearer:", userId);
    } else {
      // Próba pobrania ID użytkownika przez Clerk
      const auth = getAuth(request);
      userId = auth?.userId;
      console.log("ID użytkownika z Clerk:", userId);
    }

    if (!userId) {
      console.error("Brak autoryzacji - użytkownik niezalogowany");
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Przygotuj dane dla kanałów obecności
    const userData = {
      user_id: userId,
      user_info: {
        name: userId,
      }
    };

    console.log("Autoryzacja kanału:", channel);

    // Autoryzuj kanał
    let authResponse;
    
    // Dla kanałów prywatnych (private-*)
    if (channel.startsWith('private-')) {
      authResponse = pusher.authorizeChannel(socketId, channel);
      console.log("Autoryzacja kanału prywatnego powiodła się");
    } 
    // Dla kanałów obecności (presence-*)
    else if (channel.startsWith('presence-')) {
      authResponse = pusher.authorizeChannel(socketId, channel, userData);
      console.log("Autoryzacja kanału presence powiodła się");
    } else {
      console.error("Nieznany typ kanału");
      return NextResponse.json(
        { error: 'Invalid channel type' },
        { status: 400 }
      );
    }

    console.log("Odpowiedź autoryzacji Pusher:", authResponse);
    return NextResponse.json(authResponse);
    
  } catch (error: any) {
    console.error('Błąd autoryzacji Pusher:', error);
    const errorMessage = error?.message || 'Unknown error';
    return NextResponse.json(
      { error: `Failed to authorize Pusher channel: ${errorMessage}` },
      { status: 500 }
    );
  }
}