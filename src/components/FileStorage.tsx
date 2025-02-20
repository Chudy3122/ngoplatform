// FileStorage.tsx - Part 1: Imports and Interfaces

import { toast } from 'react-toastify';
import { useState, useEffect } from 'react';
import { 
  Upload, 
  List, 
  Grid, 
  FolderPlus, 
  File, 
  Trash2, 
  Loader2,
  FolderIcon,
  Download,
  Share,
  X,
} from 'lucide-react';
import { storage, db } from '@/lib/firebase';
import { getFirebaseToken } from '@/lib/auth';
import { useUser } from "@clerk/clerk-react";
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove, 
  getDoc,
  writeBatch,
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytesResumable, 
  getDownloadURL,
  deleteObject,
  listAll
} from 'firebase/storage';
import { useTranslations } from "@/hooks/useTranslations";
import { useParams } from "next/navigation";

interface Folder {
  id: string;
  name: string;
  path: string;
  userId: string;
  createdAt: string;
  parentFolder?: string;
}

interface FileData {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  userId: string;
  path: string;
  createdAt: string;
  folder?: string;
  sharedWith?: SharedAccess[];
  isShared?: boolean;
}

interface SharedAccess {
  userId: string;
  accessType: 'read' | 'write';
  email?: string;
}

interface UserListItem {
  id: string;
  email: string | null;
  name: string | null;
}

interface UserListItem {
  id: string;
  email: string | null;
  name: string | null;
}

interface ShareModalProps {
  users: UserListItem[];
  onShare: (selectedUsers: string[]) => void;
  onClose: () => void;
}

interface FilteredUser {
  id: string;
  email: string | null;
  name: string | null;
}



const ShareModal: React.FC<ShareModalProps> = ({ users, onShare, onClose }) => {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredUsers = users.filter((user: UserListItem) => 
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-96 max-h-[80vh] flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Share with users</h3>
          <button onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <input
          type="text"
          placeholder="Search users..."
          className="w-full p-2 border rounded-md mb-4"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <div className="flex-1 overflow-y-auto mb-4">
          {filteredUsers.length === 0 ? (
            <p className="text-gray-500 text-center">No users found</p>
          ) : (
            filteredUsers.map(user => (
              <div 
                key={user.id} 
                className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-md"
              >
                <input
                  type="checkbox"
                  checked={selectedUsers.includes(user.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedUsers([...selectedUsers, user.id]);
                    } else {
                      setSelectedUsers(selectedUsers.filter(id => id !== user.id));
                    }
                  }}
                  className="h-4 w-4"
                />
                <div className="flex-1">
                  <p className="font-medium">{user.email}</p>
                  {user.name && (
                    <p className="text-sm text-gray-500">{user.name}</p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="flex justify-end gap-2 mt-auto pt-4 border-t">
          <button
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
            onClick={() => onShare(selectedUsers)}
            disabled={selectedUsers.length === 0}
          >
            Share
          </button>
        </div>
      </div>
    </div>
  );
};

// FileStorage.tsx - Part 2: Component & Functions

export default function FileStorage() {
  // Wszystkie stany
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [currentFolder, setCurrentFolder] = useState<string>('');
  const [folders, setFolders] = useState<Folder[]>([]);
  const [files, setFiles] = useState<FileData[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [users, setUsers] = useState<UserListItem[]>([]);
  const { user, isLoaded, isSignedIn } = useUser();
  const params = useParams();
  const lang = params?.lang || 'pl';
  const t = useTranslations();

  // Funkcje pomocnicze
  const loadUsers = async () => {
    if (!user?.id) return [];
    
    try {
      const response = await fetch('/api/users/search');
      const users: UserListItem[] = await response.json();
      
      return users
        .filter((u: UserListItem) => u.id !== user.id)
        .map((u: UserListItem) => ({
          id: u.id,
          email: u.email,
          name: u.name
        }));
    } catch (err) {
      console.error("Error loading users:", err);
      setError("Error loading users list");
      return [];
    }
  };

  const handleShareFile = async (fileId: string) => {
    if (!user?.id) return;
    
    try {
      setSelectedFileId(fileId);
      const usersList = await loadUsers();
      setUsers(usersList);
      setShowShareModal(true);
    } catch (err) {
      console.error("Share error:", err);
      setError(`Share error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleCreateFolder = async (folderName: string) => {
    if (!user?.id) return;
    
    try {
      const path = currentFolder ? `${currentFolder}/${folderName}` : folderName;
      await addDoc(collection(db, 'folders'), {
        name: folderName,
        path,
        userId: user.id,
        createdAt: new Date().toISOString(),
        parentFolder: currentFolder || null
      });
      await loadFolders();
      setError(null);
    } catch (err) {
      console.error("Folder creation error:", err);
      setError(`Error creating folder: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleDeleteFolder = async (folderId: string, folderPath: string) => {
    if (!user?.id) return;
    
    try {
      // Sprawdź uprawnienia do folderu
      const folderRef = doc(db, 'folders', folderId);
      const folderDoc = await getDoc(folderRef);
      
      if (!folderDoc.exists()) {
        throw new Error('Folder not found');
      }
      
      if (folderDoc.data().userId !== user.id) {
        throw new Error('Permission denied');
      }
  
      // Usuń folder i jego zawartość
      const batch = writeBatch(db);
      
      // Usuń folder z Firestore
      batch.delete(folderRef);
      
      // Znajdź i usuń wszystkie pliki w folderze
      const filesQuery = query(
        collection(db, 'files'),
        where('folder', '==', folderPath),
        where('userId', '==', user.id)
      );
      
      const filesSnapshot = await getDocs(filesQuery);
      
      for (const fileDoc of filesSnapshot.docs) {
        const fileData = fileDoc.data();
        // Usuń plik ze Storage
        const storageRef = ref(storage, fileData.path);
        await deleteObject(storageRef);
        // Dodaj operację usunięcia do batcha
        batch.delete(fileDoc.ref);
      }
      
      // Wykonaj wszystkie operacje w ramach jednej transakcji
      await batch.commit();
      
      await loadFolders();
      setError(null);
    } catch (err) {
      console.error("Error deleting folder:", err);
      setError(`Error deleting folder: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const loadFolders = async () => {
    if (!user?.id) return;

    try {
      const foldersCollection = collection(db, 'folders');
      const q = query(foldersCollection, 
        where("userId", "==", user.id),
        where("parentFolder", "==", currentFolder || null)
      );
      
      const querySnapshot = await getDocs(q);
      const foldersList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Folder[];

      setFolders(foldersList);
    } catch (err) {
      console.error("Error loading folders:", err);
    }
  };

  const handleDownload = async (fileUrl: string, fileName: string) => {
    try {
      const token = await getFirebaseToken(user?.id!);
      const response = await fetch(fileUrl, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error('Download failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("Download error:", err);
      setError(`Error downloading file: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };


// W komponencie, przed renderowaniem ShareModal
useEffect(() => {
  if (showShareModal) {
    loadUsers().then(setUsers);
  }
}, [showShareModal]);

// W render:
{showShareModal && selectedFileId && (
  <ShareModal
    users={users}
    onShare={async (selectedUsers) => {
      try {
        await updateDoc(doc(db, "files", selectedFileId), {
          sharedWith: arrayUnion(...selectedUsers.map(userId => ({
            userId,
            accessType: 'read',
            sharedAt: new Date().toISOString()
          })))
        });
        setShowShareModal(false);
        setSelectedFileId(null);
        setError(null);
        toast.success('File shared successfully');
      } catch (err) {
        console.error("Error sharing file:", err);
        setError(`Error sharing file: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    }}
    onClose={() => {
      setShowShareModal(false);
      setSelectedFileId(null);
    }}
  />
)}

// W render:
{showShareModal && selectedFileId && (
  <ShareModal
    users={users}
    onShare={async (selectedUsers: string[]) => {
      try {
        await updateDoc(doc(db, "files", selectedFileId), {
          sharedWith: arrayUnion(...selectedUsers.map((userId: string) => ({
            userId,
            accessType: 'read' as const,
            sharedAt: new Date().toISOString()
          })))
        });
        setShowShareModal(false);
        setSelectedFileId(null);
        setError(null);
        toast.success('File shared successfully');
      } catch (err) {
        console.error("Error sharing file:", err);
        setError(`Error sharing file: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    }}
    onClose={() => {
      setShowShareModal(false);
      setSelectedFileId(null);
    }}
  />
)}

// W render:
{showShareModal && selectedFileId && (
  <ShareModal
    users={users}
    onShare={async (selectedUsers: string[]) => {
      try {
        await updateDoc(doc(db, "files", selectedFileId), {
          sharedWith: arrayUnion(...selectedUsers.map((userId: string) => ({
            userId,
            accessType: 'read' as const,
            sharedAt: new Date().toISOString()
          })))
        });
        setShowShareModal(false);
        setSelectedFileId(null);
        setError(null);
        toast.success('File shared successfully');
      } catch (err) {
        console.error("Error sharing file:", err);
        setError(`Error sharing file: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    }}
    onClose={() => {
      setShowShareModal(false);
      setSelectedFileId(null);
    }}
  />
)}

  const handleDelete = async (fileId: string, filePath: string) => {
    if (!user?.id) {
      setError("Please login to delete files");
      return;
    }

    try {
      await getFirebaseToken(user.id);
      const storageRef = ref(storage, filePath);
      await deleteObject(storageRef);
      await deleteDoc(doc(db, "files", fileId));
      await loadFiles();
      setError(null);
    } catch (err) {
      console.error("Delete error:", err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(`Error deleting file: ${errorMessage}`);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!user?.id) {
      setError("Please login to upload files");
      return;
    }
  
    const file = event.target.files?.[0];
    if (!file) return;
  
    setUploading(true);
    setError(null);
  
    try {
      await getFirebaseToken(user.id);
      const timestamp = Date.now();
      const safeName = encodeURIComponent(file.name);
      const filePath = currentFolder 
        ? `files/${user.id}/${currentFolder}/${timestamp}_${safeName}`
        : `files/${user.id}/${timestamp}_${safeName}`;
      
      const metadata = {
        customMetadata: {
          userId: user.id,
          folder: currentFolder || ''
        }
      };

      const storageRef = ref(storage, filePath);
      const uploadTask = uploadBytesResumable(storageRef, file, metadata);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        (error) => {
          console.error('Upload error:', error);
          setError(`Upload error: ${error.message}`);
          setUploading(false);
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(storageRef);
            await addDoc(collection(db, 'files'), {
              name: file.name,
              path: filePath,
              size: file.size,
              type: file.type,
              url: downloadURL,
              userId: user.id,
              folder: currentFolder || null,
              createdAt: new Date().toISOString()
            });

            setUploading(false);
            setUploadProgress(0);
            await loadFiles();
          } catch (err) {
            console.error('Error saving file metadata:', err);
            setError("Error saving file information");
            setUploading(false);
          }
        }
      );
    } catch (err) {
      console.error('Error starting upload:', err);
      setError(`Upload initialization error: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setUploading(false);
    }
  };

  const loadFiles = async () => {
    if (!user?.id || !isSignedIn) {
      setError("Authentication required");
      return;
    }
  
    try {
      await getFirebaseToken(user.id);
      const filesCollection = collection(db, 'files');
      
      // Zapytanie o własne pliki
      const q = query(filesCollection, 
        where("folder", "==", currentFolder || null),
        where("userId", "==", user.id)
      );
      
      // Zapytanie o pliki udostępnione
      const sharedQuery = query(filesCollection,
        where("sharedWith", "array-contains", user.id)
      );
  
      const [ownFilesSnapshot, sharedFilesSnapshot] = await Promise.all([
        getDocs(q),
        getDocs(sharedQuery)
      ]);
  
      const filesList = [
        ...ownFilesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as FileData)), // Dodaj rzutowanie typu
        ...sharedFilesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          isShared: true
        } as FileData)) // Dodaj rzutowanie typu
      ];
  
      setFiles(filesList);
      setError(null);
    } catch (err) {
      console.error("Error loading files:", err);
      setError(`Error loading files: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  // Dodaj funkcję obsługi udostępniania
  const handleShare = async (fileId: string, targetUserId: string) => {
    if (!user?.id) {
      toast.error("Please login to share files");
      return;
    }

    try {
      const fileRef = doc(db, "files", fileId);
      const fileDoc = await getDoc(fileRef);

      if (!fileDoc.exists()) {
        toast.error("File not found");
        return;
      }

      if (fileDoc.data().userId !== user.id) {
        toast.error("You don't have permission to share this file");
        return;
      }

      await updateDoc(fileRef, {
        sharedWith: arrayUnion(targetUserId)
      });

      toast.success("File shared successfully");
      await loadFiles();
    } catch (error) {
      console.error("Error sharing file:", error);
      toast.error("Failed to share file");
    }
  };

  useEffect(() => {
    if (user?.id && isSignedIn) {
      loadFiles();
      loadFolders();
    }
  }, [user?.id, isSignedIn, currentFolder]);

  // Podstawowe warunkowe renderowanie
  if (!isLoaded) return <div>Loading...</div>;
  if (!user) return <div>Please login to access the file storage.</div>;

  // JSX będzie w następnej części...

  // FileStorage.tsx - Part 3: JSX (część 1)

// ... (poprzedni kod)
 
return (
   <div className="p-6 bg-white rounded-lg">
      {/* Actions Bar */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-4">
          <label className="flex items-center gap-2 bg-lamaSky text-gray-700 px-4 py-2 rounded-md hover:bg-opacity-80 cursor-pointer">
            <Upload size={20} />
            {t.library.upload.button}
            <input
              type="file"
              className="hidden"
              onChange={handleFileUpload}
              disabled={uploading}
            />
          </label>

        {/* Create Folder Button */}
         <button
            className="flex items-center gap-2 bg-lamaPurple text-gray-700 px-4 py-2 rounded-md hover:bg-opacity-80"
            onClick={() => {
              const folderName = prompt(t.library.folder.name);
              if (folderName) handleCreateFolder(folderName);
            }}
          >
            <FolderPlus size={20} />
            {t.library.folder.create}
          </button>
        </div>

      {/* View Toggle */}
      <div className="flex gap-2">
          <button
            className={`p-2 rounded-md ${view === 'grid' ? 'bg-gray-100' : ''}`}
            onClick={() => setView('grid')}
            title={t.library.view.grid}
          >
            <Grid size={20} />
          </button>
          <button
            className={`p-2 rounded-md ${view === 'list' ? 'bg-gray-100' : ''}`}
            onClick={() => setView('list')}
            title={t.library.view.list}
          >
            <List size={20} />
          </button>
        </div>
      </div>

    {/* Upload Progress */}
    {uploading && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Loader2 className="animate-spin" size={16} />
            <span className="text-sm text-gray-500">
              {t.library.upload.uploading} {Math.round(uploadProgress)}%
            </span>
          </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-lamaSky h-2 rounded-full transition-all duration-300"
            style={{ width: `${uploadProgress}%` }}
          />
        </div>
      </div>
    )}

    {/* Breadcrumbs */}
    {currentFolder && (
      <div className="mb-4 flex items-center gap-2 text-sm">
        <button
          className="text-blue-500 hover:underline"
          onClick={() => setCurrentFolder('')}
        >
          {t.library.root || 'Root'} {/* Zmień na istniejący klucz lub dodaj fallback */}
        </button>
        {currentFolder.split('/').map((part, index, arr) => (
          <div key={index} className="flex items-center gap-2">
            <span className="text-gray-400">/</span>
            <button
              className="text-blue-500 hover:underline"
              onClick={() => setCurrentFolder(arr.slice(0, index + 1).join('/'))}
            >
              {part}
            </button>
          </div>
        ))}
      </div>
    )}

    {/* Folders Grid */}
    <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
      {folders.map(folder => (
        <div
          key={folder.id}
          className="p-4 border rounded-lg hover:bg-gray-50 relative"
        >
          <button
            className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteFolder(folder.id, folder.path);
            }}
          >
            <X size={16} />
          </button>
          <div 
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => setCurrentFolder(folder.path)}
          >
            <FolderIcon className="w-6 h-6 text-lamaPurple" />
            <span className="truncate">{folder.name}</span>
          </div>
        </div>
      ))}
    </div>

    {/* Files Display */}
    {view === 'grid' ? (
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {files.map((file) => (
          <div key={file.id} className="p-4 border rounded-lg hover:bg-gray-50">
            <div className="flex justify-between items-start mb-2">
              <File size={40} className="text-gray-400" />
              <div className="flex gap-2">
                <button
                  className="text-gray-400 hover:text-gray-600"
                  onClick={() => handleDownload(file.url, file.name)}
                >
                  <Download size={16} />
                </button>
                <button
                  className="text-gray-400 hover:text-gray-600"
                  onClick={() => handleDelete(file.id, file.path)}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            <div className="mt-2">
              <div className="font-medium truncate">{file.name}</div>
              <div className="text-sm text-gray-500">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </div>
            </div>
          </div>
        ))}
      </div>
    ) : (
      <div className="border rounded-lg divide-y">
        {files.map((file) => (
          <div key={file.id} className="flex items-center justify-between p-4 hover:bg-gray-50">
            <div className="flex items-center gap-4">
              <File size={24} className="text-gray-400" />
              <div>
                <div className="font-medium">{file.name}</div>
                <div className="text-sm text-gray-500">
                  {new Date(file.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </span>
              <div className="flex gap-2">
                <button
                  className="text-gray-400 hover:text-gray-600"
                  onClick={() => handleDownload(file.url, file.name)}
                >
                  <Download size={16} />
                </button>
                <button
                  className="text-gray-400 hover:text-gray-600"
                  onClick={() => handleDelete(file.id, file.path)}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);
};