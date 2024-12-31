export interface Post {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  authorId: string;
  type: 'JOB' | 'ANNOUNCEMENT' | 'OTHER';
  author?: {
    id: string;
    name: string;
    surname: string;
    img?: string | null;
  };
  comments?: Comment[];
  reactions?: Reaction[];
}

export interface Comment {
  id: number;
  content: string;
  authorId: string;
  postId: number;
  author?: {
    id: string;
    name: string;
    surname: string;
    img?: string | null;
  };
}

export interface Reaction {
  id: number;
  type: 'LIKE' | 'LOVE' | 'HAHA' | 'WOW' | 'SAD' | 'ANGRY';
  authorId: string;
  postId: number;
}