import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Pobierz dane z ostatnich 14 dni
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 14);

    // Formatuj daty do formatu YYYY-MM-DD
    const formatDate = (date: Date) => {
      return date.toISOString().split('T')[0];
    };

    const url = `https://api.raporty.pse.pl/api/ogr-rmb?filter=business_date ge '${formatDate(startDate)}' and business_date le '${formatDate(endDate)}'`;

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
      next: { revalidate: 3600 } // Cache na godzinę
    });

    if (!response.ok) {
      throw new Error('Failed to fetch data from PSE');
    }

    const rawData = await response.json();
    console.log('Raw PSE data:', rawData); // Debug log

    // Przekształć dane do naszego formatu
    const processedData = Array.isArray(rawData.data) 
      ? rawData.data.map((item: any) => ({
          time: new Date(item.business_date).toISOString(),
          price: parseFloat(item.price || 0),
          volume: parseFloat(item.volume || 0)
        }))
      : [];

    return NextResponse.json(processedData);
  } catch (error) {
    console.error('Error fetching energy prices:', error);
    
    // W razie błędu, zwróć dane mockowe żeby UI nie padł
    const mockData = Array.from({ length: 24 }, (_, i) => ({
      time: new Date(Date.now() - (24 - i) * 3600 * 1000).toISOString(),
      price: 200 + Math.random() * 300,
      volume: 50 + Math.random() * 100
    }));

    return NextResponse.json(mockData);
  }
}