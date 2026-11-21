import React, { useId, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { IdentifiableProps } from '../../../core/contracts/ComponentContracts';

/**
 * ============================================================================
 * uxiGL COMPOSITE — ACCORDION
 * ============================================================================
 * Smooth expandable disclosure panels with single or multiple expansion mode.
 */

/**
 * Individual disclosure panel item descriptor for {@link Accordion}.
 */
export interface AccordionItemData {
  /** Unique identifier for the accordion panel. */
  id: string;
  /** Primary trigger header title. */
  title: React.ReactNode;
  /** Optional secondary subtitle rendered below the title. */
  subtitle?: React.ReactNode;
  /** Optional leading icon rendered inside the trigger header. */
  icon?: React.ReactNode;
  /** Collapsible panel body content. */
  content: React.ReactNode;
  /** Disables expanding/collapsing and skips this trigger during arrow-key focus navigation. */
  disabled?: boolean;
}

/**
 * Props contract for {@link Accordion}.
 */
export interface AccordionProps extends IdentifiableProps {
  /** Array of collapsible accordion panel items. */
  items: AccordionItemData[];
  /** Allows multiple panels to remain expanded simultaneously (defaults to `false`). */
  allowMultiple?: boolean;
  /** Array of item IDs that should start in the expanded state on initial mount. */
  defaultExpandedIds?: string[];
  /** Visual surface material variant (defaults to `'glass'`). */
  variant?: 'glass' | 'tonal' | 'outlined';
}

/**
 * Expandable `<Accordion />` disclosure composite supporting single or multi-panel
 * expansion, WAI-ARIA `aria-expanded` / `aria-controls` / `role="region"` linking,
 * disabled items, and keyboard focus navigation (`ArrowDown`, `ArrowUp`, `Home`, `End`).
 *
 * @param props - {@link AccordionProps} configuration options.
 * @returns Rendered accordion container.
 *
 * @example
 * ```tsx
 * <Accordion
 *   allowMultiple
 *   defaultExpandedIds={['faq-1']}
 *   items={[
 *     {
 *       id: 'faq-1',
 *       title: 'How do I switch between Dark and Light mode?',
 *       content: 'Call setMode("dark" | "light" | "system") from useTheme().',
 *     },
 *   ]}
 * />
 * ```
 */
export const Accordion: React.FC<AccordionProps> = ({
  id,
  className = '',
  style,
  items,
  allowMultiple = false,
  defaultExpandedIds = [],
  variant = 'glass',
}) => {
  const baseId = useId();
  const triggerRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [expandedIds, setExpandedIds] = useState<string[]>(defaultExpandedIds);

  const toggleItem = (itemId: string, isDisabled?: boolean) => {
    if (isDisabled) return;
    setExpandedIds((prev) => {
      const isOpen = prev.includes(itemId);
      if (allowMultiple) {
        return isOpen ? prev.filter((i) => i !== itemId) : [...prev, itemId];
      }
      return isOpen ? [] : [itemId];
    });
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLButtonElement>,
    currentItemId: string
  ) => {
    if (
      e.key !== 'ArrowDown' &&
      e.key !== 'ArrowUp' &&
      e.key !== 'Home' &&
      e.key !== 'End'
    ) {
      return;
    }

    const enabledItems = items.filter((item) => !item.disabled);
    if (enabledItems.length === 0) return;

    e.preventDefault();

    const currentPos = enabledItems.findIndex(
      (item) => item.id === currentItemId
    );
    let targetPos = 0;

    if (e.key === 'Home') {
      targetPos = 0;
    } else if (e.key === 'End') {
      targetPos = enabledItems.length - 1;
    } else if (e.key === 'ArrowDown') {
      targetPos =
        currentPos === -1 ? 0 : (currentPos + 1) % enabledItems.length;
    } else if (e.key === 'ArrowUp') {
      targetPos =
        currentPos === -1
          ? enabledItems.length - 1
          : (currentPos - 1 + enabledItems.length) % enabledItems.length;
    }

    const nextItem = enabledItems[targetPos];
    if (nextItem) {
      triggerRefs.current[nextItem.id]?.focus();
    }
  };

  return (
    <div
      id={id}
      className={`uxu-accordion uxu-accordion--${variant} ${className}`.trim()}
      style={style}
    >
      {items.map((item) => {
        const isOpen = expandedIds.includes(item.id);
        const isDisabled = Boolean(item.disabled);
        const triggerId = `${baseId}-trigger-${item.id}`;
        const panelId = `${baseId}-panel-${item.id}`;

        return (
          <div
            key={item.id}
            className={`uxu-accordion__item ${
              isOpen ? 'uxu-accordion__item--open' : ''
            } ${isDisabled ? 'uxu-accordion__item--disabled' : ''}`.trim()}
          >
            <button
              ref={(el) => {
                triggerRefs.current[item.id] = el;
              }}
              id={triggerId}
              type="button"
              disabled={isDisabled}
              aria-disabled={isDisabled || undefined}
              className="uxu-accordion__trigger"
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() => toggleItem(item.id, isDisabled)}
              onKeyDown={(e) => handleKeyDown(e, item.id)}
            >
              <div className="uxu-accordion__trigger-left">
                {item.icon && (
                  <span className="uxu-accordion__icon">{item.icon}</span>
                )}
                <div>
                  <div className="uxu-accordion__title">{item.title}</div>
                  {item.subtitle && (
                    <div className="uxu-accordion__subtitle">
                      {item.subtitle}
                    </div>
                  )}
                </div>
              </div>
              <ChevronDown
                size={18}
                className={`uxu-accordion__chevron ${
                  isOpen ? 'uxu-accordion__chevron--open' : ''
                }`.trim()}
              />
            </button>
            {isOpen && (
              <div
                id={panelId}
                role="region"
                aria-labelledby={triggerId}
                className="uxu-accordion__content"
              >
                {item.content}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
