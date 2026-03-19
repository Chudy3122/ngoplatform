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
        const response = await fetch('/api/posts?limit=5');
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

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((n) => (
          <div key={n} className="p-4 rounded-xl border border-slate-200 animate-pulse">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-7 h-7 rounded-full bg-slate-200 flex-shrink-0" />
              <div className="space-y-1.5 flex-1">
                <div className="h-3 bg-slate-200 rounded w-1/3" />
                <div className="h-2.5 bg-slate-200 rounded w-1/5" />
              </div>
            </div>
            <div className="h-3 bg-slate-200 rounded w-2/3 mb-2" />
            <div className="h-3 bg-slate-200 rounded w-full" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-base font-semibold text-slate-800">{t.posts.title}</h2>
        <Link
          href="/pl/list/announcements"
          className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
        >
          {t.common.viewAll}
        </Link>
      </div>

      <div className="space-y-3">
        {posts.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-10">Brak ogłoszeń</p>
        ) : (
          posts.map((post) => (
            <div
              key={post.id}
              className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50/50 transition-colors"
            >
              <div className="flex items-center gap-2.5 mb-2">
                <img
                  src={post.author?.img || "/noAvatar.png"}
                  alt={post.author?.name || "User"}
                  className="w-7 h-7 rounded-full flex-shrink-0 object-cover"
                />
                <div>
                  <h3 className="text-[13px] font-semibold text-slate-800 leading-tight">
                    {post.author?.name} {post.author?.surname}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              {post.title && (
                <h4 className="text-[13px] font-semibold text-slate-700 mb-1">{post.title}</h4>
              )}
              <p className="text-[13px] text-slate-500 line-clamp-2 leading-relaxed">{post.content}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
