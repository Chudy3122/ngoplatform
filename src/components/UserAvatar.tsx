// src/components/UserAvatar.tsx
"use client";

import { useState, useEffect } from 'react';

export default function UserAvatar({ userId, size = 40 }: { userId: string, size?: number }) {
  const [imgSrc, setImgSrc] = useState<string>("/noAvatar.png");

  useEffect(() => {
    const fetchAvatar = async () => {
      if (!userId) return;

      try {
        const response = await fetch(`/api/users/status?userId=${encodeURIComponent(userId)}`);

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
  }, [userId]);

  return (
    <div style={{ width: `${size}px`, height: `${size}px`, flexShrink: 0 }}>
      <img
        src={imgSrc}
        alt="avatar"
        className="w-full h-full object-cover rounded-full"
        onError={() => setImgSrc("/noAvatar.png")}
      />
    </div>
  );
}