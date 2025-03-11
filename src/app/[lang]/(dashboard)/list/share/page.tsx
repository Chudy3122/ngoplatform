"use client";

import { useState, useEffect, useCallback } from 'react';
import { Share2, Download, Users, Upload } from 'lucide-react';
import { useUser } from "@clerk/nextjs";
import { ShareFileModal } from '@/components/ShareFileModal';
import { toast } from 'react-toastify';
import { FileCard } from '@/components/FileCard';
import { useTranslations } from '@/hooks/useTranslations';

interface SharedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  createdAt: Date;
  fileData?: Buffer | Uint8Array;
  adminOwnerId?: string;
  teacherOwnerId?: string;
  studentOwnerId?: string;
  parentOwnerId?: string;
  shares: FileShare[];
}

interface User {
  id: string;
  username: string;
  email?: string;
}

interface FileShare {
  id: string;
  fileId: string;
  accessType: 'READ' | 'WRITE';
  createdAt: Date;
  expiresAt?: Date;
  sharedByAdminId?: string;
  sharedByTeacherId?: string;
  sharedByStudentId?: string;
  sharedByParentId?: string;
  sharedToAdminId?: string;
  sharedToTeacherId?: string;
  sharedToStudentId?: string;
  sharedToParentId?: string;
  sharedToAdmin?: User;
  sharedToTeacher?: User;
  sharedToStudent?: User;
  sharedToParent?: User;
  file?: SharedFile;
}

const SharedResourcesPage = () => {
  const t = useTranslations();
  const [sharedByMe, setSharedByMe] = useState<SharedFile[]>([]);
  const [sharedWithMe, setSharedWithMe] = useState<FileShare[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<{id: string, name: string} | null>(null);
  const { user } = useUser();

  const fetchSharedFiles = useCallback(async () => {
    try {
      setLoading(true);
      const [sharedByMeRes, sharedWithMeRes] = await Promise.all([
        fetch('/api/share/by-me'),
        fetch('/api/share/with-me')
      ]);

      if (!sharedByMeRes.ok || !sharedWithMeRes.ok) {
        throw new Error('Failed to fetch shared files');
      }

      const sharedByMeData = await sharedByMeRes.json();
      const sharedWithMeData = await sharedWithMeRes.json();

      setSharedByMe(sharedByMeData);
      setSharedWithMe(sharedWithMeData);
      setError(null);
    } catch (err) {
      console.error('Error fetching shared files:', err);
      setError(t?.sharedResources?.errorLoading || 'Failed to load shared files');
    } finally {
      setLoading(false);
    }
  }, [t]);

  const handleModalClose = useCallback(async () => {
    setSelectedFile(null);
    await fetchSharedFiles();
  }, [fetchSharedFiles]);

  const handleRevoke = useCallback(async (fileId: string) => {
    try {
      const response = await fetch(`/api/share/${fileId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to revoke access');
      }

      toast.success(t?.sharedResources?.revokeSuccess || 'Access revoked successfully');
      await fetchSharedFiles();
    } catch (err) {
      console.error('Error revoking access:', err);
      toast.error(t?.sharedResources?.revokeError || 'Failed to revoke access');
    }
  }, [fetchSharedFiles, t]);

  const handleDeleteFile = useCallback(async (fileId: string) => {
    if (!confirm(t?.sharedResources?.deleteConfirm || 'Are you sure you want to delete this file? This action cannot be undone.')) {
      return;
    }
  
    try {
      const response = await fetch(`/api/files/${fileId}`, {
        method: 'DELETE',
      });
  
      if (!response.ok) {
        throw new Error('Failed to delete file');
      }
  
      toast.success(t?.sharedResources?.deleteSuccess || 'File deleted successfully');
      await fetchSharedFiles();
    } catch (err) {
      console.error('Error deleting file:', err);
      toast.error(t?.sharedResources?.deleteError || 'Failed to delete file');
    }
  }, [fetchSharedFiles, t]);

  const handleDownload = useCallback(async (fileId: string, fileName: string) => {
    try {
      const response = await fetch(`/api/files/${fileId}`);
      if (!response.ok) throw new Error('Failed to download file');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success(t?.sharedResources?.downloadSuccess || 'File downloaded successfully');
    } catch (err) {
      console.error('Error downloading file:', err);
      toast.error(t?.sharedResources?.downloadError || 'Failed to download file');
    }
  }, [t]);

  useEffect(() => {
    const initializeUser = async () => {
      if (user?.id) {
        try {
          const initResponse = await fetch('/api/user/init', {
            method: 'POST',
          });
          
          if (!initResponse.ok) {
            console.warn('User initialization warning:', await initResponse.text());
          }

          await fetchSharedFiles();
        } catch (error) {
          console.error('Error during initialization:', error);
          setError(t?.sharedResources?.initError || 'Failed to initialize user data');
        }
      }
    };

    initializeUser();
  }, [user, fetchSharedFiles, t]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="p-6 menu-sharedfiles">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-semibold">{t?.sharedResources?.title || "Shared Resources"}</h1>
        <button
          onClick={() => setSelectedFile({ id: '', name: 'New Share' })}
          className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 menu-sharedfiles-upload"
        >
          <Upload className="w-5 h-5" />
          {t?.sharedResources?.shareNewFile || "Share New File"}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <div className="grid gap-8">
        {/* Shared by me */}
        <div className="menu-sharedfiles-by-me">
          <h2 className="text-xl font-medium mb-4 flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            {t?.sharedResources?.sharedByMe || "Shared by me"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sharedByMe.length === 0 ? (
              <div className="col-span-full p-8 text-center text-gray-500 bg-white rounded-lg shadow-sm">
                {t?.sharedResources?.noFilesSharedByMe || "You haven't shared any files yet"}
              </div>
            ) : (
              sharedByMe.map((file) => (
                <FileCard
                  key={file.id}
                  file={file}
                  onShare={() => setSelectedFile({ id: file.id, name: file.name })}
                  onRevoke={() => handleRevoke(file.id)}
                  onDelete={() => handleDeleteFile(file.id)}
                />
              ))
            )}
          </div>
        </div>

        {/* Shared with me */}
        <div className="menu-sharedfiles-with-me">
          <h2 className="text-xl font-medium mb-4 flex items-center gap-2">
            <Users className="w-5 h-5" />
            {t?.sharedResources?.sharedWithMe || "Shared with me"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sharedWithMe.length === 0 ? (
              <div className="col-span-full p-8 text-center text-gray-500 bg-white rounded-lg shadow-sm">
                {t?.sharedResources?.noFilesSharedWithMe || "No files have been shared with you"}
              </div>
            ) : (
              sharedWithMe.map((fileShare) => {
                // Sprawdź czy fileShare i fileShare.file istnieją
                if (!fileShare || !fileShare.file) {
                  return null;
                }
                
                const file = fileShare.file;
                
                // Określ kto udostępnił plik - zmiana deklaracji zmiennej na bardziej ogólny typ string
                let sharedBy: string = t?.sharedResources?.unknownUser || 'Unknown user';

                // Przypisanie wartości - teraz nie ma konfliktu typów
                if (fileShare.sharedByAdminId) sharedBy = fileShare.sharedByAdminId;
                if (fileShare.sharedByTeacherId) sharedBy = fileShare.sharedByTeacherId;
                if (fileShare.sharedByStudentId) sharedBy = fileShare.sharedByStudentId;
                if (fileShare.sharedByParentId) sharedBy = fileShare.sharedByParentId;
                
                return (
                  <div key={file.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-200 p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div>
                          <h3 className="font-medium text-gray-900 truncate max-w-[200px]">
                            {file.name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {t?.sharedResources?.sharedBy || "Shared by"} {sharedBy}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDownload(file.id, file.name)}
                        className="inline-flex items-center p-2 text-gray-500 hover:text-gray-700"
                        title={t?.sharedResources?.download || "Download"}
                      >
                        <Download className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {selectedFile && (
        <ShareFileModal
          fileId={selectedFile.id}
          fileName={selectedFile.name}
          isOpen={!!selectedFile}
          onClose={handleModalClose}
          onSuccess={fetchSharedFiles}
        />
      )}
    </div>
  );
};

export default SharedResourcesPage;