import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Save, Wand2, Loader2, Sparkles, ChevronUp } from 'lucide-react';
import { promptCategories, surpriseMeOptions } from '../data/promptOptions';
import { useUIStore } from '../stores/uiStore';
import { usePromptStore } from '../stores/promptStore';

import { api, type ImagePromptResponse } from '../lib/api';

export default function Generator() {
  const [subjectInput, setSubjectInput] = useState('');
  const [selectedChips, setSelectedChips] = useState<Record<string, string[]>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedResult, setGeneratedResult] = useState<ImagePromptResponse | null>(null);
  const [mobilePreviewOpen, setMobilePreviewOpen] = useState(false);

  const addToast = useUIStore(s => s.addToast);
  const createPrompt = usePromptStore(s => s.createPrompt);

  const toggleChip = (categoryId: string, value: string) => {
    setSelectedChips(prev => {
      const current = prev[categoryId] || [];
      const updated = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];
      return { ...prev, [categoryId]: updated };
    });
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const payload = {
        idea: subjectInput.trim(),
        subject: selectedChips['subject']?.join(', '),
        style: selectedChips['style']?.join(', '),
        lighting: selectedChips['lighting']?.join(', '),
        camera: selectedChips['camera']?.join(', '),
        perspective: selectedChips['perspective']?.join(', '),
        quality: selectedChips['quality']?.join(', '),
        mood: selectedChips['mood']?.join(', '),
      };
      const result = await api.generate(payload);
      setGeneratedResult(result);
      setMobilePreviewOpen(true); // auto-open preview after generating
    } catch (error: any) {
      addToast({ title: 'Fehler', description: error.message || 'Generierung fehlgeschlagen', variant: 'error' });
    } finally {
      setIsGenerating(false);
    }
  };

  const clearAll = () => {
    setSubjectInput('');
    setSelectedChips({});
    setGeneratedResult(null);
    setMobilePreviewOpen(false);
  };

  const surpriseMe = () => {
    const randomItem = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];
    const newSelected: Record<string, string[]> = {
      subject: [randomItem(surpriseMeOptions.subjects)],
      style: [randomItem(surpriseMeOptions.styles)],
      lighting: [randomItem(surpriseMeOptions.lighting)],
      camera: [Math.random() > 0.5 ? randomItem(surpriseMeOptions.cameras) : ''],
      quality: [randomItem(surpriseMeOptions.qualities)],
      mood: [Math.random() > 0.3 ? randomItem(surpriseMeOptions.moods) : ''],
    };
    for (const key in newSelected) {
      newSelected[key] = newSelected[key].filter(Boolean);
    }
    setSelectedChips(newSelected);
    setTimeout(() => {
      document.getElementById('generate-btn')?.click();
    }, 100);
  };

  const copyToClipboard = async () => {
    if (!generatedResult?.optimizedPrompt) return;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(generatedResult.optimizedPrompt);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = generatedResult.optimizedPrompt;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try { document.execCommand('copy'); } finally { textArea.remove(); }
      }
      addToast({ title: 'Kopiert', description: 'Prompt in die Zwischenablage kopiert', variant: 'success' });
    } catch (err) {
      addToast({ title: 'Fehler', description: 'Kopieren fehlgeschlagen.', variant: 'error' });
    }
  };

  const savePrompt = () => {
    if (!generatedResult?.optimizedPrompt) return;
    const allTags = [
      ...Object.values(selectedChips).flat().map(t => t.split(' ')[0]),
      ...(generatedResult.styleTags || [])
    ].slice(0, 10);
    createPrompt({
      title: generatedResult.title || 'Generierter Prompt',
      content: generatedResult.optimizedPrompt,
      category: 'builder',
      type: 'image',
      tags: [...new Set(allTags)]
    });
  };

  const activeCount = useMemo(() => {
    let count = Object.values(selectedChips).reduce((acc, curr) => acc + curr.length, 0);
    if (subjectInput.trim()) count += 1;
    return count;
  }, [selectedChips, subjectInput]);

  const liveDraft = useMemo(() => {
    const parts: string[] = [];
    const orderedCategories = ['subject', 'style', 'lighting', 'camera', 'perspective', 'quality', 'mood'];
    for (const catId of orderedCategories) {
      if (selectedChips[catId]?.length) {
        parts.push(selectedChips[catId].join(', '));
      }
    }
    if (subjectInput.trim()) {
      parts.unshift(subjectInput.trim());
    }
    return parts.filter(Boolean).join(', ');
  }, [selectedChips, subjectInput]);

  // The preview panel content — shared between desktop sidebar and mobile sheet
  const PreviewContent = () => (
    <>
      <div className="flex-1 relative glass rounded-xl border-indigo-500/20 mb-4 flex flex-col overflow-hidden min-h-0">
        {generatedResult ? (
          <div className="flex-1 overflow-y-auto w-full flex flex-col gap-4 p-4 text-sm touch-scroll">
            <div className="flex flex-col gap-1.5">
              <span className="text-xs text-indigo-400 font-semibold uppercase tracking-wider">Ergebnis</span>
              <textarea
                value={generatedResult.optimizedPrompt || ''}
                onChange={(e) => setGeneratedResult({ ...generatedResult, optimizedPrompt: e.target.value })}
                className="w-full min-h-[120px] bg-black/40 border border-white/10 rounded-lg p-3 text-foreground resize-none focus:outline-none focus:border-indigo-500/50 leading-relaxed font-light text-sm"
              />
            </div>

            {generatedResult.negativePrompt && (
              <div className="flex flex-col gap-1.5">
                <span className="text-xs text-rose-400 font-semibold uppercase tracking-wider">Negative Prompt</span>
                <textarea
                  value={generatedResult.negativePrompt}
                  onChange={(e) => setGeneratedResult({ ...generatedResult, negativePrompt: e.target.value })}
                  className="w-full bg-black/40 border border-rose-500/20 rounded-lg p-3 text-rose-100/90 resize-y focus:outline-none focus:border-rose-500/50 text-xs font-light"
                  rows={3}
                />
              </div>
            )}

            <div className="flex flex-wrap gap-4 mt-2">
              {[
                { label: "Stile", items: generatedResult.styleTags },
                { label: "Kamera", items: generatedResult.cameraSuggestions },
                { label: "Licht", items: generatedResult.lightingSuggestions }
              ].map((group, idx) => (
                group.items?.length > 0 && (
                  <div key={idx} className="flex flex-col gap-1.5 flex-1 min-w-[100px]">
                    <span className="text-xs text-muted-foreground font-semibold uppercase">{group.label}</span>
                    <div className="flex flex-wrap gap-1.5">
                      {group.items.map((tag, i) => (
                        <span key={i} className="px-2 py-0.5 bg-white/5 border border-white/10 rounded-full text-xs text-white/80">{tag}</span>
                      ))}
                    </div>
                  </div>
                )
              ))}
            </div>

            {generatedResult.improvementNotes?.length > 0 && (
              <div className="flex flex-col gap-1 mt-4 p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
                <span className="text-[11px] text-indigo-300 font-semibold uppercase flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3" /> KI Verbesserungen
                </span>
                <ul className="list-disc pl-4 text-xs text-indigo-200/80 space-y-1 mt-2">
                  {generatedResult.improvementNotes.map((note, i) => (
                    <li key={i} className="leading-snug">{note}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 flex flex-col p-4">
            <span className="text-xs text-indigo-400 font-semibold uppercase tracking-wider mb-2">Live Entwurf</span>
            {liveDraft ? (
              <div className="flex-1 bg-black/30 border border-white/5 rounded-lg p-3 text-sm text-foreground/80 leading-relaxed font-light mt-1">
                {liveDraft}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-muted-foreground/50 text-sm gap-3 bg-black/10 border border-white/5 rounded-lg mt-1 border-dashed">
                <Wand2 className="w-8 h-8 opacity-20" />
                <span>Wähle Bausteine aus, um hier einen Live-Entwurf zu sehen.</span>
              </div>
            )}
          </div>
        )}

        <AnimatePresence>
          {isGenerating && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-background/80 flex items-center justify-center backdrop-blur-sm"
            >
              <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex flex-col gap-3">
        <button
          id="generate-btn"
          onClick={handleGenerate}
          disabled={activeCount === 0 || isGenerating}
          className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wand2 className="w-5 h-5" />}
          <span>{isGenerating ? 'Generiere...' : 'Prompt Generieren'}</span>
        </button>

        <div className="flex gap-3">
          <button
            onClick={copyToClipboard}
            disabled={!generatedResult?.optimizedPrompt}
            className="flex-1 btn-secondary disabled:opacity-50 disabled:cursor-not-allowed py-2.5 px-0 flex items-center justify-center gap-2"
          >
            <Copy className="w-4 h-4" />
            <span>Kopieren</span>
          </button>
          <button
            onClick={savePrompt}
            disabled={!generatedResult?.optimizedPrompt}
            className="flex-1 btn-secondary disabled:opacity-50 disabled:cursor-not-allowed py-2.5 px-0 flex items-center justify-center gap-2 border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/10"
          >
            <Save className="w-4 h-4" />
            <span>Speichern</span>
          </button>
        </div>
      </div>
    </>
  );

  return (
    <div className="flex flex-col lg:flex-row min-h-full lg:h-full">
      {/* Scrollable builder area */}
      <div className="flex-1 lg:overflow-y-auto p-4 md:p-6 pb-28 lg:pb-6 space-y-6 md:space-y-8 touch-scroll">
        <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-3 md:gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shrink-0">
                <Wand2 className="text-white w-4 h-4 md:w-5 md:h-5" />
              </div>
              Bilder Prompt Maker
            </h1>
            <p className="text-sm md:text-base text-muted-foreground mt-1 md:mt-2">
              Visualisiere und generiere deinen Prompt mit Bausteinen und KI.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            {activeCount > 0 && (
              <button onClick={clearAll} className="text-sm font-medium text-muted-foreground hover:text-white transition-colors">
                Zurücksetzen ({activeCount})
              </button>
            )}
            <button
              onClick={surpriseMe}
              className="flex items-center gap-2 btn-secondary py-2 px-4 shadow-none text-sm border-indigo-500/30 text-indigo-300 hover:text-indigo-200"
            >
              <Sparkles className="w-4 h-4" />
              <span>Surprise Me</span>
            </button>
          </div>
        </div>

        <div>
          <h3 className="text-xs md:text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">Spezifisches Motiv (Hauptmotiv)</h3>
          <textarea
            value={subjectInput}
            onChange={(e) => setSubjectInput(e.target.value)}
            placeholder="Was möchtest du sehen? (z.B. Ein Cyberpunk-Ninja auf einem Neon-Motorrad...)"
            className="w-full h-20 md:h-24 bg-black/30 border border-white/10 rounded-xl p-3 md:p-4 text-sm text-foreground/90 font-light resize-none focus:outline-none focus:border-indigo-500/50"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {promptCategories.map((category) => (
            <div key={category.id} className="glass-card !p-4 flex flex-col">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg md:text-xl">{category.icon}</span>
                <h3 className="font-semibold text-foreground text-sm md:text-base">{category.label}</h3>
                {selectedChips[category.id]?.length > 0 && (
                  <span className="ml-auto bg-indigo-500/20 text-indigo-300 text-xs px-2 py-0.5 rounded-full">
                    {selectedChips[category.id].length}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5 md:gap-2 mt-auto">
                {category.options.map((option) => {
                  const isActive = selectedChips[category.id]?.includes(option.value);
                  return (
                    <button
                      key={option.value}
                      onClick={() => toggleChip(category.id, option.value)}
                      className={`text-xs md:text-sm py-1 md:py-1.5 px-2.5 md:px-3 rounded-full font-medium transition-colors border ${isActive ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/50' : 'bg-white/5 text-muted-foreground border-white/10 hover:bg-white/10 hover:border-white/20'}`}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Desktop preview sidebar */}
      <div className="hidden lg:flex lg:w-[440px] border-l border-border bg-background p-6 flex-col lg:h-full">
        <h3 className="font-semibold text-foreground mb-3">Strukturierte Preview</h3>
        <PreviewContent />
      </div>

      {/* Mobile: Anchored Collapsible Bottom Panel */}
      <div 
        className={`lg:hidden fixed left-0 right-0 z-40 transition-all duration-300 ease-in-out flex flex-col bg-background/95 backdrop-blur-xl border-t border-indigo-500/30 rounded-t-2xl shadow-[0_-15px_40px_-15px_rgba(0,0,0,0.5)] ${
          mobilePreviewOpen ? "drawer-bottom h-[75vh]" : "drawer-bottom h-[64px]"
        }`}
      >
        <div 
          onClick={() => setMobilePreviewOpen(!mobilePreviewOpen)}
          className="flex items-center justify-between px-5 h-[64px] cursor-pointer shrink-0 border-b border-indigo-500/10 active:bg-white/5 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Wand2 className={`w-5 h-5 ${generatedResult || liveDraft ? 'text-indigo-400' : 'text-muted-foreground'}`} />
            <span className="font-semibold text-foreground">Live Preview</span>
            {(generatedResult || liveDraft) && <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-2" />}
          </div>
          <ChevronUp className={`w-5 h-5 text-muted-foreground transition-transform duration-300 ${mobilePreviewOpen ? 'rotate-180' : ''}`} />
        </div>

        <div className={`flex-1 overflow-y-auto flex flex-col p-4 transition-opacity duration-300 ${mobilePreviewOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <div className="flex-1 min-h-0 flex flex-col">
            <PreviewContent />
          </div>
        </div>
      </div>
    </div>
  );
}
