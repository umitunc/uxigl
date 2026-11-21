import React, { useEffect, useId } from 'react';
import {
  X,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Info,
  Sparkles,
} from 'lucide-react';
import type {
  IdentifiableProps,
  SemanticTone,
} from '../../../core/contracts/ComponentContracts';
import { useKeyboardShortcut } from '../../../hooks/useKeyboardShortcut';

/**
 * ============================================================================
 * uxiGL COMPOSITE — MODAL / ALERT / CONFIRMATION / SHEET DIALOG
 * ============================================================================
 * Combines macOS Sonoma sheet vibrancy with Material Design 3 Dialog structure.
 *
 * SOLID Principles Applied:
 * - [SRP] Delegates Escape key listening to `useKeyboardShortcut`.
 * - [OCP] Supports `default`, `alert`, `confirm`, `danger`, `sheet`, `glass`
 *   variants and semantic tones.
 */

/** Visual and semantic dialog archetype variants for {@link Modal}. */
export type ModalVariant =
  | 'default'
  | 'alert'
  | 'confirm'
  | 'danger'
  | 'sheet'
  | 'glass';

/**
 * Props contract for {@link Modal}.
 */
export interface ModalProps extends IdentifiableProps {
  /** Controls whether the modal dialog is mounted and open. */
  open: boolean;
  /** Callback fired when the modal is dismissed via backdrop, `Escape`, or close button. */
  onClose: () => void;
  /** Primary dialog heading linked to the dialog via `aria-labelledby`. */
  title?: React.ReactNode;
  /** Optional secondary subtitle linked to the dialog via `aria-describedby`. */
  subtitle?: React.ReactNode;
  /** Optional custom header icon overriding the variant default icon. */
  icon?: React.ReactNode;
  /** Optional footer slot for primary/secondary action buttons. */
  footer?: React.ReactNode;
  /** Dialog width scale (defaults to `'md'`). */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Visual and behavioral modal archetype (defaults to `'default'`). */
  variant?: ModalVariant;
  /** Semantic color tone applied to the header icon and accents (defaults to `'primary'`). */
  tone?: SemanticTone | 'glass';
  /** Renders macOS window traffic light controls in the top-left header. */
  showMacTrafficLights?: boolean;
  /** Main dialog body content. */
  children: React.ReactNode;
}

/**
 * Multi-variant enterprise `<Modal />` dialog supporting 6 archetypes (`default`,
 * `alert`, `confirm`, `danger`, `sheet`, `glass`), WAI-ARIA `dialog` / `alertdialog`
 * labelling (`aria-labelledby`, `aria-describedby`), body scroll lock, and `Escape` dismissal.
 *
 * @param props - {@link ModalProps} configuration options.
 * @returns Rendered modal dialog overlay or `null` when closed.
 *
 * @example
 * ```tsx
 * <Modal
 *   open={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   variant="confirm"
 *   title="Deploy Production Cluster?"
 *   subtitle="This will roll out v2.8.7 across 5 regions."
 * >
 *   <p>Confirm deployment parameters before continuing.</p>
 * </Modal>
 * ```
 */
export const Modal: React.FC<ModalProps> = ({
  id,
  className = '',
  style,
  open,
  onClose,
  title,
  subtitle,
  icon,
  footer,
  size = 'md',
  variant = 'default',
  tone = 'primary',
  showMacTrafficLights = false,
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

  const resolvedTone = variant === 'danger' ? 'danger' : tone;

  const getDefaultModalIcon = () => {
    if (icon) return icon;
    if (variant === 'default') return null;
    switch (resolvedTone) {
      case 'success':
        return <CheckCircle2 size={20} />;
      case 'warning':
        return <AlertTriangle size={20} />;
      case 'danger':
        return <XCircle size={20} />;
      case 'info':
        return <Info size={20} />;
      default:
        return <Sparkles size={20} />;
    }
  };

  const modalIcon = getDefaultModalIcon();

  return (
    <div
      className={`uxu-modal-backdrop ${
        variant === 'sheet' ? 'uxu-modal-backdrop--sheet' : ''
      }`.trim()}
      onClick={onClose}
      role="presentation"
    >
      <div
        id={id}
        role={
          variant === 'alert' || variant === 'danger' ? 'alertdialog' : 'dialog'
        }
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={subtitle ? subtitleId : undefined}
        className={`uxu-modal uxu-modal--${size} uxu-modal--variant-${variant} uxu-modal--tone-${resolvedTone} ${className}`.trim()}
        style={style}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="uxu-modal__header">
          <div className="uxu-modal__header-left">
            {showMacTrafficLights && (
              <div className="uxu-traffic-lights" aria-hidden="true">
                <span
                  className="uxu-traffic-light uxu-traffic-light--close"
                  onClick={onClose}
                />
                <span className="uxu-traffic-light uxu-traffic-light--min" />
                <span className="uxu-traffic-light uxu-traffic-light--max" />
              </div>
            )}
            {modalIcon && (
              <div
                className={`uxu-modal__icon uxu-modal__icon--${resolvedTone}`}
              >
                {modalIcon}
              </div>
            )}
            <div>
              {title && (
                <h2 id={titleId} className="uxu-modal__title">
                  {title}
                </h2>
              )}
              {subtitle && (
                <p id={subtitleId} className="uxu-modal__subtitle">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            className="uxu-modal__close"
            onClick={onClose}
            aria-label="Pencereyi kapat"
          >
            <X size={18} />
          </button>
        </div>

        <div className="uxu-modal__body">{children}</div>

        {footer && <div className="uxu-modal__footer">{footer}</div>}
      </div>
    </div>
  );
};
