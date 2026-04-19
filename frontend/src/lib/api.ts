import { useSettingsStore } from '../stores/settingsStore';

const API_URL = import.meta.env.VITE_API_URL || '';

function getAiHeaders(): Record<string, string> {
  const s = useSettingsStore.getState();
  return {
    'x-ai-provider': s.apiProvider,
    'x-ai-api-key': s.apiProvider === 'gemini' ? s.geminiKey : s.openrouterKey,
    'x-ai-model': s.apiProvider === 'gemini' ? s.geminiModel : s.openrouterModel,
  };
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}/api${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(error.message || 'Request failed');
  }
  return res.json();
}

export interface Prompt {
  id: string;
  title: string;
  content: string;
  tags: string[];
  category: string;
  type: 'image' | 'text';
  isFavorite: boolean;
  imageUri?: string | null;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface HistoryEntry {
  id: string;
  action: string;
  input: string;
  output: string;
  provider: string;
  createdAt: string;
}

export interface TextGenerateResult {
  prompt: string;
  provider: string;
}

export interface ImagePromptResponse {
  title: string;
  optimizedPrompt: string;
  negativePrompt: string;
  styleTags: string[];
  cameraSuggestions: string[];
  lightingSuggestions: string[];
  improvementNotes: string[];
  provider: string;
}

export const api = {
  // Prompts
  getPrompts: (params?: Record<string, string>) => {
    const search = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<Prompt[]>(`/prompts${search}`);
  },
  getPrompt: (id: string) => request<Prompt>(`/prompts/${id}`),
  createPrompt: (data: Partial<Prompt>) => request<Prompt>('/prompts', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updatePrompt: (id: string, data: Partial<Prompt>) => request<Prompt>(`/prompts/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  deletePrompt: (id: string) => request<{ success: boolean }>(`/prompts/${id}`, {
    method: 'DELETE',
  }),

  // Upload image alongside a new prompt (multipart/form-data)
  createPromptWithImage: async (data: Partial<Prompt>, imageFile?: File): Promise<Prompt> => {
    const form = new FormData();
    if (data.title) form.append('title', data.title);
    if (data.content) form.append('content', data.content);
    if (data.tags) form.append('tags', JSON.stringify(data.tags));
    if (data.category) form.append('category', data.category);
    if (data.type) form.append('type', data.type);
    if (data.isFavorite !== undefined) form.append('isFavorite', String(data.isFavorite));
    if (data.metadata) form.append('metadata', JSON.stringify(data.metadata));
    if (imageFile) form.append('image', imageFile);

    const res = await fetch(`${API_URL}/api/prompts`, { method: 'POST', body: form });
    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: res.statusText }));
      throw new Error(error.message || 'Upload failed');
    }
    return res.json();
  },

  // Upload / replace image for existing prompt
  uploadPromptImage: async (id: string, imageFile: File): Promise<Prompt> => {
    const form = new FormData();
    form.append('image', imageFile);
    const res = await fetch(`${API_URL}/api/prompts/${id}/image`, { method: 'POST', body: form });
    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: res.statusText }));
      throw new Error(error.message || 'Image upload failed');
    }
    return res.json();
  },

  // AI
  generate: (options: Record<string, any>) => request<ImagePromptResponse>('/generate', {
    method: 'POST',
    headers: getAiHeaders(),
    body: JSON.stringify(options),
  }),
  optimize: (prompt: string, style: string) => request<ImagePromptResponse>('/optimize', {
    method: 'POST',
    headers: getAiHeaders(),
    body: JSON.stringify({ prompt, style }),
  }),
  expandPrompt: (draft: string) => request<TextGenerateResult>('/expand-prompt', {
    method: 'POST',
    headers: getAiHeaders(),
    body: JSON.stringify({ draft }),
  }),
  imageToPrompt: (image: string, instructions?: string) => request<ImagePromptResponse>('/image-to-prompt', {
    method: 'POST',
    headers: getAiHeaders(),
    body: JSON.stringify({ image, instructions }),
  }),

  // History
  getHistory: (limit?: number) => request<HistoryEntry[]>(`/history${limit ? `?limit=${limit}` : ''}`),
  clearHistory: () => request<{ success: boolean }>('/history', { method: 'DELETE' }),
  deleteHistoryEntry: (id: string) => request<{ success: boolean }>(`/history/${id}`, { method: 'DELETE' }),

  // Health
  health: () => request<{ status: string }>('/health'),

  // Models (dynamic fetch)
  getModels: (provider: string, key: string) =>
    request<{ id: string; name: string; isFree: boolean; description?: string; contextLength?: number }[]>(
      `/models?provider=${provider}&key=${encodeURIComponent(key)}`
    ),

  // Usage / Quota
  getUsage: (provider: string, key: string, model?: string) =>
    request<any>(`/usage?provider=${provider}&key=${encodeURIComponent(key)}${model ? `&model=${encodeURIComponent(model)}` : ''}`),

  // Settings persistence
  loadAllSettings: () =>
    request<Record<string, string>>('/settings'),

  saveSetting: (key: string, value: string) =>
    request<{ key: string; value: string }>(`/settings/${encodeURIComponent(key)}`, {
      method: 'PUT',
      body: JSON.stringify({ value }),
    }),

  saveAllSettings: (data: Record<string, string>) =>
    request<{ success: boolean }>('/settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};
