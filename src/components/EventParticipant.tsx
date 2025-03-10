// src/components/EventParticipant.tsx
"use client";

import { useState, useEffect } from 'react';
import UserAvatar from '@/components/UserAvatar';

interface EventParticipantProps {
  userId: string;
  size?: number;
}

export function EventParticipant({ userId, size = 24 }: EventParticipantProps) {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/userprofile?id=${encodeURIComponent(userId)}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch user data: ${response.status}`);
        }
        
        const data = await response.json();
        setUserData(data);
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to load user data');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUserData();
    }
  }, [userId]);

  // Funkcja do generowania wyświetlanej nazwy uczestnika
  const getDisplayName = () => {
    if (loading) return 'Ładowanie...';
    if (error || !userData) return 'Nieznany użytkownik';
    
    if (userData.name && userData.surname) {
      return `${userData.name} ${userData.surname}`;
    }
    
    return userData.username;
  };

  return (
    <div className="flex items-center gap-2">
      <div className="mr-1">
        <UserAvatar userId={userId} size={size} />
      </div>
      <span className="text-sm">{getDisplayName()}</span>
    </div>
  );
}