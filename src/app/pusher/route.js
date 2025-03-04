import { NextResponse } from 'next/server';
import Pusher from 'pusher';

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

// Obsługa żądań POST
export async function POST(request) {
  if (!pusher) {
    return NextResponse.json(
      { error: 'Pusher is not configured' },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const { channel, event, data } = body;

    if (!channel || !event || !data) {
      return NextResponse.json(
        { error: 'Missing required fields: channel, event, or data' },
        { status: 400 }
      );
    }

    // Wysłanie zdarzenia przez Pusher
    await pusher.trigger(channel, event, data);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Pusher error:', error);
    return NextResponse.json(
      { error: 'Failed to trigger Pusher event' },
      { status: 500 }
    );
  }
}