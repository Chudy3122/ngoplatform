// app/[lang]/(dashboard)/list/events/page.tsx
import EventsClient from './EventsClient';
import { Suspense } from 'react';

export default function EventsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EventsClient />
    </Suspense>
  );
}