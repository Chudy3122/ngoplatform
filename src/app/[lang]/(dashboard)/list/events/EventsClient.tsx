// app/[lang]/(dashboard)/list/events/EventsClient.tsx
"use client";

import { useState } from 'react';
import EventList from '@/components/EventList';
import EventForm from '@/components/EventForm';
import { useTranslations } from '@/hooks/useTranslations';
import EventCalendar from '@/components/EventCalendar';

export default function EventsClient() {
  const [isFormVisible, setIsFormVisible] = useState(false);
  const t = useTranslations();

  return (
    <div className="flex-1 flex gap-4">
      <div className="w-full lg:w-3/4">
        <div className="bg-white p-6 rounded-lg">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold">{t.events.title}</h1>
            <button
              onClick={() => setIsFormVisible(!isFormVisible)}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              {isFormVisible ? t.events.cancel : t.events.createEvent}
            </button>
          </div>

          {isFormVisible && (
            <div className="mb-8">
              <EventForm 
                onEventCreated={() => {
                  setIsFormVisible(false);
                }} 
              />
            </div>
          )}

          <EventList />
        </div>
      </div>

      <div className="w-full lg:w-1/4 space-y-4">
        <EventCalendar multiMonth={true} />
        
      </div>
    </div>
  );
}