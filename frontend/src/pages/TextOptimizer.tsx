import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Save, ArrowDown, Loader2, Wand2 } from 'lucide-react';
import { api } from '../lib/api';
import { useUIStore } from '../stores/uiStore';
import { usePromptStore } from '../stores/promptStore';

const strategies = [
  { id: 'Strukturiert (Markdown)', label: 'Strukturiert (Markdown)', desc: 'Nutzt saubere Überschriften, Listen und klare Abschnitte.' },
  { id: 'Experten-Persona', label: 'Experten-Persona', desc: 'Gibt der KI eine starke Rolle und verlangt professionelle Sprache.' },
  { id: 'Chain-of-Thought', label: 'Schritt-für-Schritt', desc: 'Weist die KI an, den Denkprozess (Chain-of-Thought) offenzulegen.' },
  { id: 'Präzise & Kurz', label: 'Präzise & Kurz', desc: 'Entfernt Floskeln und optimiert auf maximale Direktheit.' },
  { id: 'custom', label: 'Eigene Strategie', desc: 'Gib deine eigene spezifische Optimierungsstrategie vor.' },
];

export default function TextOptimizer() {
  const [inputPrompt, setInputPrompt] = useState('');
  const [outputPrompt, setOutputPrompt] = useState('');
  const [selectedStrategy, setSelectedStrategy] = useState('Strukturiert (Markdown)');
  const [customStrategy, setCustomStrategy] = useState('');
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [mobilePreviewOpen, setMobilePreviewOpen] = useState(false);
  
  const addToast = useUIStore(s => s.addToast);
  const createPrompt = usePromptStore(s => s.createPrompt);

  const handleOptimize = async () => {
    if (!inputPrompt.trim()) return;
    
    setIsOptimizing(true);
    try {
      const activeStrategy = selectedStrategy === 'custom' ? customStrategy.trim() || 'Allgemein Optimieren' : selectedStrategy;
      const draft = `Ich möchte, dass du den folgenden Text-Prompt umschreibst und optimierst. Bitte nutze dabei zwingend die folgende Strategie: ${activeStrategy}. \n\nDer Prompt lautet:\n"${inputPrompt.trim()}"`;
      const result = await api.expandPrompt(draft);
      setOutputPrompt(result.prompt);
      addToast({
        title: 'Erfolgreich optimiert',
        description: `Provider: ${result.provider}`,
        variant: 'success'
      });
      // Optionally auto-open drawer on mobile after success:
      // if (window.innerWidth < 1024) setMobilePreviewOpen(true);
    } catch (error: any) {
      addToast({ title: 'Fehler', description: error.message, variant: 'error' });
    } finally {
      setIsOptimizing(false);
    }
  };

  const copyToClipboard = () => {
    if (!outputPrompt) return;
    navigator.clipboard.writeText(outputPrompt);
    addToast({ title: 'Kopiert', description: 'Prompt in die Zwischenablage kopiert', variant: 'success' });
  };

  const savePrompt = () => {
    if (!outputPrompt) return;
    createPrompt({
      title: 'Optimierter Text Prompt',
      content: outputPrompt,
      category: 'optimized',
      type: 'text',
      tags: ['optimized', 'text']
    });
    addToast({ title: 'Gespeichert', description: 'Prompt wurde in Bibliothek abgelegt', variant: 'success' });
  };

  const PreviewContent = () => (
    <>
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-border/50 shrink-0 hidden lg:flex">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
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
              className="absolute inset-0 flex flex-col items-center justify-center text-indigo-400 gap-4"
            >
              <Loader2 className="w-10 h-10 animate-spin" />
              <p className="font-medium animate-pulse">KI formuliert den Prompt um...</p>
            </motion.div>
          ) : outputPrompt ? (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex-1 overflow-y-auto pr-2 custom-scrollbar flex flex-col gap-4 text-sm"
            >
              <textarea
                value={outputPrompt}
                onChange={(e) => setOutputPrompt(e.target.value)}
                className="flex-1 w-full min-h-[300px] bg-black/40 border border-indigo-500/20 rounded-lg p-4 text-foreground text-sm xl:text-base leading-relaxed font-light resize-y focus:outline-none focus:border-indigo-500/50"
              />
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
          disabled={!outputPrompt || isOptimizing}
          className="flex-1 btn-secondary disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <Copy className="w-4 h-4" />
          <span>Kopieren</span>
        </button>
        <button
          onClick={savePrompt}
          disabled={!outputPrompt || isOptimizing}
          className="flex-1 btn-secondary disabled:opacity-50 text-indigo-300 border-indigo-500/30 hover:bg-indigo-500/10 flex items-center justify-center gap-2"
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
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shrink-0">
                <Wand2 className="text-white w-4 h-4 md:w-5 md:h-5" />
              </div>
              <span className="text-xl md:text-3xl">Prompt Optimizer</span>
            </h1>
            <p className="text-sm md:text-base text-muted-foreground mt-1 md:mt-2">
              Verfeinere deine Anweisungen für Text-KIs (z.B. ChatGPT, Claude) mit bewährten Prompt-Engineering-Methoden.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-6 w-full lg:max-w-2xl mx-auto flex-1">
          <div className="glass-card flex-1 flex flex-col min-h-0 relative group border-indigo-500/20">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Dein Input Prompt
            </h3>
            <textarea
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              placeholder="Beispiel: Schreib mir eine Mail an den Chef wegen Urlaub..."
              className="flex-1 min-h-[120px] bg-transparent resize-none focus:outline-none text-lg text-foreground placeholder:text-muted-foreground/40"
            />
            
            <div className="mt-4 pt-4 border-t border-border/50">
              <p className="text-sm font-medium text-foreground mb-3">Optimierungs-Strategie auswählen:</p>
              <div className="flex flex-col gap-3">
                {strategies.map(s => (
                  <button
                    key={s.id}
                    onClick={() => setSelectedStrategy(s.id)}
                    className={`text-left p-3 rounded-xl border transition-all ${
                      selectedStrategy === s.id 
                        ? 'border-indigo-500 bg-indigo-500/10 text-indigo-300' 
                        : 'border-border bg-white/5 text-muted-foreground hover:bg-white/10'
                    }`}
                  >
                    <p className="font-semibold text-sm mb-1 text-foreground">{s.label}</p>
                    <p className="text-xs opacity-70 leading-tight">{s.desc}</p>
                  </button>
                ))}
                
                {selectedStrategy === 'custom' && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-2"
                  >
                    <input
                      type="text"
                      autoFocus
                      placeholder="z.B. Antworte immer im Piraten-Slang..."
                      value={customStrategy}
                      onChange={(e) => setCustomStrategy(e.target.value)}
                      className="w-full bg-black/40 border border-indigo-500/30 rounded-lg p-3 text-sm focus:outline-none focus:border-indigo-500/70 text-foreground placeholder:text-muted-foreground/50 transition-colors"
                    />
                  </motion.div>
                )}
              </div>
            </div>
            
            {/* Desktop-only arrow indicator */}
            <div className="hidden lg:flex absolute right-0 top-[40%] translate-x-1/2 z-10 w-12 h-12 rounded-full border-4 border-background bg-gradient-to-br from-indigo-500 to-blue-600 items-center justify-center shadow-xl shadow-indigo-500/20">
              <ArrowDown className="w-6 h-6 text-white -rotate-90" />
            </div>
          </div>
          
          <button
            onClick={handleOptimize}
            disabled={!inputPrompt.trim() || isOptimizing}
            className="btn-primary w-full py-4 text-lg font-bold flex items-center justify-center gap-2 from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
          >
            {isOptimizing ? <Loader2 className="w-6 h-6 animate-spin" /> : <Wand2 className="w-6 h-6" />}
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
        className={`lg:hidden fixed left-0 right-0 z-40 transition-all duration-300 ease-in-out flex flex-col bg-background/95 backdrop-blur-xl border-t border-indigo-500/30 rounded-t-2xl shadow-[0_-15px_40px_-15px_rgba(0,0,0,0.5)] ${
          mobilePreviewOpen ? "drawer-bottom h-[75vh]" : "drawer-bottom h-[64px]"
        }`}
      >
        <div 
          onClick={() => setMobilePreviewOpen(!mobilePreviewOpen)}
          className="flex items-center justify-between px-5 h-[64px] cursor-pointer shrink-0 border-b border-indigo-500/10 active:bg-white/5 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Wand2 className={`w-5 h-5 ${(outputPrompt || inputPrompt) ? 'text-indigo-400' : 'text-muted-foreground'}`} />
            <span className="font-semibold text-foreground">Live Preview</span>
            {(outputPrompt || inputPrompt) && <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-2" />}
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
