// components/financing/FinancingModule.tsx
"use client";

import Image from 'next/image';
import { Mail, Phone } from 'lucide-react';
import { useTranslations } from "@/hooks/useTranslations";

export default function FinancingModule() {
  const t = useTranslations();

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Logo and Header */}
      <div className="flex items-center justify-between bg-white p-6 rounded-lg shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{t.financing.title}</h1>
          <p className="text-gray-600 mt-2">{t.financing.subtitle}</p>
        </div>
        <Image 
          src="/itcomplete-logo.jpg" 
          alt="ITComplete Logo" 
          width={150} 
          height={150}
          className="hidden md:block"
        />
      </div>

      {/* Donation Section */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          {t.financing.support.title}
        </h2>
        <p className="text-gray-600 mb-6">
          {t.financing.support.description}
        </p>
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-medium text-blue-900 mb-2">
            {t.financing.support.bankDetails.title}
          </h3>
          <div className="space-y-2 text-blue-800">
            <p>{t.financing.support.bankDetails.name}</p>
            <p>{t.financing.support.bankDetails.account}</p>
            <p>{t.financing.support.bankDetails.transferTitle}</p>
          </div>
        </div>
      </div>

      {/* Custom Platform Section */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          {t.financing.customPlatform.title}
        </h2>
        <p className="text-gray-600 mb-6">
          {t.financing.customPlatform.description}
        </p>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-lg">
            <Phone className="text-blue-600" />
            <div>
              <p className="text-sm text-gray-500">{t.financing.customPlatform.contact.phone}</p>
              <p className="font-medium">+48 XXX XXX XXX</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-lg">
            <Mail className="text-blue-600" />
            <div>
              <p className="text-sm text-gray-500">{t.financing.customPlatform.contact.email}</p>
              <p className="font-medium">kontakt@itcomplete.pl</p>
            </div>
          </div>
        </div>
      </div>

      {/* Company Info */}
      <div className="text-center text-gray-500 text-sm pt-8 pb-4">
        <p>© 2024 ITComplete - Marcin Rokoszewski</p>
        <p>Wszystkie prawa zastrzeżone</p>
      </div>
    </div>
  );
}