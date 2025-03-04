import { NextRequest, NextResponse } from 'next/server';
import Pusher from 'pusher';
import { getAuth } from '@clerk/nextjs/server';

export const runtime = "nodejs";
export const dynamic = 'force-dynamic';

// Typy dla danych żądania
interface PusherEventData {
  channel: string;
  event: string;
  data: any;
}

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

// Obsługa żądań POST - wysyłanie zdarzeń Pusher
export async function POST(request: NextRequest) {
  if (!pusher) {
    return NextResponse.json(
      { error: 'Pusher is not configured' },
      { status: 500 }
    );
  }

  try {
    // Sprawdź autentykację użytkownika
    const { userId } = getAuth(request);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body: PusherEventData = await request.json();
    const { channel, event, data } = body;

    if (!channel || !event || !data) {
      return NextResponse.json(
        { error: 'Missing required fields: channel, event, or data' },
        { status: 400 }
      );
    }

    // Sprawdź, czy użytkownik ma uprawnienia do wysyłania na ten kanał
    // Np. dla kanałów private-user-X, tylko użytkownik X może wysyłać
    if (channel.startsWith('private-user-') && !channel.includes(userId) && data.senderId !== userId) {
      console.warn(`Attempted unauthorized message: User ${userId} tried to send to channel ${channel}`);
      return NextResponse.json(
        { error: 'Unauthorized to send to this channel' },
        { status: 403 }
      );
    }

    // Wysłanie zdarzenia przez Pusher
    console.log(`Sending Pusher event: ${event} to channel ${channel}`, data);
    await pusher.trigger(channel, event, data);
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Pusher error:', error);
    return NextResponse.json(
      { error: 'Failed to trigger Pusher event: ' + (error?.message || String(error)) },
      { status: 500 }
    );
  }
}