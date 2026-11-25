import React from 'react';
import { createPortal } from 'react-dom';
import { EyeOff, RotateCcw, SlidersHorizontal, X } from 'lucide-react';
import type { WidgetSize } from '../types';
import {
  buildDefaultSizePresets,
  WIDGET_ACCENT_SWATCHES,
  type WidgetCustomField,
  type WidgetSurfaceStyle,
  type WidgetUserPrefs,
} from './widgetCustomization';

export function WidgetCustomizePopover({
  target,
  title,
  defaultSize,
  customFields,
  currentSize,
  prefs,
  locale = 'tr',
  isDark,
  primaryColor,
  onUpdatePrefs,
  onResize,
  onHideWidget,
  onResetWidget,
  onClose,
}: {
  target: { x: number; y: number };
  title: string;
  defaultSize: WidgetSize;
  customFields?: ReadonlyArray<WidgetCustomField>;
  currentSize: WidgetSize;
  prefs: WidgetUserPrefs;
  locale?: 'tr' | 'en';
  isDark: boolean;
  primaryColor: string;
  onUpdatePrefs: (patch: Partial<WidgetUserPrefs>) => void;
  onResize: (size: WidgetSize) => void;
  onHideWidget: () => void;
  onResetWidget: () => void;
  onClose: () => void;
}) {
  const isTR = locale === 'tr';
  const vw = typeof window !== 'undefined' ? window.innerWidth : 1366;
  const vh = typeof window !== 'undefined' ? window.innerHeight : 860;
  const popW = 304;
  const left = Math.max(12, Math.min(target.x, vw - popW - 14));
  const top = Math.max(52, Math.min(target.y, vh - 430));
  const presets = buildDefaultSizePresets(defaultSize);
  const activeSurface: WidgetSurfaceStyle = prefs.surfaceStyle ?? 'glass';
  const accent = prefs.accentHex || primaryColor;

  const pillStyle = (active: boolean): React.CSSProperties => ({
    padding: '5px 10px',
    borderRadius: 8,
    border: active
      ? `1.5px solid ${accent}`
      : isDark
        ? '1px solid rgba(255,255,255,0.14)'
        : '1px solid rgba(15,23,42,0.12)',
    background: active ? `color-mix(in srgb, ${accent} 18%, transparent)` : 'transparent',
    color: active ? (isDark ? '#ffffff' : accent) : 'inherit',
    fontSize: 11.5,
    fontWeight: active ? 750 : 600,
    cursor: 'pointer',
  });

  const node = (
    <div
      data-testid="osgl-widget-customize-backdrop"
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 2350 }}
    >
      <div
        role="dialog"
        aria-label={isTR ? `${title} Özelleştirme` : `${title} Settings`}
        data-testid="osgl-widget-customize-popover"
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'fixed',
          left,
          top,
          width: popW,
          padding: 14,
          borderRadius: 18,
          backgroundColor: isDark ? 'rgba(15, 23, 42, 0.98)' : 'rgba(255, 255, 255, 0.99)',
          color: isDark ? '#f8fafc' : '#0f172a',
          backdropFilter: 'blur(28px) saturate(180%)',
          WebkitBackdropFilter: 'blur(28px) saturate(180%)',
          border: isDark ? '1px solid rgba(255,255,255,0.18)' : '1px solid rgba(15,23,42,0.12)',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.38)',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          fontFamily: 'var(--uxu-font-sans, inherit)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 800 }}>
            <SlidersHorizontal size={14} color={accent} />
            <span>{title}</span>
          </span>
          <button
            type="button"
            aria-label={isTR ? 'Özelleştirme panelini kapat' : 'Close widget settings'}
            onClick={onClose}
            style={{
              width: 24,
              height: 24,
              borderRadius: '50%',
              border: 'none',
              cursor: 'pointer',
              background: isDark ? 'rgba(255,255,255,0.10)' : 'rgba(15,23,42,0.07)',
              color: 'inherit',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={13} />
          </button>
        </div>

        <div>
          <div style={{ fontSize: 11, fontWeight: 700, opacity: 0.72, marginBottom: 5 }}>
            {isTR ? 'Boyut Şablonu' : 'Size Preset'}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 6 }}>
            {presets.map((p) => {
              const isMatch =
                Math.abs(currentSize.width - p.size.width) <= 24 &&
                Math.abs(currentSize.height - p.size.height) <= 24;
              return (
                <button key={p.id} type="button" onClick={() => onResize(p.size)} style={pillStyle(isMatch)}>
                  {isTR ? p.labelTr : p.labelEn}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <div style={{ fontSize: 11, fontWeight: 700, opacity: 0.72, marginBottom: 5 }}>
            {isTR ? 'Kart Yüzeyi' : 'Card Surface'}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 6 }}>
            {(
              [
                { id: 'glass', tr: 'Cam', en: 'Glass' },
                { id: 'solid', tr: 'Opak', en: 'Solid' },
                { id: 'tinted', tr: 'Vurgulu', en: 'Tinted' },
              ] as Array<{ id: WidgetSurfaceStyle; tr: string; en: string }>
            ).map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => onUpdatePrefs({ surfaceStyle: s.id })}
                style={pillStyle(activeSurface === s.id)}
              >
                {isTR ? s.tr : s.en}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div style={{ fontSize: 11, fontWeight: 700, opacity: 0.72, marginBottom: 6 }}>
            {isTR ? 'Vurgu Rengi' : 'Accent Color'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
            {WIDGET_ACCENT_SWATCHES.map((sw) => {
              const active = (prefs.accentHex ?? '') === sw.hex;
              const bg = sw.hex || primaryColor;
              const label = isTR ? sw.labelTr : sw.labelEn;
              return (
                <button
                  key={sw.labelEn}
                  type="button"
                  title={label}
                  aria-label={label}
                  onClick={() => onUpdatePrefs({ accentHex: sw.hex || undefined })}
                  style={{
                    width: sw.hex ? 22 : 'auto',
                    height: 22,
                    padding: sw.hex ? 0 : '0 8px',
                    borderRadius: 999,
                    cursor: 'pointer',
                    background: sw.hex ? bg : 'transparent',
                    color: sw.hex ? '#ffffff' : 'inherit',
                    fontSize: 11,
                    fontWeight: 700,
                    border: active ? `2px solid ${isDark ? '#ffffff' : '#0f172a'}` : '1px solid rgba(148,163,184,0.4)',
                  }}
                >
                  {sw.hex ? '' : isTR ? 'Oto' : 'Auto'}
                </button>
              );
            })}
          </div>
        </div>

        {customFields?.map((field) => {
          const curVal = prefs.options?.[field.key] ?? field.defaultValue;
          return (
            <div key={field.key}>
              <div style={{ fontSize: 11, fontWeight: 700, opacity: 0.72, marginBottom: 5 }}>
                {isTR ? field.labelTr : field.labelEn}
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {field.options.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() =>
                      onUpdatePrefs({ options: { ...(prefs.options ?? {}), [field.key]: opt.value } })
                    }
                    style={{
                      ...pillStyle(curVal === opt.value),
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 5,
                    }}
                  >
                    {opt.swatch && (
                      <span style={{ width: 9, height: 9, borderRadius: '50%', background: opt.swatch }} />
                    )}
                    <span>{isTR ? opt.labelTr : opt.labelEn}</span>
                  </button>
                ))}
              </div>
            </div>
          );
        })}

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 8,
            paddingTop: 8,
            borderTop: isDark ? '1px solid rgba(255,255,255,0.10)' : '1px solid rgba(15,23,42,0.08)',
          }}
        >
          <button
            type="button"
            onClick={onResetWidget}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              border: 'none',
              background: 'transparent',
              color: 'inherit',
              opacity: 0.82,
              fontSize: 11.5,
              fontWeight: 700,
              cursor: 'pointer',
              padding: '4px 6px',
            }}
          >
            <RotateCcw size={12.5} /> {isTR ? 'Sıfırla' : 'Reset'}
          </button>
          <button
            type="button"
            onClick={() => {
              onHideWidget();
              onClose();
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              border: 'none',
              background: 'rgba(239,68,68,0.12)',
              color: '#ef4444',
              borderRadius: 8,
              fontSize: 11.5,
              fontWeight: 700,
              cursor: 'pointer',
              padding: '5px 10px',
            }}
          >
            <EyeOff size={12.5} /> {isTR ? 'Gizle' : 'Hide'}
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(node, document.body) : node;
}
