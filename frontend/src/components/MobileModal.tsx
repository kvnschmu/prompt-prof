import { useEffect, useRef, useId } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface MobileModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  /** Accentfarbe für den oberen Border (optional) */
  accentClass?: string;
  /** Icon links neben dem Titel (optional) */
  icon?: React.ReactNode;
}

/**
 * Universeller Modal-Wrapper – Mobile-first.
 *
 * Mobile  → Slide-up Fullscreen mit Drag-Handle & Swipe-down zum Schließen
 * Desktop → Zentriertes Scale-in Overlay (max-w-2xl)
 */
export default function MobileModal({
  isOpen,
  onClose,
  title,
  children,
  accentClass = 'border-indigo-500/20',
  icon,
}: MobileModalProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const firstFocusRef = useRef<HTMLElement | null>(null);
  const touchStartY = useRef(0);

  // ── Body-Scroll Lock ─────────────────────────────────────────────────
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, [isOpen]);

  // ── Escape-Key ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  // ── Fokus-Trap: Auto-Focus beim Öffnen ───────────────────────────────
  useEffect(() => {
    if (!isOpen || !panelRef.current) return;
    const focusable = panelRef.current.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    firstFocusRef.current = focusable[0] ?? null;
    // Kleines Timeout damit Animation starten kann
    const t = setTimeout(() => firstFocusRef.current?.focus(), 80);
    return () => clearTimeout(t);
  }, [isOpen]);

  // ── Swipe-down zum Schließen ─────────────────────────────────────────
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const delta = e.changedTouches[0].clientY - touchStartY.current;
    if (delta > 90) onClose(); // > 90px Swipe → schließen
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* ── Backdrop ─────────────────────────────────────────────── */}
          <motion.div
            key="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
            aria-hidden="true"
          />

          {/* ── Modal Panel ──────────────────────────────────────────── */}
          {/* MOBILE: Vollbild Slide-up */}
          <motion.div
            key="modal-panel"
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? titleId : undefined}
            tabIndex={-1}
            /* Mobile slide-up */
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 320 }}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            className={[
              // ── Mobile: Fullscreen Slide-up ──
              'fixed inset-x-0 bottom-0 z-[70]',
              'h-[92dvh]',   // 92% viewport height — lässt oben ein bisschen Hintergrund
              'flex flex-col',
              'rounded-t-3xl overflow-hidden',
              // ── Desktop: Zentriert (überschreibt alle mobile styles) ──
              'md:inset-0 md:m-auto md:rounded-2xl md:h-auto md:max-h-[90vh] md:max-w-2xl md:top-1/2 md:-translate-y-1/2',
              // ── Styling ──
              'border border-white/10',
              accentClass,
              'shadow-2xl shadow-black/40',
            ].join(' ')}
            style={{ background: 'hsl(var(--card))', backdropFilter: 'blur(24px)' }}
          >
            {/* Drag Handle – nur Mobile sichtbar */}
            <div className="md:hidden flex justify-center pt-3 pb-1 flex-shrink-0 cursor-grab active:cursor-grabbing">
              <div className="w-12 h-1.5 rounded-full bg-white/20" />
            </div>

            {/* Header */}
            {title && (
              <div className="flex items-center justify-between px-5 pt-3 pb-4 flex-shrink-0 border-b border-white/5">
                <div className="flex items-center gap-3 min-w-0">
                  {icon && (
                    <div className="flex-shrink-0">{icon}</div>
                  )}
                  <h2 id={titleId} className="text-lg font-bold text-foreground truncate">
                    {title}
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  aria-label="Schließen"
                  className="flex-shrink-0 ml-3 w-9 h-9 flex items-center justify-center rounded-xl text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* Kein Titel → X-Button oben-rechts absolut */}
            {!title && (
              <button
                onClick={onClose}
                aria-label="Schließen"
                className="absolute right-4 top-4 z-10 w-9 h-9 flex items-center justify-center rounded-xl text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}

            {/* Content */}
            <div className="flex-1 overflow-y-auto touch-scroll">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
