import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Copy, Save, ArrowDown, Loader2 } from 'lucide-react';
import { api, type ImagePromptResponse } from '../lib/api';
import { useUIStore } from '../stores/uiStore';
import { usePromptStore } from '../stores/promptStore';

const styles = [
  { id: 'cinematic', label: 'Cinematic', desc: 'Dramatisch, episch, Film-Look' },
  { id: 'hyperrealistic', label: 'Hyperrealistisch', desc: 'Fotorealistisch, ultra-detailliert' },
  { id: 'minimal', label: 'Minimalistisch', desc: 'Clean, elegant, viel Whitespace' },
  { id: 'commercial', label: 'Commercial', desc: 'Werbefotografie, Produkt-Fokus' },
];

export default function Optimizer() {
  const [inputPrompt, setInputPrompt] = useState('');
  const [outputResult, setOutputResult] = useState<ImagePromptResponse | null>(null);
  const [selectedStyle, setSelectedStyle] = useState('cinematic');
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [mobilePreviewOpen, setMobilePreviewOpen] = useState(false);
  
  const addToast = useUIStore(s => s.addToast);
  const createPrompt = usePromptStore(s => s.createPrompt);

  const handleOptimize = async () => {
    if (!inputPrompt.trim()) return;
    
    setIsOptimizing(true);
    try {
      const result = await api.optimize(inputPrompt, selectedStyle);
      setOutputResult(result);
      addToast({
        title: 'Erfolgreich optimiert',
        description: `Provider: ${result.provider}`,
        variant: 'success'
      });
    } catch (error: any) {
      addToast({ title: 'Fehler', description: error.message, variant: 'error' });
    } finally {
      setIsOptimizing(false);
    }
  };

  const copyToClipboard = () => {
    if (!outputResult?.optimizedPrompt) return;
    navigator.clipboard.writeText(outputResult.optimizedPrompt);
    addToast({ title: 'Kopiert', description: 'Prompt in die Zwischenablage kopiert', variant: 'success' });
  };

  const savePrompt = () => {
    if (!outputResult?.optimizedPrompt) return;
    createPrompt({
      title: outputResult.title || 'Optimierter Prompt',
      content: outputResult.optimizedPrompt,
      category: 'optimized',
      type: 'image',
      tags: [selectedStyle, 'optimized', ...(outputResult.styleTags || [])].slice(0, 10)
    });
    addToast({ title: 'Gespeichert', description: 'Prompt wurde in Bibliothek abgelegt', variant: 'success' });
  };

  const PreviewContent = () => (
    <>
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-border/50 shrink-0 hidden lg:flex">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-fuchsia-400 flex items-center gap-2">
          Optimiertes Ergebnis
        </h3>
      </div>

      <div className="flex-1 relative overflow-hidden flex flex-col mb-4">
        <AnimatePresence mode="wait">
          {isOptimizing ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center text-fuchsia-400 gap-4"
            >
              <Loader2 className="w-10 h-10 animate-spin" />
              <p className="font-medium animate-pulse">KI analysiert und erweitert...</p>
            </motion.div>
          ) : outputResult ? (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex-1 overflow-y-auto pr-2 custom-scrollbar flex flex-col gap-4 text-sm"
            >
              <div className="flex flex-col gap-1.5">
                <span className="text-xs text-fuchsia-400 font-semibold uppercase tracking-wider">Optimierter Prompt</span>
                <textarea
                  value={outputResult.optimizedPrompt || ''}
                  onChange={(e) => setOutputResult({ ...outputResult, optimizedPrompt: e.target.value })}
                  className="w-full min-h-[160px] bg-black/40 border border-fuchsia-500/20 rounded-lg p-4 text-foreground text-lg leading-relaxed font-light resize-y focus:outline-none focus:border-fuchsia-500/50"
                />
              </div>

              {outputResult.negativePrompt && (
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs text-rose-400 font-semibold uppercase tracking-wider">Negative Prompt</span>
                  <textarea
                    value={outputResult.negativePrompt}
                    onChange={(e) => setOutputResult({ ...outputResult, negativePrompt: e.target.value })}
                    className="w-full bg-black/40 border border-rose-500/20 rounded-lg p-3 text-rose-100/90 resize-y focus:outline-none focus:border-rose-500/50 text-xs font-light"
                    rows={3}
                  />
                </div>
              )}

              <div className="flex flex-wrap gap-4 mt-2">
                {[
                  { label: "Stile", items: outputResult.styleTags },
                  { label: "Kamera", items: outputResult.cameraSuggestions },
                  { label: "Licht", items: outputResult.lightingSuggestions }
                ].map((group, idx) => (
                  group.items?.length > 0 && (
                    <div key={idx} className="flex flex-col gap-1.5 flex-1 min-w-[120px]">
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

              {outputResult.improvementNotes?.length > 0 && (
                <div className="flex flex-col gap-1 mt-4 p-3 bg-fuchsia-500/10 border border-fuchsia-500/20 rounded-lg">
                  <span className="text-[11px] text-fuchsia-300 font-semibold uppercase flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3" /> KI Verbesserungen
                  </span>
                  <ul className="list-disc pl-4 text-xs text-fuchsia-200/80 space-y-1 mt-2">
                    {outputResult.improvementNotes.map((note, i) => (
                      <li key={i} className="leading-snug">{note}</li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 flex items-center justify-center text-muted-foreground/50 border-2 border-dashed border-border/50 rounded-xl"
            >
              Das Ergebnis erscheint hier
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="pt-4 border-t border-border/50 flex gap-3 shrink-0">
        <button
          onClick={copyToClipboard}
          disabled={!outputResult?.optimizedPrompt || isOptimizing}
          className="flex-1 btn-secondary disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <Copy className="w-4 h-4" />
          <span>Kopieren</span>
        </button>
        <button
          onClick={savePrompt}
          disabled={!outputResult?.optimizedPrompt || isOptimizing}
          className="flex-1 btn-secondary disabled:opacity-50 text-fuchsia-300 border-fuchsia-500/30 hover:bg-fuchsia-500/10 flex items-center justify-center gap-2"
        >
          <Save className="w-4 h-4" />
          <span>Speichern</span>
        </button>
      </div>
    </>
  );

  return (
    <div className="flex flex-col lg:flex-row min-h-full lg:h-full">
      {/* Scrollable Input Area */}
      <div className="flex-1 lg:overflow-y-auto p-4 md:p-6 pb-28 lg:pb-6 touch-scroll flex flex-col">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-purple-500 to-fuchsia-600 flex items-center justify-center shrink-0">
                <Sparkles className="text-white w-4 h-4 md:w-5 md:h-5" />
              </div>
              <span className="text-xl md:text-3xl">Bilder Prompt Optimizer</span>
            </h1>
            <p className="text-sm md:text-base text-muted-foreground mt-1 md:mt-2">
              Verwandle simple Ideen in professionelle, hochdetaillierte Prompts durch KI.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-6 w-full lg:max-w-2xl mx-auto flex-1">
          <div className="glass-card flex-1 flex flex-col min-h-0 relative group border-purple-500/20">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Dein Input Prompt
            </h3>
            <textarea
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              placeholder="Beispiel: Eine Katze im Weltraum..."
              className="flex-1 min-h-[120px] bg-transparent resize-none focus:outline-none text-lg text-foreground placeholder:text-muted-foreground/40"
            />
            
            <div className="mt-4 pt-4 border-t border-border/50">
              <p className="text-sm font-medium text-foreground mb-3">Ziel-Stil auswählen:</p>
              <div className="flex flex-col gap-3">
                {styles.map(s => (
                  <button
                    key={s.id}
                    onClick={() => setSelectedStyle(s.id)}
                    className={`text-left p-3 rounded-xl border transition-all ${
                      selectedStyle === s.id 
                        ? 'border-purple-500 bg-purple-500/10 text-purple-300' 
                        : 'border-border bg-white/5 text-muted-foreground hover:bg-white/10'
                    }`}
                  >
                    <p className="font-semibold text-sm mb-1 text-foreground">{s.label}</p>
                    <p className="text-xs opacity-70 leading-tight">{s.desc}</p>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Desktop-only arrow indicator */}
            <div className="hidden lg:flex absolute right-0 top-[40%] translate-x-1/2 z-10 w-12 h-12 rounded-full border-4 border-background bg-gradient-to-br from-purple-500 to-fuchsia-600 items-center justify-center shadow-xl shadow-purple-500/20">
              <ArrowDown className="w-6 h-6 text-white -rotate-90" />
            </div>
          </div>
          
          <button
            onClick={handleOptimize}
            disabled={!inputPrompt.trim() || isOptimizing}
            className="btn-primary w-full py-4 text-lg font-bold flex items-center justify-center gap-2 from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
          >
            {isOptimizing ? <Loader2 className="w-6 h-6 animate-spin" /> : <Sparkles className="w-6 h-6" />}
            <span>{isOptimizing ? 'Optimiere...' : 'Jetzt Optimieren'}</span>
          </button>
        </div>
      </div>

      {/* Desktop preview sidebar */}
      <div className="hidden lg:flex lg:w-[440px] xl:w-[500px] border-l border-border bg-background p-6 flex-col lg:h-full">
        <PreviewContent />
      </div>

      {/* Mobile: Anchored Collapsible Bottom Panel */}
      <div 
        className={`lg:hidden fixed left-0 right-0 z-40 transition-all duration-300 ease-in-out flex flex-col bg-background/95 backdrop-blur-xl border-t border-purple-500/30 rounded-t-2xl shadow-[0_-15px_40px_-15px_rgba(0,0,0,0.5)] ${
          mobilePreviewOpen ? "drawer-bottom h-[75vh]" : "drawer-bottom h-[64px]"
        }`}
      >
        <div 
          onClick={() => setMobilePreviewOpen(!mobilePreviewOpen)}
          className="flex items-center justify-between px-5 h-[64px] cursor-pointer shrink-0 border-b border-purple-500/10 active:bg-white/5 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Sparkles className={`w-5 h-5 ${(outputResult?.optimizedPrompt || inputPrompt) ? 'text-fuchsia-400' : 'text-muted-foreground'}`} />
            <span className="font-semibold text-foreground">Live Preview</span>
            {(outputResult?.optimizedPrompt || inputPrompt) && <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-2" />}
          </div>
          <motion.div
            animate={{ rotate: mobilePreviewOpen ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
             <ArrowDown className="w-5 h-5 text-muted-foreground" />
          </motion.div>
        </div>

        <div className={`flex-1 overflow-y-auto flex flex-col p-4 transition-opacity duration-300 ${mobilePreviewOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <PreviewContent />
        </div>
      </div>
    </div>
  );
}
