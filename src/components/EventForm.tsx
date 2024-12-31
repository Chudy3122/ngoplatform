// app/[lang]/(dashboard)/list/events/EventForm.tsx
"use client";

import { useState } from 'react';
import { useTranslations } from '@/hooks/useTranslations';

interface EventFormProps {
  onEventCreated?: () => void;
}

export default function EventForm({ onEventCreated }: EventFormProps) {
  const t = useTranslations();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [price, setPrice] = useState('');
  const [maxParticipants, setMaxParticipants] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
  
    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description,
          location,
          startTime: new Date(startTime).toISOString(),
          endTime: new Date(endTime).toISOString(),
          price: price ? parseFloat(price) : null,
          maxParticipants: maxParticipants ? parseInt(maxParticipants) : null,
          isPublic
        }),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        console.error('Response error:', data);
        throw new Error(data.error || 'Failed to create event');
      }
  
      // Reset form
      setTitle('');
      setDescription('');
      setLocation('');
      setStartTime('');
      setEndTime('');
      setPrice('');
      setMaxParticipants('');
      setIsPublic(true);
  
      onEventCreated?.();
    } catch (error) {
      console.error('Error creating event:', error);
      setError(error instanceof Error ? error.message : 'Failed to create event');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            required
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            required
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
          <input
            type="datetime-local"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            required
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
          <input
            type="datetime-local"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            required
            disabled={isSubmitting}
            min={startTime}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Price (PLN)</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            placeholder="Leave empty if free"
            min="0"
            step="0.01"
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Max Participants</label>
          <input
            type="number"
            value={maxParticipants}
            onChange={(e) => setMaxParticipants(e.target.value)}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            placeholder="Leave empty for unlimited"
            min="1"
            disabled={isSubmitting}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 h-32"
          required
          disabled={isSubmitting}
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="isPublic"
          checked={isPublic}
          onChange={(e) => setIsPublic(e.target.checked)}
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          disabled={isSubmitting}
        />
        <label htmlFor="isPublic" className="text-sm font-medium text-gray-700">
          Public event (visible to everyone)
        </label>
      </div>

      <button
        type="submit"
        className="w-full bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:hover:bg-blue-500 transition-colors"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Creating...' : 'Create Event'}
      </button>
    </form>
  );
}