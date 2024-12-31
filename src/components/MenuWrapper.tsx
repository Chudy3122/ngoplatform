// components/MenuWrapper.tsx
'use client';

import dynamic from 'next/dynamic';

const Menu = dynamic(() => import('./Menu'), {
  ssr: false
});

export default function MenuWrapper() {
  return <Menu />;
}