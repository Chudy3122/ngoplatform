// DeletePostButton.tsx - całkowicie nowa implementacja
"use client";

import { useState } from "react";
import { Trash } from "lucide-react";

interface DeletePostButtonProps {
  postId: number;
}

export default function DeletePostButton({ postId }: DeletePostButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Czy na pewno chcesz usunąć ten post?")) {
      return;
    }

    try {
      setIsDeleting(true);
      
      // Używamy metody POST zamiast DELETE
      const response = await fetch('/api/custom-delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ postId })
      });

      if (!response.ok) {
        throw new Error("Nie udało się usunąć posta");
      }

      // Odświeżamy stronę po udanym usunięciu
      window.location.reload();
    } catch (error) {
      console.error("Błąd podczas usuwania:", error);
      alert("Nie udało się usunąć posta");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="text-red-500 hover:text-red-700 p-1 rounded transition-colors disabled:opacity-50"
      aria-label="Usuń post"
    >
      <Trash size={16} />
    </button>
  );
}