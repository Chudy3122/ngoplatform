"use client";

import { useState, useEffect } from 'react';
import { useTranslations } from '@/hooks/useTranslations';
import UserAvatar from '@/components/UserAvatar';

type Announcement = {
  id: number;
  title: string;
  description: string;
  date: string;
  authorId?: string;
  classId?: number;
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

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const response = await fetch('/api/announcements?limit=3');
        if (!response.ok) throw new Error('Failed to fetch announcements');
        const data = await response.json();
        setAnnouncements(data);
        
        // Pobierz informacje o autorach
        data.forEach((announcement: Announcement) => {
          if (announcement.authorId) {
            fetchAuthorInfo(announcement.authorId);
          }
        });
      } catch (error) {
        console.error('Error fetching announcements:', error);
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
      [authorId]: { id: authorId, username: 'Loading...', loading: true }
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
          [authorId]: { id: authorId, username: 'Unknown User', loading: false }
        }));
      }
    } catch (error) {
      console.error('Error fetching author info:', error);
      setAuthorsInfo(prev => ({
        ...prev,
        [authorId]: { id: authorId, username: 'Unknown User', loading: false }
      }));
    }
  };

  const getAuthorDisplayName = (authorId?: string) => {
    if (!authorId) return 'Unknown User';
    
    const author = authorsInfo[authorId];
    if (!author) return 'Loading...';
    if (author.loading) return 'Loading...';
    
    if (author.name && author.surname) {
      return `${author.name} ${author.surname}`;
    }
    
    return author.username;
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
        {announcements[0] && (
          <div className="bg-lamaSkyLight rounded-md p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserAvatar 
                  userId={announcements[0].authorId || "default-user-id"} 
                  size={32} 
                />
                <div>
                  <h2 className="font-medium">{announcements[0].title}</h2>
                  <div className="text-xs text-gray-500">
                    {getAuthorDisplayName(announcements[0].authorId)}
                  </div>
                </div>
              </div>
              <span className="text-xs text-gray-400 bg-white rounded-md px-1 py-1">
                {new Date(announcements[0].date).toLocaleDateString()}
              </span>
            </div>
            <p className="text-sm text-gray-400 mt-1">{announcements[0].description}</p>
          </div>
        )}
        {announcements[1] && (
          <div className="bg-lamaPurpleLight rounded-md p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserAvatar 
                  userId={announcements[1].authorId || "default-user-id"} 
                  size={32} 
                />
                <div>
                  <h2 className="font-medium">{announcements[1].title}</h2>
                  <div className="text-xs text-gray-500">
                    {getAuthorDisplayName(announcements[1].authorId)}
                  </div>
                </div>
              </div>
              <span className="text-xs text-gray-400 bg-white rounded-md px-1 py-1">
                {new Date(announcements[1].date).toLocaleDateString()}
              </span>
            </div>
            <p className="text-sm text-gray-400 mt-1">{announcements[1].description}</p>
          </div>
        )}
        {announcements[2] && (
          <div className="bg-lamaYellowLight rounded-md p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserAvatar 
                  userId={announcements[2].authorId || "default-user-id"} 
                  size={32} 
                />
                <div>
                  <h2 className="font-medium">{announcements[2].title}</h2>
                  <div className="text-xs text-gray-500">
                    {getAuthorDisplayName(announcements[2].authorId)}
                  </div>
                </div>
              </div>
              <span className="text-xs text-gray-400 bg-white rounded-md px-1 py-1">
                {new Date(announcements[2].date).toLocaleDateString()}
              </span>
            </div>
            <p className="text-sm text-gray-400 mt-1">{announcements[2].description}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Announcements;