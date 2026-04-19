import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Copy, Shuffle, Sparkles, Wand2, Loader2, Cpu, Type, ChevronUp } from 'lucide-react';
import { usePromptStore } from '../stores/promptStore';
import { useUIStore } from '../stores/uiStore';
import { useLocation } from 'react-router-dom';
import { api } from '../lib/api';

const BUILDER_CATEGORIES = {
  roles: ['Experte', 'Anfänger', 'Kritiker', 'Lehrer', 'Entwickler', 'Marketer', 'Designer'],
  tasks: ['Analysieren', 'Zusammenfassen', 'Code schreiben', 'Ideen generieren', 'Übersetzen', 'Erklären', 'Überarbeiten'],
  tones: ['Professionell', 'Locker', 'Wissenschaftlich', 'Humorvoll', 'Streng', 'Empathisch', 'Direkt'],
  formats: ['Bulletpoints', 'Tabelle', 'Fließtext', 'JSON', 'Markdown', 'Code-Block', 'Schritt-für-Schritt'],
  audiences: ['Experten', 'Laien', 'Kinder', 'Management', 'Entwickler', 'Kunden']
};

export default function Builder() {
  const location = useLocation();
  const { addToast } = useUIStore();
  const { createPrompt } = usePromptStore();

  const [selections, setSelections] = useState({
    role: '',
    task: '',
    context: '',
    tone: '',
    format: '',
    audience: ''
  });

  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [mobilePreviewOpen, setMobilePreviewOpen] = useState(false);

  // Auto-fill from routing (if coming from RolesPage)
  useEffect(() => {
    if (location.state && location.state.customPrompt) {
      setSelections(prev => ({ ...prev, role: 'Benutzerdefiniert (Aus Rollen geladen)' }));
      setGeneratedPrompt(location.state.customPrompt);
    }
  }, [location]);

  // Dynamically build prompt when selections change
  useEffect(() => {
    // If we loaded a full prompt from state, don't overwrite it immediately unless user changes controls
    if (location.state && location.state.customPrompt && !selections.task && !selections.context) return;

    let parts = [];
    if (selections.role) parts.push(`Rolle: Du bist ein ${selections.role}.`);
    if (selections.task) parts.push(`Aufgabe: Deine Hauptaufgabe ist es, ${selections.task}.`);
    if (selections.context) parts.push(`Kontext/Hintergrund: ${selections.context}`);
    if (selections.audience) parts.push(`Zielgruppe: Deine Antworten richten sich an ${selections.audience}.`);
    if (selections.tone) parts.push(`Tonfall: Antworte bitte stets ${selections.tone}.`);
    if (selections.format) parts.push(`Output-Format: Formatiere deine Antwort als ${selections.format}.`);

    if (parts.length > 0) {
      setGeneratedPrompt(parts.join('\n\n'));
    } else {
      setGeneratedPrompt('');
    }
  }, [selections]);

  const toggleSelection = (category: keyof typeof selections, value: string) => {
    setSelections(prev => ({
      ...prev,
      [category]: prev[category] === value ? '' : value
    }));
  };

  const handleRandomize = () => {
    const getRandom = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];
    setSelections({
      role: getRandom(BUILDER_CATEGORIES.roles),
      task: getRandom(BUILDER_CATEGORIES.tasks),
      context: 'Ich brauche eine schnelle, aber fundierte Lösung für ein komplexes Problem.',
      tone: getRandom(BUILDER_CATEGORIES.tones),
      format: getRandom(BUILDER_CATEGORIES.formats),
      audience: getRandom(BUILDER_CATEGORIES.audiences)
    });
  };

  const handleGenerateAI = async () => {
    if (!generatedPrompt) return;
    setIsGenerating(true);
    try {
      const result = await api.expandPrompt(generatedPrompt);
      setGeneratedPrompt(result.prompt);
      addToast({ title: 'Erfolgreich generiert', description: `Provider: ${result.provider}`, variant: 'success' });
    } catch (error: any) {
      addToast({ title: 'Fehler bei der Generierung', description: error.message, variant: 'error' });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    if (!generatedPrompt) return;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(generatedPrompt);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = generatedPrompt;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
          document.execCommand('copy');
        } finally {
          textArea.remove();
        }
      }
      addToast({ title: 'Kopiert', description: 'Dein Prompt wurde kopiert.', variant: 'success' });
    } catch (err) {
      addToast({ title: 'Fehler', description: 'Kopieren fehlgeschlagen.', variant: 'error' });
    }
  };

  const handleSave = async () => {
    if (!generatedPrompt) return;
    await createPrompt({
      title: `${selections.role || 'Modularer'} Prompt`,
      content: generatedPrompt,
      category: 'builder',
      type: 'text',
      tags: ['builder', 'modular']
    });
    addToast({ title: 'Gespeichert', description: 'Prompt wurde zur Bibliothek hinzugefügt.', variant: 'success' });
  };

  const renderChips = (title: string, category: keyof typeof selections, options: string[]) => (
    <motion.div variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }} className="mb-6">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">{title}</h3>
      <div className="flex flex-wrap gap-2">
        {options.map(opt => (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            key={opt}
            onClick={() => toggleSelection(category, opt)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${
              selections[category] === opt
                ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.2)]'
                : 'bg-white/5 text-muted-foreground border-white/10 hover:bg-white/10 hover:border-white/20'
            }`}
          >
            {opt}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );

  const PreviewContent = () => (
    <>
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-border/50 shrink-0">
        <h3 className="text-lg font-bold text-foreground hidden lg:flex items-center gap-2">
          <Wand2 className="w-5 h-5 text-indigo-400" />
          Live Preview
        </h3>
        <div className="flex gap-2 ml-auto">
           <button 
            onClick={handleCopy}
            disabled={!generatedPrompt}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
            title="Kopieren"
           >
             <Copy className="w-4 h-4" />
           </button>
           <button 
            onClick={handleSave}
            disabled={!generatedPrompt || isGenerating}
            className="p-2 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 transition-colors disabled:opacity-50"
            title="Speichern"
           >
             <Save className="w-4 h-4" />
           </button>
        </div>
      </div>

      <div className="flex-1 bg-black/40 rounded-xl border border-white/5 p-5 overflow-y-auto font-light text-lg leading-relaxed text-foreground/90 relative mb-4">
        {!generatedPrompt ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground/40 p-4 text-center">
            <Sparkles className="w-12 h-12 mb-4 opacity-50" />
            <p>Klicke auf die Module links, um deinen Prompt-Entwurf zu bauen.</p>
          </div>
        ) : isGenerating ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-indigo-400 gap-4">
            <Loader2 className="w-12 h-12 animate-spin" />
            <p className="font-medium animate-pulse text-lg">KI formuliert den Prompt...</p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            key={generatedPrompt}
            className="whitespace-pre-wrap"
          >
            {generatedPrompt}
          </motion.div>
        )}
      </div>

      <button
        onClick={handleGenerateAI}
        disabled={!generatedPrompt || isGenerating}
        className="btn-primary w-full py-4 text-lg font-bold flex items-center justify-center gap-2 from-indigo-500 to-blue-600 hover:from-indigo-400 hover:to-blue-500 disabled:opacity-50 shrink-0"
      >
        {isGenerating ? <Loader2 className="w-6 h-6 animate-spin" /> : <Cpu className="w-6 h-6" />}
        <span>Durch KI ausformulieren lassen</span>
      </button>
    </>
  );

  return (
    <div className="flex flex-col lg:flex-row min-h-full lg:h-full">
      {/* Scrollable builder area */}
      <div className="flex-1 lg:overflow-y-auto p-4 md:p-6 pb-28 lg:pb-6 touch-scroll flex flex-col">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shrink-0">
                <Type className="text-white w-4 h-4 md:w-5 md:h-5" />
              </div>
              Rollen Prompt Maker
            </h1>
            <p className="text-sm md:text-base text-muted-foreground mt-1 md:mt-2">
              Baue strukturierte, hoch-effektive Prompts modular zusammen und lass die KI sie perfektionieren.
            </p>
          </div>
          
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleRandomize}
            className="btn-secondary flex items-center gap-2 border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10 shrink-0"
          >
            <Shuffle className="w-4 h-4" />
            Zufall
          </motion.button>
        </div>

        <motion.div 
          variants={{ hidden: { opacity: 0, x: -20 }, show: { opacity: 1, x: 0 } }}
          className="flex flex-col"
        >
          {renderChips('1. Rolle', 'role', BUILDER_CATEGORIES.roles)}
          {renderChips('2. Aufgabe', 'task', BUILDER_CATEGORIES.tasks)}
          
          <div className="mb-6">
             <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">3. Kontext / Spezifisches Thema</h3>
             <textarea 
               value={selections.context}
               onChange={(e) => setSelections(prev => ({ ...prev, context: e.target.value }))}
               placeholder="Beispiel: Es geht um die Einführung einer neuen Software (CRM) im Unternehmen..."
               className="w-full h-24 bg-black/30 border border-white/10 rounded-xl p-3 text-sm text-foreground/90 font-light resize-none focus:outline-none focus:border-indigo-500/50"
             />
          </div>

          {renderChips('4. Tonalität', 'tone', BUILDER_CATEGORIES.tones)}
          {renderChips('5. Zielgruppe', 'audience', BUILDER_CATEGORIES.audiences)}
          {renderChips('6. Output Format', 'format', BUILDER_CATEGORIES.formats)}
        </motion.div>
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
            <Wand2 className={`w-5 h-5 ${generatedPrompt ? 'text-indigo-400' : 'text-muted-foreground'}`} />
            <span className="font-semibold text-foreground">Live Preview</span>
            {generatedPrompt && <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-2" />}
          </div>
          <ChevronUp className={`w-5 h-5 text-muted-foreground transition-transform duration-300 ${mobilePreviewOpen ? 'rotate-180' : ''}`} />
        </div>

        <div className={`flex-1 overflow-y-auto flex flex-col p-4 transition-opacity duration-300 ${mobilePreviewOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <PreviewContent />
        </div>
      </div>
    </div>
  );
}
