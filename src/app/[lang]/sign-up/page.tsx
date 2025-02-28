"use client";

import { SignUp } from "@clerk/nextjs";
import { useParams } from "next/navigation";

export default function SignUpPage() {
  const params = useParams();
  const lang = params?.lang as string;

  return (
    <div className="h-screen flex items-center justify-center bg-lamaSkyLight">
      <SignUp 
        path={`/${lang}/sign-up`}  // Upewnij się, że ta ścieżka jest poprawna
        routing="path"
        afterSignUpUrl={`/${lang}/admin`}
        appearance={{
          elements: {
            rootBox: "bg-white p-8 rounded-lg shadow-xl",
            card: {
              boxShadow: "none",
              width: "400px", 
              margin: "0"
            },
            headerTitle: {
              text: "Create Account"
            },
            headerSubtitle: {
              text: "Sign up for NGO Platform"
            },
            formButtonPrimary: 
              "bg-blue-500 hover:bg-blue-600 text-sm normal-case",
          },
        }}
      />
    </div>
  );
}