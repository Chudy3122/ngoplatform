import { useState, useEffect } from 'react';
import { Upload, List, Grid, FolderPlus, File, Trash2, Loader2 } from 'lucide-react';
import { storage, db } from '@/lib/firebase';
import { 
  ref, 
  uploadBytesResumable, 
  getDownloadURL,
  deleteObject 
} from 'firebase/storage';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs,
  deleteDoc,
  doc 
} from 'firebase/firestore';
import { useUser } from "@clerk/nextjs";

export default function FileStorage() {
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [files, setFiles] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { user } = useUser();

  useEffect(() => {
    if (user) {
      loadFiles();
    }
  }, [user]);

  const loadFiles = async () => {
    if (!user?.id) return;
    
    const q = query(collection(db, "files"), where("userId", "==", user.id));
    const querySnapshot = await getDocs(q);
    const filesList = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setFiles(filesList);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || !event.target.files[0]) return;
    if (!user?.id) return;

    const file = event.target.files[0];
    setUploading(true);

    // Create storage reference
    const storageRef = ref(storage, `files/${user.id}/${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on('state_changed', 
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
      },
      (error) => {
        console.error("Upload error:", error);
        setUploading(false);
      },
      async () => {
        // Upload completed successfully
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        
        // Save file metadata to Firestore
        await addDoc(collection(db, "files"), {
          name: file.name,
          size: file.size,
          type: file.type,
          url: downloadURL,
          userId: user.id,
          createdAt: new Date().toISOString()
        });

        setUploading(false);
        setUploadProgress(0);
        loadFiles(); // Reload files list
      }
    );
  };

  const handleDelete = async (fileId: string, fileName: string) => {
    if (!user?.id) return;

    try {
      // Delete from Storage
      const storageRef = ref(storage, `files/${user.id}/${fileName}`);
      await deleteObject(storageRef);

      // Delete from Firestore
      await deleteDoc(doc(db, "files", fileId));

      loadFiles(); // Reload files list
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg">
      {/* Top Bar */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-4">
          <label className="flex items-center gap-2 bg-lamaSky text-gray-700 px-4 py-2 rounded-md hover:bg-opacity-80 cursor-pointer">
            <Upload size={20} />
            Upload File
            <input
              type="file"
              className="hidden"
              onChange={handleFileUpload}
              disabled={uploading}
            />
          </label>
          <button className="flex items-center gap-2 bg-lamaPurple text-gray-700 px-4 py-2 rounded-md hover:bg-opacity-80">
            <FolderPlus size={20} />
            New Folder
          </button>
        </div>
        <div className="flex gap-2">
          <button 
            className={`p-2 rounded-md ${view === 'grid' ? 'bg-gray-100' : ''}`}
            onClick={() => setView('grid')}
          >
            <Grid size={20} />
          </button>
          <button 
            className={`p-2 rounded-md ${view === 'list' ? 'bg-gray-100' : ''}`}
            onClick={() => setView('list')}
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
            <span className="text-sm text-gray-500">Uploading... {Math.round(uploadProgress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-lamaSky h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Files Display */}
      {view === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {files.map((file) => (
            <div key={file.id} className="p-4 border rounded-lg hover:bg-gray-50">
              <div className="flex justify-between items-start mb-2">
                <File size={40} className="text-gray-400" />
                <button 
                  className="text-gray-400 hover:text-gray-600"
                  onClick={() => handleDelete(file.id, file.name)}
                >
                  <Trash2 size={16} />
                </button>
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
                <button 
                  className="text-gray-400 hover:text-gray-600"
                  onClick={() => handleDelete(file.id, file.name)}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}