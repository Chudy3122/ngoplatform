// Interfejs opisujący użytkownika w systemie
export interface User {
    id: string;
    username?: string;
    email?: string;
    type?: 'admin' | 'teacher' | 'student' | 'parent';
    avatarUrl?: string; // URL do zdjęcia profilowego użytkownika
  }
  
  // Interfejs opisujący wynik wyszukiwania użytkowników
  export interface SearchUserResult extends User {
    type: 'admin' | 'teacher' | 'student' | 'parent';
  }