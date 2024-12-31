import * as cheerio from 'cheerio';

export function extractImageFromContent(content: string | undefined): string | null {
  if (!content) return null;
  
  try {
    const $ = cheerio.load(content);
    const img = $('img').first();
    return img.attr('src') || null;
  } catch {
    return null;
  }
}

export function sanitizeHtml(html: string | undefined): string {
  if (!html) return '';
  
  // Usuń tagi HTML
  const text = html.replace(/<[^>]*>/g, '');
  // Usuń nadmiarowe spacje
  return text.replace(/\s+/g, ' ').trim();
}

export function formatDate(dateString: string | undefined): string {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('pl-PL', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return '';
  }
}