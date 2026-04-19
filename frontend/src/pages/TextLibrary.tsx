import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Search, Copy, Trash2, BookOpen, Tag, Clock } from 'lucide-react';
import { useUIStore } from '../stores/uiStore';
import { usePromptStore } from '../stores/promptStore';
import MobileModal from '../components/MobileModal';
import ListItem from '../components/ListItem';

interface TextPromptData {
  id: string;
  title: string;
  category: string;
  prompt: string;
  tags: string[];
  dbId?: string;
  createdAt: string;
}

export default function TextLibrary() {
  const [search, setSearch] = useState('');
  const [selectedPrompt, setSelectedPrompt] = useState<TextPromptData | null>(null);

  const { addToast } = useUIStore();
  const { prompts, fetchPrompts, deletePrompt } = usePromptStore();

  useEffect(() => { fetchPrompts(); }, [fetchPrompts]);

  const textPrompts: TextPromptData[] = useMemo(() =>
    prompts
      .filter(p => p.type === 'text' && p.category !== 'role')
      .map(p => ({
        id: p.id,
        dbId: p.id,
        title: p.title || 'Ohne Titel',
        category: p.category || 'text',
        tags: p.tags || [],
        prompt: p.content,
        createdAt: p.createdAt,
      }))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [prompts]
  );

  const filteredPrompts = useMemo(() =>
    textPrompts.filter(item =>
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.prompt.toLowerCase().includes(search.toLowerCase()) ||
      item.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
    ),
    [textPrompts, search]
  );

  const copyText = async (text: string, title?: string) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus(); textArea.select();
        try { document.execCommand('copy'); } finally { textArea.remove(); }
      }
      addToast({ title: 'Kopiert!', description: title ? `"${title}" kopiert.` : 'In Zwischenablage.', variant: 'success' });
    } catch {
      addToast({ title: 'Fehler', description: 'Kopieren fehlgeschlagen.', variant: 'error' });
    }
  };

  const handleDelete = async () => {
    if (!selectedPrompt?.dbId) return;
    if (!window.confirm(`Prompt "${selectedPrompt.title}" wirklich löschen?`)) return;
    await deletePrompt(selectedPrompt.dbId);
    addToast({ title: 'Gelöscht', description: 'Prompt wurde entfernt.', variant: 'success' });
    fetchPrompts();
    setSelectedPrompt(null);
  };

  return (
    <div className="min-h-full flex flex-col p-4 md:p-8 pb-24 md:pb-8 max-w-7xl mx-auto w-full">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shrink-0">
              <FileText className="text-white w-4 h-4 md:w-5 md:h-5" />
            </div>
            Text Bibliothek
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {textPrompts.length} gespeicherte Text-Prompts
          </p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Prompts durchsuchen..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2.5 bg-white/5 border border-border rounded-xl text-sm text-foreground focus:outline-none focus:border-blue-500/50 w-full md:w-64 transition-all"
          />
        </div>
      </div>

      {/* ── Content ── */}
      <div className="flex-1">
        {filteredPrompts.length === 0 ? (
          <div className="glass-card flex flex-col items-center justify-center py-20 text-center border-dashed border-border/60 rounded-2xl">
            <BookOpen className="w-12 h-12 text-muted-foreground/30 mb-4" />
            <h3 className="text-xl font-medium text-foreground mb-2">
              {search ? 'Keine Treffer' : 'Noch keine Text-Prompts'}
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              {search
                ? 'Anderen Suchbegriff ausprobieren.'
                : 'Nutze den Text Prompt Optimizer, um hier Vorlagen zu speichern.'}
            </p>
          </div>
        ) : (
          <>
            {/* ── Mobile: List View ── */}
            <div className="md:hidden">
              <div className="list-view glass-card !p-0 overflow-hidden rounded-2xl divide-y divide-border/50">
                <AnimatePresence>
                  {filteredPrompts.map((item, idx) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: idx * 0.03 }}
                    >
                      <ListItem
                        title={item.title}
                        description={item.prompt}
                        badge={item.category}
                        badgeClass="bg-blue-500/15 text-blue-400 border border-blue-500/25"
                        icon={
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500/20 to-indigo-500/20">
                            <FileText className="w-5 h-5 text-blue-400" />
                          </div>
                        }
                        onClick={() => setSelectedPrompt(item)}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            {/* ── Desktop: Grid View ── */}
            <motion.div
              variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.07 } } }}
              initial="hidden"
              animate="show"
              className="hidden md:grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6"
            >
              <AnimatePresence>
                {filteredPrompts.map((item) => (
                  <motion.div
                    layout
                    variants={{ hidden: { opacity: 0, y: 30, scale: 0.95 }, show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', damping: 25, stiffness: 300 } } }}
                    whileHover={{ scale: 1.02, y: -4 }}
                    whileTap={{ scale: 0.98 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    key={item.id}
                    className="glass-card group hover:border-blue-500/30 transition-all cursor-pointer flex flex-col border-blue-500/10"
                    onClick={() => setSelectedPrompt(item)}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-xs font-medium px-2 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        {item.category}
                      </span>
                      <div className="flex flex-wrap items-center gap-1">
                        {item.tags.slice(0, 2).map((t, idx) => (
                          <span key={idx} className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-muted-foreground border border-white/10 uppercase tracking-wider">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-foreground mb-2 line-clamp-1">{item.title}</h3>
                    <p className="text-sm text-muted-foreground flex-1 line-clamp-3">{item.prompt}</p>

                    <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between">
                      <button
                        onClick={(e) => { e.stopPropagation(); copyText(item.prompt, item.title); }}
                        className="text-xs flex items-center gap-1.5 text-muted-foreground opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity hover:text-emerald-400 px-2 py-1 rounded-md hover:bg-emerald-500/10"
                      >
                        <Copy className="w-3.5 h-3.5" /> Kopieren
                      </button>
                      <span className="text-xs text-muted-foreground">
                        {new Date(item.createdAt).toLocaleDateString('de-DE')}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          </>
        )}
      </div>

      {/* ── Detail Modal ── */}
      <MobileModal
        isOpen={!!selectedPrompt}
        onClose={() => setSelectedPrompt(null)}
        title={selectedPrompt?.title}
        accentClass="border-blue-500/20"
        icon={
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
            <FileText className="w-3.5 h-3.5 text-white" />
          </div>
        }
      >
        {selectedPrompt && (
          <div className="flex flex-col p-5 gap-5">
            {/* Meta */}
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/25">
                {selectedPrompt.category}
              </span>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="w-3.5 h-3.5" />
                {new Date(selectedPrompt.createdAt).toLocaleDateString('de-DE', { day: '2-digit', month: 'long', year: 'numeric' })}
              </div>
            </div>

            {/* Tags */}
            {selectedPrompt.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {selectedPrompt.tags.map((tag, i) => (
                  <span key={i} className="text-[11px] px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 flex items-center gap-1">
                    <Tag className="w-2.5 h-2.5" />{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Prompt Content */}
            <div className="bg-black/20 rounded-xl p-4 border border-white/5 flex-1">
              <p className="text-sm text-foreground/85 leading-relaxed font-light whitespace-pre-wrap">
                {selectedPrompt.prompt}
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pb-2">
              <button
                onClick={() => copyText(selectedPrompt.prompt, selectedPrompt.title)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-blue-500/25 transition-all"
              >
                <Copy className="w-4 h-4" />
                Prompt kopieren
              </button>

              <button
                onClick={handleDelete}
                className="p-3 rounded-xl bg-red-500/15 text-red-400 border border-red-500/25 hover:bg-red-500/25 transition-colors"
                title="Löschen"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </MobileModal>
    </div>
  );
}
