"use client";

import { useTranslations } from "@/hooks/useTranslations";
import { useEffect, useState } from "react";

interface NewsArticle {
  title: string;
  description: string;
  publishedAt: string;
  url: string;
  urlToImage?: string;
  source: {
    name: string;
    favicon?: string;
  };
}

const CATEGORIES = [
  { id: 'country', label: 'country', icon: '📊' },
  { id: 'technology', label: 'technology', icon: '💻' },
  { id: 'science', label: 'science', icon: '🔬' },
  { id: 'energy', label: 'energy', icon: '⚡' }
] as const;

const categoryColors: Record<string, string> = {
  country: 'bg-gradient-to-br from-lamaPurple/20 to-lamaPurple/10',
  technology: 'bg-gradient-to-br from-lamaYellow/20 to-lamaYellow/10',
  science: 'bg-gradient-to-br from-lamaSky/20 to-lamaSky/10',
  energy: 'bg-gradient-to-br from-green-200/20 to-green-200/10',
  error: 'bg-gradient-to-br from-red-100/20 to-red-100/10'
};

const NewsCard = ({ article, category, t }: { article: NewsArticle; category: string; t: any }) => (
  <div className={`flex flex-col p-6 rounded-lg ${categoryColors[category]} hover:scale-[1.02] transition-all duration-200 border border-gray-100 shadow-sm h-full`}>
    {article.urlToImage && (
      <div className="relative w-full h-40 mb-4 rounded-md overflow-hidden">
        <img
          src={article.urlToImage}
          alt={article.title}
          className="object-cover w-full h-full"
        />
      </div>
    )}
    <div className="flex justify-between items-start mb-3">
      <div className="flex items-center gap-2">
        {article.source?.favicon && (
          <img 
            src={article.source.favicon} 
            alt={article.source.name} 
            className="w-4 h-4"
          />
        )}
        <span className="text-xs bg-white px-3 py-1.5 rounded-full text-gray-600 font-medium shadow-sm">
          {article.source?.name}
        </span>
      </div>
      <span className="text-xs text-gray-500">
        {new Date(article.publishedAt).toLocaleDateString('pl-PL', {
          day: '2-digit',
          month: 'short'
        })}
      </span>
    </div>
    <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2 min-h-[48px]">
      {article.title}
    </h3>
    <p className="text-sm text-gray-600 line-clamp-2 mb-4 flex-grow">
      {article.description}
    </p>
    <div className="flex justify-between items-center mt-auto pt-4 border-t border-gray-100">
      <span className="text-xs text-gray-500">
        {CATEGORIES.find(c => c.id === category)?.icon} {t.news.categories[category as keyof typeof t.news.categories]}
      </span>
      <a 
        href={article.url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs bg-white px-3 py-1.5 rounded-full text-gray-600 hover:bg-gray-50 transition-colors shadow-sm"
      >
        {t.news.readMore} →
      </a>
    </div>
  </div>
);

export default function NewsDashboard() {
  const t = useTranslations();
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('country');

  const fetchNews = async () => {
    try {
      setIsLoading(true);
      // Dodajemy timestamp do URL aby zapobiec cachowaniu
      const timestamp = new Date().getTime();
      const response = await fetch(`/api/news?category=${selectedCategory}&t=${timestamp}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      
      if (!response.ok) {
        throw new Error('Nie udało się pobrać newsów');
      }

      const data = await response.json();
      
      // Sprawdzamy czy mamy artykuły i czy są w poprawnym formacie
      if (data.articles && Array.isArray(data.articles)) {
        setNews(data.articles);
        setError(null);
      } else {
        throw new Error('Nieprawidłowy format danych');
      }
    } catch (err) {
      console.error('Błąd podczas pobierania newsów:', err);
      setError(err instanceof Error ? err.message : 'Wystąpił nieznany błąd');
      
      // Próbujemy ponownie maksymalnie 3 razy
      if (retryCount < 3) {
        setRetryCount(prev => prev + 1);
        setTimeout(fetchNews, 1000);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
    // Resetujemy licznik prób przy zmianie kategorii
    return () => setRetryCount(0);
  }, [selectedCategory]);

  if (isLoading) {
    return (
      <div className="mb-8">
        <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
          {CATEGORIES.map((category) => (
            <div key={category.id} className="h-10 bg-gray-200 rounded-full w-32 animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="p-6 rounded-lg bg-gray-50 animate-pulse">
              <div className="h-40 bg-gray-200 rounded-lg mb-4" />
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/4" />
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error && retryCount >= 3) {
    return (
      <div className="bg-red-50 border border-red-100 rounded-lg p-6 text-center">
        <p className="text-red-600 mb-2">Nie udało się załadować newsów</p>
        <p className="text-sm text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
        {CATEGORIES.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`px-4 py-2.5 rounded-full text-sm transition-all flex items-center gap-2
              ${selectedCategory === category.id
                ? 'bg-white text-gray-800 shadow-md scale-105'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
          >
            <span>{category.icon}</span>
            {t.news.categories[category.id as keyof typeof t.news.categories]}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {news.map((article, index) => (
          <NewsCard 
            key={index}
            article={article}
            category={selectedCategory}
            t={t}
          />
        ))}
      </div>
    </div>
  );
}