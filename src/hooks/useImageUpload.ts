import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

type MediaType = 'image' | 'video';

export function useImageUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const uploadMedia = async (file: File, type: MediaType = 'image'): Promise<string | null> => {
    const isImage = type === 'image';
    const validPrefix = isImage ? 'image/' : 'video/';
    
    if (!file.type.startsWith(validPrefix)) {
      toast.error(`Please select a ${type} file`);
      return null;
    }

    const maxSize = isImage ? 10 * 1024 * 1024 : 100 * 1024 * 1024; // 10MB for images, 100MB for videos
    if (file.size > maxSize) {
      toast.error(`${isImage ? 'Image' : 'Video'} must be less than ${isImage ? '10MB' : '100MB'}`);
      return null;
    }

    // Get current user for user-scoped storage path
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error('You must be authenticated to upload');
      return null;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      // User-scoped path ensures users can only access their own files
      const folder = isImage ? 'images' : 'videos';
      const filePath = `${user.id}/${folder}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('signage-media')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('signage-media')
        .getPublicUrl(filePath);

      setUploadProgress(100);
      toast.success(`${isImage ? 'Image' : 'Video'} uploaded successfully`);
      return publicUrl;
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(`Failed to upload ${type}`);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  // Legacy method for backwards compatibility
  const uploadImage = async (file: File): Promise<string | null> => {
    return uploadMedia(file, 'image');
  };

  const uploadVideo = async (file: File): Promise<string | null> => {
    return uploadMedia(file, 'video');
  };

  const uploadMultipleImages = async (files: FileList): Promise<string[]> => {
    const urls: string[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const url = await uploadImage(files[i]);
      if (url) urls.push(url);
      setUploadProgress(((i + 1) / files.length) * 100);
    }
    
    return urls;
  };

  return {
    uploadImage,
    uploadVideo,
    uploadMedia,
    uploadMultipleImages,
    isUploading,
    uploadProgress,
  };
}
