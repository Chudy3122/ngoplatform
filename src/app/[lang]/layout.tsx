// /src/app/[lang]/layout.tsx
"use client";

import { useEffect } from 'react';
import { useUser } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Menu from "@/components/Menu";
import Navbar from "@/components/Navbar";

interface DashboardLayoutProps {
  children: React.ReactNode;
  params: { lang: string };
}

export default function DashboardLayout({ children, params }: DashboardLayoutProps) {
  const { user, isLoaded } = useUser();
  const pathname = usePathname();
  const isLoginPage = pathname?.includes('/login');

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

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  // Dla strony logowania, wyświetl tylko dzieci bez menu
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Dla pozostałych stron, wyświetl pełny layout z menu
  return (
    <div className="h-screen flex">
      {/* LEFT */}
      <div className="w-[14%] md:w-[8%] lg:w-[16%] xl:w-[14%] p-4">
        <Link
          href={`/${params.lang}`}
          className="flex items-center justify-center lg:justify-start gap-2"
        >
          <Image src="/logo.png" alt="logo" width={32} height={32} />
          <span className="hidden lg:block font-bold">NGO-Platform</span>
        </Link>
        <Menu lang={params.lang} />
      </div>
      
      {/* RIGHT */}
      <div className="w-[86%] md:w-[92%] lg:w-[84%] xl:w-[86%] bg-[#F7F8FA] overflow-scroll flex flex-col">
        <Navbar />
        {children}
      </div>
    </div>
  );
}