import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://ovgemjljdjonimnswvjq.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

export const uploadImage = async (file, userId) => {
  const fileExt = file.originalname.split('.').pop();
  const fileName = `${userId}-${Date.now()}.${fileExt}`;

  const { data, error } = await supabase.storage
    .from('chat-images')
    .upload(fileName, file.buffer, {
      contentType: file.mimetype,
      upsert: false,
    });

  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage
    .from('chat-images')
    .getPublicUrl(fileName);

  return {
    url: publicUrl,
    path: fileName,
    fileName: file.originalname,
    mimeType: file.mimetype,
    size: file.size,
  };
};