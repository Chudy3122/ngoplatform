export const NEWS_SOURCES = {
  country: [
    {
      url: 'https://www.rmf24.pl/feed',
      name: 'RMF24',
      favicon: 'https://www.rmf24.pl/favicon.ico'
    },
    {
      url: 'https://tvn24.pl/najnowsze.xml',
      name: 'TVN24',
      favicon: 'https://tvn24.pl/favicon.ico'
    }
  ],
  business: [
    {
      url: 'https://www.bankier.pl/rss/wiadomosci.xml',
      name: 'Bankier.pl',
      favicon: 'https://www.bankier.pl/favicon.ico'
    },
    {
      url: 'https://businessinsider.com.pl/feed',
      name: 'Business Insider',
      favicon: 'https://businessinsider.com.pl/favicon.ico'
    }
  ],
  technology: [
    {
      url: 'https://antyweb.pl/feed',
      name: 'AntyWeb',
      favicon: 'https://antyweb.pl/favicon.ico'
    },
    {
      url: 'https://www.instalki.pl/feed',
      name: 'Instalki',
      favicon: 'https://www.instalki.pl/favicon.ico'
    }
  ],
  science: [
    {
      url: 'https://www.crazynauka.pl/feed/',
      name: 'Crazy Nauka',
      favicon: 'https://www.crazynauka.pl/favicon.ico'
    },
    {
      url: 'https://www.focus.pl/feed',
      name: 'Focus',
      favicon: 'https://www.focus.pl/favicon.ico'
    }
  ],
  sport: [
    {
      url: 'https://www.goal.pl/feed/',
      name: 'Goal.pl',
      favicon: 'https://www.goal.pl/favicon.ico'
    },
    {
      url: 'https://przegladsportowy.onet.pl/rss.xml',
      name: 'Przegląd Sportowy',
      favicon: 'https://przegladsportowy.onet.pl/favicon.ico'
    }
  ],
  culture: [
    {
      url: 'https://www.granice.pl/rss/news',
      name: 'Granice.pl',
      favicon: 'https://www.granice.pl/favicon.ico'
    },
    {
      url: 'https://kulturacja.pl/feed/',
      name: 'Kulturacja',
      favicon: 'https://kulturacja.pl/favicon.ico'
    }
  ],
  environment: [
    {
      url: 'https://smoglab.pl/feed/',
      name: 'Smog Lab',
      favicon: 'https://smoglab.pl/favicon.ico'
    },
    {
      url: 'https://swiatoze.pl/feed/',
      name: 'Świat OZE',
      favicon: 'https://swiatoze.pl/favicon.ico'
    }
  ],
  education: [
    {
      url: 'https://www.oswiatowe.pl/feed/',
      name: 'Portal Oświatowy',
      favicon: 'https://www.oswiatowe.pl/favicon.ico'
    },
    {
      url: 'https://glos.pl/feed',
      name: 'Głos Nauczycielski',
      favicon: 'https://glos.pl/favicon.ico'
    }
  ],
  innovation: [
    {
      url: 'https://www.startupacademy.pl/feed/',
      name: 'Startup Academy',
      favicon: 'https://www.startupacademy.pl/favicon.ico'
    },
    {
      url: 'https://mambiznes.pl/feed',
      name: 'Mam Biznes',
      favicon: 'https://mambiznes.pl/favicon.ico'
    }
  ],
  energy: [
    {
      url: 'https://wysokienapiecie.pl/feed/',
      name: 'Wysokie Napięcie',
      favicon: 'https://wysokienapiecie.pl/favicon.ico'
    },
    {
      url: 'https://biznesalert.pl/feed/',
      name: 'BiznesAlert',
      favicon: 'https://biznesalert.pl/favicon.ico'
    }
  ]
} as const;

export const CATEGORIES = [
  { id: 'country', label: 'country', icon: '📊' },
  { id: 'business', label: 'business', icon: '💼' },
  { id: 'technology', label: 'technology', icon: '💻' },
  { id: 'science', label: 'science', icon: '🔬' },
  { id: 'sport', label: 'sport', icon: '⚽' },
  { id: 'culture', label: 'culture', icon: '🎭' },
  { id: 'environment', label: 'environment', icon: '🌍' },
  { id: 'education', label: 'education', icon: '📚' },
  { id: 'innovation', label: 'innovation', icon: '💡' },
  { id: 'energy', label: 'energy', icon: '⚡' }
] as const;

export type NewsCategory = typeof CATEGORIES[number]['id'];