"use client";

import React from 'react';
import { ExternalLink, Video, Users, Shield } from 'lucide-react';
import Image from 'next/image';
import { useTranslations } from "@/hooks/useTranslations";
import { useParams } from "next/navigation";

type PlatformId = 'googleMeet' | 'zoom' | 'teams' | 'webex';

interface Platform {
  id: PlatformId;
  url: string;
  logo: string;
  buttonColor: string;
}

// Zaktualizowany interfejs z readonly arrays
interface PlatformTranslations {
  [key: string]: {
    name: string;
    description: string;
    features: readonly string[];  // Dodane readonly
    bestFor: string;
  }
}

export default function VideoCommunication() {
  const t = useTranslations();
  const params = useParams();
  const lang = params?.lang as string || 'pl';

  const platforms: Platform[] = [
    {
      id: 'googleMeet',
      url: 'https://meet.google.com',
      logo: '/platformy/google-meet-logo.png',
      buttonColor: 'bg-blue-500'
    },
    {
      id: 'zoom',
      url: 'https://zoom.us',
      logo: '/platformy/zoom-logo.png',
      buttonColor: 'bg-blue-600'
    },
    {
      id: 'teams',
      url: 'https://teams.microsoft.com',
      logo: '/platformy/teams-logo.png',
      buttonColor: 'bg-purple-600'
    },
    {
      id: 'webex',
      url: 'https://webex.com',
      logo: '/platformy/webex-logo.png',
      buttonColor: 'bg-green-600'
    }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-8 text-center">{t.videoCommunication.title}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {platforms.map((platform) => {
           const platformTranslations = (t.videoCommunication.platforms as PlatformTranslations)[platform.id];
          return (
            <div key={platform.id} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 relative">
                    <Image 
                      src={platform.logo}
                      alt={platformTranslations.name}
                      fill
                      className="object-contain"
                    />
                  </div>
                  <h2 className="text-xl font-semibold">
                    {platformTranslations.name}
                  </h2>
                </div>
                <a 
                  href={platform.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={`${platform.buttonColor} text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:opacity-90 transition-opacity`}
                >
                  <div className="w-6 h-6 relative">
                    <Image 
                      src={platform.logo}
                      alt={platformTranslations.name}
                      fill
                      className="object-contain brightness-0 invert"
                    />
                  </div>
                  {t.videoCommunication.joinNow}
                </a>
              </div>
              
              <p className="text-gray-600 mb-4">
                {platformTranslations.description}
              </p>
              
              <div className="mb-4">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Shield className="w-4 h-4" /> {t.videoCommunication.keyFeatures}:
                </h3>
                <ul className="list-disc list-inside text-gray-600">
                  {platformTranslations.features.map((feature: string, index: number) => (
                    <li key={index} className="mb-1">{feature}</li>
                  ))}
                </ul>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-800 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  {platformTranslations.bestFor}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}