import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Trash2, Search, Zap, Image, Sparkles, Copy, ChevronRight } from 'lucide-react';
import { usePromptStore } from '../stores/promptStore';
import MobileModal from '../components/MobileModal';
import ListItem from '../components/ListItem';

export default function History() {
  const { history, fetchHistory, clearHistory, deleteHistoryEntry } = usePromptStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEntry, setSelectedEntry] = useState<typeof history[0] | null>(null);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  const filteredHistory = history.filter(entry =>
    entry.input.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.output.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.action.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).catch(() => {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
    });
  };

  const getActionIcon = (action: string, size = 'w-4 h-4') => {
    switch (action) {
      case 'generate': return <Zap className={`${size} text-blue-400`} />;
      case 'optimize': return <Sparkles className={`${size} text-fuchsia-400`} />;
      case 'image-to-prompt': return <Image className={`${size} text-orange-400`} />;
      default: return <Clock className={`${size} text-muted-foreground`} />;
    }
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'generate': return 'Generiert';
      case 'optimize': return 'Optimiert';
      case 'image-to-prompt': return 'Aus Bild extrahiert';
      default: return action;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'generate': return 'bg-blue-500/15 text-blue-400 border-blue-500/25';
      case 'optimize': return 'bg-fuchsia-500/15 text-fuchsia-400 border-fuchsia-500/25';
      case 'image-to-prompt': return 'bg-orange-500/15 text-orange-400 border-orange-500/25';
      default: return 'bg-white/5 text-muted-foreground border-white/10';
    }
  };

  const getIconBg = (action: string) => {
    switch (action) {
      case 'generate': return 'from-blue-500/30 to-blue-600/20';
      case 'optimize': return 'from-fuchsia-500/30 to-purple-600/20';
      case 'image-to-prompt': return 'from-orange-500/30 to-amber-600/20';
      default: return 'from-white/5 to-white/10';
    }
  };

  return (
    <div className="min-h-full flex flex-col p-4 md:p-8 pb-24 md:pb-8 max-w-5xl mx-auto w-full">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-zinc-500 to-zinc-700 flex items-center justify-center shrink-0">
              <Clock className="text-white w-4 h-4 md:w-5 md:h-5" />
            </div>
            Verlauf
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {history.length} Einträge · Automatische Aufzeichnung
          </p>
        </div>

        <div className="flex gap-3">
          <div className="relative flex-1 md:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Verlauf durchsuchen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2.5 bg-white/5 border border-border rounded-xl text-sm text-foreground focus:outline-none focus:border-zinc-500/50 w-full md:w-64"
            />
          </div>

          {history.length > 0 && (
            <button
              onClick={() => { if (window.confirm('Verlauf wirklich komplett leeren?')) clearHistory(); }}
              className="px-4 py-2.5 border border-red-500/30 text-red-400 hover:bg-red-500/10 rounded-xl text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0"
            >
              Leeren
            </button>
          )}
        </div>
      </div>

      {/* ── Content ── */}
      <div className="flex-1">
        {filteredHistory.length === 0 ? (
          <div className="glass-card flex flex-col items-center justify-center py-20 text-center border-dashed border-border/60 rounded-2xl">
            <Clock className="w-12 h-12 text-muted-foreground/30 mb-4" />
            <h3 className="text-xl font-medium text-foreground mb-2">
              {searchTerm ? 'Keine Treffer' : 'Kein Verlauf'}
            </h3>
            <p className="text-muted-foreground text-sm max-w-sm">
              {searchTerm ? 'Anderen Suchbegriff ausprobieren.' : 'Deine generierten Prompts erscheinen hier automatisch.'}
            </p>
          </div>
        ) : (
          <>
            {/* ── Mobile: Kompakte List View ── */}
            <div className="md:hidden">
              <div className="list-view glass-card !p-0 overflow-hidden rounded-2xl divide-y divide-border/50">
                <AnimatePresence>
                  {filteredHistory.map((entry, idx) => (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ delay: idx * 0.02 }}
                    >
                      <ListItem
                        title={getActionLabel(entry.action)}
                        description={entry.action !== 'image-to-prompt' ? entry.input : entry.output}
                        badge={entry.provider?.toUpperCase()}
                        badgeClass="bg-white/5 text-muted-foreground border border-white/10"
                        icon={
                          <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${getIconBg(entry.action)}`}>
                            {getActionIcon(entry.action)}
                          </div>
                        }
                        onClick={() => setSelectedEntry(entry)}
                        showChevron={false}
                        actions={
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] text-muted-foreground">
                              {new Date(entry.createdAt).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <button
                              onClick={(e) => { e.stopPropagation(); deleteHistoryEntry(entry.id); }}
                              className="p-1.5 text-muted-foreground hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                            <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
                          </div>
                        }
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            {/* ── Desktop: Card View ── */}
            <div className="hidden md:block space-y-4">
              <AnimatePresence>
                {filteredHistory.map((entry) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                    className="glass-card p-4 md:p-5 flex flex-col group relative"
                  >
                    <div className="flex items-center justify-between mb-3 border-b border-border/50 pb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                          {getActionIcon(entry.action)}
                        </div>
                        <div>
                          <span className="text-sm font-semibold text-foreground">
                            {getActionLabel(entry.action)}
                          </span>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{new Date(entry.createdAt).toLocaleString('de-DE')}</span>
                            <span>•</span>
                            <span className="uppercase tracking-wide">{entry.provider}</span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => deleteHistoryEntry(entry.id)}
                        className="p-2 text-muted-foreground hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {entry.action !== 'image-to-prompt' && (
                        <div>
                          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">Input</span>
                          <div className="bg-black/30 p-3 rounded-lg border border-white/5 text-sm text-foreground/80 font-mono break-all line-clamp-3">
                            {entry.input}
                          </div>
                        </div>
                      )}

                      <div className={entry.action === 'image-to-prompt' ? 'col-span-1 lg:col-span-2' : ''}>
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">Output</span>
                        <div
                          className="bg-zinc-900 pr-10 p-3 rounded-lg border border-zinc-700/50 text-sm text-zinc-100 font-mono cursor-pointer hover:border-zinc-500 transition-colors relative"
                          onClick={() => copyToClipboard(entry.output)}
                          title="Klicken zum Kopieren"
                        >
                          <p className="line-clamp-3">{entry.output}</p>
                          <button className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300">
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </>
        )}
      </div>

      {/* ── Detail Modal (Mobile) ── */}
      <MobileModal
        isOpen={!!selectedEntry}
        onClose={() => setSelectedEntry(null)}
        title={selectedEntry ? getActionLabel(selectedEntry.action) : ''}
        accentClass="border-zinc-500/20"
        icon={selectedEntry ? (
          <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${getIconBg(selectedEntry.action)} flex items-center justify-center border border-white/10`}>
            {getActionIcon(selectedEntry.action)}
          </div>
        ) : undefined}
      >
        {selectedEntry && (
          <div className="flex flex-col p-5 gap-5">
            {/* Meta */}
            <div className="flex items-center gap-3 flex-wrap">
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${getActionColor(selectedEntry.action)}`}>
                {getActionLabel(selectedEntry.action)}
              </span>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="w-3.5 h-3.5" />
                {new Date(selectedEntry.createdAt).toLocaleString('de-DE')}
              </div>
              {selectedEntry.provider && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-muted-foreground uppercase tracking-wider">
                  {selectedEntry.provider}
                </span>
              )}
            </div>

            {/* Input */}
            {selectedEntry.action !== 'image-to-prompt' && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Input</p>
                <div className="bg-black/30 rounded-xl p-4 border border-white/5">
                  <p className="text-sm text-foreground/80 leading-relaxed font-light whitespace-pre-wrap">
                    {selectedEntry.input}
                  </p>
                </div>
              </div>
            )}

            {/* Output */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Output</p>
              <div className="bg-black/30 rounded-xl p-4 border border-white/5">
                <p className="text-sm text-foreground/85 leading-relaxed whitespace-pre-wrap">
                  {selectedEntry.output}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pb-2">
              <button
                onClick={() => copyToClipboard(selectedEntry.output)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-medium transition-colors"
              >
                <Copy className="w-4 h-4" /> Output kopieren
              </button>

              <button
                onClick={() => { deleteHistoryEntry(selectedEntry.id); setSelectedEntry(null); }}
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
