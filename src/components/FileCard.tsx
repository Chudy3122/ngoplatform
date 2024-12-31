import { FileIcon, ImageIcon, FileTextIcon, FileArchiveIcon } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface FileCardProps {
  file: {
    id: string;
    name: string;
    type: string;
    createdAt: Date;
    shares: any[];
  };
  onShare: () => void;
  onRevoke: () => void;
  onDelete: () => void;
}

const getFileIcon = (fileType: string) => {
  if (fileType.startsWith('image/')) return <ImageIcon className="w-12 h-12 text-blue-500" />;
  if (fileType.includes('pdf')) return <FileTextIcon className="w-12 h-12 text-red-500" />;
  if (fileType.includes('zip') || fileType.includes('rar')) 
    return <FileArchiveIcon className="w-12 h-12 text-yellow-500" />;
  return <FileIcon className="w-12 h-12 text-gray-500" />;
};

export const FileCard = ({ file, onShare, onRevoke, onDelete }: FileCardProps) => {
  return (
    <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-200">
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            {getFileIcon(file.type)}
            <div>
              <h3 className="font-medium text-gray-900 truncate max-w-[200px]">
                {file.name}
              </h3>
              <p className="text-sm text-gray-500">
                {formatDistanceToNow(new Date(file.createdAt), { addSuffix: true })}
              </p>
            </div>
          </div>
          {file.shares.length > 0 && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Shared with {file.shares.length}
            </span>
          )}
        </div>

        {/* Shared Users */}
        {file.shares.length > 0 && (
          <div className="mt-3">
            <div className="flex -space-x-2 overflow-hidden">
              {file.shares.slice(0, 3).map((share, index) => (
                <div
                  key={index}
                  className="inline-block h-8 w-8 rounded-full bg-gray-100 border-2 border-white text-center leading-6 text-xs font-medium uppercase"
                  title={share.username}
                >
                  {share.username?.charAt(0) || '?'}
                </div>
              ))}
              {file.shares.length > 3 && (
                <div className="inline-block h-8 w-8 rounded-full bg-gray-100 border-2 border-white text-center leading-6 text-xs font-medium">
                  +{file.shares.length - 3}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="mt-4 flex justify-end space-x-2">
          <button
            onClick={onShare}
            className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Share
          </button>
          {file.shares.length > 0 && (
            <button
              onClick={onRevoke}
              className="inline-flex items-center px-2.5 py-1.5 border border-red-300 text-xs font-medium rounded text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Revoke Access
            </button>
          )}
          <button
            onClick={onDelete}
            className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};
