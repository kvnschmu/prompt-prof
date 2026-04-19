import { create } from 'zustand';
import { api } from '../lib/api';
import type { Prompt, HistoryEntry } from '../lib/api';
import { useUIStore } from './uiStore';

interface PromptState {
  prompts: Prompt[];
  history: HistoryEntry[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchPrompts: (filters?: Record<string, string>) => Promise<void>;
  createPrompt: (data: Partial<Prompt>) => Promise<Prompt | null>;
  createPromptWithImage: (data: Partial<Prompt>, imageFile?: File) => Promise<Prompt | null>;
  uploadPromptImage: (id: string, imageFile: File) => Promise<Prompt | null>;
  updatePrompt: (id: string, data: Partial<Prompt>) => Promise<Prompt | null>;
  deletePrompt: (id: string) => Promise<boolean>;
  toggleFavorite: (id: string, isFavorite: boolean) => Promise<void>;
  
  fetchHistory: (limit?: number) => Promise<void>;
  clearHistory: () => Promise<void>;
  deleteHistoryEntry: (id: string) => Promise<void>;
}

export const usePromptStore = create<PromptState>((set) => ({
  prompts: [],
  history: [],
  isLoading: false,
  error: null,

  fetchPrompts: async (filters) => {
    set({ isLoading: true, error: null });
    try {
      const data = await api.getPrompts(filters);
      set({ prompts: data, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      useUIStore.getState().addToast({
        title: 'Fehler beim Laden',
        description: error.message,
        variant: 'error',
      });
    }
  },

  createPrompt: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const newPrompt = await api.createPrompt(data);
      set((state) => ({ 
        prompts: [newPrompt, ...state.prompts],
        isLoading: false 
      }));
      useUIStore.getState().addToast({
        title: 'Gespeichert',
        description: 'Prompt wurde erfolgreich gespeichert.',
        variant: 'success',
      });
      return newPrompt;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      useUIStore.getState().addToast({
        title: 'Fehler beim Speichern',
        description: error.message,
        variant: 'error',
      });
      return null;
    }
  },

  createPromptWithImage: async (data, imageFile) => {
    set({ isLoading: true, error: null });
    try {
      const newPrompt = await api.createPromptWithImage(data, imageFile);
      set((state) => ({
        prompts: [newPrompt, ...state.prompts],
        isLoading: false
      }));
      useUIStore.getState().addToast({
        title: 'Gespeichert',
        description: 'Prompt mit Bild wurde erfolgreich gespeichert.',
        variant: 'success',
      });
      return newPrompt;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      useUIStore.getState().addToast({
        title: 'Fehler beim Speichern',
        description: error.message,
        variant: 'error',
      });
      return null;
    }
  },

  uploadPromptImage: async (id, imageFile) => {
    try {
      const updatedPrompt = await api.uploadPromptImage(id, imageFile);
      set((state) => ({
        prompts: state.prompts.map((p) => p.id === id ? updatedPrompt : p),
      }));
      useUIStore.getState().addToast({
        title: 'Bild hochgeladen',
        description: 'Das Bild wurde erfolgreich aktualisiert.',
        variant: 'success',
      });
      return updatedPrompt;
    } catch (error: any) {
      useUIStore.getState().addToast({
        title: 'Fehler',
        description: 'Bild konnte nicht hochgeladen werden.',
        variant: 'error',
      });
      return null;
    }
  },

  updatePrompt: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const updatedPrompt = await api.updatePrompt(id, data);
      set((state) => ({
        prompts: state.prompts.map((p) => p.id === id ? updatedPrompt : p),
        isLoading: false
      }));
      useUIStore.getState().addToast({
        title: 'Aktualisiert',
        description: 'Prompt wurde erfolgreich aktualisiert.',
        variant: 'success',
      });
      return updatedPrompt;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      useUIStore.getState().addToast({
        title: 'Fehler beim Aktualisieren',
        description: error.message,
        variant: 'error',
      });
      return null;
    }
  },

  deletePrompt: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await api.deletePrompt(id);
      set((state) => ({
        prompts: state.prompts.filter((p) => p.id !== id),
        isLoading: false
      }));
      useUIStore.getState().addToast({
        title: 'Gelöscht',
        description: 'Prompt wurde gelöscht.',
      });
      return true;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      useUIStore.getState().addToast({
        title: 'Fehler beim Löschen',
        description: error.message,
        variant: 'error',
      });
      return false;
    }
  },

  toggleFavorite: async (id, isFavorite) => {
    // Optimistic update
    set((state) => ({
      prompts: state.prompts.map((p) => p.id === id ? { ...p, isFavorite } : p)
    }));
    try {
      await api.updatePrompt(id, { isFavorite });
    } catch (error: any) {
      // Revert on error
      set((state) => ({
        prompts: state.prompts.map((p) => p.id === id ? { ...p, isFavorite: !isFavorite } : p)
      }));
      useUIStore.getState().addToast({
        title: 'Fehler',
        description: 'Favoriten-Status konnte nicht geändert werden.',
        variant: 'error',
      });
    }
  },

  fetchHistory: async (limit = 50) => {
    try {
      const data = await api.getHistory(limit);
      set({ history: data });
    } catch (error: any) {
      console.error('Failed to fetch history:', error);
    }
  },

  clearHistory: async () => {
    try {
      await api.clearHistory();
      set({ history: [] });
      useUIStore.getState().addToast({
        title: 'Verlauf geleert',
        description: 'Der gesamte Verlauf wurde gelöscht.',
      });
    } catch (error: any) {
      useUIStore.getState().addToast({
        title: 'Fehler',
        description: 'Verlauf konnte nicht geleert werden.',
        variant: 'error',
      });
    }
  },

  deleteHistoryEntry: async (id) => {
    try {
      await api.deleteHistoryEntry(id);
      set((state) => ({
        history: state.history.filter((h) => h.id !== id)
      }));
    } catch (error: any) {
      useUIStore.getState().addToast({
        title: 'Fehler',
        description: 'Eintrag konnte nicht gelöscht werden.',
        variant: 'error',
      });
    }
  }
}));
