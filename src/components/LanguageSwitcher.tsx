"use client";

import { useParams, usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import { useState } from 'react';

const LanguageSwitcher = () => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname() || '';
  const params = useParams();
  const currentLang = (params?.lang as string) || 'pl';
  
  const languages = [
    { code: 'pl', name: 'Polski', flag: '/pl-flag.png' },
    { code: 'en', name: 'English', flag: '/en-flag.png' }
  ];

  const changeLanguage = (language: string) => {
    const newPath = pathname?.replace(`/${currentLang}`, `/${language}`) || `/${language}`;
    router.push(newPath);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        data-guide="language-switcher"
        className="flex items-center gap-2 bg-white rounded-full p-2 hover:bg-gray-100"
      >
        <Image 
          src={languages.find(lang => lang.code === currentLang)?.flag || '/language.png'} 
          alt="language" 
          width={20} 
          height={20} 
        />
        <span className="hidden md:block text-sm">
          {languages.find(lang => lang.code === currentLang)?.name}
        </span>
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 bg-white rounded-md shadow-lg p-2 z-50">
          {languages.map((language) => (
            <button
              key={language.code}
              onClick={() => changeLanguage(language.code)}
              className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm hover:bg-gray-100 rounded-md"
            >
              <Image src={language.flag} alt={language.name} width={20} height={20} />
              {language.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;