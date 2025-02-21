import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

type PSEDataItem = {
  business_date: string;
  price?: string;
  volume?: string;
};

export async function GET() {
  try {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 14);

    const formatDate = (date: Date) => {
      return date.toISOString().split('T')[0];
    };

    // Poprawiony format filtra zgodnie z dokumentacją PSE
    const filter = `business_date ge ${formatDate(startDate)} and business_date le ${formatDate(endDate)}`;
    const url = `https://api.raporty.pse.pl/api/ogr-rmb?$filter=${encodeURIComponent(filter)}`;

    console.log('Requesting URL:', url); // Do debugowania

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0',
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('PSE API error response:', errorText);
      throw new Error(`PSE API responded with status: ${response.status}`);
    }

    const rawData = await response.json();

    if (!rawData || !Array.isArray(rawData.value)) {
      throw new Error('Invalid data format received from PSE');
    }

    const processedData = rawData.value
      .filter((item: PSEDataItem) => item.price && item.volume)
      .map((item: PSEDataItem) => ({
        time: new Date(item.business_date).toISOString(),
        price: parseFloat(item.price || '0'),
        volume: parseFloat(item.volume || '0')
      }));

    if (processedData.length === 0) {
      // Jeśli nie ma danych, zwracamy dane mockowe
      const mockData = Array.from({ length: 24 }, (_, i) => ({
        time: new Date(Date.now() - (24 - i) * 3600 * 1000).toISOString(),
        price: 200 + Math.random() * 100,
        volume: 1000 + Math.random() * 500
      }));
      
      return NextResponse.json(mockData);
    }

    return NextResponse.json(processedData);

  } catch (error) {
    console.error('Error fetching energy prices:', error);
    
    // W przypadku błędu zwracamy dane mockowe
    const mockData = Array.from({ length: 24 }, (_, i) => ({
      time: new Date(Date.now() - (24 - i) * 3600 * 1000).toISOString(),
      price: 200 + Math.random() * 100,
      volume: 1000 + Math.random() * 500
    }));

    return NextResponse.json(mockData);
  }
}