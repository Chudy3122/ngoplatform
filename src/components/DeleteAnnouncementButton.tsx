"use client";

import { useState } from "react";
import { Trash } from "lucide-react";
import { useRouter } from "next/navigation";

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
          throw new Error("Błąd usuwania ogłoszenia");
        }

        alert("Ogłoszenie zostało usunięte");
        router.refresh();
      } catch (error) {
        console.error("Błąd:", error);
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