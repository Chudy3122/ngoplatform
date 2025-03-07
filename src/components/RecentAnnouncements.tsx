"use client";

import { useState, useEffect } from 'react';
import { useTranslations } from '@/hooks/useTranslations';
import Link from 'next/link';
import UserAvatar from '@/components/UserAvatar';
import { useUser } from '@clerk/nextjs';

// Definicja typu Post
type Author = {
  id: string;
  name?: string;
  surname?: string;
  username?: string;
  img?: string;
};

type Post = {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  authorId: string;
  author?: Author;
};

export default function RecentAnnouncements() {
  const t = useTranslations();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();
  const [authorsInfo, setAuthorsInfo] = useState<Record<string, Author & {loading: boolean}>>({});

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch('/api/posts?limit=3');
        if (!response.ok) throw new Error('Failed to fetch posts');
        const data = await response.json();
        setPosts(data);
        
        // Fetch author info for each post
        data.forEach((post: Post) => {
          if (post.authorId) {
            fetchAuthorInfo(post.authorId);
          }
        });
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const fetchAuthorInfo = async (authorId: string) => {
    // If we're already loading data for this author, don't fetch again
    if (authorsInfo[authorId]?.loading) return;
    
    // Mark that we've started fetching data
    setAuthorsInfo(prev => ({
      ...prev,
      [authorId]: { id: authorId, username: 'Loading...', loading: true }
    }));
    
    try {
      const response = await fetch(`/api/userprofile?id=${encodeURIComponent(authorId)}`);
      
      if (response.ok) {
        const data = await response.json();
        // Save the fetched data
        setAuthorsInfo(prev => ({
          ...prev,
          [authorId]: { ...data, loading: false }
        }));
      } else {
        // In case of error
        setAuthorsInfo(prev => ({
          ...prev,
          [authorId]: { id: authorId, username: 'Unknown User', loading: false }
        }));
      }
    } catch (error) {
      console.error('Error fetching author info:', error);
      setAuthorsInfo(prev => ({
        ...prev,
        [authorId]: { id: authorId, username: 'Unknown User', loading: false }
      }));
    }
  };

  // Funkcja pomocnicza do wyświetlania imienia i nazwiska autora
  const getAuthorDisplayName = (authorId: string) => {
    if (!authorId) return 'Unknown User';
    
    const author = authorsInfo[authorId];
    if (!author) return 'Loading...';
    if (author.loading) return 'Loading...';
    
    if (author.name && author.surname) {
      return `${author.name} ${author.surname}`;
    }
    
    return author.username || 'Unknown User';
  };

  // Add delete functionality
  const deletePost = async (postId: number) => {
    if (confirm('Czy na pewno chcesz usunąć ten post?')) {
      try {
        const response = await fetch(`/api/posts/${postId}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          // Remove the post from the local state
          setPosts(prev => prev.filter(post => post.id !== postId));
          alert('Post został pomyślnie usunięty');
        } else {
          const error = await response.json();
          alert(error.error || 'Nie udało się usunąć posta');
        }
      } catch (error) {
        console.error('Error deleting post:', error);
        alert('Wystąpił błąd podczas usuwania posta.');
      }
    }
  };

  if (loading) return <div className="text-center p-4">Loading...</div>;

  return (
    <div className="bg-white p-4 rounded-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">{t.posts.title}</h2>
        <Link 
          href="/pl/list/announcements" 
          className="text-sm text-blue-500 hover:text-blue-700"
        >
          {t.common.viewAll}
        </Link>
      </div>

      <div className="space-y-4">
        {posts.map((post) => (
          <div key={post.id} className="p-4 rounded-lg bg-gray-50">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <UserAvatar
                  userId={post.authorId}
                  size={32}
                />
                <div>
                  <h3 className="font-semibold">{getAuthorDisplayName(post.authorId)}</h3>
                  <p className="text-xs text-gray-500">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              {/* Delete button - only show for author */}
              {user && user.id === post.authorId && (
                <button 
                  onClick={() => deletePost(post.id)}
                  className="text-red-500 hover:text-red-700 text-xs"
                >
                  Usuń
                </button>
              )}
            </div>
            <h4 className="font-medium mb-1">{post.title}</h4>
            <p className="text-sm text-gray-600 line-clamp-2">{post.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}