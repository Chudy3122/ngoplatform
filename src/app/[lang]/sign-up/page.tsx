// /src/app/[lang]/sign-up/[[...sign-up]]/page.tsx
"use client";

import { SignUp } from "@clerk/nextjs";
import { useParams } from "next/navigation";
import { useTranslations } from "@/hooks/useTranslations";

export default function SignUpPage() {
  const params = useParams();
  const lang = params?.lang as string;
  const t = useTranslations();

  return (
    <div className="h-screen flex items-center justify-center bg-lamaSkyLight">
      <SignUp 
        path={`/${lang}/sign-up`}
        routing="path"
        afterSignUpUrl={`/${lang}/dashboard`} // Przekierowanie na dashboard
        signInUrl={`/${lang}/login`}
        appearance={{
          elements: {
            rootBox: "bg-white p-8 rounded-lg shadow-xl",
            card: {
              boxShadow: "none",
              width: "400px", 
              margin: "0"
            },
            headerTitle: {
              text: "Create Account" // Używamy stałego tekstu zamiast tłumaczenia
            },
            headerSubtitle: {
              text: "Sign up for NGO Platform" // Używamy stałego tekstu zamiast tłumaczenia
            },
            formButtonPrimary: 
              "bg-blue-500 hover:bg-blue-600 text-sm normal-case",
          },
        }}
      />
    </div>
  );
}