"use client";

import { useState, useEffect } from "react";
import { FileText, Book, Package, Upload, Download, Info, Trash2 } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { useTranslations } from "@/hooks/useTranslations";
import { useParams } from "next/navigation";
import FileUploadModal from "./FileUploadModal";

interface ResourcesClientProps {
  userRole?: string;
}

interface ResourceFile {
  id: string;
  name: string;
  description: string;
  mimeType: string;
  size: number;
  section: string;
  uploadedAt: string;
  downloads: number;
}

type SectionId = "documents" | "training" | "other";

const SECTIONS: Array<{
  id: SectionId;
  icon: JSX.Element;
}> = [
  {
    id: "documents",
    icon: <FileText className="w-5 h-5" />,
  },
  {
    id: "training",
    icon: <Book className="w-5 h-5" />,
  },
  {
    id: "other",
    icon: <Package className="w-5 h-5" />,
  },
];

export default function ResourcesClient({ userRole }: ResourcesClientProps) {
  const { user } = useUser();
  const params = useParams();
  const lang = params?.lang || 'pl';
  const t = useTranslations();
  const [activeSection, setActiveSection] = useState<SectionId>(SECTIONS[0].id);
  const [files, setFiles] = useState<ResourceFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<ResourceFile | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/resources?section=${activeSection}`);
      if (response.ok) {
        const data = await response.json();
        setFiles(data);
      }
    } catch (error) {
      console.error("Error fetching files:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [activeSection]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDownload = async (file: ResourceFile) => {
    try {
      const response = await fetch(`/api/resources/${file.id}/download`);
      if (!response.ok) throw new Error('Download failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading file:", error);
    }
  };

  const handleDelete = async (file: ResourceFile) => {
    if (!confirm(t.resources.file.deleteConfirm)) {
      return;
    }

    try {
      const response = await fetch(`/api/resources/${file.id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Delete failed');
      }

      fetchFiles();
    } catch (error) {
      console.error("Error deleting file:", error);
    }
  };

  const FileInfoModal = ({ file }: { file: ResourceFile }) => {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full">
          <h3 className="text-lg font-semibold mb-4">{file.name}</h3>
          <div className="space-y-3">
            <p className="text-sm text-gray-600">{file.description}</p>
            <div className="flex justify-between text-sm text-gray-500">
              <span>{t.resources.file.size}: {formatFileSize(file.size)}</span>
              <span>{t.resources.file.downloads || 'Pobrania'}: {file.downloads}</span>
            </div>
            <p className="text-sm text-gray-500">
              {t.resources.file.added || 'Dodano'}: {new Date(file.uploadedAt).toLocaleDateString()}
            </p>
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <button
              onClick={() => setSelectedFile(null)}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              {t.common.cancel}
            </button>
            <button
              onClick={() => handleDownload(file)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              {t.resources.file.download}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6 border-b flex justify-between items-center">
        <h1 className="text-2xl font-semibold">{t.resources.title}</h1>
        {userRole === 'admin' && (
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            <Upload className="w-4 h-4" />
            {t.resources.upload.button}
          </button>
        )}
      </div>

      <div className="flex">
        <div className="w-64 border-r p-4">
          {SECTIONS.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left mb-2 ${
                activeSection === section.id
                  ? "bg-blue-50 text-blue-600"
                  : "hover:bg-gray-50"
              }`}
            >
              {section.icon}
              <span>{t.resources.categories[section.id]}</span>
            </button>
          ))}
        </div>

        <div className="flex-1 p-6">
          {loading ? (
            <div className="flex justify-center items-center h-48">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="grid gap-4">
              {files.map((file) => (
                <div key={file.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-gray-400" />
                    <div>
                      <h3 className="font-medium">{file.name}</h3>
                      <p className="text-sm text-gray-500">
                        {formatFileSize(file.size)} • {file.mimeType?.toUpperCase() || t.resources.file.unknown}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedFile(file)}
                      className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                      title={t.resources.file.info}
                    >
                      <Info className="w-5 h-5" />
                    </button>
                    {userRole === 'admin' && (
                      <button
                        onClick={() => handleDelete(file)}
                        className="p-2 text-red-400 hover:text-red-600 rounded-full hover:bg-red-50"
                        title={t.resources.file.delete}
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDownload(file)}
                      className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                    >
                      <Download className="w-4 h-4" />
                      {t.resources.file.download}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showUploadModal && (
        <FileUploadModal
          onClose={() => setShowUploadModal(false)}
          section={activeSection}
          onUploadSuccess={() => {
            setShowUploadModal(false);
            fetchFiles();
          }}
        />
      )}
      {selectedFile && <FileInfoModal file={selectedFile} />}
    </div>
  );
}