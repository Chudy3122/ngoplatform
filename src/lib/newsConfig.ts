// lib/newsConfig.ts
export const NEWS_SOURCES = {
  country: [
    {
      url: 'https://www.rmf24.pl/feed',  // Changed from polityka.pl
      name: 'RMF24',
      favicon: 'https://www.rmf24.pl/favicon.ico'
    },
    {
      url: 'https://www.polsatnews.pl/rss/all.xml',  // Changed from wp.pl
      name: 'Polsat News',
      favicon: 'https://www.polsatnews.pl/favicon.ico'
    },
  ],
  technology: [  // zmienione z 'technologia'
    {
      url: 'https://www.telepolis.pl/feed',
      name: 'Telepolis',
      favicon: 'https://www.telepolis.pl/favicon.ico'
    },
    {
      url: 'https://www.chip.pl/feed',
      name: 'Chip',
      favicon: 'https://www.chip.pl/favicon.ico'
    },
  ],
  science: [  // zmienione z 'nauka'
    {
      url: 'https://kopalniawiedzy.pl/rss.xml',
      name: 'Kopalnia Wiedzy',
      favicon: 'https://kopalniawiedzy.pl/favicon.ico'
    },
    {
      url: 'https://www.crazynauka.pl/feed/',
      name: 'Crazy Nauka',
      favicon: 'https://www.crazynauka.pl/favicon.ico'
    },
  ],
  energy: [  // to już jest ok
    {
      url: 'https://wysokienapiecie.pl/feed/',
      name: 'Wysokie Napięcie',
      favicon: 'https://wysokienapiecie.pl/favicon.ico'
    },
    {
      url: 'https://energetyka24.com/rss/rss.xml',
      name: 'Energetyka24',
      favicon: 'https://energetyka24.com/favicon.ico'
    },
  ],
} as const;

// Dodajmy też stałą CATEGORIES, którą możemy eksportować i używać w obu miejscach
export const CATEGORIES = [
  { id: 'country', label: 'country', icon: '📊' },
  { id: 'technology', label: 'technology', icon: '💻' },
  { id: 'science', label: 'science', icon: '🔬' },
  { id: 'energy', label: 'energy', icon: '⚡' }
] as const;

export type NewsCategory = typeof CATEGORIES[number]['id'];