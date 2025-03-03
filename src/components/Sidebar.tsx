"use client";

import React from 'react';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import { useUser } from '@clerk/nextjs';

interface SidebarProps {
  onOpenChat?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onOpenChat }) => {
  const { user } = useUser();
  const params = useParams();
  const lang = params?.lang as string;
  const pathname = usePathname();
  
  // Pobieranie roli z metadanych użytkownika
  const role = user?.publicMetadata?.role as string;
  
  // Elementy menu w zależności od roli
  const menuItems = [
    {
      title: "Dashboard",
      path: `/${lang}/dashboard`, // Uniwersalna ścieżka dashboard
      roles: ["admin", "student", "teacher", "parent"],
    },
    {
      title: "Teachers",
      path: `/${lang}/list/teachers`,
      roles: ["admin"],
    },
    {
      title: "Students",
      path: `/${lang}/list/students`,
      roles: ["admin"],
    },
    {
      title: "Parents",
      path: `/${lang}/list/parents`,
      roles: ["admin"],
    },
    {
      title: "Classes",
      path: `/${lang}/list/classes`,
      roles: ["admin"],
    },
    {
      title: "Grades",
      path: `/${lang}/list/grades`,
      roles: ["admin", "teacher", "student", "parent"],
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