import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = () => {
  return (
    Boolean(supabaseUrl) &&
    Boolean(supabaseAnonKey) &&
    supabaseUrl.startsWith('https://') &&
    !supabaseUrl.includes('tu-proyecto')
  );
};

// Cliente oficial de Supabase
export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export const STORAGE_BUCKET = 'p2p-receipts';

/**
 * Sube una imagen o archivo al bucket de almacenamiento de Supabase.
 * Retorna la URL pública accesible.
 */
export async function uploadReceiptFile(
  file: File,
  prefix: 'banco' | 'binance'
): Promise<string> {
  if (!isSupabaseConfigured() || !supabase) {
    // Si no está conectado a Supabase, se guarda como Data URL local (Base64)
    // para visualización inmediata en modo offline/demo
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.readAsDataURL(file);
    });
  }

  const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const path = `${prefix}/${Date.now()}_${cleanFileName}`;

  const { error: uploadError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (uploadError) {
    console.error('Error subiendo comprobante a Supabase Storage:', uploadError);
    throw new Error(`Error al subir comprobante: ${uploadError.message}`);
  }

  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
