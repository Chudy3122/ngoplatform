// src/components/UserAvatar.tsx
"use client";

import { useState, useEffect } from 'react';
import { useUser } from "@clerk/nextjs";

export default function UserAvatar({ userId, size = 40 }: { userId: string, size?: number }) {
  const [imgSrc, setImgSrc] = useState<string>("/noAvatar.png");
  const { user } = useUser();

  useEffect(() => {
    const fetchAvatar = async () => {
      if (!userId) return;
      
      // Jeśli to jest bieżący użytkownik z Clerk, użyj bezpośrednio jego zdjęcia
      if (user && user.id === userId && user.imageUrl) {
        setImgSrc(user.imageUrl);
        return;
      }
      
      try {
        const response = await fetch(`/api/userprofile?id=${encodeURIComponent(userId)}`);
        
        if (response.ok) {
          const data = await response.json();
          if (data?.img) {
            setImgSrc(data.img);
          }
        }
      } catch (error) {
        console.error("Error fetching avatar:", error);
      }
    };

    fetchAvatar();
  }, [userId, user]);

  return (
    <div className="messageImg" style={{ width: `${size}px`, height: `${size}px` }}>
      <img
        src={imgSrc}
        alt="avatar"
        className="w-full h-full object-cover rounded-full"
        onError={() => setImgSrc("/noAvatar.png")}
      />
    </div>
  );
}