"use client";

import { useState, useEffect } from 'react';
import { useTranslations } from '@/hooks/useTranslations';
import UserAvatar from '@/components/UserAvatar';
import { useAuth } from '@clerk/nextjs';

// Wspólny typ dla obu modeli
type Post = {
  id: number;
  title: string;
  content?: string;  // z modelu Post
  description?: string;  // z modelu Announcement
  createdAt?: Date | string;  // z modelu Post
  date?: Date | string;  // z modelu Announcement
  authorId?: string;
};

type AuthorInfo = {
  id: string;
  name?: string;
  surname?: string;
  username: string;
  img?: string;
  loading: boolean;
};

const Announcements = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [authorsInfo, setAuthorsInfo] = useState<Record<string, AuthorInfo>>({});
  const [loading, setLoading] = useState(true);
  const t = useTranslations();
  const { userId } = useAuth();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        console.log("Fetching posts...");
        const response = await fetch('/api/posts?limit=3');
        if (!response.ok) {
          console.error("Failed to fetch posts:", response.status, response.statusText);
          throw new Error('Nie udało się pobrać postów');
        }
        
        const data = await response.json();
        console.log("Posts data:", data);
        setPosts(data);
        
        // Pobierz informacje o autorach (tylko jeśli są authorId)
        data.forEach((post: Post) => {
          if (post.authorId) {
            fetchAuthorInfo(post.authorId);
          }
        });
      } catch (error) {
        console.error('Błąd podczas pobierania postów:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPosts();
  }, []);

  const fetchAuthorInfo = async (authorId: string) => {
    if (authorsInfo[authorId]?.loading) return;
    
    console.log("Fetching author info for:", authorId);
    setAuthorsInfo(prev => ({
      ...prev,
      [authorId]: { id: authorId, username: 'Ładowanie...', loading: true }
    }));
    
    try {
      const response = await fetch(`/api/userprofile?id=${encodeURIComponent(authorId)}`);
      console.log("Author API response status:", response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log("Author data:", data);
        setAuthorsInfo(prev => ({
          ...prev,
          [authorId]: { ...data, loading: false }
        }));
      } else {
        console.error("Error fetching author:", response.statusText);
        setAuthorsInfo(prev => ({
          ...prev,
          [authorId]: { id: authorId, username: 'Nieznany użytkownik', loading: false }
        }));
      }
    } catch (error) {
      console.error('Błąd podczas pobierania informacji o autorze:', error);
      setAuthorsInfo(prev => ({
        ...prev,
        [authorId]: { id: authorId, username: 'Nieznany użytkownik', loading: false }
      }));
    }
  };

  const getAuthorDisplayName = (authorId?: string) => {
    if (!authorId) return 'Nieznany użytkownik';
    
    const author = authorsInfo[authorId];
    if (!author) return 'Ładowanie...';
    if (author.loading) return 'Ładowanie...';
    
    if (author.name && author.surname) {
      return `${author.name} ${author.surname}`;
    }
    
    return author.username;
  };

  const deletePost = async (postId: number) => {
    if (confirm('Czy na pewno chcesz usunąć ten post?')) {
      try {
        console.log("Deleting post:", postId);
        const response = await fetch(`/api/posts/${postId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        console.log("Delete response:", response.status, response.statusText);
        
        if (response.ok) {
          setPosts(prev => prev.filter(post => post.id !== postId));
          alert('Post został pomyślnie usunięty');
        } else {
          let errorMessage = 'Nie udało się usunąć posta';
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorMessage;
          } catch (e) {
            console.error("Failed to parse error response:", e);
          }
          
          alert(errorMessage);
        }
      } catch (error) {
        console.error('Błąd podczas usuwania posta:', error);
        alert('Wystąpił błąd podczas usuwania posta.');
      }
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-4 rounded-md">
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-md">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Ogłoszenia</h1>
      </div>
      <div className="flex flex-col gap-4 mt-4">
        {posts.map((post, index) => {
          const bgColor = index === 0 ? "bg-lamaSkyLight" : 
                          index === 1 ? "bg-lamaPurpleLight" : 
                          "bg-lamaYellowLight";
          
          // Obsługa obu modeli danych
          const content = post.content || post.description || '';
          const dateStr = post.createdAt 
            ? (typeof post.createdAt === 'string' ? post.createdAt : post.createdAt.toISOString())
            : post.date 
              ? (typeof post.date === 'string' ? post.date : post.date.toISOString())
              : '';
          
          return (
            <div key={post.id} className={`${bgColor} rounded-md p-4`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {post.authorId && (
                    <UserAvatar 
                      userId={post.authorId} 
                      size={32} 
                    />
                  )}
                  <div>
                    <h2 className="font-medium">{post.title}</h2>
                    {post.authorId && (
                      <div className="text-xs text-gray-500">
                        {getAuthorDisplayName(post.authorId)}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400 bg-white rounded-md px-1 py-1">
                    {dateStr ? new Date(dateStr).toLocaleDateString() : ''}
                  </span>
                  
                  {/* Przycisk usuwania - pokaż dla wszystkich na razie */}
                  <button 
                    onClick={() => deletePost(post.id)}
                    className="text-red-500 hover:text-red-700 text-xs bg-white rounded-md px-2 py-1"
                  >
                    Usuń
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-400 mt-1">{content}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Announcements;