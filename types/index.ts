export type ObjectStatus = "active" | "sold" | "donated" | "tossed";

export interface ObjectItem {
  id: string;
  color: string;
  description: string;
  status: ObjectStatus;
  createdAt: Date;
  updatedAt: Date;
}

export type PoofAction = "keep" | "sell" | "donate" | "toss";
