"use client";

import { useEffect } from 'react';
import { useUser } from "@clerk/nextjs";

interface DashboardLayoutProps {
  children: React.ReactNode;
  params: { lang: string };
}

export default function DashboardLayout({ children, params }: DashboardLayoutProps) {
  const { user } = useUser();

  useEffect(() => {
    const initUser = async () => {
      if (user?.id) {
        try {
          const response = await fetch('/api/user/init', { 
            method: 'POST',
          });
          
          if (!response.ok) {
            console.error('Failed to initialize user:', await response.text());
          }
        } catch (error) {
          console.error('Error initializing user:', error);
        }
      }
    };

    initUser();
  }, [user]);

  return <>{children}</>;
}