import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Image as ImageIcon, Upload, Copy, Save, Loader2, X, Sparkles } from 'lucide-react';
import { api, type ImagePromptResponse } from '../lib/api';
import { useUIStore } from '../stores/uiStore';
import { usePromptStore } from '../stores/promptStore';

export default function ImageToPrompt() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [instructions, setInstructions] = useState<string>('');
  const [outputResult, setOutputResult] = useState<ImagePromptResponse | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const addToast = useUIStore(s => s.addToast);
  const createPrompt = usePromptStore(s => s.createPrompt);

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      addToast({ title: 'Ungültiges Format', description: 'Bitte wähle ein Bild (JPG, PNG) aus.', variant: 'error' });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      addToast({ title: 'Datei zu groß', description: 'Bilder dürfen max. 10MB groß sein.', variant: 'error' });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
      setOutputResult(null); // Reset previous output
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const analyzeImage = async () => {
    if (!imagePreview) return;
    
    setIsAnalyzing(true);
    try {
      const result = await api.imageToPrompt(imagePreview, instructions);
      setOutputResult(result);
      addToast({
        title: 'Analyse abgeschlossen',
        description: `Provider: ${result.provider}`,
        variant: 'success'
      });
    } catch (error: any) {
      addToast({ title: 'Analyse fehlgeschlagen', description: error.message, variant: 'error' });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-full flex flex-col p-4 md:p-8 pb-24 md:pb-8 max-w-6xl mx-auto w-full">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shrink-0">
            <ImageIcon className="text-white w-4 h-4 md:w-5 md:h-5" />
          </div>
          Bild → Prompt
        </h1>
        <p className="text-sm md:text-base text-muted-foreground mt-1 md:mt-2">
          Lade ein Bild hoch und lasse die KI den perfekten Prompt dafür generieren.
        </p>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8 min-h-0 lg:overflow-visible touch-scroll">
        {/* Upload Area */}
        <div className="flex flex-col gap-4 min-h-[400px]">
          {!imagePreview ? (
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`flex-1 glass-card border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${
                isDragging ? 'border-orange-500 bg-orange-500/10' : 'border-border/60 hover:border-orange-500/50 hover:bg-white/5'
              }`}
            >
              <div className="w-20 h-20 rounded-full bg-orange-500/10 flex items-center justify-center mb-6">
                <Upload className="w-10 h-10 text-orange-400" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Bild hochladen</h3>
              <p className="text-muted-foreground text-center max-w-xs mb-6">
                Klicke hier oder ziehe ein Bild per Drag & Drop in diesen Bereich
              </p>
              <span className="text-xs font-medium text-orange-400/80 bg-orange-500/10 px-3 py-1 rounded-full">
                JPG, PNG, WebP (max. 10MB)
              </span>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*"
                onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])} 
              />
            </div>
          ) : (
            <div className="flex-1 glass-card relative p-2 flex flex-col items-center justify-center overflow-hidden border-orange-500/30">
              <img 
                src={imagePreview} 
                alt="Preview" 
                className="max-w-full max-h-full object-contain rounded-lg"
              />
              <button
                onClick={() => { setImagePreview(null); setOutputResult(null); setInstructions(''); }}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md flex items-center justify-center transition-colors text-white mt-10 md:mt-0"
                title="Bild entfernen"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Additional Instructions */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-muted-foreground ml-1">Zusätzliche Anweisungen (Optional)</label>
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="z.B. 'Fokussiere dich auf die Farbpalette' oder 'Beschreibe es als Cyberpunk-Szene'"
              className="w-full h-24 bg-white/5 border border-border/50 rounded-xl p-3 text-sm text-foreground resize-none focus:outline-none focus:border-orange-500/50 transition-colors"
            />
          </div>

          <button
            onClick={analyzeImage}
            disabled={!imagePreview || isAnalyzing}
            className="btn-primary w-full py-4 text-lg font-bold flex items-center justify-center gap-2 from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAnalyzing ? <Loader2 className="w-6 h-6 animate-spin" /> : <ImageIcon className="w-6 h-6" />}
            <span>{isAnalyzing ? 'Analysiere Bild...' : 'Bild analysieren'}</span>
          </button>
        </div>

        {/* Output Area */}
        <div className="glass-card flex flex-col min-h-[400px]">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-orange-400 mb-4 flex items-center gap-2">
            Zugehöriger Prompt
          </h3>

          <div className="flex-1 relative border border-border/50 rounded-xl bg-background/50 overflow-hidden mb-4">
            <AnimatePresence mode="wait">
              {isAnalyzing ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex flex-col items-center justify-center text-orange-400 gap-4"
                >
                  <Loader2 className="w-12 h-12 animate-spin" />
                  <p className="font-medium animate-pulse text-lg">Entschlüssele visuelle Parameter...</p>
                  <p className="text-sm text-orange-400/60 text-center max-w-xs px-4">
                    Stil, Beleuchtung, Kameraperspektive und Details werden extrahiert.
                  </p>
                </motion.div>
              ) : outputResult ? (
                <motion.div
                  key="result"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 p-4 overflow-y-auto flex flex-col gap-4 text-sm"
                >
                  <div className="flex flex-col gap-1.5">
                    <span className="text-xs text-orange-400 font-semibold uppercase tracking-wider">Rekonstruierter Prompt</span>
                    <textarea
                      value={outputResult.optimizedPrompt || ''}
                      onChange={(e) => setOutputResult({ ...outputResult, optimizedPrompt: e.target.value })}
                      className="w-full min-h-[120px] bg-black/40 border border-orange-500/20 rounded-lg p-4 text-foreground leading-relaxed font-light resize-y focus:outline-none focus:border-orange-500/50"
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

                  <div className="flex flex-wrap gap-4">
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
                    <div className="flex flex-col gap-1 p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                      <span className="text-[11px] text-orange-300 font-semibold uppercase flex items-center gap-1.5">
                        <Sparkles className="w-3 h-3" /> Analyse
                      </span>
                      <ul className="list-disc pl-4 text-xs text-orange-200/80 space-y-1 mt-2">
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
                  className="absolute inset-0 flex items-center justify-center text-muted-foreground/50 p-6 text-center"
                >
                  <p>Lade zuerst ein Bild hoch und klicke auf "Analysieren", um den passenden Prompt zu generieren.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                if (!outputResult?.optimizedPrompt) return;
                navigator.clipboard.writeText(outputResult.optimizedPrompt);
                addToast({ title: 'Kopiert', description: 'Prompt in die Zwischenablage kopiert', variant: 'success' });
              }}
              disabled={!outputResult?.optimizedPrompt || isAnalyzing}
              className="flex-1 btn-secondary disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Copy className="w-4 h-4" />
              <span>Kopieren</span>
            </button>
            <button
              onClick={() => {
                if (!outputResult?.optimizedPrompt) return;
                createPrompt({
                  title: outputResult.title || 'Aus Bild extrahiert',
                  content: outputResult.optimizedPrompt,
                  category: 'reverse-engineered',
                  type: 'image',
                  tags: outputResult.styleTags?.slice(0, 5) || []
                });
              }}
              disabled={!outputResult?.optimizedPrompt || isAnalyzing}
              className="flex-1 btn-secondary disabled:opacity-50 text-orange-300 border-orange-500/30 hover:bg-orange-500/10 flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Speichern</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
