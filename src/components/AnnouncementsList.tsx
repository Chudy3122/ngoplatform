// components/AnnouncementsList.tsx
"use client";

import { useState, useEffect } from 'react';
import { useTranslations } from '@/hooks/useTranslations';
import { useUser } from '@clerk/nextjs';
import UserAvatar from '@/components/UserAvatar';

type Announcement = {
  id: number;
  title: string;
  description: string;
  date: string;
  authorId: string;
  classId?: number;
  author?: {
    id: string;
    name?: string;
    surname?: string;
    username: string;
    img?: string;
  };
};

interface AnnouncementsListProps {
  limit?: number;
  classId?: number;
}

export default function AnnouncementsList({ limit, classId }: AnnouncementsListProps) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useUser();
  const t = useTranslations();

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        setLoading(true);
        const url = new URL('/api/announcements', window.location.origin);
        if (limit) url.searchParams.append('limit', limit.toString());
        if (classId) url.searchParams.append('classId', classId.toString());
        
        const response = await fetch(url.toString());
        
        if (!response.ok) {
          throw new Error('Failed to fetch announcements');
        }
        
        const data = await response.json();
        setAnnouncements(data);
      } catch (err) {
        console.error('Error fetching announcements:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch announcements');
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, [limit, classId]);

  const getAuthorDisplayName = (announcement: Announcement) => {
    if (!announcement.author) return 'Unknown User';
    if (announcement.author.name && announcement.author.surname) {
      return `${announcement.author.name} ${announcement.author.surname}`;
    }
    return announcement.author.username;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
        {error}
      </div>
    );
  }

  if (announcements.length === 0) {
    return (
      <div className="text-center p-8 bg-gray-50 rounded-lg">
        {t.announcements.noAnnouncements || 'No announcements available'}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {announcements.map((announcement) => (
        <div key={announcement.id} className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-start gap-4">
            <UserAvatar 
              userId={announcement.authorId} 
              size={40} 
            />
            <div className="flex-grow">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{announcement.title}</h3>
                  <p className="text-sm text-gray-600">
                    {getAuthorDisplayName(announcement)} • {new Date(announcement.date).toLocaleDateString()}
                  </p>
                </div>
                {user && (user.id === announcement.authorId || user.publicMetadata?.role === 'admin') && (
                  <button
                    onClick={() => {/* handleDeleteAnnouncement(announcement.id) */}}
                    className="p-1 hover:bg-red-100 rounded-full transition-colors"
                    title="Delete announcement"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-red-500"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                )}
              </div>
              <div className="mt-4 text-gray-700">
                {announcement.description}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}