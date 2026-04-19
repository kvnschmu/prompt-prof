import { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Images, Search, Star, Trash2, Clock, Edit, Upload,
  X, Copy, Image as ImageIcon, FileText, Plus, Tag,
  ZoomIn, Download, Check
} from 'lucide-react';
import { usePromptStore } from '../stores/promptStore';
import { useUIStore } from '../stores/uiStore';
import type { Prompt } from '../lib/api';
import MobileModal from '../components/MobileModal';
import ListItem from '../components/ListItem';

// ─── Types ───────────────────────────────────────────────────────────────────

type FilterType = 'all' | 'favorites' | 'image' | 'text' | 'with-image';

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function Library() {
  const {
    prompts, fetchPrompts, deletePrompt, toggleFavorite, updatePrompt,
    createPromptWithImage, uploadPromptImage, isLoading,
  } = usePromptStore();
  const { addToast } = useUIStore();

  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null);
  const [detailPrompt, setDetailPrompt] = useState<Prompt | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => { fetchPrompts(); }, [fetchPrompts]);

  const filteredPrompts = useMemo(() => {
    return prompts.filter(p => {
      const q = search.toLowerCase();
      const matchesSearch = !q ||
        p.title.toLowerCase().includes(q) ||
        p.content.toLowerCase().includes(q) ||
        p.tags.some(t => t.toLowerCase().includes(q));
      const matchesType =
        filterType === 'all' ||
        (filterType === 'favorites' && p.isFavorite) ||
        (filterType === 'image' && p.type === 'image') ||
        (filterType === 'text' && p.type === 'text') ||
        (filterType === 'with-image' && !!p.imageUri);
      return matchesSearch && matchesType;
    });
  }, [prompts, search, filterType]);

  const imageCount = useMemo(() => prompts.filter(p => p.imageUri).length, [prompts]);

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
    <div className="min-h-full flex flex-col p-4 md:p-8 max-w-7xl mx-auto w-full">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/20 flex-shrink-0">
              <Images className="text-white w-4 h-4 md:w-5 md:h-5" />
            </div>
            Bilder Bibliothek
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {prompts.length} Prompts · {imageCount} mit Vorschaubild
          </p>
        </div>

        <button
          id="library-add-btn"
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-medium transition-all shadow-lg shadow-violet-500/20 hover:shadow-violet-500/30 hover:-translate-y-0.5 active:translate-y-0 text-sm"
        >
          <Plus className="w-4 h-4" />
          Neuer Prompt
        </button>
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            id="library-search"
            type="text"
            placeholder="Titel, Inhalt oder Tags suchen..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2.5 bg-white/5 border border-border rounded-xl text-sm text-foreground focus:outline-none focus:border-violet-500/50 w-full"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          {(['all', 'with-image', 'image', 'text', 'favorites'] as FilterType[]).map(f => (
            <button
              key={f}
              onClick={() => setFilterType(f)}
              className={`px-3 py-2 rounded-xl text-xs font-medium transition-all border ${
                filterType === f
                  ? 'bg-violet-600 border-violet-500 text-white shadow-sm shadow-violet-500/25'
                  : 'bg-white/5 border-border text-muted-foreground hover:border-violet-500/40 hover:text-foreground'
              }`}
            >
              {f === 'all' ? 'Alle' : f === 'with-image' ? '📷 Mit Bild' : f === 'image' ? 'KI-Bild' : f === 'text' ? 'Text' : '⭐ Favoriten'}
            </button>
          ))}
        </div>
      </div>

      {/* ── Content ── */}
      <div className="flex-1">
        {isLoading && prompts.length === 0 ? (
          /* Skeleton */
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-16 rounded-xl bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : filteredPrompts.length === 0 ? (
          <div className="glass-card flex flex-col items-center justify-center py-20 text-center border-dashed border-border/60 rounded-2xl">
            <Images className="w-12 h-12 text-muted-foreground/30 mb-4" />
            <h3 className="text-xl font-medium text-foreground mb-2">Keine Prompts gefunden</h3>
            <p className="text-muted-foreground max-w-sm text-sm">
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
          <>
            {/* ── Mobile: List View ── */}
            <div className="md:hidden">
              <div className="list-view glass-card !p-0 overflow-hidden rounded-2xl divide-y divide-border/50">
                <AnimatePresence>
                  {filteredPrompts.map((prompt, idx) => (
                    <motion.div
                      key={prompt.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ delay: idx * 0.03 }}
                    >
                      <ListItem
                        title={prompt.title}
                        description={prompt.content}
                        imageUrl={prompt.imageUri ?? undefined}
                        icon={
                          <div className="w-full h-full flex items-center justify-center bg-violet-500/10">
                            {prompt.type === 'image'
                              ? <ImageIcon className="w-5 h-5 text-violet-400" />
                              : <FileText className="w-5 h-5 text-blue-400" />
                            }
                          </div>
                        }
                        badge={prompt.type === 'image' ? 'Bild' : 'Text'}
                        badgeClass={prompt.type === 'image'
                          ? 'bg-violet-500/15 text-violet-400 border border-violet-500/25'
                          : 'bg-blue-500/15 text-blue-400 border border-blue-500/25'
                        }
                        onClick={() => setDetailPrompt(prompt)}
                        actions={
                          <button
                            onClick={(e) => { e.stopPropagation(); toggleFavorite(prompt.id, !prompt.isFavorite); }}
                            className="p-2 text-muted-foreground hover:text-yellow-400 transition-colors"
                          >
                            <Star className={`w-4 h-4 ${prompt.isFavorite ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                          </button>
                        }
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            {/* ── Desktop: Grid View ── */}
            <motion.div
              initial="hidden"
              animate="show"
              variants={{ show: { transition: { staggerChildren: 0.06 } } }}
              className="hidden md:grid grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5"
            >
              <AnimatePresence>
                {filteredPrompts.map(prompt => (
                  <PromptCard
                    key={prompt.id}
                    prompt={prompt}
                    onDelete={() => deletePrompt(prompt.id)}
                    onToggleFavorite={() => toggleFavorite(prompt.id, !prompt.isFavorite)}
                    onCopy={() => copyToClipboard(prompt.content, prompt.title)}
                    onEdit={() => setEditingPrompt(prompt)}
                    onOpenDetail={() => setDetailPrompt(prompt)}
                    onImageUpload={img => uploadPromptImage(prompt.id, img)}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          </>
        )}
      </div>

      {/* ── Detail Modal (Mobile fullscreen / Desktop overlay) ── */}
      <MobileModal
        isOpen={!!detailPrompt}
        onClose={() => setDetailPrompt(null)}
        title={detailPrompt?.title}
        accentClass="border-violet-500/20"
        icon={
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
            <ImageIcon className="w-3.5 h-3.5 text-white" />
          </div>
        }
      >
        {detailPrompt && (
          <PromptDetailContent
            prompt={detailPrompt}
            onCopy={() => copyToClipboard(detailPrompt.content, detailPrompt.title)}
            onEdit={() => { setEditingPrompt(detailPrompt); setDetailPrompt(null); }}
            onDelete={() => { deletePrompt(detailPrompt.id); setDetailPrompt(null); }}
            onToggleFavorite={() => toggleFavorite(detailPrompt.id, !detailPrompt.isFavorite)}
          />
        )}
      </MobileModal>

      {/* ── Add Modal ── */}
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
            onSave={async (updates) => {
              await updatePrompt(editingPrompt.id, updates);
              setEditingPrompt(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Prompt Detail Content (für Modal) ───────────────────────────────────────

function PromptDetailContent({
  prompt, onCopy, onEdit, onDelete, onToggleFavorite,
}: {
  prompt: Prompt;
  onCopy: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onToggleFavorite: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const date = new Date(prompt.createdAt).toLocaleDateString('de-DE', {
    day: '2-digit', month: 'long', year: 'numeric',
  });

  const handleCopy = () => {
    onCopy();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col p-5 gap-5">
      {/* Bild */}
      {prompt.imageUri && (
        <div className="relative w-full rounded-2xl overflow-hidden bg-black/30" style={{ aspectRatio: '16/9' }}>
          <img
            src={prompt.imageUri}
            alt={prompt.title}
            loading="lazy"
            className="w-full h-full object-cover"
          />
          <a
            href={prompt.imageUri}
            download
            className="absolute top-3 right-3 p-2 bg-black/60 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-black/80 transition-colors"
            title="Bild herunterladen"
          >
            <Download className="w-4 h-4 text-white" />
          </a>
        </div>
      )}

      {/* Meta */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="w-3.5 h-3.5" />
          {date}
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
            prompt.type === 'image'
              ? 'bg-violet-500/15 border border-violet-500/25 text-violet-400'
              : 'bg-blue-500/15 border border-blue-500/25 text-blue-400'
          }`}>
            {prompt.type === 'image' ? 'KI-Bild' : 'Text'}
          </span>
        </div>
        <button
          onClick={onToggleFavorite}
          className="p-2 rounded-xl text-muted-foreground hover:text-yellow-400 transition-colors"
        >
          <Star className={`w-5 h-5 ${prompt.isFavorite ? 'fill-yellow-400 text-yellow-400' : ''}`} />
        </button>
      </div>

      {/* Tags */}
      {prompt.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {prompt.tags.map((tag, i) => (
            <span key={i} className="text-[11px] px-2.5 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 flex items-center gap-1">
              <Tag className="w-2.5 h-2.5" />{tag}
            </span>
          ))}
        </div>
      )}

      {/* Prompt Content */}
      <div className="bg-black/20 rounded-xl p-4 border border-white/5">
        <p className="text-sm text-foreground/80 leading-relaxed font-light whitespace-pre-wrap">
          {prompt.content}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pb-2">
        <button
          onClick={handleCopy}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
            copied
              ? 'bg-emerald-600 text-white'
              : 'bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white shadow-lg shadow-violet-500/25'
          }`}
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? 'Kopiert!' : 'Prompt kopieren'}
        </button>

        <button
          onClick={onEdit}
          className="p-3 rounded-xl bg-blue-500/15 text-blue-400 border border-blue-500/25 hover:bg-blue-500/25 transition-colors"
          title="Bearbeiten"
        >
          <Edit className="w-4 h-4" />
        </button>

        <button
          onClick={onDelete}
          className="p-3 rounded-xl bg-red-500/15 text-red-400 border border-red-500/25 hover:bg-red-500/25 transition-colors"
          title="Löschen"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ─── Prompt Card (Desktop Grid) ───────────────────────────────────────────────

function PromptCard({
  prompt, onDelete, onToggleFavorite, onCopy, onEdit, onOpenDetail, onImageUpload,
}: {
  prompt: Prompt;
  onDelete: () => void;
  onToggleFavorite: () => void;
  onCopy: () => void;
  onEdit: () => void;
  onOpenDetail: () => void;
  onImageUpload: (file: File) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const date = new Date(prompt.createdAt).toLocaleDateString('de-DE', {
    day: '2-digit', month: 'short', year: 'numeric',
  });

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) onImageUpload(file);
  }, [onImageUpload]);

  return (
    <motion.div
      layout
      variants={{
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { type: 'spring', damping: 25 } },
      }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -4 }}
      className="glass-card group flex flex-col hover:border-violet-500/30 transition-all overflow-hidden rounded-2xl relative"
    >
      {/* Image area */}
      <div
        className="relative w-full bg-black/30 overflow-hidden"
        style={{ height: '180px' }}
        onDragOver={e => e.preventDefault()}
        onDrop={handleDrop}
      >
        {prompt.imageUri ? (
          <>
            <img
              src={prompt.imageUri}
              alt={prompt.title}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <button
              onClick={onOpenDetail}
              className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              title="Vollansicht"
            >
              <div className="bg-black/50 backdrop-blur-sm rounded-full p-2 border border-white/20">
                <ZoomIn className="w-5 h-5 text-white" />
              </div>
            </button>
            <button
              onClick={() => fileRef.current?.click()}
              className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity px-2 py-1 text-[10px] bg-black/60 backdrop-blur-sm text-white rounded-md border border-white/20 hover:bg-black/80 flex items-center gap-1"
              title="Bild ersetzen"
            >
              <Upload className="w-3 h-3" /> Ersetzen
            </button>
          </>
        ) : (
          <button
            onClick={() => fileRef.current?.click()}
            className="w-full h-full flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-violet-400 transition-colors group/upload border-2 border-dashed border-transparent hover:border-violet-500/30 rounded-t-2xl"
          >
            <Upload className="w-6 h-6 opacity-30 group-hover/upload:opacity-80 transition-opacity" />
            <span className="text-[11px] opacity-0 group-hover/upload:opacity-80 transition-opacity">Bild hochladen</span>
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

        {/* Type badge */}
        <div className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-medium border backdrop-blur-md ${
          prompt.type === 'image'
            ? 'bg-violet-600/40 border-violet-500/40 text-violet-200'
            : 'bg-blue-600/40 border-blue-500/40 text-blue-200'
        }`}>
          {prompt.type === 'image' ? <ImageIcon className="w-3 h-3 inline mr-1" /> : <FileText className="w-3 h-3 inline mr-1" />}
          {prompt.type === 'image' ? 'Bild' : 'Text'}
        </div>
      </div>

      {/* Card body */}
      <div className="flex flex-col flex-1 p-4">
        <div className="flex items-start justify-between mb-2 gap-2">
          <h3 className="font-semibold text-foreground line-clamp-1 flex-1" title={prompt.title}>
            {prompt.title}
          </h3>
          <button
            onClick={onToggleFavorite}
            className="shrink-0 text-muted-foreground hover:text-yellow-400 transition-colors"
          >
            <Star className={`w-4 h-4 ${prompt.isFavorite ? 'fill-yellow-400 text-yellow-400' : ''}`} />
          </button>
        </div>

        <div className="flex-1 bg-black/20 rounded-lg p-2.5 mb-3 border border-white/5 relative group/txt">
          <p className="text-xs text-foreground/70 line-clamp-3 leading-relaxed font-light">
            {prompt.content}
          </p>
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover/txt:opacity-100 transition-opacity flex items-end justify-center pb-2">
            <button
              onClick={onCopy}
              className="text-[10px] bg-violet-500/20 text-violet-300 px-2.5 py-1 rounded-full backdrop-blur-md border border-violet-500/30 hover:bg-violet-500/40 transition-colors flex items-center gap-1"
            >
              <Copy className="w-3 h-3" /> Kopieren
            </button>
          </div>
        </div>

        {/* Tags */}
        {prompt.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {prompt.tags.slice(0, 3).map((tag, i) => (
              <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 flex items-center gap-0.5">
                <Tag className="w-2.5 h-2.5" />{tag}
              </span>
            ))}
            {prompt.tags.length > 3 && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-muted-foreground">
                +{prompt.tags.length - 3}
              </span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between mt-auto pt-2 border-t border-white/5">
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <Clock className="w-3 h-3" />{date}
          </div>
          <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={onEdit}
              className="p-1.5 bg-blue-500/20 text-blue-400 rounded-md hover:bg-blue-500/40 border border-blue-500/30 backdrop-blur-md"
              title="Bearbeiten"
            >
              <Edit className="w-3 h-3" />
            </button>
            <button
              onClick={onDelete}
              className="p-1.5 bg-red-500/20 text-red-400 rounded-md hover:bg-red-500/40 border border-red-500/30 backdrop-blur-md"
              title="Löschen"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative w-full max-w-2xl glass-card border-violet-500/20 p-6 flex flex-col shadow-2xl rounded-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <Plus className="w-4 h-4 text-white" />
            </div>
            Neuer Prompt
          </h2>
          <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Type toggle */}
        <div className="flex gap-2 mb-4">
          {(['image', 'text'] as const).map(t => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium border transition-all ${
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
          className={`relative cursor-pointer rounded-xl border-2 border-dashed mb-4 overflow-hidden transition-all ${
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
                className="absolute top-2 right-2 p-1 bg-black/60 rounded-full hover:bg-black/80"
              >
                <X className="w-3 h-3 text-white" />
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
          className="bg-black/30 border border-white/10 rounded-lg p-3 mb-3 text-foreground w-full focus:outline-none focus:border-violet-500/50 text-sm"
        />
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="Prompt Inhalt *"
          rows={5}
          className="bg-black/30 border border-white/10 rounded-lg p-3 mb-3 text-foreground font-light resize-none w-full focus:outline-none focus:border-violet-500/50 text-sm"
        />
        <input
          value={tags}
          onChange={e => setTags(e.target.value)}
          placeholder="Tags (komma-getrennt)"
          className="bg-black/30 border border-white/10 rounded-lg p-3 mb-6 text-foreground w-full focus:outline-none focus:border-violet-500/50 text-sm"
        />

        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-sm transition-colors">
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
            className="px-5 py-2 rounded-lg bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-medium text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
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
  prompt, onClose, onSave,
}: {
  prompt: Prompt;
  onClose: () => void;
  onSave: (data: Partial<Prompt>) => void;
}) {
  const [title, setTitle] = useState(prompt.title);
  const [content, setContent] = useState(prompt.content);
  const [tags, setTags] = useState(prompt.tags.join(', '));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative w-full max-w-2xl glass-card border-violet-500/20 p-6 flex flex-col shadow-2xl rounded-2xl"
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Edit className="w-5 h-5 text-violet-400" /> Prompt bearbeiten
          </h2>
          <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {prompt.imageUri && (
          <img src={prompt.imageUri} alt={prompt.title} className="w-full h-40 object-cover rounded-xl mb-4 border border-white/10" />
        )}

        <input
          value={title} onChange={e => setTitle(e.target.value)}
          className="bg-black/30 border border-white/10 rounded-lg p-3 mb-3 text-foreground w-full focus:outline-none focus:border-violet-500/50 text-sm"
          placeholder="Titel"
        />
        <textarea
          value={content} onChange={e => setContent(e.target.value)}
          className="bg-black/30 border border-white/10 rounded-lg p-3 mb-3 h-36 text-foreground font-light resize-none w-full focus:outline-none focus:border-violet-500/50 text-sm"
          placeholder="Prompt Inhalt"
        />
        <input
          value={tags} onChange={e => setTags(e.target.value)}
          className="bg-black/30 border border-white/10 rounded-lg p-3 mb-6 text-foreground w-full focus:outline-none focus:border-violet-500/50 text-sm"
          placeholder="Tags (komma-getrennt)"
        />
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-sm">Abbrechen</button>
          <button
            onClick={() => onSave({ title, content, tags: tags.split(',').map(t => t.trim()).filter(Boolean) })}
            className="px-5 py-2 rounded-lg bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 text-white font-medium text-sm"
          >
            Speichern
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
