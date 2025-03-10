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
        
        // Użyj nowego endpointu z metodą POST
        const response = await fetch('/api/custom-delete', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ postId: id }),
        });
        
        if (!response.ok) {
          throw new Error("Błąd usuwania ogłoszenia");
        }

        alert("Ogłoszenie zostało usunięte");
        window.location.reload();
      } catch (error) {
        console.error("Błąd podczas usuwania:", error);
        alert("Nie udało się usunąć ogłoszenia");
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