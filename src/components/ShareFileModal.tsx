import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Users, Upload } from 'lucide-react';
import { toast } from 'react-toastify';
import { Button } from "@/components/ui/button";
import { Input } from '@/components/ui/input';
import { useUser } from "@clerk/nextjs";

interface User {
  id: string;
  username: string;
  email: string;
  type: 'admin' | 'teacher' | 'student' | 'parent';
}

interface ShareFileModalProps {
  fileId: string;
  fileName: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => Promise<void>; // Dodajemy nowy prop dla odświeżania
}

export const ShareFileModal = ({ 
  fileId: initialFileId, 
  fileName: initialFileName, 
  isOpen, 
  onClose,
  onSuccess 
}: ShareFileModalProps) => {
  const { user } = useUser();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [currentFileId, setCurrentFileId] = useState<string>(initialFileId);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSearch = async (query: string) => {
    if (query.length < 2) {
      setUsers([]);
      return;
    }
    
    try {
      const response = await fetch(`/api/users/search?q=${query}`);
      if (!response.ok) throw new Error('Failed to search users');
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error searching users:', error);
      toast.error('Failed to search users');
    }
  };

  

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      setLoading(true);
      console.log('Current user ID:', user?.id);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload file');
      }

      const data = await response.json();
      setCurrentFileId(data.id);
      setUploadedFile(file);
      toast.success('File uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to upload file');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (selectedUsers.length === 0) {
      toast.error('Please select at least one user');
      return;
    }
  
    if (!currentFileId) {
      toast.error('No file selected');
      return;
    }
  
    setLoading(true);
    try {
      console.log('Attempting to share file:', {
        fileId: currentFileId,
        targetUserIds: selectedUsers,
        accessType: 'READ'
      });
  
      const response = await fetch('/api/share', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileId: currentFileId,
          targetUserIds: selectedUsers, // Teraz wysyłamy całą tablicę ID
          accessType: 'READ'
        }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Share response error:', errorData);
        throw new Error(errorData.error || 'Failed to share file');
      }
  
      const data = await response.json();
      console.log('Share response:', data);
  
      toast.success(`File shared with ${selectedUsers.length} user${selectedUsers.length > 1 ? 's' : ''}`);
      if (onSuccess) {
        await onSuccess();
      }
      onClose();
    } catch (error) {
      console.error('Share error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to share file');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] menu-sharedfiles-modal">
        <DialogHeader>
          <DialogTitle>Udostępnij plik</DialogTitle>
          <DialogDescription>
            {initialFileId ? 
              'Wybierz użytkowników, którym chcesz udostępnić ten plik.' :
              'Wybierz plik i użytkowników, którym chcesz go udostępnić.'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Select File</label>
            <div className="flex gap-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
              />
              <Button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                Upload File
              </Button>
              {uploadedFile && (
                <div className="flex-1 p-2 bg-gray-50 rounded truncate">
                  {uploadedFile.name}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Share with</label>
            <Input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setSearchQuery(e.target.value);
                handleSearch(e.target.value);
              }}
              className="w-full"
            />
          </div>

          <div className="max-h-60 overflow-y-auto border rounded p-2">
            {users.map((user) => (
              <div
                key={user.id}
                className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
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
                  className="rounded border-gray-300"
                />
                <div>
                  <div className="font-medium">{user.username}</div>
                  <div className="text-sm text-gray-500">{user.email}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              className="bg-transparent border border-gray-300 text-gray-700 hover:bg-gray-50"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="bg-blue-600 text-white hover:bg-blue-700"
              onClick={handleShare}
              disabled={loading || selectedUsers.length === 0 || (!currentFileId && !uploadedFile)}
            >
              {loading ? 'Processing...' : 'Share'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};