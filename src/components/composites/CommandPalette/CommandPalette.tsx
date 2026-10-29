import React, { useMemo, useState, useEffect, useRef } from 'react';
import { Search, CornerDownLeft, Sparkles, X } from 'lucide-react';
import { useKeyboardShortcut } from '../../../hooks/useKeyboardShortcut';

/**
 * ============================================================================
 * uxiGL COMPOSITE — SPOTLIGHT COMMAND PALETTE (⌘K / Ctrl+K)
 * ============================================================================
 * Inspired by Apple macOS Spotlight & Raycast + Google Search Assist chips.
 */

export interface CommandActionItem {
  id: string;
  title: string;
  subtitle?: string;
  category: string;
  icon?: React.ReactNode;
  shortcut?: string;
  onSelect: () => void;
}

export interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  actions: CommandActionItem[];
  placeholder?: string;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  open,
  onClose,
  actions,
  placeholder = 'Bileşen, tema, SOLID prensibi veya komut ara...',
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClose = () => {
    setQuery('');
    setSelectedIndex(0);
    onClose();
  };

  useKeyboardShortcut('Escape', handleClose, { enabled: open });

  // Whenever the palette opens, clear query, reset index, and auto-focus
  useEffect(() => {
    if (open) {
      setQuery('');
      setSelectedIndex(0);
      const timer = setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 10);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const filteredActions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return actions;
    return actions.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        (item.subtitle && item.subtitle.toLowerCase().includes(q)) ||
        item.category.toLowerCase().includes(q)
    );
  }, [actions, query]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  if (!open) return null;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) =>
        filteredActions.length > 0 ? (prev + 1) % filteredActions.length : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) =>
        filteredActions.length > 0
          ? (prev - 1 + filteredActions.length) % filteredActions.length
          : 0
      );
    } else if (e.key === 'Enter' && filteredActions[selectedIndex]) {
      e.preventDefault();
      filteredActions[selectedIndex].onSelect();
      handleClose();
    }
  };

  return (
    <div
      className="uxu-modal-backdrop uxu-cmd-backdrop"
      onClick={handleClose}
      role="presentation"
    >
      <div
        className="uxu-cmd-palette"
        role="dialog"
        aria-modal="true"
        aria-label="Komut Paleti"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        <div className="uxu-cmd-palette__search">
          <Search size={19} className="uxu-cmd-palette__search-icon" />
          <input
            ref={inputRef}
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={(e) => e.target.select()}
            placeholder={placeholder}
            className="uxu-cmd-palette__input"
          />
          {query.trim().length > 0 && (
            <button
              type="button"
              className="uxu-cmd-palette__clear"
              onClick={() => {
                setQuery('');
                setSelectedIndex(0);
                inputRef.current?.focus();
              }}
              title="Aramayı Temizle"
              aria-label="Aramayı Temizle"
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--uxu-text-tertiary, #94a3b8)',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '4px',
                marginRight: '6px',
                borderRadius: '50%',
                transition: 'all 0.15s ease',
              }}
            >
              <X size={15} />
            </button>
          )}
          <kbd className="uxu-cmd-palette__esc" onClick={handleClose}>
            ESC
          </kbd>
        </div>

        <div className="uxu-cmd-palette__list">
          {filteredActions.length === 0 ? (
            <div className="uxu-cmd-palette__empty">
              <Sparkles size={22} />
              <p>&ldquo;{query}&rdquo; ile eşleşen bir komut bulunamadı.</p>
            </div>
          ) : (
            filteredActions.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={item.id}
                  type="button"
                  onMouseEnter={() => setSelectedIndex(idx)}
                  onClick={() => {
                    item.onSelect();
                    handleClose();
                  }}
                  className={`uxu-cmd-palette__item ${
                    isSelected ? 'uxu-cmd-palette__item--selected' : ''
                  }`}
                >
                  <div className="uxu-cmd-palette__item-left">
                    {item.icon && (
                      <span className="uxu-cmd-palette__item-icon">
                        {item.icon}
                      </span>
                    )}
                    <div>
                      <div className="uxu-cmd-palette__item-title">
                        {item.title}
                      </div>
                      {item.subtitle && (
                        <div className="uxu-cmd-palette__item-sub">
                          {item.subtitle}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="uxu-cmd-palette__item-right">
                    <span className="uxu-cmd-palette__category">
                      {item.category}
                    </span>
                    {item.shortcut ? (
                      <kbd className="uxu-cmd-palette__kbd">
                        {item.shortcut}
                      </kbd>
                    ) : (
                      <CornerDownLeft
                        size={14}
                        className="uxu-cmd-palette__enter-icon"
                      />
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>

        <div className="uxu-cmd-palette__footer">
          <span>
            <kbd>↑</kbd> <kbd>↓</kbd> Gezin
          </span>
          <span>
            <kbd>↵</kbd> Çalıştır
          </span>
          <span>
            <kbd>ESC</kbd> Kapat
          </span>
        </div>
      </div>
    </div>
  );
};
