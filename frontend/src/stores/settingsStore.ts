import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
  // API
  apiProvider: 'gemini' | 'openrouter' | 'template';
  geminiKey: string;
  geminiModel: string;
  openrouterKey: string;
  openrouterModel: string;

  // Appearance
  theme: 'dark' | 'light';
  uiDensity: 'comfortable' | 'compact';

  // Prompt Defaults
  defaultStyle: string;
  defaultQuality: string;

  // Advanced
  customApiUrl: string;
  useProxy: boolean;

  // Actions
  setApiProvider: (p: 'gemini' | 'openrouter' | 'template') => void;
  setGeminiKey: (k: string) => void;
  setGeminiModel: (m: string) => void;
  setOpenrouterKey: (k: string) => void;
  setOpenrouterModel: (m: string) => void;
  setTheme: (t: 'dark' | 'light') => void;
  setUiDensity: (d: 'comfortable' | 'compact') => void;
  setDefaultStyle: (s: string) => void;
  setDefaultQuality: (q: string) => void;
  setCustomApiUrl: (u: string) => void;
  setUseProxy: (u: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      apiProvider: 'template',
      geminiKey: '',
      geminiModel: 'gemma-3-27b-it',
      openrouterKey: '',
      openrouterModel: 'nousresearch/hermes-3-llama-3.1-405b:free',
      theme: 'dark',
      uiDensity: 'comfortable',
      defaultStyle: 'cinematic',
      defaultQuality: '8k',
      customApiUrl: '',
      useProxy: false,

      setApiProvider: (p) => set({ apiProvider: p }),
      setGeminiKey: (k) => set({ geminiKey: k }),
      setGeminiModel: (m) => set({ geminiModel: m }),
      setOpenrouterKey: (k) => set({ openrouterKey: k }),
      setOpenrouterModel: (m) => set({ openrouterModel: m }),
      setTheme: (t) => set({ theme: t }),
      setUiDensity: (d) => set({ uiDensity: d }),
      setDefaultStyle: (s) => set({ defaultStyle: s }),
      setDefaultQuality: (q) => set({ defaultQuality: q }),
      setCustomApiUrl: (u) => set({ customApiUrl: u }),
      setUseProxy: (u) => set({ useProxy: u }),
    }),
    { name: 'promptcraft-settings' }
  )
);
