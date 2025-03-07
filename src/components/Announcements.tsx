"use client";

import { useState, useEffect } from 'react';
import { useTranslations } from '@/hooks/useTranslations';
import UserAvatar from '@/components/UserAvatar';

// Zdefiniuj typ dla ogłoszenia
type Announcement = {
  id: number;
  title: string;
  description?: string;
  content?: string;
  date?: string | Date;
  createdAt?: string | Date;
  authorId?: string;
  authorName?: string;
};

// Uproszczony komponent do wyświetlania ogłoszeń
const Announcements = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const t = useTranslations();

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        console.log("Pobieranie ogłoszeń...");
        const response = await fetch('/api/announcements');
        if (!response.ok) {
          console.error("Błąd podczas pobierania ogłoszeń:", response.status, response.statusText);
          throw new Error('Nie udało się pobrać ogłoszeń');
        }
        
        const data = await response.json();
        console.log("Pobrane ogłoszenia:", data);
        setAnnouncements(data);
      } catch (error) {
        console.error('Błąd:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, []);

  // Funkcja do usuwania posta
  const deletePost = async (id: number) => {
    if (confirm('Czy na pewno chcesz usunąć ten post?')) {
      try {
        console.log("Próba usunięcia posta ID:", id);
        const response = await fetch(`/api/posts/${id}`, {
          method: 'DELETE',
        });
        
        console.log("Odpowiedź DELETE:", response.status, response.statusText);
        
        if (response.ok) {
          setAnnouncements(prev => prev.filter(post => post.id !== id));
          alert('Post został usunięty pomyślnie');
        } else {
          alert('Błąd podczas usuwania posta');
        }
      } catch (error) {
        console.error('Błąd:', error);
        alert('Wystąpił błąd podczas usuwania posta');
      }
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-4 rounded-md">
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-md">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Ogłoszenia</h1>
      </div>
      <div className="flex flex-col gap-4 mt-4">
        {announcements.map((announcement, index) => {
          const bgColor = index === 0 ? "bg-lamaSkyLight" : 
                          index === 1 ? "bg-lamaPurpleLight" : 
                          "bg-lamaYellowLight";
          
          return (
            <div key={announcement.id} className={`${bgColor} rounded-md p-4`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UserAvatar 
                    userId={announcement.authorId || "default-user-id"} 
                    size={32} 
                  />
                  <div>
                    <h2 className="font-medium">{announcement.title}</h2>
                    <div className="text-xs text-gray-500">
                      {announcement.authorName || "Nieznany użytkownik"}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400 bg-white rounded-md px-1 py-1">
                    {new Date(announcement.date || announcement.createdAt || new Date()).toLocaleDateString()}
                  </span>
                  
                  <button 
                    onClick={() => deletePost(announcement.id)}
                    className="text-red-500 hover:text-red-700 text-xs bg-white rounded-md px-2 py-1"
                  >
                    Usuń
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-400 mt-1">{announcement.description || announcement.content || ""}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Announcements;