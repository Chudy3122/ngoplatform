"use client";

import { useEffect } from 'react';
import { useUser } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

interface DashboardLayoutProps {
 children: React.ReactNode;
 params: { lang: string };
}

export default function DashboardLayout({ children, params }: DashboardLayoutProps) {
 const { user, isLoaded } = useUser();
 const router = useRouter();

 useEffect(() => {
   if (isLoaded && !user) {
     // Jeśli użytkownik nie jest zalogowany, przekieruj do strony logowania
     router.push(`/${params.lang}/login`);
   }
 }, [user, isLoaded, params.lang, router]);

 // Pokaż loading state podczas ładowania
 if (!isLoaded) {
   return (
     <div className="flex items-center justify-center min-h-screen bg-slate-50">
       <div className="flex flex-col items-center gap-3">
         <div className="w-10 h-10 rounded-full animate-spin" style={{ border: "3px solid #E0E7FF", borderTopColor: "#4F46E5" }} />
         <p className="text-sm text-slate-400">Ładowanie...</p>
       </div>
     </div>
   );
 }

 // Nie renderuj children jeśli nie ma użytkownika
 if (!user) {
   return null;
 }

 return <>{children}</>;
}