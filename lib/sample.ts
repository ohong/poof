import type { InventoryItem } from "@/types";
export type DisplayItem = InventoryItem & { sampleIndex?: number };
const objects = [
  [
    "Blue stoneware mug",
    "A deep blue glaze, a generous handle, and a place in the morning routine.",
    "Kitchen",
  ],
  [
    "Silver compact camera",
    "A silver metal body with a dark textured grip and a glass lens.",
    "Electronics",
  ],
  [
    "Over-ear headphones",
    "Cushioned ear cups folded neatly into a black curved headband.",
    "Electronics",
  ],
  [
    "Pothos in terracotta",
    "Heart-shaped leaves spill over a weathered terracotta pot.",
    "Home",
  ],
  [
    "Everyday canvas tote",
    "Soft cotton canvas, two long handles, and the marks of daily use.",
    "Clothing",
  ],
  [
    "Red canvas sneaker",
    "Faded red canvas, cream laces, and a well-worn rubber sole.",
    "Clothing",
  ],
  [
    "Ribbed glass vase",
    "Translucent green glass gathers the light along its vertical ribs.",
    "Home",
  ],
  [
    "Wooden alarm clock",
    "A rounded wooden frame holds a cream face and three dark hands.",
    "Home",
  ],
  [
    "Yellow hardback book",
    "A cloth-bound volume with a mustard cover and no jacket.",
    "Books",
  ],
];
export const sampleItems: DisplayItem[] = objects.map(
  ([name, description, category], sampleIndex) => ({
    id: `sample-${sampleIndex}`,
    user_id: "sample",
    name,
    description,
    category: category as InventoryItem["category"],
    location: "",
    condition: "Check condition before listing",
    notes: "",
    disposition: sampleIndex === 0 || sampleIndex === 3 ? "keep" : "active",
    processing_state: "ready",
    original_path: "",
    image_path: null,
    image_url: "/samples/collection.png",
    original_url: "/samples/collection.png",
    sampleIndex,
    warning: null,
    deleting: false,
    attempts: 0,
    workflow_run_id: null,
    listing_title: name,
    listing_body: `${name}. ${description}\n\nPlease confirm the condition, dimensions, and any included accessories before posting.`,
    price_low: sampleIndex === 0 ? 5 : sampleIndex === 1 ? 25 : 8,
    price_high: sampleIndex === 0 ? 12 : sampleIndex === 1 ? 60 : 20,
    asking_price: null,
    price_basis: "Illustrative estimate. No market data was checked.",
    currency: "USD",
    created_at: "2026-10-13T00:00:00Z",
    updated_at: "2026-10-13T00:00:00Z",
  }),
);
