// app/[lang]/home/page.tsx
"use client";

import dynamic from 'next/dynamic';
import Topbar from "@/components/topbar/page";
import Sidebar from "@/components/Sidebar";
import "./Home.css";

// Renderujemy komponent tylko po stronie klienta
const Home = () => {
  return (
    <>
      <Topbar />
      <div className="homeContainer">
        <Sidebar />
      </div>
    </>
  );
};

// Eksportujemy komponent z wyłączonym SSR
export default dynamic(() => Promise.resolve(Home), {
  ssr: false
});