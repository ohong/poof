import { create } from "zustand";
import { ObjectItem, ObjectStatus } from "@/types";

interface GalleryState {
  // Data
  objects: ObjectItem[];
  archivedObjects: ObjectItem[];

  // Loading states
  isLoading: boolean;
  isArchiveLoading: boolean;
  error: string | null;

  // UI state
  selectedObjectId: string | null;
  poofingIds: Set<string>;

  // Actions
  setObjects: (objects: ObjectItem[]) => void;
  setArchivedObjects: (objects: ObjectItem[]) => void;
  setLoading: (loading: boolean) => void;
  setArchiveLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  selectObject: (id: string | null) => void;

  // Optimistic update - removes from active, will be fetched in archive
  removeObject: (id: string) => void;

  // Animation helpers
  startPoofing: (id: string) => void;
  finishPoofing: (id: string) => void;

  // API actions
  fetchObjects: () => Promise<void>;
  fetchArchivedObjects: () => Promise<void>;
  updateObjectStatus: (id: string, status: ObjectStatus) => Promise<boolean>;
}

export const useGalleryStore = create<GalleryState>((set, get) => ({
  objects: [],
  archivedObjects: [],
  isLoading: true,
  isArchiveLoading: true,
  error: null,
  selectedObjectId: null,
  poofingIds: new Set(),

  setObjects: (objects) => set({ objects }),
  setArchivedObjects: (objects) => set({ archivedObjects: objects }),
  setLoading: (isLoading) => set({ isLoading }),
  setArchiveLoading: (isArchiveLoading) => set({ isArchiveLoading }),
  setError: (error) => set({ error }),
  selectObject: (id) => set({ selectedObjectId: id }),

  removeObject: (id) =>
    set((state) => ({
      objects: state.objects.filter((obj) => obj.id !== id),
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

  fetchObjects: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch("/api/objects");
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        if (res.status === 401) {
          throw new Error("Please sign in to view your collection");
        }
        throw new Error(errorData.error || "Failed to fetch objects");
      }
      const data = await res.json();
      // Convert date strings to Date objects
      const objects = (data.objects || []).map((obj: ObjectItem) => ({
        ...obj,
        createdAt: new Date(obj.createdAt),
        updatedAt: new Date(obj.updatedAt),
      }));
      set({ objects, isLoading: false });
    } catch (error) {
      console.error("[Store] fetchObjects error:", error);
      const message = error instanceof Error ? error.message : "Failed to load objects";
      set({ error: message, isLoading: false });
    }
  },

  fetchArchivedObjects: async () => {
    set({ isArchiveLoading: true, error: null });
    try {
      const res = await fetch("/api/objects/archive");
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        if (res.status === 401) {
          throw new Error("Please sign in to view your archive");
        }
        throw new Error(errorData.error || "Failed to fetch archived objects");
      }
      const data = await res.json();
      // Convert date strings to Date objects
      const archivedObjects = (data.objects || []).map((obj: ObjectItem) => ({
        ...obj,
        createdAt: new Date(obj.createdAt),
        updatedAt: new Date(obj.updatedAt),
      }));
      set({ archivedObjects, isArchiveLoading: false });
    } catch (error) {
      console.error("[Store] fetchArchivedObjects error:", error);
      const message = error instanceof Error ? error.message : "Failed to load archived objects";
      set({ error: message, isArchiveLoading: false });
    }
  },

  updateObjectStatus: async (id, status) => {
    // Optimistically remove from active list
    const previousObjects = get().objects;
    set((state) => ({
      objects: state.objects.filter((obj) => obj.id !== id),
    }));

    try {
      const res = await fetch(`/api/objects/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) {
        throw new Error("Failed to update object status");
      }

      return true;
    } catch (error) {
      console.error("[Store] updateObjectStatus error:", error);
      // Rollback on error
      set({ objects: previousObjects });
      return false;
    }
  },
}));
