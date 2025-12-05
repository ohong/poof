export type ObjectStatus = 'active' | 'sold' | 'donated' | 'tossed'

export interface InventoryObject {
  id: string
  user_id: string
  original_image_url: string
  transformed_image_url: string | null
  description: string | null
  status: ObjectStatus
  created_at: string
  updated_at: string
}

export interface UploadedFile {
  id: string
  originalUrl: string
}

// Type alias for processed objects (same as InventoryObject for now)
export type ProcessedObject = InventoryObject

export interface ApiResponse<T> {
  data?: T
  error?: string
}

export interface UploadResponse {
  uploads: UploadedFile[]
  errors: string[]
}

export interface ProcessResponse {
  objects: InventoryObject[]
  errors: string[]
}
