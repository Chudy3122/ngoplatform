"use client";

import { useState } from "react";
import { Trash } from "lucide-react";

interface DeleteAnnouncementButtonProps {
  id: number;
}

const DeleteAnnouncementButton = ({ id }: DeleteAnnouncementButtonProps) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (confirm(`Czy na pewno chcesz usunąć to ogłoszenie?`)) {
      try {
        setIsDeleting(true);
        
        // Wywołanie endpointu w formacie /api/announcements/{id}
        const response = await fetch(`/api/announcements/${id}`, {
          method: "DELETE",
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });
        
        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.error || "Błąd usuwania ogłoszenia");
        }

        alert("Ogłoszenie zostało usunięte");
        window.location.reload();
      } catch (error) {
        console.error("Błąd podczas usuwania:", error);
        alert(error instanceof Error ? error.message : "Błąd podczas usuwania ogłoszenia");
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="text-red-500 hover:text-red-700 p-1 rounded transition-colors disabled:opacity-50"
      aria-label="Usuń ogłoszenie"
    >
      <Trash size={16} />
    </button>
  );
};

export default DeleteAnnouncementButton;