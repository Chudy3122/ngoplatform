import { NextResponse } from 'next/server';
import Parser from 'rss-parser';
import { NEWS_SOURCES, NewsCategory } from '@/lib/newsConfig';
import { extractImageFromContent, sanitizeHtml, formatDate } from '@/lib/newsUtils';

interface NewsItem {
  title?: string;
  content?: string;
  contentSnippet?: string;
  link?: string | null;
  pubDate?: string;
  enclosure?: {
    url: string;
  } | null;
  sourceName?: string;
  sourceFavicon?: string;
}

interface NewsArticle {
  title: string;
  description: string;
  category: NewsCategory;
  publishedAt: string;
  url: string;
  urlToImage?: string;
  source: {
    name: string;
    favicon: string;
  };
}

interface NewsSource {
  url: string;
  name: string;
  favicon: string;
}

const parser: Parser = new Parser({
  customFields: {
    item: ['creator', 'content', 'enclosure'],
  },
  timeout: 5000,
  requestOptions: {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
  }
});

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryParam = searchParams.get('category');
    const category = categoryParam && categoryParam in NEWS_SOURCES 
      ? categoryParam as NewsCategory 
      : 'country' as const;
    
    const sources = NEWS_SOURCES[category];
    const feedPromises = sources.map(async (source: NewsSource) => {
      try {
        const feed = await parser.parseURL(source.url);
        return feed.items.map((item): NewsItem => ({
          ...item,
          sourceName: source.name,
          sourceFavicon: source.favicon,
        }));
      } catch (error) {
        console.warn(`Error fetching from ${source.name}:`, error);
        return [];
      }
    });
    
    type FeedResult = PromiseFulfilledResult<NewsItem[]>;
    
    const results = await Promise.allSettled(feedPromises);
    const successfulResults = results
      .filter((result): result is FeedResult => result.status === 'fulfilled')
      .map((result: FeedResult) => result.value)
      .flat();

    if (successfulResults.length === 0) {
      const fallbackArticle: NewsArticle = {
        title: "Could not fetch news at the moment",
        description: "Please try again later",
        category,
        publishedAt: new Date().toISOString(),
        url: "#",
        source: { 
          name: "System",
          favicon: "/favicon.ico"
        }
      };
      return NextResponse.json({ articles: [fallbackArticle] });
    }

    const articles: NewsArticle[] = successfulResults
      .map((item: NewsItem): NewsArticle | null => {
        if (!item.title || !item.sourceName || !item.sourceFavicon) return null;
        
        const url = typeof item.link === 'string' ? item.link : '#';
        const image = item.enclosure?.url || extractImageFromContent(item.content || '');
        const urlToImage = typeof image === 'string' ? image : undefined;
        
        return {
          title: item.title,
          description: sanitizeHtml(item.contentSnippet || item.content || ''),
          category,
          publishedAt: formatDate(item.pubDate || new Date().toISOString()),
          url,
          urlToImage,
          source: { 
            name: item.sourceName,
            favicon: item.sourceFavicon
          }
        };
      })
      .filter((article): article is NewsArticle => article !== null)
      .sort((a: NewsArticle, b: NewsArticle) => 
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      )
      .slice(0, 4);

    return NextResponse.json({ articles }, {
      headers: { 
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
      },
    });

  } catch (error) {
    const errorArticle: NewsArticle = {
      title: "Error loading news",
      description: "Please try again later",
      category: 'country',
      publishedAt: new Date().toISOString(),
      url: "#",
      source: { 
        name: "System",
        favicon: "/favicon.ico"
      }
    };
    return NextResponse.json({ articles: [errorArticle] });
  }
}