import { NextResponse } from 'next/server';

// Dodajemy oznaczenie, że to endpoint dynamiczny
export const dynamic = 'force-dynamic';

// Dodajemy typ dla danych PSE
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

    const url = `https://api.raporty.pse.pl/api/ogr-rmb?filter=business_date ge '${formatDate(startDate)}' and business_date le '${formatDate(endDate)}'`;

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
      next: { revalidate: 3600 }
    });

    if (!response.ok) {
      throw new Error(`PSE API responded with status: ${response.status}`);
    }

    const rawData = await response.json();

    if (!rawData || !rawData.data || !Array.isArray(rawData.data)) {
      throw new Error('Invalid data format received from PSE');
    }

    const processedData = rawData.data.map((item: PSEDataItem) => ({
      time: new Date(item.business_date).toISOString(),
      price: parseFloat(item.price || '0'),
      volume: parseFloat(item.volume || '0')
    }));

    return NextResponse.json(processedData);

  } catch (error) {
    console.error('Error fetching energy prices:', error);
    
    // Tworzenie danych mockowych z bardziej realistycznymi wartościami
    const mockData = Array.from({ length: 24 }, (_, i) => ({
      time: new Date(Date.now() - (24 - i) * 3600 * 1000).toISOString(),
      price: 200 + Math.random() * 100, // Bardziej realistyczny zakres cen
      volume: 1000 + Math.random() * 500 // Bardziej realistyczny zakres wolumenu
    }));

    // Zwracamy kod 200, ale z danymi mockowymi i flagą indicating error
    return NextResponse.json({
      data: mockData,
      isError: true,
      errorMessage: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
}