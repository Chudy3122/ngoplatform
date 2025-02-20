"use client";

import { useEffect } from 'react';
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

interface DashboardLayoutProps {
 children: React.ReactNode;
 params: { lang: string };
}

export default function DashboardLayout({ children, params }: DashboardLayoutProps) {
 const { user, isLoaded } = useUser();
 const router = useRouter();

 useEffect(() => {
   const initUser = async () => {
     if (user?.id) {
       try {
         const response = await fetch('/api/user/init', { 
           method: 'POST',
           headers: {
             'Content-Type': 'application/json'
           }
         });
         
         if (!response.ok) {
           console.error('Failed to initialize user:', await response.text());
           // Możesz dodać obsługę błędów, np. przekierowanie do strony logowania
           // router.push(`/${params.lang}/login`);
         }
       } catch (error) {
         console.error('Error initializing user:', error);
       }
     }
   };

   if (isLoaded && !user) {
     // Jeśli użytkownik nie jest zalogowany, przekieruj do strony logowania
     router.push(`/${params.lang}/login`);
   } else if (isLoaded && user) {
     initUser();
   }
 }, [user, isLoaded, params.lang, router]);

 // Pokaż loading state podczas ładowania
 if (!isLoaded) {
   return (
     <div className="flex items-center justify-center min-h-screen">
       <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
     </div>
   );
 }

 // Nie renderuj children jeśli nie ma użytkownika
 if (!user) {
   return null;
 }

 return <>{children}</>;
}