import { supabase } from '@/integrations/supabase/client';

export async function uploadFile(
  bucket: 'child-photos' | 'diary-photos' | 'strategy-audio',
  file: File,
  userId: string
): Promise<{ url: string | null; error: string | null }> {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      return { url: null, error: uploadError.message };
    }

    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);

    return { url: urlData.publicUrl, error: null };
  } catch (err) {
    return { url: null, error: 'Failed to upload file' };
  }
}

export async function deleteFile(
  bucket: 'child-photos' | 'diary-photos' | 'strategy-audio',
  url: string
): Promise<{ error: string | null }> {
  try {
    // Extract path from URL
    const urlParts = url.split(`${bucket}/`);
    if (urlParts.length < 2) {
      return { error: 'Invalid file URL' };
    }
    const path = urlParts[1];

    const { error } = await supabase.storage.from(bucket).remove([path]);
    
    if (error) {
      return { error: error.message };
    }
    
    return { error: null };
  } catch (err) {
    return { error: 'Failed to delete file' };
  }
}
