import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Check,
  ChevronDown,
  Search,
  X,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
} from 'lucide-react';
import type { ComponentSize } from '../../../core/contracts/ComponentContracts';
import type { InputValidationState } from '../Input/Input';
import {
  foldTrSearch,
  matchesTrSearch,
  useSelectPortalPosition,
  type SelectOptionItem,
  type SelectProps,
} from './selectHelpers';

export { foldTrSearch, matchesTrSearch, type SelectOptionItem, type SelectProps };

export const Select: React.FC<SelectProps> = ({
  id,
  className = '',
  style,
  label,
  value,
  onChange,
  options,
  placeholder = 'Seçiniz...',
  searchable = true,
  searchPlaceholder = 'Seçeneklerde ara...',
  clearable = false,
  surface = 'glass',
  size = 'md',
  validationState = 'default',
  helperText,
  errorText,
  successText,
  warningText,
  leadingIcon,
  disabled = false,
  required = false,
}) => {
  const autoId = useId();
  const selectId = id ?? autoId;
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState<number>(0);

  const { popoverPos, optionsMaxHeight, updatePopoverPosition } = useSelectPortalPosition(
    open,
    setOpen,
    searchable,
    triggerRef,
    popoverRef
  );

  const selectedOption = useMemo(
    () => options.find((opt) => opt.value === value),
    [options, value]
  );

  const filteredOptions = useMemo(() => {
    const raw = query.trim();
    if (!raw) return options;
    return options.filter(
      (opt) =>
        matchesTrSearch(opt.label, raw) ||
        matchesTrSearch(opt.description, raw) ||
        matchesTrSearch(opt.group, raw) ||
        matchesTrSearch(opt.value, raw)
    );
  }, [options, query]);

  const resolvedValidation: InputValidationState = errorText ? 'error' : validationState;

  useEffect(() => {
    if (!open) return;
    const handleOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        containerRef.current &&
        !containerRef.current.contains(target) &&
        (!popoverRef.current || !popoverRef.current.contains(target))
      ) {
        setOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [open]);

  useEffect(() => {
    if (!open || !searchable) return;
    const timer = window.setTimeout(() => {
      searchInputRef.current?.focus();
    }, 15);
    return () => window.clearTimeout(timer);
  }, [open, searchable]);

  const openPopover = useCallback(() => {
    updatePopoverPosition();
    setOpen(true);
  }, [updatePopoverPosition]);

  const handleSelect = (opt: SelectOptionItem) => {
    if (opt.disabled) return;
    onChange(opt.value);
    setOpen(false);
    setQuery('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    if (!open && (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown')) {
      e.preventDefault();
      openPopover();
      return;
    }
    if (!open) return;

    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      setOpen(false);
      setQuery('');
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        filteredOptions.length > 0 ? (prev + 1) % filteredOptions.length : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        filteredOptions.length > 0
          ? (prev - 1 + filteredOptions.length) % filteredOptions.length
          : 0
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const target = filteredOptions[highlightedIndex];
      if (target && !target.disabled) {
        handleSelect(target);
      }
    }
  };

  const statusMessage =
    errorText ??
    (resolvedValidation === 'success'
      ? successText
      : resolvedValidation === 'warning'
      ? warningText
      : undefined) ??
    helperText;

  const popoverNode = open ? (
    <div
      ref={popoverRef}
      className="uxu-select-popover uxu-select-popover--portal"
      role="listbox"
      style={popoverPos}
      onKeyDown={handleKeyDown}
    >
      {searchable && (
        <div className="uxu-select-search">
          <Search size={14} className="uxu-select-search__icon" />
          <input
            ref={searchInputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setHighlightedIndex(0);
            }}
            placeholder={searchPlaceholder}
            className="uxu-select-search__input"
          />
          {query && (
            <button
              type="button"
              className="uxu-select-search__clear"
              onClick={() => setQuery('')}
              aria-label="Aramayı temizle"
            >
              <X size={12} />
            </button>
          )}
        </div>
      )}

      <div className="uxu-select-options" style={{ maxHeight: optionsMaxHeight, overflowY: 'auto' }}>
        {filteredOptions.length === 0 ? (
          <div className="uxu-select-empty">Eşleşen sonuç bulunamadı.</div>
        ) : (
          filteredOptions.map((opt, idx) => {
            const isSelected = opt.value === value;
            const isHighlighted = idx === highlightedIndex;
            const prevGroup = idx > 0 ? filteredOptions[idx - 1].group : undefined;
            const showGroupHeader = opt.group && opt.group !== prevGroup;

            return (
              <React.Fragment key={opt.value}>
                {showGroupHeader && (
                  <div className="uxu-select-group-header">{opt.group}</div>
                )}
                <button
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  disabled={opt.disabled}
                  onMouseEnter={() => setHighlightedIndex(idx)}
                  onClick={() => handleSelect(opt)}
                  className={[
                    'uxu-select-option',
                    isSelected ? 'uxu-select-option--selected' : '',
                    isHighlighted ? 'uxu-select-option--highlighted' : '',
                    opt.disabled ? 'uxu-select-option--disabled' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  <div className="uxu-select-option__left">
                    {opt.icon && (
                      <span className="uxu-select-option__icon">{opt.icon}</span>
                    )}
                    <div className="uxu-select-option__texts">
                      <span className="uxu-select-option__label">{opt.label}</span>
                      {opt.description && (
                        <span className="uxu-select-option__desc">{opt.description}</span>
                      )}
                    </div>
                  </div>

                  <div className="uxu-select-option__right">
                    {opt.badge && (
                      <span
                        className={`uxu-select-option__badge uxu-select-option__badge--${
                          opt.badgeTone ?? 'primary'
                        }`}
                      >
                        {opt.badge}
                      </span>
                    )}
                    {isSelected && (
                      <Check size={15} className="uxu-select-option__check" />
                    )}
                  </div>
                </button>
              </React.Fragment>
            );
          })
        )}
      </div>
    </div>
  ) : null;

  return (
    <div
      ref={containerRef}
      style={style}
      className={['uxu-field', 'uxu-select-field', className]
        .filter(Boolean)
        .join(' ')}
      onKeyDown={handleKeyDown}
    >
      {label && (
        <div className="uxu-field__header">
          <label htmlFor={selectId} className="uxu-field__label">
            {label}
            {required && <span className="uxu-field__required">*</span>}
          </label>
        </div>
      )}

      <div className="uxu-select-anchor uxu-select-container" style={{ position: 'relative', width: '100%' }}>
        <button
          ref={triggerRef}
          id={selectId}
          type="button"
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={() => {
            if (disabled) return;
            if (open) {
              setOpen(false);
              setQuery('');
            } else {
              openPopover();
            }
          }}
          className={[
            'uxu-input-box',
            'uxu-select-trigger',
            `uxu-input-box--${surface}`,
            `uxu-input-box--${size as ComponentSize}`,
            open ? 'uxu-input-box--focused' : '',
            resolvedValidation !== 'default'
              ? `uxu-input-box--${resolvedValidation}`
              : '',
            disabled ? 'uxu-input-box--disabled' : '',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {(selectedOption?.icon || leadingIcon) && (
            <span className="uxu-input-box__icon">
              {selectedOption?.icon ?? leadingIcon}
            </span>
          )}

          <span
            className={`uxu-select-trigger__text ${
              !selectedOption ? 'uxu-select-trigger__text--placeholder' : ''
            }`}
          >
            {selectedOption ? selectedOption.label : placeholder}
          </span>

          {selectedOption?.badge && (
            <span
              className={`uxu-select-option__badge uxu-select-option__badge--${
                selectedOption.badgeTone ?? 'primary'
              }`}
            >
              {selectedOption.badge}
            </span>
          )}

          {clearable && selectedOption && !disabled && (
            <span
              role="button"
              tabIndex={-1}
              className="uxu-input-box__clear"
              aria-label="Seçimi temizle"
              onClick={(e) => {
                e.stopPropagation();
                onChange('');
              }}
            >
              <X size={13} />
            </span>
          )}

          <span
            className={`uxu-select-trigger__chevron ${
              open ? 'uxu-select-trigger__chevron--open' : ''
            }`}
          >
            <ChevronDown size={15} />
          </span>
        </button>

        {popoverNode && typeof document !== 'undefined'
          ? createPortal(popoverNode, document.body)
          : popoverNode}
      </div>

      {statusMessage && (
        <div
          className={`uxu-field__helper ${
            resolvedValidation !== 'default'
              ? `uxu-field__helper--${resolvedValidation}`
              : ''
          }`}
        >
          {resolvedValidation === 'success' && <CheckCircle2 size={13} />}
          {resolvedValidation === 'warning' && <AlertTriangle size={13} />}
          {resolvedValidation === 'error' && <AlertCircle size={13} />}
          <span>{statusMessage}</span>
        </div>
      )}
    </div>
  );
};
