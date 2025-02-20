"use client";

import React from 'react';

interface SidebarProps {
  onOpenChat?: () => void;  // Zrobione opcjonalnym
}

const Sidebar: React.FC<SidebarProps> = ({ onOpenChat }) => {
  return (
    <nav className="bg-gray-800 text-white w-64 min-h-screen p-4">
      {onOpenChat && (  // Renderujemy przycisk tylko jeśli props istnieje
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