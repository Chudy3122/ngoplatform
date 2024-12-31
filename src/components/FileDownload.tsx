// components/FileDownload.tsx
import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { storage } from '@/lib/firebase';
import { ref, getDownloadURL } from 'firebase/storage';
import { toast } from 'react-toastify';

interface FileDownloadProps {
  fileId: string;
  fileName: string;
  filePath: string;
}

export const FileDownload = ({ fileId, fileName, filePath }: FileDownloadProps) => {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    try {
      setDownloading(true);
      
      // Pobierz URL do pobrania pliku
      const fileRef = ref(storage, filePath);
      const downloadURL = await getDownloadURL(fileRef);

      // Pobierz plik
      const response = await fetch(downloadURL);
      const blob = await response.blob();

      // Utwórz link do pobrania
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('File downloaded successfully');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download file');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={downloading}
      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
    >
      {downloading ? (
        <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
      ) : (
        <Download className="w-5 h-5 text-gray-500" />
      )}
    </button>
  );
};