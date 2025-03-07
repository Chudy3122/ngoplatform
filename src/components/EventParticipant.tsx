// src/components/EventParticipant.tsx
"use client";

import { useState, useEffect } from 'react';
import { useUser } from "@clerk/nextjs";

interface UserData {
  id: string;
  username: string;
  name?: string;
  surname?: string;
  img?: string;
  type?: string;
}

export function EventParticipant({ userId, size = 24 }: { userId: string, size?: number }) {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();

  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }
      
      // Jeśli to bieżący użytkownik z Clerk, użyj jego danych
      if (user && user.id === userId) {
        setUserData({
          id: user.id,
          username: user.username || user.id,
          name: user.firstName || undefined,
          surname: user.lastName || undefined,
          img: user.imageUrl
        });
        setLoading(false);
        return;
      }
      
      try {
        const response = await fetch(`/api/userprofile?id=${encodeURIComponent(userId)}`);
        
        if (response.ok) {
          const data = await response.json();
          setUserData(data);
        } else {
          // Jeśli odpowiedź nie jest ok, ustaw domyślne dane
          setUserData({ 
            id: userId,
            username: 'Unknown User'
          });
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setUserData({ 
          id: userId,
          username: 'Unknown User'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId, user]);

  const getUserDisplayName = () => {
    if (!userData) return 'Unknown User';
    if (userData.name && userData.surname) return `${userData.name} ${userData.surname}`;
    return userData.username;
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex-shrink-0">
        <img
          src={userData?.img || "/noAvatar.png"}
          alt={getUserDisplayName()}
          className="rounded-full object-cover"
          style={{ width: `${size}px`, height: `${size}px` }}
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/noAvatar.png";
          }}
        />
      </div>
      <span className="text-sm">{loading ? "Loading..." : getUserDisplayName()}</span>
    </div>
  );
}