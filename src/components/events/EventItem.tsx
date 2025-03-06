// components/events/EventItem.tsx
"use client";

import Image from 'next/image';
import { useTranslations } from "@/hooks/useTranslations";
import UserAvatar from '@/components/UserAvatar';
import { useState, useEffect } from 'react';

interface EventItemProps {
  title: string;
  description: string;
  location: string;
  link?: string;
  maxParticipants?: number;
  goingCount: number;
  interestedCount: number;
  authorId: string;        // Zmienione z authorName na authorId
  authorName?: string;     // Opcjonalnie, jeśli już mamy nazwę
  canDelete?: boolean;
  onDelete?: () => void;
  participants?: Array<{
    id: string;
    name: string;
    avatar?: string;
  }>;
}

export const EventItem = ({
  title,
  description,
  location,
  link,
  maxParticipants,
  goingCount,
  interestedCount,
  authorId,
  authorName: providedAuthorName,
  canDelete,
  onDelete,
  participants = []
}: EventItemProps) => {
  const t = useTranslations();
  const [authorData, setAuthorData] = useState<any>(null);
  const [loading, setLoading] = useState(providedAuthorName ? false : true);

  // Pobierz dane autora, jeśli nie dostarczono nazwy
  useEffect(() => {
    if (providedAuthorName) {
      return; // Nie pobieraj, jeśli już mamy nazwę
    }

    const fetchAuthorData = async () => {
      try {
        const response = await fetch(`/api/userprofile?id=${encodeURIComponent(authorId)}`);
        
        if (response.ok) {
          const data = await response.json();
          setAuthorData(data);
        }
      } catch (error) {
        console.error('Error fetching author data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (authorId) {
      fetchAuthorData();
    }
  }, [authorId, providedAuthorName]);

  // Określ wyświetlaną nazwę autora
  const displayAuthorName = () => {
    if (providedAuthorName) {
      return providedAuthorName;
    }
    
    if (loading) {
      return "Ładowanie...";
    }
    
    if (authorData) {
      // Używaj imienia i nazwiska, jeśli są dostępne
      if (authorData.name && authorData.surname) {
        return `${authorData.name} ${authorData.surname}`;
      }
      // W przeciwnym razie użyj nazwy użytkownika
      return authorData.username;
    }
    
    return "Nieznany użytkownik";
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="flex flex-col gap-4">
        {/* Nagłówek z tytułem i autorem */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {/* Używamy UserAvatar zamiast statycznego obrazu */}
            <UserAvatar userId={authorId} size={40} />
            
            <div>
              <h3 className="font-medium">{title}</h3>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <span>Utworzone przez</span>
                  <span className="font-medium">{displayAuthorName()}</span>
                  {canDelete && (
                    <button 
                      onClick={onDelete}
                      className="ml-2 p-1 hover:bg-red-100 rounded-full transition-colors"
                    >
                      <Image src="/delete.png" alt="Usuń" width={16} height={16} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Przyciski udziału pozostają bez zmian */}
          <div className="flex gap-2">
            <button className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-full">
              <span className="flex items-center gap-1">
                <Image src="/user.png" alt="" width={16} height={16} className="invert" />
                Wezmę udział
              </span>
              <span className="bg-green-600 px-2 py-0.5 rounded-full text-sm">
                {goingCount}
              </span>
            </button>
            <button className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-full">
              <span className="flex items-center gap-1">
                <Image src="/star.png" alt="" width={16} height={16} className="invert" />
                Zainteresowany
              </span>
              <span className="bg-blue-600 px-2 py-0.5 rounded-full text-sm">
                {interestedCount}
              </span>
            </button>
          </div>
        </div>

        {/* Reszta komponentu bez zmian */}
        <div className="text-sm">
          <div className="mb-2">
            {description}
          </div>
          {link && (
            <a 
              href={link} 
              className="text-blue-500 hover:underline break-all"
              target="_blank"
              rel="noopener noreferrer"
            >
              Link do wydarzenia
            </a>
          )}
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Image src="/location.png" alt="" width={16} height={16} />
          {location}
        </div>

        {maxParticipants && (
          <div className="text-sm text-gray-500">
            <span className="font-medium">{goingCount}</span>
            <span> / </span>
            <span>{maxParticipants}</span>
            <span className="ml-1">zajętych miejsc</span>
          </div>
        )}

        {/* Lista uczestników - dodajemy UserAvatar */}
        {participants?.length > 0 && (
          <div className="mt-2">
            <h4 className="text-sm font-medium mb-2">Uczestnicy:</h4>
            <div className="flex flex-wrap gap-2">
              {participants.map((participant) => (
                <div 
                  key={participant.id}
                  className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full text-sm"
                >
                  {/* Używamy UserAvatar dla uczestników również */}
                  <UserAvatar userId={participant.id} size={24} />
                  <span>{participant.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};