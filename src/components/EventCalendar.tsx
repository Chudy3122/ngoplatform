// components/EventCalendar.tsx
"use client";

import { useState, useEffect, useRef } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { useTranslations, Language } from "@/hooks/useTranslations";

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

type Event = {
  id: number;
  title: string;
  startTime: Date;
  endTime: Date;
  description?: string;
  location?: string;
};

interface CalendarProps {
  multiMonth?: boolean;
  className?: string;
}

const CALENDAR_LOCALES = {
  pl: {
    months: ['Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec', 
             'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'],
    weekDays: ['Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob', 'Niedz'],
    weekdaysLong: ['Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota', 'Niedziela']
  },
  en: {
    months: ['January', 'February', 'March', 'April', 'May', 'June',
             'July', 'August', 'September', 'October', 'November', 'December'],
    weekDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    weekdaysLong: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  }
} as const;

const EventCalendar = ({ multiMonth = false, className = "" }: CalendarProps) => {
  const params = useParams();
  const lang = (params?.lang as Language) || 'pl';
  const t = useTranslations();
  
  const [selectedDate, setSelectedDate] = useState<Value>(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const calendarRef = useRef<HTMLDivElement>(null);
  
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch('/api/events');
        const data = await response.json();
        setEvents(data);
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };
    fetchEvents();
  }, []);

  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.startTime);
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const handleDateChange = (value: Value) => {
    setSelectedDate(value);
    if (value instanceof Date) {
      const params = new URLSearchParams(searchParams?.toString() || '');
      params.set('date', value.toISOString().split('T')[0]);
      router.push(`?${params.toString()}`);
    }
  };

  const handleTileMouseOver = (e: React.MouseEvent, date: Date) => {
    const dayEvents = getEventsForDate(date);
    if (dayEvents.length > 0) {
      const tile = e.currentTarget;
      const tileRect = tile.getBoundingClientRect();
      const calendarRect = calendarRef.current?.getBoundingClientRect();

      if (calendarRect) {
        setTooltipPosition({
          x: tileRect.left - calendarRect.left + tileRect.width / 2,
          y: tileRect.bottom - calendarRect.top + 10
        });
        setHoveredDate(date);
      }
    }
  };

  const handleTileMouseOut = () => {
    setHoveredDate(null);
  };

  const formatMonthYear = (locale: string | undefined, date: Date) => {
    const monthIndex = date.getMonth();
    return `${CALENDAR_LOCALES[lang].months[monthIndex]} ${date.getFullYear()}`;
  };

  const formatShortWeekday = (locale: string | undefined, date: Date) => {
    const dayIndex = date.getDay();
    return CALENDAR_LOCALES[lang].weekDays[dayIndex === 0 ? 6 : dayIndex - 1];
  };

  const tileContent = ({ date }: { date: Date }) => {
    const dayEvents = getEventsForDate(date);
    if (dayEvents.length === 0) return null;

    return (
      <div
        onMouseOver={(e) => handleTileMouseOver(e, date)}
        onMouseOut={handleTileMouseOut}
        className="absolute inset-0 flex items-center justify-center"
      >
        <div className="event-dot bg-blue-500 w-2 h-2 rounded-full" />
      </div>
    );
  };

  if (!multiMonth) {
    return (
      <div className={`relative ${className}`} ref={calendarRef}>
        <h2 className="text-base font-semibold text-slate-800 mb-4">{t.common.calendar.title}</h2>
        <Calendar
          value={selectedDate}
          onChange={handleDateChange}
          tileContent={tileContent}
          className="border-none"
          formatMonthYear={formatMonthYear}
          formatShortWeekday={formatShortWeekday}
          locale={lang}
        />
        
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-slate-700 mb-3 mt-6">{t.common.calendar.upcomingEvents}</h3>
        </div>
        
        {hoveredDate && (
          <div 
            className="tooltip absolute z-50 bg-white p-4 rounded-lg shadow-lg border border-gray-200 max-w-xs"
            style={{
              left: `${tooltipPosition.x}px`,
              top: `${tooltipPosition.y}px`,
              transform: 'translateX(-50%)'
            }}
          >
            <div className="tooltip-arrow" />
            <p className="font-semibold mb-2">
              {hoveredDate.toLocaleDateString(lang === 'pl' ? 'pl-PL' : 'en-US', { 
                day: 'numeric',
                month: 'long' 
              })}
            </p>
            {getEventsForDate(hoveredDate).map((event) => (
              <div key={event.id} className="mb-2 last:mb-0 text-sm">
                <p className="font-medium">{event.title}</p>
                <p className="text-xs text-gray-500">
                  {new Date(event.startTime).toLocaleTimeString(lang === 'pl' ? 'pl-PL' : 'en-US', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                  {event.location && ` • ${event.location}`}
                </p>
                {event.description && (
                  <p className="text-xs text-gray-600 mt-1">{event.description}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  const currentDate = new Date();
  const threeMonths = Array.from({ length: 3 }, (_, i: number) => {
    const date = new Date(currentDate);
    date.setMonth(currentDate.getMonth() + i);
    return date;
  });

  return (
    <div className={`bg-white p-4 rounded-lg sticky top-4 ${className}`}>
      {threeMonths.map((date: Date, index: number) => (
        <div key={index} className={index > 0 ? 'mt-4' : ''}>
          <h3 className="text-sm font-semibold mb-2 text-gray-600">
            {formatMonthYear(lang, date)}
          </h3>
          <Calendar
            value={selectedDate}
            onChange={handleDateChange}
            activeStartDate={date}
            showNavigation={false}
            tileContent={tileContent}
            className="border-none"
            formatShortWeekday={formatShortWeekday}
            locale={lang}
          />
        </div>
      ))}
    </div>
  );
};

export default EventCalendar;