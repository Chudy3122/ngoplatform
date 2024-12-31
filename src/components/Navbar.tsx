// /components/Navbar.tsx
"use client";

import { UserButton, useUser } from "@clerk/nextjs";
import Image from "next/image";
import LanguageSwitcher from "./LanguageSwitcher";
import { useTranslations } from "@/hooks/useTranslations";
import GuideButton from "./GuideButton";

const Navbar = () => {
  const t = useTranslations();
  const { user } = useUser();
  
  return (
    <div className="flex items-center justify-between p-4">
      <div className="flex items-center gap-6 justify-end w-full">
        {/* Przycisk przewodnika */}
        <GuideButton />
        
        {/* Language Switcher */}
        <LanguageSwitcher />
        
        {/* User Info */}
        <div className="flex flex-col">
          <span className="text-xs leading-3 font-medium">
            {user?.firstName} {user?.lastName}
          </span>
          <span className="text-[10px] text-gray-500 text-right">
            {user?.publicMetadata?.role as string}
          </span>
        </div>
        <UserButton />
      </div>
    </div>
  );
};

export default Navbar;