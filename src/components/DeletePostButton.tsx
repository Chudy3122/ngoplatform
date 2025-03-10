"use client";

import { useState } from "react";
import { Trash } from "lucide-react";

interface DeletePostButtonProps {
  postId: number;
  onPostDeleted?: () => void;
}

export default function DeletePostButton({ postId, onPostDeleted }: DeletePostButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Czy na pewno chcesz usunąć ten post?`)) {
      return;
    }

    try {
      setIsDeleting(true);
      
      // Dodajemy timestamp dla uniknięcia cachowania
      const timestamp = new Date().getTime();
      const response = await fetch(`/api/posts?id=${postId}&t=${timestamp}`, {
        method: "DELETE",
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || "Failed to delete post");
      }

      alert("Post został usunięty");
      
      // Wywołaj callback jeśli istnieje
      if (onPostDeleted) {
        onPostDeleted();
      } else {
        // W przeciwnym razie odśwież stronę
        window.location.reload();
      }
      
    } catch (error) {
      console.error("Error deleting post:", error);
      alert(error instanceof Error ? error.message : "Error deleting post");
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
      title="Usuń post"
    >
      <Trash size={16} />
      {isDeleting && <span className="ml-1">Usuwanie...</span>}
    </button>
  );
}