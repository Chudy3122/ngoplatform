"use client";

import { useState } from 'react';
import { useTranslations } from '@/hooks/useTranslations';

type PostType = 'JOB' | 'ANNOUNCEMENT' | 'OTHER';

interface PostFormProps {
  onPostCreated?: () => void;
}

export default function PostForm({ onPostCreated }: PostFormProps) {
  const t = useTranslations();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState<PostType>('JOB');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          content,
          type
        }),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        console.error("Server error details:", data);
        throw new Error(data.error || 'Failed to create post');
      }
  
      console.log("Post created successfully:", data);
      
      setTitle('');
      setContent('');
      setType('JOB');
      onPostCreated?.();
      
    } catch (error) {
      console.error('Error creating post:', error);
      setError(error instanceof Error ? error.message : 'Failed to create post');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded-md">
          {error}
        </div>
      )}
      
      <div>
        <label className="block text-gray-700 text-sm font-bold mb-2">
          {t.posts.form.title}
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-2 border rounded"
          required
          disabled={isSubmitting}
        />
      </div>
      
      <div>
        <label className="block text-gray-700 text-sm font-bold mb-2">
          {t.posts.form.content}
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full p-2 border rounded h-32"
          required
          disabled={isSubmitting}
        />
      </div>

      <div>
        <label className="block text-gray-700 text-sm font-bold mb-2">
          {t.posts.form.type}
        </label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as PostType)}
          className="w-full p-2 border rounded"
          disabled={isSubmitting}
        >
          <option value="JOB">{t.posts.types.JOB}</option>
          <option value="ANNOUNCEMENT">{t.posts.types.ANNOUNCEMENT}</option>
          <option value="OTHER">{t.posts.types.OTHER}</option>
        </select>
      </div>

      <button
        type="submit"
        className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:opacity-50"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Creating...' : t.posts.form.submit}
      </button>
    </form>
  );
}