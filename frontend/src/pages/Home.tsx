import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Wand2, Sparkles, Image, Keyboard, ArrowRight,
  Zap, Layers, Palette, ChevronRight, Users, FileText, Images
} from 'lucide-react';

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

// Schnellzugriff für Mobile (horizontale Scroll-Chips)
const quickLinks = [
  { label: 'Rollen Bibliothek', icon: Users,     to: '/roles',        color: 'bg-rose-500/20 text-rose-400 border-rose-500/30' },
  { label: 'Text Bibliothek',   icon: FileText,  to: '/text-library', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  { label: 'Bilder Bibliothek', icon: Images,    to: '/library',      color: 'bg-violet-500/20 text-violet-400 border-violet-500/30' },
  { label: 'Verlauf',           icon: Keyboard,  to: '/history',      color: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30' },
];

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-full flex flex-col px-4 md:px-8 pb-24 md:pb-8 max-w-7xl mx-auto">
      {/* ── Hero Section ── */}
      <div className="text-center max-w-3xl mx-auto space-y-4 pt-8 mb-8 md:pt-20 md:mb-16">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, type: 'spring' }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-medium text-sm"
        >
          <Zap className="w-4 h-4" />
          <span>Das ultimative Prompt Engineering Tool</span>
        </motion.div>

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="flex justify-center"
        >
          <div className="w-20 h-20 md:w-32 md:h-32 rounded-3xl shadow-xl shadow-indigo-500/20 overflow-hidden ring-1 ring-white/10">
            <img src="/logo-512x512.png" alt="Prompt Professor Logo" className="w-full h-full object-cover" />
          </div>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="text-3xl md:text-6xl font-extrabold tracking-tight text-balance leading-tight"
        >
          Meistere die Kunst der{' '}
          <span className="gradient-text">KI-Generierung</span>
        </motion.h1>

        {/* Sub */}
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="text-sm md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto"
        >
          Erstelle, optimiere und verwalte hochqualitative Prompts für Bilder und Texte – visuell, schnell und professionell.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2"
        >
          <button
            onClick={() => navigate('/generator')}
            className="w-full sm:w-auto btn-primary flex items-center justify-center gap-2 py-3"
          >
            <Wand2 className="w-5 h-5" />
            <span>Jetzt starten</span>
          </button>
          <button
            onClick={() => navigate('/library')}
            className="w-full sm:w-auto btn-secondary flex items-center justify-center gap-2 py-3"
          >
            <Keyboard className="w-5 h-5" />
            <span>Bibliothek öffnen</span>
          </button>
        </motion.div>
      </div>

      {/* ── Quick Links (Mobile horizontal Scroll) ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.25 }}
        className="md:hidden mb-6"
      >
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3 px-0.5">
          Schnellzugriff
        </p>
        <div className="flex gap-2 overflow-x-auto pb-2 mobile-no-scrollbar">
          {quickLinks.map((link) => (
            <button
              key={link.to}
              onClick={() => navigate(link.to)}
              className={`flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium transition-all ${link.color}`}
            >
              <link.icon className="w-3.5 h-3.5" />
              {link.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* ── Feature Cards ── */}
      <div>
        {/* Mobile: vertikale kompakte Liste */}
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

        {/* Desktop: 2×2 Grid */}
        <div className="hidden md:grid grid-cols-2 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 + i * 0.1 }}
              onClick={() => navigate(feature.to)}
              className="glass-card !p-6 flex flex-col group cursor-pointer hover:border-indigo-500/30 transition-colors"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 shadow-lg`}>
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">{feature.title}</h3>
              <p className="text-base text-muted-foreground mb-6 flex-1">{feature.description}</p>
              <div className="flex items-center text-indigo-400 font-medium group-hover:text-indigo-300 transition-colors">
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
