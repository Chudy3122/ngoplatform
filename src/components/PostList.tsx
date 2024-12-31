"use client";

import { useState, useEffect } from 'react';
import { useTranslations } from '@/hooks/useTranslations';
import { useUser } from '@clerk/nextjs';
import { Post } from '../../types/post';

const DEFAULT_AVATAR = "/noAvatar.png";

export default function PostList({ limit }: { limit?: number }) {
  const t = useTranslations();
  const { user } = useUser();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [commentInputs, setCommentInputs] = useState<{[key: number]: string}>({});

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/posts');
      if (!response.ok) throw new Error('Failed to fetch posts');
      const data = await response.json();
      console.log("Fetched posts:", data); // Debugging
      setPosts(limit ? data.slice(0, limit) : data);
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch posts');
    } finally {
      setLoading(false);
    }
  };

  const handleReaction = async (postId: number, reactionType: string) => {
    try {
      const response = await fetch('/api/reactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          postId,
          type: reactionType
        }),
      });

      if (!response.ok) throw new Error('Failed to add reaction');
      await fetchPosts(); // Odśwież posty po reakcji
    } catch (error) {
      console.error('Error handling reaction:', error);
    }
  };

  const handleDeletePost = async (postId: number) => {
    // Użyj tłumaczeń dla tekstu potwierdzenia
    if (!confirm(t.posts.delete.confirm)) {
      return;
    }

    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete post');
      }

      // Odśwież listę postów
      await fetchPosts();
      
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [limit]);

  const handleComment = async (postId: number) => {
    const content = commentInputs[postId]?.trim();
    if (!content) return;

    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          postId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add comment');
      }

      // Wyczyść input po dodaniu komentarza
      setCommentInputs(prev => ({
        ...prev,
        [postId]: ''
      }));

      // Odśwież posty
      await fetchPosts();
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  if (loading) return <div className="text-center p-4">Loading...</div>;
  if (error) return <div className="text-center text-red-500 p-4">{error}</div>;
  if (!posts.length) return <div className="text-center p-4">No posts yet</div>;

  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <div key={post.id} className="bg-white p-6 rounded-lg shadow">
          {/* Nagłówek posta z opcją usuwania */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <img
                src={post.author?.img || "/noAvatar.png"}
                alt={`${post.author?.name || 'Unknown'}'s avatar`}
                className="w-10 h-10 rounded-full mr-4"
              />
              <div>
                <h3 className="font-bold">
                  {post.author ? `${post.author.name} ${post.author.surname}` : 'Unknown User'}
                </h3>
                <p className="text-sm text-gray-500">
                  {new Date(post.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
            {/* Przycisk usuwania widoczny tylko dla autora */}
            {user?.id === post.authorId && ( // zmiana z userId na user?.id
              <button
                onClick={() => handleDeletePost(post.id)}
                className="text-red-500 hover:text-red-700"
                title="Delete post"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </button>
            )}
          </div>

          {/* Treść posta */}
          <div className="mb-4">
            <h2 className="text-xl font-semibold mb-2">{post.title}</h2>
            <p className="text-gray-700">{post.content}</p>
          </div>

          {/* Reakcje */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => handleReaction(post.id, 'LIKE')}
              className="px-3 py-1 text-sm rounded-full bg-gray-100 hover:bg-gray-200"
            >
              {t.posts.reactions.LIKE} ({post.reactions?.filter(r => r.type === 'LIKE').length || 0})
            </button>
            <button
              onClick={() => handleReaction(post.id, 'LOVE')}
              className="px-3 py-1 text-sm rounded-full bg-gray-100 hover:bg-gray-200"
            >
              {t.posts.reactions.LOVE} ({post.reactions?.filter(r => r.type === 'LOVE').length || 0})
            </button>
            <button
              onClick={() => handleReaction(post.id, 'HAHA')}
              className="px-3 py-1 text-sm rounded-full bg-gray-100 hover:bg-gray-200"
            >
              {t.posts.reactions.HAHA} ({post.reactions?.filter(r => r.type === 'HAHA').length || 0})
            </button>
            <button
              onClick={() => handleReaction(post.id, 'WOW')}
              className="px-3 py-1 text-sm rounded-full bg-gray-100 hover:bg-gray-200"
            >
              {t.posts.reactions.WOW} ({post.reactions?.filter(r => r.type === 'WOW').length || 0})
            </button>
            <button
              onClick={() => handleReaction(post.id, 'SAD')}
              className="px-3 py-1 text-sm rounded-full bg-gray-100 hover:bg-gray-200"
            >
              {t.posts.reactions.SAD} ({post.reactions?.filter(r => r.type === 'SAD').length || 0})
            </button>
            <button
              onClick={() => handleReaction(post.id, 'ANGRY')}
              className="px-3 py-1 text-sm rounded-full bg-gray-100 hover:bg-gray-200"
            >
              {t.posts.reactions.ANGRY} ({post.reactions?.filter(r => r.type === 'ANGRY').length || 0})
            </button>
          </div>

           {/* Komentarze */}
           <div className="border-t pt-4 mt-4">
            {post.comments?.map((comment) => (
              <div key={comment.id} className="bg-gray-50 p-3 rounded mb-2">
                <div className="flex items-center mb-2">
                  <img
                    src={comment.author?.img || DEFAULT_AVATAR}
                    alt={`${comment.author?.name || 'Unknown'}'s avatar`}
                    className="w-6 h-6 rounded-full mr-2"
                  />
                  <span className="font-bold text-sm">
                    {comment.author ? `${comment.author.name} ${comment.author.surname}` : 'Unknown User'}
                  </span>
                </div>
                <p className="text-sm">{comment.content}</p>
              </div>
            ))}

            {/* Formularz komentarza */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleComment(post.id);
              }}
              className="mt-4"
            >
              <div className="flex gap-2">
                <input
                  type="text"
                  value={commentInputs[post.id] || ''}
                  onChange={(e) => setCommentInputs(prev => ({
                    ...prev,
                    [post.id]: e.target.value
                  }))}
                  placeholder={t.posts.comments.placeholder}
                  className="flex-1 border rounded-lg p-2"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  disabled={!commentInputs[post.id]?.trim()}
                >
                  {t.posts.comments.submit}
                </button>
              </div>
            </form>
          </div>
        </div>
      ))}
    </div>
  );
}