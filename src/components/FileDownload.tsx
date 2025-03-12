// components/FileDownload.tsx
import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
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
      
      // Użyj endpointu proxy zamiast bezpośredniego URL Firebase
      const proxyUrl = `/api/firebase-proxy?path=${encodeURIComponent(filePath)}`;
      
      // Utwórz link do pobrania
      const a = document.createElement('a');
      a.href = proxyUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      toast.success('File download started');
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