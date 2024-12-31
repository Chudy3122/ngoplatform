// app/[lang]/(dashboard)/list/events/types.ts
export interface Author {
    id: string;
    username: string;
    email: string;
  }
  
  export interface EventComment {
    id: number;
    content: string;
    authorId: string;
    author?: Author;
    createdAt: string;
  }
  
  export interface EventParticipant {
    userId: string;
    status: 'GOING' | 'INTERESTED' | 'NOT_GOING';
  }
  
  export interface Event {
    id: number;
    title: string;
    description: string;
    location: string;
    startTime: string;
    endTime: string;
    price?: number;
    isPublic: boolean;
    maxParticipants?: number;
    authorId: string;
    author?: Author;
    participants: EventParticipant[];
    comments: EventComment[];
  }