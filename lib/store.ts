import { create } from "zustand";
import { ObjectItem, ObjectStatus } from "@/types";
import { mockObjects } from "./mock-data";

interface GalleryState {
  objects: ObjectItem[];
  selectedObjectId: string | null;
  poofingIds: Set<string>;

  // Actions
  selectObject: (id: string | null) => void;
  updateObjectStatus: (id: string, status: ObjectStatus) => void;
  startPoofing: (id: string) => void;
  finishPoofing: (id: string) => void;
}

export const useGalleryStore = create<GalleryState>((set) => ({
  objects: mockObjects,
  selectedObjectId: null,
  poofingIds: new Set(),

  selectObject: (id) => set({ selectedObjectId: id }),

  updateObjectStatus: (id, status) =>
    set((state) => ({
      objects: state.objects.map((obj) =>
        obj.id === id ? { ...obj, status, updatedAt: new Date() } : obj
      ),
    })),

  startPoofing: (id) =>
    set((state) => ({
      poofingIds: new Set([...state.poofingIds, id]),
    })),

  finishPoofing: (id) =>
    set((state) => {
      const newPoofingIds = new Set(state.poofingIds);
      newPoofingIds.delete(id);
      return { poofingIds: newPoofingIds };
    }),
}));
