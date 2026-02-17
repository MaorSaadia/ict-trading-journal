import { createClient } from '@/lib/supabase/client'
import imageCompression from 'browser-image-compression'

export async function uploadTradeImage(file: File, userId: string): Promise<string> {
  const supabase = createClient()

  // Compress image
  const options = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
  }

  const compressedFile = await imageCompression(file, options)

  // Generate unique filename
  const fileExt = compressedFile.name.split('.').pop()
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
  const filePath = `${userId}/${fileName}`

  // Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from('trade-screenshots')
    .upload(filePath, compressedFile, {
      cacheControl: '3600',
      upsert: false,
    })

  if (error) {
    throw error
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('trade-screenshots')
    .getPublicUrl(data.path)

  return publicUrl
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function deleteTradeImage(imageUrl: string, id: string): Promise<void> {
  const supabase = createClient()

  // Extract file path from URL
  const urlParts = imageUrl.split('/trade-screenshots/')
  if (urlParts.length < 2) return

  const filePath = urlParts[1]

  // Delete from storage
  const { error } = await supabase.storage
    .from('trade-screenshots')
    .remove([filePath])

  if (error) {
    throw error
  }
}