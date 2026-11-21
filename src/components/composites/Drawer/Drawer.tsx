import React, { useEffect, useId } from 'react';
import { X } from 'lucide-react';
import type { IdentifiableProps } from '../../../core/contracts/ComponentContracts';
import { useKeyboardShortcut } from '../../../hooks/useKeyboardShortcut';

/**
 * ============================================================================
 * uxiGL COMPOSITE — ENTERPRISE DRAWER (OFFCANVAS PANEL)
 * ============================================================================
 * Supports `right`, `left`, and `bottom` slide-over placements with Liquid
 * Glass / Material 3 surfaces, keyboard ESC dismissal, and footer actions.
 */

/** Screen edge slide-over placement for {@link Drawer}. */
export type DrawerPlacement = 'right' | 'left' | 'bottom';

/** Width/height dimension scale for {@link Drawer}. */
export type DrawerSize = 'sm' | 'md' | 'lg' | 'xl';

/**
 * Props contract for {@link Drawer}.
 */
export interface DrawerProps extends IdentifiableProps {
  /** Controls whether the drawer panel is mounted and visible. */
  open: boolean;
  /** Callback fired when the drawer is dismissed via overlay click, `Escape`, or close button. */
  onClose: () => void;
  /** Primary drawer heading linked to the dialog via `aria-labelledby`. */
  title: React.ReactNode;
  /** Optional secondary subtitle linked to the dialog via `aria-describedby`. */
  subtitle?: React.ReactNode;
  /** Optional eyebrow badge rendered above the drawer title. */
  badge?: React.ReactNode;
  /** Optional leading icon rendered in the drawer header. */
  icon?: React.ReactNode;
  /** Edge of the viewport from which the drawer slides in (defaults to `'right'`). */
  placement?: DrawerPlacement;
  /** Panel size scale (defaults to `'md'`). */
  size?: DrawerSize;
  /** Surface material style (defaults to `'glass'`). */
  variant?: 'glass' | 'elevated' | 'tonal';
  /** Optional sticky footer slot for action buttons. */
  footer?: React.ReactNode;
  /** Main drawer body content. */
  children: React.ReactNode;
}

/**
 * Enterprise slide-over `<Drawer />` (off-canvas panel) supporting `'right'`,
 * `'left'`, and `'bottom'` placements, WAI-ARIA `dialog` semantics (`aria-labelledby`,
 * `aria-describedby`), body scroll lock, and `Escape` key dismissal via `useKeyboardShortcut`.
 *
 * @param props - {@link DrawerProps} configuration options.
 * @returns Rendered slide-over drawer overlay or `null` when closed.
 *
 * @example
 * ```tsx
 * <Drawer
 *   open={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   placement="right"
 *   title="Node Telemetry Inspector"
 *   subtitle="eu-central-1 · M4 Ultra Blade"
 * >
 *   <p>Detailed telemetry payload...</p>
 * </Drawer>
 * ```
 */
export const Drawer: React.FC<DrawerProps> = ({
  id,
  className = '',
  style,
  open,
  onClose,
  title,
  subtitle,
  badge,
  icon,
  placement = 'right',
  size = 'md',
  variant = 'glass',
  footer,
  children,
}) => {
  const titleId = useId();
  const subtitleId = useId();

  useKeyboardShortcut('Escape', onClose, { enabled: open });

  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className={`uxu-drawer-overlay uxu-drawer-overlay--${placement}`}
      onClick={onClose}
      role="presentation"
    >
      <aside
        id={id}
        style={style}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={subtitle ? subtitleId : undefined}
        onClick={(e) => e.stopPropagation()}
        className={[
          'uxu-drawer-panel',
          `uxu-drawer-panel--${placement}`,
          `uxu-drawer-panel--${size}`,
          `uxu-drawer-panel--${variant}`,
          className,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <div className="uxu-drawer-panel__header">
          <div className="uxu-drawer-panel__header-left">
            {icon && <div className="uxu-modal__icon">{icon}</div>}
            <div className="uxu-drawer-panel__title-group">
              {badge && (
                <span className="uxu-drawer-panel__badge">{badge}</span>
              )}
              <h3 id={titleId} className="uxu-drawer-panel__title">
                {title}
              </h3>
              {subtitle && (
                <p id={subtitleId} className="uxu-drawer-panel__subtitle">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            className="uxu-modal__close"
            onClick={onClose}
            aria-label="Çekmeceyi kapat"
          >
            <X size={18} />
          </button>
        </div>

        <div className="uxu-drawer-panel__body">{children}</div>

        {footer && <div className="uxu-drawer-panel__footer">{footer}</div>}
      </aside>
    </div>
  );
};
