"use client";

import React from 'react';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import { useUser } from '@/context/AuthContext';

interface SidebarProps {
  onOpenChat?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onOpenChat }) => {
  const { user } = useUser();
  const params = useParams();
  const lang = params?.lang as string;
  const pathname = usePathname();
  
  // Pobieranie roli z sesji użytkownika
  const role = user?.role as string;
  
  // Elementy menu w zależności od roli
  const menuItems = [
    {
      title: "Dashboard",
      path: `/${lang}/dashboard`, // Uniwersalna ścieżka dashboard
      roles: ["ADMIN", "MANAGER", "USER"],
    },
    {
      title: "Teachers",
      path: `/${lang}/list/teachers`,
      roles: ["ADMIN"],
    },
    {
      title: "Students",
      path: `/${lang}/list/students`,
      roles: ["ADMIN"],
    },
    {
      title: "Parents",
      path: `/${lang}/list/parents`,
      roles: ["ADMIN"],
    },
    {
      title: "Classes",
      path: `/${lang}/list/classes`,
      roles: ["ADMIN"],
    },
    {
      title: "Grades",
      path: `/${lang}/list/grades`,
      roles: ["ADMIN", "MANAGER", "USER"],
    },
    // Dodaj pozostałe elementy menu
  ];
  
  // Filtrowanie elementów menu w zależności od roli
  const filteredMenuItems = role 
    ? menuItems.filter(item => item.roles.includes(role))
    : [];

  return (
    <nav className="bg-gray-800 text-white w-64 min-h-screen p-4">
      {/* Elementy menu */}
      <div className="mb-6">
        {filteredMenuItems.map((item) => (
          <Link key={item.path} href={item.path}>
            <div className={`flex items-center space-x-2 p-2 rounded-md w-full mb-2 ${
              pathname === item.path ? 'bg-gray-700' : 'hover:bg-gray-700'
            }`}>
              <span>{item.title}</span>
            </div>
          </Link>
        ))}
      </div>
      
      {/* Przycisk czatu jeśli dostępny */}
      {onOpenChat && (
        <button
          onClick={onOpenChat}
          className="flex items-center space-x-2 hover:bg-gray-700 p-2 rounded-md w-full"
        >
          <span>Messages</span>
        </button>
      )}
    </nav>
  );
};

export default Sidebar;