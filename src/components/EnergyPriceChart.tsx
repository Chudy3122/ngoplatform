"use client";

import { useTranslations } from "@/hooks/useTranslations";
import { useEffect, useState } from "react";
import {
 ComposedChart,
 Area,
 Bar,
 XAxis,
 YAxis,
 CartesianGrid,
 Tooltip,
 ResponsiveContainer,
} from "recharts";

interface PriceDataPoint {
 time: string;
 price: number;
 volume: number;
}

interface CustomLegendProps {
 t: ReturnType<typeof useTranslations>;
}

const CustomLegend = ({ t }: CustomLegendProps) => {
 return (
   <div className="flex items-center justify-end gap-6 mb-4 text-sm">
     <div className="flex items-center gap-2">
       <div className="w-3 h-3 bg-[#2DD4BF]"></div>
       <span className="text-gray-600">{t.energyChart.legend.price}</span>
     </div>
     <div className="flex items-center gap-2">
       <div className="w-3 h-3 bg-[#FAE27C]"></div>
       <span className="text-gray-600">{t.energyChart.legend.volume}</span>
     </div>
   </div>
 );
};

const EnergyPriceChart = () => {
 const t = useTranslations();
 const [data, setData] = useState<PriceDataPoint[]>([]);
 const [isLoading, setIsLoading] = useState(true);
 const [error, setError] = useState<string | null>(null);
 const [retryCount, setRetryCount] = useState(0);

 useEffect(() => {
   const fetchData = async () => {
     try {
       setIsLoading(true);
       const response = await fetch('/api/energy-prices');
       
       if (!response.ok) {
         throw new Error(t.energyChart.error);
       }
       
       const rawData = await response.json();
       
       if (!Array.isArray(rawData) || rawData.length === 0) {
         throw new Error(t.energyChart.error);
       }

       const sortedData = [...rawData].sort((a, b) => 
         new Date(a.time).getTime() - new Date(b.time).getTime()
       );

       const processedData = sortedData.map((item: any) => ({
         time: new Date(item.time).toLocaleDateString('pl-PL', {
           day: '2-digit',
           month: '2-digit',
           hour: '2-digit',
           minute: '2-digit'
         }),
         price: Number(item.price?.toFixed(2) || 0),
         volume: Number(item.volume?.toFixed(2) || 0)
       }));

       setData(processedData);
       setError(null);
       setRetryCount(0);
     } catch (err) {
       const errorMessage = err instanceof Error ? err.message : t.energyChart.error;
       setError(errorMessage);
       console.error('Error fetching data:', err);
       
       if (retryCount < 3) {
         setTimeout(() => {
           setRetryCount(prev => prev + 1);
         }, 5000);
       }
     } finally {
       setIsLoading(false);
     }
   };

   fetchData();
   const interval = setInterval(fetchData, 300000);
   return () => clearInterval(interval);
 }, [retryCount, t]);

 if (isLoading) {
   return (
     <div className="bg-white p-4 rounded-lg h-[500px] flex items-center justify-center">
       <div className="text-gray-500">{t.energyChart.loading}</div>
     </div>
   );
 }

 if (error) {
   return (
     <div className="bg-white p-4 rounded-lg h-[500px] flex flex-col items-center justify-center gap-4">
       <div className="text-red-500">{error}</div>
       {retryCount < 3 && (
         <div className="text-sm text-gray-500">
           {t.energyChart.retry} ({retryCount + 1}/3)
         </div>
       )}
     </div>
   );
 }

 return (
   <div className="bg-white p-4 rounded-lg">
     <div className="mb-8">
       <h2 className="text-xl font-semibold">{t.energyChart.title}</h2>
       <p className="text-sm text-gray-500 mt-1">{t.energyChart.subtitle}</p>
     </div>

     <CustomLegend t={t} />
     
     <div className="h-[500px]">
       <ResponsiveContainer width="100%" height="100%">
         <ComposedChart
           data={data}
           margin={{ top: 30, right: 40, left: 0, bottom: 20 }}
         >
           <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#eee" />
           <XAxis 
             dataKey="time" 
             axisLine={false}
             tickLine={false}
             tick={{ fill: '#666', fontSize: 12 }}
             dy={10}
             interval={2}
           />
           <YAxis 
             yAxisId="left"
             orientation="left"
             axisLine={false}
             tickLine={false}
             tick={{ fill: '#666', fontSize: 12 }}
             domain={[0, 'auto']}
             tickCount={8}
           />
           <YAxis 
             yAxisId="right"
             orientation="right"
             axisLine={false}
             tickLine={false}
             tick={{ fill: '#666', fontSize: 12 }}
             domain={[0, 'auto']}
           />
           <Tooltip 
             contentStyle={{ 
               backgroundColor: 'white',
               border: '1px solid #eee',
               borderRadius: '4px'
             }}
             formatter={(value: number, name: string) => [
               value.toFixed(2),
               name === 'price' ? t.energyChart.legend.price : t.energyChart.legend.volume
             ]}
             labelFormatter={(label) => `${t.energyChart.legend.date}: ${label}`}
           />
           <Area
             yAxisId="left"
             type="monotone"
             dataKey="price"
             name="price"
             stroke="#2DD4BF"
             fill="#E2FBFA"
             strokeWidth={2}
             dot={false}
           />
           <Bar
             yAxisId="right"
             dataKey="volume"
             name="volume"
             fill="#FAE27C"
             radius={[2, 2, 0, 0]}
           />
         </ComposedChart>
       </ResponsiveContainer>
     </div>
     <div className="text-xs text-gray-400 mt-4 text-right">
       {t.energyChart.source}
     </div>
   </div>
 );
};

export default EnergyPriceChart;