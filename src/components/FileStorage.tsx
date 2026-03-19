"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Upload,
  List,
  Grid,
  File,
  Trash2,
  Loader2,
  Download,
  Share,
  X,
} from "lucide-react";
import { useUser } from "@/context/AuthContext";
import { useTranslations } from "@/hooks/useTranslations";
import toast from "react-hot-toast";

interface FileData {
  id: string;
  name: string;
  size: number;
  type: string;
  createdAt: string;
  isShared?: boolean;
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

const ShareModal: React.FC<ShareModalProps> = ({ users, onShare, onClose }) => {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredUsers = users.filter(
    (u) =>
      u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-96 max-h-[80vh] flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Udostępnij użytkownikom</h3>
          <button onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <input
          type="text"
          placeholder="Szukaj użytkowników..."
          className="w-full p-2 border rounded-md mb-4"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <div className="flex-1 overflow-y-auto mb-4">
          {filteredUsers.length === 0 ? (
            <p className="text-gray-500 text-center">Brak użytkowników</p>
          ) : (
            filteredUsers.map((u) => (
              <div
                key={u.id}
                className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-md"
              >
                <input
                  type="checkbox"
                  checked={selectedUsers.includes(u.id)}
                  onChange={(e) => {
                    setSelectedUsers((prev) =>
                      e.target.checked
                        ? [...prev, u.id]
                        : prev.filter((id) => id !== u.id)
                    );
                  }}
                  className="h-4 w-4"
                />
                <div className="flex-1">
                  <p className="font-medium">{u.name ?? u.email}</p>
                  {u.email && (
                    <p className="text-sm text-gray-500">{u.email}</p>
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
            Anuluj
          </button>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
            onClick={() => onShare(selectedUsers)}
            disabled={selectedUsers.length === 0}
          >
            Udostępnij
          </button>
        </div>
      </div>
    </div>
  );
};

export default function FileStorage() {
  const [view, setView] = useState<"grid" | "list">("grid");
  const [files, setFiles] = useState<FileData[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [users, setUsers] = useState<UserListItem[]>([]);

  const { user, isLoaded } = useUser();
  const t = useTranslations();

  const loadFiles = useCallback(async () => {
    try {
      const res = await fetch("/api/upload");
      if (!res.ok) throw new Error("Błąd ładowania plików");
      const data = await res.json();
      setFiles(data);
      setError(null);
    } catch {
      setError("Nie można załadować plików");
    }
  }, []);

  useEffect(() => {
    if (user) loadFiles();
  }, [user, loadFiles]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Błąd uploadu");
      }

      toast.success("Plik przesłany pomyślnie");
      await loadFiles();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Błąd uploadu");
      toast.error("Nie udało się przesłać pliku");
    } finally {
      setUploading(false);
      setUploadProgress(0);
      e.target.value = "";
    }
  };

  const handleDownload = (fileId: string, fileName: string) => {
    const a = document.createElement("a");
    a.href = `/api/download-file?id=${fileId}`;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDelete = async (fileId: string) => {
    if (!confirm("Usunąć ten plik?")) return;

    try {
      const res = await fetch(`/api/upload?id=${fileId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Błąd usuwania");

      toast.success("Plik usunięty");
      setFiles((prev) => prev.filter((f) => f.id !== fileId));
    } catch {
      toast.error("Nie udało się usunąć pliku");
    }
  };

  const handleShareFile = async (fileId: string) => {
    setSelectedFileId(fileId);
    try {
      const res = await fetch("/api/users/search");
      const data = await res.json();
      setUsers(
        data.filter((u: UserListItem) => u.id !== user?.userId)
      );
      setShowShareModal(true);
    } catch {
      toast.error("Błąd ładowania użytkowników");
    }
  };

  const handleShare = async (targetUserIds: string[]) => {
    if (!selectedFileId) return;

    try {
      await fetch("/api/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileId: selectedFileId,
          targetUserIds,
          accessType: "READ",
        }),
      });

      toast.success("Plik udostępniony");
      setShowShareModal(false);
      setSelectedFileId(null);
    } catch {
      toast.error("Błąd udostępniania");
    }
  };

  if (!isLoaded) return (
    <div className="flex items-center justify-center h-40">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
    </div>
  );
  if (!user)
    return (
      <div className="p-6 text-sm text-slate-500">Zaloguj się, aby uzyskać dostęp do biblioteki.</div>
    );

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
      {/* Actions Bar */}
      <div className="flex justify-between items-center p-5 border-b border-slate-100 mb-0">
        <div className="flex gap-4">
          <label className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 cursor-pointer text-sm font-medium transition-colors">
            <Upload size={20} />
            {t.library?.upload?.button ?? "Prześlij plik"}
            <input
              type="file"
              className="hidden"
              onChange={handleFileUpload}
              disabled={uploading}
            />
          </label>
        </div>

        <div className="flex gap-1">
          <button
            className={`p-2 rounded-lg transition-colors ${view === "grid" ? "bg-slate-100 text-slate-700" : "text-slate-400 hover:bg-slate-50"}`}
            onClick={() => setView("grid")}
          >
            <Grid size={18} />
          </button>
          <button
            className={`p-2 rounded-lg transition-colors ${view === "list" ? "bg-slate-100 text-slate-700" : "text-slate-400 hover:bg-slate-50"}`}
            onClick={() => setView("list")}
          >
            <List size={18} />
          </button>
        </div>
      </div>

      <div className="p-5">
      {/* Upload Progress */}
      {uploading && (
        <div className="mb-4 flex items-center gap-2 text-sm text-slate-500">
          <Loader2 className="animate-spin" size={16} />
          Przesyłanie... {uploadProgress > 0 ? `${Math.round(uploadProgress)}%` : ""}
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Files */}
      {files.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <File size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">Brak plików. Prześlij pierwszy plik.</p>
        </div>
      ) : view === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {files.map((file) => (
            <div key={file.id} className="p-4 border border-slate-200 rounded-xl hover:border-slate-300 hover:bg-slate-50/50 transition-colors">
              <div className="flex justify-between items-start mb-3">
                <File size={36} className="text-slate-300" />
                <div className="flex gap-0.5">
                  <button
                    className="text-slate-400 hover:text-indigo-600 p-1 rounded-lg hover:bg-indigo-50 transition-colors"
                    onClick={() => handleDownload(file.id, file.name)}
                    title="Pobierz"
                  >
                    <Download size={15} />
                  </button>
                  <button
                    className="text-slate-400 hover:text-emerald-600 p-1 rounded-lg hover:bg-emerald-50 transition-colors"
                    onClick={() => handleShareFile(file.id)}
                    title="Udostępnij"
                  >
                    <Share size={15} />
                  </button>
                  <button
                    className="text-slate-400 hover:text-red-500 p-1 rounded-lg hover:bg-red-50 transition-colors"
                    onClick={() => handleDelete(file.id)}
                    title="Usuń"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
              <div>
                <div className="font-medium truncate text-sm text-slate-800">{file.name}</div>
                <div className="text-xs text-slate-400 mt-0.5">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="border border-slate-200 rounded-xl divide-y divide-slate-100">
          {files.map((file) => (
            <div
              key={file.id}
              className="flex items-center justify-between p-4 hover:bg-slate-50/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <File size={20} className="text-slate-300 flex-shrink-0" />
                <div>
                  <div className="font-medium text-sm text-slate-800">{file.name}</div>
                  <div className="text-xs text-slate-400">
                    {new Date(file.createdAt).toLocaleDateString("pl-PL")}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-400">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </span>
                <div className="flex gap-0.5">
                  <button
                    className="text-slate-400 hover:text-indigo-600 p-1.5 rounded-lg hover:bg-indigo-50 transition-colors"
                    onClick={() => handleDownload(file.id, file.name)}
                  >
                    <Download size={15} />
                  </button>
                  <button
                    className="text-slate-400 hover:text-emerald-600 p-1.5 rounded-lg hover:bg-emerald-50 transition-colors"
                    onClick={() => handleShareFile(file.id)}
                  >
                    <Share size={15} />
                  </button>
                  <button
                    className="text-slate-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                    onClick={() => handleDelete(file.id)}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      </div>

      {showShareModal && selectedFileId && (
        <ShareModal
          users={users}
          onShare={handleShare}
          onClose={() => {
            setShowShareModal(false);
            setSelectedFileId(null);
          }}
        />
      )}
    </div>
  );
}
