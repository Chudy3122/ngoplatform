import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
    if (!WEBHOOK_SECRET) {
      console.error('Missing CLERK_WEBHOOK_SECRET');
      return new Response('Missing webhook secret', { status: 500 });
    }

    // Pobierz nagłówki
    const headerPayload = headers();
    const svix_id = headerPayload.get("svix-id");
    const svix_timestamp = headerPayload.get("svix-timestamp");
    const svix_signature = headerPayload.get("svix-signature");

    if (!svix_id || !svix_timestamp || !svix_signature) {
      console.error('Missing svix headers');
      return new Response('Missing svix headers', { status: 400 });
    }

    // Pobierz body zapytania
    const payload = await req.json();
    const body = JSON.stringify(payload);

    // Zweryfikuj webhook
    const wh = new Webhook(WEBHOOK_SECRET);
    let evt: WebhookEvent;

    try {
      evt = wh.verify(body, {
        "svix-id": svix_id,
        "svix-timestamp": svix_timestamp,
        "svix-signature": svix_signature,
      }) as WebhookEvent;
    } catch (err) {
      console.error('Error verifying webhook:', err);
      return new Response('Error verifying webhook', { status: 400 });
    }

    // Obsługa wydarzeń
    if (evt.type === 'user.created') {
      console.log('Processing new user creation:', evt.data);
      const { id, email_addresses, username, first_name, last_name } = evt.data;
      
      try {
        // Dodaj więcej logów dla debugowania
        console.log('Creating test parent...');
        const parent = await prisma.parent.create({
          data: {
            id: `parent_${Date.now()}`, // Unikalny ID
            username: `parent_${Date.now()}`,
            name: 'Test Parent',
            surname: 'Test Surname',
            email: 'test@parent.com',
            phone: `${Date.now()}`, // Unikalny numer
            address: 'Test Address'
          }
        });
        console.log('Parent created:', parent);
    
        // Stwórz grade jeśli nie istnieje
        console.log('Creating or finding grade...');
        let grade = await prisma.grade.findFirst({ where: { level: 1 } });
        if (!grade) {
          grade = await prisma.grade.create({ data: { level: 1 } });
        }
        console.log('Grade ready:', grade);
    
        // Stwórz class jeśli nie istnieje
        console.log('Creating or finding class...');
        let class1 = await prisma.class.findFirst({ where: { name: '1A' } });
        if (!class1) {
          class1 = await prisma.class.create({
            data: {
              name: '1A',
              capacity: 30,
              gradeId: grade.id
            }
          });
        }
        console.log('Class ready:', class1);
    
        // Stwórz studenta
        console.log('Creating student...');
        const student = await prisma.student.create({
          data: {
            id: id, // ID z Clerka
            username: username || email_addresses?.[0]?.email_address?.split('@')[0] || id,
            email: email_addresses?.[0]?.email_address || '',
            name: first_name || '',
            surname: last_name || '',
            sex: 'MALE',
            address: 'Default Address',
            birthday: new Date(),
            parentId: parent.id,
            classId: class1.id,
            gradeId: grade.id
          }
        });
        console.log('Student created successfully:', student);
    
        return new Response(JSON.stringify({ success: true, student }), {
          status: 201,
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (error) {
        console.error('Detailed error creating user:', error);
        return new Response(JSON.stringify({ error: 'Failed to create user', details: error }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // Obsługa innych typów wydarzeń
    return new Response(JSON.stringify({ received: true, type: evt.type }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(JSON.stringify({ error: 'Internal webhook error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}