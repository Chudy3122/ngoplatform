// components/EventListItem.tsx
"use client";

import Image from 'next/image';
import { useTranslations } from "@/hooks/useTranslations";

interface Participant {
  id: number;
  userId: string;
  status: 'GOING' | 'INTERESTED' | 'NOT_GOING';
  username?: string;
}

interface Event {
  id: number;
  title: string;
  description: string;
  location: string;
  startTime: string;
  endTime: string;
  price?: number;
  maxParticipants?: number;
  participants?: Participant[];
  authorId?: string;
}

interface EventListItemProps {
  event: Event;
  compact?: boolean;
}

export default function EventListItem({ event, compact = false }: EventListItemProps) {
  const t = useTranslations();

  const goingCount = event.participants?.filter(p => p.status === 'GOING').length || 0;
  const interestedCount = event.participants?.filter(p => p.status === 'INTERESTED').length || 0;

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="flex flex-col gap-4">
        {/* Nagłówek wydarzenia - ZMIENIONA CZĘŚĆ */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-start gap-3">
            <Image
              src="/event-placeholder.png"
              alt=""
              width={40}
              height={40}
              className="rounded-full"
            />
            <div>
              <h3 className="font-medium">{event.title}</h3>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Image src="/calendar.png" alt="" width={12} height={12} />
                  <span>{new Date(event.startTime).toLocaleDateString()}</span>
                  <span>{new Date(event.startTime).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}</span>
                </div>
              </div>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-sm">admin</span>
                {/* Jeśli potrzebna ikonka usuwania */}
                {event.authorId && (
                  <Image
                    src="/delete.png"
                    alt="delete"
                    width={12}
                    height={12}
                    className="cursor-pointer ml-1"
                  />
                )}
              </div>
            </div>
          </div>
          
          {/* Przyciski uczestnictwa */}
          <div className="flex gap-2">
            <button className="bg-green-500 text-white px-4 py-2 rounded-full text-sm">
              <span>Wezmę udział</span>
              <span className="ml-1">({goingCount})</span>
            </button>
            <button className="bg-blue-500 text-white px-4 py-2 rounded-full text-sm">
              <span>Jestem zainteresowany</span>
              <span className="ml-1">({interestedCount})</span>
            </button>
          </div>
        </div>

        {/* Treść wydarzenia */}
        <div className="text-sm text-gray-600">
          {event.description}
        </div>

        {/* Lokalizacja */}
        <div className="flex items-center gap-1 text-sm text-gray-500">
          <Image src="/location.png" alt="" width={12} height={12} />
          {event.location}
        </div>

        {/* Liczba uczestników */}
        {event.maxParticipants && (
          <div className="mt-2">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full"
                style={{
                  width: `${(goingCount / event.maxParticipants) * 100}%`
                }}
              />
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {goingCount}/{event.maxParticipants} {t.events.participation.spotsFilled}
            </div>
          </div>
        )}

        {/* Lista uczestników */}
        {event.participants && event.participants.length > 0 && (
          <div className="mt-2">
            <h4 className="text-sm font-medium mb-2">Uczestnicy:</h4>
            <div className="flex flex-wrap gap-2">
              {event.participants.map((participant) => (
                <div 
                  key={participant.id}
                  className="bg-gray-100 px-2 py-1 rounded-full text-xs"
                >
                  {participant.username || 'Unknown User'}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}