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
  if (!pusher) {
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

    if (!socketId || !channel) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Pobierz informację o zalogowanym użytkowniku
    const { userId } = getAuth(request);

    if (!userId) {
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

    // Autoryzuj kanał
    // Dla kanałów prywatnych (private-*)
    if (channel.startsWith('private-')) {
      const authResponse = pusher.authorizeChannel(socketId, channel);
      return NextResponse.json(authResponse);
    } 
    // Dla kanałów obecności (presence-*)
    else if (channel.startsWith('presence-')) {
      const authResponse = pusher.authorizeChannel(socketId, channel, userData);
      return NextResponse.json(authResponse);
    }

    // Dla nieznanych typów kanałów
    return NextResponse.json(
      { error: 'Invalid channel type' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Pusher auth error:', error);
    return NextResponse.json(
      { error: 'Failed to authorize Pusher channel: ' + (error?.message || String(error)) },
      { status: 500 }
    );
  }
}