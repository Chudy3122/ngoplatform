// app/api/posts/controller.ts
// Ten moduł zawiera logikę, która będzie współdzielona między różnymi endpointami API

import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

/**
 * Usuwa post o określonym identyfikatorze
 * @param postId ID posta do usunięcia
 * @returns Informacja o sukcesie lub błędzie
 */
export async function deletePost(postId: number) {
  try {
    console.log("Rozpoczynam usuwanie posta o ID:", postId);
    
    // Sprawdzenie uprawnień użytkownika
    const authData = await auth();
    const userId = authData.userId;
    
    if (!userId) {
      console.log("Brak autoryzacji - brak userId");
      return { 
        success: false, 
        status: 401, 
        error: "Unauthorized" 
      };
    }
    
    // Sprawdź rolę użytkownika
    const { sessionClaims } = authData;
    const role = (sessionClaims?.metadata as { role?: string })?.role;
    const isAdmin = role === "admin";
    
    console.log("User ID:", userId, "Rola:", role, "Admin:", isAdmin);
    
    // Sprawdź czy post istnieje
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });
    
    if (!post) {
      console.log("Post nie znaleziony:", postId);
      return { 
        success: false, 
        status: 404, 
        error: "Post not found" 
      };
    }
    
    console.log("Znaleziony post:", post);
    
    // Admin może usuwać wszystkie posty, autor tylko swoje
    if (post.authorId !== userId && !isAdmin) {
      console.log("Brak uprawnień do usunięcia posta");
      return { 
        success: false, 
        status: 403, 
        error: "Unauthorized - only post owner or admin can delete" 
      };
    }
    
    console.log("Usuwanie powiązanych danych i posta...");
    
    // Usuń wszystkie powiązane dane
    try {
      // Usuń reakcje
      await prisma.reaction.deleteMany({
        where: { postId }
      });
      console.log("Usunięto reakcje");
      
      // Usuń komentarze
      await prisma.comment.deleteMany({
        where: { postId }
      });
      console.log("Usunięto komentarze");
      
      // Usuń post
      await prisma.post.delete({
        where: { id: postId }
      });
      console.log("Usunięto post");
    } catch (deleteError) {
      console.error("Błąd podczas usuwania danych:", deleteError);
      throw deleteError;
    }
    
    console.log("Post został pomyślnie usunięty");
    
    return { 
      success: true,
      status: 200,
      message: "Post deleted successfully",
      id: postId
    };
  } catch (error) {
    console.error("Błąd usuwania posta:", error);
    return { 
      success: false, 
      status: 500, 
      error: "Failed to delete post",
      details: error instanceof Error ? error.message : "Unknown error"
    };
  }
}