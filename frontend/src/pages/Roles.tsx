import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Search, Copy, BookOpen, Send, Plus, Pencil, Trash2, ChevronRight } from 'lucide-react';
import { useUIStore } from '../stores/uiStore';
import { usePromptStore } from '../stores/promptStore';
import { useNavigate } from 'react-router-dom';
import MobileModal from '../components/MobileModal';
import ListItem from '../components/ListItem';

const ROLE_TEMPLATES = [
  {
    id: 'arzt',
    title: 'Medizinischer Berater',
    category: 'Gesundheit',
    description: 'Erklärt komplexe medizinische Zusammenhänge für Laien.',
    prompt: 'Du bist ein erfahrener Arzt mit 20 Jahren Berufserfahrung. Deine Aufgabe ist es, komplexe medizinische Befunde und Krankheitsbilder so zu erklären, dass sie für einen Laien ohne medizinische Vorkenntnisse verständlich sind. Nutze einfache Analogien, vermeide Fachjargon wo möglich oder erkläre ihn sofort.'
  },
  {
    id: 'marketing',
    title: 'Marketing Experte',
    category: 'Business',
    description: 'Erstellt konvertierende Werbekampagnen und Copywriting.',
    prompt: 'Du bist ein Senior Marketing Stratege und Copywriter bewandert in Verkaufspsychologie (AIDA, PAS). Deine Aufgabe ist es, für mein Produkt eine hochkonvertierende Werbekampagne inklusive Zielgruppen-Analyse, Ad-Copy, und Call-to-Actions zu erarbeiten. Der Ton soll überzeugend und professionell sein.'
  },
  {
    id: 'ceo',
    title: 'Startup CEO',
    category: 'Business',
    description: 'Gibt strategisches Feedback zu Businessplänen.',
    prompt: 'Du bist der CEO eines erfolgreichen Tech-Startups, das kürzlich an die Börse gegangen ist. Du denkst in Skalierbarkeit, Unit Economics und klarem Produkt-Markt-Fit. Kritisiere meinen Businessplan oder meine Idee schonungslos, weise auf blinde Flecken hin und schlage strategische Pivots vor.'
  },
  {
    id: 'entwickler',
    title: 'Senior Entwickler',
    category: 'Tech',
    description: 'Code-Reviewer, Architektur-Planer und Bug-Hunter.',
    prompt: 'Du bist ein Elite-Level Senior Fullstack Engineer und Software-Architekt. Du legst extremen Wert auf Clean Code, SOLID Prinzipien, Performance und Sicherheit. Analysiere den folgenden Code, weise auf Anti-Patterns hin, optimiere die Big-O Komplexität und schreibe die verbesserte Version mit Kommentaren.'
  },
  {
    id: 'texter',
    title: 'SEO Texter',
    category: 'Creative',
    description: 'Schreibt suchmaschinenoptimierte, leserliche Artikel.',
    prompt: 'Du bist ein SEO-Experte und Content-Creator. Schreibe einen suchmaschinenoptimierten Blog-Artikel zu meinem Thema. Nutze klare H1/H2/H3 Strukturen, integriere LSI Keywords natürlich, halte die Sätze vergleichsweise kurz (Flesch-Reading-Ease > 60) und beende den Artikel mit einer starken Konklusion.'
  },
  {
    id: 'designer',
    title: 'UX/UI Designer',
    category: 'Creative',
    description: 'Gibt Feedback zu Nutzerführung und Design-Systemen.',
    prompt: 'Du bist ein Lead UX/UI Designer bei einer Top-Tier Agentur. Du achtest auf Accessibility, visuelle Hierarchie, Whitespace, Typografie und Farbpsychologie. Erstelle mir ein Konzept für ein Interface, beschreibe das Design-System (Farben, Fonts) und erkläre die User Journey Schritt für Schritt.'
  },
  {
    id: 'debattierer',
    title: 'Scharfer Debattierer',
    category: 'Bildung',
    description: 'Nimmt immer die Gegenposition ein für scharfe Diskussionen.',
    prompt: 'Du bist ein meisterhafter Debattierer und kritischer Denker. Egal welches Argument ich bringe, du nimmst die exakte Gegenposition ein. Nutze Logik, historische Präzedenzfälle und Rhetorik, um meine Argumente in ihre Einzelteile zu zerlegen und Schwächen in meiner Beweisführung aufzuzeigen.'
  }
];

interface RoleData {
  id: string;
  title: string;
  category: string;
  description: string;
  prompt: string;
  isCustom?: boolean;
  dbId?: string;
}

// Kategorie → Akzentfarbe
const CATEGORY_COLORS: Record<string, string> = {
  'Gesundheit': 'from-emerald-500 to-teal-600',
  'Business': 'from-blue-500 to-indigo-600',
  'Tech': 'from-cyan-500 to-blue-600',
  'Creative': 'from-orange-500 to-pink-600',
  'Bildung': 'from-purple-500 to-violet-600',
  'Eigene': 'from-rose-500 to-red-600',
};

const getCategoryColor = (category: string) =>
  CATEGORY_COLORS[category] ?? 'from-rose-500 to-red-600';

export default function Roles() {
  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState<RoleData | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [editedPrompt, setEditedPrompt] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editDescription, setEditDescription] = useState('');

  const { addToast } = useUIStore();
  const { prompts, fetchPrompts, createPrompt, updatePrompt, deletePrompt } = usePromptStore();
  const navigate = useNavigate();

  useEffect(() => { fetchPrompts(); }, [fetchPrompts]);

  const customRoles: RoleData[] = prompts
    .filter(p => p.category === 'role')
    .map(p => ({
      id: p.id,
      dbId: p.id,
      title: p.title,
      category: p.tags[0] || 'Custom',
      description: p.tags[1] || 'Benutzerdefinierte Rolle',
      prompt: p.content,
      isCustom: true,
    }));

  const allRoles: RoleData[] = [...customRoles, ...ROLE_TEMPLATES];

  const filteredRoles = allRoles.filter(role =>
    role.title.toLowerCase().includes(search.toLowerCase()) ||
    role.category.toLowerCase().includes(search.toLowerCase()) ||
    role.description.toLowerCase().includes(search.toLowerCase())
  );

  const openModal = (role: RoleData) => {
    setIsCreating(false);
    setSelectedRole(role);
    setEditedPrompt(role.prompt);
    setEditTitle(role.title);
    setEditCategory(role.category);
    setEditDescription(role.description);
  };

  const openCreateModal = () => {
    setIsCreating(true);
    setEditTitle('');
    setEditCategory('Eigene');
    setEditDescription('Meine benutzerdefinierte Rolle');
    setEditedPrompt('');
    setSelectedRole({
      id: 'new',
      title: 'Neue Rolle',
      category: 'Eigene',
      description: 'Eigene Rolle erstellen',
      prompt: '',
      isCustom: true,
    });
  };

  const closeModal = () => {
    setSelectedRole(null);
    setIsCreating(false);
  };

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
        try { document.execCommand('copy'); }
        finally { textArea.remove(); }
      }
      addToast({ title: 'Kopiert!', description: title ? `"${title}" Prompt kopiert.` : 'In Zwischenablage.', variant: 'success' });
    } catch {
      addToast({ title: 'Fehler', description: 'Kopieren fehlgeschlagen.', variant: 'error' });
    }
  };

  const handleSave = async () => {
    if (!editTitle.trim() || !editedPrompt.trim()) {
      addToast({ title: 'Fehler', description: 'Titel und System Prompt sind erforderlich.', variant: 'error' });
      return;
    }

    if (isCreating) {
      await createPrompt({ title: editTitle, content: editedPrompt, category: 'role', type: 'text', tags: [editCategory, editDescription, 'rolle'] });
      addToast({ title: 'Erstellt', description: 'Neue Rolle erfolgreich erstellt.', variant: 'success' });
      fetchPrompts(); closeModal(); return;
    }

    if (!selectedRole) return;

    if (selectedRole.isCustom && selectedRole.dbId) {
      await updatePrompt(selectedRole.dbId, { title: editTitle, content: editedPrompt, tags: [editCategory, editDescription, 'rolle'] });
      addToast({ title: 'Aktualisiert', description: 'Rolle erfolgreich aktualisiert.', variant: 'success' });
    } else {
      await createPrompt({ title: editTitle, content: editedPrompt, category: 'role', type: 'text', tags: [editCategory, editDescription, 'rolle'] });
      addToast({ title: 'Gespeichert', description: 'Rollen-Prompt zur Bibliothek hinzugefügt.', variant: 'success' });
    }
    fetchPrompts(); closeModal();
  };

  const handleDelete = async () => {
    if (!selectedRole?.isCustom || !selectedRole?.dbId) return;
    if (!window.confirm(`Rolle "${selectedRole.title}" wirklich löschen?`)) return;
    await deletePrompt(selectedRole.dbId);
    addToast({ title: 'Gelöscht', description: 'Rolle wurde entfernt.', variant: 'success' });
    fetchPrompts(); closeModal();
  };

  const handleSendToBuilder = () => {
    if (!selectedRole) return;
    navigate('/builder', { state: { role: selectedRole.id, customPrompt: editedPrompt } });
  };

  const isEditable = isCreating || (selectedRole?.isCustom ?? false);

  return (
    <div className="min-h-full flex flex-col p-4 md:p-8 pb-24 md:pb-8 max-w-7xl mx-auto w-full">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-rose-500 to-red-500 flex items-center justify-center shrink-0">
              <Users className="text-white w-4 h-4 md:w-5 md:h-5" />
            </div>
            Rollen Bibliothek
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Wähle eine Experten-Rolle, um der KI Kontext zu geben.
          </p>
        </div>

        <div className="flex gap-3">
          <div className="relative flex-1 md:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Rollen durchsuchen..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2.5 bg-white/5 border border-border rounded-xl text-sm text-foreground focus:outline-none focus:border-rose-500/50 w-full md:w-64 transition-all"
            />
          </div>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-medium transition-all shadow-lg shadow-rose-500/20 text-sm flex-shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Neue Rolle</span>
          </button>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="flex-1">
        {/* ── Mobile: List View ── */}
        <div className="md:hidden">
          {filteredRoles.length === 0 ? (
            <div className="glass-card flex flex-col items-center justify-center py-20 text-center">
              <Users className="w-12 h-12 text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground text-sm">Keine Rollen gefunden</p>
            </div>
          ) : (
            <div className="list-view glass-card !p-0 overflow-hidden rounded-2xl divide-y divide-border/50">
              <AnimatePresence>
                {filteredRoles.map((role, idx) => (
                  <motion.div
                    key={role.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: idx * 0.03 }}
                  >
                    <ListItem
                      title={role.title}
                      description={role.description}
                      badge={role.category}
                      badgeClass="bg-rose-500/15 text-rose-400 border border-rose-500/25"
                      icon={
                        <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${getCategoryColor(role.category)}`}>
                          <Users className="w-5 h-5 text-white" />
                        </div>
                      }
                      onClick={() => openModal(role)}
                      accentBar={role.isCustom ? 'bg-indigo-500' : undefined}
                      actions={
                        <div className="flex items-center gap-1">
                          {role.isCustom && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 font-semibold uppercase tracking-wider">
                              Eigene
                            </span>
                          )}
                          <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
                        </div>
                      }
                      showChevron={false}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* ── Desktop: Grid View ── */}
        <motion.div
          variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.07 } } }}
          initial="hidden"
          animate="show"
          className="hidden md:grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6"
        >
          <AnimatePresence>
            {/* Add new card */}
            <motion.div
              layout
              variants={{ hidden: { opacity: 0, y: 30, scale: 0.95 }, show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', damping: 25, stiffness: 300 } } }}
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
              className="glass-card border-dashed border-2 border-border/60 hover:border-rose-500/50 hover:bg-white/5 transition-all cursor-pointer flex flex-col items-center justify-center min-h-[220px]"
              onClick={openCreateModal}
            >
              <div className="w-14 h-14 rounded-full bg-rose-500/10 flex items-center justify-center mb-4 text-rose-400">
                <Plus className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Rolle hinzufügen</h3>
              <p className="text-sm text-muted-foreground mt-2 text-center px-4">Erstelle deinen eigenen Rollen-Prompt.</p>
            </motion.div>

            {filteredRoles.map((role) => (
              <motion.div
                layout
                variants={{ hidden: { opacity: 0, y: 30, scale: 0.95 }, show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', damping: 25, stiffness: 300 } } }}
                whileHover={{ scale: 1.02, y: -4 }}
                whileTap={{ scale: 0.98 }}
                exit={{ opacity: 0, scale: 0.9 }}
                key={role.id}
                className={`glass-card group hover:border-rose-500/30 transition-all cursor-pointer flex flex-col ${role.isCustom ? 'border-rose-500/20' : ''}`}
                onClick={() => openModal(role)}
              >
                <div className="flex justify-between items-start mb-3">
                  <span className="text-xs font-medium px-2 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
                    {role.category}
                  </span>
                  <div className="flex items-center gap-1">
                    {role.isCustom && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 font-semibold uppercase tracking-wider">
                        Eigene
                      </span>
                    )}
                    <Users className="w-4 h-4 text-muted-foreground group-hover:text-rose-400 transition-colors" />
                  </div>
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">{role.title}</h3>
                <p className="text-sm text-muted-foreground flex-1 line-clamp-3">{role.description}</p>

                <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between">
                  <button
                    onClick={(e) => { e.stopPropagation(); copyText(role.prompt, role.title); }}
                    className="text-xs flex items-center gap-1.5 text-muted-foreground opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity hover:text-emerald-400 px-2 py-1 rounded-md hover:bg-emerald-500/10"
                  >
                    <Copy className="w-3.5 h-3.5" /> Kopieren
                  </button>
                  <span className="text-sm font-medium text-rose-400 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                    {role.isCustom ? <><Pencil className="w-3 h-3" /> Bearbeiten</> : <>Verwenden <ChevronRight className="w-3 h-3" /></>}
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* ── Role Detail Modal (Mobile Fullscreen / Desktop Overlay) ── */}
      <MobileModal
        isOpen={!!selectedRole}
        onClose={closeModal}
        title={isCreating ? 'Neue Rolle erstellen' : selectedRole?.title}
        accentClass="border-rose-500/20"
        icon={
          <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${selectedRole ? getCategoryColor(selectedRole.category) : 'from-rose-500 to-red-600'} flex items-center justify-center`}>
            <Users className="w-3.5 h-3.5 text-white" />
          </div>
        }
      >
        {selectedRole && (
          <div className="flex flex-col p-5 gap-5">
            {/* Header – editable für custom/new */}
            {isEditable ? (
              <div className="flex flex-col gap-3">
                <input
                  type="text"
                  placeholder="Rollen Name (z.B. Marketing Experte)"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  autoFocus
                  className="text-lg font-bold bg-transparent border-b border-border focus:border-rose-500 outline-none pb-2 text-foreground placeholder:text-muted-foreground/40"
                />
                <div className="flex gap-3">
                  <input
                    type="text"
                    placeholder="Kategorie"
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="text-sm bg-black/30 border border-white/10 rounded-lg px-3 py-2 focus:outline-none focus:border-rose-500/50 text-foreground w-1/3 placeholder:text-muted-foreground/40"
                  />
                  <input
                    type="text"
                    placeholder="Kurzbeschreibung"
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className="text-sm bg-black/30 border border-white/10 rounded-lg px-3 py-2 focus:outline-none focus:border-rose-500/50 text-foreground flex-1 placeholder:text-muted-foreground/40"
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${getCategoryColor(selectedRole.category)} flex items-center justify-center shrink-0`}>
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-xs text-rose-400 font-medium">{selectedRole.category}</span>
                  <p className="text-sm text-muted-foreground mt-1">{selectedRole.description}</p>
                </div>
              </div>
            )}

            {/* Prompt-Editor */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">
                System Prompt {isEditable ? '(bearbeiten)' : '(schreibgeschützt)'}
              </label>
              <textarea
                value={editedPrompt}
                onChange={(e) => setEditedPrompt(e.target.value)}
                readOnly={!isEditable}
                className="w-full min-h-[160px] md:h-48 bg-black/30 border border-white/10 rounded-xl p-4 text-foreground/90 font-light leading-relaxed resize-none focus:outline-none focus:border-rose-500/50 text-sm"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 pb-2">
              <button
                onClick={() => copyText(editedPrompt)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-medium transition-colors"
              >
                <Copy className="w-4 h-4" /> Kopieren
              </button>

              {selectedRole.isCustom && selectedRole.dbId && !isCreating && (
                <button
                  onClick={handleDelete}
                  className="p-3 rounded-xl bg-red-500/15 text-red-400 border border-red-500/25 hover:bg-red-500/25 transition-colors"
                  title="Löschen"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}

              <button
                onClick={handleSave}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 hover:bg-emerald-500/25 transition-colors text-sm font-medium"
              >
                <BookOpen className="w-4 h-4" />
                {isCreating ? 'Erstellen' : selectedRole.isCustom ? 'Speichern' : 'In Bibliothek'}
              </button>

              <button
                onClick={handleSendToBuilder}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-semibold text-sm shadow-lg shadow-rose-500/25 transition-all"
              >
                <Send className="w-4 h-4" />
                In Generator übernehmen
              </button>
            </div>
          </div>
        )}
      </MobileModal>
    </div>
  );
}
