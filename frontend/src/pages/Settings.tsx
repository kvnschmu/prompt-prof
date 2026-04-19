import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings as SettingsIcon, Key, Palette, Shield, Loader2, Zap,
  RefreshCcw, ExternalLink, CheckCircle2, AlertCircle, Save, GraduationCap
} from 'lucide-react';
import { useSettingsStore } from '../stores/settingsStore';
import { useUIStore } from '../stores/uiStore';
import { api } from '../lib/api';

interface Model { id: string; name: string; isFree: boolean; description?: string; contextLength?: number; }

function ProviderSection({
  title, gradient, apiKeyLabel, apiKeyPlaceholder, apiKeyValue, onApiKeyChange,
  models, isLoadingModels, modelError, selectedModel, onModelChange, onFetchModels,
  usageData, isLoadingUsage, onFetchUsage, docsUrl, savedKey,
  onSaveApiKey, isSaving,
}: {
  title: string; gradient: string; apiKeyLabel: string; apiKeyPlaceholder: string;
  apiKeyValue: string; onApiKeyChange: (v: string) => void;
  models: Model[]; isLoadingModels: boolean; modelError: string; selectedModel: string;
  onModelChange: (v: string) => void; onFetchModels: () => void;
  usageData: any; isLoadingUsage: boolean; onFetchUsage: () => void;
  docsUrl: string; savedKey: string;
  onSaveApiKey: () => void; isSaving: boolean;
}) {
  const isDirty = apiKeyValue !== savedKey;

  return (
    <div>
      <h3 className={`text-lg font-semibold text-foreground mb-4 border-b border-border/50 pb-2 flex items-center gap-2`}>
        <div className={`w-2.5 h-2.5 rounded-full ${gradient}`} />
        {title}
      </h3>
      <div className="space-y-5 max-w-lg">
        {/* API Key */}
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1">{apiKeyLabel}</label>
          <div className="flex flex-col md:flex-row gap-2">
            <div className="relative flex-1">
              <input
                type="password"
                value={apiKeyValue}
                onChange={(e) => onApiKeyChange(e.target.value)}
                placeholder={apiKeyPlaceholder}
                className="input-field pr-10 w-full"
              />
              {isDirty && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-amber-400" title="Nicht gespeichert" />
              )}
            </div>
            <div className="flex gap-2">
              <motion.button
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
              onClick={onFetchModels}
              disabled={!apiKeyValue || isLoadingModels}
              className="btn-secondary px-3 flex items-center gap-1.5 disabled:opacity-50"
            >
              {isLoadingModels ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCcw className="w-4 h-4" />}
              <span className="text-xs">Testen</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
              onClick={onSaveApiKey}
              disabled={!isDirty || isSaving}
              className="btn-secondary px-3 flex items-center gap-1.5 disabled:opacity-50 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span className="text-xs">Speichern</span>
            </motion.button>
            </div>
          </div>
          {isDirty && (
            <p className="text-xs text-amber-400 mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> Nicht gespeichert – klicke "Speichern" um den Key dauerhaft zu sichern.
            </p>
          )}
          {!isDirty && savedKey && (
            <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Key ist gespeichert und wird beim nächsten Start automatisch geladen.
            </p>
          )}
        </div>

        {/* Model Selection */}
        {modelError && (
          <div className="flex items-start gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{modelError}</span>
          </div>
        )}
        {models.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Modell <span className="text-emerald-400 text-xs ml-1">({models.length} Modelle gefunden)</span>
            </label>
            <select
              value={selectedModel}
              onChange={(e) => onModelChange(e.target.value)}
              className="input-field appearance-none"
            >
              {models.map(m => (
                <option key={m.id} value={m.id} className="bg-zinc-900 text-zinc-100">
                  {m.name} {m.contextLength ? `(${(m.contextLength / 1000).toFixed(0)}K ctx)` : ''}
                </option>
              ))}
            </select>
          </div>
        )}
        {models.length === 0 && apiKeyValue && !isLoadingModels && !modelError && (
          <p className="text-xs text-muted-foreground">
            Klicke auf "Testen", um verfügbare Modelle abzurufen.
          </p>
        )}

        {/* Usage Panel */}
        {apiKeyValue && (
          <div className="border border-border/40 rounded-xl p-4 bg-black/20">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-400" />
                API Kontingent
              </h4>
              <div className="flex items-center gap-2">
                <a href={docsUrl} target="_blank" rel="noreferrer" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                  <ExternalLink className="w-3 h-3" /> Docs
                </a>
                <motion.button
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={onFetchUsage}
                  disabled={isLoadingUsage}
                  className="text-xs px-2 py-1 rounded-md bg-white/5 hover:bg-white/10 text-muted-foreground flex items-center gap-1"
                >
                  {isLoadingUsage ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCcw className="w-3 h-3" />}
                  Aktualisieren
                </motion.button>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {isLoadingUsage && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="flex items-center gap-2 text-muted-foreground text-sm py-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Lade Kontingent...
                </motion.div>
              )}
              {usageData && !isLoadingUsage && (
                <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  {usageData.provider === 'gemini' && (
                    <div>
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 mb-3">
                        {usageData.limits?.map((l: any) => (
                          <div key={l.label} className="text-center bg-white/5 rounded-lg py-2 px-1">
                            <p className="text-base font-bold text-foreground">{l.value}</p>
                            <p className="text-[10px] text-muted-foreground leading-tight">{l.unit}</p>
                          </div>
                        ))}
                      </div>
                      {usageData.isFreeTier && (
                        <div className="flex items-center gap-1.5 text-xs text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Kostenloser Tarif aktiv
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">{usageData.note}</p>
                    </div>
                  )}
                  {usageData.provider === 'openrouter' && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5 text-xs mb-2">
                        {usageData.isFreeTier
                          ? <><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /><span className="text-emerald-400">Kostenloser Tarif</span></>
                          : <><Zap className="w-3.5 h-3.5 text-yellow-400" /><span className="text-yellow-400">Bezahlter Tarif</span></>
                        }
                        {usageData.label && <span className="text-muted-foreground ml-1">– {usageData.label}</span>}
                      </div>
                      {usageData.creditLimit != null ? (
                        <div className="grid grid-cols-1 xl:grid-cols-3 gap-2">
                          {[
                            { label: 'Limit (USD)', value: `$${usageData.creditLimit}` },
                            { label: 'Verbraucht', value: `$${parseFloat(usageData.creditUsed || 0).toFixed(4)}` },
                            { label: 'Verbleibend', value: `$${usageData.creditRemaining}` },
                          ].map(s => (
                            <div key={s.label} className="text-center flex items-center justify-between xl:block bg-white/5 rounded-lg py-2 px-3 xl:px-1">
                              <p className="text-[10px] xl:hidden text-muted-foreground leading-tight">{s.label}</p>
                              <p className="text-base font-bold text-foreground">{s.value}</p>
                              <p className="text-[10px] hidden xl:block text-muted-foreground leading-tight">{s.label}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground">Keine Credit-Limits (unbegrenzt kostenlos).</p>
                      )}
                      {usageData.rateLimit && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Rate Limit: {usageData.rateLimit.requests} Anfragen / {usageData.rateLimit.interval}
                        </p>
                      )}
                    </div>
                  )}
                </motion.div>
              )}
              {!usageData && !isLoadingUsage && (
                <p className="text-xs text-muted-foreground">Klicke "Aktualisieren" um dein Kontingent zu prüfen.</p>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Settings() {
  const [activeTab, setActiveTab] = useState('api');
  const settings = useSettingsStore();
  const { addToast } = useUIStore();

  // Saved (persisted) keys – tracks what's actually in the DB
  const [savedGeminiKey, setSavedGeminiKey] = useState('');
  const [savedOrKey, setSavedOrKey] = useState('');
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);

  // Model lists
  const [geminiModels, setGeminiModels] = useState<Model[]>([]);
  const [geminiModelsLoading, setGeminiModelsLoading] = useState(false);
  const [geminiModelError, setGeminiModelError] = useState('');
  const [geminiUsage, setGeminiUsage] = useState<any>(null);
  const [geminiUsageLoading, setGeminiUsageLoading] = useState(false);
  const [geminiSaving, setGeminiSaving] = useState(false);

  const [orModels, setOrModels] = useState<Model[]>([]);
  const [orModelsLoading, setOrModelsLoading] = useState(false);
  const [orModelError, setOrModelError] = useState('');
  const [orUsage, setOrUsage] = useState<any>(null);
  const [orUsageLoading, setOrUsageLoading] = useState(false);
  const [orSaving, setOrSaving] = useState(false);

  // Load persisted settings from backend on mount
  useEffect(() => {
    (async () => {
      setIsLoadingSettings(true);
      try {
        const saved = await api.loadAllSettings();
        if (saved.geminiKey && !settings.geminiKey) {
          settings.setGeminiKey(saved.geminiKey);
        }
        if (saved.openrouterKey && !settings.openrouterKey) {
          settings.setOpenrouterKey(saved.openrouterKey);
        }
        if (saved.geminiModel) settings.setGeminiModel(saved.geminiModel);
        if (saved.openrouterModel) settings.setOpenrouterModel(saved.openrouterModel);
        if (saved.apiProvider) settings.setApiProvider(saved.apiProvider as any);

        // Track what's saved
        setSavedGeminiKey(saved.geminiKey || '');
        setSavedOrKey(saved.openrouterKey || '');
      } catch {
        // Backend might not be running, silently skip
      } finally {
        setIsLoadingSettings(false);
      }
    })();
  }, []);

  const saveGeminiKey = async () => {
    setGeminiSaving(true);
    try {
      await api.saveAllSettings({
        geminiKey: settings.geminiKey,
        geminiModel: settings.geminiModel,
        apiProvider: settings.apiProvider,
      });
      setSavedGeminiKey(settings.geminiKey);
      addToast({ title: 'Gespeichert ✓', description: 'Gemini API-Key wurde sicher gespeichert.', variant: 'success' });
    } catch (e: any) {
      addToast({ title: 'Fehler', description: e.message || 'Speichern fehlgeschlagen.', variant: 'error' });
    } finally {
      setGeminiSaving(false);
    }
  };

  const saveOrKey = async () => {
    setOrSaving(true);
    try {
      await api.saveAllSettings({
        openrouterKey: settings.openrouterKey,
        openrouterModel: settings.openrouterModel,
        apiProvider: settings.apiProvider,
      });
      setSavedOrKey(settings.openrouterKey);
      addToast({ title: 'Gespeichert ✓', description: 'OpenRouter API-Key wurde sicher gespeichert.', variant: 'success' });
    } catch (e: any) {
      addToast({ title: 'Fehler', description: e.message || 'Speichern fehlgeschlagen.', variant: 'error' });
    } finally {
      setOrSaving(false);
    }
  };

  const fetchGeminiModels = useCallback(async () => {
    if (!settings.geminiKey) return;
    setGeminiModelsLoading(true);
    setGeminiModelError('');
    try {
      const models = await api.getModels('gemini', settings.geminiKey);
      setGeminiModels(models);
      if (models.length > 0 && !models.find(m => m.id === settings.geminiModel)) {
        settings.setGeminiModel(models[0].id);
      }
    } catch (e: any) {
      setGeminiModelError(e.message || 'Fehler beim Laden der Modelle');
    } finally {
      setGeminiModelsLoading(false);
    }
  }, [settings.geminiKey]);

  const fetchGeminiUsage = useCallback(async () => {
    if (!settings.geminiKey) return;
    setGeminiUsageLoading(true);
    try {
      const data = await api.getUsage('gemini', settings.geminiKey, settings.geminiModel);
      setGeminiUsage(data);
    } catch { setGeminiUsage(null); }
    finally { setGeminiUsageLoading(false); }
  }, [settings.geminiKey, settings.geminiModel]);

  const fetchOrModels = useCallback(async () => {
    if (!settings.openrouterKey) return;
    setOrModelsLoading(true);
    setOrModelError('');
    try {
      const models = await api.getModels('openrouter', settings.openrouterKey);
      setOrModels(models);
      if (models.length > 0 && !models.find(m => m.id === settings.openrouterModel)) {
        settings.setOpenrouterModel(models[0].id);
      }
    } catch (e: any) {
      setOrModelError(e.message || 'Fehler beim Laden der Modelle');
    } finally {
      setOrModelsLoading(false);
    }
  }, [settings.openrouterKey]);

  const fetchOrUsage = useCallback(async () => {
    if (!settings.openrouterKey) return;
    setOrUsageLoading(true);
    try {
      const data = await api.getUsage('openrouter', settings.openrouterKey, settings.openrouterModel);
      setOrUsage(data);
    } catch { setOrUsage(null); }
    finally { setOrUsageLoading(false); }
  }, [settings.openrouterKey, settings.openrouterModel]);

  const tabs = [
    { id: 'api', label: 'API & Modelle', icon: Key },
    { id: 'appearance', label: 'Darstellung', icon: Palette },
    { id: 'advanced', label: 'Erweitert', icon: Shield },
  ];

  return (
    <div className="md:h-full flex flex-col p-4 md:p-8 pb-24 md:pb-8 max-w-4xl mx-auto w-full">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-zinc-500 to-zinc-700 flex items-center justify-center shrink-0">
            <SettingsIcon className="text-white w-4 h-4 md:w-5 md:h-5" />
          </div>
          Einstellungen
        </h1>
        <p className="text-sm md:text-base text-muted-foreground mt-1 md:mt-2">Passe Prompt Professor an deine Bedürfnisse an.</p>
      </div>

      {isLoadingSettings && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <Loader2 className="w-4 h-4 animate-spin" />
          Lade gespeicherte Einstellungen...
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-4 md:gap-8 flex-1 md:min-h-0">
        {/* Nav */}
        <div className="w-full md:w-56 space-y-1 shrink-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm ${
                activeTab === tab.id
                  ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/20'
                  : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 glass-card space-y-10">
          {activeTab === 'api' && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-400">
              {/* Provider Selection */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4 border-b border-border/50 pb-2">Standard AI-Provider</h3>
                <select
                  value={settings.apiProvider}
                  onChange={(e) => settings.setApiProvider(e.target.value as any)}
                  className="input-field max-w-md appearance-none"
                >
                  <option value="template" className="bg-zinc-900 text-zinc-100">Lokale Templates (Offline / Kostenlos)</option>
                  <option value="gemini" className="bg-zinc-900 text-zinc-100">Google Gemini (Kostenlos via API Key)</option>
                  <option value="openrouter" className="bg-zinc-900 text-zinc-100">OpenRouter (Kostenlose Modelle verfügbar)</option>
                </select>
                <p className="text-xs text-muted-foreground mt-1">
                  Die lokalen Templates nutzen vordefinierte Bausteine ohne echte KI-Erweiterung.
                </p>
              </div>

              {/* Gemini */}
              <ProviderSection
                title="Google Gemini"
                gradient="bg-gradient-to-br from-blue-400 to-indigo-500"
                apiKeyLabel="API Key"
                apiKeyPlaceholder="AIza..."
                apiKeyValue={settings.geminiKey}
                onApiKeyChange={settings.setGeminiKey}
                models={geminiModels}
                isLoadingModels={geminiModelsLoading}
                modelError={geminiModelError}
                selectedModel={settings.geminiModel}
                onModelChange={settings.setGeminiModel}
                onFetchModels={fetchGeminiModels}
                usageData={geminiUsage}
                isLoadingUsage={geminiUsageLoading}
                onFetchUsage={fetchGeminiUsage}
                docsUrl="https://ai.google.dev/pricing"
                savedKey={savedGeminiKey}
                onSaveApiKey={saveGeminiKey}
                isSaving={geminiSaving}
              />

              {/* OpenRouter */}
              <ProviderSection
                title="OpenRouter"
                gradient="bg-gradient-to-br from-violet-500 to-purple-600"
                apiKeyLabel="API Key"
                apiKeyPlaceholder="sk-or-v1-..."
                apiKeyValue={settings.openrouterKey}
                onApiKeyChange={settings.setOpenrouterKey}
                models={orModels}
                isLoadingModels={orModelsLoading}
                modelError={orModelError}
                selectedModel={settings.openrouterModel}
                onModelChange={settings.setOpenrouterModel}
                onFetchModels={fetchOrModels}
                usageData={orUsage}
                isLoadingUsage={orUsageLoading}
                onFetchUsage={fetchOrUsage}
                docsUrl="https://openrouter.ai/docs"
                savedKey={savedOrKey}
                onSaveApiKey={saveOrKey}
                isSaving={orSaving}
              />
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-400">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4 border-b border-border/50 pb-2">Erscheinungsbild</h3>
                <div className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">Theme</label>
                    <div className="flex flex-col gap-3">
                      <button
                        onClick={() => settings.setTheme('dark')}
                        className={`p-4 rounded-xl border flex items-center gap-3 transition-all ${settings.theme === 'dark'
                          ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400'
                          : 'border-border bg-white/5 text-muted-foreground hover:bg-white/10'}`}
                      >
                        <div className="w-5 h-5 rounded-full bg-zinc-900 border border-zinc-600 shadow-inner" />
                        <div>
                          <p className="font-semibold text-sm">Dark Mode</p>
                          <p className="text-xs opacity-60">Augenfreundlich bei Nacht</p>
                        </div>
                      </button>
                      <button
                        onClick={() => settings.setTheme('light')}
                        className={`p-4 rounded-xl border flex items-center gap-3 transition-all ${settings.theme === 'light'
                          ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400'
                          : 'border-border bg-white/5 text-muted-foreground hover:bg-white/10'}`}
                      >
                        <div className="w-5 h-5 rounded-full bg-white border border-zinc-300 shadow-sm" />
                        <div>
                          <p className="font-semibold text-sm">Light Mode</p>
                          <p className="text-xs opacity-60">Klar und übersichtlich</p>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Logo / Branding info */}
                  <div className="mt-6 p-4 rounded-xl border border-border/50 bg-white/[0.02]">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                        <GraduationCap className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-bold text-sm text-foreground">Prompt Professor</p>
                        <p className="text-xs text-muted-foreground">Aktuelles Branding</p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">Das App-Logo und Favicon werden automatisch verwendet.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'advanced' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-400">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4 border-b border-border/50 pb-2 text-red-400">Gefahrenzone</h3>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Dies löscht alle gespeicherten API-Keys und Einstellungen aus deinem lokalen Browser-Speicher. Deine gespeicherten Prompts in der Datenbank bleiben erhalten.
                  </p>
                  <button
                    onClick={() => {
                      if (window.confirm('Möchtest du wirklich alle lokalen Einstellungen zurücksetzen?')) {
                        localStorage.removeItem('promptcraft-settings');
                        window.location.reload();
                      }
                    }}
                    className="btn-secondary text-red-400 border-red-500/30 hover:bg-red-500/10"
                  >
                    Einstellungen zurücksetzen
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
