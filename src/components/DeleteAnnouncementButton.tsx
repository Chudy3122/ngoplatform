"use client";

import { useState } from "react";
import { Trash } from "lucide-react";
import { useRouter } from "next/navigation";
// Zamienmy toast na zwykły alert, skoro nie masz zainstalowanego react-hot-toast

interface DeleteAnnouncementButtonProps {
  id: number;
}

const DeleteAnnouncementButton = ({ id }: DeleteAnnouncementButtonProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (confirm("Czy na pewno chcesz usunąć to ogłoszenie?")) {
      try {
        setIsDeleting(true);

        const response = await fetch(`/api/announcements?id=${id}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Błąd usuwania ogłoszenia");
        }

        alert("Ogłoszenie zostało usunięte");
        router.refresh(); // Odświeżenie strony, aby zaktualizować listę ogłoszeń
      } catch (error) {
        console.error("Błąd usuwania ogłoszenia:", error);
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
      className="text-red-500 hover:text-red-700 p-1 rounded transition-colors"
      aria-label="Usuń ogłoszenie"
    >
      <Trash size={16} />
    </button>
  );
};

export default DeleteAnnouncementButton;