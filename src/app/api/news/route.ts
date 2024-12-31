// /api/news/route.ts
import { NextResponse } from 'next/server';
import Parser from 'rss-parser';
import { NEWS_SOURCES, NewsCategory } from '@/lib/newsConfig';
import { extractImageFromContent, sanitizeHtml, formatDate } from '@/lib/newsUtils';

const parser: Parser = new Parser({
  customFields: {
    item: ['creator', 'content', 'enclosure'],
  },
  timeout: 5000, // Add timeout
  requestOptions: {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
  }
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = (searchParams.get('category') || 'country') as NewsCategory;
    
    const sources = NEWS_SOURCES[category] || NEWS_SOURCES.country;
    const feedPromises = sources.map(async source => {
      try {
        const feed = await parser.parseURL(source.url);
        return feed.items.map(item => ({
          ...item,
          sourceName: source.name,
          sourceFavicon: source.favicon,
        }));
      } catch (error) {
        console.warn(`Error fetching from ${source.name}:`, error);
        return []; // Return empty array instead of failing completely
      }
    });
    
    // Use Promise.allSettled instead of Promise.all to handle partial failures
    const results = await Promise.allSettled(feedPromises);
    const successfulResults = results
      .filter((result): result is PromiseFulfilledResult<any[]> => result.status === 'fulfilled')
      .map(result => result.value)
      .flat();

    // Provide fallback data if no news could be fetched
    if (successfulResults.length === 0) {
      return NextResponse.json({
        articles: [{
          title: "Could not fetch news at the moment",
          description: "Please try again later",
          category,
          publishedAt: new Date().toISOString(),
          url: "#",
          source: { 
            name: "System",
            favicon: "/favicon.ico"
          }
        }]
      });
    }

    const articles = successfulResults
      .map(item => ({
        title: item.title,
        description: sanitizeHtml(item.contentSnippet || item.content),
        category,
        publishedAt: formatDate(item.pubDate),
        url: item.link,
        urlToImage: item.enclosure?.url || extractImageFromContent(item.content),
        source: { 
          name: item.sourceName,
          favicon: item.sourceFavicon
        }
      }))
      .filter(article => article.title && article.description)
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      .slice(0, 4);

    return NextResponse.json({ articles }, {
      headers: { 
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
      },
    });

  } catch (error) {
    console.error('Error fetching news:', error);
    return NextResponse.json({
      articles: [{
        title: "Error loading news",
        description: "Please try again later",
        category: 'country',
        publishedAt: new Date().toISOString(),
        url: "#",
        source: { 
          name: "System",
          favicon: "/favicon.ico"
        }
      }]
    });
  }
}