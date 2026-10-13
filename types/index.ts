export type Disposition = "active" | "keep" | "sell" | "donate" | "toss";
export type ProcessingState = "uploaded" | "processing" | "ready" | "failed";
export type Category =
  "Home" | "Clothing" | "Electronics" | "Books" | "Kitchen" | "Other";
export interface InventoryItem {
  id: string;
  user_id: string;
  name: string;
  description: string;
  category: Category;
  location: string;
  condition: string;
  notes: string;
  disposition: Disposition;
  processing_state: ProcessingState;
  original_path: string;
  image_path: string | null;
  image_url: string;
  original_url: string;
  warning: string | null;
  deleting: boolean;
  attempts: number;
  workflow_run_id: string | null;
  listing_title: string;
  listing_body: string;
  price_low: number | null;
  price_high: number | null;
  asking_price: number | null;
  price_basis: string;
  currency: string;
  created_at: string;
  updated_at: string;
}
export const categories: Category[] = [
  "Home",
  "Clothing",
  "Electronics",
  "Books",
  "Kitchen",
  "Other",
];
export const dispositionLabels: Record<Disposition, string> = {
  active: "Undecided",
  keep: "Keep",
  sell: "Sell",
  donate: "Donate",
  toss: "Toss",
};

export type GridItem = Pick<
  InventoryItem,
  | "id"
  | "name"
  | "category"
  | "location"
  | "disposition"
  | "processing_state"
  | "warning"
  | "attempts"
  | "deleting"
  | "original_path"
  | "image_path"
  | "image_url"
  | "original_url"
  | "created_at"
  | "updated_at"
> & { sampleIndex?: number };
