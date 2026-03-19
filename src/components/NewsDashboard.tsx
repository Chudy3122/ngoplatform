"use client";

import { useTranslations } from "@/hooks/useTranslations";
import { useEffect, useState, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CATEGORIES, type NewsCategory } from "@/lib/newsConfig";

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

const categoryColors: Record<NewsCategory, string> = {
  country:     "bg-gradient-to-br from-purple-50  to-white",
  business:    "bg-gradient-to-br from-blue-50    to-white",
  technology:  "bg-gradient-to-br from-yellow-50  to-white",
  science:     "bg-gradient-to-br from-sky-50     to-white",
  sport:       "bg-gradient-to-br from-orange-50  to-white",
  culture:     "bg-gradient-to-br from-pink-50    to-white",
  environment: "bg-gradient-to-br from-emerald-50 to-white",
  education:   "bg-gradient-to-br from-indigo-50  to-white",
  innovation:  "bg-gradient-to-br from-violet-50  to-white",
  energy:      "bg-gradient-to-br from-green-50   to-white",
};

interface NewsCardProps {
  article: NewsArticle;
  category: NewsCategory;
  t: ReturnType<typeof useTranslations>;
}

const NewsCard = ({ article, category, t }: NewsCardProps) => (
  <div className={`flex flex-col p-5 rounded-xl ${categoryColors[category]} hover:shadow-md transition-all duration-200 border border-slate-200 h-full`}>
    {article.urlToImage && (
      <div className="relative w-full h-36 mb-4 rounded-lg overflow-hidden">
        <img src={article.urlToImage} alt={article.title} className="object-cover w-full h-full" />
      </div>
    )}
    <div className="flex justify-between items-center mb-2.5">
      <div className="flex items-center gap-1.5">
        {article.source?.favicon && (
          <img src={article.source.favicon} alt={article.source.name} className="w-3.5 h-3.5 rounded-sm" />
        )}
        <span className="text-[11px] bg-white border border-slate-200 px-2.5 py-0.5 rounded-full text-slate-600 font-medium">
          {article.source?.name}
        </span>
      </div>
      <span className="text-[11px] text-slate-400">{article.publishedAt}</span>
    </div>
    <h3 className="text-[13px] font-semibold text-slate-800 mb-2 line-clamp-2 leading-snug">
      {article.title}
    </h3>
    <p className="text-[12px] text-slate-500 line-clamp-2 mb-4 flex-grow leading-relaxed">
      {article.description}
    </p>
    <div className="flex justify-between items-center mt-auto pt-3 border-t border-slate-200">
      <span className="text-[11px] text-slate-400">
        {CATEGORIES.find(c => c.id === category)?.icon} {t.news.categories[category]}
      </span>
      <a
        href={article.url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[12px] text-indigo-600 font-medium hover:underline transition-colors"
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
  const [selectedCategory, setSelectedCategory] = useState<NewsCategory>('country');
  const categoriesRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (categoriesRef.current) {
      categoriesRef.current.scrollTo({
        left: categoriesRef.current.scrollLeft + (direction === 'left' ? -200 : 200),
        behavior: 'smooth'
      });
    }
  };

  const fetchNews = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/news?category=${selectedCategory}&t=${Date.now()}`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' }
      });
      if (!response.ok) throw new Error('Nie udało się pobrać newsów');
      const data = await response.json();
      if (data.articles && Array.isArray(data.articles)) {
        setNews(data.articles);
        setError(null);
      } else {
        throw new Error('Nieprawidłowy format danych');
      }
    } catch (err) {
      console.error('Błąd podczas pobierania newsów:', err);
      setError(err instanceof Error ? err.message : 'Wystąpił nieznany błąd');
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
    return () => setRetryCount(0);
  }, [selectedCategory]);

  if (isLoading) {
    return (
      <div className="mb-6">
        <div className="flex gap-2 mb-5 overflow-x-auto pb-2 hide-scrollbar">
          {CATEGORIES.map((c) => (
            <div key={c.id} className="h-8 bg-slate-200 rounded-full w-24 animate-pulse flex-shrink-0" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="p-5 rounded-xl bg-slate-50 border border-slate-200 animate-pulse">
              <div className="h-36 bg-slate-200 rounded-lg mb-4" />
              <div className="space-y-2">
                <div className="h-3 bg-slate-200 rounded w-1/4" />
                <div className="h-3 bg-slate-200 rounded w-3/4" />
                <div className="h-3 bg-slate-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error && retryCount >= 3) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-5 text-center mb-6">
        <p className="text-sm font-medium text-red-600 mb-1">Nie udało się załadować newsów</p>
        <p className="text-xs text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <div className="relative">
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white border border-slate-200 rounded-full p-1 shadow-sm hover:bg-slate-50 transition-colors"
        >
          <ChevronLeft className="w-4 h-4 text-slate-500" />
        </button>

        <div ref={categoriesRef} className="flex gap-2 mb-5 overflow-x-auto pb-2 px-8 scroll-smooth hide-scrollbar">
          {CATEGORIES.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-3.5 py-1.5 rounded-full text-[13px] font-medium transition-all flex items-center gap-1.5 flex-shrink-0
                ${selectedCategory === category.id
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
            >
              <span>{category.icon}</span>
              {t.news.categories[category.id]}
            </button>
          ))}
        </div>

        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white border border-slate-200 rounded-full p-1 shadow-sm hover:bg-slate-50 transition-colors"
        >
          <ChevronRight className="w-4 h-4 text-slate-500" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {news.map((article, index) => (
          <NewsCard key={index} article={article} category={selectedCategory} t={t} />
        ))}
      </div>
    </div>
  );
}
