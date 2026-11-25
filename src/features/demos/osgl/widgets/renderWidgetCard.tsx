import React from 'react';
import type { DesktopWidgetId, QualityMode } from '../types';
import {
  ClockWidgetCard,
  DashboardKpiWidgetCard,
  SystemStatusWidgetCard,
  type WidgetThemeStyle,
} from './widgetCards';
import {
  FocusTimerWidgetCard,
  QuickNotesWidgetCard,
} from './widgetProductivityCards';
import { TodoWidgetCard } from './TodoWidgetCard';
import { TimeFlowWidgetCard } from './TimeFlowWidgetCard';
import type { WidgetUserPrefs } from './widgetCustomization';

export const DESKTOP_WIDGET_ORDER: DesktopWidgetId[] = [
  'clock',
  'kpi',
  'timer',
  'todo',
  'notes',
  'system',
  'timeline',
];

export const WIDGET_LABELS: { id: DesktopWidgetId; tr: string; en: string }[] = [
  { id: 'clock', tr: 'Saat & Takvim', en: 'Clock & Calendar' },
  { id: 'kpi', tr: 'Dashboard KPI & Grafik', en: 'Dashboard KPI & Chart' },
  { id: 'timer', tr: 'Odak Sayacı', en: 'Focus Timer' },
  { id: 'todo', tr: 'Yapılacaklar', en: 'To-Do List' },
  { id: 'notes', tr: 'Hızlı Notlar', en: 'Quick Notes' },
  { id: 'system', tr: 'Sistem Özeti', en: 'System Status' },
  { id: 'timeline', tr: 'Günlük Zaman Akışı', en: 'Daily Time Flow' },
];

export function createWidgetBaseTheme({
  locale,
  isDark,
  glassOpacity,
  glassBlur,
  primaryColor,
}: {
  locale: 'tr' | 'en';
  isDark: boolean;
  glassOpacity: number;
  glassBlur: number;
  primaryColor: string;
}): Omit<WidgetThemeStyle, 'width' | 'height' | 'scale'> {
  const cardStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    boxSizing: 'border-box',
    overflow: 'hidden',
    borderRadius: 16,
    padding: 13,
    backgroundColor: isDark
      ? `rgba(13, 19, 34, ${Math.min(0.84, glassOpacity)})`
      : `rgba(255, 255, 255, ${glassOpacity})`,
    backgroundImage: isDark
      ? 'linear-gradient(165deg, rgba(255, 255, 255, 0.065) 0%, rgba(255, 255, 255, 0.01) 45%, rgba(2, 6, 23, 0.16) 100%)'
      : undefined,
    color: isDark ? '#f8fafc' : '#0f172a',
    backdropFilter: glassBlur > 0 ? `blur(${glassBlur}px) saturate(165%)` : undefined,
    WebkitBackdropFilter: glassBlur > 0 ? `blur(${glassBlur}px) saturate(165%)` : undefined,
    border: isDark ? '1px solid rgba(255, 255, 255, 0.11)' : '1px solid rgba(255, 255, 255, 0.65)',
    boxShadow: isDark
      ? '0 18px 40px rgba(0, 0, 0, 0.48), inset 0 1px 0 rgba(255, 255, 255, 0.12)'
      : '0 14px 34px rgba(15, 23, 42, 0.14)',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  };

  return {
    isTR: locale === 'tr',
    isDark,
    primaryColor,
    subtleBorder: isDark ? 'rgba(255, 255, 255, 0.075)' : 'rgba(15, 23, 42, 0.09)',
    subtleBg: isDark ? 'rgba(255, 255, 255, 0.045)' : 'rgba(15, 23, 42, 0.045)',
    cardStyle,
  };
}

export function renderWidgetCard(
  id: DesktopWidgetId,
  theme: WidgetThemeStyle,
  deps: {
    qualityMode: QualityMode;
    setQualityMode: (q: QualityMode) => void;
    openWindowCount: number;
    glassBlur: number;
    onOpenApp: (id: string) => void;
    prefs?: WidgetUserPrefs;
  }
): React.ReactNode {
  switch (id) {
    case 'clock':
      return <ClockWidgetCard theme={theme} onOpenCalendar={() => deps.onOpenApp('calendar')} />;
    case 'kpi':
      return <DashboardKpiWidgetCard theme={theme} onOpenApp={deps.onOpenApp} />;
    case 'timer': {
      const defaultMinutes = Number(deps.prefs?.options?.defaultMinutes ?? '25') || 25;
      return <FocusTimerWidgetCard theme={theme} defaultMinutes={defaultMinutes} />;
    }
    case 'todo':
      return <TodoWidgetCard theme={theme} />;
    case 'notes':
      return <QuickNotesWidgetCard theme={theme} />;
    case 'system':
      return (
        <SystemStatusWidgetCard
          theme={theme}
          qualityMode={deps.qualityMode}
          setQualityMode={deps.setQualityMode}
          openWindowCount={deps.openWindowCount}
          glassBlur={deps.glassBlur}
        />
      );
    case 'timeline':
      return <TimeFlowWidgetCard theme={theme} />;
  }
}
