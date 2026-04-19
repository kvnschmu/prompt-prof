import { ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface ListItemProps {
  /** Haupttitel */
  title: string;
  /** Kurzbeschreibung (max. 2 Zeilen) */
  description?: string;
  /** Kleines Thumbnail-Bild (URL) */
  imageUrl?: string;
  /** Icon-Element als Avatar-Fallback */
  icon?: React.ReactNode;
  /** Badge-Text (z.B. Kategorie) */
  badge?: string;
  /** Badge-Farbklassen */
  badgeClass?: string;
  /** Aktions-Buttons rechts (statt Chevron) */
  actions?: React.ReactNode;
  /** Zeige Chevron rechts (default: true) */
  showChevron?: boolean;
  /** Klick-Handler */
  onClick?: () => void;
  /** Zusätzliche CSS-Klassen */
  className?: string;
  /** Linker Akzentbalken (CSS-Klasse z.B. bg-rose-500) */
  accentBar?: string;
}

/**
 * Touch-optimiertes Listen-Element.
 * min-height: 64px (liegt deutlich über der Apple-Empfehlung von 44px)
 */
export default function ListItem({
  title,
  description,
  imageUrl,
  icon,
  badge,
  badgeClass = 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/25',
  actions,
  showChevron = true,
  onClick,
  className = '',
  accentBar,
}: ListItemProps) {
  return (
    <motion.div
      whileTap={{ scale: 0.985, backgroundColor: 'rgba(255,255,255,0.03)' }}
      transition={{ duration: 0.1 }}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } } : undefined}
      className={[
        'flex items-center gap-3 px-4 py-3 min-h-[64px]',
        'cursor-pointer select-none',
        'active:bg-white/5 transition-colors duration-100',
        'relative',
        className,
      ].join(' ')}
    >
      {/* Linker Akzentbalken (optional) */}
      {accentBar && (
        <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full ${accentBar}`} />
      )}

      {/* ── Thumbnail / Icon ─────────────────────────────────────────── */}
      {(imageUrl || icon) && (
        <div className="flex-shrink-0 w-12 h-12 rounded-xl overflow-hidden bg-white/5 flex items-center justify-center">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={title}
              loading="lazy"
              className="w-full h-full object-cover"
              style={{ imageRendering: 'auto' }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              {icon}
            </div>
          )}
        </div>
      )}

      {/* ── Text ─────────────────────────────────────────────────────── */}
      <div className="flex-1 min-w-0">
        {badge && (
          <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full mb-1 ${badgeClass}`}>
            {badge}
          </span>
        )}
        <p className="text-sm font-semibold text-foreground truncate leading-tight">
          {title}
        </p>
        {description && (
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {/* ── Rechte Seite: Chevron oder Aktionen ──────────────────────── */}
      {actions ? (
        <div className="flex-shrink-0 flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          {actions}
        </div>
      ) : showChevron ? (
        <ChevronRight className="flex-shrink-0 w-4 h-4 text-muted-foreground/50" />
      ) : null}
    </motion.div>
  );
}
