export type ObjectStatus = "active" | "sold" | "donated" | "tossed";

export interface ObjectItem {
  id: string;
  originalImageUrl: string;
  transformedImageUrl: string | null;
  description: string;
  status: ObjectStatus;
  createdAt: Date;
  updatedAt: Date;
}

// Database row shape (snake_case)
export interface ObjectRow {
  id: string;
  user_id: string;
  original_image_url: string;
  transformed_image_url: string | null;
  description: string | null;
  status: ObjectStatus;
  created_at: string;
  updated_at: string;
}

export type PoofAction = "keep" | "sell" | "donate" | "toss";

// API response types
export interface UploadRecord {
  id: string;
  originalUrl: string;
}
