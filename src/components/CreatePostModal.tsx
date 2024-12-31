"use client";

import { useState } from 'react';
import * as Dialog from "@radix-ui/react-dialog";
import PostForm from "./PostForm";
import { useTranslations } from '@/hooks/useTranslations';

export function CreatePostModal({ onPostCreated }: { onPostCreated?: () => void }) {
  const t = useTranslations();
  const [open, setOpen] = useState(false);

  const handlePostCreated = () => {
    onPostCreated?.();
    setOpen(false);
    window.location.reload(); // Odświeżenie po utworzeniu posta
  };
  
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          {t.posts.newPost}
        </button>
      </Dialog.Trigger>
      
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50" />
        
        <Dialog.Content 
          className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] bg-white p-6 rounded-lg shadow-xl w-full max-w-md"
          aria-describedby="modal-description"
        >
          <div className="flex justify-between items-center mb-4">
            <Dialog.Title className="text-xl font-bold">
              {t.posts.newPost}
            </Dialog.Title>
            <Dialog.Close className="text-gray-500 hover:text-gray-700">
              ×
            </Dialog.Close>
          </div>
          
          <Dialog.Description id="modal-description" className="sr-only">
            {t.posts.form.description}
          </Dialog.Description>
          
          <PostForm onPostCreated={onPostCreated} />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}