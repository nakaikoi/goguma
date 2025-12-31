/**
 * Items store using Zustand
 */

import { create } from 'zustand';
import { api } from '../services/api';

export interface Item {
  id: string;
  userId: string;
  status: 'draft' | 'processing' | 'ready' | 'published';
  draftTitle?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ListingDraft {
  id: string;
  itemId: string;
  title: string;
  description: string;
  condition: string;
  itemSpecifics: Record<string, any>;
  pricing: {
    min: number;
    max: number;
    suggested: number;
    confidence: number;
    currency: string;
  };
  keywords: string[];
  aiConfidence?: number;
  visibleFlaws?: string[];
  createdAt: string;
  updatedAt: string;
}

interface ItemsState {
  items: Item[];
  currentItem: Item | null;
  currentDraft: ListingDraft | null;
  loading: boolean;
  error: string | null;
  createItem: () => Promise<Item>;
  fetchItems: (status?: string) => Promise<void>;
  fetchItem: (itemId: string) => Promise<void>;
  analyzeItem: (itemId: string) => Promise<void>;
  fetchDraft: (itemId: string) => Promise<void>;
  deleteItem: (itemId: string) => Promise<void>;
  clearCurrentItem: () => void;
}

export const useItemsStore = create<ItemsState>((set, get) => ({
  items: [],
  currentItem: null,
  currentDraft: null,
  loading: false,
  error: null,

  createItem: async () => {
    try {
      set({ loading: true, error: null });
      const item = await api.createItem();
      set((state) => ({
        items: [item, ...state.items],
        currentItem: item,
        currentDraft: null, // Clear any previous draft when creating new item
        loading: false,
      }));
      return item;
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  fetchItems: async (status?: string) => {
    try {
      set({ loading: true, error: null });
      const items = await api.getItems(status);
      set({ items, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  fetchItem: async (itemId: string) => {
    try {
      set({ loading: true, error: null });
      const item = await api.getItem(itemId);
      set({ currentItem: item, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  analyzeItem: async (itemId: string) => {
    try {
      set({ loading: true, error: null });
      await api.analyzeItem(itemId);
      // Refresh item status
      await get().fetchItem(itemId);
      // Fetch draft
      await get().fetchDraft(itemId);
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  fetchDraft: async (itemId: string) => {
    try {
      // Clear current draft immediately when fetching a new one
      set({ loading: true, error: null, currentDraft: null });
      const draft = await api.getDraft(itemId);
      set({ currentDraft: draft, loading: false });
    } catch (error: any) {
      // If draft not found (404), that's expected - clear currentDraft
      if (error.response?.status === 404) {
        set({ currentDraft: null, loading: false, error: null });
      } else {
        set({ error: error.message, loading: false, currentDraft: null });
      }
    }
  },

  deleteItem: async (itemId: string) => {
    try {
      set({ loading: true, error: null });
      await api.deleteItem(itemId);
      // Remove from local state
      set((state) => ({
        items: state.items.filter((item) => item.id !== itemId),
        loading: false,
      }));
      // Clear current item if it was deleted
      const currentItem = get().currentItem;
      if (currentItem && currentItem.id === itemId) {
        set({ currentItem: null, currentDraft: null });
      }
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  clearCurrentItem: () => {
    set({ currentItem: null, currentDraft: null });
  },
}));

