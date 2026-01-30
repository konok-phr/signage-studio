'use client';

import { useState, useCallback } from 'react';

interface UploadResult {
  url: string;
  path: string;
  size: number;
  type: string;
}

export function useImageUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const uploadFile = useCallback(async (file: File): Promise<UploadResult | null> => {
    setIsUploading(true);
    setProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }

      setProgress(100);
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Upload error:', error);
      return null;
    } finally {
      setIsUploading(false);
    }
  }, []);

  const deleteFile = useCallback(async (path: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/upload/${path}`, {
        method: 'DELETE',
      });

      return response.ok;
    } catch (error) {
      console.error('Delete error:', error);
      return false;
    }
  }, []);

  return {
    uploadFile,
    deleteFile,
    isUploading,
    progress,
  };
}
