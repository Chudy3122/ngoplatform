import React from 'react';

interface SidebarProps {
  onOpenChat: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onOpenChat }) => {
  return (
    <nav className="bg-gray-800 text-white w-64 min-h-screen p-4">
      {/* Inne elementy menu */}
      <button
        onClick={onOpenChat}
        className="flex items-center space-x-2 hover:bg-gray-700 p-2 rounded-md w-full"
      >
        <svg /* ikona wiadomości */ />
        <span>Messages</span>
      </button>
      {/* Pozostałe elementy menu */}
    </nav>
  );
};

export default Sidebar;