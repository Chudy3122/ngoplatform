// src/components/UserAvatar.tsx
"use client";

import { useState, useEffect } from 'react';

interface UserData {
  id: string;
  username: string;
  name: string;
  surname?: string;
  img?: string | null;
  type: 'admin' | 'teacher' | 'student' | 'parent';
}

export default function UserAvatar({ userId, size = 40 }: { userId: string, size?: number }) {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId) return;
      
      console.log(`Attempting to fetch data for user: ${userId}`);
      
      try {
        setLoading(true);
        
        // Najpierw sprawdźmy, czy endpoint testowy działa
        try {
          const testResponse = await fetch('/api/test');
          if (testResponse.ok) {
            const testData = await testResponse.json();
            console.log('Test endpoint works:', testData);
          } else {
            console.error('Test endpoint failed:', await testResponse.text());
          }
        } catch (testError) {
          console.error('Test endpoint error:', testError);
        }
        
        // Spróbujmy z zakodowanym URL
        const encodedUserId = encodeURIComponent(userId);
        const url = `/api/user/profile/${encodedUserId}`;
        console.log(`Fetching from URL: ${url}`);
        
        const response = await fetch(url);
        
        console.log(`Response status: ${response.status}`);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Error response text: ${errorText}`);
          throw new Error(`Failed to fetch user data: ${response.status} - ${errorText}`);
        }
        
        const data = await response.json();
        console.log(`User data received:`, data);
        setUserData(data);
      } catch (err: any) {
        console.error('Detailed error:', err);
        setError(err.message || 'Failed to load user data');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUserData();
    }
  }, [userId]);

  const getDisplayName = () => {
    if (!userData) return 'Unknown';
    if (userData.type === 'admin') return userData.name || userData.username;
    return userData.name && userData.surname 
      ? `${userData.name} ${userData.surname}` 
      : userData.username;
  };

  if (loading) {
    return (
      <div 
        className="rounded-full bg-gray-200 flex items-center justify-center"
        style={{ width: `${size}px`, height: `${size}px` }}
      >
        <span className="text-gray-400 text-xs">...</span>
      </div>
    );
  }

  if (error || !userData) {
    return (
      <div 
        className="messageImg"
        style={{ width: `${size}px`, height: `${size}px` }}
      >
        <img src="/noAvatar.png" alt="avatar" className="w-full h-full object-cover rounded-full" />
      </div>
    );
  }

  // Jeśli użytkownik ma zdjęcie profilowe
  if (userData.img) {
    return (
      <div 
        className="messageImg"
        style={{ width: `${size}px`, height: `${size}px` }}
      >
        <img 
          src={userData.img}
          alt={`${getDisplayName()} profile`}
          className="w-full h-full object-cover rounded-full"
          onError={(e) => {
            e.currentTarget.src = "/noAvatar.png";
          }}
        />
      </div>
    );
  }

  // Fallback do domyślnego avatara
  return (
    <div 
      className="messageImg"
      style={{ width: `${size}px`, height: `${size}px` }}
    >
      <img src="/noAvatar.png" alt="avatar" className="w-full h-full object-cover rounded-full" />
    </div>
  );
}