'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { Product, ProductUpdate, TrackingMode } from '@/types/database'

export type ProductFormState =
  | {
      error?: string
      success?: boolean
      product?: Product
      deletedId?: string
    }
  | undefined

function parsePrice(value: FormDataEntryValue | null): number | null {
  if (value === null || value === '') return null
  const n = Number(String(value).replace(/,/g, ''))
  return Number.isFinite(n) ? n : null
}

function parseStock(value: FormDataEntryValue | null): number | null {
  if (value === null || value === '') return null
  const n = parseInt(String(value), 10)
  return Number.isFinite(n) ? n : null
}

function parseTrackingMode(value: FormDataEntryValue | null): TrackingMode {
  const s = String(value ?? '').trim()
  return s === 'unit' ? 'unit' : 'quantity'
}

/**
 * Check admin status by reading from session user metadata.
 * This is much faster than RPC because it doesn't require a network round trip - 
 * the role is stored in the JWT token in the session cookie.
 */
async function checkAdmin(): Promise<
  | { ok: false; error: string; supabase?: never }
  | { ok: true; supabase: Awaited<ReturnType<typeof createClient>> }
> {
  const startTime = Date.now()
  const supabase = await createClient()

  // Get user from session (reads from cookie, no network call)
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    return { ok: false, error: 'You must be logged in to manage products.' }
  }

  // Check role from user metadata (stored in JWT, no DB call needed)
  const role = user.user_metadata?.role || user.app_metadata?.role
  const isAdmin = role === 'admin'

  // Fallback: if role not in metadata, check profiles table (one-time fallback)
  if (!isAdmin && !role) {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || !profile || profile.role !== 'admin') {
      return { ok: false, error: 'You do not have permission to manage products.' }
    }
  } else if (!isAdmin) {
    return { ok: false, error: 'You do not have permission to manage products.' }
  }

  const duration = Date.now() - startTime
  if (duration > 50) {
    console.log(`[checkAdmin] took ${duration}ms (slower than expected)`)
  }

  return { ok: true, supabase }
}

/** Object path in the `images` bucket from a Supabase public URL; null if external or unknown. */
function objectPathInImagesBucketFromUrl(imageUrl: string | null): string | null {
  if (!imageUrl) return null
  const marker = '/storage/v1/object/public/images/'
  const i = imageUrl.indexOf(marker)
  if (i < 0) return null
  const raw = imageUrl.slice(i + marker.length).split('?')[0]
  try {
    const path = decodeURIComponent(raw)
    if (!path.startsWith('products/')) return null
    return path
  } catch {
    return null
  }
}

async function uploadProductImageIfPresent(
  supabase: Awaited<ReturnType<typeof createClient>>,
  file: File | null
): Promise<{ url: string | null; error?: string }> {
  if (!file || file.size === 0) {
    return { url: null }
  }
  if (file.size > 5 * 1024 * 1024) {
    return { url: null, error: 'Image must be 5MB or smaller.' }
  }
  if (!file.type.startsWith('image/')) {
    return { url: null, error: 'Please choose an image file.' }
  }
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
  const safeExt = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext) ? ext : 'jpg'
  const path = `products/${crypto.randomUUID()}.${safeExt}`

  const { error: uploadError } = await supabase.storage
    .from('images')
    .upload(path, file, { upsert: false })

  if (uploadError) {
    return { url: null, error: uploadError.message }
  }

  const { data } = supabase.storage.from('images').getPublicUrl(path)
  return { url: data.publicUrl }
}

export async function createProduct(
  _prevState: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  const totalStart = Date.now()

  // Check admin status and get supabase client
  const gate = await checkAdmin()
  if (!gate.ok) return { error: gate.error }
  const supabase = gate.supabase

  const name = String(formData.get('name') ?? '').trim()
  const type = String(formData.get('type') ?? '').trim() || 'General'
  const price = parsePrice(formData.get('price'))
  const tracking_mode = parseTrackingMode(formData.get('tracking_mode'))
  const stock_quantity =
    tracking_mode === 'unit' ? 0 : parseStock(formData.get('stock_quantity'))
  const image = formData.get('image') as File | null

  if (!name) return { error: 'Name is required.' }
  if (price === null || price < 0) return { error: 'Enter a valid price (0 or more).' }
  if (tracking_mode === 'quantity') {
    if (stock_quantity === null || stock_quantity < 0) {
      return { error: 'Enter a valid stock quantity (0 or more).' }
    }
  }

  // Upload image and prepare insert in parallel if possible
  const imageUploadStart = Date.now()
  const { url: image_url, error: imgErr } = await uploadProductImageIfPresent(supabase, image)
  const imageUploadDuration = Date.now() - imageUploadStart
  if (imageUploadDuration > 500) {
    console.log(`[createProduct] Image upload took ${imageUploadDuration}ms`)
  }
  if (imgErr) return { error: imgErr }

  const dbStart = Date.now()
  const { data, error } = await supabase
    .from('products')
    .insert({
      name,
      type,
      price,
      stock_quantity: stock_quantity ?? 0,
      tracking_mode,
      image_url,
    })
    .select()
    .single()

  const dbDuration = Date.now() - dbStart
  if (dbDuration > 200) {
    console.log(`[createProduct] DB insert took ${dbDuration}ms`)
  }

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/products')

  const totalDuration = Date.now() - totalStart
  if (totalDuration > 1000) {
    console.log(`[createProduct] TOTAL: ${totalDuration}ms (slow)`)
  } else {
    console.log(`[createProduct] TOTAL: ${totalDuration}ms`)
  }

  return { success: true, product: data as Product }
}

export async function updateProduct(
  productId: string,
  _prevState: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  const totalStart = Date.now()

  // Check admin status and get supabase client
  const gate = await checkAdmin()
  if (!gate.ok) return { error: gate.error }
  const supabase = gate.supabase

  const name = String(formData.get('name') ?? '').trim()
  const type = String(formData.get('type') ?? '').trim() || 'General'
  const price = parsePrice(formData.get('price'))
  const stock_quantity = parseStock(formData.get('stock_quantity'))
  const image = formData.get('image') as File | null

  if (!name) return { error: 'Name is required.' }
  if (price === null || price < 0) return { error: 'Enter a valid price (0 or more).' }

  const { data: existing, error: existingErr } = await supabase
    .from('products')
    .select('tracking_mode')
    .eq('id', productId)
    .maybeSingle()

  if (existingErr) return { error: existingErr.message }
  if (!existing) return { error: 'Product not found.' }

  if (existing.tracking_mode === 'quantity') {
    if (stock_quantity === null || stock_quantity < 0) {
      return { error: 'Enter a valid stock quantity (0 or more).' }
    }
  }

  let image_url: string | null | undefined = undefined
  if (image && image.size > 0) {
    const imageUploadStart = Date.now()
    const { url, error: imgErr } = await uploadProductImageIfPresent(supabase, image)
    const imageUploadDuration = Date.now() - imageUploadStart
    if (imageUploadDuration > 500) {
      console.log(`[updateProduct] Image upload took ${imageUploadDuration}ms`)
    }
    if (imgErr) return { error: imgErr }
    image_url = url
  }

  const patch: ProductUpdate = { name, type, price }
  if (existing.tracking_mode === 'quantity' && stock_quantity !== null) {
    patch.stock_quantity = stock_quantity
  }
  if (image_url !== undefined) {
    patch.image_url = image_url
  }

  const dbStart = Date.now()
  const { data, error } = await supabase
    .from('products')
    .update(patch)
    .eq('id', productId)
    .select()
    .single()

  const dbDuration = Date.now() - dbStart
  if (dbDuration > 200) {
    console.log(`[updateProduct] DB update took ${dbDuration}ms`)
  }

  if (error) {
    return { error: error.message }
  }
  if (!data) {
    return { error: 'Product not found.' }
  }

  revalidatePath('/products')

  const totalDuration = Date.now() - totalStart
  if (totalDuration > 1000) {
    console.log(`[updateProduct] TOTAL: ${totalDuration}ms (slow)`)
  } else {
    console.log(`[updateProduct] TOTAL: ${totalDuration}ms`)
  }

  return { success: true, product: data as Product }
}

export async function saveProduct(
  prevState: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  const id = String(formData.get('product_id') ?? '').trim()
  if (id) {
    return updateProduct(id, prevState, formData)
  }
  return createProduct(prevState, formData)
}

export async function deleteProduct(productId: string): Promise<ProductFormState> {
  const totalStart = Date.now()

  // Check admin status and get supabase client
  const gate = await checkAdmin()
  if (!gate.ok) return { error: gate.error }
  const supabase = gate.supabase

  // Fetch the product's image URL first (needed for cleanup)
  const fetchStart = Date.now()
  const { data: row, error: fetchError } = await supabase
    .from('products')
    .select('image_url')
    .eq('id', productId)
    .maybeSingle()

  const fetchDuration = Date.now() - fetchStart
  if (fetchDuration > 200) {
    console.log(`[deleteProduct] Fetch took ${fetchDuration}ms`)
  }

  if (fetchError) {
    return { error: fetchError.message }
  }
  if (!row) {
    return { error: 'Product not found.' }
  }

  const storagePath = objectPathInImagesBucketFromUrl(row.image_url)

  // Delete the product first (this is the critical operation)
  const dbStart = Date.now()
  const { error } = await supabase.from('products').delete().eq('id', productId)
  const dbDuration = Date.now() - dbStart

  if (dbDuration > 200) {
    console.log(`[deleteProduct] DB delete took ${dbDuration}ms`)
  }

  if (error) {
    if (error.code === '23503' || error.message.includes('foreign key')) {
      return {
        error:
          'Cannot delete this product because it has recorded sales. Remove or archive sales first.',
      }
    }
    return { error: error.message }
  }

  // Clean up storage asynchronously (don't block the response)
  if (storagePath) {
    // Fire and forget - log errors but don't block
    supabase.storage.from('images').remove([storagePath]).then(({ error: storageError }) => {
      if (storageError) {
        console.error('[deleteProduct] storage remove failed:', storageError.message)
      }
    })
  }

  revalidatePath('/products')

  const totalDuration = Date.now() - totalStart
  if (totalDuration > 1000) {
    console.log(`[deleteProduct] TOTAL: ${totalDuration}ms (slow)`)
  } else {
    console.log(`[deleteProduct] TOTAL: ${totalDuration}ms`)
  }

  return { success: true, deletedId: productId }
}
