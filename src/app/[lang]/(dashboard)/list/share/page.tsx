"use client";

import { useState, useEffect, useCallback } from 'react';
import { Share2, Download, Users, Upload, File, FileText, Image, Archive } from 'lucide-react';
import { useUser } from "@/context/AuthContext";
import { ShareFileModal } from '@/components/ShareFileModal';
import toast from 'react-hot-toast';
import { useTranslations } from '@/hooks/useTranslations';
import { formatDistanceToNow } from 'date-fns';

interface SharedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  createdAt: Date;
  shares: FileShare[];
}

interface User {
  id: string;
  username?: string;
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
  sharedByAdmin?: User;
  sharedByTeacher?: User;
  sharedByStudent?: User;
  sharedByParent?: User;
  file?: SharedFile;
}

const getFileIcon = (type: string) => {
  if (type?.startsWith('image/')) return <Image className="w-8 h-8 text-blue-400" />;
  if (type?.includes('pdf')) return <FileText className="w-8 h-8 text-red-400" />;
  if (type?.includes('zip') || type?.includes('rar')) return <Archive className="w-8 h-8 text-yellow-400" />;
  return <File className="w-8 h-8 text-slate-400" />;
};

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

      setSharedByMe(await sharedByMeRes.json());
      setSharedWithMe(await sharedWithMeRes.json());
      setError(null);
    } catch (err) {
      console.error('Error fetching shared files:', err);
      setError(t?.sharedResources?.errorLoading || 'Failed to load shared files');
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    if (user?.userId) {
      fetchSharedFiles();
    }
  }, [user, fetchSharedFiles]);

  const handleRevoke = useCallback(async (fileId: string) => {
    try {
      const response = await fetch(`/api/share/${fileId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to revoke access');
      toast.success(t?.sharedResources?.revokeSuccess || 'Access revoked successfully');
      await fetchSharedFiles();
    } catch (err) {
      toast.error(t?.sharedResources?.revokeError || 'Failed to revoke access');
    }
  }, [fetchSharedFiles, t]);

  const handleDownload = useCallback(async (fileId: string, fileName: string) => {
    try {
      const a = document.createElement('a');
      a.href = `/api/download-file?fileId=${encodeURIComponent(fileId)}`;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      toast.error('Failed to initiate file download');
    }
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-semibold text-slate-800">
          {t?.sharedResources?.title || "Udostępnione pliki"}
        </h1>
        <button
          onClick={() => setSelectedFile({ id: '', name: 'New Share' })}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 text-sm font-medium transition-colors"
        >
          <Upload className="w-4 h-4" />
          {t?.sharedResources?.shareNewFile || "Udostępnij plik"}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-6 text-sm">
          {error}
        </div>
      )}

      <div className="grid gap-8">
        {/* Shared by me */}
        <div>
          <h2 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
            <Share2 className="w-4 h-4 text-indigo-500" />
            {t?.sharedResources?.sharedByMe || "Udostępnione przeze mnie"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {sharedByMe.length === 0 ? (
              <div className="col-span-full py-10 text-center text-slate-400 bg-slate-50 rounded-xl border border-slate-200 text-sm">
                {t?.sharedResources?.noFilesSharedByMe || "Nie udostępniłeś jeszcze żadnych plików"}
              </div>
            ) : (
              sharedByMe.map((file) => (
                <div key={file.id} className="bg-white border border-slate-200 rounded-xl p-4 hover:border-slate-300 transition-colors">
                  <div className="flex items-start gap-3 mb-3">
                    {getFileIcon(file.type)}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-slate-800 text-sm truncate">{file.name}</h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {formatDistanceToNow(new Date(file.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                    {file.shares?.length > 0 && (
                      <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-medium flex-shrink-0">
                        {file.shares.length}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2 pt-3 border-t border-slate-100">
                    <button
                      onClick={() => setSelectedFile({ id: file.id, name: file.name })}
                      className="flex-1 text-xs py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
                    >
                      Udostępnij
                    </button>
                    {file.shares?.length > 0 && (
                      <button
                        onClick={() => handleRevoke(file.id)}
                        className="flex-1 text-xs py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
                      >
                        Cofnij
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Shared with me */}
        <div>
          <h2 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-500" />
            {t?.sharedResources?.sharedWithMe || "Udostępnione mi"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {sharedWithMe.length === 0 ? (
              <div className="col-span-full py-10 text-center text-slate-400 bg-slate-50 rounded-xl border border-slate-200 text-sm">
                {t?.sharedResources?.noFilesSharedWithMe || "Żaden plik nie został Ci udostępniony"}
              </div>
            ) : (
              sharedWithMe.map((fileShare) => {
                if (!fileShare?.file) return null;
                const file = fileShare.file;
                const sharedBy = fileShare.sharedByAdmin?.username
                  || fileShare.sharedByTeacher?.username
                  || fileShare.sharedByStudent?.username
                  || fileShare.sharedByParent?.username
                  || t?.sharedResources?.unknownUser || 'Nieznany';

                return (
                  <div key={file.id} className="bg-white border border-slate-200 rounded-xl p-4 hover:border-slate-300 transition-colors">
                    <div className="flex items-start gap-3">
                      {getFileIcon(file.type)}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-slate-800 text-sm truncate">{file.name}</h3>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {t?.sharedResources?.sharedBy || "Od"}: {sharedBy}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDownload(file.id, file.name)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title={t?.sharedResources?.download || "Pobierz"}
                      >
                        <Download className="w-4 h-4" />
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
          onClose={() => setSelectedFile(null)}
          onSuccess={fetchSharedFiles}
        />
      )}
    </div>
  );
};

export default SharedResourcesPage;
