"use client";

import { useEffect, useState } from 'react';
import { useTranslations } from '@/hooks/useTranslations';
import { useUser } from '@clerk/nextjs';
import { format } from 'date-fns';
import { pl as plLocale, enUS } from 'date-fns/locale';
import { EventItem } from '@/components/events/EventItem';
import UserAvatar from '@/components/UserAvatar';

const DEFAULT_AVATAR = "/noAvatar.png";

type Author = {
  id: string;
  username: string;
  name?: string;
  surname?: string;
  img?: string;
};

type ParticipationStatus = 'GOING' | 'INTERESTED' | 'NOT_GOING';


type UserData = {
  username: string;
  name?: string;
  surname?: string;
  img?: string;
};

type ParticipantAdmin = {
  username: string;
  name?: string;
  surname?: string;
  img?: string;
};

type ParticipantTeacher = {
  username: string;
  name: string;
  surname: string;
  img?: string;
};

type ParticipantStudent = {
  username: string;
  name?: string;
  surname?: string;
  img?: string;
};

type ParticipantParent = {
  username: string;
  name: string;
  surname: string;
  img?: string;
};

type Participant = {
  id: number;
  userId: string;
  status: 'GOING' | 'INTERESTED' | 'NOT_GOING';
  userType: string;
  createdAt: string;
  participantStudent?: ParticipantStudent;
  participantTeacher?: ParticipantTeacher;
  participantAdmin?: ParticipantAdmin;
  participantParent?: ParticipantParent;
};


type Event = {
  id: number;
  title: string;
  description: string;
  location: string;
  startTime: string;
  endTime: string;
  price?: number;
  maxParticipants?: number;
  isPublic: boolean;
  createdAt: string;
  authorStudentId?: string;
  authorTeacherId?: string;
  authorAdminId?: string;
  authorParentId?: string;
  authorStudent?: Author;
  authorTeacher?: Author;
  authorAdmin?: Author;
  authorParent?: Author;
  participants: Participant[];
  class?: any;
};

type EventStats = {
  total: number;
  thisMonth: number;
  attending: number;
  created: number;
};

interface Filters {
  onlyFree: boolean;
  onlyGoing: boolean;
  onlyInterested: boolean;
  onlyMyEvents: boolean;
}

interface EventListProps {
  limit?: number;
  compact?: boolean;
}

interface EventListProps {
  limit?: number;
  compact?: boolean;
  dateParam?: string;
}

export default function EventList({ limit, compact = false }: EventListProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [stats, setStats] = useState<EventStats>({
    total: 0,
    thisMonth: 0,
    attending: 0,
    created: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>({
    onlyFree: false,
    onlyGoing: false,
    onlyInterested: false,
    onlyMyEvents: false,
  });
  
  const { user } = useUser();
  const t = useTranslations();

  const getUserDisplayName = (userData?: ParticipantStudent | ParticipantTeacher | ParticipantAdmin | ParticipantParent) => {
    if (!userData) return 'Unknown User';
    if (userData.name && userData.surname) return `${userData.name} ${userData.surname}`;
    return userData.username;
  };

  const getAuthorDisplayName = (event: Event) => {
    const author = event.authorStudent || event.authorTeacher || event.authorAdmin || event.authorParent;
    if (!author) return 'Unknown User';
    if (author.name && author.surname) return `${author.name} ${author.surname}`;
    return author.username;
  };

  const getAuthorId = (event: Event) => {
    return event.authorStudentId || event.authorTeacherId || event.authorAdminId || event.authorParentId || '';
  };

  const getParticipantId = (participant: Participant) => {
    return participant.userId;
  };

  const handleDeleteEvent = async (eventId: number) => {
    if (!confirm(t.events.delete.confirm)) {
      return;
    }
  
    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: 'DELETE',
      });
  
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete event');
      }
  
      await fetchEvents();
      
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  const calculateStats = (eventsList: Event[]) => {
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();
  
    const newStats = {
      total: eventsList.length,
      thisMonth: eventsList.filter(event => {
        const eventDate = new Date(event.startTime);
        return eventDate.getMonth() === thisMonth && eventDate.getFullYear() === thisYear;
      }).length,
      attending: eventsList.filter(event => 
        event.participants.some(p => p.userId === user?.id && p.status === 'GOING')
      ).length,
      created: eventsList.filter(event => 
        event.authorStudent?.id === user?.id ||
        event.authorTeacher?.id === user?.id ||
        event.authorAdmin?.id === user?.id ||
        event.authorParent?.id === user?.id
      ).length,
    };
  
    setStats(newStats);
  };

  const handleParticipation = async (eventId: number, status: ParticipationStatus) => {
    try {
      const response = await fetch('/api/events/participation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ eventId, status }),
      });

      if (!response.ok) throw new Error('Failed to update participation');
      await fetchEvents();
    } catch (error) {
      console.error('Error updating participation:', error);
    }
  };

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/events');
      
      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }
      
      const data = await response.json();
      setEvents(data);
      setFilteredEvents(data);
      calculateStats(data);
    } catch (err) {
      console.error('Error fetching events:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [user]);

  useEffect(() => {
    const applyFilters = (eventsList: Event[]) => {
      return eventsList.filter(event => {
        if (filters.onlyFree && event.price && event.price > 0) return false;
        if (filters.onlyGoing && !event.participants.some(p => p.userId === user?.id && p.status === 'GOING')) return false;
        if (filters.onlyInterested && !event.participants.some(p => p.userId === user?.id && p.status === 'INTERESTED')) return false;
        if (filters.onlyMyEvents && !(
          event.authorStudent?.id === user?.id ||
          event.authorTeacher?.id === user?.id ||
          event.authorAdmin?.id === user?.id ||
          event.authorParent?.id === user?.id
        )) return false;
        return true;
      });
    };

    setFilteredEvents(applyFilters(events));
  }, [filters, events, user?.id]);

  const displayedEvents = limit 
    ? filteredEvents.slice(0, limit) 
    : filteredEvents;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
        {error}
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 ${!compact ? 'lg:grid-cols-4' : ''} gap-6`}>
      <div className={`${!compact ? 'lg:col-span-3' : ''} space-y-4`}>
        {displayedEvents.length === 0 ? (
          <div className="text-center p-8 bg-gray-50 rounded-lg">
            {t.events.noEvents}
          </div>
        ) : (
          displayedEvents.map((event) => (
            <div key={event.id} className="bg-gray-50 p-6 rounded-lg">
              <div className="flex flex-col lg:flex-row justify-between items-start mb-4 gap-4">
                <div className="flex items-start gap-4 w-full lg:w-auto">
                  <div className="flex-shrink-0">
                    {/* Używamy UserAvatar zamiast bezpośredniego tagu <img> */}
                    <UserAvatar 
                      userId={getAuthorId(event)} 
                      size={48} 
                    />
                  </div>
                  <div className="flex-grow">
                    <h3 className="font-semibold text-lg">{event.title}</h3>
                    <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
                      <span>📅 {format(new Date(event.startTime), 'dd.MM.yyyy HH:mm')}</span>
                      {event.endTime && (
                        <span>→ {format(new Date(event.endTime), 'HH:mm')}</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1 flex items-center gap-1">
                      {t.events.createdBy}: {getAuthorDisplayName(event)}
                      {(event.authorStudent?.id === user?.id ||
                        event.authorTeacher?.id === user?.id ||
                        event.authorAdmin?.id === user?.id ||
                        event.authorParent?.id === user?.id) && (
                        <button
                          onClick={() => handleDeleteEvent(event.id)}
                          className="ml-2 p-1 hover:bg-red-100 rounded-full transition-colors"
                          title={t.events.delete.confirm}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 text-red-500"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-start lg:items-end gap-2 w-full lg:w-auto">
                  <div className="flex flex-wrap gap-2 w-full lg:w-auto">
                    <button
                      onClick={() => handleParticipation(event.id, 'GOING')}
                      className={`px-4 py-2 text-sm rounded-full transition-all duration-200 flex items-center gap-2 ${
                        event.participants.some(p => p.userId === user?.id && p.status === 'GOING')
                          ? 'bg-green-500 text-white hover:bg-green-600'
                          : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      <span>👤</span>
                      {t.events.participation.going} ({event.participants.filter(p => p.status === 'GOING').length})
                    </button>
                    <button
                      onClick={() => handleParticipation(event.id, 'INTERESTED')}
                      className={`px-4 py-2 text-sm rounded-full transition-all duration-200 flex items-center gap-2 ${
                        event.participants.some(p => p.userId === user?.id && p.status === 'INTERESTED')
                          ? 'bg-blue-500 text-white hover:bg-blue-600'
                          : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      <span>⭐</span>
                      {t.events.participation.interested} ({event.participants.filter(p => p.status === 'INTERESTED').length})
                    </button>
                  </div>
                  {event.maxParticipants && (
                    <div className="text-sm text-gray-500">
                      {event.participants.filter(p => p.status === 'GOING').length}/{event.maxParticipants} {t.events.participation.spotsFilled}
                    </div>
                  )}
                </div>
              </div>
  
               {/* Opis wydarzenia bez zmian */}
               <div className="bg-white p-4 rounded-lg shadow-sm mt-4">
                <p className="text-gray-700">{event.description}</p>
                <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1 bg-gray-50 px-3 py-1 rounded-full">
                    <span>📍</span>
                    {event.location}
                  </div>
                  {event.price !== null && (
                    <div className="flex items-center gap-1 bg-gray-50 px-3 py-1 rounded-full">
                      <span>💰</span>
                      {event.price} PLN
                    </div>
                  )}
                </div>
              </div>
  
              {/* Lista uczestników ze zaktualizowanymi avatarami */}
              {event.participants.length > 0 && (
                <div className="mt-4 space-y-4 bg-white p-4 rounded-lg shadow-sm">
                  {event.participants.filter(p => p.status === 'GOING').length > 0 && (
                    <div>
                      <h4 className="font-medium text-sm mb-2">{t.events.participants.going}:</h4>
                      <div className="flex flex-wrap gap-2">
                        {event.participants
                          .filter(p => p.status === 'GOING')
                          .map((participant) => {
                            const userData = 
                              participant.participantStudent ||
                              participant.participantTeacher ||
                              participant.participantAdmin ||
                              participant.participantParent;
  
                            return (
                              <div key={participant.id} className="flex items-center bg-green-100 rounded-full px-3 py-1">
                                {/* Używamy UserAvatar zamiast bezpośredniego tagu <img> */}
                                <div className="mr-2">
                                  <UserAvatar 
                                    userId={getParticipantId(participant)} 
                                    size={24} 
                                  />
                                </div>
                                <span className="text-sm">{getUserDisplayName(userData)}</span>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  )}
  
                  {event.participants.filter(p => p.status === 'INTERESTED').length > 0 && (
                    <div>
                      <h4 className="font-medium text-sm mb-2">{t.events.participants.interested}:</h4>
                      <div className="flex flex-wrap gap-2">
                        {event.participants
                          .filter(p => p.status === 'INTERESTED')
                          .map((participant) => {
                            const userData = 
                              participant.participantStudent ||
                              participant.participantTeacher ||
                              participant.participantAdmin ||
                              participant.participantParent;
  
                            return (
                              <div key={participant.id} className="flex items-center bg-blue-100 rounded-full px-3 py-1">
                                {/* Używamy UserAvatar zamiast bezpośredniego tagu <img> */}
                                <div className="mr-2">
                                  <UserAvatar 
                                    userId={getParticipantId(participant)} 
                                    size={24} 
                                  />
                                </div>
                                <span className="text-sm">{getUserDisplayName(userData)}</span>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
  
      {!compact && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-6">{t.events.filters.title}</h2>
            <div className="space-y-3">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={filters.onlyFree}
                  onChange={(e) => setFilters(prev => ({ ...prev, onlyFree: e.target.checked }))}
                  className="rounded border-gray-300"
                />
                <span>{t.events.filters.onlyFree}</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={filters.onlyGoing}
                  onChange={(e) => setFilters(prev => ({ ...prev, onlyGoing: e.target.checked }))}
                  className="rounded border-gray-300"
                />
                <span>{t.events.filters.goingTo}</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={filters.onlyInterested}
                  onChange={(e) => setFilters(prev => ({ ...prev, onlyInterested: e.target.checked }))}
                  className="rounded border-gray-300"
                />
                <span>{t.events.filters.interested}</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={filters.onlyMyEvents}
                  onChange={(e) => setFilters(prev => ({ ...prev, onlyMyEvents: e.target.checked }))}
                  className="rounded border-gray-300"
                />
                <span>{t.events.filters.myEvents}</span>
              </label>
            </div>
          </div>
  
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-6">{t.events.stats.title}</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span>{t.events.stats.total}</span>
                <span className="font-semibold">{stats.total}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span>{t.events.stats.thisMonth}</span>
                <span className="font-semibold">{stats.thisMonth}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span>{t.events.stats.attending}</span>
                <span className="font-semibold">{stats.attending}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span>{t.events.stats.created}</span>
                <span className="font-semibold">{stats.created}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}