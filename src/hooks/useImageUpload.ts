import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

export function useImageUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const uploadImage = async (file: File): Promise<string | null> => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return null;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image must be less than 10MB');
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
      const filePath = `${user.id}/images/${fileName}`;

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
      toast.success('Image uploaded successfully');
      return publicUrl;
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image');
      return null;
    } finally {
      setIsUploading(false);
    }
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
    uploadMultipleImages,
    isUploading,
    uploadProgress,
  };
}
