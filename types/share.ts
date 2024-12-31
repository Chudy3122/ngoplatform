// types/share.ts
export interface SharedFile {
    id: string;
    name: string;
    size: number;
    type: string;
    url: string;
    path: string;
    createdAt: Date;
    owner: {
      id: string;
      username?: string;
      email?: string;
    };
    sharedWith: {
      userId: string;
      username?: string;
      email?: string;
      accessType: 'READ' | 'WRITE';
    }[];
  }
  
  export interface SharedAccess {
    id: string;
    fileId: string;
    userId: string;
    accessType: 'READ' | 'WRITE';
    createdAt: Date;
    expiresAt?: Date;
  }
  
  export interface ShareRequest {
    fileId: string;
    userIds: string[];
    accessType: 'READ' | 'WRITE';
    expiresAt?: Date;
  }