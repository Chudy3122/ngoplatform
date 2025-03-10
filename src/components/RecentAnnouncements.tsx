// components/RecentAnnouncements.tsx
"use client";

import { useState, useEffect } from 'react';
import { useTranslations } from '@/hooks/useTranslations';
import Link from 'next/link';
import { Post } from '../../types/post';

export default function RecentAnnouncements() {
  const t = useTranslations();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch('/api/posts?limit=3');
        if (!response.ok) throw new Error('Failed to fetch posts');
        const data = await response.json();
        setPosts(data);
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

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
            <div className="flex items-center gap-2 mb-2">
              <img
                src={post.author?.img || "/noAvatar.png"}
                alt={post.author?.name || "User"}
                className="w-8 h-8 rounded-full"
              />
              <div>
                <h3 className="font-semibold">{post.author?.name} {post.author?.surname}</h3>
                <p className="text-xs text-gray-500">
                  {new Date(post.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <h4 className="font-medium mb-1">{post.title}</h4>
            <p className="text-sm text-gray-600 line-clamp-2">{post.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}