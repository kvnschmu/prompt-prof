import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wand2,
  Sparkles,
  Image,
  Clock,
  Settings,
  Menu,
  X,
  Home,
  ChevronLeft,
  ChevronRight,
  Users,
  Type,
  Images,
  FileText,
  MoreHorizontal,
  Search,
  Wifi,
  WifiOff,
  Download,
  Sun,
  Moon,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useUIStore } from '../stores/uiStore';
import { ToastContainer } from './ToastContainer';
import { useSettingsStore } from '../stores/settingsStore';

const navSections = [
  {
    section: 'home',
    items: [{ to: '/', icon: Home, label: 'Home', exact: true }],
  },
  {
    section: 'Tools',
    items: [
      { to: '/builder', icon: Type, label: 'Rollen Prompt Maker' },
      { to: '/text-optimizer', icon: Sparkles, label: 'Prompt Optimizer' },
      { to: '/generator', icon: Wand2, label: 'Bilder Prompt Maker' },
      { to: '/optimizer', icon: Sparkles, label: 'Bilder Prompt Optimizer' },
      { to: '/image-to-prompt', icon: Image, label: 'Bild → Prompt' },
    ],
  },
  {
    section: 'Bibliothek',
    items: [
      { to: '/roles', icon: Users, label: 'Rollen Bibliothek' },
      { to: '/library', icon: Images, label: 'Bilder Bibliothek' },
      { to: '/text-library', icon: FileText, label: 'Text Bibliothek' },
      { to: '/history', icon: Clock, label: 'Verlauf' },
    ],
  },
  {
    section: 'System',
    items: [{ to: '/settings', icon: Settings, label: 'Einstellungen' }],
  },
];

const PAGE_TITLES: Record<string, string> = {
  '/': 'Home',
  '/roles': 'Rollen Bibliothek',
  '/builder': 'Rollen Prompt Maker',
  '/text-optimizer': 'Prompt Optimizer',
  '/generator': 'Bilder Prompt Maker',
  '/optimizer': 'Bilder Prompt Optimizer',
  '/image-to-prompt': 'Bild → Prompt',
  '/library': 'Bilder Bibliothek',
  '/text-library': 'Text Bibliothek',
  '/history': 'Verlauf',
  '/settings': 'Einstellungen',
};

const bottomNavItems = [
  { to: '/', icon: Home, label: 'Home', shortLabel: 'Home', exact: true },
  { to: '/generator', icon: Wand2, label: 'Bilder Prompt Maker', shortLabel: 'Bilder PM' },
  { to: '/builder', icon: Type, label: 'Rollen Prompt Maker', shortLabel: 'Rollen PM' },
  { to: '/library', icon: Images, label: 'Bilder Bibliothek', shortLabel: 'Bilder Bib.' },
  { to: '/_more', icon: MoreHorizontal, label: 'Mehr', shortLabel: 'Mehr', isMore: true },
];

const moreItems = [
  { to: '/text-optimizer', icon: Sparkles, label: 'Prompt Optimizer' },
  { to: '/optimizer', icon: Sparkles, label: 'Bilder Prompt Optimizer' },
  { to: '/image-to-prompt', icon: Image, label: 'Bild → Prompt' },
  { to: '/roles', icon: Users, label: 'Rollen Bibliothek' },
  { to: '/text-library', icon: FileText, label: 'Text Bibliothek' },
  { to: '/history', icon: Clock, label: 'Verlauf' },
  { to: '/settings', icon: Settings, label: 'Einstellungen' },
];

function isRouteActive(to: string, pathname: string, exact = false) {
  if (exact || to === '/') return pathname === to;
  return pathname.startsWith(to);
}

type DeferredPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};

function MoreDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const location = useLocation();

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="more-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
          />

          <motion.div
            key="more-drawer"
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed z-50 md:hidden bottom-[calc(56px+env(safe-area-inset-bottom,0px))] left-0 right-0 mx-3 mb-2 rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-black/40"
            style={{
              background: 'hsl(var(--card))',
              backdropFilter: 'blur(20px)',
            }}
          >
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-8 h-1 rounded-full bg-white/20" />
            </div>

            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground px-4 pb-2">
              Alle Seiten
            </p>

            <div className="grid grid-cols-3 gap-1 px-3 pb-4">
              {moreItems.map((item) => {
                const active = isRouteActive(item.to, location.pathname);
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={onClose}
                    className={`flex flex-col items-center gap-1.5 py-3 rounded-xl transition-all duration-200 ${
                      active
                        ? 'bg-indigo-500/15 text-indigo-400'
                        : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="text-[10px] font-medium leading-tight text-center">{item.label}</span>
                  </NavLink>
                );
              })}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default function AppShell() {
  const { sidebarOpen, sidebarCollapsed, toggleSidebar, toggleSidebarCollapsed, addToast } = useUIStore();
  const [moreOpen, setMoreOpen] = useState(false);
  const [quickActionsOpen, setQuickActionsOpen] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<DeferredPromptEvent | null>(null);
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useSettingsStore((s) => s.theme);
  const setTheme = useSettingsStore((s) => s.setTheme);

  const pageTitle = PAGE_TITLES[location.pathname] ?? 'Prompt Professor';
  const isMoreRouteActive = moreItems.some((item) => isRouteActive(item.to, location.pathname));

  const quickActions = useMemo<Array<{ to: string; icon: any; label: string }>>(
    () => [
      ...navSections.flatMap((section) => section.items),
      {
        to: '#toggle-theme',
        icon: theme === 'dark' ? Sun : Moon,
        label: theme === 'dark' ? 'Auf Light Mode wechseln' : 'Auf Dark Mode wechseln',
      },
    ],
    [theme],
  );

  useEffect(() => {
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);

    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as DeferredPromptEvent);
    };

    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);

    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setQuickActionsOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) {
      addToast({
        title: 'Installation nicht verfügbar',
        description: 'Öffne die Seite in Chrome oder Edge und nutze „App installieren“.',
        variant: 'default',
      });
      return;
    }

    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;

    if (choice.outcome === 'accepted') {
      addToast({ title: 'Installiert', description: 'Prompt Professor wurde zum Homescreen hinzugefügt.', variant: 'success' });
      setInstallPrompt(null);
    }
  };

  const runQuickAction = (to: string) => {
    if (to === '#toggle-theme') {
      setTheme(theme === 'dark' ? 'light' : 'dark');
      setQuickActionsOpen(false);
      return;
    }
    navigate(to);
    setQuickActionsOpen(false);
    setMoreOpen(false);
  };

  return (
    <div className="relative flex min-h-screen w-full max-w-[100vw] overflow-x-hidden bg-background md:h-screen md:overflow-hidden">
      <div className="pointer-events-none absolute inset-0 hero-grid" />
      <div className="pointer-events-none absolute -top-24 left-1/3 h-80 w-80 rounded-full bg-indigo-500/20 blur-[100px]" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-72 w-72 rounded-full bg-cyan-500/15 blur-[90px]" />

      <aside
        className={`relative z-20 hidden md:flex flex-col border-r border-white/10 bg-black/25 backdrop-blur-xl transition-all duration-300 ease-in-out ${
          sidebarCollapsed ? 'w-16' : 'w-64'
        }`}
      >
        <div className={`flex items-center h-14 border-b border-white/10 px-3 ${sidebarCollapsed ? 'justify-center' : 'gap-3'}`}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-500/30 overflow-hidden">
            <img src="/logo-192x192.png" alt="Logo" className="w-full h-full object-cover" />
          </div>
          {!sidebarCollapsed && (
            <motion.span initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }} className="font-bold text-sm gradient-text whitespace-nowrap">
              Prompt Professor
            </motion.span>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-5">
          {navSections.map((section) => (
            <div key={section.section}>
              {!sidebarCollapsed && section.section !== 'home' && (
                <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground px-3 mb-1.5">{section.section}</p>
              )}
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const active = isRouteActive(item.to, location.pathname, 'exact' in item && !!item.exact);
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      title={sidebarCollapsed ? item.label : undefined}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        active
                          ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-400/20'
                          : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                      } ${sidebarCollapsed ? 'justify-center px-2' : ''}`}
                    >
                      <item.icon className={`w-4 h-4 flex-shrink-0 ${active ? 'text-indigo-300' : ''}`} />
                      {!sidebarCollapsed && <span>{item.label}</span>}
                      {!sidebarCollapsed && active && <motion.span layoutId="sidebar-dot" className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-300" />}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <button
          onClick={toggleSidebarCollapsed}
          className="flex items-center justify-center h-10 border-t border-white/10 text-muted-foreground hover:text-foreground transition-colors"
        >
          {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </aside>

      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={toggleSidebar}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
            />
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="fixed left-0 top-0 bottom-0 w-[280px] z-50 md:hidden flex flex-col border-r border-white/10"
              style={{
                background: 'hsl(var(--background) / 0.92)',
                backdropFilter: 'blur(20px)',
              }}
            >
              <div className="flex items-center justify-between h-14 border-b border-white/10 px-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30 overflow-hidden">
                    <img src="/logo-192x192.png" alt="Logo" className="w-full h-full object-cover" />
                  </div>
                  <span className="font-bold text-sm gradient-text">Prompt Professor</span>
                </div>
                <button
                  onClick={toggleSidebar}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-5">
                {navSections.map((section) => (
                  <div key={section.section}>
                    {section.section !== 'home' && (
                      <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground px-3 mb-1.5">{section.section}</p>
                    )}
                    <div className="space-y-0.5">
                      {section.items.map((item) => {
                        const active = isRouteActive(item.to, location.pathname, 'exact' in item && !!item.exact);
                        return (
                          <NavLink
                            key={item.to}
                            to={item.to}
                            onClick={toggleSidebar}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                              active
                                ? 'bg-indigo-500/10 text-indigo-300'
                                : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                            }`}
                          >
                            <item.icon className={`w-4 h-4 flex-shrink-0 ${active ? 'text-indigo-300' : ''}`} />
                            <span>{item.label}</span>
                            {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-300" />}
                          </NavLink>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="relative z-10 flex-1 flex flex-col min-w-0 md:overflow-hidden">
        <header className="fixed top-0 left-0 right-0 z-40 flex md:hidden items-center h-12 px-3 border-b border-white/10 bg-background/90 backdrop-blur-xl flex-shrink-0">
          <button
            onClick={toggleSidebar}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors mr-2"
            aria-label="Menü öffnen"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
              <img src="/logo-192x192.png" alt="Logo" className="w-full h-full object-cover" />
            </div>
            <AnimatePresence mode="wait">
              <motion.span
                key={location.pathname}
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                transition={{ duration: 0.15 }}
                className="text-sm font-semibold truncate gradient-text"
              >
                {pageTitle}
              </motion.span>
            </AnimatePresence>
          </div>

          <button
            onClick={() => setQuickActionsOpen(true)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/5"
            aria-label="Quick Actions"
          >
            <Search className="w-4 h-4" />
          </button>
        </header>

        <div className="hidden md:flex items-center justify-between px-6 py-3 border-b border-white/10 bg-black/20 backdrop-blur-xl">
          <p className="text-sm text-muted-foreground">{pageTitle}</p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setQuickActionsOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Quick Actions</span>
              <span className="text-[10px] rounded border border-white/10 px-1.5 py-0.5">⌘K</span>
            </button>
            <button
              onClick={handleInstall}
              className="inline-flex items-center gap-2 rounded-lg border border-indigo-400/30 bg-indigo-500/10 px-3 py-1.5 text-xs text-indigo-300 hover:bg-indigo-500/20"
            >
              <Download className="w-3.5 h-3.5" /> App installieren
            </button>
            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs ${isOnline ? 'bg-emerald-500/15 text-emerald-300' : 'bg-rose-500/15 text-rose-300'}`}>
              {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
              {isOnline ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>

        {!isOnline && (
          <div className="mx-4 mt-14 md:mt-2 md:mx-6 rounded-xl border border-amber-400/20 bg-amber-500/10 px-4 py-2 text-xs text-amber-200">
            Offline-Modus aktiv: gecachte Seiten und Inhalte bleiben verfügbar.
          </div>
        )}

        <main className="flex-1 pt-12 md:pt-0 md:overflow-y-auto touch-scroll mobile-no-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="md:h-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>

        <nav
          className="fixed bottom-0 left-0 right-0 z-40 md:hidden flex-shrink-0 border-t border-white/10 bg-background/95 backdrop-blur-xl safe-bottom"
          style={{ minHeight: '56px' }}
        >
          <div className="flex items-stretch h-14">
            {bottomNavItems.map((item) => {
              if ('isMore' in item && item.isMore) {
                const active = moreOpen || isMoreRouteActive;
                return (
                  <button
                    key="more"
                    onClick={() => setMoreOpen(!moreOpen)}
                    className={`flex flex-col items-center justify-center gap-0.5 flex-1 py-1 relative transition-colors ${
                      active ? 'text-indigo-300' : 'text-muted-foreground'
                    }`}
                  >
                    {active && (
                      <motion.span
                        layoutId="bottomPill"
                        className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                    <motion.div
                      animate={moreOpen ? { rotate: 90, scale: 1.1 } : { rotate: 0, scale: 1 }}
                      transition={{ duration: 0.2 }}
                      className="w-6 h-6 flex items-center justify-center"
                    >
                      <MoreHorizontal className="w-5 h-5" />
                    </motion.div>
                    <span className="text-[9px] font-semibold tracking-wide">Mehr</span>
                  </button>
                );
              }

              const active = isRouteActive(item.to, location.pathname, 'exact' in item && !!item.exact);
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMoreOpen(false)}
                  className="flex flex-col items-center justify-center gap-0.5 flex-1 py-1 relative"
                >
                  {active && (
                    <motion.span
                      layoutId="bottomPill"
                      className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  <motion.div
                    animate={active ? { scale: 1.1 } : { scale: 1 }}
                    transition={{ duration: 0.15 }}
                    className={`w-6 h-6 flex items-center justify-center rounded-lg transition-colors ${
                      active ? 'text-indigo-300' : 'text-muted-foreground'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                  </motion.div>
                  <span
                    className={`text-[9px] font-semibold tracking-wide transition-colors leading-tight text-center ${
                      active ? 'text-indigo-300' : 'text-muted-foreground'
                    }`}
                  >
                    {item.shortLabel}
                  </span>
                </NavLink>
              );
            })}
          </div>
        </nav>

        <MoreDrawer open={moreOpen} onClose={() => setMoreOpen(false)} />
      </div>

      <AnimatePresence>
        {quickActionsOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-sm"
              onClick={() => setQuickActionsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              className="fixed left-1/2 top-20 z-[95] w-[92vw] max-w-xl -translate-x-1/2 rounded-2xl border border-white/10 bg-background/95 p-3 shadow-2xl backdrop-blur-xl"
            >
              <div className="mb-2 flex items-center justify-between px-2">
                <p className="text-xs uppercase tracking-widest text-muted-foreground">Quick Actions</p>
                <button onClick={() => setQuickActionsOpen(false)} className="rounded-md p-1 text-muted-foreground hover:bg-white/5 hover:text-foreground">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-1">
                {quickActions.map((action) => (
                  <button
                    key={action.to}
                    onClick={() => runQuickAction(action.to)}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm transition hover:bg-white/5"
                  >
                    <action.icon className="h-4 w-4 text-indigo-300" />
                    <span>{action.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <ToastContainer />
    </div>
  );
}
