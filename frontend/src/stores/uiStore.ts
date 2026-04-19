import { create } from 'zustand';

interface UIState {
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  toasts: Toast[];
  toggleSidebar: () => void;
  toggleSidebarCollapsed: () => void;
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

export interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: 'default' | 'success' | 'error';
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: false,
  sidebarCollapsed: false,
  toasts: [],
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  toggleSidebarCollapsed: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  addToast: (toast) => set((s) => ({
    toasts: [...s.toasts, { ...toast, id: Date.now().toString() }],
  })),
  removeToast: (id) => set((s) => ({
    toasts: s.toasts.filter((t) => t.id !== id),
  })),
}));
