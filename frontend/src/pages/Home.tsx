import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Wand2,
  Sparkles,
  Image,
  ArrowRight,
  Zap,
  Layers,
  Palette,
  ChevronRight,
  Users,
  FileText,
  Images,
  CheckCircle2,
  Plus,
  Trash2,
  TimerReset,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { usePromptStore } from '../stores/promptStore';

const features = [
  {
    title: 'Bilder Prompt Maker',
    description: 'Strukturierte Auswahlmöglichkeiten für Stil, Licht und Kamera.',
    icon: Layers,
    color: 'from-blue-500 to-cyan-400',
    to: '/generator',
  },
  {
    title: 'Bilder Prompt Optimizer',
    description: 'Verwandle einfache Ideen in hochdetaillierte Prompts mit KI.',
    icon: Sparkles,
    color: 'from-purple-500 to-fuchsia-400',
    to: '/optimizer',
  },
  {
    title: 'Image to Prompt',
    description: 'Lade ein Bild hoch und lass die KI den perfekten Prompt daraus extrahieren.',
    icon: Image,
    color: 'from-orange-500 to-amber-400',
    to: '/image-to-prompt',
  },
  {
    title: 'Bilder Bibliothek',
    description: 'Speichere, sortiere und reuse deine besten Prompts an einem Ort.',
    icon: Palette,
    color: 'from-emerald-500 to-teal-400',
    to: '/library',
  },
];

const quickLinks = [
  { label: 'Rollen Bibliothek', icon: Users, to: '/roles', color: 'bg-rose-500/20 text-rose-300 border-rose-500/30' },
  { label: 'Text Bibliothek', icon: FileText, to: '/text-library', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
  { label: 'Bilder Bibliothek', icon: Images, to: '/library', color: 'bg-violet-500/20 text-violet-300 border-violet-500/30' },
  { label: 'Verlauf', icon: Wand2, to: '/history', color: 'bg-zinc-500/20 text-zinc-300 border-zinc-500/30' },
];

const STORAGE_KEY = 'promptcraft-home-tasks';

export default function Home() {
  const navigate = useNavigate();
  const { prompts, history, fetchPrompts, fetchHistory } = usePromptStore();
  const [taskInput, setTaskInput] = useState('');
  const [tasks, setTasks] = useState<string[]>([]);

  useEffect(() => {
    fetchPrompts({ limit: '6' });
    fetchHistory(20);
  }, [fetchPrompts, fetchHistory]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setTasks(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  const stats = useMemo(
    () => [
      { label: 'Gespeicherte Prompts', value: prompts.length, hint: 'in deiner aktuellen Ansicht' },
      { label: 'Verlaufseinträge', value: history.length, hint: 'letzte Aktivitäten' },
      { label: 'Offene Aufgaben', value: tasks.length, hint: 'persönliches Sprint-Board' },
    ],
    [prompts.length, history.length, tasks.length],
  );

  const addTask = (event: FormEvent) => {
    event.preventDefault();
    if (!taskInput.trim()) return;
    setTasks((prev) => [taskInput.trim(), ...prev].slice(0, 8));
    setTaskInput('');
  };

  return (
    <div className="min-h-full flex flex-col px-4 md:px-8 pb-24 md:pb-8 max-w-7xl mx-auto space-y-6 md:space-y-8">
      <div className="relative mt-4 md:mt-8 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#0f1d45] via-[#211a5f] to-[#09253b] p-5 md:p-8">
        <div className="pointer-events-none absolute -top-12 right-10 h-44 w-44 rounded-full bg-cyan-400/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 left-8 h-44 w-44 rounded-full bg-violet-500/20 blur-3xl" />

        <div className="relative z-10 text-center max-w-3xl mx-auto space-y-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, type: 'spring' }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-indigo-100 font-medium text-sm"
          >
            <Zap className="w-4 h-4" />
            <span>Neue Creative Command Oberfläche</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="text-3xl md:text-6xl font-extrabold tracking-tight text-balance leading-tight text-white"
          >
            PromptCraft neu gedacht –
            <span className="block gradient-text">schneller, fokussierter, mobiler</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="text-sm md:text-lg text-indigo-100/90 leading-relaxed max-w-2xl mx-auto"
          >
            Plane deine Prompt-Sprints direkt auf der Startseite, springe per Quick Actions in jedes Tool und nutze den verbesserten Offline/PWA-Workflow.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2"
          >
            <button onClick={() => navigate('/generator')} className="w-full sm:w-auto btn-primary flex items-center justify-center gap-2 py-3">
              <Wand2 className="w-5 h-5" />
              <span>Neuen Bild-Prompt bauen</span>
            </button>
            <button
              onClick={() => navigate('/text-optimizer')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-white/90 hover:bg-white/15"
            >
              <Sparkles className="w-5 h-5" />
              <span>Text-Prompt optimieren</span>
            </button>
          </motion.div>
        </div>
      </div>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {stats.map((stat) => (
          <div key={stat.label} className="glass-card !p-4">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">{stat.label}</p>
            <p className="mt-2 text-3xl font-bold text-foreground">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{stat.hint}</p>
          </div>
        ))}
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-4">
        <div className="glass-card !p-4 md:!p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-foreground">Schnellzugriff</h2>
            <span className="text-xs text-muted-foreground">One tap Navigation</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {quickLinks.map((link) => (
              <button
                key={link.to}
                onClick={() => navigate(link.to)}
                className={`flex items-center justify-center gap-2 px-3 py-3 rounded-xl border text-sm font-medium transition-all ${link.color}`}
              >
                <link.icon className="w-3.5 h-3.5" />
                {link.label}
              </button>
            ))}
          </div>
        </div>

        <div className="glass-card !p-4 md:!p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-foreground">Prompt Sprint Board</h2>
            <button
              onClick={() => setTasks([])}
              className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <TimerReset className="w-3.5 h-3.5" /> Reset
            </button>
          </div>

          <form onSubmit={addTask} className="flex items-center gap-2 mb-3">
            <input
              value={taskInput}
              onChange={(event) => setTaskInput(event.target.value)}
              placeholder="Neue Aufgabe hinzufügen…"
              className="input-field !py-2 text-sm"
            />
            <button type="submit" className="btn-primary !px-3 !py-2">
              <Plus className="w-4 h-4" />
            </button>
          </form>

          <div className="space-y-2 max-h-44 overflow-y-auto">
            {tasks.length === 0 && <p className="text-xs text-muted-foreground">Noch keine Aufgaben. Lege deinen nächsten Prompt-Sprint fest.</p>}
            {tasks.map((task, index) => (
              <div key={`${task}-${index}`} className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-300 flex-shrink-0" />
                <span className="flex-1">{task}</span>
                <button
                  onClick={() => setTasks((prev) => prev.filter((_, i) => i !== index))}
                  className="rounded p-1 text-muted-foreground hover:bg-white/10 hover:text-rose-300"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div>
        <div className="md:hidden glass-card !p-0 overflow-hidden rounded-2xl divide-y divide-border/40">
          {features.map((feature, i) => (
            <motion.button
              key={feature.title}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.3 + i * 0.08 }}
              onClick={() => navigate(feature.to)}
              className="w-full flex items-center gap-4 px-4 py-4 text-left hover:bg-white/5 active:bg-white/5 transition-colors"
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center flex-shrink-0 shadow-lg`}>
                <feature.icon className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{feature.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{feature.description}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground/50 flex-shrink-0" />
            </motion.button>
          ))}
        </div>

        <div className="hidden md:grid grid-cols-2 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 + i * 0.1 }}
              onClick={() => navigate(feature.to)}
              className="glass-card !p-6 flex flex-col group cursor-pointer hover:border-indigo-400/40 transition-colors"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 shadow-lg`}>
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">{feature.title}</h3>
              <p className="text-base text-muted-foreground mb-6 flex-1">{feature.description}</p>
              <div className="flex items-center text-indigo-300 font-medium group-hover:text-indigo-200 transition-colors">
                <span>Ausprobieren</span>
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
