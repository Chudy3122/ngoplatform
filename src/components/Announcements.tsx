"use client";

import { useState, useEffect } from 'react';
import { useTranslations } from '@/hooks/useTranslations';
import UserAvatar from '@/components/UserAvatar';
import { useAuth } from '@clerk/nextjs';

type Announcement = {
  id: number;
  title: string;
  content: string; // Zmiana z description na content zgodnie z modelem Prisma
  createdAt: string; // Zmiana z date na createdAt zgodnie z modelem Prisma
  authorId: string;
};

type AuthorInfo = {
  id: string;
  name?: string;
  surname?: string;
  username: string;
  img?: string;
  loading: boolean;
};

const Announcements = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [authorsInfo, setAuthorsInfo] = useState<Record<string, AuthorInfo>>({});
  const [loading, setLoading] = useState(true);
  const t = useTranslations();
  const { userId } = useAuth(); // Pobierz ID zalogowanego użytkownika

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const response = await fetch('/api/posts?limit=3');
        if (!response.ok) throw new Error('Nie udało się pobrać ogłoszeń');
        const data = await response.json();
        setAnnouncements(data);
        
        // Pobierz informacje o autorach
        data.forEach((announcement: Announcement) => {
          if (announcement.authorId) {
            fetchAuthorInfo(announcement.authorId);
          }
        });
      } catch (error) {
        console.error('Błąd podczas pobierania ogłoszeń:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, []);

  const fetchAuthorInfo = async (authorId: string) => {
    // Jeśli już pobieramy dane dla tego autora, nie rób tego ponownie
    if (authorsInfo[authorId]?.loading) return;
    
    // Oznacz, że rozpoczęliśmy pobieranie danych
    setAuthorsInfo(prev => ({
      ...prev,
      [authorId]: { id: authorId, username: 'Ładowanie...', loading: true }
    }));
    
    try {
      const response = await fetch(`/api/userprofile?id=${encodeURIComponent(authorId)}`);
      
      if (response.ok) {
        const data = await response.json();
        // Zapisz pobrane dane
        setAuthorsInfo(prev => ({
          ...prev,
          [authorId]: { ...data, loading: false }
        }));
      } else {
        // W przypadku błędu
        setAuthorsInfo(prev => ({
          ...prev,
          [authorId]: { id: authorId, username: 'Nieznany użytkownik', loading: false }
        }));
      }
    } catch (error) {
      console.error('Błąd podczas pobierania informacji o autorze:', error);
      setAuthorsInfo(prev => ({
        ...prev,
        [authorId]: { id: authorId, username: 'Nieznany użytkownik', loading: false }
      }));
    }
  };

  const getAuthorDisplayName = (authorId?: string) => {
    if (!authorId) return 'Nieznany użytkownik';
    
    const author = authorsInfo[authorId];
    if (!author) return 'Ładowanie...';
    if (author.loading) return 'Ładowanie...';
    
    if (author.name && author.surname) {
      return `${author.name} ${author.surname}`;
    }
    
    return author.username;
  };

  // Dodaj funkcjonalność usuwania postów
  const deletePost = async (postId: number) => {
    if (confirm('Czy na pewno chcesz usunąć ten post?')) {
      try {
        const response = await fetch(`/api/posts/${postId}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          // Usuń post ze stanu lokalnego
          setAnnouncements(prev => prev.filter(post => post.id !== postId));
          alert('Post został pomyślnie usunięty');
        } else {
          const error = await response.json();
          alert(error.error || 'Nie udało się usunąć posta');
        }
      } catch (error) {
        console.error('Błąd podczas usuwania posta:', error);
        alert('Wystąpił błąd podczas usuwania posta.');
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
                      {getAuthorDisplayName(announcement.authorId)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400 bg-white rounded-md px-1 py-1">
                    {new Date(announcement.createdAt).toLocaleDateString()}
                  </span>
                  
                  {/* Przycisk usuwania - pokaż tylko dla autora posta */}
                  {userId && userId === announcement.authorId && (
                    <button 
                      onClick={() => deletePost(announcement.id)}
                      className="text-red-500 hover:text-red-700 text-xs bg-white rounded-md px-2 py-1"
                    >
                      Usuń
                    </button>
                  )}
                </div>
              </div>
              <p className="text-sm text-gray-400 mt-1">{announcement.content}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Announcements;