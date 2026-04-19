import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wand2, Sparkles, Image, Clock, Settings,
  Menu, X, Home, ChevronLeft, ChevronRight,
  Users, Type, Images, FileText,
  MoreHorizontal,
} from 'lucide-react';
import { useState } from 'react';
import { useUIStore } from '../stores/uiStore';
import { ToastContainer } from './ToastContainer';

// ─── Navigation data ────────────────────────────────────────────────────────

const navSections = [
  {
    section: 'home',
    items: [
      { to: '/', icon: Home, label: 'Home', exact: true },
    ],
  },
  {
    section: 'Tools',
    items: [
      { to: '/builder',        icon: Type,     label: 'Rollen Prompt Maker' },
      { to: '/text-optimizer', icon: Sparkles, label: 'Prompt Optimizer' },
      { to: '/generator',      icon: Wand2,    label: 'Bilder Prompt Maker' },
      { to: '/optimizer',      icon: Sparkles, label: 'Bilder Prompt Optimizer' },
      { to: '/image-to-prompt',icon: Image,    label: 'Bild → Prompt' },
    ],
  },
  {
    section: 'Bibliothek',
    items: [
      { to: '/roles',        icon: Users,    label: 'Rollen Bibliothek' },
      { to: '/library',      icon: Images,   label: 'Bilder Bibliothek' },
      { to: '/text-library', icon: FileText, label: 'Text Bibliothek' },
      { to: '/history',      icon: Clock,    label: 'Verlauf' },
    ],
  },
  {
    section: 'System',
    items: [
      { to: '/settings', icon: Settings, label: 'Einstellungen' },
    ],
  },
];

// Route → page title map
const PAGE_TITLES: Record<string, string> = {
  '/':               'Home',
  '/roles':          'Rollen Bibliothek',
  '/builder':        'Rollen Prompt Maker',
  '/text-optimizer': 'Prompt Optimizer',
  '/generator':      'Bilder Prompt Maker',
  '/optimizer':      'Bilder Prompt Optimizer',
  '/image-to-prompt':'Bild → Prompt',
  '/library':        'Bilder Bibliothek',
  '/text-library':   'Text Bibliothek',
  '/history':        'Verlauf',
  '/settings':       'Einstellungen',
};

// Bottom nav — 5 most-used items matching sidebar names exactly
const bottomNavItems = [
  { to: '/',          icon: Home,     label: 'Home',        shortLabel: 'Home',       exact: true },
  { to: '/generator', icon: Wand2,    label: 'Bilder Prompt Maker', shortLabel: 'Bilder PM' },
  { to: '/builder',   icon: Type,     label: 'Rollen Prompt Maker', shortLabel: 'Rollen PM' },
  { to: '/library',   icon: Images,   label: 'Bilder Bibliothek',   shortLabel: 'Bilder Bib.' },
  { to: '/_more',     icon: MoreHorizontal, label: 'Mehr',  shortLabel: 'Mehr',       isMore: true },
];

// "Mehr" drawer — alle restlichen Seiten mit vollen Sidebar-Namen
const moreItems = [
  { to: '/text-optimizer',  icon: Sparkles, label: 'Prompt Optimizer' },
  { to: '/optimizer',       icon: Sparkles, label: 'Bilder Prompt Optimizer' },
  { to: '/image-to-prompt', icon: Image,    label: 'Bild → Prompt' },
  { to: '/roles',           icon: Users,    label: 'Rollen Bibliothek' },
  { to: '/text-library',    icon: FileText, label: 'Text Bibliothek' },
  { to: '/history',         icon: Clock,    label: 'Verlauf' },
  { to: '/settings',        icon: Settings, label: 'Einstellungen' },
];

// ─── Helper ─────────────────────────────────────────────────────────────────

function isRouteActive(to: string, pathname: string, exact = false) {
  if (exact || to === '/') return pathname === to;
  return pathname.startsWith(to);
}

// ─── More Drawer (mobile) ────────────────────────────────────────────────────

function MoreDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const location = useLocation();

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="more-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
          />

          {/* Drawer panel */}
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
            {/* Handle */}
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

// ─── AppShell ────────────────────────────────────────────────────────────────

export default function AppShell() {
  const { sidebarOpen, sidebarCollapsed, toggleSidebar, toggleSidebarCollapsed } = useUIStore();
  const [moreOpen, setMoreOpen] = useState(false);
  const location = useLocation();

  const pageTitle = PAGE_TITLES[location.pathname] ?? 'Prompt Professor';

  // Check if the current route is one of the "more" items
  const isMoreRouteActive = moreItems.some(item => isRouteActive(item.to, location.pathname));

  return (
    <div className="flex min-h-screen w-full max-w-[100vw] overflow-x-hidden bg-background md:h-screen md:overflow-hidden">

      {/* ── Desktop Sidebar ─────────────────────────────────────────────── */}
      <aside
        className={`hidden md:flex flex-col border-r border-border transition-all duration-300 ease-in-out ${
          sidebarCollapsed ? 'w-16' : 'w-64'
        }`}
      >
        {/* Logo */}
        <div className={`flex items-center h-14 border-b border-border px-3 ${
          sidebarCollapsed ? 'justify-center' : 'gap-3'
        }`}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-500/30 overflow-hidden">
            <img src="/logo-192x192.png" alt="Logo" className="w-full h-full object-cover" />
          </div>
          {!sidebarCollapsed && (
            <motion.span
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              className="font-bold text-sm gradient-text whitespace-nowrap"
            >
              Prompt Professor
            </motion.span>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-5">
          {navSections.map((section) => (
            <div key={section.section}>
              {!sidebarCollapsed && section.section !== 'home' && (
                <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground px-3 mb-1.5">
                  {section.section}
                </p>
              )}
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const active = isRouteActive(item.to, location.pathname, (item as any).exact);
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      title={sidebarCollapsed ? item.label : undefined}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        active
                          ? 'bg-indigo-500/10 text-indigo-400'
                          : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                      } ${sidebarCollapsed ? 'justify-center px-2' : ''}`}
                    >
                      <item.icon className={`w-4 h-4 flex-shrink-0 ${active ? 'text-indigo-400' : ''}`} />
                      {!sidebarCollapsed && <span>{item.label}</span>}
                      {!sidebarCollapsed && active && (
                        <motion.span
                          layoutId="sidebar-dot"
                          className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-400"
                        />
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Collapse toggle */}
        <button
          onClick={toggleSidebarCollapsed}
          className="flex items-center justify-center h-10 border-t border-border text-muted-foreground hover:text-foreground transition-colors"
        >
          {sidebarCollapsed
            ? <ChevronRight className="w-4 h-4" />
            : <ChevronLeft className="w-4 h-4" />
          }
        </button>
      </aside>

      {/* ── Mobile Sidebar Overlay (hamburger menu) ──────────────────────── */}
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
                background: 'hsl(var(--background))',
                backdropFilter: 'blur(20px)',
              }}
            >
              {/* Drawer header */}
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

              {/* Drawer nav */}
              <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-5">
                {navSections.map((section) => (
                  <div key={section.section}>
                    {section.section !== 'home' && (
                      <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground px-3 mb-1.5">
                        {section.section}
                      </p>
                    )}
                    <div className="space-y-0.5">
                      {section.items.map((item) => {
                        const active = isRouteActive(item.to, location.pathname, (item as any).exact);
                        return (
                          <NavLink
                            key={item.to}
                            to={item.to}
                            onClick={toggleSidebar}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                              active
                                ? 'bg-indigo-500/10 text-indigo-400'
                                : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                            }`}
                          >
                            <item.icon className={`w-4 h-4 flex-shrink-0 ${active ? 'text-indigo-400' : ''}`} />
                            <span>{item.label}</span>
                            {active && (
                              <span className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-400" />
                            )}
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

      {/* ── Main content area ─────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 md:overflow-hidden">

        {/* Mobile top bar */}
        <header className="fixed top-0 left-0 right-0 z-40 flex md:hidden items-center h-12 px-3 border-b border-border bg-background/95 backdrop-blur-md flex-shrink-0">
          <button
            onClick={toggleSidebar}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors mr-2"
            aria-label="Menü öffnen"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Page title + logo */}
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
        </header>

        {/* Page content */}
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

        {/* ── Mobile Bottom Navigation ──────────────────────────────────── */}
        <nav
          className="fixed bottom-0 left-0 right-0 z-40 md:hidden flex-shrink-0 border-t border-border bg-background/95 backdrop-blur-xl safe-bottom"
          style={{ minHeight: '56px' }}
        >
          <div className="flex items-stretch h-14">
            {bottomNavItems.map((item) => {
              if ((item as any).isMore) {
                // "Mehr" button
                const active = moreOpen || isMoreRouteActive;
                return (
                  <button
                    key="more"
                    onClick={() => setMoreOpen(!moreOpen)}
                    className={`flex flex-col items-center justify-center gap-0.5 flex-1 py-1 relative transition-colors ${
                      active ? 'text-indigo-400' : 'text-muted-foreground'
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

              const active = isRouteActive(item.to, location.pathname, (item as any).exact);
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMoreOpen(false)}
                  className="flex flex-col items-center justify-center gap-0.5 flex-1 py-1 relative"
                >
                  {/* Active indicator pill */}
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
                      active ? 'text-indigo-400' : 'text-muted-foreground'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                  </motion.div>
                  <span className={`text-[9px] font-semibold tracking-wide transition-colors leading-tight text-center ${
                    active ? 'text-indigo-400' : 'text-muted-foreground'
                  }`}>
                    {item.shortLabel}
                  </span>
                </NavLink>
              );
            })}
          </div>
        </nav>

        {/* More Drawer */}
        <MoreDrawer open={moreOpen} onClose={() => setMoreOpen(false)} />
      </div>

      <ToastContainer />
    </div>
  );
}
