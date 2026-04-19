import { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Images, Search, Trash2, Edit, Upload,
  X, Copy, Image as ImageIcon, FileText, Plus,
  Maximize2, Download, Check, Heart
} from 'lucide-react';
import { usePromptStore } from '../stores/promptStore';
import { useUIStore } from '../stores/uiStore';
import type { Prompt } from '../lib/api';

// ─── Types ───────────────────────────────────────────────────────────────────

type FilterType = 'all' | 'favorites' | 'with-image';

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function ImageLibrary() {
  const {
    prompts, fetchPrompts, deletePrompt, toggleFavorite, updatePrompt,
    createPromptWithImage, uploadPromptImage, isLoading,
  } = usePromptStore();
  const { addToast } = useUIStore();

  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null);
  const [lightboxPrompt, setLightboxPrompt] = useState<Prompt | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => { fetchPrompts(); }, [fetchPrompts]);

  const filteredPrompts = useMemo(() => {
    return prompts.filter(p => {
      if (p.type !== 'image') return false; // Only image prompts
      const q = search.toLowerCase();
      const matchesSearch = !q ||
        p.title.toLowerCase().includes(q) ||
        p.content.toLowerCase().includes(q) ||
        p.tags.some(t => t.toLowerCase().includes(q));
      const matchesType =
        filterType === 'all' ||
        (filterType === 'favorites' && p.isFavorite) ||
        (filterType === 'with-image' && !!p.imageUri);
      return matchesSearch && matchesType;
    });
  }, [prompts, search, filterType]);

  const imageCount = useMemo(() => prompts.filter(p => p.type === 'image' && p.imageUri).length, [prompts]);

  const copyToClipboard = useCallback(async (text: string, title?: string) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement('textarea');
        ta.value = text;
        Object.assign(ta.style, { position: 'fixed', left: '-999999px', top: '-999999px' });
        document.body.appendChild(ta);
        ta.focus(); ta.select();
        try { document.execCommand('copy'); } finally { ta.remove(); }
      }
      addToast({ title: 'Kopiert!', description: title ? `"${title}" kopiert.` : 'In Zwischenablage.', variant: 'success' });
    } catch {
      addToast({ title: 'Fehler', description: 'Kopieren fehlgeschlagen.', variant: 'error' });
    }
  }, [addToast]);

  return (
    <div className="min-h-full flex flex-col pt-4 md:p-8 md:pb-8 pb-0 max-w-7xl mx-auto w-full">
      {/* ── Header ── */}
      <div className="px-4 md:px-0 flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/20 shrink-0">
              <Images className="text-white w-4 h-4 md:w-5 md:h-5" />
            </div>
            Bilder Bibliothek
          </h1>
          <p className="text-sm md:text-base text-muted-foreground mt-1 md:mt-2">
            {prompts.length} Prompts gespeichert · {imageCount} mit Vorschaubild
          </p>
        </div>

        <button
          id="library-add-btn"
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-medium transition-all shadow-lg shadow-violet-500/20 hover:shadow-violet-500/30 hover:-translate-y-0.5 active:translate-y-0"
        >
          <Plus className="w-4 h-4" />
          Neuer Prompt
        </button>
      </div>

      {/* ── Filters ── */}
      <div className="px-4 md:px-0 flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            id="library-search"
            type="text"
            placeholder="Titel, Inhalt oder Tags suchen..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 bg-white/5 border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-violet-500/50 w-full"
          />
        </div>

        <div className="flex flex-wrap gap-2">
                  {(['all', 'with-image', 'favorites'] as FilterType[]).map(f => (
            <button
              key={f}
              onClick={() => setFilterType(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                filterType === f
                  ? 'bg-violet-600 border-violet-500 text-white shadow-sm shadow-violet-500/25'
                  : 'bg-white/5 border-border text-muted-foreground hover:border-violet-500/40 hover:text-foreground'
              }`}
            >
              {f === 'all' ? 'Alle' : f === 'with-image' ? '📷 Mit Bild' : '⭐ Favoriten'}
            </button>
          ))}
        </div>
      </div>

      {/* ── Grid ── */}
      <div className="flex-1 px-4 md:px-0 pb-24 md:pb-0 touch-scroll">
        {isLoading && prompts.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="glass-card animate-pulse h-72 rounded-2xl" />
            ))}
          </div>
        ) : filteredPrompts.length === 0 ? (
          <div className="glass-card flex flex-col items-center justify-center py-20 text-center border-dashed border-border/60 rounded-2xl">
            <Images className="w-12 h-12 text-muted-foreground/30 mb-4" />
            <h3 className="text-xl font-medium text-foreground mb-2">Keine Prompts gefunden</h3>
            <p className="text-muted-foreground max-w-sm px-4">
              {search || filterType !== 'all'
                ? 'Andere Suchbegriffe oder Filter ausprobieren.'
                : 'Noch keine Prompts gespeichert. Erstelle deinen ersten!'}
            </p>
            {filterType === 'all' && !search && (
              <button
                onClick={() => setShowAddModal(true)}
                className="mt-6 flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600/20 text-violet-400 border border-violet-500/30 hover:bg-violet-600/30 transition-colors text-sm"
              >
                <Plus className="w-4 h-4" />
                Ersten Prompt erstellen
              </button>
            )}
          </div>
        ) : (
          <motion.div
            initial="hidden"
            animate="show"
            variants={{ show: { transition: { staggerChildren: 0.06 } } }}
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 md:gap-5 pb-6"
          >
            <AnimatePresence>
              {filteredPrompts.map(prompt => (
                <PromptCard
                  key={prompt.id}
                  prompt={prompt}
                  onToggleFavorite={() => toggleFavorite(prompt.id, !prompt.isFavorite)}
                  onCopy={() => copyToClipboard(prompt.content, prompt.title)}
                  onEdit={() => setEditingPrompt(prompt)}
                  onOpenLightbox={() => prompt.imageUri && setLightboxPrompt(prompt)}
                  onImageUpload={img => uploadPromptImage(prompt.id, img)}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* ── Modals ── */}
      <AnimatePresence>
        {showAddModal && (
          <AddPromptModal
            onClose={() => setShowAddModal(false)}
            onSave={async (data, file) => {
              await createPromptWithImage(data, file);
              setShowAddModal(false);
            }}
          />
        )}
        {editingPrompt && (
          <EditPromptModal
            prompt={editingPrompt}
            onClose={() => setEditingPrompt(null)}
            onSave={async (updates, file) => {
              if (file) {
                await uploadPromptImage(editingPrompt.id, file);
              }
              await updatePrompt(editingPrompt.id, updates);
              setEditingPrompt(null);
            }}
            onDelete={async () => {
              await deletePrompt(editingPrompt.id);
              setEditingPrompt(null);
            }}
          />
        )}
        {lightboxPrompt && (
          <Lightbox
            prompt={lightboxPrompt}
            onClose={() => setLightboxPrompt(null)}
            onCopy={() => copyToClipboard(lightboxPrompt.content, lightboxPrompt.title)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Prompt Card ─────────────────────────────────────────────────────────────

function PromptCard({
  prompt, onToggleFavorite, onCopy, onEdit, onOpenLightbox, onImageUpload,
}: {
  prompt: Prompt;
  onToggleFavorite: () => void;
  onCopy: () => void;
  onEdit: () => void;
  onOpenLightbox: () => void;
  onImageUpload: (file: File) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) onImageUpload(file);
  }, [onImageUpload]);

  // Shared action button style
  const actionBtnClass =
    'w-8 h-8 rounded-lg bg-black/50 backdrop-blur-sm border border-white/20 ' +
    'flex items-center justify-center text-white/80 hover:text-white hover:bg-black/70 ' +
    'transition-all duration-200 hover:scale-110';

  return (
    <motion.div
      layout
      variants={{
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { type: 'spring', damping: 25 } },
      }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -3 }}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card transition-all duration-300 hover:border-violet-500/40 hover:shadow-xl hover:shadow-violet-500/5"
    >
      {/* ── Image ── */}
      <div
        className="relative w-full overflow-hidden bg-muted/30"
        onDragOver={e => e.preventDefault()}
        onDrop={handleDrop}
      >
        {prompt.imageUri ? (
          <>
            <img
              src={prompt.imageUri}
              alt={prompt.title}
              className="w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              style={{ aspectRatio: '4 / 5', minHeight: '200px', maxHeight: '360px' }}
            />

            {/* ── Action buttons — top right overlay ── */}
            {/* Always visible on mobile, hover-reveal on desktop */}
            <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200">
              <button onClick={onEdit} className={actionBtnClass} title="Bearbeiten">
                <Edit className="w-3.5 h-3.5" />
              </button>
              <button onClick={onCopy} className={actionBtnClass} title="Prompt kopieren">
                <Copy className="w-3.5 h-3.5" />
              </button>
              <button onClick={onOpenLightbox} className={actionBtnClass} title="Vollbild">
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={onToggleFavorite}
                className={`${actionBtnClass} ${prompt.isFavorite ? '!bg-rose-500/70 !text-white !border-rose-400/50' : ''}`}
                title="Favorit"
              >
                <Heart className={`w-3.5 h-3.5 ${prompt.isFavorite ? 'fill-white' : ''}`} />
              </button>
            </div>

          </>
        ) : (
          <button
            onClick={() => fileRef.current?.click()}
            className="w-full flex flex-col items-center justify-center gap-3 text-muted-foreground hover:text-violet-400 transition-colors py-20"
          >
            <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
              <Upload className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium">Bild hochladen oder hierher ziehen</span>
          </button>
        )}

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={e => {
            const f = e.target.files?.[0];
            if (f) onImageUpload(f);
            e.target.value = '';
          }}
        />
      </div>

      {/* ── Card body — Title + Description ── */}
      <div className="p-4 flex flex-col gap-1">
        <h3 className="font-bold text-foreground line-clamp-1 text-[15px] leading-snug" title={prompt.title}>
          {prompt.title}
        </h3>
        <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
          {prompt.content}
        </p>
      </div>
    </motion.div>
  );
}

// ─── Lightbox ────────────────────────────────────────────────────────────────

function Lightbox({ prompt, onClose, onCopy }: { prompt: Prompt; onClose: () => void; onCopy: () => void }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    onCopy();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center md:p-4"
    >
      <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={onClose} />
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative w-full h-full md:h-auto md:max-w-4xl bg-background/95 md:glass-card rounded-none md:rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)]"
        style={{ maxHeight: '100vh' }}
      >
        {/* Image */}
        <div className="flex-1 md:w-3/5 bg-black flex items-center justify-center relative min-h-0">
          {/* Mobile close button on image */}
          <button onClick={onClose} className="md:hidden absolute top-4 right-4 z-10 p-2 bg-black/50 backdrop-blur-md rounded-full text-white">
            <X className="w-5 h-5" />
          </button>
          <img src={prompt.imageUri!} alt={prompt.title} className="w-full h-full object-contain" />
        </div>

        {/* Info panel */}
        <div className="md:w-2/5 p-4 md:p-6 flex flex-col flex-shrink-0 md:max-h-[90vh] bg-background md:bg-transparent">
          <button onClick={onClose} className="hidden md:flex absolute top-3 right-3 p-1.5 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
            <X className="w-4 h-4 text-white" />
          </button>

          <h2 className="text-xl font-bold text-foreground mb-1">{prompt.title}</h2>
          <div className="flex flex-wrap gap-1.5 mb-4">
            {prompt.tags.map((tag, i) => (
              <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-violet-500/15 border border-violet-500/25 text-violet-300">
                {tag}
              </span>
            ))}
          </div>

          <div className="flex-1 min-h-[100px] mb-4 overflow-y-auto">
            <div className="bg-black/30 rounded-xl p-4 border border-white/5 h-full">
              <p className="text-sm text-foreground/80 leading-relaxed font-light whitespace-pre-wrap">
                {prompt.content}
              </p>
            </div>
          </div>

          <div className="flex gap-2 shrink-0">
            <button
              onClick={handleCopy}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 md:py-2.5 rounded-xl text-sm font-medium transition-all ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-violet-600 hover:bg-violet-500 text-white'
              }`}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Kopiert!' : 'Prompt kopieren'}
            </button>
            <a
              href={prompt.imageUri!}
              download
              className="p-3 md:p-2.5 rounded-xl bg-white/10 hover:bg-white/20 transition-colors border border-white/10"
              title="Bild herunterladen"
            >
              <Download className="w-4 h-4 text-foreground" />
            </a>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Add Prompt Modal ─────────────────────────────────────────────────────────

function AddPromptModal({
  onClose, onSave,
}: {
  onClose: () => void;
  onSave: (data: Partial<Prompt>, file?: File) => void;
}) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [type, setType] = useState<'image' | 'text'>('image');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = e => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center md:p-4"
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative w-full h-full md:h-auto md:max-w-2xl bg-background md:glass-card md:border md:border-violet-500/20 p-4 md:p-6 flex flex-col shadow-2xl rounded-none md:rounded-2xl max-h-[100vh] md:max-h-[90vh] overflow-y-auto pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)]"
      >
        <div className="flex items-center justify-between mb-5 mt-2 md:mt-0">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <Plus className="w-4 h-4 text-white" />
            </div>
            Neuer Prompt
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <X className="w-5 h-5 md:w-4 md:h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Type toggle */}
        <div className="flex gap-2 mb-4">
          {(['image', 'text'] as const).map(t => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 md:py-2 rounded-lg text-sm font-medium border transition-all ${
                type === t
                  ? 'bg-violet-600/30 border-violet-500/50 text-violet-200'
                  : 'bg-white/5 border-border text-muted-foreground hover:border-violet-500/30'
              }`}
            >
              {t === 'image' ? <ImageIcon className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
              {t === 'image' ? 'Bild-Prompt' : 'Text-Prompt'}
            </button>
          ))}
        </div>

        {/* Image drop zone */}
        <div
          onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={e => {
            e.preventDefault();
            setIsDragging(false);
            const f = e.dataTransfer.files[0];
            if (f) handleFile(f);
          }}
          onClick={() => fileRef.current?.click()}
          className={`relative cursor-pointer rounded-xl border-2 border-dashed mb-4 overflow-hidden transition-all shrink-0 ${
            isDragging
              ? 'border-violet-500 bg-violet-500/10'
              : imagePreview
              ? 'border-violet-500/40 bg-transparent'
              : 'border-border hover:border-violet-500/40 bg-black/20 hover:bg-black/30'
          }`}
          style={{ height: imagePreview ? '200px' : '120px' }}
        >
          {imagePreview ? (
            <>
              <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <span className="text-white text-sm">Bild ändern</span>
              </div>
              <button
                onClick={e => { e.stopPropagation(); setImageFile(null); setImagePreview(null); }}
                className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-full hover:bg-black/80"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-2 text-muted-foreground">
              <Upload className={`w-6 h-6 ${isDragging ? 'text-violet-400' : ''}`} />
              <span className="text-sm">{isDragging ? 'Loslassen!' : 'Bild ziehen oder klicken'}</span>
              <span className="text-xs opacity-60">PNG, JPG, WEBP bis 20MB</span>
            </div>
          )}
          <input ref={fileRef} type="file" accept="image/*" className="hidden"
            onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ''; }} />
        </div>

        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Titel *"
          className="bg-black/30 border border-white/10 rounded-lg p-3 mb-3 text-foreground w-full focus:outline-none focus:border-violet-500/50 text-sm md:text-base"
        />
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="Prompt Inhalt *"
          rows={4}
          className="bg-black/30 border border-white/10 rounded-lg p-3 mb-3 text-foreground font-light resize-none w-full focus:outline-none focus:border-violet-500/50 text-sm md:text-base flex-1 min-h-[100px]"
        />
        <input
          value={tags}
          onChange={e => setTags(e.target.value)}
          placeholder="Tags (komma-getrennt)"
          className="bg-black/30 border border-white/10 rounded-lg p-3 mb-6 text-foreground w-full focus:outline-none focus:border-violet-500/50 text-sm md:text-base"
        />

        <div className="flex justify-end gap-3 mt-auto md:mt-0 pt-4 md:pt-0">
          <button onClick={onClose} className="px-4 py-3 md:py-2 flex-1 md:flex-none rounded-lg bg-white/5 hover:bg-white/10 text-sm font-medium transition-colors">
            Abbrechen
          </button>
          <button
            onClick={() => {
              if (!title.trim() || !content.trim()) return;
              onSave({
                title: title.trim(),
                content: content.trim(),
                tags: tags.split(',').map(t => t.trim()).filter(Boolean),
                type,
                category: 'general',
              }, imageFile ?? undefined);
            }}
            disabled={!title.trim() || !content.trim()}
            className="px-5 py-3 md:py-2 flex-[2] md:flex-none rounded-lg bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-medium text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Speichern
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Edit Prompt Modal ────────────────────────────────────────────────────────

function EditPromptModal({
  prompt, onClose, onSave, onDelete,
}: {
  prompt: Prompt;
  onClose: () => void;
  onSave: (data: Partial<Prompt>, file?: File) => void;
  onDelete: () => void;
}) {
  const [title, setTitle] = useState(prompt.title);
  const [content, setContent] = useState(prompt.content);
  const [tags, setTags] = useState(prompt.tags.join(', '));
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(prompt.imageUri || null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = e => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center md:p-4"
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative w-full h-full md:h-auto md:max-w-2xl bg-background md:glass-card md:border md:border-violet-500/20 p-4 md:p-6 flex flex-col shadow-2xl rounded-none md:rounded-2xl max-h-[100vh] md:max-h-[90vh] overflow-y-auto pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)]"
      >
        <div className="flex items-center justify-between mb-5 mt-2 md:mt-0">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Edit className="w-5 h-5 text-violet-400" /> Prompt bearbeiten
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <X className="w-5 h-5 md:w-4 md:h-4 text-muted-foreground" />
          </button>
        </div>

        {imagePreview ? (
          <div className="relative mb-4 shrink-0">
            <img src={imagePreview} alt={prompt.title} className="w-full h-40 object-cover rounded-xl border border-white/10" />
            <div className="absolute bottom-2 right-2 flex gap-2">
              <button 
                onClick={() => { setImagePreview(null); setImageFile(null); }}
                className="p-2 bg-red-600/80 rounded-xl hover:bg-red-600 flex gap-2 items-center text-white backdrop-blur-sm text-xs font-medium cursor-pointer transition-colors"
                title="Bild entfernen"
              >
                <Trash2 className="w-4 h-4 text-white" />
              </button>
              <button 
                onClick={() => fileRef.current?.click()} 
                className="p-2 bg-black/60 rounded-xl hover:bg-black/80 flex gap-2 items-center text-white backdrop-blur-sm text-xs font-medium cursor-pointer transition-colors"
                title="Bild ändern"
              >
                <Upload className="w-4 h-4 text-white" /> Bild ändern
              </button>
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ''; }} />
          </div>
        ) : prompt.type === 'image' && (
          <div className="mb-4 shrink-0">
            <button 
              onClick={() => fileRef.current?.click()}
              className="w-full flex flex-col items-center justify-center gap-3 py-8 rounded-xl border-2 border-dashed border-border hover:border-violet-500/40 bg-black/20 hover:bg-black/30 transition-colors"
            >
              <Upload className="w-6 h-6 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Bild hochladen</span>
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ''; }} />
          </div>
        )}

        <input
          value={title} onChange={e => setTitle(e.target.value)}
          className="bg-black/30 border border-white/10 rounded-lg p-3 mb-3 text-foreground w-full focus:outline-none focus:border-violet-500/50 text-sm md:text-base"
          placeholder="Titel"
        />
        <textarea
          value={content} onChange={e => setContent(e.target.value)}
          className="bg-black/30 border border-white/10 rounded-lg p-3 mb-3 h-36 md:h-36 text-foreground font-light resize-none w-full focus:outline-none focus:border-violet-500/50 text-sm md:text-base flex-1 min-h-[100px]"
          placeholder="Prompt Inhalt"
        />
        <input
          value={tags} onChange={e => setTags(e.target.value)}
          className="bg-black/30 border border-white/10 rounded-lg p-3 mb-6 text-foreground w-full focus:outline-none focus:border-violet-500/50 text-sm md:text-base"
          placeholder="Tags (komma-getrennt)"
        />
        
        <div className="flex justify-between items-center mt-auto md:mt-0 pt-4 md:pt-0">
          <button 
            onClick={onDelete} 
            className="px-4 py-3 md:py-2 rounded-lg bg-red-600/20 text-red-500 hover:bg-red-600/30 text-sm font-medium transition-colors flex items-center gap-2"
            title="Prompt unwiderruflich löschen"
          >
            <Trash2 className="w-4 h-4" /> Löschen
          </button>
          <div className="flex gap-3 flex-1 md:flex-none justify-end">
            <button onClick={onClose} className="px-4 py-3 md:py-2 flex-1 md:flex-none rounded-lg bg-white/5 hover:bg-white/10 text-sm font-medium">
              Abbrechen
            </button>
            <button
              onClick={() => {
                const updates: Partial<Prompt> = { title, content, tags: tags.split(',').map(t => t.trim()).filter(Boolean) };
                if (prompt.imageUri && !imagePreview && !imageFile) {
                  updates.imageUri = null;
                }
                onSave(updates, imageFile ?? undefined);
              }}
              className="px-5 py-3 md:py-2 flex-[2] md:flex-none rounded-lg bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 text-white font-medium text-sm"
            >
              Speichern
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

