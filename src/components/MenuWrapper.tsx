'use client';

import dynamic from 'next/dynamic';
import { useParams } from 'next/navigation';

const Menu = dynamic(() => import('./Menu'), {
  ssr: false
});

export default function MenuWrapper() {
  const params = useParams();
  const lang = params?.lang as string || 'pl'; // domyślnie 'pl' jeśli nie ma parametru

  return <Menu lang={lang} />;
}