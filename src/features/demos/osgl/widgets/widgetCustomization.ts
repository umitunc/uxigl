import type React from 'react';
import type { DesktopWidgetId, WidgetSize } from '../types';

export type WidgetSurfaceStyle = 'glass' | 'solid' | 'tinted';

export interface WidgetCustomOption {
  value: string;
  labelTr: string;
  labelEn: string;
  swatch?: string;
}

export interface WidgetCustomField {
  key: string;
  labelTr: string;
  labelEn: string;
  options: ReadonlyArray<WidgetCustomOption>;
  defaultValue: string;
}

export interface WidgetSizePreset {
  id: 'small' | 'medium' | 'large';
  labelTr: string;
  labelEn: string;
  size: WidgetSize;
}

export interface WidgetUserPrefs {
  surfaceStyle?: WidgetSurfaceStyle;
  accentHex?: string;
  options?: Record<string, string>;
}

export const WIDGET_ACCENT_SWATCHES: ReadonlyArray<{ hex: string; labelTr: string; labelEn: string }> = [
  { hex: '', labelTr: 'Tema Rengi', labelEn: 'Theme Accent' },
  { hex: '#0a84ff', labelTr: 'Mavi', labelEn: 'Blue' },
  { hex: '#10b981', labelTr: 'Zümrüt', labelEn: 'Emerald' },
  { hex: '#f59e0b', labelTr: 'Kehribar', labelEn: 'Amber' },
  { hex: '#ec4899', labelTr: 'Fuşya', labelEn: 'Pink' },
  { hex: '#8b5cf6', labelTr: 'Mor', labelEn: 'Violet' },
  { hex: '#ef4444', labelTr: 'Mercan', labelEn: 'Coral' },
];

export const DEMO_WIDGET_CUSTOM_FIELDS: Partial<Record<DesktopWidgetId, ReadonlyArray<WidgetCustomField>>> = {
  timer: [
    {
      key: 'defaultMinutes',
      labelTr: 'Varsayılan Odak Süresi',
      labelEn: 'Default Focus Duration',
      defaultValue: '25',
      options: [
        { value: '5', labelTr: '5 dk', labelEn: '5 min' },
        { value: '15', labelTr: '15 dk', labelEn: '15 min' },
        { value: '25', labelTr: '25 dk', labelEn: '25 min' },
        { value: '45', labelTr: '45 dk', labelEn: '45 min' },
        { value: '60', labelTr: '60 dk', labelEn: '60 min' },
      ],
    },
  ],
};

export function buildDefaultSizePresets(defaultSize: WidgetSize): ReadonlyArray<WidgetSizePreset> {
  return [
    { id: 'small', labelTr: 'Küçük', labelEn: 'Small', size: { width: 260, height: 120 } },
    { id: 'medium', labelTr: 'Orta', labelEn: 'Medium', size: defaultSize },
    {
      id: 'large',
      labelTr: 'Geniş',
      labelEn: 'Large',
      size: {
        width: Math.min(460, Math.max(380, defaultSize.width + 96)),
        height: Math.min(360, Math.max(260, defaultSize.height + 88)),
      },
    },
  ];
}

export function resolveCustomizedWidgetCardStyle({
  baseCardStyle,
  isDark,
  effectiveAccent,
  prefs,
}: {
  baseCardStyle: React.CSSProperties;
  isDark: boolean;
  effectiveAccent: string;
  prefs?: WidgetUserPrefs;
}): React.CSSProperties {
  const surface = prefs?.surfaceStyle ?? 'glass';
  if (surface === 'solid') {
    return {
      ...baseCardStyle,
      backgroundColor: isDark ? '#0f172a' : '#ffffff',
      backgroundImage: 'none',
      backdropFilter: 'none',
      WebkitBackdropFilter: 'none',
      border: isDark ? '1px solid rgba(255,255,255,0.16)' : '1px solid rgba(15,23,42,0.12)',
    };
  }
  if (surface === 'tinted') {
    return {
      ...baseCardStyle,
      backgroundColor: isDark
        ? `color-mix(in srgb, ${effectiveAccent} 22%, rgba(13, 19, 34, 0.88))`
        : `color-mix(in srgb, ${effectiveAccent} 12%, rgba(255, 255, 255, 0.92))`,
      border: `1px solid color-mix(in srgb, ${effectiveAccent} 38%, transparent)`,
    };
  }
  return baseCardStyle;
}
