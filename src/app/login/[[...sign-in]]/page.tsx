"use client";

import { SignIn } from "@clerk/nextjs";
import { useParams } from "next/navigation";
import { useTranslations } from "@/hooks/useTranslations";

export default function LoginPage() {
 const params = useParams();
 const lang = params?.lang as string;
 const t = useTranslations();

 return (
   <div className="h-screen flex items-center justify-center bg-lamaSkyLight">
     <SignIn 
       afterSignInUrl={`/${lang}/admin`}
       appearance={{
         elements: {
           rootBox: "bg-white p-8 rounded-lg shadow-xl",
           card: {
             boxShadow: "none",
             width: "400px", 
             margin: "0"
           },
           headerTitle: {
             text: t.auth.signIn
           },
           headerSubtitle: {
             text: t.auth.signInSubtitle
           },
           formButtonPrimary: 
             "bg-blue-500 hover:bg-blue-600 text-sm normal-case",
         },
       }}
     />
   </div>
 );
}