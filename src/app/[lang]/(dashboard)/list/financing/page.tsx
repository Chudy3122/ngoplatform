// app/[lang]/financing/page.tsx
import FinancingModule from '@/components/financing/FinancingModule';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ITComplete - Finansowanie',
  description: 'Wesprzyj rozwój platformy NGO',
};

export default function FinancingPage() {
  return (
    <div className="p-4 bg-[#F7F8FA] min-h-screen">
      <FinancingModule />
    </div>
  );
}